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

import type { GiangVien, HocPhan, NienKhoa, LopHocPhan } from "@/features/lop-hoc-phan/types";
import {
  createLopHocPhan,
  deleteLopHocPhan,
  listGiangVien,
  listHocPhan,
  listLopHocPhan,
  listNienKhoa,
  updateLopHocPhan,
} from "@/features/lop-hoc-phan/api";

type Mode = "create" | "edit";

const STATUS_OPTIONS = [
  { label: "open", value: "open" },
  { label: "closed", value: "closed" },
  { label: "cancelled", value: "cancelled" },
];

export default function LopHocPhanPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<LopHocPhan | null>(null);

  const queryKey = useMemo(() => ["lop-hoc-phan", { q }], [q]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listLopHocPhan({ q: q || undefined }),
  });

  const { data: giangViens = [] } = useQuery({
    queryKey: ["giang-vien"],
    queryFn: listGiangVien,
  });

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const { data: nienKhoas = [] } = useQuery({
    queryKey: ["nien-khoa"],
    queryFn: listNienKhoa,
  });

  const gvOptions = useMemo(
    () => giangViens.map((gv: GiangVien) => ({ label: `${gv.hoTen} (${gv.MSGV})`, value: gv.MSGV })),
    [giangViens]
  );

  const hpOptions = useMemo(
    () => hocPhans.map((hp: HocPhan) => ({ label: `${hp.tenHocPhan} (${hp.maHocPhan})`, value: hp.maHocPhan })),
    [hocPhans]
  );

  const nkOptions = useMemo(
    () =>
      nienKhoas.map((nk: NienKhoa) => ({
        label: `K${nk.khoa} (${nk.namBatDau}${nk.namKetThuc ? `-${nk.namKetThuc}` : ""})`,
        value: nk.khoa,
      })),
    [nienKhoas]
  );

  const createMut = useMutation({
    mutationFn: createLopHocPhan,
    onSuccess: async () => {
      message.success("Tạo lớp học phần thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["lop-hoc-phan"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<LopHocPhan> }) => updateLopHocPhan(id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["lop-hoc-phan"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteLopHocPhan,
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["lop-hoc-phan"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<LopHocPhan> = [
    { title: "Mã LHP", dataIndex: "maLopHocPhan", width: 170 },
    {
      title: "Học phần",
      dataIndex: "maHocPhan",
      width: 240,
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
    { title: "Khóa", dataIndex: "khoa", width: 120, render: (v) => <Tag>{`K${v}`}</Tag> },
    { title: "Học kỳ", dataIndex: "hocKy", width: 120, render: (v) => <Tag>{`HK${v}`}</Tag> },
    { title: "Nhóm", dataIndex: "nhom", width: 120, render: (v) => v ?? "-" },
    { title: "Sĩ số", dataIndex: "siSoToiDa", width: 120, render: (v) => v ?? "-" },
    { title: "Status", dataIndex: "status", render: (v) => <Tag>{v ?? "-"}</Tag> },
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
                ngayBatDau: row.ngayBatDau ? dayjs(row.ngayBatDau) : null,
                ngayKetThuc: row.ngayKetThuc ? dayjs(row.ngayKetThuc) : null,
              });
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa lớp học phần?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate(row.maLopHocPhan)}
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
    form.setFieldsValue({ hocKy: 1, status: "open" } as any);
    setOpen(true);
  };

  const onSubmit = async () => {
    const v = await form.validateFields();

    const payload: LopHocPhan = {
      maLopHocPhan: v.maLopHocPhan,
      MSGV: v.MSGV,
      maHocPhan: v.maHocPhan,
      khoa: v.khoa,
      hocKy: v.hocKy,
      nhom: v.nhom ?? null,
      siSoToiDa: v.siSoToiDa ?? null,
      phongHoc: v.phongHoc ?? null,
      lichHoc: v.lichHoc ?? null,
      status: v.status ?? null,
      ngayBatDau: v.ngayBatDau ? v.ngayBatDau.format("YYYY-MM-DD") : null,
      ngayKetThuc: v.ngayKetThuc ? v.ngayKetThuc.format("YYYY-MM-DD") : null,
    };

    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }

    if (!editing) return;
    const { maLopHocPhan, ...rest } = payload;
    updateMut.mutate({ id: editing.maLopHocPhan, payload: rest });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo mã lớp / học phần / giảng viên..."
          allowClear
          onSearch={setQ}
          style={{ maxWidth: 420 }}
        />
        <Button type="primary" onClick={openCreate}>
          Tạo lớp học phần
        </Button>
      </Space>

      <Table
        rowKey="maLopHocPhan"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo lớp học phần" : "Sửa lớp học phần"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={460}
      >
        <Form form={form} layout="vertical">
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Mã lớp học phần"
              name="maLopHocPhan"
              rules={[{ required: true, message: "Nhập mã lớp học phần" }]}
              style={{ flex: 1 }}
            >
              <Input disabled={mode === "edit"} placeholder="VD: CT101-K48-HK1-01" />
            </Form.Item>

            <Form.Item label="Status" name="status" style={{ width: 200 }}>
              <Select options={STATUS_OPTIONS} />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Học phần"
              name="maHocPhan"
              rules={[{ required: true, message: "Chọn học phần" }]}
              style={{ flex: 1, width: 200}}
            >
              <Select showSearch optionFilterProp="label" options={hpOptions} />
            </Form.Item>

            <Form.Item
              label="Giảng viên"
              name="MSGV"
              rules={[{ required: true, message: "Chọn giảng viên" }]}
              style={{ flex: 1,  width: 200 }}
            >
              <Select showSearch optionFilterProp="label" options={gvOptions} />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Khóa"
              name="khoa"
              rules={[{ required: true, message: "Chọn khóa" }]}
              style={{ flex: 1,  width: 80 }}
            >
              <Select options={nkOptions} />
            </Form.Item>

            <Form.Item
              label="Học kỳ"
              name="hocKy"
              rules={[{ required: true, message: "Nhập học kỳ" }]}
              style={{ flex: 1,  width: 100 }}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>

            <Form.Item label="Nhóm" name="nhom" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Sĩ số tối đa" name="siSoToiDa" style={{ flex: 1 }}>
              <InputNumber style={{ width: "100%" }} min={0} />
            </Form.Item>

            <Form.Item label="Phòng học" name="phongHoc" style={{ flex: 1 }}>
              <Input />
            </Form.Item>
          </Space>

          <Form.Item label="Lịch học" name="lichHoc">
            <Input placeholder="VD: T2 (7-9), T4 (7-9)" />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Ngày bắt đầu" name="ngayBatDau" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
            <Form.Item label="Ngày kết thúc" name="ngayKetThuc" style={{ flex: 1 }}>
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}