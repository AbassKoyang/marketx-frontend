const API_ROOT = "/api"

const NO_REFRESH_PATHS = [
  "/auth/google/",
  "/auth/refresh/",
  "/auth/login/",
  "/auth/logout/",
]

type RequestOptions = RequestInit & {
  /** Internal escape hatch so a retried request cannot loop through refresh. */
  retryAuth?: boolean
}

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(status: number, data: unknown) {
    super(messageFromData(data) || `Request failed with status ${status}.`)
    this.name = "ApiError"
    this.status = status
    this.data = data
  }

  get fieldErrors(): Record<string, string> {
    return fieldErrorsFromData(this.data)
  }
}

function firstString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstString(item)
      if (found) return found
    }
  }
  return null
}

function messageFromData(data: unknown): string | null {
  if (typeof data === "string") return data
  if (!data || typeof data !== "object") return null

  const record = data as Record<string, unknown>
  const direct = firstString(record.detail) ?? firstString(record.error)
  if (direct) return direct

  for (const value of Object.values(record)) {
    const found = firstString(value)
    if (found) return found
  }

  return null
}

function fieldErrorsFromData(data: unknown): Record<string, string> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {}

  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (key === "detail" || key === "error") continue
    const message = firstString(value)
    if (message) result[key] = message
  }
  return result
}

let refreshPromise: Promise<RefreshResult> | null = null

type RefreshResult = { ok: boolean; status: number }

const SESSION_HINT_COOKIE = "marketx_session"

function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false
  return document.cookie
    .split("; ")
    .some((cookie) => cookie === `${SESSION_HINT_COOKIE}=1`)
}

function clearSessionHint(): void {
  if (typeof document === "undefined") return
  document.cookie = `${SESSION_HINT_COOKIE}=; Max-Age=0; path=/`
}

async function refreshSession(): Promise<RefreshResult> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_ROOT}/auth/refresh/`, {
      method: "POST",
      credentials: "include",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    })
      .then((response) => ({ ok: response.ok, status: response.status }))
      .catch(() => ({ ok: false, status: 0 }))
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

function buildUrl(path: string): string {
  return `${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export async function request<T>(
  path: string,
  { retryAuth = true, ...init }: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
    credentials: "include",
    cache: "no-store",
  })

  const canRefresh =
    retryAuth &&
    response.status === 401 &&
    hasSessionHint() &&
    !NO_REFRESH_PATHS.some((prefix) => path.startsWith(prefix))

  if (canRefresh) {
    const refreshed = await refreshSession()
    if (refreshed.ok) {
      return request<T>(path, { ...init, headers, retryAuth: false })
    }
    if (refreshed.status === 401 || refreshed.status === 403) {
      clearSessionHint()
    }
  }

  const data = await parseBody(response)

  if (!response.ok) {
    throw new ApiError(response.status, data)
  }

  return data as T
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError
}

export function errorMessage(error: unknown, fallback = "Something went wrong."): string {
  if (isApiError(error)) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}
