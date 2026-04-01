/**
 * 푸시 알림 관련 React Query 훅
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pushService } from '@/services/pushService';
import type { PushListParams, PushEstimateParams } from '@/types/push';

const PUSH_KEYS = {
  all: ['push'] as const,
  list: (params?: PushListParams) => [...PUSH_KEYS.all, 'list', params] as const,
  detail: (id: string) => [...PUSH_KEYS.all, 'detail', id] as const,
  recipients: (pushId: string, params?: Record<string, unknown>) =>
    [...PUSH_KEYS.all, 'recipients', pushId, params] as const,
  estimateCount: (params: PushEstimateParams) =>
    [...PUSH_KEYS.all, 'estimateCount', params] as const,
};

/** 푸시 목록 조회 */
export function usePushList(params?: PushListParams) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: PUSH_KEYS.list(params),
    queryFn: () => pushService.getList(params),
  });

  return {
    pushList: data?.data ?? [],
    pagination: data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    isLoading,
    refetch,
  };
}

/** 푸시 상세 조회 */
export function usePushDetail(id: string | undefined) {
  const { data, isLoading } = useQuery({
    queryKey: PUSH_KEYS.detail(id!),
    queryFn: () => pushService.getDetail(id!),
    enabled: !!id,
  });

  return { detail: data, isLoading };
}

/** 푸시 수신자 목록 조회 */
export function usePushRecipients(
  pushId: string | undefined,
  params?: { page?: number; limit?: number; status?: string },
) {
  const { data, isLoading } = useQuery({
    queryKey: PUSH_KEYS.recipients(pushId!, params),
    queryFn: () => pushService.getRecipients(pushId!, params),
    enabled: !!pushId,
  });

  return {
    recipients: data?.data ?? [],
    pagination: data?.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
    isLoading,
  };
}

/** 푸시 발송/예약 생성 */
export function useCreatePush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FormData) => pushService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUSH_KEYS.all });
    },
  });
}

/** 예상 발송 대상자 수 조회 */
export function usePushEstimateCount(params: PushEstimateParams) {
  const { data, isLoading } = useQuery({
    queryKey: PUSH_KEYS.estimateCount(params),
    queryFn: () => pushService.estimateCount(params),
  });

  return { estimatedCount: data?.count ?? 0, isLoading };
}

/** 자동 발송 활성/비활성 토글 */
export function useTogglePushStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pushService.toggleStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUSH_KEYS.all });
    },
  });
}

/** 푸시 취소 */
export function useCancelPush() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => pushService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PUSH_KEYS.all });
    },
  });
}
