/**
 * 주문관리 React Query 훅
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/orderService';
import type { OrderSearchFilter, OrderCancelRequest, OrderMemoRequest, PaymentItemCancelRequest, DiscountCancelType } from '@/types/order';
import type { OrderStatus } from '@/types/app-member';

export function useOrderList(params?: OrderSearchFilter, options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['orders', 'list', params],
    queryFn: () => orderService.getOrders(params),
    refetchInterval: options?.refetchInterval,
  });
}

export function useOrder(id?: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id!),
    enabled: !!id,
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['orders', 'stats'],
    queryFn: () => orderService.getStats(),
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: OrderCancelRequest }) =>
      orderService.cancelOrder(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      orderService.updateOrderStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}

export function useAddOrderMemo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: OrderMemoRequest }) =>
      orderService.addMemo(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}

export function useCancelPaymentItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, request }: { orderId: string; request: PaymentItemCancelRequest }) =>
      orderService.cancelPaymentItem(orderId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useCancelDiscountItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, type }: { orderId: string; type: DiscountCancelType }) =>
      orderService.cancelDiscountItem(orderId, type),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useAbnormalOrderList(params?: OrderSearchFilter, options?: { refetchInterval?: number | false }) {
  return useQuery({
    queryKey: ['orders', 'abnormal', params],
    queryFn: () => orderService.getAbnormalOrders(params),
    refetchInterval: options?.refetchInterval ?? 30000,
  });
}

export function useAbnormalOrderCount() {
  return useQuery({
    queryKey: ['orders', 'abnormal', 'count'],
    queryFn: () => orderService.getAbnormalCount(),
    refetchInterval: 30000,
  });
}

export function useOrdersForExport(params?: Omit<OrderSearchFilter, 'page' | 'limit'>) {
  return useQuery({
    queryKey: ['orders', 'export', params],
    queryFn: () => orderService.getAllOrders(params),
    enabled: false,
  });
}
