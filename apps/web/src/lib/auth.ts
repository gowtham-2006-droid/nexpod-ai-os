"use client";

export interface User {
  id: string;
  email: string;
  role: "admin" | "user";
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nexpod_auth_token");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("nexpod_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("nexpod_auth_token", token);
  localStorage.setItem("nexpod_user", JSON.stringify(user));
  
  // Set cookie for Next.js Middleware check
  document.cookie = `nexpod_auth_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  document.cookie = `nexpod_user_role=${user.role}; path=/; max-age=604800; SameSite=Lax`;
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("nexpod_auth_token");
  localStorage.removeItem("nexpod_user");
  
  document.cookie = "nexpod_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  document.cookie = "nexpod_user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
}
