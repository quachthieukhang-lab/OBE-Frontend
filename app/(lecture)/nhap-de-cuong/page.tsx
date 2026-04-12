"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Steps,
  Table,
  Tabs,
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
  MyAssignment,
} from "@/features/lecturer-de-cuong/types";
import {
  listMyAssignments,
  updateAssignmentStatus,
  createSyllabusFromAssignment,
  getSyllabus,
  listClo,
  createClo,
  updateClo,
  deleteClo,
  listCo,
  createCo,
  updateCo,
  deleteCo,
  listCachDanhGia,
  createCachDanhGia,
  updateCachDanhGia,
  deleteCachDanhGia,
} from "@/features/lecturer-de-cuong/api";

const { Title, Text } = Typography;

const STATUS_COLOR: Record<string, string> = {
  assigned: "blue",
  in_progress: "orange",
  completed: "green",
};
const STATUS_LABEL: Record<string, string> = {
  assigned: "Đã phân công",
  in_progress: "Đang thực hiện",
  completed: "Hoàn thành",
};
const STATUS_STEP: Record<string, number> = {
  assigned: 0,
  in_progress: 1,
  completed: 2,
};

const LOAI_OPTIONS = [
  { label: "quiz", value: "quiz" },
  { label: "assignment", value: "assignment" },
  { label: "project", value: "project" },
  { label: "midterm", value: "midterm" },
  { label: "final", value: "final" },
  { label: "other", value: "other" },
];

