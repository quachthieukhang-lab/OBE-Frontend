export type ChuongTrinhDaoTao = {
  maSoNganh: string;
  tenTiengViet: string;
};

export type NienKhoa = {
  khoa: number;
  namBatDau: number;
  namKetThuc?: number | null;
};

export type ChuongTrinhNienKhoa = {
  maSoNganh: string;
  khoa: number;

  ngayApDung?: string | null; // ISO date
  ghiChu?: string | null;

  soTinChi?: number | null;
  hinhThucDaoTao?: string | null;
  thoiGianDaoTao?: string | null;
  thangDiemDanhGia?: string | null;

  phienBan?: string | null;
  ngayBanHanh?: string | null; // ISO date
  moTa?: string | null;
  trangThai: string; // default active
};