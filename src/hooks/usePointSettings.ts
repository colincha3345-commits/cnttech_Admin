/**
 * 포인트 설정 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pointService, type PointHistoryParams } from '@/services/pointService';
import type { PointSettingsFormData } from '@/types/point';

export function usePointSettings() {
  return useQuery({
    queryKey: ['point-settings'],
    queryFn: () => pointService.getSettings(),
  });
}

export function useUpdatePointSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PointSettingsFormData) => pointService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['point-settings'] });
    },
  });
}

export function usePointStats() {
  return useQuery({
    queryKey: ['point-stats'],
    queryFn: () => pointService.getStats(),
  });
}

export function useSystemPointHistory(params?: PointHistoryParams) {
  return useQuery({
    queryKey: ['system-point-history', params],
    queryFn: () => pointService.getHistory(params),
  });
}
