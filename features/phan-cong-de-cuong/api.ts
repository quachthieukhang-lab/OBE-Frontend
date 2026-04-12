import { http } from "@/lib/api/http";
import type {
  BanPhanCongNhapDeCuong,
  ChuongTrinhDaoTao,
  GiangVien,
  HocPhan,
} from "./types";

export async function listPrograms() {
  const res = await http.get<ChuongTrinhDaoTao[]>("/chuong-trinh-dao-tao");
  return res.data;
}

export async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

export async function listGiangVien() {
  const res = await http.get<GiangVien[]>("/giang-vien");
  return res.data;
}

export async function listAssignments(params: {
  maSoNganh?: string;
  khoa?: number;
  maHocPhan?: string;
  MSGV?: string;
  trangThai?: string;
  q?: string;
} = {}) {
  const res = await http.get<BanPhanCongNhapDeCuong[]>("/ban-phan-cong-nhap-de-cuong", {
    params,
  });
  return res.data;
}

export async function createAssignment(payload: Omit<BanPhanCongNhapDeCuong, "maBanPhanCong" | "assignedAt">) {
  const res = await http.post<BanPhanCongNhapDeCuong>("/ban-phan-cong-nhap-de-cuong", payload);
  return res.data;
}

export async function updateAssignment(
  maBanPhanCong: string,
  payload: Partial<BanPhanCongNhapDeCuong>
) {
  const res = await http.patch<BanPhanCongNhapDeCuong>(
    `/ban-phan-cong-nhap-de-cuong/${maBanPhanCong}`,
    payload
  );
  return res.data;
}

export async function deleteAssignment(maBanPhanCong: string) {
  await http.delete(`/ban-phan-cong-nhap-de-cuong/${maBanPhanCong}`);
}