export type DonVi = { maDonVi: string; tenDonVi: string };
export type NienKhoa = { khoa: number; namBatDau: number; namKetThuc?: number | null };
export type ChuongTrinhDaoTao = { maSoNganh: string; tenTiengViet: string };

export type SinhVien = {
  MSSV: string;
  hoTen: string;

  maDonVi?: string | null;
  khoa?: number | null;
  maSoNganh?: string | null;

  ngaySinh?: string | null; // ISO date
  gioiTinh?: string | null;
  email?: string | null;
  soDienThoai?: string | null;
  trangThaiHocTap?: string | null;
};