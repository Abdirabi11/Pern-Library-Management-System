"use client";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { toast } from "react-hot-toast";

export const analyticsKeys = {
    root: ["analytics"] as const,
  
    stats: ["analytics", "stats"] as const,
  
    topBorrowed: (limit: number) => ["analytics", "topBorrowed", limit] as const,
  
    activeUsers: (limit: number) => ["analytics", "activeUsers", limit] as const,
  
    monthlyBorrow: (year?: number) =>
      ["analytics", "monthlyBorrow", year] as const,
  
    requestTrends: (since?: string) =>
      ["analytics", "requestTrends", since] as const,
  
    borrowedReturned: ["analytics", "borrowedReturned"] as const,
  
    systemUsage: (period?: string) =>
      ["analytics", "systemUsage", period] as const,
};

function handleError(err: any) {
    const msg = err?.response?.data?.message ?? err?.message ?? "Something went wrong";
    toast.error(msg);
}

export function useStatsQuery(){
    return useQuery({
        queryKey: analyticsKeys.stats,
        queryFn: () => analyticsService.getStats(),
        staleTime: 1000 * 60 * 2,
        onError: handleError,
    })
};

export function useTopBorrowedQuery(limit= 10){
    return useQuery({
        queryKey: analyticsKeys.topBorrowed(limit),
        queryFn: () => analyticsService.getTopBorrowed(limit),
        staleTime: 1000 * 60 * 5,
        onError: handleError,
    });
};

export function useActiveUsersQuery(limit= 10){
    return useQuery({
        queryKey: analyticsKeys.activeUsers(limit),
        queryFn: () => analyticsService.getActiveUsers(limit),
        staleTime: 1000 * 60 * 5,
        onError: handleError,
    });
};

export function useMonthlyBorrowStatsQuery(year?: number) {
    return useQuery({
        queryKey: analyticsKeys.monthlyBorrow(year),
        queryFn: () => analyticsService.getMonthlyBorrowStats(year),
        enabled: !!year,
        onError: handleError,
    });
};

export function useRequestTrendsQuery(since?: string) {
    return useQuery({
        queryKey: analyticsKeys.requestTrends(since),
        queryFn: () => analyticsService.getRequestTrends(since),
        staleTime: 1000 * 30,
        onError: handleError,
    });
};

export function useBorrowedVsReturnedQuery() {
    return useQuery({
        queryKey: analyticsKeys.borrowedReturned,
        queryFn: () => analyticsService.getBorrowedVsReturned(),
        staleTime: 1000 * 30,
        onError: handleError,
    });
};
  
export function useSystemUsageQuery(period?: string) {
    return useQuery({
        queryKey: analyticsKeys.systemUsage(period),
        queryFn: () => analyticsService.getSystemUsage(period),
        staleTime: 1000 * 30,
        onError: handleError,
    })
};