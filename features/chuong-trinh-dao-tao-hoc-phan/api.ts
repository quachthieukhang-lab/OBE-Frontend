import { http } from "@/lib/api/http";
import type {
  ChuongTrinhDaoTao,
  HocPhan,
  ChuongTrinhDaoTaoHocPhan,
} from "./types";

export async function listPrograms() {
  const res = await http.get<ChuongTrinhDaoTao[]>("/chuong-trinh-dao-tao");
  return res.data;
}

export async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

export async function listProgramCourses(maSoNganh: string) {
  const res = await http.get<ChuongTrinhDaoTaoHocPhan[]>(
    `/chuong-trinh-dao-tao/${maSoNganh}/hoc-phan`
  );
  return res.data;
}

export async function createProgramCourse(
  maSoNganh: string,
  payload: Omit<ChuongTrinhDaoTaoHocPhan, "maSoNganh">
) {
  const res = await http.post<ChuongTrinhDaoTaoHocPhan>(
    `/chuong-trinh-dao-tao/${maSoNganh}/hoc-phan`,
    payload
  );
  return res.data;
}

export async function updateProgramCourse(
  maSoNganh: string,
  maHocPhan: string,
  payload: Partial<ChuongTrinhDaoTaoHocPhan>
) {
  const res = await http.patch<ChuongTrinhDaoTaoHocPhan>(
    `/chuong-trinh-dao-tao/${maSoNganh}/hoc-phan/${maHocPhan}`,
    payload
  );
  return res.data;
}

export async function deleteProgramCourse(maSoNganh: string, maHocPhan: string) {
  await http.delete(`/chuong-trinh-dao-tao/${maSoNganh}/hoc-phan/${maHocPhan}`);
}