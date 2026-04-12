import { http } from "@/lib/api/http";
import type {
  CdgCoMatrixResponse,
  CloCoMatrixResponse,
  CloPloMatrixResponse,
  DeCuongChiTiet,
  HocPhan,
} from "./types";

export async function listHocPhan() {
  const res = await http.get<HocPhan[]>("/hoc-phan");
  return res.data;
}

export async function listDeCuong(params: { maHocPhan?: string } = {}) {
  const res = await http.get<DeCuongChiTiet[]>("/de-cuong-chi-tiet", { params });
  return res.data;
}

export async function getDeCuongActive(maHocPhan: string) {
  const res = await http.get<DeCuongChiTiet>(
    `/de-cuong-chi-tiet/active/${maHocPhan}`,
  );
  return res.data;
}

export async function getDeCuong(maDeCuong: string) {
  const res = await http.get<DeCuongChiTiet>(
    `/de-cuong-chi-tiet/${maDeCuong}`,
  );
  return res.data;
}

export async function createDeCuong(
  payload: Omit<DeCuongChiTiet, "maDeCuong" | "hocPhan" | "clos" | "cos" | "cachDanhGias">,
) {
  const res = await http.post<DeCuongChiTiet>("/de-cuong-chi-tiet", payload);
  return res.data;
}

export async function updateDeCuong(
  maDeCuong: string,
  payload: Partial<Omit<DeCuongChiTiet, "maDeCuong" | "hocPhan" | "clos" | "cos" | "cachDanhGias">>,
) {
  const res = await http.patch<DeCuongChiTiet>(
    `/de-cuong-chi-tiet/${maDeCuong}`,
    payload,
  );
  return res.data;
}

export async function deleteDeCuong(maDeCuong: string) {
  await http.delete(`/de-cuong-chi-tiet/${maDeCuong}`);
}

export async function getCloPloMatrix(
  maDeCuong: string,
  params: { maSoNganh?: string; khoa?: number } = {},
) {
  const res = await http.get<CloPloMatrixResponse>(
    `/de-cuong-chi-tiet/${maDeCuong}/clo-plo-mapping`,
    { params },
  );
  return res.data;
}

export async function getCloCoMatrix(maDeCuong: string) {
  const res = await http.get<CloCoMatrixResponse>(
    `/de-cuong-chi-tiet/${maDeCuong}/clo-co-mapping`,
  );
  return res.data;
}

export async function getCdgCoMatrix(maDeCuong: string) {
  const res = await http.get<CdgCoMatrixResponse>(
    `/de-cuong-chi-tiet/${maDeCuong}/cdg-co-mapping`,
  );
  return res.data;
}
