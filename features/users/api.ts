import { http } from "@/lib/api/http";
import type { GiangVienOption, Role, User } from "./types";

export async function listUsers(params: { q?: string; role?: Role } = {}) {
  const res = await http.get<User[]>("/users", { params });
  return res.data;
}

export async function createUser(payload: {
  email: string;
  password: string;
  role: Role;
  msgv?: string;
}) {
  const res = await http.post<User>("/users", payload);
  return res.data;
}

export async function updateUser(
  id: string,
  payload: Partial<{
    email: string;
    password: string;
    role: Role;
    msgv: string | null;
  }>
) {
  const res = await http.patch<User>(`/users/${id}`, payload);
  return res.data;
}

export async function deleteUser(id: string) {
  await http.delete(`/users/${id}`);
}

export async function listGiangVienOptions() {
  const res = await http.get<GiangVienOption[]>("/giang-vien");
  return res.data;
}