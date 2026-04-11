"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Col,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Statistic,
  Progress,
  Skeleton,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  WarningOutlined,
  UserOutlined,
  BarChartOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
} from "@ant-design/icons";

import { getAdminObeDashboard } from "@/features/admin-obe-dashboard/api";
import { listDonVi } from "@/features/don-vi/api";
import { listNienKhoa } from "@/features/nien-khoa/api";

const { Title, Text } = Typography;

const PRIMARY_COLOR = "#1677ff";
const DANGER_COLOR = "#ff4d4f";
const WARNING_COLOR = "#faad14";
const SUCCESS_COLOR = "#52c41a";
const GRID_COLOR = "#f0f0f0";

type DonVi = {
  maDonVi: string;
  tenDonVi: string;
};

type NienKhoa = {
  khoa: number;
  namBatDau: number;
  namKetThuc?: number | null;
};

type DashboardData = {
  config: {
    maDonVi: string;
    tenDonVi: string;
    khoa: number;
    namBatDau: number;
    namKetThuc?: number | null;
    nguongDatCaNhan: number;
    kpiLopHoc: number;
  };
  ploRadar: Array<{
    maPLO: string;
    label: string;
    noiDung?: string | null;
    avgTiLeDat: number;
    avgDiemHe10: number;
  }>;
  bottleneckCourses: Array<{
    maHocPhan: string;
    tenHocPhan: string;
    avgCloPassRate: number;
    minCloPassRate: number;
    affectedClasses: number;
  }>;
  atRiskStudents: Array<{
    MSSV: string;
    hoTen: string;
    khoa: number | null;
    namHocHienTai: number;
    avgPlo: number;
    avgDiemHe10: number;
    ploBelowThresholdCount: number;
  }>;
};

function KpiCard({
  title,
  value,
  icon,
  accent,
  suffix = "",
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
  suffix?: string;
}) {
  return (
    <Card
      bordered={false}
      style={{
        borderRadius: 12,
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
        height: "100%",
      }}
      styles={{ body: { padding: "18px 20px" } }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 10,
            background: `color-mix(in srgb, ${accent} 12%, transparent)`,
            color: accent,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
          }}
        >
          {icon}
        </div>

        <div>
          <Text type="secondary" style={{ fontSize: 13, display: "block" }}>
            {title}
          </Text>
          <Statistic
            value={value}
            suffix={suffix}
            valueStyle={{ fontSize: 22, fontWeight: 600 }}
          />
        </div>
      </div>
    </Card>
  );
}

