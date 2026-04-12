"use client";

import { useEffect, useMemo, useState } from "react";
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

import type { DeCuongChiTiet, HocPhan } from "@/features/de-cuong-chi-tiet/types";
import {
  createDeCuong,
  deleteDeCuong,
  listDeCuong,
  listHocPhan,
  updateDeCuong,
} from "@/features/de-cuong-chi-tiet/api";

type Mode = "create" | "edit";

const TRANG_THAI_OPTIONS = [
  { label: "Bản nháp", value: "draft" },
  { label: "Đang sử dụng", value: "active" },
  { label: "Đã lưu trữ", value: "archived" },
];

const TRANG_THAI_COLOR: Record<string, string> = {
  draft: "default",
  active: "green",
  archived: "red",
};

const TRANG_THAI_LABEL: Record<string, string> = {
  draft: "Bản nháp",
  active: "Đang sử dụng",
  archived: "Đã lưu trữ",
};

export default function DeCuongChiTietPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [maHocPhan, setMaHocPhan] = useState<string | undefined>();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<DeCuongChiTiet | null>(null);

  const { data: hocPhans = [] } = useQuery({
    queryKey: ["hoc-phan"],
    queryFn: listHocPhan,
  });

  const hocPhanOptions = useMemo(
    () =>
      hocPhans.map((hp: HocPhan) => ({
        label: `${hp.tenHocPhan} (${hp.maHocPhan})`,
        value: hp.maHocPhan,
      })),
    [hocPhans],
  );

  const queryKey = useMemo(
    () => ["de-cuong-chi-tiet", { maHocPhan }],
    [maHocPhan],
  );

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listDeCuong({ maHocPhan }),
    enabled: !!maHocPhan,
  });

  const createMut = useMutation({
    mutationFn: createDeCuong,
    onSuccess: async () => {
      message.success("Tạo đề cương thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["de-cuong-chi-tiet"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateDeCuong>[1];
    }) => updateDeCuong(id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["de-cuong-chi-tiet"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteDeCuong,
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["de-cuong-chi-tiet"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<DeCuongChiTiet> = [
    {
      title: "Phiên bản",
      dataIndex: "phienBan",
      width: 160,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 140,
      render: (v: string) => (
        <Tag color={TRANG_THAI_COLOR[v] ?? "default"}>
          {TRANG_THAI_LABEL[v] ?? v}
        </Tag>
      ),
    },
    {
      title: "Ngày áp dụng",
      dataIndex: "ngayApDung",
      width: 150,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Ghi chú",
      dataIndex: "ghiChu",
      ellipsis: true,
      render: (v) => v ?? "-",
    },
    {
      title: "Học phần",
      dataIndex: "hocPhan",
      width: 250,
      render: (hp: HocPhan | null | undefined) =>
        hp ? `${hp.tenHocPhan} (${hp.maHocPhan})` : "-",
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
                maHocPhan: row.maHocPhan,
                phienBan: row.phienBan,
                trangThai: row.trangThai,
                ngayApDung: row.ngayApDung ? dayjs(row.ngayApDung) : null,
                ghiChu: row.ghiChu,
              });
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa đề cương này?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate(row.maDeCuong)}
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
    if (!maHocPhan) return;
    setMode("create");
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ maHocPhan, trangThai: "draft" });
    setOpen(true);
  };

  const onSubmit = async () => {
    const v = await form.validateFields();

    const payload = {
      maHocPhan: v.maHocPhan,
      phienBan: v.phienBan,
      trangThai: v.trangThai ?? "draft",
      ngayApDung: v.ngayApDung
        ? v.ngayApDung.format("YYYY-MM-DD")
        : undefined,
      ghiChu: v.ghiChu ?? undefined,
    };

    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }

    if (!editing) return;

    const { maHocPhan: _hp, ...rest } = payload;
    updateMut.mutate({ id: editing.maDeCuong, payload: rest });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        wrap
      >
        <Select
          style={{ width: 480 }}
          placeholder="Chọn học phần để xem đề cương"
          options={hocPhanOptions}
          value={maHocPhan}
          onChange={(v) => setMaHocPhan(v)}
          showSearch
          optionFilterProp="label"
        />

        <Button type="primary" onClick={openCreate} disabled={!maHocPhan}>
          Tạo đề cương
        </Button>
      </Space>

      <Table
        rowKey="maDeCuong"
        loading={isLoading && !!maHocPhan}
        columns={columns}
        dataSource={maHocPhan ? rows : []}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo đề cương chi tiết" : "Sửa đề cương chi tiết"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Học phần"
            name="maHocPhan"
            rules={[{ required: true, message: "Chọn học phần" }]}
          >
            <Select
              options={hocPhanOptions}
              disabled={mode === "edit"}
              showSearch
              optionFilterProp="label"
              placeholder="Chọn học phần"
            />
          </Form.Item>

          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Phiên bản"
              name="phienBan"
              rules={[{ required: true, message: "Nhập phiên bản" }]}
              style={{ flex: 1 }}
            >
              <Input placeholder="VD: 2024-v1" />
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="trangThai"
              style={{ width: 200 }}
            >
              <Select options={TRANG_THAI_OPTIONS} />
            </Form.Item>
          </Space>

          <Form.Item label="Ngày áp dụng" name="ngayApDung">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea rows={3} placeholder="Ghi chú thêm..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
