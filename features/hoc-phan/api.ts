import { http } from "@/lib/api/http";
import type { HocPhan, DonVi } from "./types";

export async function listHocPhan(params: { q?: string } = {}) {
  const res = await http.get<HocPhan[]>("/hoc-phan", { params });
  return res.data;
}

export async function createHocPhan(payload: HocPhan) {
  const res = await http.post<HocPhan>("/hoc-phan", payload);
  return res.data;
}

export async function updateHocPhan(maHocPhan: string, payload: Partial<HocPhan>) {
  const res = await http.patch<HocPhan>(`/hoc-phan/${maHocPhan}`, payload);
  return res.data;
}

export async function deleteHocPhan(maHocPhan: string) {
  await http.delete(`/hoc-phan/${maHocPhan}`);
}

export async function listDonVi() {
  const res = await http.get<DonVi[]>("/don-vi");
  return res.data;
}