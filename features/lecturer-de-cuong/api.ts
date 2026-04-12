import { http } from "@/lib/api/http";
import type {
  CachDanhGia,
  CLO,
  CO,
  DeCuongDetail,
  MyAssignment,
  MySyllabusItem,
} from "./types";

const BASE = "/lecturer/de-cuong";

// ── Phân công ──────────────────────────────────────────────

export async function listMyAssignments() {
  const res = await http.get<MyAssignment[]>(`${BASE}/my-assignments`);
  return res.data;
}

export async function getMyAssignment(maBanPhanCong: string) {
  const res = await http.get<MyAssignment>(
    `${BASE}/my-assignments/${maBanPhanCong}`,
  );
  return res.data;
}

export async function updateAssignmentStatus(
  maBanPhanCong: string,
  payload: { trangThai: string },
) {
  const res = await http.patch<MyAssignment>(
    `${BASE}/my-assignments/${maBanPhanCong}/status`,
    payload,
  );
  return res.data;
}

export async function createSyllabusFromAssignment(
  maBanPhanCong: string,
  payload: { phienBan: string; ngayApDung?: string; ghiChu?: string },
) {
  const res = await http.post<DeCuongDetail>(
    `${BASE}/my-assignments/${maBanPhanCong}/syllabus`,
    payload,
  );
  return res.data;
}

// ── Đề cương ───────────────────────────────────────────────

export async function listMySyllabi() {
  const res = await http.get<MySyllabusItem[]>(`${BASE}/my-syllabi`);
  return res.data;
}

export async function getSyllabus(maDeCuong: string) {
  const res = await http.get<DeCuongDetail>(
    `${BASE}/syllabus/${maDeCuong}`,
  );
  return res.data;
}

export async function updateSyllabus(
  maDeCuong: string,
  payload: Partial<{ phienBan: string; trangThai: string; ngayApDung: string; ghiChu: string }>,
) {
  const res = await http.patch<DeCuongDetail>(
    `${BASE}/syllabus/${maDeCuong}`,
    payload,
  );
  return res.data;
}

export async function deleteSyllabus(maDeCuong: string) {
  await http.delete(`${BASE}/syllabus/${maDeCuong}`);
}

// ── CLO ────────────────────────────────────────────────────

export async function listClo(maDeCuong: string) {
  const res = await http.get<CLO[]>(`${BASE}/syllabus/${maDeCuong}/clo`);
  return res.data;
}

export async function createClo(
  maDeCuong: string,
  payload: { code?: string; noiDungChuanDauRa: string },
) {
  const res = await http.post<CLO>(
    `${BASE}/syllabus/${maDeCuong}/clo`,
    payload,
  );
  return res.data;
}

export async function updateClo(
  maDeCuong: string,
  maCLO: string,
  payload: Partial<{ code: string; noiDungChuanDauRa: string }>,
) {
  const res = await http.patch<CLO>(
    `${BASE}/syllabus/${maDeCuong}/clo/${maCLO}`,
    payload,
  );
  return res.data;
}

export async function deleteClo(maDeCuong: string, maCLO: string) {
  await http.delete(`${BASE}/syllabus/${maDeCuong}/clo/${maCLO}`);
}

// ── CO ─────────────────────────────────────────────────────

export async function listCo(maDeCuong: string) {
  const res = await http.get<CO[]>(`${BASE}/syllabus/${maDeCuong}/co`);
  return res.data;
}

export async function createCo(
  maDeCuong: string,
  payload: { code?: string; noiDungChuanDauRa: string },
) {
  const res = await http.post<CO>(
    `${BASE}/syllabus/${maDeCuong}/co`,
    payload,
  );
  return res.data;
}

export async function updateCo(
  maDeCuong: string,
  maCO: string,
  payload: Partial<{ code: string; noiDungChuanDauRa: string }>,
) {
  const res = await http.patch<CO>(
    `${BASE}/syllabus/${maDeCuong}/co/${maCO}`,
    payload,
  );
  return res.data;
}

export async function deleteCo(maDeCuong: string, maCO: string) {
  await http.delete(`${BASE}/syllabus/${maDeCuong}/co/${maCO}`);
}

// ── Cách đánh giá ──────────────────────────────────────────

export async function listCachDanhGia(maDeCuong: string) {
  const res = await http.get<CachDanhGia[]>(
    `${BASE}/syllabus/${maDeCuong}/cach-danh-gia`,
  );
  return res.data;
}

export async function createCachDanhGia(
  maDeCuong: string,
  payload: {
    tenThanhPhan: string;
    trongSo: string;
    loai?: string;
    cachDanhGia?: string;
  },
) {
  const res = await http.post<CachDanhGia>(
    `${BASE}/syllabus/${maDeCuong}/cach-danh-gia`,
    payload,
  );
  return res.data;
}

export async function updateCachDanhGia(
  maDeCuong: string,
  maCDG: string,
  payload: Partial<{
    tenThanhPhan: string;
    trongSo: string;
    loai: string;
    cachDanhGia: string;
  }>,
) {
  const res = await http.patch<CachDanhGia>(
    `${BASE}/syllabus/${maDeCuong}/cach-danh-gia/${maCDG}`,
    payload,
  );
  return res.data;
}

export async function deleteCachDanhGia(maDeCuong: string, maCDG: string) {
  await http.delete(`${BASE}/syllabus/${maDeCuong}/cach-danh-gia/${maCDG}`);
}
