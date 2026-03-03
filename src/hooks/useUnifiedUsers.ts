/**
 * 통합 유저 Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { unifiedUserService } from '@/services/unifiedUserService';
import type { UnifiedUserSearchFilter } from '@/types/unified-user';

/** 통합 유저 목록 */
export function useUnifiedUsers(params: UnifiedUserSearchFilter = {}) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unified-users', params],
    queryFn: () => unifiedUserService.getUsers(params),
  });

  return {
    users: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,
  };
}

/** 통합 유저 상세 */
export function useUnifiedUser(id: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unified-user', id],
    queryFn: () => (id ? unifiedUserService.getUserById(id) : null),
    enabled: !!id,
  });

  return {
    user: data?.data ?? null,
    isLoading,
    error,
    refetch,
  };
}

/** userType별 카운트 통계 */
export function useUnifiedUserStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['unified-user-stats'],
    queryFn: () => unifiedUserService.getUserStats(),
  });

  return {
    stats: data?.data || { customer: 0, franchise: 0, brand_admin: 0, guest: 0, event_participant: 0, total: 0 },
    isLoading,
    error,
    refetch,
  };
}
