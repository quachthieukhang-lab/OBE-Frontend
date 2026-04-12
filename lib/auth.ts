import { useMemo } from "react";

export type AuthUser = {
  id: string | null;
  email: string | null;
  role: string | null;
  msgv: string | null;
  hoTen: string | null;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const json = atob(padded);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

const EMPTY_USER: AuthUser = {
  id: null,
  email: null,
  role: null,
  msgv: null,
  hoTen: null,
};

export function useAuth(): AuthUser {
  return useMemo(() => {
    if (typeof window === "undefined") return EMPTY_USER;
    const token = localStorage.getItem("token");
    if (!token) return EMPTY_USER;

    const payload = decodeJwtPayload(token);
    if (!payload) return EMPTY_USER;

    return {
      id: (payload.sub ?? payload.id ?? null) as string | null,
      email: (payload.email ?? null) as string | null,
      role:
        (payload.role ??
          (Array.isArray(payload.roles) ? payload.roles[0] : null) ??
          null) as string | null,
      msgv: (payload.msgv ?? payload.MSGV ?? null) as string | null,
      hoTen: (payload.hoTen ?? payload.name ?? null) as string | null,
    };
  }, []);
}

export function logout() {
  localStorage.removeItem("token");
}
