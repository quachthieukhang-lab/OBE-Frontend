import { http } from "@/lib/api/http";
import type { CachDanhGia, DeCuongChiTiet, HocPhan } from "./types";

export async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

export async function listDeCuong(maHocPhan: string) {
  const res = await http.get<DeCuongChiTiet[]>("/de-cuong-chi-tiet", {
    params: { maHocPhan },
  });
  return res.data;
}

export async function listCachDanhGia(maDeCuong: string) {
  const res = await http.get<CachDanhGia[]>(`/de-cuong-chi-tiet/${maDeCuong}/cach-danh-gia`);
  return res.data;
}

export async function createCachDanhGia(
  maDeCuong: string,
  payload: Omit<CachDanhGia, "maCDG" | "maDeCuong">
) {
  const res = await http.post<CachDanhGia>(`/de-cuong-chi-tiet/${maDeCuong}/cach-danh-gia`, payload);
  return res.data;
}

export async function updateCachDanhGia(
  maDeCuong: string,
  maCDG: string,
  payload: Partial<CachDanhGia>
) {
  const res = await http.patch<CachDanhGia>(
    `/de-cuong-chi-tiet/${maDeCuong}/cach-danh-gia/${maCDG}`,
    payload
  );
  return res.data;
}

export async function deleteCachDanhGia(maDeCuong: string, maCDG: string) {
  await http.delete(`/de-cuong-chi-tiet/${maDeCuong}/cach-danh-gia/${maCDG}`);
}
