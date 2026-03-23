/**
 * 가맹점 직원 관리 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import type {
  StaffInviteFormData,
  StaffAccountUpdateData,
  StaffStatus,
} from '@/types/staff';

interface UseFranchiseStaffParams {
  storeId?: string;
  status?: StaffStatus;
  keyword?: string;
  page?: number;
  limit?: number;
}

/**
 * 가맹점 직원 목록 조회
 */
export function useFranchiseStaff(params?: UseFranchiseStaffParams) {
  return useQuery({
    queryKey: ['franchise-staff', params],
    queryFn: () => staffService.getFranchiseStaff(params),
  });
}

/**
 * 가맹점 직원 초대 (초대 메일 발송)
 */
export function useInviteFranchiseStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffInviteFormData) =>
      staffService.inviteFranchiseStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}

/**
 * @deprecated useInviteFranchiseStaff 사용 권장
 * 기존 호환성을 위해 유지 (inviteFranchiseStaff로 연결)
 */
export function useCreateFranchiseStaff() {
  return useInviteFranchiseStaff();
}

/**
 * 가맹점 직원 수정
 */
export function useUpdateFranchiseStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StaffAccountUpdateData }) =>
      staffService.updateFranchiseStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}

/**
 * 가맹점 직원 삭제
 */
export function useDeleteFranchiseStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffService.deleteFranchiseStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}

/**
 * 초대 재발송
 */
export function useResendFranchiseInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffService.resendInvitation(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}

/**
 * 초대 취소
 */
export function useCancelFranchiseInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffService.cancelInvitation(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}