export default function NhapDeCuongPage() {
  const qc = useQueryClient();

  const [selected, setSelected] = useState<MyAssignment | null>(null);
  const [createDcOpen, setCreateDcOpen] = useState(false);
  const [dcForm] = Form.useForm<any>();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["lecturer-assignments"],
    queryFn: listMyAssignments,
  });

  const maDeCuong = selected?.deCuong?.maDeCuong ?? null;

  const { data: syllabus } = useQuery({
    queryKey: ["lecturer-syllabus", maDeCuong],
    queryFn: () => getSyllabus(maDeCuong!),
    enabled: !!maDeCuong,
  });

  // ── Mutations cho phân công ────────────────────────────────

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateAssignmentStatus(id, { trangThai: status }),
    onSuccess: async () => {
      message.success("Cập nhật trạng thái thành công");
      await qc.invalidateQueries({ queryKey: ["lecturer-assignments"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Cập nhật thất bại"),
  });

  const createDcMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { phienBan: string; ngayApDung?: string; ghiChu?: string };
    }) => createSyllabusFromAssignment(id, payload),
    onSuccess: async (data) => {
      message.success("Tạo đề cương thành công");
      setCreateDcOpen(false);
      dcForm.resetFields();
      await qc.invalidateQueries({ queryKey: ["lecturer-assignments"] });
      if (selected) {
        setSelected({ ...selected, deCuong: data });
      }
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Tạo đề cương thất bại"),
  });

  // ── Columns cho danh sách phân công ───────────────────────

  const assignCols: ColumnsType<MyAssignment> = [
    {
      title: "Học phần",
      dataIndex: "hocPhan",
      render: (hp) =>
        hp ? `${hp.tenHocPhan} (${hp.maHocPhan})` : selected?.maHocPhan ?? "-",
      ellipsis: true,
    },
    {
      title: "CTĐT",
      dataIndex: "ctdtNienKhoa",
      width: 200,
      render: (v) =>
        v?.chuongTrinhDaoTao?.tenTiengViet
          ? `${v.chuongTrinhDaoTao.tenTiengViet} (K${v.khoa})`
          : `${selected?.maSoNganh ?? "-"} K${selected?.khoa ?? "-"}`,
      ellipsis: true,
    },
    {
      title: "Vai trò",
      dataIndex: "vaiTro",
      width: 120,
      render: (v) => <Tag>{v}</Tag>,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      width: 140,
      render: (v: string) => (
        <Tag color={STATUS_COLOR[v] ?? "default"}>
          {STATUS_LABEL[v] ?? v}
        </Tag>
      ),
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      width: 120,
      render: (v) => (v ? dayjs(v).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Đề cương",
      key: "dc",
      width: 120,
      render: (_, row) =>
        row.deCuong ? (
          <Tag color="green">{row.deCuong.phienBan}</Tag>
        ) : (
          <Tag>Chưa tạo</Tag>
        ),
    },
  ];

  // ── Render ────────────────────────────────────────────────

  if (!selected) {
    return (
      <div style={{ padding: 24 }}>
        <Title level={4} style={{ marginBottom: 16 }}>
          Phân công nhập đề cương
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Chọn một phân công để bắt đầu nhập đề cương chi tiết
        </Text>
        <Table
          rowKey="maBanPhanCong"
          loading={isLoading}
          columns={assignCols}
          dataSource={assignments}
          pagination={{ pageSize: 10 }}
          onRow={(row) => ({
            onClick: () => setSelected(row),
            style: { cursor: "pointer" },
          })}
        />
      </div>
    );
  }

  const nextStatus =
    selected.trangThai === "assigned"
      ? "in_progress"
      : selected.trangThai === "in_progress"
        ? "completed"
        : null;

  return (
    <div style={{ padding: 24 }}>
      <Space style={{ marginBottom: 16 }}>
        <Button onClick={() => setSelected(null)}>← Quay lại</Button>
        <Title level={4} style={{ margin: 0 }}>
          {selected.hocPhan?.tenHocPhan ?? selected.maHocPhan}
        </Title>
      </Space>

      <Card style={{ marginBottom: 16, borderRadius: 12 }}>
        <Row gutter={24}>
          <Col span={16}>
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Mã học phần">
                {selected.maHocPhan}
              </Descriptions.Item>
              <Descriptions.Item label="Vai trò">
                <Tag>{selected.vaiTro}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="CTĐT">
                {selected.ctdtNienKhoa?.chuongTrinhDaoTao?.tenTiengViet ??
                  selected.maSoNganh}{" "}
                (K{selected.khoa})
              </Descriptions.Item>
              <Descriptions.Item label="Deadline">
                {selected.deadline
                  ? dayjs(selected.deadline).format("DD/MM/YYYY")
                  : "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Ghi chú">
                {selected.ghiChu ?? "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Đề cương">
                {selected.deCuong ? (
                  <Tag color="green">{selected.deCuong.phienBan}</Tag>
                ) : (
                  <Tag>Chưa tạo</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Col>
          <Col span={8}>
            <Steps
              current={STATUS_STEP[selected.trangThai] ?? 0}
              size="small"
              items={[
                { title: "Phân công" },
                { title: "Đang thực hiện" },
                { title: "Hoàn thành" },
              ]}
            />
            <div style={{ marginTop: 12, textAlign: "right" }}>
              {!selected.deCuong && (
                <Button
                  type="primary"
                  onClick={() => {
                    dcForm.resetFields();
                    setCreateDcOpen(true);
                  }}
                  style={{ marginRight: 8 }}
                >
                  Tạo đề cương
                </Button>
              )}
              {nextStatus && (
                <Button
                  onClick={() =>
                    statusMut.mutate({
                      id: selected.maBanPhanCong,
                      status: nextStatus,
                    })
                  }
                  loading={statusMut.isPending}
                >
                  Chuyển → {STATUS_LABEL[nextStatus]}
                </Button>
              )}
            </div>
          </Col>
        </Row>
      </Card>

      {maDeCuong ? (
        <Tabs
          type="card"
          items={[
            {
              key: "overview",
              label: "Tổng quan",
              children: <OverviewTab maDeCuong={maDeCuong} />,
            },
            {
              key: "clo",
              label: (
                <Badge
                  count={syllabus?.clos?.length ?? 0}
                  size="small"
                  offset={[8, 0]}
                >
                  CLO
                </Badge>
              ),
              children: <CloTab maDeCuong={maDeCuong} />,
            },
            {
              key: "co",
              label: (
                <Badge
                  count={syllabus?.cos?.length ?? 0}
                  size="small"
                  offset={[8, 0]}
                >
                  CO
                </Badge>
              ),
              children: <CoTab maDeCuong={maDeCuong} />,
            },
            {
              key: "cdg",
              label: (
                <Badge
                  count={syllabus?.cachDanhGias?.length ?? 0}
                  size="small"
                  offset={[8, 0]}
                >
                  Cách đánh giá
                </Badge>
              ),
              children: <CdgTab maDeCuong={maDeCuong} />,
            },
          ]}
        />
      ) : (
        <Card style={{ textAlign: "center", padding: 40, borderRadius: 12 }}>
          <Text type="secondary">
            Vui lòng tạo đề cương trước khi nhập CLO, CO, Cách đánh giá
          </Text>
        </Card>
      )}

      <Modal
        open={createDcOpen}
        title="Tạo đề cương chi tiết"
        onCancel={() => setCreateDcOpen(false)}
        onOk={async () => {
          const v = await dcForm.validateFields();
          createDcMut.mutate({
            id: selected.maBanPhanCong,
            payload: {
              phienBan: v.phienBan,
              ngayApDung: v.ngayApDung ?? undefined,
              ghiChu: v.ghiChu ?? undefined,
            },
          });
        }}
        confirmLoading={createDcMut.isPending}
        destroyOnHidden
      >
        <Form form={dcForm} layout="vertical">
          <Form.Item
            label="Phiên bản"
            name="phienBan"
            rules={[{ required: true, message: "Nhập phiên bản" }]}
          >
            <Input placeholder="VD: 2024-v1" />
          </Form.Item>
          <Form.Item label="Ngày áp dụng" name="ngayApDung">
            <Input placeholder="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab Tổng quan
// ═══════════════════════════════════════════════════════════

const DC_TRANG_THAI_COLOR: Record<string, string> = {
  draft: "default",
  active: "green",
  archived: "red",
};
const DC_TRANG_THAI_LABEL: Record<string, string> = {
  draft: "Bản nháp",
  active: "Đang sử dụng",
  archived: "Đã lưu trữ",
};

function OverviewTab({ maDeCuong }: { maDeCuong: string }) {
  const { data: dc, isLoading } = useQuery({
    queryKey: ["lecturer-syllabus", maDeCuong],
    queryFn: () => getSyllabus(maDeCuong),
  });

  if (isLoading || !dc) {
    return <Card loading style={{ borderRadius: 12 }} />;
  }

  const cloCols: ColumnsType<CLO> = [
    { title: "#", width: 50, render: (_, __, i) => i + 1 },
    { title: "Code", dataIndex: "code", width: 100, render: (v) => v ?? "-" },
    { title: "Nội dung chuẩn đầu ra", dataIndex: "noiDungChuanDauRa" },
  ];

  const coCols: ColumnsType<CO> = [
    { title: "#", width: 50, render: (_, __, i) => i + 1 },
    { title: "Code", dataIndex: "code", width: 100, render: (v) => v ?? "-" },
    { title: "Nội dung chuẩn đầu ra", dataIndex: "noiDungChuanDauRa" },
  ];

  const cdgCols: ColumnsType<CachDanhGia> = [
    { title: "#", width: 50, render: (_, __, i) => i + 1 },
    { title: "Tên thành phần", dataIndex: "tenThanhPhan", width: 200 },
    { title: "Cách đánh giá", dataIndex: "cachDanhGia", render: (v) => v ?? "-" },
    { title: "Loại", dataIndex: "loai", width: 120, render: (v) => v ? <Tag>{v}</Tag> : "-" },
    { title: "Trọng số", dataIndex: "trongSo", width: 100, render: (v) => <Tag color="blue">{v}</Tag> },
  ];

  const trongSoTotal = (dc.cachDanhGias ?? []).reduce(
    (sum, c) => sum + Number(c.trongSo || 0),
    0,
  );

  return (
    <div>
      <Card
        title="Thông tin đề cương"
        style={{ borderRadius: 12, marginBottom: 16 }}
        size="small"
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="Mã đề cương">
            <Text copyable style={{ fontSize: 12 }}>{dc.maDeCuong}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Học phần">
            {dc.hocPhan
              ? `${dc.hocPhan.tenHocPhan} (${dc.hocPhan.maHocPhan})`
              : dc.maHocPhan}
          </Descriptions.Item>
          <Descriptions.Item label="Phiên bản">
            <Tag color="blue">{dc.phienBan}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <Tag color={DC_TRANG_THAI_COLOR[dc.trangThai] ?? "default"}>
              {DC_TRANG_THAI_LABEL[dc.trangThai] ?? dc.trangThai}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Ngày áp dụng">
            {dc.ngayApDung ? dayjs(dc.ngayApDung).format("DD/MM/YYYY") : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Ghi chú">
            {dc.ghiChu ?? "-"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="CLO"
              value={dc.clos?.length ?? 0}
              valueStyle={{ color: "#1677ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="CO"
              value={dc.cos?.length ?? 0}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" style={{ borderRadius: 12, textAlign: "center" }}>
            <Statistic
              title="Cách đánh giá"
              value={dc.cachDanhGias?.length ?? 0}
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

      <Card
        title={`CLO — Chuẩn đầu ra học phần (${dc.clos?.length ?? 0})`}
        size="small"
        style={{ borderRadius: 12, marginBottom: 16 }}
      >
        <Table
          rowKey="maCLO"
          dataSource={dc.clos ?? []}
          columns={cloCols}
          pagination={false}
          size="small"
          locale={{ emptyText: "Chưa có CLO nào" }}
        />
      </Card>

      <Card
        title={`CO — Mục tiêu học phần (${dc.cos?.length ?? 0})`}
        size="small"
        style={{ borderRadius: 12, marginBottom: 16 }}
      >
        <Table
          rowKey="maCO"
          dataSource={dc.cos ?? []}
          columns={coCols}
          pagination={false}
          size="small"
          locale={{ emptyText: "Chưa có CO nào" }}
        />
      </Card>

      <Card
        title={`Cách đánh giá (${dc.cachDanhGias?.length ?? 0})`}
        size="small"
        style={{ borderRadius: 12 }}
      >
        <Table
          rowKey="maCDG"
          dataSource={dc.cachDanhGias ?? []}
          columns={cdgCols}
          pagination={false}
          size="small"
          locale={{ emptyText: "Chưa có cách đánh giá nào" }}
        />
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab CLO
// ═══════════════════════════════════════════════════════════

function CloTab({ maDeCuong }: { maDeCuong: string }) {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CLO | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["lecturer-clo", maDeCuong],
    queryFn: () => listClo(maDeCuong),
  });

  const createMut = useMutation({
    mutationFn: (p: { code?: string; noiDungChuanDauRa: string }) =>
      createClo(maDeCuong, p),
    onSuccess: async () => {
      message.success("Tạo CLO thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["lecturer-clo", maDeCuong] });
      await qc.invalidateQueries({ queryKey: ["lecturer-syllabus"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{ code: string; noiDungChuanDauRa: string }>;
    }) => updateClo(maDeCuong, id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["lecturer-clo", maDeCuong] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteClo(maDeCuong, id),
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["lecturer-clo", maDeCuong] });
      await qc.invalidateQueries({ queryKey: ["lecturer-syllabus"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const columns: ColumnsType<CLO> = [
    { title: "Code", dataIndex: "code", width: 100, render: (v) => v ?? "-" },
    {
      title: "Nội dung chuẩn đầu ra",
      dataIndex: "noiDungChuanDauRa",
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditing(row);
              form.setFieldsValue(row);
              setOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa CLO?"
            onConfirm={() => deleteMut.mutate(row.maCLO)}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12, textAlign: "right" }}>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Thêm CLO
        </Button>
      </div>
      <Table
        rowKey="maCLO"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="small"
      />
      <Modal
        open={open}
        title={editing ? "Sửa CLO" : "Tạo CLO"}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          if (editing) {
            updateMut.mutate({ id: editing.maCLO, payload: v });
          } else {
            createMut.mutate(v);
          }
        }}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Code" name="code">
            <Input placeholder="VD: CLO1" />
          </Form.Item>
          <Form.Item
            label="Nội dung chuẩn đầu ra"
            name="noiDungChuanDauRa"
            rules={[{ required: true, message: "Nhập nội dung" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab CO
// ═══════════════════════════════════════════════════════════

function CoTab({ maDeCuong }: { maDeCuong: string }) {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CO | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["lecturer-co", maDeCuong],
    queryFn: () => listCo(maDeCuong),
  });

  const createMut = useMutation({
    mutationFn: (p: { code?: string; noiDungChuanDauRa: string }) =>
      createCo(maDeCuong, p),
    onSuccess: async () => {
      message.success("Tạo CO thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["lecturer-co", maDeCuong] });
      await qc.invalidateQueries({ queryKey: ["lecturer-syllabus"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{ code: string; noiDungChuanDauRa: string }>;
    }) => updateCo(maDeCuong, id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["lecturer-co", maDeCuong] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCo(maDeCuong, id),
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["lecturer-co", maDeCuong] });
      await qc.invalidateQueries({ queryKey: ["lecturer-syllabus"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const columns: ColumnsType<CO> = [
    { title: "Code", dataIndex: "code", width: 100, render: (v) => v ?? "-" },
    {
      title: "Nội dung chuẩn đầu ra",
      dataIndex: "noiDungChuanDauRa",
      ellipsis: true,
    },
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditing(row);
              form.setFieldsValue(row);
              setOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa CO?"
            onConfirm={() => deleteMut.mutate(row.maCO)}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12, textAlign: "right" }}>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setOpen(true);
          }}
        >
          Thêm CO
        </Button>
      </div>
      <Table
        rowKey="maCO"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="small"
      />
      <Modal
        open={open}
        title={editing ? "Sửa CO" : "Tạo CO"}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          if (editing) {
            updateMut.mutate({ id: editing.maCO, payload: v });
          } else {
            createMut.mutate(v);
          }
        }}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Code" name="code">
            <Input placeholder="VD: CO1" />
          </Form.Item>
          <Form.Item
            label="Nội dung chuẩn đầu ra"
            name="noiDungChuanDauRa"
            rules={[{ required: true, message: "Nhập nội dung" }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// Tab Cách đánh giá
// ═══════════════════════════════════════════════════════════

function CdgTab({ maDeCuong }: { maDeCuong: string }) {
  const qc = useQueryClient();
  const [form] = Form.useForm<any>();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CachDanhGia | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["lecturer-cdg", maDeCuong],
    queryFn: () => listCachDanhGia(maDeCuong),
  });

  const createMut = useMutation({
    mutationFn: (p: {
      tenThanhPhan: string;
      trongSo: string;
      loai?: string;
      cachDanhGia?: string;
    }) => createCachDanhGia(maDeCuong, p),
    onSuccess: async () => {
      message.success("Tạo thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["lecturer-cdg", maDeCuong] });
      await qc.invalidateQueries({ queryKey: ["lecturer-syllabus"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const updateMut = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<{
        tenThanhPhan: string;
        trongSo: string;
        loai: string;
        cachDanhGia: string;
      }>;
    }) => updateCachDanhGia(maDeCuong, id, payload),
    onSuccess: async () => {
      message.success("Cập nhật thành công");
      setOpen(false);
      form.resetFields();
      await qc.invalidateQueries({ queryKey: ["lecturer-cdg", maDeCuong] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteCachDanhGia(maDeCuong, id),
    onSuccess: async () => {
      message.success("Đã xóa");
      await qc.invalidateQueries({ queryKey: ["lecturer-cdg", maDeCuong] });
      await qc.invalidateQueries({ queryKey: ["lecturer-syllabus"] });
    },
    onError: (e: any) =>
      message.error(e?.response?.data?.message ?? "Thất bại"),
  });

  const columns: ColumnsType<CachDanhGia> = [
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
    {
      title: "Hành động",
      key: "actions",
      width: 200,
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditing(row);
              form.setFieldsValue({
                ...row,
                trongSo: Number(row.trongSo),
              });
              setOpen(true);
            }}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Xóa?"
            onConfirm={() => deleteMut.mutate(row.maCDG)}
          >
            <Button size="small" danger>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div style={{ marginBottom: 12, textAlign: "right" }}>
        <Button
          type="primary"
          onClick={() => {
            setEditing(null);
            form.resetFields();
            form.setFieldsValue({ trongSo: 0 });
            setOpen(true);
          }}
        >
          Thêm Cách đánh giá
        </Button>
      </div>
      <Table
        rowKey="maCDG"
        loading={isLoading}
        columns={columns}
        dataSource={rows}
        pagination={false}
        size="small"
      />
      <Modal
        open={open}
        title={editing ? "Sửa Cách đánh giá" : "Tạo Cách đánh giá"}
        onCancel={() => setOpen(false)}
        onOk={async () => {
          const v = await form.validateFields();
          const data = {
            tenThanhPhan: v.tenThanhPhan,
            trongSo: String(v.trongSo ?? 0),
            loai: v.loai ?? undefined,
            cachDanhGia: v.cachDanhGia ?? undefined,
          };
          if (editing) {
            updateMut.mutate({ id: editing.maCDG, payload: data });
          } else {
            createMut.mutate(data);
          }
        }}
        confirmLoading={createMut.isPending || updateMut.isPending}
        destroyOnHidden
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tên thành phần"
            name="tenThanhPhan"
            rules={[{ required: true, message: "Nhập tên" }]}
          >
            <Input placeholder="VD: Bài tập lớn" />
          </Form.Item>
          <Form.Item label="Cách đánh giá" name="cachDanhGia">
            <Input placeholder="VD: Nộp báo cáo + demo" />
          </Form.Item>
          <Space style={{ width: "100%" }} size={12}>
            <Form.Item label="Loại" name="loai" style={{ flex: 1 }}>
              <Select allowClear options={LOAI_OPTIONS} />
            </Form.Item>
            <Form.Item
              label="Trọng số"
              name="trongSo"
              rules={[{ required: true, message: "Nhập trọng số" }]}
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                max={1}
                step={0.01}
                style={{ width: "100%" }}
                stringMode
              />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
}
