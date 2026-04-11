import { http } from "@/lib/api/http";

import type { LoginBody, RegisterBody } from "./types";

/** Chuẩn hóa token từ nhiều dạng response backend thường dùng */
function extractToken(data: unknown): string | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  if (typeof d.token === "string") return d.token;
  if (typeof d.accessToken === "string") return d.accessToken;
  if (d.data && typeof d.data === "object") {
    const inner = d.data as Record<string, unknown>;
    if (typeof inner.token === "string") return inner.token;
    if (typeof inner.accessToken === "string") return inner.accessToken;
  }
  return null;
}

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

function extractRole(data: unknown, token: string | null): string | null {
  // from response
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (typeof d.role === "string") return d.role;
    if (d.user && typeof d.user === "object") {
      const u = d.user as Record<string, unknown>;
      if (typeof u.role === "string") return u.role;
    }
    if (d.data && typeof d.data === "object") {
      const inner = d.data as Record<string, unknown>;
      if (typeof inner.role === "string") return inner.role;
      if (inner.user && typeof inner.user === "object") {
        const u = inner.user as Record<string, unknown>;
        if (typeof u.role === "string") return u.role;
      }
    }
  }

  // from JWT payload
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload) {
      const direct = payload.role;
      if (typeof direct === "string") return direct;
      const roles = payload.roles;
      if (Array.isArray(roles) && typeof roles[0] === "string") return roles[0];
    }
  }

  return null;
}

/**
 * POST /api/v1/auth/sign-in (path tương đối `/auth/sign-in` vì `http` đã có base `/api/v1`).
 */
export async function login(body: LoginBody) {
  const res = await http.post<unknown>("/auth/sign-in", body);
  const token = extractToken(res.data);
  const role = extractRole(res.data, token);
  return { token, role, raw: res.data };
}

/**
 * POST /api/v1/auth/sign-up
 */
export async function register(body: RegisterBody) {
  const res = await http.post<unknown>("/auth/sign-up", body);
  const token = extractToken(res.data);
  const role = extractRole(res.data, token);
  return { token, role, raw: res.data };
}
