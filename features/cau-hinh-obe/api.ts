import { http } from "@/lib/api/http";
import type { CauHinhObe } from "./types";

export async function listCauHinhObe(params: { khoa?: number; maDonVi?: string } = {}) {
  const res = await http.get<CauHinhObe[]>("/cau-hinh-obe", { params });
  return res.data;
}

export async function createCauHinhObe(payload: {
  khoa: number;
  maDonVi: string;
  nguongDatCaNhan: string;
  kpiLopHoc: string;
}) {
  const res = await http.post<CauHinhObe>("/cau-hinh-obe", payload);
  return res.data;
}

export async function updateCauHinhObe(
  id: string,
  payload: Partial<{
    khoa: number;
    maDonVi: string;
    nguongDatCaNhan: string;
    kpiLopHoc: string;
  }>
) {
  const res = await http.patch<CauHinhObe>(`/cau-hinh-obe/${id}`, payload);
  return res.data;
}

export async function deleteCauHinhObe(id: string) {
  await http.delete(`/cau-hinh-obe/${id}`);
}

/** GET /cau-hinh-obe/by-khoa/:khoa/don-vi/:maDonVi */
export async function getCauHinhObeByKhoaAndDonVi(khoa: number, maDonVi: string) {
  const res = await http.get<CauHinhObe>(
    `/cau-hinh-obe/by-khoa/${khoa}/don-vi/${encodeURIComponent(maDonVi)}`
  );
  return res.data;
}