export type LecturerOverview = {
  totalClasses: number;
  totalStudents: number;
  totalScoresEntered: number;
  totalExpectedScores: number;
  overallProgress: number;
  classes: LecturerClassSummary[];
};

export type LecturerClassSummary = {
  maLopHocPhan: string;
  maHocPhan: string;
  tenHocPhan: string;
  soTinChi: number;
  khoa: number;
  hocKy: number;
  status?: string | null;
  deCuong?: {
    phienBan: string;
    trangThai: string;
  } | null;
  enrolledCount: number;
  scoresEntered: number;
  totalExpectedScores: number;
  scoreProgress: number;
};

export type ScoreDistribution = {
  maLopHocPhan: string;
  distributions: Array<{
    maCDG: string;
    tenThanhPhan: string;
    trongSo: number;
    count: number;
    min: number;
    max: number;
    avg: number;
    median: number;
    stdDev: number;
  }>;
};

export type CloSummary = {
  maLopHocPhan: string;
  threshold: number;
  clos: Array<{
    maCLO: string;
    code: string;
    noiDung: string;
    studentCount: number;
    avgTiLeDat: number;
    passCount: number;
    passRate: number;
  }>;
};

export type CoSummary = {
  maLopHocPhan: string;
  threshold: number;
  cos: Array<{
    maCO: string;
    code: string;
    noiDung: string;
    studentCount: number;
    avgTiLeDat: number;
    passCount: number;
    passRate: number;
  }>;
};

export type StudentObeDetails = {
  maLopHocPhan: string;
  maHocPhan: string;
  tenHocPhan: string;
  students: Array<{
    MSSV: string;
    hoTen: string;
    maDangKy: string;
    coResults: Array<{ maCO: string; tiLeDat: number }>;
    cloResults: Array<{ maCLO: string; tiLeDat: number }>;
    avgCO: number;
    avgCLO: number;
  }>;
};

export type AtRiskStudents = {
  maLopHocPhan: string;
  threshold: number;
  totalEnrolled: number;
  atRiskCount: number;
  students: Array<{
    MSSV: string;
    hoTen: string;
    email?: string | null;
    avgCO: number;
    failedCOCount: number;
    failedCLOCount: number;
    failedCOs: string[];
    failedCLOs: string[];
  }>;
};

export type ScoreMatrix = {
  maLopHocPhan: string;
  columns: Array<{
    maCDG: string;
    tenThanhPhan: string;
    trongSo: number;
  }>;
  rows: Array<{
    MSSV: string;
    hoTen: string;
    maDangKy: string;
    scores: Array<{
      maCDG: string;
      diem: number;
      tiLeHoanThanh: number;
    }>;
    tongDiem: number;
    completedCount: number;
    totalCount: number;
  }>;
};
