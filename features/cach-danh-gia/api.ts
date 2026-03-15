import { http } from "@/lib/api/http";
import type { CachDanhGia, HocPhan } from "./types";

export async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

export async function listCachDanhGia(maHocPhan: string) {
  const res = await http.get<CachDanhGia[]>(`/hoc-phan/${maHocPhan}/cach-danh-gia`);
  return res.data;
}

export async function createCachDanhGia(
  maHocPhan: string,
  payload: Omit<CachDanhGia, "maCDG" | "maHocPhan">
) {
  const res = await http.post<CachDanhGia>(`/hoc-phan/${maHocPhan}/cach-danh-gia`, payload);
  return res.data;
}

export async function updateCachDanhGia(
  maHocPhan: string,
  maCDG: string,
  payload: Partial<CachDanhGia>
) {
  const res = await http.patch<CachDanhGia>(
    `/hoc-phan/${maHocPhan}/cach-danh-gia/${maCDG}`,
    payload
  );
  return res.data;
}

export async function deleteCachDanhGia(maHocPhan: string, maCDG: string) {
  await http.delete(`/hoc-phan/${maHocPhan}/cach-danh-gia/${maCDG}`);
}