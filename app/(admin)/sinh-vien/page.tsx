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
  Row,
  Col
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type { ChuongTrinhDaoTao, DonVi, NienKhoa, SinhVien } from "@/features/sinh-vien/types";
import {
  createSinhVien,
  deleteSinhVien,
  listDonVi,
  listNienKhoa,
  listPrograms,
  listSinhVien,
  updateSinhVien,
} from "@/features/sinh-vien/api";

type Mode = "create" | "edit";

const GIOI_TINH_OPTIONS = [
  { label: "Nam", value: "Nam" },
  { label: "Nữ", value: "Nữ" },
  { label: "Khác", value: "Khác" },
];

const TRANG_THAI_OPTIONS = [
  { label: "Đang học", value: "dang_hoc" },
  { label: "Bảo lưu", value: "bao_luu" },
  { label: "Tạm nghỉ", value: "tam_nghi" },
  { label: "Tốt nghiệp", value: "tot_nghiep" },
];

export default function SinhVienPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<SinhVien | null>(null);

  const queryKey = useMemo(() => ["sinh-vien", { q }], [q]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listSinhVien({ q: q || undefined }),
  });

  const { data: donVis = [] } = useQuery({ queryKey: ["don-vi"], queryFn: listDonVi });
  const { data: nienKhoas = [] } = useQuery({ queryKey: ["nien-khoa"], queryFn: listNienKhoa });
  const { data: programs = [] } = useQuery({ queryKey: ["chuong-trinh-dao-tao"], queryFn: listPrograms });

  const donViOptions = useMemo(
    () => donVis.map((dv: DonVi) => ({ label: `${dv.tenDonVi} (${dv.maDonVi})`, value: dv.maDonVi })),
    [donVis]
  );

  const nkOptions = useMemo(
    () =>
      nienKhoas.map((nk: NienKhoa) => ({
        label: `K${nk.khoa} (${nk.namBatDau}${nk.namKetThuc ? `-${nk.namKetThuc}` : ""})`,
        value: nk.khoa,
      })),
    [nienKhoas]
  );

  const programOptions = useMemo(
    () => programs.map((p: ChuongTrinhDaoTao) => ({ label: `${p.tenTiengViet} (${p.maSoNganh})`, value: p.maSoNganh })),
    [programs]
  );

  const createMut = useMutation({
    mutationFn: createSinhVien,
    onSuccess: async () => {
      message.success("Tạo sinh viên thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["sinh-vien"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SinhVien> }) => updateSinhVien(id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["sinh-vien"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteSinhVien,
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["sinh-vien"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<SinhVien> = [
    { title: "MSSV", dataIndex: "MSSV", width: 130 },
    { title: "Họ tên", dataIndex: "hoTen", ellipsis: true, width: 130 },
    {
      title: "Khóa",
      dataIndex: "khoa",
      width: 90,
      render: (v) => (v != null ? <Tag>{`K${v}`}</Tag> : "-"),
    },
    {
      title: "Chương trình đào tạo",
      dataIndex: "maSoNganh",
      width: 330,
      render: (v) => {
        if (!v) return "-";
        const p = programs.find((x) => x.maSoNganh === v);
        return p ? `${p.tenTiengViet} (${p.maSoNganh})` : v;
      },
    },
    { title: "Email", dataIndex: "email", width: 220, render: (v) => v ?? "-" },
    { title: "SĐT", dataIndex: "soDienThoai", width: 140, render: (v) => v ?? "-" },
    {
      title: "Trạng thái",
      dataIndex: "trangThaiHocTap",
      render: (v) => (v ? <Tag>{v}</Tag> : "-"),
    },
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
                ngaySinh: row.ngaySinh ? dayjs(row.ngaySinh) : null,
              });
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa sinh viên?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate(row.MSSV)}
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
    setOpen(true);
  };

  const onSubmit = async () => {
    const v = await form.validateFields();

    const payload: SinhVien = {
      MSSV: v.MSSV,
      hoTen: v.hoTen,
      maDonVi: v.maDonVi ?? null,
      khoa: v.khoa ?? null,
      maSoNganh: v.maSoNganh ?? null,
      ngaySinh: v.ngaySinh ? v.ngaySinh.format("YYYY-MM-DD") : null,
      gioiTinh: v.gioiTinh ?? null,
      email: v.email ?? null,
      soDienThoai: v.soDienThoai ?? null,
      trangThaiHocTap: v.trangThaiHocTap ?? null,
    };

    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }

    if (!editing) return;
    const { MSSV, ...rest } = payload; // không sửa PK
    updateMut.mutate({ id: editing.MSSV, payload: rest });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo MSSV / tên / email..."
          allowClear
          onSearch={setQ}
          style={{ maxWidth: 420 }}
        />
        <Button type="primary" onClick={openCreate}>
          Tạo sinh viên
        </Button>
      </Space>

      <Table
        rowKey="MSSV"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo sinh viên" : "Sửa sinh viên"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={820}
      >
        <Form form={form} layout="vertical">
          {/* Hàng 1: MSSV (1/3) - Họ tên (2/3) */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="MSSV"
                name="MSSV"
                rules={[{ required: true, message: "Nhập MSSV" }]}
              >
                <Input disabled={mode === "edit"} placeholder="VD: B2203505" />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item
                label="Họ tên"
                name="hoTen"
                rules={[{ required: true, message: "Nhập họ tên" }]}
              >
                <Input placeholder="Nhập họ tên đầy đủ" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 2: Niên khóa (1/4) - CTĐT (~40%) - Đơn vị (~35%) */}
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Niên khóa" name="khoa">
                <Select allowClear options={nkOptions} placeholder="Chọn khóa" />
              </Form.Item>
            </Col>
            <Col span={10}>
              <Form.Item label="CTĐT" name="maSoNganh">
                <Select
                  allowClear
                  options={programOptions}
                  showSearch
                  optionFilterProp="label"
                  placeholder="Chọn CTĐT"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Đơn vị" name="maDonVi">
                <Select
                  allowClear
                  options={donViOptions}
                  showSearch
                  optionFilterProp="label"
                  placeholder="Chọn đơn vị"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 3: Ngày sinh - Giới tính - Trạng thái học tập (Chia đều 3) */}
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item label="Ngày sinh" name="ngaySinh">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" placeholder="Chọn ngày sinh" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Giới tính" name="gioiTinh">
                <Select allowClear options={GIOI_TINH_OPTIONS} placeholder="Chọn giới tính" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Trạng thái học tập" name="trangThaiHocTap">
                <Select allowClear options={TRANG_THAI_OPTIONS} placeholder="Chọn trạng thái" />
              </Form.Item>
            </Col>
          </Row>

          {/* Hàng 4: Email (1/2) - Số điện thoại (1/2) */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Email" name="email">
                <Input placeholder="Nhập địa chỉ email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số điện thoại" name="soDienThoai">
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}