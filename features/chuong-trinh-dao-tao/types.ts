export type DonVi = {
  maDonVi: string;
  tenDonVi: string;
};

export type ChuongTrinhDaoTao = {
  maSoNganh: string;
  maDonVi: string;
  tenTiengViet: string;
  tenTiengAnh?: string | null;
  truongCapBang?: string | null;
  tenGoiVanBang?: string | null;
  trinhDoDaoTao: string;
};