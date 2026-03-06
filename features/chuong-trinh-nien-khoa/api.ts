import { http } from "@/lib/api/http";
import type { ChuongTrinhDaoTao, NienKhoa, ChuongTrinhNienKhoa } from "./types";

export async function listPrograms() {
  const res = await http.get<ChuongTrinhDaoTao[]>("/chuong-trinh-dao-tao");
  return res.data;
}

export async function listNienKhoa() {
  const res = await http.get<NienKhoa[]>("/nien-khoa");
  return res.data;
}

// nested endpoints
export async function listProgramCohorts(maSoNganh: string) {
  const res = await http.get<ChuongTrinhNienKhoa[]>(`/chuong-trinh-dao-tao/${maSoNganh}/nien-khoa`);
  return res.data;
}

export async function createProgramCohort(maSoNganh: string, payload: Omit<ChuongTrinhNienKhoa, "maSoNganh">) {
  const res = await http.post<ChuongTrinhNienKhoa>(`/chuong-trinh-dao-tao/${maSoNganh}/nien-khoa`, payload);
  return res.data;
}

export async function updateProgramCohort(maSoNganh: string, khoa: number, payload: Partial<ChuongTrinhNienKhoa>) {
  const res = await http.patch<ChuongTrinhNienKhoa>(`/chuong-trinh-dao-tao/${maSoNganh}/nien-khoa/${khoa}`, payload);
  return res.data;
}

export async function deleteProgramCohort(maSoNganh: string, khoa: number) {
  await http.delete(`/chuong-trinh-dao-tao/${maSoNganh}/nien-khoa/${khoa}`);
}