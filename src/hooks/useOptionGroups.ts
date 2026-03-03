/**
 * 옵션 그룹 관리 React Query 훅
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { optionGroupService, type OptionGroupListParams } from '@/services/optionGroupService';
import type { OptionGroupFormData } from '@/types/product';

export function useOptionGroupList(params?: OptionGroupListParams) {
  return useQuery({
    queryKey: ['option-groups', 'list', params],
    queryFn: () => optionGroupService.getOptionGroups(params),
  });
}

export function useOptionGroup(id?: string) {
  return useQuery({
    queryKey: ['option-group', id],
    queryFn: () => optionGroupService.getOptionGroupById(id!),
    enabled: !!id,
  });
}

export function useCreateOptionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OptionGroupFormData) => optionGroupService.createOptionGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
    },
  });
}

export function useUpdateOptionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OptionGroupFormData }) =>
      optionGroupService.updateOptionGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
      queryClient.invalidateQueries({ queryKey: ['option-group', variables.id] });
    },
  });
}

export function useDeleteOptionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => optionGroupService.deleteOptionGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
    },
  });
}

export function useDuplicateOptionGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => optionGroupService.duplicateOptionGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-groups'] });
    },
  });
}

export function useAvailableOptions() {
  return useQuery({
    queryKey: ['available-options'],
    queryFn: () => optionGroupService.getAvailableOptions(),
  });
}

export function useAvailableProducts() {
  return useQuery({
    queryKey: ['available-products'],
    queryFn: () => optionGroupService.getAvailableProducts(),
  });
}

export function useOptionGroupStats() {
  return useQuery({
    queryKey: ['option-groups', 'stats'],
    queryFn: () => optionGroupService.getStats(),
  });
}
