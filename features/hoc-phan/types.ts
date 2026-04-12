export type DonVi = {
  maDonVi: string;
  tenDonVi: string;
};

export type HocPhan = {
  maHocPhan: string;
  maDonVi: string;
  tenHocPhan: string;
  soTinChi: number;

  loaiHocPhan?: string | null;
  moTa?: string | null;

  soTietLyThuyet?: number | null;
  soTietThucHanh?: number | null;

  ngonNguGiangDay?: string | null;
  taiLieuThamKhao?: string | null;

  donVi?: DonVi | null;
  deCuongs?: Array<{
    maDeCuong: string;
    phienBan: string;
    trangThai: string;
    ngayApDung?: string | null;
  }> | null;
};

export type PloOption = {
  maPLO: string;
  maSoNganh: string;
  khoa: number;
  code: string;
  noiDungChuanDauRa: string;
};