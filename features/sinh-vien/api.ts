import { http } from "@/lib/api/http";
import type { ChuongTrinhDaoTao, DonVi, NienKhoa, SinhVien } from "./types";

export async function listSinhVien(params: { q?: string } = {}) {
  const res = await http.get<SinhVien[]>("/sinh-vien", { params });
  return res.data;
}

export async function createSinhVien(payload: SinhVien) {
  const res = await http.post<SinhVien>("/sinh-vien", payload);
  return res.data;
}

export async function updateSinhVien(MSSV: string, payload: Partial<SinhVien>) {
  const res = await http.patch<SinhVien>(`/sinh-vien/${MSSV}`, payload);
  return res.data;
}

export async function deleteSinhVien(MSSV: string) {
  await http.delete(`/sinh-vien/${MSSV}`);
}

// options
export async function listDonVi() {
  const res = await http.get<DonVi[]>("/don-vi");
  return res.data;
}

export async function listNienKhoa() {
  const res = await http.get<NienKhoa[]>("/nien-khoa");
  return res.data;
}

export async function listPrograms() {
  const res = await http.get<ChuongTrinhDaoTao[]>("/chuong-trinh-dao-tao");
  return res.data;
}