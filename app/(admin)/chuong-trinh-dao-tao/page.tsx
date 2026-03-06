"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { ChuongTrinhDaoTao, DonVi } from "@/features/chuong-trinh-dao-tao/types";
import {
  createChuongTrinhDaoTao,
  deleteChuongTrinhDaoTao,
  listChuongTrinhDaoTao,
  listDonVi,
  updateChuongTrinhDaoTao,
} from "@/features/chuong-trinh-dao-tao/api";

type Mode = "create" | "edit";

const TRINH_DO_OPTIONS = [
  { label: "Đại học", value: "Đại học" },
  { label: "Thạc sĩ", value: "Thạc sĩ" },
  { label: "Tiến sĩ", value: "Tiến sĩ" },
];

export default function ChuongTrinhDaoTaoPage() {
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<ChuongTrinhDaoTao | null>(null);
  const [form] = Form.useForm<ChuongTrinhDaoTao>();

  const queryKey = useMemo(() => ["chuong-trinh-dao-tao", { q }], [q]);

  const { data: programs = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => listChuongTrinhDaoTao({ q: q || undefined }),
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
    mutationFn: createChuongTrinhDaoTao,
    onSuccess: async () => {
      message.success("Tạo chương trình đào tạo thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-dao-tao"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Tạo thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<ChuongTrinhDaoTao> }) =>
      updateChuongTrinhDaoTao(id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-dao-tao"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteChuongTrinhDaoTao,
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["chuong-trinh-dao-tao"] });
    },
    onError: (e: any) => message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<ChuongTrinhDaoTao> = [
    { title: "Mã ngành", dataIndex: "maSoNganh", width: 140 },
    { title: "Tên tiếng Việt", dataIndex: "tenTiengViet", ellipsis: true, width: 200},
    { title: "Tên tiếng Anh", dataIndex: "tenTiengAnh", width: 200, render: (v) => v ?? "-"},
    { title: "Trình độ", dataIndex: "trinhDoDaoTao", width: 120, render: (v) => <Tag>{v}</Tag> },
    { title: "Trường cấp bằng", dataIndex: "truongCapBang", width: 200, render: (v) => v ?? "-"},
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
            title="Xóa chương trình đào tạo?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() => deleteMut.mutate(row.maSoNganh)}
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
    const values = await form.validateFields();

    if (mode === "create") {
      createMut.mutate(values);
      return;
    }

    if (!editing) return;
    const { maSoNganh, ...rest } = values; // không sửa PK
    updateMut.mutate({ id: editing.maSoNganh, payload: rest });
  };

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ width: "100%", justifyContent: "space-between", marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo mã ngành / tên..."
          allowClear
          onSearch={setQ}
          style={{ maxWidth: 420 }}
        />
        <Button type="primary" onClick={openCreate}>
          Tạo CTĐT
        </Button>
      </Space>

      <Table
        rowKey="maSoNganh"
        loading={isLoading}
        columns={columns}
        dataSource={programs}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo chương trình đào tạo" : "Sửa chương trình đào tạo"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Mã số ngành"
            name="maSoNganh"
            rules={[{ required: true, message: "Nhập mã số ngành" }]}
          >
            <Input disabled={mode === "edit"} placeholder="VD: KTPM" />
          </Form.Item>

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
            label="Tên tiếng Việt"
            name="tenTiengViet"
            rules={[{ required: true, message: "Nhập tên tiếng Việt" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label="Tên tiếng Anh" name="tenTiengAnh">
            <Input />
          </Form.Item>

          <Form.Item label="Trường cấp bằng" name="truongCapBang">
            <Input />
          </Form.Item>

          <Form.Item label="Tên gọi văn bằng" name="tenGoiVanBang">
            <Input />
          </Form.Item>

          <Form.Item
            label="Trình độ đào tạo"
            name="trinhDoDaoTao"
            rules={[{ required: true, message: "Chọn trình độ đào tạo" }]}
          >
            <Select options={TRINH_DO_OPTIONS} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}