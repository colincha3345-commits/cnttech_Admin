/**
 * 시스템 설정 Hook
 */
import { useQuery } from '@tanstack/react-query';
import { settingsService } from '@/services/settingsService';

export function useBrandConfig() {
  return useQuery({
    queryKey: ['brand-config'],
    queryFn: () => settingsService.getBrandConfig(),
    staleTime: 5 * 60 * 1000,
  });
}
