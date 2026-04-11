"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
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

import { createUser, deleteUser, listGiangVienOptions, listUsers, updateUser } from "@/features/users/api";
import type { Role, User } from "@/features/users/types";

type Mode = "create" | "edit";

const ROLE_OPTIONS = [
  { label: "ADMIN", value: "ADMIN" },
  { label: "QA", value: "QA" },
  { label: "LECTURER", value: "LECTURER" },
  { label: "AUDITOR", value: "AUDITOR" },
];

export default function TaiKhoanPage() {
  const qc = useQueryClient();
  const [form] = Form.useForm();

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users", { q, roleFilter }],
    queryFn: () => listUsers({ q: q || undefined, role: roleFilter }),
  });

  const { data: giangViens = [] } = useQuery({
    queryKey: ["giang-vien-options"],
    queryFn: listGiangVienOptions,
  });

  const lecturerOptions = useMemo(
    () =>
      giangViens.map((gv) => ({
        label: `${gv.hoTen} (${gv.MSGV})`,
        value: gv.MSGV,
      })),
    [giangViens]
  );

  const createMut = useMutation({
    mutationFn: createUser,
    onSuccess: async () => {
      message.success("Tạo tài khoản thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) => {
      message.error(e?.response?.data?.message ?? "Tạo thất bại");
    },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => updateUser(id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) => {
      message.error(e?.response?.data?.message ?? "Cập nhật thất bại");
    },
  });

  const deleteMut = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (e: any) => {
      message.error(e?.response?.data?.message ?? "Xóa thất bại");
    },
  });

  const columns: ColumnsType<User> = [
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      width: 120,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Giảng viên",
      dataIndex: "giangVien",
      width: 240,
      render: (gv) => (gv ? `${gv.hoTen} (${gv.MSGV})` : "-"),
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
              form.setFieldsValue({
                email: row.email,
                role: row.role,
                msgv: row.msgv ?? undefined,
                password: "",
              });
              setOpen(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa tài khoản?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate(row.id)}
          >
            <Button danger loading={deleteMut.isPending}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const watchedRole = Form.useWatch("role", form);

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      role: "LECTURER",
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const values = await form.validateFields();

    const payload: any = {
      email: values.email,
      role: values.role,
    };

    if (values.password) {
      payload.password = values.password;
    }

    if (values.role === "LECTURER") {
      payload.msgv = values.msgv;
    } else {
      payload.msgv = null;
    }

    if (mode === "create") {
      createMut.mutate(payload);
      return;
    }

    if (!editing) return;

    updateMut.mutate({
      id: editing.id,
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
          <Input.Search
            placeholder="Tìm email / MSGV / tên giảng viên"
            allowClear
            onSearch={setQ}
            style={{ width: 320 }}
          />

          <Select
            allowClear
            placeholder="Lọc role"
            options={ROLE_OPTIONS}
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 180 }}
          />
        </Space>

        <Button type="primary" onClick={openCreate}>
          Tạo tài khoản
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={users}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo tài khoản" : "Sửa tài khoản"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Nhập email" },
              { type: "email", message: "Email không hợp lệ" },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label={mode === "create" ? "Mật khẩu" : "Mật khẩu mới"}
            name="password"
            rules={
              mode === "create"
                ? [{ required: true, message: "Nhập mật khẩu" }]
                : []
            }
          >
            <Input.Password />
          </Form.Item>

          <Form.Item
            label="Role"
            name="role"
            rules={[{ required: true, message: "Chọn role" }]}
          >
            <Select options={ROLE_OPTIONS} />
          </Form.Item>

          {watchedRole === "LECTURER" && (
            <Form.Item
              label="Giảng viên"
              name="msgv"
              rules={[{ required: true, message: "Chọn giảng viên" }]}
            >
              <Select
                options={lecturerOptions}
                showSearch
                optionFilterProp="label"
                placeholder="Chọn giảng viên"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}