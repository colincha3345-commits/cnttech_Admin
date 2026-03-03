/**
 * 멤버십 등급 관리 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { membershipGradeService, type MembershipGradeListParams } from '@/services/membershipGradeService';
import type { MembershipGradeFormData } from '@/types/membership-grade';

export function useMembershipGrades(params?: MembershipGradeListParams) {
  return useQuery({
    queryKey: ['membership-grades', 'list', params],
    queryFn: () => membershipGradeService.getGrades(params),
  });
}

export function useMembershipGrade(id?: string) {
  return useQuery({
    queryKey: ['membership-grades', 'detail', id],
    queryFn: () => membershipGradeService.getGradeById(id!),
    enabled: !!id,
  });
}

export function useMembershipGradeStats() {
  return useQuery({
    queryKey: ['membership-grades', 'stats'],
    queryFn: () => membershipGradeService.getStats(),
  });
}

export function useCreateMembershipGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MembershipGradeFormData) => membershipGradeService.createGrade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-grades'] });
    },
  });
}

export function useUpdateMembershipGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: MembershipGradeFormData }) =>
      membershipGradeService.updateGrade(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-grades'] });
    },
  });
}

export function useDeleteMembershipGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => membershipGradeService.deleteGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-grades'] });
    },
  });
}

export function useDuplicateMembershipGrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => membershipGradeService.duplicateGrade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-grades'] });
    },
  });
}

export function useReorderMembershipGrades() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gradeIds: string[]) => membershipGradeService.reorderGrades(gradeIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-grades'] });
    },
  });
}
