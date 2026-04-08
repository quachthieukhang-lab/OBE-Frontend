"use client";

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BookOutlined,
  ClockCircleOutlined,
  FileDoneOutlined,
  PlayCircleOutlined,
  ReadOutlined,
  ScheduleOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Skeleton, Statistic, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { http } from "@/lib/api/http";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

type DashboardResponse = {
  overview: {
    totalPrograms: number;
    totalCourses: number;
    totalLecturers: number;
    totalStudents: number;
    totalClasses: number;
    totalAssignments: number;
    openClasses: number;
    pendingAssignments: number;
  };
  charts: {
    coursesByProgram: Array<{
      maSoNganh: string;
      tenTiengViet: string;
      totalHocPhan: number;
    }>;
    studentsByKhoa: Array<{
      khoa: number | null;
      totalStudents: number;
    }>;
    classesByHocKy: Array<{
      hocKy: number | null;
      totalClasses: number;
    }>;
    assignmentsByStatus: Array<{
      trangThai: string | null;
      total: number;
    }>;
  };
};

async function getDashboardAdmin() {
  const res = await http.get<DashboardResponse>("/dashboard-admin");
  return res.data;
}

const BAR_PRIMARY = "#1677ff";
const BAR_SECONDARY = "#722ed1";
const CHART_GRID = "#f0f0f0";

const PIE_COLORS = ["#1677ff", "#52c41a", "#faad14", "#ff4d4f", "#722ed1", "#13c2c2"];

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card
      bordered={false}
      title={<span style={{ fontWeight: 600, fontSize: 15 }}>{title}</span>}
      style={{
        borderRadius: 12,
        height: "100%",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
      }}
      styles={{ body: { height: 340, padding: "12px 20px 20px" } }}
    >
      {children}
    </Card>
  );
}

