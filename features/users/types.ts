export type Role = "ADMIN" | "QA" | "LECTURER" | "AUDITOR";

export type User = {
  id: string;
  email: string;
  password?: string;
  role: Role;
  msgv?: string | null;
  createdAt: string;
  updatedAt: string;
  giangVien?: {
    MSGV: string;
    hoTen: string;
    maDonVi: string;
  } | null;
};

export type GiangVienOption = {
  MSGV: string;
  hoTen: string;
  maDonVi: string;
};