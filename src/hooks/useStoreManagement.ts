/**
 * 매장 관리 Hooks
 * 매장 CRUD 및 매장-직원 연결 관리
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { storeService, type StoreListParams } from '@/services/storeService';
import type {
  StoreFormData,
  StoreStaffLinkFormData,
  StoreStaffLink,
  Region,
  StoreStatus,
  OperatingInfoFormData,
  IntegrationCodesFormData,
  AmenitiesFormData,
  PaymentMethodsFormData,
} from '@/types/store';

// ============================================
// 매장 조회
// ============================================

/**
 * 매장 목록 조회 (페이지네이션)
 */
export function useStoreList(params?: StoreListParams) {
  return useQuery({
    queryKey: ['stores', 'list', params],
    queryFn: () => storeService.getStores(params),
  });
}

/**
 * 매장 요약 목록 조회 (셀렉터용)
 */
export function useStoreSummaries(params?: {
  region?: Region;
  status?: StoreStatus;
}) {
  return useQuery({
    queryKey: ['stores', 'summaries', params],
    queryFn: () => storeService.getStoreSummaries(params),
  });
}

/**
 * 매장 상세 조회
 */
export function useStore(storeId: string | undefined) {
  return useQuery({
    queryKey: ['store', storeId],
    queryFn: () => storeService.getStore(storeId!),
    enabled: !!storeId,
  });
}

/**
 * 매장 상세 조회 (연결된 직원 포함)
 */
export function useStoreWithStaff(storeId: string | undefined) {
  return useQuery({
    queryKey: ['store', storeId, 'withStaff'],
    queryFn: () => storeService.getStoreWithStaff(storeId!),
    enabled: !!storeId,
  });
}

// ============================================
// 매장 생성/수정/삭제
// ============================================

/**
 * 매장 생성
 */
export function useCreateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreFormData) => storeService.createStore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * 매장 수정
 */
export function useUpdateStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StoreFormData> }) =>
      storeService.updateStore(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
      queryClient.invalidateQueries({ queryKey: ['store', variables.id] });
    },
  });
}

/**
 * 매장 삭제
 */
export function useDeleteStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => storeService.deleteStore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

// ============================================
// 매장-직원 연결 관리
// ============================================

/**
 * 직원이 연결된 매장 목록 조회
 */
export function useStaffStores(staffId: string | undefined) {
  return useQuery({
    queryKey: ['staffStores', staffId],
    queryFn: () => storeService.getStoresForStaff(staffId!),
    enabled: !!staffId,
  });
}

/**
 * 해당 매장에 연결되지 않은 직원 목록 조회 (연결 모달용)
 */
export function useUnlinkedStaff(storeId: string | undefined) {
  return useQuery({
    queryKey: ['unlinkedStaff', storeId],
    queryFn: () => storeService.getUnlinkedStaff(storeId!),
    enabled: !!storeId,
  });
}

/**
 * 직원을 매장에 연결
 */
export function useLinkStaffToStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StoreStaffLinkFormData) =>
      storeService.linkStaffToStore(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['store', variables.storeId, 'withStaff'],
      });
      queryClient.invalidateQueries({
        queryKey: ['unlinkedStaff', variables.storeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['staffStores', variables.staffId],
      });
    },
  });
}

/**
 * 직원-매장 연결 해제
 */
export function useUnlinkStaffFromStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) => storeService.unlinkStaffFromStore(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store'] });
      queryClient.invalidateQueries({ queryKey: ['unlinkedStaff'] });
      queryClient.invalidateQueries({ queryKey: ['staffStores'] });
    },
  });
}

/**
 * 매장 연결 정보 업데이트 (역할/주매장 변경)
 */
export function useUpdateStoreStaffLink() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      linkId,
      data,
    }: {
      linkId: string;
      data: Partial<Pick<StoreStaffLink, 'role' | 'isPrimary'>>;
    }) => storeService.updateStoreStaffLink(linkId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store'] });
      queryClient.invalidateQueries({ queryKey: ['staffStores'] });
    },
  });
}

// ============================================
// 영업정보/연동/노출설정 업데이트
// ============================================

/**
 * 영업 정보 업데이트
 */
export function useUpdateOperatingInfo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: string;
      data: OperatingInfoFormData;
    }) => storeService.updateOperatingInfo(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * 연동 코드 정보 업데이트
 */
export function useUpdateIntegrationCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: string;
      data: IntegrationCodesFormData;
    }) => storeService.updateIntegrationCodes(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * 결제 수단 업데이트
 */
export function useUpdatePaymentMethods() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: string;
      data: PaymentMethodsFormData;
    }) => storeService.updatePaymentMethods(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * 편의시설 정보 업데이트
 */
export function useUpdateAmenities() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      storeId,
      data,
    }: {
      storeId: string;
      data: AmenitiesFormData;
    }) => storeService.updateAmenities(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['store', variables.storeId] });
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

// ============================================
// 검증
// ============================================

/**
 * 사업자번호 중복 확인
 */
export function useCheckBusinessNumber() {
  return useMutation({
    mutationFn: ({
      businessNumber,
      excludeId,
    }: {
      businessNumber: string;
      excludeId?: string;
    }) => storeService.checkBusinessNumberDuplicate(businessNumber, excludeId),
  });
}

/**
 * 매장 코드 중복 확인
 */
export function useCheckStoreCode() {
  return useMutation({
    mutationFn: ({ code, excludeId }: { code: string; excludeId?: string }) =>
      storeService.checkStoreCodeDuplicate(code, excludeId),
  });
}

// ============================================
// 통계
// ============================================

/**
 * 매장 통계 조회 (대시보드용)
 */
export function useStoreStats() {
  return useQuery({
    queryKey: ['stores', 'stats'],
    queryFn: () => storeService.getStoreStats(),
  });
}

// ============================================
// 일괄 업로드 (Bulk Upload)
// ============================================

/**
 * POS 일괄 업로드 미리보기
 */
export function usePreviewPOSBulkUpload() {
  return useMutation({
    mutationFn: (rows: Parameters<typeof storeService.previewPOSBulkUpload>[0]) =>
      storeService.previewPOSBulkUpload(rows),
  });
}

/**
 * POS 일괄 업로드 실행
 */
export function useExecutePOSBulkUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: Parameters<typeof storeService.executePOSBulkUpload>[0]) =>
      storeService.executePOSBulkUpload(rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}

/**
 * PG 일괄 업로드 미리보기
 */
export function usePreviewPGBulkUpload() {
  return useMutation({
    mutationFn: (rows: Parameters<typeof storeService.previewPGBulkUpload>[0]) =>
      storeService.previewPGBulkUpload(rows),
  });
}

/**
 * PG 일괄 업로드 실행
 */
export function useExecutePGBulkUpload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rows: Parameters<typeof storeService.executePGBulkUpload>[0]) =>
      storeService.executePGBulkUpload(rows),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stores'] });
    },
  });
}