function KpiCard({
  title,
  value,
  icon,
  accent,
  onClick,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  accent: string;
  onClick?: () => void;
}) {
  return (
    <Card
      bordered={false}
      hoverable
      onClick={onClick}
      style={{
        borderRadius: 12,
        height: "100%",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        cursor: onClick ? "pointer" : "default",
      }}
      styles={{ body: { padding: "18px 20px" } }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 12,
            background: `color-mix(in srgb, ${accent} 14%, transparent)`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <Text
            type="secondary"
            style={{ fontSize: 13, display: "block", marginBottom: 2, lineHeight: 1.35 }}
          >
            {title}
          </Text>
          <Statistic
            value={value}
            valueStyle={{
              fontSize: 24,
              fontWeight: 600,
              lineHeight: 1.25,
              color: "rgba(0, 0, 0, 0.88)",
            }}
          />
        </div>
      </div>
    </Card>
  );
}

const tooltipStyle = {
  borderRadius: 8,
  border: "none",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
};

export default function DashboardAdminPage() {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-admin"],
    queryFn: getDashboardAdmin,
  });

  const overview = data?.overview;
  const charts = data?.charts;
  const initialLoad = isLoading && !data;

  const programColumns: ColumnsType<
    DashboardResponse["charts"]["coursesByProgram"][number]
  > = [
    {
      title: "Mã ngành",
      dataIndex: "maSoNganh",
      width: 120,
      render: (v: string) => <Tag>{v}</Tag>,
    },
    {
      title: "Chương trình đào tạo",
      dataIndex: "tenTiengViet",
      ellipsis: true,
    },
    {
      title: "Số học phần",
      dataIndex: "totalHocPhan",
      width: 130,
      align: "right",
      render: (v: number) => <Tag color="blue">{v}</Tag>,
    },
  ];

  const pieData = charts?.assignmentsByStatus ?? [];

  return (
    <div style={{ padding: "8px 0 24px", maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 28,
          padding: "22px 24px",
          borderRadius: 12,
          background: "linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(114, 46, 209, 0.06) 100%)",
          border: "1px solid rgba(22, 119, 255, 0.12)",
        }}
      >
        <Title level={3} style={{ marginBottom: 6, marginTop: 0 }}>
          Dashboard OBE
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          Tổng quan hệ thống OBE — chương trình, học phần, lớp và phân công đề cương
        </Text>
      </div>

      {initialLoad ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Col xs={24} sm={12} md={8} lg={6} key={i}>
              <Card variant={false} style={{ borderRadius: 12 }}>
                <Skeleton active paragraph={{ rows: 1 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KpiCard
              title="Chương trình đào tạo"
              value={overview?.totalPrograms ?? 0}
              icon={<ReadOutlined />}
              accent="#1677ff"
              onClick={() => router.push("/chuong-trinh-dao-tao")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KpiCard
              title="Học phần"
              value={overview?.totalCourses ?? 0}
              icon={<BookOutlined />}
              accent="#13c2c2"
              onClick={() => router.push("/hoc-phan")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KpiCard
              title="Giảng viên"
              value={overview?.totalLecturers ?? 0}
              icon={<TeamOutlined />}
              accent="#722ed1"
              onClick={() => router.push("/giang-vien")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KpiCard
              title="Sinh viên"
              value={overview?.totalStudents ?? 0}
              icon={<UserOutlined />}
              accent="#52c41a"
              onClick={() => router.push("/sinh-vien")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KpiCard
              title="Lớp học phần"
              value={overview?.totalClasses ?? 0}
              icon={<ScheduleOutlined />}
              accent="#fa8c16"
              onClick={() => router.push("/lop-hoc-phan")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KpiCard
              title="Phân công đề cương"
              value={overview?.totalAssignments ?? 0}
              icon={<FileDoneOutlined />}
              accent="#2f54eb"
              onClick={() => router.push("/phan-cong-de-cuong")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KpiCard
              title="Lớp đang mở"
              value={overview?.openClasses ?? 0}
              icon={<PlayCircleOutlined />}
              accent="#eb2f96"
              onClick={() => router.push("/lop-hoc-phan")}
            />
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <KpiCard
              title="Phân công chờ xử lý"
              value={overview?.pendingAssignments ?? 0}
              icon={<ClockCircleOutlined />}
              accent="#faad14"
              onClick={() => router.push("/phan-cong-de-cuong")}
            />
          </Col>
        </Row>
      )}

      <Typography.Title level={5} style={{ margin: "24px 0 16px", color: "rgba(0,0,0,0.65)" }}>
        Biểu đồ
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} xl={14}>
          <ChartCard title="Học phần theo chương trình đào tạo">
            {initialLoad ? (
              <Skeleton active style={{ marginTop: 40 }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.coursesByProgram ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="maSoNganh" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: CHART_GRID }} />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(22, 119, 255, 0.06)" }} />
                  <Bar dataKey="totalHocPhan" fill={BAR_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>

        <Col xs={24} xl={10}>
          <ChartCard title="Trạng thái phân công đề cương">
            {initialLoad ? (
              <Skeleton active style={{ marginTop: 40 }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="total"
                    nameKey="trangThai"
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={92}
                    paddingAngle={2}
                    labelLine={{ stroke: "#d9d9d9" }}
                    label={(props: { name?: string; value?: number }) =>
                      `${props.name?.trim() || "Không xác định"}: ${props.value ?? 0}`
                    }
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>

        <Col xs={24} xl={12}>
          <ChartCard title="Sinh viên theo niên khóa">
            {initialLoad ? (
              <Skeleton active style={{ marginTop: 40 }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.studentsByKhoa ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="khoa"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: CHART_GRID }}
                    tickFormatter={(v) => (v != null ? `K${v}` : "-")}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(114, 46, 209, 0.06)" }} />
                  <Bar dataKey="totalStudents" fill={BAR_SECONDARY} radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>

        <Col xs={24} xl={12}>
          <ChartCard title="Lớp học phần theo học kỳ">
            {initialLoad ? (
              <Skeleton active style={{ marginTop: 40 }} />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.classesByHocKy ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke={CHART_GRID} strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="hocKy"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: CHART_GRID }}
                    tickFormatter={(v) => (v != null ? `HK${v}` : "-")}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={40} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(22, 119, 255, 0.06)" }} />
                  <Bar dataKey="totalClasses" fill={BAR_PRIMARY} radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </Col>
      </Row>

      <Card
        title={
          <span style={{ fontWeight: 600, fontSize: 15 }}>Chi tiết học phần theo chương trình đào tạo</span>
        }
        style={{
          marginTop: 24,
          borderRadius: 12,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
        }}
      >
        <Table
          rowKey="maSoNganh"
          loading={isLoading}
          columns={programColumns}
          dataSource={charts?.coursesByProgram ?? []}
          pagination={{ pageSize: 6, showSizeChanger: false }}
          size="middle"
        />
      </Card>
    </div>
  );
}
