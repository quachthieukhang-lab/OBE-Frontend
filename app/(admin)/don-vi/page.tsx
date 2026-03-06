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
    Switch,
    Table,
    Tag,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import type { DonVi } from "@/features/don-vi/types";
import { createDonVi, deleteDonVi, listDonVi, updateDonVi } from "@/features/don-vi/api";

type Mode = "create" | "edit";

const LOAI_DON_VI = [
    { label: "Khoa", value: "Khoa" },
    { label: "Viện", value: "Viện" },
    { label: "Bộ môn", value: "Bộ môn" },
    { label: "Phòng", value: "Phòng" },
    { label: "Trung tâm", value: "Trung tâm" },
];

export default function DonViPage() {
    const qc = useQueryClient();

    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("create");
    const [editing, setEditing] = useState<DonVi | null>(null);
    const [form] = Form.useForm<DonVi>();

    const queryKey = useMemo(() => ["don-vi", { q }], [q]);

    const { data = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => listDonVi({ q: q || undefined }),
    });

    const createMut = useMutation({
        mutationFn: createDonVi,
        onSuccess: async () => {
            message.success("Tạo đơn vị thành công");
            setOpen(false);
            form.resetFields();
            await qc.invalidateQueries({ queryKey: ["don-vi"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<DonVi> }) => updateDonVi(id, payload),
        onSuccess: async () => {
            message.success("Cập nhật thành công");
            setOpen(false);
            form.resetFields();
            await qc.invalidateQueries({ queryKey: ["don-vi"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
    });

    const deleteMut = useMutation({
        mutationFn: deleteDonVi,
        onSuccess: async () => {
            message.success("Đã xóa");
            await qc.invalidateQueries({ queryKey: ["don-vi"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
    });

    const columns: ColumnsType<DonVi> = [
        { title: "Mã", dataIndex: "maDonVi", width: 120 },
        { title: "Tên đơn vị", dataIndex: "tenDonVi", ellipsis: true, width: 200 },
        {
            title: "Loại",
            dataIndex: "loaiDonVi",
            width: 140,
            render: (v) => <Tag>{v}</Tag>,
        },
        { title: "Email", dataIndex: "email", width: 220, render: (v) => v ?? "-" },
        { title: "SĐT", dataIndex: "soDienThoai", width: 140, render: (v) => v ?? "-" },
        { title: "Địa chỉ", dataIndex: "diaChi", width: 220, render: (v) => v ?? "-" },
        { title: "Website", dataIndex: "website", width: 220, render: (v) => v ?? "-" },
        {
            title: "Active",
            dataIndex: "isActive",
            render: (v) => (v === false ? <Tag color="red">OFF</Tag> : <Tag color="green">ON</Tag>),
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
                                // đảm bảo boolean
                                isActive: row.isActive ?? true,
                            });
                        }}
                    >
                        Sửa
                    </Button>

                    <Popconfirm
                        title="Xóa đơn vị?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => deleteMut.mutate(row.maDonVi)}
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
        form.setFieldsValue({ isActive: true } as any);
        setOpen(true);
    };

    const onSubmit = async () => {
        const values = await form.validateFields();

        if (mode === "create") {
            createMut.mutate(values);
            return;
        }

        if (!editing) return;

        const { maDonVi, ...rest } = values;
        updateMut.mutate({ id: editing.maDonVi, payload: rest });
    };

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm theo mã / tên..."
                    allowClear
                    onSearch={setQ}
                    style={{ maxWidth: 420 }}
                />
                <Button type="primary" onClick={onOpenCreate}>
                    Tạo đơn vị
                </Button>
            </Space>

            <Table
                rowKey="maDonVi"
                loading={isLoading}
                columns={columns}
                dataSource={data}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={open}
                title={mode === "create" ? "Tạo đơn vị" : "Sửa đơn vị"}
                onCancel={() => setOpen(false)}
                onOk={onSubmit}
                confirmLoading={createMut.isPending || updateMut.isPending}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Mã đơn vị"
                        name="maDonVi"
                        rules={[{ required: true, message: "Nhập mã đơn vị" }]}
                    >
                        <Input disabled={mode === "edit"} placeholder="VD: CNTT" />
                    </Form.Item>

                    <Form.Item
                        label="Tên đơn vị"
                        name="tenDonVi"
                        rules={[{ required: true, message: "Nhập tên đơn vị" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Loại đơn vị"
                        name="loaiDonVi"
                        rules={[{ required: true, message: "Chọn loại đơn vị" }]}
                    >
                        <Select options={LOAI_DON_VI} placeholder="Chọn loại" />
                    </Form.Item>

                    <Form.Item label="Email" name="email">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Số điện thoại" name="soDienThoai">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Địa chỉ" name="diaChi">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Website" name="website">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}