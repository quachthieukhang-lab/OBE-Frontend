import { http } from "@/lib/api/http";
import type { ChuongTrinhDaoTao, PLO } from "./types";

export async function listPrograms() {
  const res = await http.get<ChuongTrinhDaoTao[]>("/chuong-trinh-dao-tao");
  return res.data;
}

export async function listPlo(maSoNganh: string) {
  const res = await http.get<PLO[]>(`/chuong-trinh-dao-tao/${maSoNganh}/plo`);
  return res.data;
}

export async function createPlo(maSoNganh: string, payload: Omit<PLO, "maPLO" | "maSoNganh">) {
  const res = await http.post<PLO>(`/chuong-trinh-dao-tao/${maSoNganh}/plo`, payload);
  return res.data;
}

export async function updatePlo(maSoNganh: string, maPLO: string, payload: Partial<PLO>) {
  const res = await http.patch<PLO>(`/chuong-trinh-dao-tao/${maSoNganh}/plo/${maPLO}`, payload);
  return res.data;
}

export async function deletePlo(maSoNganh: string, maPLO: string) {
  await http.delete(`/chuong-trinh-dao-tao/${maSoNganh}/plo/${maPLO}`);
}