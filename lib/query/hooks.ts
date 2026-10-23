"use client"

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useRouter } from "next/navigation"

import {
  api,
  type MarketListParams,
  type PageParams,
} from "@/lib/api/endpoints"
import type {
  Market,
  OnboardingPayload,
  PriceHistoryRange,
  SubmitOrderPayload,
  UpdateProfilePayload,
  UserProfile,
} from "@/lib/api/types"
import { nextPageNumber } from "@/lib/query/pagination"
import { queryKeys } from "@/lib/query/keys"

export function useMe() {
  return useQuery<UserProfile>({
    queryKey: queryKeys.me,
    queryFn: api.auth.me,
    retry: false,
    staleTime: 60_000,
  })
}

export function useAuth() {
  const query = useMe()
  return {
    ...query,
    user: query.data ?? null,
    isAuthenticated: Boolean(query.data),
    isUnauthenticated: query.isError,
  }
}

export function useGoogleLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (token: string) => {
      await api.auth.google(token)
      return api.auth.me()
    },
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user)
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: api.auth.logout,
    onSettled: () => {
      queryClient.clear()
      router.replace("/")
    },
  })
}

export function useOnboard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: OnboardingPayload) => api.auth.onboard(payload),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user)
      queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number
      payload: UpdateProfilePayload
    }) => api.auth.updateProfile(id, payload),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.me, user)
    },
  })
}

export function useWallet(enabled = true) {
  return useQuery({
    queryKey: queryKeys.wallet,
    queryFn: api.wallet.detail,
    enabled,
    staleTime: 15_000,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: api.markets.categories,
    staleTime: 5 * 60_000,
  })
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.category(slug),
    queryFn: () => api.markets.category(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60_000,
  })
}

export function useMarkets(params: MarketListParams = {}, enabled = true) {
  return useQuery({
    queryKey: queryKeys.markets(params),
    queryFn: () => api.markets.list(params),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useInfiniteMarkets(params: MarketListParams = {}, enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.markets(params),
    queryFn: ({ pageParam }) =>
      api.markets.list({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => nextPageNumber(lastPage.next),
    enabled,
    placeholderData: keepPreviousData,
  })
}

export function useMarket(slug: string) {
  return useQuery<Market>({
    queryKey: queryKeys.market(slug),
    queryFn: () => api.markets.detail(slug),
    enabled: Boolean(slug),
    refetchInterval: 20_000,
  })
}

export function useMarketStats(slug: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.marketStats(slug),
    queryFn: () => api.markets.stats(slug),
    enabled: Boolean(slug) && enabled,
    refetchInterval: 15_000,
  })
}

export function usePriceHistory(
  outcomeId: number | null,
  range: PriceHistoryRange
) {
  return useQuery({
    queryKey: queryKeys.outcomeHistory(outcomeId ?? 0, range),
    queryFn: () => api.markets.history(outcomeId as number, range),
    enabled: outcomeId !== null,
    staleTime: 15_000,
    refetchInterval: 30_000,
  })
}

export function useOrderBook(outcomeId: number | null) {
  return useQuery({
    queryKey: queryKeys.orderBook(outcomeId ?? 0),
    queryFn: () => api.trading.orderBook(outcomeId as number),
    enabled: outcomeId !== null,
    refetchInterval: 10_000,
  })
}

export function useTrades(
  params: PageParams & { outcome?: number; mine?: boolean } = {}
) {
  return useInfiniteQuery({
    queryKey: queryKeys.trades(params),
    queryFn: ({ pageParam }) =>
      api.trading.trades({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => nextPageNumber(lastPage.next),
    refetchInterval: 25_000,
  })
}

export function useActivity(params: PageParams & { outcome?: number } = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.activity(params),
    queryFn: ({ pageParam }) =>
      api.trading.activity({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => nextPageNumber(lastPage.next),
    refetchInterval: 30_000,
  })
}

export function useOrders(
  params: PageParams & { outcome?: number; active?: boolean; status?: string } = {},
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: queryKeys.orders(params),
    queryFn: ({ pageParam }) =>
      api.trading.orders({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => nextPageNumber(lastPage.next),
    enabled,
  })
}

export function usePositions(
  params: PageParams & { outcome?: number } = {},
  enabled = true
) {
  return useInfiniteQuery({
    queryKey: queryKeys.positions(params),
    queryFn: ({ pageParam }) =>
      api.trading.positions({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => nextPageNumber(lastPage.next),
    enabled,
  })
}

export function usePositionSummary(enabled = true) {
  return useQuery({
    queryKey: queryKeys.positionSummary,
    queryFn: api.trading.positionSummary,
    enabled,
  })
}

export function useWalletLedger(enabled = true) {
  return useInfiniteQuery({
    queryKey: queryKeys.ledger({}),
    queryFn: ({ pageParam }) => api.wallet.ledger({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => nextPageNumber(lastPage.next),
    enabled,
  })
}

function useInvalidateTradingState() {
  const queryClient = useQueryClient()

  return (outcomeId?: number) => {
    queryClient.invalidateQueries({ queryKey: ["orders"] })
    queryClient.invalidateQueries({ queryKey: ["positions"] })
    queryClient.invalidateQueries({ queryKey: ["trades"] })
    queryClient.invalidateQueries({ queryKey: ["activity"] })
    queryClient.invalidateQueries({ queryKey: queryKeys.wallet })
    queryClient.invalidateQueries({ queryKey: ["market"] })
    queryClient.invalidateQueries({ queryKey: ["outcome"] })
    if (outcomeId) {
      queryClient.invalidateQueries({
        queryKey: ["outcome", outcomeId],
      })
    }
  }
}

export function useSubmitOrder() {
  const invalidate = useInvalidateTradingState()

  return useMutation({
    mutationFn: (payload: SubmitOrderPayload) =>
      api.trading.submitOrder(payload),
    onSuccess: (_order, variables) => {
      invalidate(variables.outcome)
    },
  })
}

export function useCancelOrder() {
  const invalidate = useInvalidateTradingState()

  return useMutation({
    mutationFn: (id: number) => api.trading.cancelOrder(id),
    onSuccess: () => {
      invalidate()
    },
  })
}
