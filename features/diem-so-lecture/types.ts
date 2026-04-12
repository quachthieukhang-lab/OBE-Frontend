export type LecturerClass = {
    maLopHocPhan: string;
    MSGV: string;
    maHocPhan: string;
    hocKy: number;
    khoa: number;
    nhom?: string | null;
    status?: string | null;
    hocPhan?: {
      maHocPhan: string;
      tenHocPhan: string;
    } | null;
  };
  
  export type Enrollment = {
    maDangKy: string;
    maLopHocPhan: string;
    MSSV: string;
    ngayDangKy?: string | null;
    trangThai?: string | null;
    lanHoc?: number | null;
    ghiChu?: string | null;
    sinhVien?: {
      MSSV: string;
      hoTen: string;
      email?: string | null;
    } | null;
  };
  
  export type CachDanhGia = {
    maCDG: string;
    maDeCuong: string;
    tenThanhPhan: string;
    cachDanhGia?: string | null;
    trongSo: string;
    loai?: string | null;
  };
  
  export type DiemSo = {
    id: string;
    MSSV: string;
    maCDG: string;
    maLopHocPhan: string;
    maDangKy: string;
    diem: string;
    tiLeHoanThanh?: string | null;
    MSGV?: string | null;
    createdAt: string;
    updatedAt: string;
  };