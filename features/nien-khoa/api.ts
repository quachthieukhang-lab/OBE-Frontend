import { http } from "@/lib/api/http";
import type { NienKhoa } from "./types";

export async function listNienKhoa(params: { q?: string } = {}) {
  const res = await http.get<NienKhoa[]>("/nien-khoa", { params });
  return res.data;
}

export async function createNienKhoa(payload: NienKhoa) {
  const res = await http.post<NienKhoa>("/nien-khoa", payload);
  return res.data;
}

export async function updateNienKhoa(khoa: number, payload: Partial<NienKhoa>) {
  const res = await http.patch<NienKhoa>(`/nien-khoa/${khoa}`, payload);
  return res.data;
}

export async function deleteNienKhoa(khoa: number) {
  await http.delete(`/nien-khoa/${khoa}`);
}