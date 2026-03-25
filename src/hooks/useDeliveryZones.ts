/**
 * 상권(배달 구역) 관리 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deliveryZoneService } from '@/services/deliveryZoneService';
import type {
  DeliveryZoneFormData,
  DeliveryZoneListParams,
  SubZoneInterval,
} from '@/types/delivery-zone';

/**
 * 상권 목록 조회
 */
export function useDeliveryZones(params?: DeliveryZoneListParams) {
  const query = useQuery({
    queryKey: ['deliveryZones', params],
    queryFn: () => deliveryZoneService.getDeliveryZones(params),
    enabled: params !== undefined, // params 없이 전체 조회 방지
  });

  return {
    ...query,
    zones: query.data?.data ?? [],
    pagination: query.data?.pagination ?? null,
  };
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

/**
 * 반경 기반 소상권 일괄 생성
 */
export function useCreateSubZonesBatch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ mainZoneId, intervals }: { mainZoneId: string; intervals: SubZoneInterval[] }) =>
      deliveryZoneService.createSubZonesBatch(mainZoneId, intervals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveryZones'] });
    },
  });
}

/**
 * 메인상권의 소상권 목록 조회
 */
export function useSubZones(mainZoneId: string | undefined) {
  return useQuery({
    queryKey: ['subZones', mainZoneId],
    queryFn: () => deliveryZoneService.getSubZones(mainZoneId!),
    enabled: !!mainZoneId,
  });
}
