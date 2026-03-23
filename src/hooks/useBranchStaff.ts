/**
 * 지사 직원 관리 Hook
 * [2026-03-23] 신규
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import type { StaffInviteFormData, StaffStatus } from '@/types/staff';

interface UseBranchStaffParams {
  branchId?: string;
  status?: StaffStatus;
  keyword?: string;
  page?: number;
  limit?: number;
}

export function useBranchStaff(params?: UseBranchStaffParams) {
  return useQuery({
    queryKey: ['branch-staff', params],
    queryFn: () => staffService.getBranchStaff(params),
  });
}

export function useInviteBranchStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffInviteFormData) => staffService.inviteBranchStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-staff'] });
    },
  });
}

export function useDeleteBranchStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffService.deleteBranchStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-staff'] });
    },
  });
}

export function useResendBranchInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffService.resendInvitation(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-staff'] });
    },
  });
}

export function useCancelBranchInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffService.cancelInvitation(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['branch-staff'] });
    },
  });
}
