import { http } from "@/lib/api/http";

export type AdminObeDashboardResponse = {
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
    noiDung: string;
    avgTiLeDat: number;
    avgDiemHe10: number;
    passRate: number;
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

export async function getAdminObeDashboard(params: {
  maDonVi: string;
  khoa: number;
  hocKy?: number;
}) {
  const res = await http.get<AdminObeDashboardResponse>(
    "/admin-obe-dashboard/overview",
    { params },
  );
  return res.data;
}