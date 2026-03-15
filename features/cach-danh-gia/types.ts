export type HocPhan = {
  maHocPhan: string;
  tenHocPhan: string;
};

export type CachDanhGia = {
  maCDG: string; // uuid
  maHocPhan: string;

  cachDanhGia?: string | null;
  trongSo: string; // Decimal -> string để tránh lỗi float
  tenThanhPhan: string;
  loai?: string | null;
};