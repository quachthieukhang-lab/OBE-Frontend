export type HocPhan = {
  maHocPhan: string;
  tenHocPhan: string;
};

export type DeCuongChiTiet = {
  maDeCuong: string;
  maHocPhan: string;
  phienBan: string;
  trangThai: "draft" | "active" | "archived";
  ngayApDung?: string | null;
};

export type CachDanhGia = {
  maCDG: string; // uuid
  maDeCuong: string;

  cachDanhGia?: string | null;
  trongSo: string; // Decimal -> string để tránh lỗi float
  tenThanhPhan: string;
  loai?: string | null;
};
