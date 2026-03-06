import { http } from "@/lib/api/http";
import type { DonVi, GiangVien } from "./types";

export async function listGiangVien(params: { q?: string } = {}) {
  const res = await http.get<GiangVien[]>("/giang-vien", { params });
  return res.data;
}

export async function createGiangVien(payload: GiangVien) {
  const res = await http.post<GiangVien>("/giang-vien", payload);
  return res.data;
}

export async function updateGiangVien(MSGV: string, payload: Partial<GiangVien>) {
  const res = await http.patch<GiangVien>(`/giang-vien/${MSGV}`, payload);
  return res.data;
}

export async function deleteGiangVien(MSGV: string) {
  await http.delete(`/giang-vien/${MSGV}`);
}

export async function listDonVi() {
  const res = await http.get<DonVi[]>("/don-vi");
  return res.data;
}