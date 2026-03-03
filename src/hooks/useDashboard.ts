import { useQuery } from '@tanstack/react-query';
import type { DashboardDateRange } from '@/types';
import { dashboardService } from '@/services/dashboardService';
import { auditService } from '@/services/auditService';

export function useDashboard(dateRange?: DashboardDateRange) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['dashboard', 'stats', dateRange?.preset, dateRange?.from?.getTime(), dateRange?.to?.getTime()],
    queryFn: () => dashboardService.getStats(dateRange),
  });

  return {
    stats: data?.data,
    isLoading,
    error,
    refetch,
  };
}

export function useMarketingStats(dateRange?: DashboardDateRange) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'marketing', dateRange?.preset, dateRange?.from?.getTime(), dateRange?.to?.getTime()],
    queryFn: () => dashboardService.getMarketingStats(dateRange),
  });

  return {
    marketingStats: data?.data,
    isLoading,
  };
}

export function useRecentLogins(limit: number = 10) {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'recentLogins', limit],
    queryFn: () => auditService.getRecentLogins(limit),
  });

  return {
    recentLogins: data?.data ?? [],
    isLoading,
  };
}

export function useDashboardExport(dateRange?: DashboardDateRange) {
  const { data, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', 'export', dateRange?.preset],
    queryFn: () => dashboardService.getExportData(dateRange),
    enabled: false,
  });

  return {
    exportData: data?.data,
    fetchExportData: refetch,
    isExporting: isFetching,
  };
}
