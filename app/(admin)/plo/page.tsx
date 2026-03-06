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

import type { ChuongTrinhDaoTao, PLO } from "@/features/plo/types";
import { createPlo, deletePlo, listPlo, listPrograms, updatePlo } from "@/features/plo/api";

type Mode = "create" | "edit";

export default function PloPage() {
    const qc = useQueryClient();
    const [form] = Form.useForm<any>();

    // chọn CTĐT trước
    const [program, setProgram] = useState<string | undefined>();
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<Mode>("create");
    const [editing, setEditing] = useState<PLO | null>(null);

    const { data: programs = [] } = useQuery({
        queryKey: ["chuong-trinh-dao-tao"],
        queryFn: listPrograms,
    });

    const programOptions = useMemo(
        () =>
            programs.map((p: ChuongTrinhDaoTao) => ({
                label: `${p.tenTiengViet} (${p.maSoNganh})`,
                value: p.maSoNganh,
            })),
        [programs]
    );

    const ploQueryKey = useMemo(() => ["plo", { program }], [program]);

    const { data: rowsRaw = [], isLoading } = useQuery({
        queryKey: ploQueryKey,
        enabled: !!program,
        queryFn: () => listPlo(program!),
    });

    const rows = useMemo(() => {
        if (!q.trim()) return rowsRaw;
        const s = q.trim().toLowerCase();
        return rowsRaw.filter((x) => {
            return (
                (x.code ?? "").toLowerCase().includes(s) ||
                x.noiDungChuanDauRa.toLowerCase().includes(s) ||
                (x.nhom ?? "").toLowerCase().includes(s)
            );
        });
    }, [rowsRaw, q]);

    const createMut = useMutation({
        mutationFn: async (payload: { maSoNganh: string; data: any }) => createPlo(payload.maSoNganh, payload.data),
        onSuccess: async () => {
            message.success("Tạo PLO thành công");
            setOpen(false);
            form.resetFields();
            await qc.invalidateQueries({ queryKey: ["plo"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
    });

    const updateMut = useMutation({
        mutationFn: async (payload: { maSoNganh: string; maPLO: string; data: Partial<PLO> }) =>
            updatePlo(payload.maSoNganh, payload.maPLO, payload.data),
        onSuccess: async () => {
            message.success("Cập nhật thành công");
            setOpen(false);
            form.resetFields();
            await qc.invalidateQueries({ queryKey: ["plo"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
    });

    const deleteMut = useMutation({
        mutationFn: async (payload: { maSoNganh: string; maPLO: string }) => deletePlo(payload.maSoNganh, payload.maPLO),
        onSuccess: async () => {
            message.success("Đã xóa");
            await qc.invalidateQueries({ queryKey: ["plo"] });
        },
        onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
    });

    const columns: ColumnsType<PLO> = [
        { title: "Code", dataIndex: "code", width: 110, render: (v) => v ?? "-" },
        { title: "Nội dung chuẩn đầu ra", dataIndex: "noiDungChuanDauRa", ellipsis: true, width: 600 },
        { title: "Nhóm", dataIndex: "nhom", width: 120, render: (v) => v ?? "-" },
        { title: "Mức độ", dataIndex: "mucDo", width: 120, render: (v) => v ?? "-" },
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
                                isActive: row.isActive ?? true,
                            });
                        }}
                    >
                        Sửa
                    </Button>

                    <Popconfirm
                        title="Xóa PLO?"
                        okText="Xóa"
                        cancelText="Hủy"
                        onConfirm={() => deleteMut.mutate({ maSoNganh: program!, maPLO: row.maPLO })}
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
        if (!program) return;
        setMode("create");
        setEditing(null);
        form.resetFields();
        form.setFieldsValue({ isActive: true } as any);
        setOpen(true);
    };

    const onSubmit = async () => {
        if (!program) return;

        const v = await form.validateFields();
        const data: Partial<PLO> = {
            code: v.code ?? null,
            noiDungChuanDauRa: v.noiDungChuanDauRa,
            nhom: v.nhom ?? null,
            mucDo: v.mucDo ?? null,
            ghiChu: v.ghiChu ?? null,
            isActive: v.isActive ?? true,
        };

        if (mode === "create") {
            createMut.mutate({ maSoNganh: program, data });
            return;
        }

        if (!editing) return;
        updateMut.mutate({ maSoNganh: program, maPLO: editing.maPLO, data });
    };

    return (
        <div style={{ padding: 24 }}>
            <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }} wrap>
                <Space wrap>
                    <Select
                        style={{ width: 360 }}
                        placeholder="Chọn chương trình đào tạo"
                        options={programOptions}
                        value={program}
                        onChange={(v) => {
                            setProgram(v);
                            setQ("");
                        }}
                        showSearch
                        optionFilterProp="label"
                    />

                    <Input.Search
                        placeholder="Tìm code / nội dung..."
                        allowClear
                        onSearch={setQ}
                        style={{ width: 280 }}
                        disabled={!program}
                    />
                </Space>

                <Button type="primary" onClick={openCreate} disabled={!program}>
                    Tạo PLO
                </Button>
            </Space>

            <Table
                rowKey="maPLO"
                loading={isLoading && !!program}
                columns={columns}
                dataSource={program ? rows : []}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                open={open}
                title={mode === "create" ? "Tạo PLO" : "Sửa PLO"}
                onCancel={() => setOpen(false)}
                onOk={onSubmit}
                confirmLoading={createMut.isPending || updateMut.isPending}
                destroyOnHidden
                width={900}
            >
                <Form form={form} layout="vertical">
                    <Space style={{ width: "100%" }} size={12}>
                        <Form.Item label="Code" name="code" style={{ width: 200 }}>
                            <Input placeholder="VD: PLO1" />
                        </Form.Item>

                        <Form.Item label="Nhóm" name="nhom" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Mức độ" name="mucDo" style={{ flex: 1 }}>
                            <Input />
                        </Form.Item>

                        <Form.Item label="Active" name="isActive" valuePropName="checked" style={{ width: 120 }}>
                            <Switch />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        label="Nội dung chuẩn đầu ra"
                        name="noiDungChuanDauRa"
                        rules={[{ required: true, message: "Nhập nội dung chuẩn đầu ra" }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item label="Ghi chú" name="ghiChu">
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}