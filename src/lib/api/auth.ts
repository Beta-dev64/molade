import type { ReminderPrefs } from "@/lib/molade/types";
import { api } from "./client";
import { clearAccessToken, setAccessToken } from "./token";

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  programme: string;
  emailVerifiedAt: string | null;
  createdAt: string;
}

export async function login(email: string, password: string) {
  const data = await api<{ token: string; user: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAccessToken(data.token);
  return data;
}

export async function register(input: { name: string; email: string; password: string }) {
  return api<{
    requiresVerification: true;
    verificationSkippable: boolean;
    email: string;
    message: string;
  }>("/api/auth/register", { method: "POST", body: JSON.stringify(input) });
}

export async function fetchAuthConfig() {
  return api<{ verificationMode: "lax" | ""; verificationSkippable: boolean }>("/api/auth/config");
}

export async function verifyEmail(email: string, code: string) {
  const data = await api<{ token: string; user: ApiUser }>("/api/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
  setAccessToken(data.token);
  return data;
}

export async function resendOtp(email: string, purpose: "EMAIL_VERIFY" | "PASSWORD_RESET") {
  return api<{ ok: true }>("/api/auth/resend-otp", {
    method: "POST",
    body: JSON.stringify({ email, purpose }),
  });
}

export async function forgotPassword(email: string) {
  return api<{ ok: true }>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyResetOtp(email: string, code: string) {
  return api<{ resetToken: string; expiresInSeconds: number }>(
    "/api/auth/verify-reset-otp",
    { method: "POST", body: JSON.stringify({ email, code }) },
  );
}

export async function resetPassword(resetToken: string, password: string) {
  return api<{ ok: true }>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ resetToken, password }),
  });
}

export async function logout() {
  try {
    await api<{ ok: true }>("/api/auth/logout", { method: "POST" });
  } finally {
    clearAccessToken();
  }
}

export async function fetchMe() {
  return api<{ user: ApiUser; prefs: ReminderPrefs }>("/api/users/me");
}
