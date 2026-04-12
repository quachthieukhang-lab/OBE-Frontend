import { http } from "@/lib/api/http";
import type { CLO, DeCuongChiTiet, HocPhan } from "./types";

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

export async function listClo(maDeCuong: string) {
  const res = await http.get<CLO[]>(`/de-cuong-chi-tiet/${maDeCuong}/clo`);
  return res.data;
}

export async function createClo(maDeCuong: string, payload: Omit<CLO, "maCLO" | "maDeCuong">) {
  const res = await http.post<CLO>(`/de-cuong-chi-tiet/${maDeCuong}/clo`, payload);
  return res.data;
}

export async function updateClo(maDeCuong: string, maCLO: string, payload: Partial<CLO>) {
  const res = await http.patch<CLO>(`/de-cuong-chi-tiet/${maDeCuong}/clo/${maCLO}`, payload);
  return res.data;
}

export async function deleteClo(maDeCuong: string, maCLO: string) {
  await http.delete(`/de-cuong-chi-tiet/${maDeCuong}/clo/${maCLO}`);
}
