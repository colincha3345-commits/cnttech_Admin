/**
 * 팀 관리 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffService } from '@/services/staffService';
import type { TeamFormData } from '@/types/staff';

/**
 * 팀 목록 조회
 */
export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: () => staffService.getTeams(),
  });
}

/**
 * 팀 상세 조회
 */
export function useTeam(teamId: string | undefined) {
  return useQuery({
    queryKey: ['team', teamId],
    queryFn: () => staffService.getTeam(teamId!),
    enabled: !!teamId,
  });
}

/**
 * 팀 생성
 */
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TeamFormData) => staffService.createTeam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

/**
 * 팀 수정
 */
export function useUpdateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TeamFormData> }) =>
      staffService.updateTeam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}

/**
 * 팀 삭제
 */
export function useDeleteTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => staffService.deleteTeam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
}
