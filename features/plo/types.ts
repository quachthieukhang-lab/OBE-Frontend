export type ChuongTrinhDaoTao = {
  maSoNganh: string;
  tenTiengViet: string;
};

export type PLO = {
  maPLO: string; // uuid
  maSoNganh: string;

  noiDungChuanDauRa: string;
  code?: string | null; // PLO1...
  nhom?: string | null;
  mucDo?: string | null;
  ghiChu?: string | null;

  isActive?: boolean | null;
};