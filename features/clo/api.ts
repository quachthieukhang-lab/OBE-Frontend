import { http } from "@/lib/api/http";
import type { CLO, HocPhan } from "./types";

export async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

export async function listClo(maHocPhan: string) {
  const res = await http.get<CLO[]>(`/hoc-phan/${maHocPhan}/clo`);
  return res.data;
}

export async function createClo(maHocPhan: string, payload: Omit<CLO, "maCLO" | "maHocPhan">) {
  const res = await http.post<CLO>(`/hoc-phan/${maHocPhan}/clo`, payload);
  return res.data;
}

export async function updateClo(maHocPhan: string, maCLO: string, payload: Partial<CLO>) {
  const res = await http.patch<CLO>(`/hoc-phan/${maHocPhan}/clo/${maCLO}`, payload);
  return res.data;
}

export async function deleteClo(maHocPhan: string, maCLO: string) {
  await http.delete(`/hoc-phan/${maHocPhan}/clo/${maCLO}`);
}