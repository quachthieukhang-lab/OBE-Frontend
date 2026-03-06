"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type { ChuongTrinhDaoTao, NienKhoa, ChuongTrinhNienKhoa } from "@/features/chuong-trinh-nien-khoa/types";
import {
  createProgramCohort,
  deleteProgramCohort,
  listNienKhoa,
  listProgramCohorts,
  listPrograms,
  updateProgramCohort,
} from "@/features/chuong-trinh-nien-khoa/api";

type Mode = "create" | "edit";

const STATUS_OPTIONS = [
  { label: "active", value: "active" },
  { label: "draft", value: "draft" },
  { label: "retired", value: "retired" },
];

type Row = ChuongTrinhNienKhoa;

export default function ChuongTrinhNienKhoaPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  // filters
  const [program, setProgram] = useState<string | undefined>(undefined);
  const [khoaFilter, setKhoaFilter] = useState<number | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [q, setQ] = useState("");

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<Row | null>(null);

  // options
  const { data: programs = [] } = useQuery({
    queryKey: ["programs"],
    queryFn: listPrograms,
  });

  const { data: nienKhoas = [] } = useQuery({
    queryKey: ["nien-khoa"],
    queryFn: listNienKhoa,
  });

  // list data depends on selected program
  const cohortsQueryKey = useMemo(() => ["chuong-trinh-nien-khoa", { program }], [program]);

  const { data: rowsRaw = [], isLoading } = useQuery({
    queryKey: cohortsQueryKey,
    enabled: !!program,
    queryFn: () => listProgramCohorts(program!),
  });

  // client-side filter (global page)
  const rows = useMemo(() => {
    let r = rowsRaw;

    if (khoaFilter != null) r = r.filter((x) => x.khoa === khoaFilter);
    if (statusFilter) r = r.filter((x) => (x.trangThai ?? "active") === statusFilter);

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      r = r.filter((x) => {
        const programName = programs.find((p) => p.maSoNganh === x.maSoNganh)?.tenTiengViet ?? "";
        return (
          x.maSoNganh.toLowerCase().includes(s) ||
          programName.toLowerCase().includes(s) ||
          (x.phienBan ?? "").toLowerCase().includes(s) ||
          (x.ghiChu ?? "").toLowerCase().includes(s)
        );
      });
    }

    return r;
  }, [rowsRaw, khoaFilter, statusFilter, q, programs]);

  const programOptions = useMemo(
    () => programs.map((p: ChuongTrinhDaoTao) => ({ label: `${p.tenTiengViet} (${p.maSoNganh})`, value: p.maSoNganh })),
    [programs]
  );

  const khoaOptions = useMemo(
    () => nienKhoas.map((nk: NienKhoa) => ({ label: `K${nk.khoa} (${nk.namBatDau}${nk.namKetThuc ? `-${nk.namKetThuc}` : ""})`, value: nk.khoa })),
    [nienKhoas]
  );

  const createMut = useMutation({
    mutationFn: async (payload: { maSoNganh: string; data: Omit<Row, "maSoNganh"> }) =>
      createProgramCohort(payload.maSoNganh, payload.data),
    onSuccess: async () => {
      message.success("Tạo thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-nien-khoa"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: async (payload: { maSoNganh: string; khoa: number; data: Partial<Row> }) =>
      updateProgramCohort(payload.maSoNganh, payload.khoa, payload.data),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-nien-khoa"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: async (payload: { maSoNganh: string; khoa: number }) =>
      deleteProgramCohort(payload.maSoNganh, payload.khoa),
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-nien-khoa"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<Row> = [
    {
      title: "Chương trình đào tạo",
      dataIndex: "maSoNganh",
      width: 330,
      render: (v) => {
        const p = programs.find((x) => x.maSoNganh === v);
        return p ? `${p.tenTiengViet} (${p.maSoNganh})` : v;
      },
    },
    {
      title: "Khóa",
      dataIndex: "khoa",
      width: 120,
      render: (k) => <Tag>{`K${k}`}</Tag>,
    },
    { title: "Phiên bản", dataIndex: "phienBan", width: 140, render: (v) => v ?? "-" },
    { title: "Ngày áp dụng", dataIndex: "ngayApDung", width: 140, render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "-") },
    { title: "Số TC", dataIndex: "soTinChi", width: 140, render: (v) => v ?? "-" },
    { title: "Trạng thái", dataIndex: "trangThai", render: (v) => <Tag>{v ?? "active"}</Tag> },
    {
      title: "Hành động",
      key: "actions",
      width: 220,
      render: (_, row) => (
        <Space>
          <Button
            onClick={() => {
              setMode("edit");
              setEditing(row);
              setOpen(true);
              form.setFieldsValue({
                ...row,
                ngayApDung: row.ngayApDung ? dayjs(row.ngayApDung) : null,
                ngayBanHanh: row.ngayBanHanh ? dayjs(row.ngayBanHanh) : null,
              });
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa bản ghi CTĐT - Niên khóa?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate({ maSoNganh: row.maSoNganh, khoa: row.khoa })}
          >
            <Button danger loading={deleteMut.isPending}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    form.resetFields();
    // preset: chọn program hiện tại nếu có
    if (program) form.setFieldsValue({ maSoNganh: program, trangThai: "active" });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    const payload: Row = {
      maSoNganh: values.maSoNganh,
      khoa: values.khoa,
      phienBan: values.phienBan,
      soTinChi: values.soTinChi,
      hinhThucDaoTao: values.hinhThucDaoTao,
      thoiGianDaoTao: values.thoiGianDaoTao,
      thangDiemDanhGia: values.thangDiemDanhGia,
      moTa: values.moTa,
      ghiChu: values.ghiChu,
      trangThai: values.trangThai ?? "active",
      ngayApDung: values.ngayApDung ? values.ngayApDung.format("YYYY-MM-DD") : null,
      ngayBanHanh: values.ngayBanHanh ? values.ngayBanHanh.format("YYYY-MM-DD") : null,
    };

    if (mode === "create") {
      const { maSoNganh, ...data } = payload;
      createMut.mutate({ maSoNganh, data });
      return;
    }

    if (!editing) return;

    // update: PK (maSoNganh,khoa) không đổi
    const data: Partial<Row> = {
      phienBan: payload.phienBan,
      soTinChi: payload.soTinChi,
      hinhThucDaoTao: payload.hinhThucDaoTao,
      thoiGianDaoTao: payload.thoiGianDaoTao,
      thangDiemDanhGia: payload.thangDiemDanhGia,
      moTa: payload.moTa,
      ghiChu: payload.ghiChu,
      trangThai: payload.trangThai,
      ngayApDung: payload.ngayApDung,
      ngayBanHanh: payload.ngayBanHanh,
    };

    updateMut.mutate({ maSoNganh: editing.maSoNganh, khoa: editing.khoa, data });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <Space wrap>
          <Select
            style={{ width: 320 }}
            placeholder="Chọn chương trình đào tạo"
            options={programOptions}
            value={program}
            onChange={(v) => {
              setProgram(v);
              // reset filters when change program
              setKhoaFilter(undefined);
              setStatusFilter(undefined);
              setQ("");
            }}
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 200 }}
            placeholder="Lọc theo khóa"
            options={khoaOptions}
            value={khoaFilter}
            onChange={setKhoaFilter}
            allowClear
          />

          <Select
            style={{ width: 160 }}
            placeholder="Trạng thái"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
            allowClear
          />

          <Input.Search
            placeholder="Tìm (phiên bản/ghi chú/tên CTĐT...)"
            allowClear
            onSearch={setQ}
            style={{ width: 280 }}
          />
        </Space>

        <Button type="primary" onClick={openCreate} disabled={!program}>
          Tạo CTĐT - Niên khóa
        </Button>
      </Space>

      <Table
        rowKey={(r) => `${r.maSoNganh}-${r.khoa}`}
        loading={isLoading && !!program}
        columns={columns}
        dataSource={program ? rows : []}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo CTĐT - Niên khóa" : "Sửa CTĐT - Niên khóa"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Chương trình đào tạo"
            name="maSoNganh"
            rules={[{ required: true, message: "Chọn CTĐT" }]}
          >
            <Select
              options={programOptions}
              showSearch
              optionFilterProp="label"
              disabled={mode === "edit"}
            />
          </Form.Item>

          <Form.Item label="Khóa" name="khoa" rules={[{ required: true, message: "Chọn khóa" }]}>
            <Select options={khoaOptions} disabled={mode === "edit"} />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Phiên bản" name="phienBan" style={{ flex: 1 }}>
              <Input placeholder="VD: 2026" />
            </Form.Item>

            <Form.Item label="Số tín chỉ" name="soTinChi" style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Ngày ban hành" name="ngayBanHanh" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Ngày áp dụng" name="ngayApDung" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item label="Hình thức đào tạo" name="hinhThucDaoTao">
            <Input />
          </Form.Item>

          <Form.Item label="Thời gian đào tạo" name="thoiGianDaoTao">
            <Input />
          </Form.Item>

          <Form.Item label="Thang điểm đánh giá" name="thangDiemDanhGia">
            <Input />
          </Form.Item>

          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: "Chọn trạng thái" }]}
            initialValue="active"
          >
            <Select options={STATUS_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}