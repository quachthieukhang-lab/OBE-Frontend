import { http } from "@/lib/api/http";
import type { CO, DeCuongChiTiet, HocPhan } from "./types";

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

export async function listCo(maDeCuong: string) {
  const res = await http.get<CO[]>(`/de-cuong-chi-tiet/${maDeCuong}/co`);
  return res.data;
}

export async function createCo(maDeCuong: string, payload: Omit<CO, "maCO" | "maDeCuong">) {
  const res = await http.post<CO>(`/de-cuong-chi-tiet/${maDeCuong}/co`, payload);
  return res.data;
}

export async function updateCo(maDeCuong: string, maCO: string, payload: Partial<CO>) {
  const res = await http.patch<CO>(`/de-cuong-chi-tiet/${maDeCuong}/co/${maCO}`, payload);
  return res.data;
}

export async function deleteCo(maDeCuong: string, maCO: string) {
  await http.delete(`/de-cuong-chi-tiet/${maDeCuong}/co/${maCO}`);
}
