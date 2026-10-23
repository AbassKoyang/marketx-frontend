"use client"

import * as React from "react"
import {
  QueryClient,
  QueryClientProvider,
  type DefaultOptions,
} from "@tanstack/react-query"

import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import { isApiError } from "@/lib/api/client"

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (isApiError(error)) {
    if ([400, 401, 403, 404, 405, 422].includes(error.status)) return false
  }
  return failureCount < 2
}

const defaultOptions: DefaultOptions = {
  queries: {
    staleTime: 20_000,
    gcTime: 5 * 60_000,
    retry: shouldRetry,
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: false,
  },
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions,
      })
  )

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="top-center"
          offset={{ top: 20 }}
          mobileOffset={{ top: 16 }}
          duration={4200}
          visibleToasts={3}
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
