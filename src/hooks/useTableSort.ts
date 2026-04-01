/**
 * 테이블 소팅 공통 훅
 * 수동 <table> 및 DataTable 모두에서 사용 가능
 */
import { useState, useMemo } from 'react';

export type SortOrder = 'asc' | 'desc';

interface UseTableSortReturn<T> {
  sortKey: string;
  sortOrder: SortOrder;
  handleSort: (key: string) => void;
  sortData: (data: T[]) => T[];
}

export function useTableSort<T>(defaultKey = '', defaultOrder: SortOrder = 'asc'): UseTableSortReturn<T> {
  const [sortKey, setSortKey] = useState(defaultKey);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultOrder);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortData = useMemo(() => {
    return (data: T[]) => {
      if (!sortKey) return data;

      return [...data].sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[sortKey];
        const bVal = (b as Record<string, unknown>)[sortKey];

        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return 1;
        if (bVal == null) return -1;

        let comparison = 0;
        if (aVal instanceof Date && bVal instanceof Date) {
          comparison = aVal.getTime() - bVal.getTime();
        } else if (typeof aVal === 'number' && typeof bVal === 'number') {
          comparison = aVal - bVal;
        } else {
          comparison = String(aVal).localeCompare(String(bVal), 'ko');
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    };
  }, [sortKey, sortOrder]);

  return { sortKey, sortOrder, handleSort, sortData };
}
