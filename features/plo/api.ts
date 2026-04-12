import { http } from "@/lib/api/http";
import type { ChuongTrinhDaoTao, PLO } from "./types";

export async function listPrograms() {
  const res = await http.get<ChuongTrinhDaoTao[]>("/chuong-trinh-dao-tao");
  return res.data;
}

function basePath(maSoNganh: string, khoa: number) {
  return `/chuong-trinh-dao-tao/${maSoNganh}/khoa/${khoa}/plo`;
}

export async function listPlo(maSoNganh: string, khoa: number) {
  const res = await http.get<PLO[]>(basePath(maSoNganh, khoa));
  return res.data;
}

/** Body không gửi `khoa` (backend lấy từ URL). */
export async function createPlo(
  maSoNganh: string,
  khoa: number,
  payload: Omit<PLO, "maPLO" | "maSoNganh" | "khoa">
) {
  const res = await http.post<PLO>(basePath(maSoNganh, khoa), payload);
  return res.data;
}

export async function updatePlo(
  maSoNganh: string,
  khoa: number,
  maPLO: string,
  payload: Partial<Omit<PLO, "maPLO" | "maSoNganh" | "khoa">>
) {
  const res = await http.patch<PLO>(`${basePath(maSoNganh, khoa)}/${maPLO}`, payload);
  return res.data;
}

export async function deletePlo(maSoNganh: string, khoa: number, maPLO: string) {
  await http.delete(`${basePath(maSoNganh, khoa)}/${maPLO}`);
}
