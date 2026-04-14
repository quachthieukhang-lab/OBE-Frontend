"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  DatePicker,
  Form,
  Input,
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

import type {
  BanPhanCongNhapDeCuong,
  ChuongTrinhDaoTao,
  GiangVien,
  HocPhan,
} from "@/features/phan-cong-de-cuong/types";
import {
  createAssignment,
  deleteAssignment,
  listAssignments,
  listGiangVien,
  listHocPhan,
  listPrograms,
  updateAssignment,
} from "@/features/phan-cong-de-cuong/api";
import { listProgramCohorts } from "@/features/chuong-trinh-nien-khoa/api";
import type { ChuongTrinhNienKhoa } from "@/features/chuong-trinh-nien-khoa/types";

type Mode = "create" | "edit";

const VAI_TRO_OPTIONS = [
  { label: "owner", value: "owner" },
  { label: "reviewer", value: "reviewer" },
  { label: "approver", value: "approver" },
];

/** Khớp API phân công đề cương (cùng tập giá trị với trang nhập đề cương giảng viên). */
const TRANG_THAI_OPTIONS = [
  { label: "assigned — Đã phân công", value: "assigned" },
  { label: "in_progress — Đang thực hiện", value: "in_progress" },
  { label: "completed — Hoàn thành", value: "completed" },
];

