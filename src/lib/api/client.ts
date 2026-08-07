import { clearAccessToken, getAccessToken } from "./token";

const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, message: string, code = "INTERNAL_ERROR", details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
  code?: string;
  errors?: unknown;
}

export async function api<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAccessToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  let body: Envelope<T> | null = null;
  try {
    body = (await res.json()) as Envelope<T>;
  } catch {
    throw new ApiError(res.status, res.statusText || "Invalid response from server");
  }

  if (!res.ok || body.success === false) {
    if (res.status === 401) clearAccessToken();
    throw new ApiError(
      res.status,
      body.message || "Request failed",
      body.code || "INTERNAL_ERROR",
      body.errors,
    );
  }

  return body.data;
}

export function apiUrl() {
  return API_URL;
}
