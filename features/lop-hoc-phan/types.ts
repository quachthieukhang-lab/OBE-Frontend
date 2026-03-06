export type GiangVien = { MSGV: string; hoTen: string };
export type HocPhan = { maHocPhan: string; tenHocPhan: string };
export type NienKhoa = { khoa: number; namBatDau: number; namKetThuc?: number | null };

export type LopHocPhan = {
  maLopHocPhan: string;
  MSGV: string;
  maHocPhan: string;
  khoa: number;
  hocKy: number;

  nhom?: string | null;
  siSoToiDa?: number | null;
  phongHoc?: string | null;
  lichHoc?: string | null;

  ngayBatDau?: string | null; // ISO date
  ngayKetThuc?: string | null; // ISO date
  status?: string | null;
};