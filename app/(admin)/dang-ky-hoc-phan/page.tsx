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

import type { DangKyHocPhan, LopHocPhan, SinhVien } from "@/features/dang-ky-hoc-phan/types";
import {
  createDangKy,
  deleteDangKy,
  listDangKy,
  listLopHocPhan,
  listSinhVien,
  updateDangKy,
} from "@/features/dang-ky-hoc-phan/api";

type Mode = "create" | "edit";

const TRANG_THAI_OPTIONS = [
  { label: "dang_hoc", value: "dang_hoc" },
  { label: "da_rut", value: "da_rut" },
  { label: "hoan_thanh", value: "hoan_thanh" },
];

export default function DangKyHocPhanPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  // filters
  const [selectedClass, setSelectedClass] = useState<string | undefined>(undefined);
  const [q, setQ] = useState(""); // filter client-side by MSSV/name
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<DangKyHocPhan | null>(null);

  const { data: classes = [] } = useQuery({
    queryKey: ["lop-hoc-phan"],
    queryFn: listLopHocPhan,
  });

  // Option: load all students once (simple). Nếu data SV lớn => chuyển sang search remote.
  const { data: students = [] } = useQuery({
    queryKey: ["sinh-vien", "options"],
    queryFn: () => listSinhVien({}),
  });

  const classOptions = useMemo(
    () =>
      classes.map((c: LopHocPhan) => ({
        label: `${c.maLopHocPhan} (K${c.khoa}-HK${c.hocKy})`,
        value: c.maLopHocPhan,
      })),
    [classes]
  );

  const studentOptions = useMemo(
    () =>
      students.map((s: SinhVien) => ({
        label: `${s.hoTen} (${s.MSSV})`,
        value: s.MSSV,
      })),
    [students]
  );

  const enrollQueryKey = useMemo(
    () => ["dang-ky-hoc-phan", { maLopHocPhan: selectedClass }],
    [selectedClass]
  );

  const { data: rowsRaw = [], isLoading } = useQuery({
    queryKey: enrollQueryKey,
    enabled: !!selectedClass,
    queryFn: () => listDangKy(selectedClass!),
  });

  const rows = useMemo(() => {
    if (!q.trim()) return rowsRaw;
    const s = q.trim().toLowerCase();
    return rowsRaw.filter((r) => {
      const sv = students.find((x) => x.MSSV === r.MSSV);
      const name = sv?.hoTen ?? "";
      return r.MSSV.toLowerCase().includes(s) || name.toLowerCase().includes(s);
    });
  }, [rowsRaw, q, students]);

  const createMut = useMutation({
    mutationFn: async (payload: { maLopHocPhan: string; data: any }) => createDangKy(payload.maLopHocPhan, payload.data),
    onSuccess: async () => {
      message.success("Đăng ký thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["dang-ky-hoc-phan"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Đăng ký thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: async (payload: { maLopHocPhan: string; maDangKy: string; data: Partial<DangKyHocPhan> }) =>
      updateDangKy(payload.maLopHocPhan, payload.maDangKy, payload.data),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["dang-ky-hoc-phan"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: async (payload: { maLopHocPhan: string; maDangKy: string }) => deleteDangKy(payload.maLopHocPhan, payload.maDangKy),
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["dang-ky-hoc-phan"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<DangKyHocPhan> = [
    {
      title: "Sinh viên",
      dataIndex: "MSSV",
      width: 260,
      render: (MSSV) => {
        const sv = students.find((x) => x.MSSV === MSSV);
        return sv ? `${sv.hoTen} (${sv.MSSV})` : MSSV;
      },
    },
    { title: "Lần học", dataIndex: "lanHoc", width: 90, render: (v) => v ?? 1 },
    {
      title: "Ngày ĐK",
      dataIndex: "ngayDangKy",
      width: 130,
      render: (v) => (v ? dayjs(v).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 120,
      render: (v) => <Tag>{v ?? "dang_hoc"}</Tag>,
    },
    { title: "Ghi chú", dataIndex: "ghiChu", render: (v) => v ?? "-" },
    {
      title: "Hành động",
      key: "actions",
      width: 240,
      render: (_, row) => (
        <Space>
          <Button
            onClick={() => {
              setMode("edit");
              setEditing(row);
              setOpen(true);
              form.setFieldsValue({
                ...row,
                ngayDangKy: row.ngayDangKy ? dayjs(row.ngayDangKy) : null,
              });
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa đăng ký?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate({ maLopHocPhan: selectedClass!, maDangKy: row.maDangKy })}
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
    form.setFieldsValue({ lanHoc: 1, trangThai: "dang_hoc" } as any);
    setOpen(true);
  };

  const onSubmit = async () => {
    if (!selectedClass) return;

    const v = await form.validateFields();

    const payload = {
      MSSV: v.MSSV,
      lanHoc: v.lanHoc ?? 1,
      trangThai: v.trangThai ?? "dang_hoc",
      ghiChu: v.ghiChu ?? null,
      ngayDangKy: v.ngayDangKy ? v.ngayDangKy.format("YYYY-MM-DD") : null,
    };

    if (mode === "create") {
      createMut.mutate({ maLopHocPhan: selectedClass, data: payload });
      return;
    }

    if (!editing) return;
    updateMut.mutate({ maLopHocPhan: selectedClass, maDangKy: editing.maDangKy, data: payload });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
        <Space wrap>
          <Select
            style={{ width: 380 }}
            placeholder="Chọn lớp học phần"
            options={classOptions}
            value={selectedClass}
            onChange={(v) => {
              setSelectedClass(v);
              setQ("");
            }}
            showSearch
            optionFilterProp="label"
          />

          <Input.Search
            placeholder="Tìm MSSV / tên..."
            allowClear
            onSearch={setQ}
            style={{ width: 280 }}
            disabled={!selectedClass}
          />
        </Space>

        <Button type="primary" onClick={openCreate} disabled={!selectedClass}>
          Tạo đăng ký
        </Button>
      </Space>

      <Table
        rowKey="maDangKy"
        loading={isLoading && !!selectedClass}
        columns={columns}
        dataSource={selectedClass ? rows : []}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo đăng ký học phần" : "Sửa đăng ký học phần"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={720}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Sinh viên (MSSV)" name="MSSV" rules={[{ required: true, message: "Chọn sinh viên" }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={studentOptions}
              disabled={mode === "edit"} // thường không đổi MSSV của 1 đăng ký
              placeholder="Chọn sinh viên"
            />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Lần học" name="lanHoc" style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item label="Ngày đăng ký" name="ngayDangKy" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item label="Trạng thái" name="trangThai" style={{ flex: 1}}>
              <Select options={TRANG_THAI_OPTIONS}  />
            </Form.Item>
          </Space>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}