/**
 * 직원 초대/승인 관련 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import type {
  StaffType,
  PasswordSetupData,
} from '@/types/staff';

interface UsePendingApprovalsParams {
  staffType?: StaffType;
  page?: number;
  limit?: number;
}

/**
 * 초대 토큰 검증
 */
export function useValidateInvitation(token: string | null) {
  return useQuery({
    queryKey: ['invitation-validation', token],
    queryFn: () => staffService.validateInvitationToken(token!),
    enabled: !!token,
    retry: false,
    staleTime: 0, // 항상 최신 상태 확인
  });
}

/**
 * 비밀번호 설정 (초대 수락)
 */
export function useSetPassword() {
  return useMutation({
    mutationFn: (data: PasswordSetupData) =>
      staffService.setPasswordByToken(data),
  });
}

/**
 * 승인 대기 목록 조회
 */
export function usePendingApprovals(params?: UsePendingApprovalsParams) {
  return useQuery({
    queryKey: ['pending-approvals', params],
    queryFn: () => staffService.getPendingApprovals(params),
    refetchInterval: 30000, // 30초마다 자동 갱신
  });
}

/**
 * 승인 대기 건수 조회 (네비게이션 뱃지용)
 */
export function usePendingApprovalCount() {
  return useQuery({
    queryKey: ['pending-approval-count'],
    queryFn: () => staffService.getPendingApprovalCount(),
    refetchInterval: 60000, // 1분마다 자동 갱신
  });
}

/**
 * 직원 승인
 */
export function useApproveStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ staffId, approverId }: { staffId: string; approverId: string }) =>
      staffService.approveStaff(staffId, approverId),
    onSuccess: () => {
      // 모든 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approval-count'] });
      queryClient.invalidateQueries({ queryKey: ['headquarters-staff'] });
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}

/**
 * 직원 거절
 */
export function useRejectStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      staffId,
      rejectorId,
      reason,
    }: {
      staffId: string;
      rejectorId: string;
      reason?: string;
    }) => staffService.rejectStaff(staffId, rejectorId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
      queryClient.invalidateQueries({ queryKey: ['pending-approval-count'] });
      queryClient.invalidateQueries({ queryKey: ['headquarters-staff'] });
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}
