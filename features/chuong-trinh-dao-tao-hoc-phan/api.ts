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

function basePath(maSoNganh: string, khoa: number) {
  return `/chuong-trinh-dao-tao/${maSoNganh}/khoa/${khoa}/hoc-phan`;
}

/** GET …/khoa/:khoa/hoc-phan */
export async function listProgramCourses(maSoNganh: string, khoa: number) {
  const res = await http.get<ChuongTrinhDaoTaoHocPhan[]>(basePath(maSoNganh, khoa));
  return res.data;
}

/** POST — không gửi `khoa` trong body (backend lấy từ URL). */
export async function createProgramCourse(
  maSoNganh: string,
  khoa: number,
  payload: Omit<ChuongTrinhDaoTaoHocPhan, "maSoNganh">
) {
  const res = await http.post<ChuongTrinhDaoTaoHocPhan>(basePath(maSoNganh, khoa), payload);
  return res.data;
}

/** PATCH — không gửi `khoa` trong body. */
export async function updateProgramCourse(
  maSoNganh: string,
  khoa: number,
  maHocPhan: string,
  payload: Partial<ChuongTrinhDaoTaoHocPhan>
) {
  const res = await http.patch<ChuongTrinhDaoTaoHocPhan>(
    `${basePath(maSoNganh, khoa)}/${maHocPhan}`,
    payload
  );
  return res.data;
}

export async function deleteProgramCourse(maSoNganh: string, khoa: number, maHocPhan: string) {
  await http.delete(`${basePath(maSoNganh, khoa)}/${maHocPhan}`);
}
