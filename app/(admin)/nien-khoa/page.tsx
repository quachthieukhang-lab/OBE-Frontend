"use client";

import { Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NienKhoa } from "@/features/nien-khoa/types";
import { createNienKhoa, deleteNienKhoa, listNienKhoa, updateNienKhoa } from "@/features/nien-khoa/api";

type Mode = "create" | "edit";

export default function NienKhoaPage() {
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<NienKhoa | null>(null);

  const [form] = Form.useForm<NienKhoa>();

  const queryKey = useMemo(() => ["nien-khoa", { q }], [q]);

  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listNienKhoa({ q: q || undefined }),
  });

  const createMut = useMutation({
    mutationFn: createNienKhoa,
    onSuccess: async () => {
      message.success("Tạo niên khóa thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["nien-khoa"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({ khoa, payload }: { khoa: number; payload: Partial<NienKhoa> }) =>
      updateNienKhoa(khoa, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["nien-khoa"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteNienKhoa,
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["nien-khoa"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<NienKhoa> = [
    { title: "Khóa", dataIndex: "khoa", width: 140 },
    { title: "Năm bắt đầu", dataIndex: "namBatDau", width: 140 },
    { title: "Năm kết thúc", dataIndex: "namKetThuc", width: 140, render: (v) => v ?? "-" },
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
              form.setFieldsValue(row);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa niên khóa?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate(row.khoa)}
          >
            <Button danger loading={deleteMut.isPending}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const onOpenCreate = () => {
    setMode("create");
    setEditing(null);
    form.resetFields();
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    if (mode === "create") {
      createMut.mutate(values);
      return;
    }

    if (!editing) return;

    // Update: không cần gửi lại PK nếu không muốn
    const { khoa, ...rest } = values;
    updateMut.mutate({ khoa: editing.khoa, payload: rest });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo ghi chú..."
          allowClear
          onSearch={setQ}
          style={{ maxWidth: 360 }}
        />
        <Button type="primary" onClick={onOpenCreate}>
          Tạo niên khóa
        </Button>
      </Space>

      <Table
        rowKey="khoa"
        loading={isLoading}
        columns={columns}
        dataSource={data}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo niên khóa" : "Sửa niên khóa"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Khóa"
            name="khoa"
            rules={[{ required: true, message: "Nhập khóa" }]}
          >
            <InputNumber style={{ width: "100%" }} disabled={mode === "edit"} />
          </Form.Item>

          <Form.Item
            label="Năm bắt đầu"
            name="namBatDau"
            rules={[{ required: true, message: "Nhập năm bắt đầu" }]}
          >
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Năm kết thúc" name="namKetThuc">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}