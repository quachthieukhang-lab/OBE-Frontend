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
    Switch,
    Table,
    Tag,
    message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type { DonVi, GiangVien } from "@/features/giang-vien/types";
import { createGiangVien, deleteGiangVien, listDonVi, listGiangVien, updateGiangVien } from "@/features/giang-vien/api";

type Mode = "create" | "edit";

const HOC_VI_OPTIONS = [
    { label: "Cử nhân", value: "Cử nhân" },
    { label: "Thạc sĩ", value: "Thạc sĩ" },
    { label: "Tiến sĩ", value: "Tiến sĩ" },
];

export default function GiangVienPage() {
    const qc = useQueryClient();

    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("create");
    const [editing, setEditing] = useState<GiangVien | null>(null);
    const [form] = Form.useForm<any>();

    const queryKey = useMemo(() => ["giang-vien", { q }], [q]);

    const { data: rows = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => listGiangVien({ q: q || undefined }),
    });

    const { data: donVis = [] } = useQuery({
        queryKey: ["don-vi"],
        queryFn: listDonVi,
    });

    const donViOptions = useMemo(
        () =>
            donVis.map((dv: DonVi) => ({
                label: `${dv.tenDonVi} (${dv.maDonVi})`,
                value: dv.maDonVi,
            })),
        [donVis]
    );

    const createMut = useMutation({
        mutationFn: createGiangVien,
        onSuccess: async () => {
            message.success("Tạo giảng viên thành công");
            setOpen(false);
            form.resetFields();
            await qc.invalidateQueries({ queryKey: ["giang-vien"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<GiangVien> }) => updateGiangVien(id, payload),
        onSuccess: async () => {
            message.success("Cập nhật thành công");
            setOpen(false);
            form.resetFields();
            await qc.invalidateQueries({ queryKey: ["giang-vien"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
    });

    const deleteMut = useMutation({
        mutationFn: deleteGiangVien,
        onSuccess: async () => {
            message.success("Đã xóa");
            await qc.invalidateQueries({ queryKey: ["giang-vien"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
    });

    const columns: ColumnsType<GiangVien> = [
        { title: "MSGV", dataIndex: "MSGV", width: 120 },
        { title: "Họ tên", dataIndex: "hoTen", ellipsis: true },
        { title: "Email", dataIndex: "email", width: 220, render: (v) => v ?? "-" },
        { title: "SĐT", dataIndex: "soDienThoai", width: 140, render: (v) => v ?? "-" },
        {
            title: "Đơn vị",
            dataIndex: "maDonVi",
            width: 220,
            render: (v) => {
                const dv = donVis.find((x) => x.maDonVi === v);
                return dv ? `${dv.tenDonVi} (${dv.maDonVi})` : v;
            },
        },
        { title: "Học vị", dataIndex: "hocVi", width: 110, render: (v) => v ? <Tag>{v}</Tag> : "-" },
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
                                ngaySinh: row.ngaySinh ? dayjs(row.ngaySinh) : null,
                                isActive: row.isActive ?? true,
                            });
                        }}
                    >
                        Sửa
                    </Button>

                    <Popconfirm
                        title="Xóa giảng viên?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => deleteMut.mutate(row.MSGV)}
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
        form.setFieldsValue({ isActive: true } as any);
        setOpen(true);
    };

    const onSubmit = async () => {
        const values = await form.validateFields();

        const payload: GiangVien = {
            MSGV: values.MSGV,
            maDonVi: values.maDonVi,
            hoTen: values.hoTen,
            email: values.email,
            soDienThoai: values.soDienThoai,
            hocVi: values.hocVi,
            chucDanh: values.chucDanh,
            boMon: values.boMon,
            ngaySinh: values.ngaySinh ? values.ngaySinh.format("YYYY-MM-DD") : null,
            isActive: values.isActive ?? true,
        };

        if (mode === "create") {
            createMut.mutate(payload);
            return;
        }

        if (!editing) return;

        const { MSGV, ...rest } = payload; // không sửa PK
        updateMut.mutate({ id: editing.MSGV, payload: rest });
    };

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm theo MSGV / tên / email..."
                    allowClear
                    onSearch={setQ}
                    style={{ maxWidth: 420 }}
                />
                <Button type="primary" onClick={openCreate}>
                    Tạo giảng viên
                </Button>
            </Space>

            <Table
                rowKey="MSGV"
                loading={isLoading}
                columns={columns}
                dataSource={rows}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={open}
                title={mode === "create" ? "Tạo giảng viên" : "Sửa giảng viên"}
                onCancel={() => setOpen(false)}
                onOk={onSubmit}
                confirmLoading={createMut.isPending || updateMut.isPending}
                destroyOnHidden
            >
                <Form form={form} layout="vertical">
                    <Space style={{ width: "100%" }} size={12}>
                        <Form.Item
                            label="MSGV"
                            name="MSGV"
                            rules={[{ required: true, message: "Nhập MSGV" }]}
                            style={{ flex: 1, width: 230 }}

                        >
                            <Input disabled={mode === "edit"} placeholder="VD: GV001" />
                        </Form.Item>

                        <Form.Item
                            label="Đơn vị"
                            name="maDonVi"
                            rules={[{ required: true, message: "Chọn đơn vị" }]}
                            style={{ width: 230 }}
                        >
                            <Select
                                showSearch
                                optionFilterProp="label"
                                options={donViOptions}
                                placeholder="Chọn đơn vị"
                            />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        label="Họ tên"
                        name="hoTen"
                        rules={[{ required: true, message: "Nhập họ tên" }]}
                        style={{ width: "100%" }}
                    >
                        <Input />
                    </Form.Item>

                    <Space style={{ width: "100%" }} size={12}>
                        <Form.Item label="Email" name="email" style={{ flex: 1, width: 230}}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Số điện thoại" name="soDienThoai" style={{ flex: 1, width: 230 }}>
                            <Input />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: "100%" }} size={12}>
                        <Form.Item label="Học vị" name="hocVi" style={{ flex: 1, width: 230 }}>
                            <Select allowClear options={HOC_VI_OPTIONS} placeholder="Chọn học vị" />
                        </Form.Item>
                        <Form.Item label="Chức danh" name="chucDanh" style={{ flex: 1, width: 230 }}>
                            <Input placeholder="VD: Giảng viên chính" />
                        </Form.Item>
                    </Space>

                    <Space style={{ width: "100%" }} size={12}>
                        <Form.Item label="Bộ môn" name="boMon" style={{ flex: 1, width: 230 }}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Ngày sinh" name="ngaySinh" style={{ flex: 1, width: 230 }}>
                            <DatePicker style={{ width: "100%" }} />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Kích hoạt" name="isActive" valuePropName="checked">
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}