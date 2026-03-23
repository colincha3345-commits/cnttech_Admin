/**
 * 본사 직원 관리 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import type {
  StaffInviteFormData,
  StaffAccountUpdateData,
  StaffStatus,
} from '@/types/staff';

interface UseHeadquartersStaffParams {
  teamId?: string;
  status?: StaffStatus;
  keyword?: string;
  page?: number;
  limit?: number;
}

/**
 * 본사 직원 목록 조회
 */
export function useHeadquartersStaff(params?: UseHeadquartersStaffParams) {
  return useQuery({
    queryKey: ['headquarters-staff', params],
    queryFn: () => staffService.getHeadquartersStaff(params),
  });
}

/**
 * 직원 상세 조회
 */
export function useStaff(staffId: string | undefined) {
  return useQuery({
    queryKey: ['staff', staffId],
    queryFn: () => staffService.getStaffById(staffId!),
    enabled: !!staffId,
  });
}

/**
 * 본사 직원 초대 (초대 메일 발송)
 */
export function useInviteHeadquartersStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StaffInviteFormData) =>
      staffService.inviteHeadquartersStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['headquarters-staff'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] }); // 팀 인원수 업데이트
    },
  });
}

/**
 * @deprecated useInviteHeadquartersStaff 사용 권장
 * 기존 호환성을 위해 유지 (inviteHeadquartersStaff로 연결)
 */
export function useCreateHeadquartersStaff() {
  return useInviteHeadquartersStaff();
}

/**
 * 본사 직원 수정
 */
export function useUpdateHeadquartersStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: StaffAccountUpdateData }) =>
      staffService.updateHeadquartersStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['headquarters-staff'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

/**
 * 본사 직원 삭제
 */
export function useDeleteHeadquartersStaff() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffService.deleteHeadquartersStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['headquarters-staff'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

/**
 * 아이디 중복 확인
 */
export function useCheckLoginIdDuplicate() {
  return useMutation({
    mutationFn: (loginId: string) => staffService.checkLoginIdDuplicate(loginId),
  });
}

/**
 * 비밀번호 초기화
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (id: string) => staffService.resetPassword(id),
  });
}

/**
 * 비밀번호 변경 (본인)
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({ id, currentPassword, newPassword }: { id: string; currentPassword: string; newPassword: string }) =>
      staffService.changePassword(id, currentPassword, newPassword),
  });
}

/**
 * 초대 재발송
 */
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffService.resendInvitation(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['headquarters-staff'] });
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}

/**
 * 초대 취소
 */
export function useCancelInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (staffId: string) => staffService.cancelInvitation(staffId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['headquarters-staff'] });
      queryClient.invalidateQueries({ queryKey: ['franchise-staff'] });
    },
  });
}
