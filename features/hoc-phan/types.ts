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
};