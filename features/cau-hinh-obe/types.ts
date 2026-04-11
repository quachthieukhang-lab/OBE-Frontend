export type NienKhoa = {
  khoa: number;
  namBatDau: number;
  namKetThuc?: number | null;
  ghiChu?: string | null;
};

export type DonVi = {
  maDonVi: string;
  tenDonVi: string;
  loaiDonVi: string;
};

export type CauHinhObe = {
  id: string;
  khoa: number;
  maDonVi: string;
  nguongDatCaNhan: string;
  kpiLopHoc: string;
  createdAt: string;
  updatedAt: string;
  nienKhoa?: NienKhoa | null;
  donVi?: DonVi | null;
};