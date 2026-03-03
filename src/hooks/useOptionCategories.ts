/**
 * 옵션 카테고리 관리 React Query 훅
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { optionCategoryService, type OptionCategoryListParams } from '@/services/optionCategoryService';
import type { OptionCategoryFormData } from '@/types/product';

export function useOptionCategoryList(params?: OptionCategoryListParams) {
  return useQuery({
    queryKey: ['option-categories', 'list', params],
    queryFn: () => optionCategoryService.getOptionCategories(params),
  });
}

export function useOptionCategory(id?: string) {
  return useQuery({
    queryKey: ['option-category', id],
    queryFn: () => optionCategoryService.getOptionCategoryById(id!),
    enabled: !!id,
  });
}

export function useCreateOptionCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: OptionCategoryFormData) => optionCategoryService.createOptionCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-categories'] });
      queryClient.invalidateQueries({ queryKey: ['available-options'] });
    },
  });
}

export function useUpdateOptionCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OptionCategoryFormData }) =>
      optionCategoryService.updateOptionCategory(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['option-categories'] });
      queryClient.invalidateQueries({ queryKey: ['option-category', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['available-options'] });
    },
  });
}

export function useDeleteOptionCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => optionCategoryService.deleteOptionCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['option-categories'] });
      queryClient.invalidateQueries({ queryKey: ['available-options'] });
    },
  });
}

export function useCheckPosCodeDuplicate() {
  return useMutation({
    mutationFn: ({ posCode, excludeId }: { posCode: string; excludeId?: string }) =>
      optionCategoryService.checkPosCodeDuplicate(posCode, excludeId),
  });
}

export function useOptionCategoryStats() {
  return useQuery({
    queryKey: ['option-categories', 'stats'],
    queryFn: () => optionCategoryService.getStats(),
  });
}
