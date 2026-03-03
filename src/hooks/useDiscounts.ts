/**
 * 할인 관리 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { discountService, type DiscountListParams } from '@/services/discountService';
import type { DiscountFormData } from '@/types/discount';

export function useDiscountList(params?: DiscountListParams) {
  return useQuery({
    queryKey: ['discounts', 'list', params],
    queryFn: () => discountService.getDiscounts(params),
  });
}

export function useDiscount(id: string | undefined) {
  return useQuery({
    queryKey: ['discount', id],
    queryFn: () => discountService.getDiscountById(id!),
    enabled: !!id,
  });
}

export function useCreateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DiscountFormData) => discountService.createDiscount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

export function useUpdateDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: DiscountFormData }) =>
      discountService.updateDiscount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
      queryClient.invalidateQueries({ queryKey: ['discount', variables.id] });
    },
  });
}

export function useDeleteDiscount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => discountService.deleteDiscount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discounts'] });
    },
  });
}

export function useDiscountStats() {
  return useQuery({
    queryKey: ['discounts', 'stats'],
    queryFn: () => discountService.getStats(),
  });
}
