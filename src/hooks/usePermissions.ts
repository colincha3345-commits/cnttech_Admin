/**
 * 권한관리 React Query 훅
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UpdatePermissionRequest } from '@/types/permission';
import { permissionService } from '@/services/permissionService';

const PERMISSION_KEYS = {
  all: ['permissions'] as const,
  list: () => [...PERMISSION_KEYS.all, 'list'] as const,
  detail: (id: string) => [...PERMISSION_KEYS.all, 'detail', id] as const,
};

/** 전체 계정 권한 목록 */
export function useAccountPermissions() {
  return useQuery({
    queryKey: PERMISSION_KEYS.list(),
    queryFn: () => permissionService.getAccountPermissions(),
  });
}

/** 특정 계정 권한 조회 */
export function useAccountPermission(accountId: string) {
  return useQuery({
    queryKey: PERMISSION_KEYS.detail(accountId),
    queryFn: () => permissionService.getAccountPermissionById(accountId),
    enabled: !!accountId,
  });
}

/** 권한 수정/초기화 Mutation */
export function usePermissionMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: PERMISSION_KEYS.all });
  };

  const updateMutation = useMutation({
    mutationFn: ({ request, updatedBy }: { request: UpdatePermissionRequest; updatedBy: string }) =>
      permissionService.updateAccountPermission(request, updatedBy),
    onSuccess: invalidate,
  });

  const resetMutation = useMutation({
    mutationFn: ({ accountId, updatedBy }: { accountId: string; updatedBy: string }) =>
      permissionService.resetAccountPermission(accountId, updatedBy),
    onSuccess: invalidate,
  });

  return {
    updatePermission: updateMutation,
    resetPermission: resetMutation,
  };
}
