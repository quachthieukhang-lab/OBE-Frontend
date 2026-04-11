import { http } from "@/lib/api/http";
import type { CauHinhObe } from "./types";

export async function listCauHinhObe(params: { namHoc?: string } = {}) {
  const res = await http.get<CauHinhObe[] | CauHinhObe>("/cau-hinh-obe", {
    params,
  });

  // Backend của bạn hiện tại:
  // - GET /cau-hinh-obe => array
  // - GET /cau-hinh-obe?namHoc=... => object
  // Chuẩn hóa lại cho frontend.
  return Array.isArray(res.data) ? res.data : [res.data];
}

export async function createCauHinhObe(payload: {
  namHoc: string;
  nguongDatCaNhan: string;
  kpiLopHoc: string;
}) {
  const res = await http.post<CauHinhObe>("/cau-hinh-obe", payload);
  return res.data;
}

export async function updateCauHinhObe(
  id: string,
  payload: Partial<{
    namHoc: string;
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