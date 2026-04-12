export type MyAssignment = {
  maBanPhanCong: string;
  maSoNganh: string;
  khoa: number;
  maHocPhan: string;
  MSGV: string;
  vaiTro: string;
  trangThai: string;
  deadline?: string | null;
  ghiChu?: string | null;
  assignedAt?: string | null;
  hocPhan?: { maHocPhan: string; tenHocPhan: string } | null;
  ctdtNienKhoa?: {
    maSoNganh: string;
    khoa: number;
    chuongTrinhDaoTao?: { tenTiengViet: string } | null;
  } | null;
  deCuong?: DeCuongDetail | null;
};

export type DeCuongDetail = {
  maDeCuong: string;
  maHocPhan: string;
  phienBan: string;
  ngayApDung?: string | null;
  trangThai: "draft" | "active" | "archived";
  ghiChu?: string | null;
  hocPhan?: { maHocPhan: string; tenHocPhan: string } | null;
  clos?: CLO[];
  cos?: CO[];
  cachDanhGias?: CachDanhGia[];
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

export type MySyllabusItem = {
  maDeCuong: string;
  maHocPhan: string;
  tenHocPhan: string;
  phienBan: string;
  trangThai: "draft" | "active" | "archived";
  ngayApDung?: string | null;
  ghiChu?: string | null;
  counts: {
    clos: number;
    cos: number;
    cachDanhGias: number;
  };
  assignment: {
    maBanPhanCong: string;
    maSoNganh: string;
    khoa: number;
    vaiTro: string;
    trangThaiPhanCong: string;
  };
};