export default function AdminObeDashboardPage() {
  const [maDonVi, setMaDonVi] = useState<string>();
  const [khoa, setKhoa] = useState<number>();
  const [hocKy, setHocKy] = useState<number | undefined>(undefined);

  const { data: donVis = [] } = useQuery({
    queryKey: ["don-vi"],
    queryFn: listDonVi,
  });

  const { data: nienKhoas = [] } = useQuery({
    queryKey: ["nien-khoa"],
    queryFn: listNienKhoa,
  });

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["admin-obe-dashboard", { maDonVi, khoa, hocKy }],
    enabled: !!maDonVi && !!khoa,
    queryFn: () =>
      getAdminObeDashboard({
        maDonVi: maDonVi!,
        khoa: khoa!,
        hocKy,
      }),
  });

  const nguongDatCaNhan = data?.config?.nguongDatCaNhan ?? 0.5;
  const kpiLopHoc = data?.config?.kpiLopHoc ?? 0.7;
  const nguongDatCaNhanHe10 = Number((nguongDatCaNhan * 10).toFixed(2));

  const radarData = useMemo(
    () =>
      data?.ploRadar.map((item) => ({
        subject: item.label,
        score: item.avgDiemHe10,
        fullMark: 10,
        threshold: nguongDatCaNhanHe10,
      })) ?? [],
    [data, nguongDatCaNhanHe10]
  );

  const bottleneckColumns: ColumnsType<DashboardData["bottleneckCourses"][number]> = [
    {
      title: "Học phần",
      key: "hocPhan",
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Text strong>{r.tenHocPhan}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {r.maHocPhan}
          </Text>
        </Space>
      ),
    },
    {
      title: "Tỷ lệ đạt CLO TB",
      dataIndex: "avgCloPassRate",
      render: (v: number) => (
        <Progress
          percent={Number((v * 100).toFixed(1))}
          size="small"
          strokeColor={
            v < nguongDatCaNhan
              ? DANGER_COLOR
              : v < kpiLopHoc
                ? WARNING_COLOR
                : SUCCESS_COLOR
          }
        />
      ),
    },
    {
      title: "CLO thấp nhất",
      dataIndex: "minCloPassRate",
      render: (v: number) => (
        <Tag
          color={
            v < nguongDatCaNhan
              ? "red"
              : v < kpiLopHoc
                ? "orange"
                : "green"
          }
        >
          {(v * 100).toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: "Lớp bị ảnh hưởng",
      dataIndex: "affectedClasses",
      align: "center",
      render: (v: number) => <Tag icon={<BookOutlined />}>{v}</Tag>,
    },
  ];

  const riskColumns: ColumnsType<DashboardData["atRiskStudents"][number]> = [
    {
      title: "Sinh viên",
      render: (_, r) => (
        <Space>
          <UserOutlined style={{ color: PRIMARY_COLOR }} />
          <div>
            <div style={{ fontWeight: 600 }}>{r.hoTen}</div>
            <div style={{ fontSize: 11, color: "#8c8c8c" }}>{r.MSSV}</div>
          </div>
        </Space>
      ),
    },
    {
      title: "Khóa",
      dataIndex: "khoa",
      render: (v: number | null) => (v ? `K${v}` : "-"),
    },
    {
      title: "Điểm PLO TB",
      dataIndex: "avgDiemHe10",
      render: (v: number) => (
        <Tag
          color={v < nguongDatCaNhanHe10 ? "red" : "orange"}
          style={{ fontWeight: "bold" }}
        >
          {v.toFixed(2)}
        </Tag>
      ),
    },
    {
      title: "Số PLO dưới ngưỡng",
      dataIndex: "ploBelowThresholdCount",
      align: "center",
    },
  ];

  return (
    <div style={{ padding: "8px 0 24px", maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: 24,
          padding: "20px 24px",
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(22, 119, 255, 0.08) 0%, rgba(114, 46, 209, 0.06) 100%)",
          border: "1px solid rgba(22, 119, 255, 0.12)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0 }}>
            Bảng phân tích OBE
          </Title>
          <Text type="secondary">
            Đánh giá chuẩn đầu ra, học phần và mức độ rủi ro sinh viên
          </Text>
        </div>

        <Space wrap>
          <Select
            style={{ width: 260 }}
            placeholder="Chọn đơn vị"
            options={donVis.map((dv: DonVi) => ({
              label: dv.tenDonVi,
              value: dv.maDonVi,
            }))}
            value={maDonVi}
            onChange={setMaDonVi}
            showSearch
            optionFilterProp="label"
          />

          <Select
            style={{ width: 180 }}
            placeholder="Chọn khóa"
            options={nienKhoas.map((nk: NienKhoa) => ({
              label: `Khóa ${nk.khoa}`,
              value: nk.khoa,
            }))}
            value={khoa}
            onChange={setKhoa}
          />

          <Select
            style={{ width: 120 }}
            placeholder="Học kỳ"
            allowClear
            options={[
              { label: "HK1", value: 1 },
              { label: "HK2", value: 2 },
              { label: "HK3", value: 3 },
            ]}
            value={hocKy}
            onChange={setHocKy}
          />
        </Space>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Học phần nút thắt"
            value={data?.bottleneckCourses?.length || 0}
            icon={<WarningOutlined />}
            accent={DANGER_COLOR}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Sinh viên rủi ro"
            value={data?.atRiskStudents?.length || 0}
            icon={<UserOutlined />}
            accent={WARNING_COLOR}
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="Ngưỡng đạt PLO"
            value={nguongDatCaNhanHe10}
            icon={<SafetyCertificateOutlined />}
            accent={SUCCESS_COLOR}
            suffix="/10"
          />
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <KpiCard
            title="KPI Lớp học"
            value={Number((kpiLopHoc * 100).toFixed(0))}
            icon={<BarChartOutlined />}
            accent={PRIMARY_COLOR}
            suffix="%"
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            {data?.config ? (
              <Text>
                {data.config.tenDonVi} • K{data.config.khoa} • Ngưỡng đạt cá
                nhân: {(nguongDatCaNhan * 100).toFixed(0)}% • KPI lớp học:{" "}
                {(kpiLopHoc * 100).toFixed(0)}%
              </Text>
            ) : (
              <Text type="secondary">Chọn đơn vị và khóa để xem dữ liệu.</Text>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Biểu đồ năng lực PLO tích lũy</span>}
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
              height: "100%",
            }}
          >
            {isLoading ? (
              <Skeleton active />
            ) : (
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke={GRID_COLOR} />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 12, fill: "#595959" }}
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tickCount={6} />
                    <Radar
                      name="Điểm trung bình"
                      dataKey="score"
                      stroke={PRIMARY_COLOR}
                      fill={PRIMARY_COLOR}
                      fillOpacity={0.5}
                    />
                    <Radar
                      name="Ngưỡng chuẩn"
                      dataKey="threshold"
                      stroke={DANGER_COLOR}
                      strokeDasharray="4 4"
                      fill="none"
                    />
                    <RechartsTooltip />
                  </RadarChart>
                </ResponsiveContainer>

                <div style={{ textAlign: "center", marginTop: 10 }}>
                  <Space>
                    <Badge color={PRIMARY_COLOR} text="Năng lực thực tế" />
                    <Badge
                      color={DANGER_COLOR}
                      text={`Ngưỡng tối thiểu (${nguongDatCaNhanHe10.toFixed(1)})`}
                    />
                  </Space>
                </div>
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} xl={14}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Cảnh báo "Nút thắt" Học phần</span>}
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Table
              size="middle"
              rowKey="maHocPhan"
              columns={bottleneckColumns}
              dataSource={data?.bottleneckCourses ?? []}
              pagination={{ pageSize: 5 }}
              loading={isLoading}
            />
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title={<span style={{ fontWeight: 600 }}>Danh sách Sinh viên có nguy cơ không đạt chuẩn</span>}
            bordered={false}
            style={{
              borderRadius: 12,
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.04)",
            }}
          >
            <Table
              size="middle"
              rowKey="MSSV"
              columns={riskColumns}
              dataSource={data?.atRiskStudents ?? []}
              pagination={{ pageSize: 8 }}
              loading={isLoading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

function Badge({ color, text }: { color: string; text: string }) {
  return (
    <Space size={4}>
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
        }}
      />
      <Text style={{ fontSize: 12 }}>{text}</Text>
    </Space>
  );
}