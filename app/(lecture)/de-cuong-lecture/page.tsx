"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Collapse,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import type {
  CachDanhGia,
  CLO,
  CO,
  MySyllabusItem,
} from "@/features/lecturer-de-cuong/types";
import {
  listMySyllabi,
  getSyllabus,
  updateSyllabus,
  deleteSyllabus,
} from "@/features/lecturer-de-cuong/api";

const { Title, Text } = Typography;

const STATUS_PC_COLOR: Record<string, string> = {
  assigned: "blue",
  in_progress: "orange",
  completed: "green",
};
const STATUS_PC_LABEL: Record<string, string> = {
  assigned: "Đã phân công",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
};
const DC_STATUS_COLOR: Record<string, string> = {
  draft: "default",
  active: "green",
  archived: "red",
};
const DC_STATUS_LABEL: Record<string, string> = {
  draft: "Bản nháp",
  active: "Đang sử dụng",
  archived: "Đã lưu trữ",
};
const TRANG_THAI_OPTIONS = [
  { label: "Bản nháp", value: "draft" },
  { label: "Đang sử dụng", value: "active" },
  { label: "Đã lưu trữ", value: "archived" },
];

export default function DeCuongLecturePage() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm] = Form.useForm<any>();

  const { data: syllabi = [], isLoading } = useQuery({
    queryKey: ["lecturer-my-syllabi"],
    queryFn: listMySyllabi,
  });

  const maDeCuong = selectedId;

  const { data: syllabus, isLoading: loadingSyllabus } = useQuery({
    queryKey: ["lecturer-syllabus-view", maDeCuong],
    queryFn: () => getSyllabus(maDeCuong!),
    enabled: !!maDeCuong,
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateSyllabus>[1];
    }) => updateSyllabus(id, payload),
    onSuccess: async () => {
      message.success("Cập nhật đề cương thành công");
      setEditOpen(false);
      editForm.resetFields();
      await qc.invalidateQueries({ queryKey: ["lecturer-my-syllabi"] });
      await qc.invalidateQueries({ queryKey: ["lecturer-syllabus-view"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: deleteSyllabus,
    onSuccess: async () => {
      message.success("Đã xóa đề cương");
      setSelectedId(null);
      await qc.invalidateQueries({ queryKey: ["lecturer-my-syllabi"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Xóa thất bại"),
  });

  const columns: ColumnsType<MySyllabusItem> = [
    {
      title: "Học phần",
      key: "hp",
      render: (_, row) => `${row.tenHocPhan} (${row.maHocPhan})`,
      ellipsis: true,
    },
    {
      title: "CTĐT",
      key: "ctdt",
      width: 150,
      render: (_, row) => `${row.assignment.maSoNganh} K${row.assignment.khoa}`,
    },
    {
      title: "Phiên bản",
      dataIndex: "phienBan",
      width: 130,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: "TT đề cương",
      dataIndex: "trangThai",
      width: 130,
      render: (v: string) => (
        <Tag color={DC_STATUS_COLOR[v] ?? "default"}>
          {DC_STATUS_LABEL[v] ?? v}
        </Tag>
      ),
    },
    {
      title: "TT phân công",
      key: "ttpc",
      width: 130,
      render: (_, row) => {
        const v = row.assignment.trangThaiPhanCong;
        return (
          <Tag color={STATUS_PC_COLOR[v] ?? "default"}>
            {STATUS_PC_LABEL[v] ?? v}
          </Tag>
        );
      },
    },
    {
      title: "Vai trò",
      key: "vt",
      width: 120,
      render: (_, row) => <Tag>{row.assignment.vaiTro}</Tag>,
    },
    {
      title: "CLO",
      key: "clo",
      width: 60,
      align: "center",
      render: (_, row) => row.counts.clos,
    },
    {
      title: "CO",
      key: "co",
      width: 60,
      align: "center",
      render: (_, row) => row.counts.cos,
    },
    {
      title: "CĐG",
      key: "cdg",
      width: 60,
      align: "center",
      render: (_, row) => row.counts.cachDanhGias,
    },
  ];

  const cloCols: ColumnsType<CLO> = [
    { title: "#", width: 50, render: (_, __, i) => i + 1 },
    {
      title: "Code",
      dataIndex: "code",
      width: 100,
      render: (v) => (v ? <Tag color="blue">{v}</Tag> : "-"),
    },
    { title: "Nội dung chuẩn đầu ra", dataIndex: "noiDungChuanDauRa" },
  ];

  const coCols: ColumnsType<CO> = [
    { title: "#", width: 50, render: (_, __, i) => i + 1 },
    {
      title: "Code",
      dataIndex: "code",
      width: 100,
      render: (v) => (v ? <Tag color="purple">{v}</Tag> : "-"),
    },
    { title: "Nội dung chuẩn đầu ra", dataIndex: "noiDungChuanDauRa" },
  ];

  const cdgCols: ColumnsType<CachDanhGia> = [
    { title: "#", width: 50, render: (_, __, i) => i + 1 },
    { title: "Tên thành phần", dataIndex: "tenThanhPhan", width: 200 },
    {
      title: "Cách đánh giá",
      dataIndex: "cachDanhGia",
      render: (v) => v ?? "-",
      ellipsis: true,
    },
    {
      title: "Loại",
      dataIndex: "loai",
      width: 120,
      render: (v) => (v ? <Tag>{v}</Tag> : "-"),
    },
    {
      title: "Trọng số",
      dataIndex: "trongSo",
      width: 100,
      render: (v) => <Tag color="blue">{v}</Tag>,
    },
  ];

  const trongSoTotal = (syllabus?.cachDanhGias ?? []).reduce(
    (sum, c) => sum + Number(c.trongSo || 0),
    0,
  );

  const openEdit = () => {
    if (!syllabus) return;
    editForm.setFieldsValue({
      phienBan: syllabus.phienBan,
      trangThai: syllabus.trangThai,
      ngayApDung: syllabus.ngayApDung ? dayjs(syllabus.ngayApDung) : null,
      ghiChu: syllabus.ghiChu,
    });
    setEditOpen(true);
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={4} style={{ marginBottom: 4 }}>
        Đề cương chi tiết đã nhập
      </Title>
      <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
        Xem lại, chỉnh sửa hoặc xóa đề cương chi tiết bạn đã nhập
      </Text>

      <Table
        rowKey="maDeCuong"
        loading={isLoading}
        columns={columns}
        dataSource={syllabi}
        pagination={{ pageSize: 8 }}
        size="middle"
        onRow={(row) => ({
          onClick: () => setSelectedId(row.maDeCuong),
          style: {
            cursor: "pointer",
            background:
              row.maDeCuong === selectedId
                ? "rgba(22,119,255,0.04)"
                : undefined,
          },
        })}
        locale={{ emptyText: "Chưa có đề cương nào được tạo" }}
      />

      {selectedId && syllabus && (
        <div style={{ marginTop: 24 }}>
          <Card
            title={
              <span style={{ fontWeight: 600 }}>
                Đề cương:{" "}
                {syllabus.hocPhan
                  ? `${syllabus.hocPhan.tenHocPhan} (${syllabus.hocPhan.maHocPhan})`
                  : syllabus.maHocPhan}
              </span>
            }
            extra={
              <Space>
                <Button onClick={openEdit}>Sửa</Button>
                <Popconfirm
                  title="Xóa đề cương này? Tất cả CLO, CO, CĐG sẽ bị xóa theo."
                  okText="Xóa"
                  cancelText="Hủy"
                  onConfirm={() => deleteMut.mutate(selectedId)}
                >
                  <Button danger loading={deleteMut.isPending}>
                    Xóa
                  </Button>
                </Popconfirm>
              </Space>
            }
            style={{ borderRadius: 12, marginBottom: 16 }}
            loading={loadingSyllabus}
          >
            <Descriptions column={3} size="small">
              <Descriptions.Item label="Mã đề cương">
                <Text copyable style={{ fontSize: 12 }}>
                  {syllabus.maDeCuong}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phiên bản">
                <Tag color="blue">{syllabus.phienBan}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Tag color={DC_STATUS_COLOR[syllabus.trangThai] ?? "default"}>
                  {DC_STATUS_LABEL[syllabus.trangThai] ?? syllabus.trangThai}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày áp dụng">
                {syllabus.ngayApDung
                  ? dayjs(syllabus.ngayApDung).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú" span={2}>
                {syllabus.ghiChu ?? "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                <Statistic
                  title="CLO - Chuẩn đầu ra"
                  value={syllabus.clos?.length ?? 0}
                  valueStyle={{ color: "#1677ff" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                <Statistic
                  title="CO - Mục tiêu"
                  value={syllabus.cos?.length ?? 0}
                  valueStyle={{ color: "#722ed1" }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
                <Statistic
                  title="Cách đánh giá"
                  value={syllabus.cachDanhGias?.length ?? 0}
                  suffix={
                    <Text
                      type={Math.abs(trongSoTotal - 1) < 0.001 ? "success" : "danger"}
                      style={{ fontSize: 14 }}
                    >
                      (Σ = {trongSoTotal.toFixed(2)})
                    </Text>
                  }
                  valueStyle={{ color: "#52c41a" }}
                />
              </Card>
            </Col>
          </Row>

          <Collapse
            defaultActiveKey={["clo", "co", "cdg"]}
            style={{ borderRadius: 12 }}
            items={[
              {
                key: "clo",
                label: `CLO — Chuẩn đầu ra học phần (${syllabus.clos?.length ?? 0})`,
                children:
                  (syllabus.clos?.length ?? 0) > 0 ? (
                    <Table rowKey="maCLO" dataSource={syllabus.clos} columns={cloCols} pagination={false} size="small" />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có CLO" />
                  ),
              },
              {
                key: "co",
                label: `CO — Mục tiêu học phần (${syllabus.cos?.length ?? 0})`,
                children:
                  (syllabus.cos?.length ?? 0) > 0 ? (
                    <Table rowKey="maCO" dataSource={syllabus.cos} columns={coCols} pagination={false} size="small" />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có CO" />
                  ),
              },
              {
                key: "cdg",
                label: `Cách đánh giá (${syllabus.cachDanhGias?.length ?? 0})`,
                children:
                  (syllabus.cachDanhGias?.length ?? 0) > 0 ? (
                    <Table rowKey="maCDG" dataSource={syllabus.cachDanhGias} columns={cdgCols} pagination={false} size="small" />
                  ) : (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có cách đánh giá" />
                  ),
              },
            ]}
          />
        </div>
      )}

      {selectedId && !syllabus && !loadingSyllabus && (
        <Card style={{ marginTop: 24, textAlign: "center", borderRadius: 12 }}>
          <Empty description="Không tải được dữ liệu đề cương" />
        </Card>
      )}

      <Modal
        open={editOpen}
        title="Sửa đề cương chi tiết"
        onCancel={() => setEditOpen(false)}
        onOk={async () => {
          if (!selectedId) return;
          const v = await editForm.validateFields();
          updateMut.mutate({
            id: selectedId,
            payload: {
              phienBan: v.phienBan,
              trangThai: v.trangThai,
              ngayApDung: v.ngayApDung ? v.ngayApDung.format("YYYY-MM-DD") : undefined,
              ghiChu: v.ghiChu ?? undefined,
            },
          });
        }}
        confirmLoading={updateMut.isPending}
        destroyOnHidden
        width={560}
      >
        <Form form={editForm} layout="vertical">
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item
              label="Phiên bản"
              name="phienBan"
              rules={[{ required: true, message: "Nhập phiên bản" }]}
              style={{ flex: 1 }}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Trạng thái" name="trangThai" style={{ width: 200 }}>
              <Select options={TRANG_THAI_OPTIONS} />
            </Form.Item>
          </Space>
          <Form.Item label="Ngày áp dụng" name="ngayApDung">
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
