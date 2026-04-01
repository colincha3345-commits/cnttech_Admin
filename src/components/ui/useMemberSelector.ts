import { useState, useMemo } from 'react';
import { mockMembers } from '@/lib/api/mockData';
import type { MemberSearchFilter } from '@/types/member';

interface UseMemberSelectorProps {
  initialFilter?: Partial<MemberSearchFilter>;
}

export function useMemberSelector({ initialFilter }: UseMemberSelectorProps = {}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filter, setFilter] = useState<MemberSearchFilter>({
    searchType: 'all',
    searchKeyword: '',
    grades: [],
    statuses: ['active'],
    ...initialFilter,
  });

  const filteredMembers = useMemo(() => {
    let result = [...mockMembers];

    if (filter.searchKeyword) {
      const keyword = filter.searchKeyword.toLowerCase();
      result = result.filter((m) => {
        switch (filter.searchType) {
          case 'all':
            return (
              m.name.toLowerCase().includes(keyword) ||
              m.memberId.toLowerCase().includes(keyword) ||
              m.phone.includes(keyword) ||
              m.email.toLowerCase().includes(keyword)
            );
          case 'name':
            return m.name.toLowerCase().includes(keyword);
          case 'memberId':
            return m.memberId.toLowerCase().includes(keyword);
          case 'phone':
            return m.phone.includes(keyword);
          case 'email':
            return m.email.toLowerCase().includes(keyword);
          default:
            return true;
        }
      });
    }

    if (filter.grades && filter.grades.length > 0) {
      result = result.filter((m) => filter.grades!.includes(m.grade));
    }

    if (filter.statuses && filter.statuses.length > 0) {
      result = result.filter((m) => filter.statuses!.includes(m.status));
    }

    if (filter.registeredFrom) {
      const fromDate = new Date(filter.registeredFrom);
      result = result.filter((m) => m.registeredAt >= fromDate);
    }
    if (filter.registeredTo) {
      const toDate = new Date(filter.registeredTo);
      toDate.setHours(23, 59, 59, 999);
      result = result.filter((m) => m.registeredAt <= toDate);
    }

    if (filter.orderCountMin !== undefined) {
      result = result.filter((m) => m.orderCount >= filter.orderCountMin!);
    }
    if (filter.orderCountMax !== undefined) {
      result = result.filter((m) => m.orderCount <= filter.orderCountMax!);
    }

    if (filter.totalAmountMin !== undefined) {
      result = result.filter((m) => m.totalOrderAmount >= filter.totalAmountMin!);
    }
    if (filter.totalAmountMax !== undefined) {
      result = result.filter((m) => m.totalOrderAmount <= filter.totalAmountMax!);
    }

    if (filter.marketingAgreed !== undefined) {
      result = result.filter((m) => m.marketingAgreed === filter.marketingAgreed);
    }

    return result;
  }, [filter]);

  const toggleSelect = (memberId: string, selectedMemberIds: string[], onChange: (ids: string[]) => void, maxSelect?: number) => {
    const isSelected = selectedMemberIds.includes(memberId);
    let newSelected: string[];

    if (isSelected) {
      newSelected = selectedMemberIds.filter((id) => id !== memberId);
    } else {
      if (maxSelect && selectedMemberIds.length >= maxSelect) {
        alert(`최대 ${maxSelect}명까지만 선택할 수 있습니다.`);
        return;
      }
      newSelected = [...selectedMemberIds, memberId];
    }
    onChange(newSelected);
  };

  const getMemberById = (memberId: string) => mockMembers.find((m) => m.id === memberId);

  return {
    isExpanded,
    setIsExpanded,
    showFilters,
    setShowFilters,
    filter,
    setFilter,
    filteredMembers,
    toggleSelect,
    getMemberById,
  };
}
