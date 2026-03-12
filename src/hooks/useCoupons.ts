/**
 * 쿠폰 관리 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponService, type CouponListParams } from '@/services/couponService';
import type { CouponFormData } from '@/types/coupon';

export function useCouponList(params?: CouponListParams) {
  return useQuery({
    queryKey: ['coupons', 'list', params],
    queryFn: () => couponService.getCoupons(params),
  });
}

export function useCoupon(id: string | undefined) {
  return useQuery({
    queryKey: ['coupon', id],
    queryFn: () => couponService.getCouponById(id!),
    enabled: !!id,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CouponFormData) => couponService.createCoupon(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CouponFormData }) =>
      couponService.updateCoupon(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
      queryClient.invalidateQueries({ queryKey: ['coupon', variables.id] });
    },
  });
}

export function useSuspendCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, gracePeriodDays }: { id: string; gracePeriodDays: number }) =>
      couponService.suspendCoupon(id, gracePeriodDays),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useActivateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.activateCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useDuplicateCoupon() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.duplicateCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coupons'] });
    },
  });
}

export function useCouponStats() {
  return useQuery({
    queryKey: ['coupons', 'stats'],
    queryFn: () => couponService.getStats(),
  });
}
