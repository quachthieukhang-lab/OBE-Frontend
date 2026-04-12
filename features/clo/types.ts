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

export type CLO = {
  maCLO: string; // uuid
  maDeCuong: string;

  noiDungChuanDauRa: string;
  code?: string | null; // CLO1...
};
