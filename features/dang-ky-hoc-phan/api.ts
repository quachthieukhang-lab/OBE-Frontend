import { http } from "@/lib/api/http";
import type { DangKyHocPhan, LopHocPhan, SinhVien } from "./types";

export async function listLopHocPhan() {
  const res = await http.get<LopHocPhan[]>("/lop-hoc-phan");
  return res.data;
}

export async function listSinhVien(params: { q?: string } = {}) {
  const res = await http.get<SinhVien[]>("/sinh-vien", { params });
  return res.data;
}

// nested enrollment endpoints
export async function listDangKy(maLopHocPhan: string) {
  const res = await http.get<DangKyHocPhan[]>(`/lop-hoc-phan/${maLopHocPhan}/dang-ky`);
  return res.data;
}

export async function createDangKy(maLopHocPhan: string, payload: Omit<DangKyHocPhan, "maDangKy" | "maLopHocPhan">) {
  const res = await http.post<DangKyHocPhan>(`/lop-hoc-phan/${maLopHocPhan}/dang-ky`, payload);
  return res.data;
}

export async function updateDangKy(maLopHocPhan: string, maDangKy: string, payload: Partial<DangKyHocPhan>) {
  const res = await http.patch<DangKyHocPhan>(
    `/lop-hoc-phan/${maLopHocPhan}/dang-ky/by-id/${maDangKy}`,
    payload
  );
  return res.data;
}

export async function deleteDangKy(maLopHocPhan: string, maDangKy: string) {
  await http.delete(`/lop-hoc-phan/${maLopHocPhan}/dang-ky/by-id/${maDangKy}`);
}