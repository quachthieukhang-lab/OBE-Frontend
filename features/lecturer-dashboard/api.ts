import { http } from "@/lib/api/http";
import type {
  AtRiskStudents,
  CloSummary,
  CoSummary,
  LecturerOverview,
  ScoreDistribution,
  ScoreMatrix,
  StudentObeDetails,
} from "./types";

export async function getLecturerOverview(params: {
  khoa?: number;
  hocKy?: number;
} = {}) {
  const res = await http.get<LecturerOverview>(
    "/lecturer/dashboard/overview",
    { params },
  );
  return res.data;
}

export async function getScoreDistribution(maLopHocPhan: string) {
  const res = await http.get<ScoreDistribution>(
    `/lecturer/dashboard/classes/${maLopHocPhan}/score-distribution`,
  );
  return res.data;
}

export async function getCloSummary(
  maLopHocPhan: string,
  params: { nguongDat?: number } = {},
) {
  const res = await http.get<CloSummary>(
    `/lecturer/dashboard/classes/${maLopHocPhan}/clo-summary`,
    { params },
  );
  return res.data;
}

export async function getCoSummary(
  maLopHocPhan: string,
  params: { nguongDat?: number } = {},
) {
  const res = await http.get<CoSummary>(
    `/lecturer/dashboard/classes/${maLopHocPhan}/co-summary`,
    { params },
  );
  return res.data;
}

export async function getStudentObeDetails(maLopHocPhan: string) {
  const res = await http.get<StudentObeDetails>(
    `/lecturer/dashboard/classes/${maLopHocPhan}/student-obe-details`,
  );
  return res.data;
}

export async function getAtRiskStudents(
  maLopHocPhan: string,
  params: { nguongDat?: number } = {},
) {
  const res = await http.get<AtRiskStudents>(
    `/lecturer/dashboard/classes/${maLopHocPhan}/at-risk-students`,
    { params },
  );
  return res.data;
}

export async function getScoreMatrix(maLopHocPhan: string) {
  const res = await http.get<ScoreMatrix>(
    `/lecturer/dashboard/classes/${maLopHocPhan}/score-matrix`,
  );
  return res.data;
}
