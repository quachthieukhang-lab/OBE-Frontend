import { http } from "@/lib/api/http";
import type { GiangVien, HocPhan, NienKhoa, LopHocPhan } from "./types";

export async function listLopHocPhan(params: { q?: string } = {}) {
  const res = await http.get<LopHocPhan[]>("/lop-hoc-phan", { params });
  return res.data;
}

export async function createLopHocPhan(payload: LopHocPhan) {
  const res = await http.post<LopHocPhan>("/lop-hoc-phan", payload);
  return res.data;
}

export async function updateLopHocPhan(maLopHocPhan: string, payload: Partial<LopHocPhan>) {
  const res = await http.patch<LopHocPhan>(`/lop-hoc-phan/${maLopHocPhan}`, payload);
  return res.data;
}

export async function deleteLopHocPhan(maLopHocPhan: string) {
  await http.delete(`/lop-hoc-phan/${maLopHocPhan}`);
}

// options
export async function listGiangVien() {
  const res = await http.get<GiangVien[]>("/giang-vien");
  return res.data;
}

export async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

export async function listNienKhoa() {
  const res = await http.get<NienKhoa[]>("/nien-khoa");
  return res.data;
}