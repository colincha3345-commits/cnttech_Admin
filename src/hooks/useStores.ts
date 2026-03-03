import { useState, useEffect, useCallback } from 'react';
import { storeService } from '@/services/storeService';
import type { StoreSummary, Region } from '@/types/store';

// 기존 호환성을 위한 타입 alias
type Store = StoreSummary;

interface UseStoresOptions {
  region?: Region;
  autoLoad?: boolean;
}

interface UseStoresReturn {
  stores: Store[];
  loading: boolean;
  error: string | null;
  refetch: (params?: { region?: Region; search?: string }) => Promise<void>;
}

/**
 * 가맹점 관리 훅
 * Clean Architecture: Presentation ↔ Application 레이어 연결
 *
 * @deprecated 새로운 기능에는 useStoreSummaries() 훅 사용을 권장합니다.
 */
export const useStores = (options: UseStoresOptions = {}): UseStoresReturn => {
  const { region, autoLoad = true } = options;

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 가맹점 목록 조회
  const fetchStores = useCallback(async (params?: { region?: Region; search?: string }) => {
    setLoading(true);
    setError(null);

    try {
      // storeService를 통해 StoreSummary 목록 조회
      const data = await storeService.getStoreSummaries({
        region: params?.region,
      });

      // search 필터링 (클라이언트 측)
      let result = data;
      if (params?.search) {
        const search = params.search.toLowerCase();
        result = data.filter(
          (s) =>
            s.name.toLowerCase().includes(search) ||
            s.address.toLowerCase().includes(search)
        );
      }

      setStores(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '가맹점 목록을 불러오는데 실패했습니다';
      setError(errorMessage);
      console.error('Failed to fetch stores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      fetchStores({ region });
    }
  }, [autoLoad, region, fetchStores]);

  return {
    stores,
    loading,
    error,
    refetch: fetchStores,
  };
};
