export type DonVi = {
  maDonVi: string;
  tenDonVi: string;
};

export type GiangVien = {
  MSGV: string;
  maDonVi: string;

  hoTen: string;
  email?: string | null;
  soDienThoai?: string | null;

  hocVi?: string | null;
  chucDanh?: string | null;
  boMon?: string | null;

  ngaySinh?: string | null; // ISO date
  isActive?: boolean | null;
};