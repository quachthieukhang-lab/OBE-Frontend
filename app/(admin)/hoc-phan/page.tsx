"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Button,
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

import type { HocPhan, DonVi } from "@/features/hoc-phan/types";
import { createHocPhan, deleteHocPhan, listDonVi, listHocPhan, updateHocPhan } from "@/features/hoc-phan/api";

type Mode = "create" | "edit";

export default function HocPhanPage() {
    const qc = useQueryClient();

    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("create");
    const [editing, setEditing] = useState<HocPhan | null>(null);
    const [form] = Form.useForm<HocPhan>();

    const queryKey = useMemo(() => ["hoc-phan", { q }], [q]);

    const { data: rows = [], isLoading } = useQuery({
        queryKey,
        queryFn: () => listHocPhan({ q: q || undefined }),
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
        mutationFn: createHocPhan,
        onSuccess: async () => {
            message.success("Tạo học phần thành công");
            setOpen(false);
            form.resetFields();
            await qc.invalidateQueries({ queryKey: ["hoc-phan"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<HocPhan> }) => updateHocPhan(id, payload),
        onSuccess: async () => {
            message.success("Cập nhật thành công");
            setOpen(false);
            form.resetFields();
            await qc.invalidateQueries({ queryKey: ["hoc-phan"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
    });

    const deleteMut = useMutation({
        mutationFn: deleteHocPhan,
        onSuccess: async () => {
            message.success("Đã xóa");
            await qc.invalidateQueries({ queryKey: ["hoc-phan"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
    });

    const columns: ColumnsType<HocPhan> = [
        { title: "Mã HP", dataIndex: "maHocPhan", width: 80 },
        { title: "Tên học phần", dataIndex: "tenHocPhan", ellipsis: true, width: 200 },

        { title: "Số TC", dataIndex: "soTinChi", width: 140, render: (v) => <Tag>{v}</Tag> },
        { title: "Số tiết lý thuyết", dataIndex: "soTietLyThuyet", width: 160, render: (v) => v ?? "-" },
        { title: "Số tiết thực hành", dataIndex: "soTietThucHanh", width: 160, render: (v) => v ?? "-" },
        { title: "Ngôn ngữ", dataIndex: "ngonNguGiangDay", width: 160, render: (v) => v ?? "-" },
        { title: "Loại", dataIndex: "loaiHocPhan", width: 160, render: (v) => v ?? "-" },
        {
            title: "Đơn vị",
            dataIndex: "maDonVi",
            render: (v) => {
                const dv = donVis.find((x) => x.maDonVi === v);
                return dv ? `${dv.tenDonVi} (${dv.maDonVi})` : v;
            },
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
                            form.setFieldsValue(row);
                        }}
                    >
                        Sửa
                    </Button>

                    <Popconfirm
                        title="Xóa học phần?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => deleteMut.mutate(row.maHocPhan)}
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
        // set default
        form.setFieldsValue({ soTinChi: 3 } as any);
        setOpen(true);
    };

    const onSubmit = async () => {
        const values = await form.validateFields();

        if (mode === "create") {
            createMut.mutate(values);
            return;
        }

        if (!editing) return;
        const { maHocPhan, ...rest } = values; // không sửa PK
        updateMut.mutate({ id: editing.maHocPhan, payload: rest });
    };

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
                <Input.Search
                    placeholder="Tìm theo mã / tên học phần..."
                    allowClear
                    onSearch={setQ}
                    style={{ maxWidth: 420 }}
                />
                <Button type="primary" onClick={openCreate}>
                    Tạo học phần
                </Button>
            </Space>

            <Table
                rowKey="maHocPhan"
                loading={isLoading}
                columns={columns}
                dataSource={rows}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={open}
                title={mode === "create" ? "Tạo học phần" : "Sửa học phần"}
                onCancel={() => setOpen(false)}
                onOk={onSubmit}
                confirmLoading={createMut.isPending || updateMut.isPending}
                destroyOnHidden
                width={720}
            >
                <Form form={form} layout="vertical">
                    <Space style={{ width: "100%" }} size={12}>
                        <Form.Item
                            label="Mã học phần"
                            name="maHocPhan"
                            rules={[{ required: true, message: "Nhập mã học phần" }]}
                            style={{ flex: 1 }}
                        >
                            <Input disabled={mode === "edit"} placeholder="VD: CT101" />
                        </Form.Item>

                        <Form.Item
                            label="Số tín chỉ"
                            name="soTinChi"
                            rules={[{ required: true, message: "Nhập số tín chỉ" }]}
                            style={{ width: 180 }}
                        >
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        label="Đơn vị quản lý"
                        name="maDonVi"
                        rules={[{ required: true, message: "Chọn đơn vị" }]}
                    >
                        <Select
                            showSearch
                            optionFilterProp="label"
                            options={donViOptions}
                            placeholder="Chọn đơn vị"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Tên học phần"
                        name="tenHocPhan"
                        rules={[{ required: true, message: "Nhập tên học phần" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item label="Loại học phần" name="loaiHocPhan">
                        <Input placeholder="VD: Bắt buộc / Tự chọn..." />
                    </Form.Item>

                    <Space style={{ width: "100%" }} size={12}>
                        <Form.Item label="Số tiết lý thuyết" name="soTietLyThuyet" style={{ flex: 1 }}>
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>

                        <Form.Item label="Số tiết thực hành" name="soTietThucHanh" style={{ flex: 1 }}>
                            <InputNumber style={{ width: "100%" }} min={0} />
                        </Form.Item>
                    </Space>

                    <Form.Item label="Ngôn ngữ giảng dạy" name="ngonNguGiangDay">
                        <Input />
                    </Form.Item>

                    <Form.Item label="Tài liệu tham khảo" name="taiLieuThamKhao">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item label="Mô tả" name="moTa">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}