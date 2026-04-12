import { http } from "@/lib/api/http";
import type {
  CachDanhGia,
  DangKyHocPhan,
  DeCuongChiTiet,
  DiemSo,
  GiangVien,
  LopHocPhan,
  SinhVien,
} from "./types";

export async function listLopHocPhan() {
  const res = await http.get<LopHocPhan[]>("/lop-hoc-phan");
  return res.data;
}

export async function listDangKy(maLopHocPhan: string) {
  const res = await http.get<DangKyHocPhan[]>(`/lop-hoc-phan/${maLopHocPhan}/dang-ky`);
  return res.data;
}

export async function listDeCuong(maHocPhan: string) {
  const res = await http.get<DeCuongChiTiet[]>("/de-cuong-chi-tiet", {
    params: { maHocPhan },
  });
  return res.data;
}

export async function listCachDanhGia(maDeCuong: string) {
  const res = await http.get<CachDanhGia[]>(`/de-cuong-chi-tiet/${maDeCuong}/cach-danh-gia`);
  return res.data;
}

export async function listGiangVien() {
  const res = await http.get<GiangVien[]>("/giang-vien");
  return res.data;
}

export async function listSinhVien(params: { q?: string } = {}) {
  const res = await http.get<SinhVien[]>("/sinh-vien", { params });
  return res.data;
}

export async function listDiemSo(maDangKy: string) {
  const res = await http.get<DiemSo[]>(`/dang-ky-hoc-phan/${maDangKy}/diem-so`);
  return res.data;
}

export async function createDiemSo(
  maDangKy: string,
  payload: { maCDG: string; diem: string; MSGV?: string | null }
) {
  const res = await http.post<DiemSo>(`/dang-ky-hoc-phan/${maDangKy}/diem-so`, payload);
  return res.data;
}

export async function updateDiemSo(
  maDangKy: string,
  maCDG: string,
  payload: Partial<{ diem: string; MSGV?: string | null }>
) {
  const res = await http.patch<DiemSo>(
    `/dang-ky-hoc-phan/${maDangKy}/diem-so/${maCDG}`,
    payload
  );
  return res.data;
}

export async function deleteDiemSo(maDangKy: string, maCDG: string) {
  await http.delete(`/dang-ky-hoc-phan/${maDangKy}/diem-so/${maCDG}`);
}
