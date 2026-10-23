import type { PaginatedResponse } from "@/lib/api/types"

export function nextPageNumber(next: string | null): number | null {
  if (!next) return null
  try {
    const url = new URL(next, "http://marketx.local")
    const page = Number(url.searchParams.get("page"))
    return Number.isFinite(page) && page > 0 ? page : null
  } catch {
    return null
  }
}

export function flattenPages<T>(pages: PaginatedResponse<T>[] | undefined): T[] {
  return pages?.flatMap((page) => page.results) ?? []
}

export function totalCount<T>(pages: PaginatedResponse<T>[] | undefined): number {
  return pages?.[0]?.count ?? 0
}
