import { http } from "@/lib/api/http";
import type { DonVi } from "./types";

export async function listDonVi(params: { q?: string } = {}) {
  const res = await http.get<DonVi[]>("/don-vi", { params });
  return res.data;
}

export async function createDonVi(payload: DonVi) {
  const res = await http.post<DonVi>("/don-vi", payload);
  return res.data;
}

export async function updateDonVi(maDonVi: string, payload: Partial<DonVi>) {
  const res = await http.patch<DonVi>(`/don-vi/${maDonVi}`, payload);
  return res.data;
}

export async function deleteDonVi(maDonVi: string) {
  await http.delete(`/don-vi/${maDonVi}`);
}