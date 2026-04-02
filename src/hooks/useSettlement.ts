/**
 * 정산 관리 React Query 훅
 */
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { settlementService } from '@/services/settlementService';
import type { SettlementSearchFilter } from '@/services/settlementService';
import type { SettlementStatus } from '@/types/settlement';
import { useToast } from '@/hooks/useToast';

const SETTLEMENT_KEYS = {
  list: (params?: Record<string, unknown>) => ['settlement', 'list', params] as const,
  detail: (id: string) => ['settlement', 'detail', id] as const,
};

interface SettlementListParams {
  keyword?: string;
  status?: SettlementStatus | '';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

/**
 * 정산 목록 조회
 */
export function useSettlements() {
  const [params, setParams] = useState<SettlementListParams>({});

  const { data, isLoading } = useQuery({
    queryKey: SETTLEMENT_KEYS.list(params as Record<string, unknown>),
    queryFn: () => settlementService.getSettlements(params as SettlementSearchFilter),
  });

  const settlements = data?.data ?? [];
  const pagination = data?.pagination ?? null;

  const fetchSettlements = (newParams?: SettlementListParams) => {
    setParams(newParams ?? {});
  };

  return { settlements, pagination, isLoading, fetchSettlements };
}

/**
 * 정산 상세 조회
 */
export function useSettlementDetail(id: string | undefined) {
  return useQuery({
    queryKey: SETTLEMENT_KEYS.detail(id!),
    queryFn: () => settlementService.getSettlementById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });
}

/**
 * 정산 실행
 */
export function useRunSettlement() {
  const toast = useToast();

  return useMutation({
    mutationFn: () => settlementService.runSettlement(),
    onSuccess: (res) => {
      toast.success(res.message);
    },
    onError: () => {
      toast.error('정산 실행에 실패했습니다.');
    },
  });
}
