import { http } from "@/lib/api/http";
import type { CachDanhGia, DiemSo, Enrollment, LecturerClass } from "./types";

export async function listMyClasses() {
  const res = await http.get<LecturerClass[]>("/lecturer/my-classes");
  return res.data;
}

export async function listMyClassEnrollments(maLopHocPhan: string) {
  const res = await http.get<Enrollment[]>(
    `/lecturer/my-classes/${maLopHocPhan}/enrollments`
  );
  return res.data;
}

export async function listMyClassCachDanhGia(maLopHocPhan: string) {
  const res = await http.get<CachDanhGia[]>(
    `/lecturer/my-classes/${maLopHocPhan}/cach-danh-gia`
  );
  return res.data;
}

export async function listEnrollmentScores(maDangKy: string) {
  const res = await http.get<DiemSo[]>(
    `/lecturer/enrollments/${maDangKy}/scores`
  );
  return res.data;
}

export async function createEnrollmentScore(
  maDangKy: string,
  payload: { maCDG: string; diem: string }
) {
  const res = await http.post<DiemSo>(
    `/lecturer/enrollments/${maDangKy}/scores`,
    payload
  );
  return res.data;
}

export async function updateEnrollmentScore(
  maDangKy: string,
  maCDG: string,
  payload: { diem: string }
) {
  const res = await http.patch<DiemSo>(
    `/lecturer/enrollments/${maDangKy}/scores/${maCDG}`,
    payload
  );
  return res.data;
}

export async function deleteEnrollmentScore(maDangKy: string, maCDG: string) {
  await http.delete(`/lecturer/enrollments/${maDangKy}/scores/${maCDG}`);
}