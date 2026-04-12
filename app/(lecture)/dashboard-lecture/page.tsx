"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertOutlined,
  BarChartOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ScheduleOutlined,
  TeamOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  Card,
  Col,
  InputNumber,
  Progress,
  Row,
  Select,
  Skeleton,
  Statistic,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getLecturerOverview,
  getScoreDistribution,
  getCloSummary,
  getCoSummary,
  getAtRiskStudents,
  getScoreMatrix,
} from "@/features/lecturer-dashboard/api";
import type {
  LecturerClassSummary,
  ScoreMatrix,
} from "@/features/lecturer-dashboard/types";

const { Title, Text } = Typography;

const BAR_PRIMARY = "#1677ff";
const CHART_GRID = "#f0f0f0";
const tooltipStyle = {
  borderRadius: 8,
  border: "none",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
};

function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card
      variant="borderless"
      title={<span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>}
      style={{ borderRadius: 12, height: "100%", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
      styles={{ body: { height: 340, padding: "12px 20px 20px" } }}
    >
      {children}
    </Card>
  );
}

function KpiCard({ title, value, icon, accent, suffix }: {
  title: string;
  value: number | string;
  icon: ReactNode;
  accent: string;
  suffix?: string;
}) {
  return (
    <Card
      variant="borderless"
      style={{ borderRadius: 12, height: "100%", boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
      styles={{ body: { padding: "18px 20px" } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 46, height: 46, borderRadius: 12,
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text type="secondary" style={{ fontSize: 13, display: "block", marginBottom: 2 }}>
            {title}
          </Text>
          <Statistic
            value={value}
            suffix={suffix}
            styles={{ content: { fontSize: 24, fontWeight: 600, lineHeight: 1.25, color: "rgba(0,0,0,0.88)" } }}
          />
        </div>
      </div>
    </Card>
  );
}

export default function LectureDashboardPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [nguongDat, setNguongDat] = useState(0.5);

  const { data: overview, isLoading: loadingOverview } = useQuery({
    queryKey: ["lecturer-overview"],
    queryFn: () => getLecturerOverview(),
  });

  const classes = overview?.classes ?? [];
  const activeClass = selectedClass ?? classes[0]?.maLopHocPhan ?? null;

  const { data: scoreDist } = useQuery({
    queryKey: ["lecturer-score-dist", activeClass],
    queryFn: () => getScoreDistribution(activeClass!),
    enabled: !!activeClass,
  });

  const { data: cloSummary } = useQuery({
    queryKey: ["lecturer-clo-summary", activeClass, nguongDat],
    queryFn: () => getCloSummary(activeClass!, { nguongDat }),
    enabled: !!activeClass,
  });

  const { data: coSummary } = useQuery({
    queryKey: ["lecturer-co-summary", activeClass, nguongDat],
    queryFn: () => getCoSummary(activeClass!, { nguongDat }),
    enabled: !!activeClass,
  });

  const { data: atRisk } = useQuery({
    queryKey: ["lecturer-at-risk", activeClass, nguongDat],
    queryFn: () => getAtRiskStudents(activeClass!, { nguongDat }),
    enabled: !!activeClass,
  });

  const { data: scoreMatrix } = useQuery({
    queryKey: ["lecturer-score-matrix", activeClass],
    queryFn: () => getScoreMatrix(activeClass!),
    enabled: !!activeClass,
  });

  const initialLoad = loadingOverview && !overview;

  const classColumns: ColumnsType<LecturerClassSummary> = [
    { title: "Lớp HP", dataIndex: "maLopHocPhan", width: 200, render: (v: string) => <Tag>{v}</Tag> },
    { title: "Học phần", dataIndex: "tenHocPhan", ellipsis: true },
    { title: "TC", dataIndex: "soTinChi", width: 60, align: "center" },
    { title: "Khóa", dataIndex: "khoa", width: 70, align: "center" },
    { title: "HK", dataIndex: "hocKy", width: 60, align: "center" },
    { title: "SV", dataIndex: "enrolledCount", width: 70, align: "center" },
    {
      title: "Tiến trình nhập điểm",
      dataIndex: "scoreProgress",
      width: 180,
      render: (v: number) => <Progress percent={Math.round(v * 100)} size="small" />,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 100,
      render: (v: string) => <Tag color={v === "open" ? "green" : "default"}>{v ?? "-"}</Tag>,
    },
  ];

  const matrixColumns: ColumnsType<ScoreMatrix["rows"][number]> = [
    { title: "MSSV", dataIndex: "MSSV", width: 120, fixed: "left" },
    { title: "Họ tên", dataIndex: "hoTen", width: 180, fixed: "left", ellipsis: true },
    ...(scoreMatrix?.columns ?? []).map((col) => ({
      title: `${col.tenThanhPhan} (${(col.trongSo * 100).toFixed(0)}%)`,
      dataIndex: col.maCDG,
      width: 130,
      align: "center" as const,
      render: (_: unknown, row: ScoreMatrix["rows"][number]) => {
        const s = row.scores.find((sc) => sc.maCDG === col.maCDG);
        return s ? <span>{s.diem}</span> : <Text type="secondary">-</Text>;
      },
    })),
    { title: "Tổng điểm", dataIndex: "tongDiem", width: 100, align: "center" as const },
  ];

  return (
    <div style={{ padding: "8px 0 24px", maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 28, padding: "22px 24px", borderRadius: 12,
          background: "linear-gradient(135deg, rgba(22,119,255,0.08) 0%, rgba(114,46,209,0.06) 100%)",
          border: "1px solid rgba(22,119,255,0.12)",
        }}
      >
        <Title level={3} style={{ marginBottom: 6, marginTop: 0 }}>Dashboard Giảng viên</Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Tổng quan lớp phụ trách, tiến trình nhập điểm và kết quả OBE
        </Text>
      </div>

      {initialLoad ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Col xs={24} sm={12} md={6} key={i}>
              <Card style={{ borderRadius: 12 }}><Skeleton active paragraph={{ rows: 1 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
          <Col xs={24} sm={12} md={6}>
            <KpiCard title="Lớp phụ trách" value={overview?.totalClasses ?? 0} icon={<ScheduleOutlined />} accent="#1677ff" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <KpiCard title="Tổng sinh viên" value={overview?.totalStudents ?? 0} icon={<TeamOutlined />} accent="#52c41a" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <KpiCard title="Điểm đã nhập" value={`${overview?.totalScoresEntered ?? 0}/${overview?.totalExpectedScores ?? 0}`} icon={<BookOutlined />} accent="#722ed1" />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <KpiCard title="Tiến trình tổng" value={Math.round((overview?.overallProgress ?? 0) * 100)} icon={<BarChartOutlined />} accent="#fa8c16" suffix="%" />
          </Col>
        </Row>
      )}

      <Card
        title={<span style={{ fontWeight: 600, fontSize: 15 }}>Danh sách lớp phụ trách</span>}
        style={{ marginTop: 16, borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
      >
        <Table
          rowKey="maLopHocPhan"
          loading={loadingOverview}
          columns={classColumns}
          dataSource={classes}
          pagination={{ pageSize: 5, showSizeChanger: false }}
          size="middle"
          onRow={(record) => ({
            onClick: () => setSelectedClass(record.maLopHocPhan),
            style: { cursor: "pointer", background: record.maLopHocPhan === activeClass ? "rgba(22,119,255,0.04)" : undefined },
          })}
        />
      </Card>

      {activeClass && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0 16px" }}>
            <Title level={5} style={{ margin: 0, color: "rgba(0,0,0,0.65)" }}>
              Chi tiết lớp:
            </Title>
            <Select
              value={activeClass}
              onChange={setSelectedClass}
              style={{ minWidth: 280 }}
              options={classes.map((c) => ({
                value: c.maLopHocPhan,
                label: `${c.maLopHocPhan} - ${c.tenHocPhan}`,
              }))}
            />
            <Text type="secondary">Ngưỡng đạt:</Text>
            <InputNumber
              min={0} max={1} step={0.1} value={nguongDat}
              onChange={(v) => setNguongDat(v ?? 0.5)}
              style={{ width: 80 }}
            />
          </div>

          <Row gutter={[16, 16]}>
            <Col xs={24} xl={12}>
              <ChartCard title="Phân bố điểm theo thành phần">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scoreDist?.distributions ?? []}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="tenThanhPhan" tick={{ fontSize: 11 }} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="avg" name="TB" fill={BAR_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
            <Col xs={24} xl={12}>
              <ChartCard title="Tỷ lệ đạt CLO">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={cloSummary?.clos ?? []}
                    margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="code" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={50} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `${(v * 100).toFixed(1)}%`} />
                    <Bar dataKey="passRate" name="Tỷ lệ đạt" fill="#52c41a" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} xl={12}>
              <Card
                title={<span style={{ fontWeight: 600, fontSize: 15 }}><CheckCircleOutlined /> Tóm tắt CO</span>}
                style={{ borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Table
                  rowKey="maCO"
                  dataSource={coSummary?.cos ?? []}
                  pagination={false}
                  size="small"
                  columns={[
                    { title: "CO", dataIndex: "code", width: 80 },
                    { title: "Nội dung", dataIndex: "noiDung", ellipsis: true },
                    { title: "TB đạt", dataIndex: "avgTiLeDat", width: 90, align: "center", render: (v: number) => `${(v * 100).toFixed(1)}%` },
                    {
                      title: "Tỷ lệ đạt",
                      dataIndex: "passRate",
                      width: 100,
                      align: "center",
                      render: (v: number) => (
                        <Tag color={v >= nguongDat ? "green" : "red"}>
                          {(v * 100).toFixed(1)}%
                        </Tag>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>
            <Col xs={24} xl={12}>
              <Card
                title={
                  <span style={{ fontWeight: 600, fontSize: 15 }}>
                    <AlertOutlined style={{ color: "#ff4d4f" }} /> Sinh viên có nguy cơ ({atRisk?.atRiskCount ?? 0}/{atRisk?.totalEnrolled ?? 0})
                  </span>
                }
                style={{ borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                <Table
                  rowKey="MSSV"
                  dataSource={atRisk?.students ?? []}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  size="small"
                  columns={[
                    { title: "MSSV", dataIndex: "MSSV", width: 120 },
                    { title: "Họ tên", dataIndex: "hoTen", ellipsis: true },
                    { title: "TB CO", dataIndex: "avgCO", width: 90, align: "center", render: (v: number) => <Tag color="red">{(v * 100).toFixed(1)}%</Tag> },
                    { title: "CO rớt", dataIndex: "failedCOCount", width: 80, align: "center" },
                    { title: "CLO rớt", dataIndex: "failedCLOCount", width: 80, align: "center" },
                  ]}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title={
              <span style={{ fontWeight: 600, fontSize: 15 }}>
                <TrophyOutlined /> Bảng điểm tổng hợp
              </span>
            }
            style={{ marginTop: 16, borderRadius: 12, boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
          >
            <Table
              rowKey="MSSV"
              loading={!scoreMatrix}
              columns={matrixColumns}
              dataSource={scoreMatrix?.rows ?? []}
              pagination={{ pageSize: 10, showSizeChanger: true }}
              size="small"
              scroll={{ x: "max-content" }}
            />
          </Card>
        </>
      )}
    </div>
  );
}
