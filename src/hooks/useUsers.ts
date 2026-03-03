import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { userService } from '@/services/userService';
import type { UserStatus } from '@/types';

interface UseUsersParams {
  query?: string;
}

export function useUsers({ query = '' }: UseUsersParams = {}) {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['users', query],
    queryFn: () => userService.getUsers({ query }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      userService.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const unmaskMutation = useMutation({
    mutationFn: ({ userId, field }: { userId: string; field: string }) =>
      userService.unmaskUserData(userId, field),
  });

  return {
    users: data?.data || [],
    total: data?.meta?.total || 0,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
    unmaskData: unmaskMutation.mutateAsync,
    isUnmasking: unmaskMutation.isPending,
  };
}