export default function PhanCongDeCuongPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [maSoNganh, setMaSoNganh] = useState<string | undefined>();
  const [filterKhoa, setFilterKhoa] = useState<number | undefined>();
  const [maHocPhan, setMaHocPhan] = useState<string | undefined>();
  const [MSGV, setMSGV] = useState<string | undefined>();
  const [trangThai, setTrangThai] = useState<string | undefined>();
  const [q, setQ] = useState("");

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<BanPhanCongNhapDeCuong | null>(null);

  const { data: programs = [] } = useQuery({
    queryKey: ["chuong-trinh-dao-tao"],
    queryFn: listPrograms,
  });

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const { data: giangViens = [] } = useQuery({
    queryKey: ["giang-vien"],
    queryFn: listGiangVien,
  });

  const programOptions = useMemo(
    () =>
      programs.map((p: ChuongTrinhDaoTao) => ({
        label: `${p.tenTiengViet} (${p.maSoNganh})`,
        value: p.maSoNganh,
      })),
    [programs]
  );

  const hocPhanOptions = useMemo(
    () =>
      hocPhans.map((hp: HocPhan) => ({
        label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
        value: hp.maHocPhan,
      })),
    [hocPhans]
  );

  const { data: filterCohorts = [] } = useQuery({
    queryKey: ["chuong-trinh-nien-khoa", maSoNganh],
    queryFn: () => listProgramCohorts(maSoNganh!),
    enabled: !!maSoNganh,
  });

  const filterCohortOptions = useMemo(
    () =>
      filterCohorts.map((c: ChuongTrinhNienKhoa) => ({
        label: `K${c.khoa}${c.phienBan ? ` — ${c.phienBan}` : ""}`,
        value: c.khoa,
      })),
    [filterCohorts]
  );

  const formMaSoNganh = Form.useWatch("maSoNganh", form);

  const { data: formCohorts = [] } = useQuery({
    queryKey: ["chuong-trinh-nien-khoa-modal", formMaSoNganh],
    queryFn: () => listProgramCohorts(formMaSoNganh as string),
    enabled: !!formMaSoNganh && open,
  });

  const formCohortOptions = useMemo(
    () =>
      formCohorts.map((c: ChuongTrinhNienKhoa) => ({
        label: `K${c.khoa}${c.phienBan ? ` — ${c.phienBan}` : ""}`,
        value: c.khoa,
      })),
    [formCohorts]
  );

  const giangVienOptions = useMemo(
    () =>
      giangViens.map((gv: GiangVien) => ({
        label: `${gv.hoTen} (${gv.MSGV})`,
        value: gv.MSGV,
      })),
    [giangViens]
  );

  const queryKey = useMemo(
    () => ["phan-cong-de-cuong", { maSoNganh, filterKhoa, maHocPhan, MSGV, trangThai, q }],
    [maSoNganh, filterKhoa, maHocPhan, MSGV, trangThai, q]
  );

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listAssignments({
        maSoNganh,
        khoa: filterKhoa,
        maHocPhan,
        MSGV,
        trangThai,
        q: q || undefined,
      }),
  });

  const createMut = useMutation({
    mutationFn: createAssignment,
    onSuccess: async () => {
      message.success("Tạo phân công thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["phan-cong-de-cuong"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<BanPhanCongNhapDeCuong> }) =>
      updateAssignment(id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["phan-cong-de-cuong"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAssignment,
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["phan-cong-de-cuong"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<BanPhanCongNhapDeCuong> = [
    {
      title: "CTĐT",
      dataIndex: "maSoNganh",
      width: 220,
      render: (v) => {
        const p = programs.find((x) => x.maSoNganh === v);
        return p ? `${p.tenTiengViet} (${p.maSoNganh})` : v;
      },
    },
    {
      title: "Khóa",
      dataIndex: "khoa",
      width: 90,
      render: (v) => (v != null ? <Tag>K{v}</Tag> : "-"),
    },
    {
      title: "Học phần",
      dataIndex: "maHocPhan",
      width: 220,
      render: (v) => {
        const hp = hocPhans.find((x) => x.maHocPhan === v);
        return hp ? `${hp.tenHocPhan} (${hp.maHocPhan})` : v;
      },
    },
    {
      title: "Giảng viên",
      dataIndex: "MSGV",
      width: 220,
      render: (v) => {
        const gv = giangViens.find((x) => x.MSGV === v);
        return gv ? `${gv.hoTen} (${gv.MSGV})` : v;
      },
    },
    {
      title: "Vai trò",
      dataIndex: "vaiTro",
      width: 110,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 120,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      width: 120,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Assigned At",
      dataIndex: "assignedAt",
      width: 180,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-"),
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      render: (v) => v ?? "-",
    },
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
                deadline: row.deadline ? dayjs(row.deadline) : null,
              });
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa phân công?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate(row.maBanPhanCong)}
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
    form.setFieldsValue({
      maSoNganh,
      khoa: filterKhoa,
      maHocPhan,
      MSGV,
      vaiTro: "owner",
      trangThai: "assigned",
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const v = await form.validateFields();

    const payload = {
      maSoNganh: v.maSoNganh,
      khoa: Number(v.khoa),
      maHocPhan: v.maHocPhan,
      MSGV: v.MSGV,
      vaiTro: v.vaiTro,
      trangThai: v.trangThai,
      deadline: v.deadline ? v.deadline.format("YYYY-MM-DD") : null,
      ghiChu: v.ghiChu ?? null,
    };

    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }

    if (!editing) return;

    updateMut.mutate({
      id: editing.maBanPhanCong,
      payload,
    });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}
        wrap
      >
        <Space wrap>
          <Select
            style={{ width: 280 }}
            placeholder="Chọn CTĐT"
            options={programOptions}
            value={maSoNganh}
            onChange={(v) => {
              setMaSoNganh(v);
              setFilterKhoa(undefined);
            }}
            allowClear
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 200 }}
            placeholder="Lọc khóa"
            options={filterCohortOptions}
            value={filterKhoa}
            onChange={(v) => setFilterKhoa(v ?? undefined)}
            disabled={!maSoNganh}
            allowClear
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 280 }}
            placeholder="Chọn Học phần"
            options={hocPhanOptions}
            value={maHocPhan}
            onChange={setMaHocPhan}
            allowClear
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 280 }}
            placeholder="Chọn Giảng viên"
            options={giangVienOptions}
            value={MSGV}
            onChange={setMSGV}
            allowClear
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 180 }}
            placeholder="Trạng thái"
            options={TRANG_THAI_OPTIONS}
            value={trangThai}
            onChange={setTrangThai}
            allowClear
          />

          <Input.Search
            placeholder="Tìm vai trò / ghi chú..."
            allowClear
            onSearch={setQ}
            style={{ width: 260 }}
          />
        </Space>

        <Button type="primary" onClick={openCreate}>
          Tạo phân công
        </Button>
      </Space>

      <Table
        rowKey="maBanPhanCong"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo phân công đề cương" : "Sửa phân công đề cương"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={860}
      >
        <Form form={form} layout="vertical">
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Chương trình đào tạo"
              name="maSoNganh"
              rules={[{ required: true, message: "Chọn CTĐT" }]}
              style={{ flex: 1 }}
            >
              <Select options={programOptions} showSearch optionFilterProp="label" />
            </Form.Item>

            <Form.Item
              label="Niên khóa (K)"
              name="khoa"
              rules={[{ required: true, message: "Chọn khóa" }]}
              style={{ flex: 1 }}
            >
              <Select
                options={formCohortOptions}
                showSearch
                optionFilterProp="label"
                disabled={!formMaSoNganh}
                placeholder="Chọn khóa"
              />
            </Form.Item>

            <Form.Item
              label="Học phần"
              name="maHocPhan"
              rules={[{ required: true, message: "Chọn học phần" }]}
              style={{ flex: 1 }}
            >
              <Select options={hocPhanOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Giảng viên"
              name="MSGV"
              rules={[{ required: true, message: "Chọn giảng viên" }]}
              style={{ flex: 1 }}
            >
              <Select options={giangVienOptions} showSearch optionFilterProp="label" />
            </Form.Item>

            <Form.Item
              label="Vai trò"
              name="vaiTro"
              rules={[{ required: true, message: "Chọn vai trò" }]}
              style={{ flex: 1 }}
            >
              <Select options={VAI_TRO_OPTIONS} />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Trạng thái"
              name="trangThai"
              rules={[{ required: true, message: "Chọn trạng thái" }]}
              style={{ flex: 1 }}
            >
              <Select options={TRANG_THAI_OPTIONS} />
            </Form.Item>

            <Form.Item label="Deadline" name="deadline" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Space>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}