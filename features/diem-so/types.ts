export type LopHocPhan = {
  maLopHocPhan: string;
  maHocPhan: string;
  MSGV: string;
  khoa: number;
  hocKy: number;
};

export type DangKyHocPhan = {
  maDangKy: string;
  maLopHocPhan: string;
  MSSV: string;
  trangThai?: string | null;
  lanHoc?: number | null;
};

export type SinhVien = {
  MSSV: string;
  hoTen: string;
};

export type CachDanhGia = {
  maCDG: string;
  maHocPhan: string;
  tenThanhPhan: string;
  cachDanhGia?: string | null;
  trongSo: string;
  loai?: string | null;
};

export type GiangVien = {
  MSGV: string;
  hoTen: string;
};

export type DiemSo = {
  id: string;
  MSSV: string;
  maCDG: string;
  maLopHocPhan: string;
  maDangKy: string;
  diem: string; // Decimal -> string
  tiLeHoanThanh?: string | null;
  MSGV?: string | null;

  createdAt: string;
  updatedAt: string;
};