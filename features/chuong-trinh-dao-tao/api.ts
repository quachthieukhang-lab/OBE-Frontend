import { http } from "@/lib/api/http";
import type { ChuongTrinhDaoTao, DonVi } from "./types";

export async function listChuongTrinhDaoTao(params: { q?: string } = {}) {
  const res = await http.get<ChuongTrinhDaoTao[]>("/chuong-trinh-dao-tao", { params });
  return res.data;
}

export async function createChuongTrinhDaoTao(payload: ChuongTrinhDaoTao) {
  const res = await http.post<ChuongTrinhDaoTao>("/chuong-trinh-dao-tao", payload);
  return res.data;
}

export async function updateChuongTrinhDaoTao(maSoNganh: string, payload: Partial<ChuongTrinhDaoTao>) {
  const res = await http.patch<ChuongTrinhDaoTao>(`/chuong-trinh-dao-tao/${maSoNganh}`, payload);
  return res.data;
}

export async function deleteChuongTrinhDaoTao(maSoNganh: string) {
  await http.delete(`/chuong-trinh-dao-tao/${maSoNganh}`);
}

export async function listDonVi() {
  const res = await http.get<DonVi[]>("/don-vi");
  return res.data;
}