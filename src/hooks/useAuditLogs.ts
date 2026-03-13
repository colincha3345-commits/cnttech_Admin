/**
 * 감사 로그 React Query 훅
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auditService } from '@/services/auditService';
import { useToast } from '@/hooks/useToast';
import type { AuditLogFilter, AuditAction, AuditAlarmConfig } from '@/types/audit';

const AUDIT_KEYS = {
  logs: (params?: Record<string, unknown>) => ['audit', 'logs', params] as const,
  alarmConfig: (userId: string) => ['audit', 'alarmConfig', userId] as const,
};

interface AuditLogParams {
  userId?: string;
  action?: AuditAction[];
  page?: number;
  limit?: number;
}

/**
 * 감사 로그 목록 조회
 */
export function useAuditLogs() {
  const [params, setParams] = useState<AuditLogParams>({});

  const { data, isLoading } = useQuery({
    queryKey: AUDIT_KEYS.logs(params as Record<string, unknown>),
    queryFn: () => auditService.getLogs(params as AuditLogFilter),
  });

  const logs = data?.data ?? [];
  const pagination = data?.pagination ?? null;

  const fetchLogs = (newParams?: AuditLogParams) => {
    setParams(newParams ?? {});
  };

  return { logs, pagination, isLoading, fetchLogs };
}

/**
 * 감사 알람 설정
 */
export function useAuditAlarmConfig(userId: string) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: alarmConfig } = useQuery({
    queryKey: AUDIT_KEYS.alarmConfig(userId),
    queryFn: () => auditService.getAlarmConfig(userId).then((res) => res.data),
  });

  const updateMutation = useMutation({
    mutationFn: (config: Partial<AuditAlarmConfig>) =>
      auditService.updateAlarmConfig(userId, config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: AUDIT_KEYS.alarmConfig(userId) });
      toast.success('보안 설정이 저장되었습니다.');
    },
    onError: () => {
      toast.error('보안 설정 저장에 실패했습니다.');
    },
  });

  return { alarmConfig: alarmConfig ?? null, updateAlarmConfig: updateMutation.mutate };
}
