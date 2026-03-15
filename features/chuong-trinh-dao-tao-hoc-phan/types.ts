export type ChuongTrinhDaoTao = {
  maSoNganh: string;
  tenTiengViet: string;
};

export type HocPhan = {
  maHocPhan: string;
  tenHocPhan: string;
};

export type ChuongTrinhDaoTaoHocPhan = {
  maSoNganh: string;
  maHocPhan: string;
  hocKyDuKien?: number | null;
  namHocDuKien?: number | null;
  batBuoc: boolean;
  nhomTuChon?: string | null;
  ghiChu?: string | null;
};