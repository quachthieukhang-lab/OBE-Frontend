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
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type { CauHinhObe } from "@/features/cau-hinh-obe/types";
import {
  createCauHinhObe,
  deleteCauHinhObe,
  listCauHinhObe,
  updateCauHinhObe,
} from "@/features/cau-hinh-obe/api";

const { Text } = Typography;

type Mode = "create" | "edit";

export default function CauHinhObePage() {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();

  const [qNamHoc, setQNamHoc] = useState("");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("create");
  const [editing, setEditing] = useState<CauHinhObe | null>(null);

  const queryKey = useMemo(
    () => ["cau-hinh-obe", { namHoc: qNamHoc }],
    [qNamHoc]
  );

  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      listCauHinhObe({
        namHoc: qNamHoc || undefined,
      }),
  });

  const createMut = useMutation({
    mutationFn: createCauHinhObe,
    onSuccess: async () => {
      message.success("Tạo cấu hình OBE thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["cau-hinh-obe"] });
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
      payload: Partial<{
        namHoc: string;
        nguongDatCaNhan: string;
        kpiLopHoc: string;
      }>;
    }) => updateCauHinhObe(id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["cau-hinh-obe"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteCauHinhObe,
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["cau-hinh-obe"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<CauHinhObe> = [
    {
      title: "Năm học",
      dataIndex: "namHoc",
      width: 160,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "Ngưỡng đạt cá nhân",
      dataIndex: "nguongDatCaNhan",
      width: 180,
      render: (v) => {
        const percent = (Number(v) * 100).toFixed(2);
        return (
          <Space direction="vertical" size={0}>
            <Text>{v}</Text>
            <Text type="secondary">{percent}%</Text>
          </Space>
        );
      },
    },
    {
      title: "KPI lớp học",
      dataIndex: "kpiLopHoc",
      width: 160,
      render: (v) => {
        const percent = (Number(v) * 100).toFixed(2);
        return (
          <Space direction="vertical" size={0}>
            <Text>{v}</Text>
            <Text type="secondary">{percent}%</Text>
          </Space>
        );
      },
    },
    {
      title: "Cập nhật",
      dataIndex: "updatedAt",
      width: 180,
      render: (v) => dayjs(v).format("YYYY-MM-DD HH:mm"),
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
                namHoc: row.namHoc,
                nguongDatCaNhan: Number(row.nguongDatCaNhan),
                kpiLopHoc: Number(row.kpiLopHoc),
              });
              setOpen(true);
            }}
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa cấu hình OBE?"
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

  const openCreate = () => {
    setMode("create");
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      nguongDatCaNhan: 0.5,
      kpiLopHoc: 0.7,
    });
    setOpen(true);
  };

  const onSubmit = async () => {
    const v = await form.validateFields();

    const payload = {
      namHoc: v.namHoc,
      nguongDatCaNhan: String(v.nguongDatCaNhan),
      kpiLopHoc: String(v.kpiLopHoc),
    };

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
        style={{
          width: "100%",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
        wrap
      >
        <Input.Search
          placeholder="Lọc theo năm học, ví dụ 2025-2026"
          allowClear
          onSearch={setQNamHoc}
          style={{ maxWidth: 320 }}
        />

        <Button type="primary" onClick={openCreate}>
          Tạo cấu hình OBE
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        open={open}
        title={mode === "create" ? "Tạo cấu hình OBE" : "Sửa cấu hình OBE"}
        onCancel={() => setOpen(false)}
        onOk={onSubmit}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Năm học"
            name="namHoc"
            rules={[{ required: true, message: "Nhập năm học" }]}
          >
            <Input placeholder="VD: 2025-2026" />
          </Form.Item>

          <Form.Item
            label="Ngưỡng đạt cá nhân"
            name="nguongDatCaNhan"
            rules={[
              { required: true, message: "Nhập ngưỡng đạt cá nhân" },
              {
                validator: async (_, value) => {
                  if (value == null) return;
                  if (Number(value) < 0 || Number(value) > 1) {
                    throw new Error("Giá trị phải nằm trong khoảng 0 đến 1");
                  }
                },
              },
            ]}
            extra="Ví dụ: 0.5 tương ứng 50%"
          >
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              stringMode
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="KPI lớp học"
            name="kpiLopHoc"
            rules={[
              { required: true, message: "Nhập KPI lớp học" },
              {
                validator: async (_, value) => {
                  if (value == null) return;
                  if (Number(value) < 0 || Number(value) > 1) {
                    throw new Error("Giá trị phải nằm trong khoảng 0 đến 1");
                  }
                },
              },
            ]}
            extra="Ví dụ: 0.7 tương ứng 70%"
          >
            <InputNumber
              min={0}
              max={1}
              step={0.01}
              stringMode
              style={{ width: "100%" }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}