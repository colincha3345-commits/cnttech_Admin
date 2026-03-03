/**
 * 회원 그룹 관련 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { memberGroupService } from '@/services/memberGroupService';
import type { MemberGroupFormData } from '@/types/member-segment';

/**
 * 그룹 목록 조회
 */
export function useMemberGroups(params?: {
  page?: number;
  limit?: number;
  keyword?: string;
}) {
  const { page = 1, limit = 10, keyword = '' } = params || {};

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-groups', page, limit, keyword],
    queryFn: () => memberGroupService.getGroups({ page, limit, keyword }),
  });

  return {
    groups: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,
  };
}

/**
 * 그룹 상세 조회
 */
export function useMemberGroup(groupId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-group', groupId],
    queryFn: () => memberGroupService.getGroup(groupId!),
    enabled: !!groupId,
  });

  return {
    group: data,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 그룹 회원 목록 조회
 */
export function useGroupMembers(
  groupId: string | undefined,
  params?: {
    page?: number;
    limit?: number;
  }
) {
  const { page = 1, limit = 10 } = params || {};

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['group-members', groupId, page, limit],
    queryFn: () => memberGroupService.getGroupMembers(groupId!, { page, limit }),
    enabled: !!groupId,
  });

  return {
    members: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,
  };
}

/**
 * 그룹 생성 mutation
 */
export function useCreateGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: MemberGroupFormData) => memberGroupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-groups'] });
    },
  });

  return {
    createGroup: mutation.mutate,
    createGroupAsync: mutation.mutateAsync,
    isCreating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * 그룹 수정 mutation
 */
export function useUpdateGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MemberGroupFormData> }) =>
      memberGroupService.updateGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member-groups'] });
      queryClient.invalidateQueries({ queryKey: ['member-group', variables.id] });
    },
  });

  return {
    updateGroup: mutation.mutate,
    updateGroupAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * 그룹 삭제 mutation
 */
export function useDeleteGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: string) => memberGroupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['member-groups'] });
    },
  });

  return {
    deleteGroup: mutation.mutate,
    deleteGroupAsync: mutation.mutateAsync,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * 그룹에 회원 추가 mutation
 */
export function useAddMembersToGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ groupId, memberIds }: { groupId: string; memberIds: string[] }) =>
      memberGroupService.addMembersToGroup(groupId, memberIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member-groups'] });
      queryClient.invalidateQueries({ queryKey: ['member-group', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupId] });
    },
  });

  return {
    addMembers: mutation.mutate,
    addMembersAsync: mutation.mutateAsync,
    isAdding: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * 그룹에서 회원 제거 mutation
 */
export function useRemoveMembersFromGroup() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ groupId, memberIds }: { groupId: string; memberIds: string[] }) =>
      memberGroupService.removeMembersFromGroup(groupId, memberIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['member-groups'] });
      queryClient.invalidateQueries({ queryKey: ['member-group', variables.groupId] });
      queryClient.invalidateQueries({ queryKey: ['group-members', variables.groupId] });
    },
  });

  return {
    removeMembers: mutation.mutate,
    removeMembersAsync: mutation.mutateAsync,
    isRemoving: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * 회원별 그룹 조회
 */
export function useMemberGroupsForMember(memberId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-groups-for-member', memberId],
    queryFn: () => memberGroupService.getMemberGroups(memberId!),
    enabled: !!memberId,
  });

  return {
    groups: data || [],
    isLoading,
    error,
    refetch,
  };
}
