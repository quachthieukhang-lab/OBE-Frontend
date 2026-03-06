import { http } from "@/lib/api/http";
import type { CO, HocPhan } from "./types";

export async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

export async function listCo(maHocPhan: string) {
  const res = await http.get<CO[]>(`/hoc-phan/${maHocPhan}/co`);
  return res.data;
}

export async function createCo(maHocPhan: string, payload: Omit<CO, "maCO" | "maHocPhan">) {
  const res = await http.post<CO>(`/hoc-phan/${maHocPhan}/co`, payload);
  return res.data;
}

export async function updateCo(maHocPhan: string, maCO: string, payload: Partial<CO>) {
  const res = await http.patch<CO>(`/hoc-phan/${maHocPhan}/co/${maCO}`, payload);
  return res.data;
}

export async function deleteCo(maHocPhan: string, maCO: string) {
  await http.delete(`/hoc-phan/${maHocPhan}/co/${maCO}`);
}