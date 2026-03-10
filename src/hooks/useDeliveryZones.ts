/**
 * 상권(배달 구역) 관리 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryZoneService } from '@/services/deliveryZoneService';
import type {
  DeliveryZoneFormData,
  DeliveryZoneListParams,
} from '@/types/delivery-zone';

/**
 * 상권 목록 조회
 */
export function useDeliveryZones(params?: DeliveryZoneListParams) {
  return useQuery({
    queryKey: ['deliveryZones', params],
    queryFn: () => deliveryZoneService.getDeliveryZones(params),
  });
}

/**
 * 상권 단건 조회
 */
export function useDeliveryZone(id: string | undefined) {
  return useQuery({
    queryKey: ['deliveryZone', id],
    queryFn: () => deliveryZoneService.getDeliveryZone(id!),
    enabled: !!id,
  });
}

/**
 * 상권 생성
 */
export function useCreateDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DeliveryZoneFormData) =>
      deliveryZoneService.createDeliveryZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryZones'] });
    },
  });
}

/**
 * 상권 수정
 */
export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DeliveryZoneFormData> }) =>
      deliveryZoneService.updateDeliveryZone(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['deliveryZones'] });
      queryClient.invalidateQueries({ queryKey: ['deliveryZone', variables.id] });
    },
  });
}

/**
 * 상권 삭제
 */
export function useDeleteDeliveryZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deliveryZoneService.deleteDeliveryZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryZones'] });
    },
  });
}
