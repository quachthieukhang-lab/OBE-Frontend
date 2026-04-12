export type ChuongTrinhDaoTao = {
  maSoNganh: string;
  tenTiengViet: string;
};

export type HocPhan = {
  maHocPhan: string;
  tenHocPhan: string;
};

export type GiangVien = {
  MSGV: string;
  hoTen: string;
};

export type BanPhanCongNhapDeCuong = {
  maBanPhanCong: string;
  maSoNganh: string;
  khoa: number;
  maHocPhan: string;
  MSGV: string;

  vaiTro: string;
  trangThai: string;
  deadline?: string | null;   // YYYY-MM-DD
  ghiChu?: string | null;
  assignedAt?: string | null; // ISO datetime
  /** Response mới thay cho `chuongTrinh` */
  ctdtNienKhoa?: unknown;
};