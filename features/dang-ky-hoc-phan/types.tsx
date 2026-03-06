export type LopHocPhan = {
  maLopHocPhan: string;
  maHocPhan: string;
  MSGV: string;
  khoa: number;
  hocKy: number;
};

export type SinhVien = {
  MSSV: string;
  hoTen: string;
};

export type DangKyHocPhan = {
  maDangKy: string;
  maLopHocPhan: string;
  MSSV: string;
  ngayDangKy?: string | null; // YYYY-MM-DD
  trangThai?: string | null;
  lanHoc?: number | null;
  ghiChu?: string | null;
};