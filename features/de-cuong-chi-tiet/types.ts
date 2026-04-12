export type HocPhan = {
  maHocPhan: string;
  tenHocPhan: string;
};

export type CLO = {
  maCLO: string;
  maDeCuong: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

export type CO = {
  maCO: string;
  maDeCuong: string;
  code?: string | null;
  noiDungChuanDauRa: string;
};

export type CachDanhGia = {
  maCDG: string;
  maDeCuong: string;
  tenThanhPhan: string;
  cachDanhGia?: string | null;
  trongSo: string;
  loai?: string | null;
};

export type PLO = {
  maPLO: string;
  maSoNganh: string;
  code?: string | null;
  noiDungChuanDauRa: string;
  khoa?: number | null;
};

export type DeCuongChiTiet = {
  maDeCuong: string;
  maHocPhan: string;
  phienBan: string;
  ngayApDung?: string | null;
  trangThai: "draft" | "active" | "archived";
  ghiChu?: string | null;
  hocPhan?: HocPhan | null;
  clos?: CLO[];
  cos?: CO[];
  cachDanhGias?: CachDanhGia[];
};

export type CloPloMatrixResponse = {
  clos: CLO[];
  plos: PLO[];
  mappings: Array<{ maCLO: string; maPLO: string; trongSo: number }>;
};

export type CloCoMatrixResponse = {
  clos: CLO[];
  cos: CO[];
  mappings: Array<{ maCLO: string; maCO: string; trongSo: number }>;
};

export type CdgCoMatrixResponse = {
  cachDanhGias: CachDanhGia[];
  cos: CO[];
  mappings: Array<{ maCDG: string; maCO: string; trongSo: number }>;
};
