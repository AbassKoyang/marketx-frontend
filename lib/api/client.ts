import axios, { AxiosError, AxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    _isRetry?: boolean;
  }
}

const SESSION_HINT_COOKIE = "marketx_session";
const NO_REFRESH_PATHS = ["/auth/google/", "/auth/refresh/", "/auth/login/", "/auth/logout/"];

const hasSessionHint = () => 
  typeof document !== "undefined" && 
  document.cookie.split("; ").some((c) => c === `${SESSION_HINT_COOKIE}=1`);

const clearSessionHint = () => {
  if (typeof document !== "undefined") {
    document.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; path=/`;
  }
};

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(messageFromData(data) || `Request failed with status ${status}.`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
  get fieldErrors(): Record<string, string> {
    return fieldErrorsFromData(this.data);
  }
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value;
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => firstString(item))
      .filter((item): item is string => Boolean(item));
    return parts.length ? parts.join(" ") : null;
  }
  return null;
}

function messageFromData(data: unknown): string | null {
  if (typeof data === "string") return data;
  if (!data || typeof data !== "object") return null;
  const record = data as Record<string, unknown>;
  const direct = firstString(record.detail) ?? firstString(record.error);
  if (direct) return direct;
  for (const value of Object.values(record)) {
    const found = firstString(value);
    if (found) return found;
  }
  return null;
}

function fieldErrorsFromData(data: unknown): Record<string, string> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (key === "detail" || key === "error") continue;
    const message = firstString(value);
    if (message) result[key] = message;
  }
  return result;
}

// 2. Core Axios Instance
export const apiClient = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Cache-Control": "no-store" },
});

let refreshPromise: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .post("/auth/refresh/", {}, { _isRetry: true })
      .then(() => true)
      .catch((err: AxiosError) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          clearSessionHint();
        }
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const config = error.config;
    const status = error.response?.status;
    const isRefreshPath = NO_REFRESH_PATHS.some((path) => config?.url?.startsWith(path)); 

    if (status === 401 && hasSessionHint() && !isRefreshPath && config && !config._isRetry) {
      config._isRetry = true;
      const success = await refreshSession();
      if (success) return apiClient(config);
    }

    if (status) {
      throw new ApiError(status, error.response?.data);
    }
    throw error;
  }
);

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (isApiError(error)) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
