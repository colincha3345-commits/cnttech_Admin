/**
 * 앱회원 목록 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appMemberService } from '@/services/appMemberService';
import type { MemberListFilter } from '@/types/app-member';
import type { MemberGrade, MemberStatus, MemberSearchFilter } from '@/types/member';

interface UseAppMembersParams {
  filter?: MemberListFilter;
  searchType?: MemberSearchFilter['searchType'];
  searchKeyword?: string;
  grades?: MemberGrade[];
  statuses?: MemberStatus[];
  dateType?: MemberSearchFilter['dateType'];
  dateFrom?: string;
  dateTo?: string;
  marketingAgreed?: boolean;
  page?: number;
  limit?: number;
}

export function useAppMembers(params: UseAppMembersParams = {}) {
  const {
    filter = 'all',
    searchType = 'all',
    searchKeyword = '',
    grades = [],
    statuses = [],
    dateType,
    dateFrom,
    dateTo,
    marketingAgreed,
    page = 1,
    limit = 10,
  } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['app-members', filter, searchType, searchKeyword, grades, statuses, dateType, dateFrom, dateTo, marketingAgreed, page, limit],
    queryFn: () =>
      appMemberService.getMembers({
        filter,
        searchType,
        searchKeyword,
        grades,
        statuses,
        dateType,
        dateFrom,
        dateTo,
        marketingAgreed,
        page,
        limit,
      }),
  });

  return {
    members: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,
  };
}

export function useAppMemberStats() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['app-member-stats'],
    queryFn: () => appMemberService.getMemberStats(),
  });

  return {
    stats: data || { total: 0, inactive90Days: 0, noOrder: 0 },
    isLoading,
    error,
    refetch,
  };
}

// 회원 상세 정보 Hook
export function useAppMember(memberId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['app-member', memberId],
    queryFn: () => (memberId ? appMemberService.getMember(memberId) : null),
    enabled: !!memberId,
  });

  return {
    member: data,
    isLoading,
    error,
    refetch,
  };
}

// 앱 사용 로그 Hook
interface UseUsageLogsParams {
  memberId: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function useUsageLogs(params: UseUsageLogsParams) {
  const { memberId, action, dateFrom, dateTo, page = 1, limit = 10 } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['usage-logs', memberId, action, dateFrom, dateTo, page, limit],
    queryFn: () =>
      appMemberService.getUsageLogs(memberId, {
        action: action as any,
        dateFrom,
        dateTo,
        page,
        limit,
      }),
    enabled: !!memberId,
  });

  return {
    logs: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,
  };
}

// 주문 내역 Hook
interface UseOrdersParams {
  memberId: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export function useMemberOrders(params: UseOrdersParams) {
  const { memberId, status, dateFrom, dateTo, page = 1, limit = 10 } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-orders', memberId, status, dateFrom, dateTo, page, limit],
    queryFn: () =>
      appMemberService.getOrders(memberId, {
        status: status as any,
        dateFrom,
        dateTo,
        page,
        limit,
      }),
    enabled: !!memberId,
  });

  return {
    orders: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,
  };
}

// 포인트 이력 Hook
interface UsePointHistoryParams {
  memberId: string;
  type?: string;
  page?: number;
  limit?: number;
}

export function usePointHistory(params: UsePointHistoryParams) {
  const { memberId, type, page = 1, limit = 10 } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['point-history', memberId, type, page, limit],
    queryFn: () =>
      appMemberService.getPointHistory(memberId, {
        type: type as any,
        page,
        limit,
      }),
    enabled: !!memberId,
  });

  return {
    history: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    summary: data?.summary || { currentBalance: 0, totalEarned: 0, totalUsed: 0, expiringSoon: 0 },
    isLoading,
    error,
    refetch,
  };
}

// 쿠폰 이력 Hook
interface UseCouponsParams {
  memberId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useMemberCoupons(params: UseCouponsParams) {
  const { memberId, status, page = 1, limit = 10 } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-coupons', memberId, status, page, limit],
    queryFn: () =>
      appMemberService.getCoupons(memberId, {
        status: status as any,
        page,
        limit,
      }),
    enabled: !!memberId,
  });

  return {
    coupons: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    summary: data?.summary || { availableCount: 0, usedCount: 0, expiredCount: 0 },
    isLoading,
    error,
    refetch,
  };
}

// 교환권 이력 Hook
interface UseVouchersParams {
  memberId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export function useMemberVouchers(params: UseVouchersParams) {
  const { memberId, status, page = 1, limit = 10 } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-vouchers', memberId, status, page, limit],
    queryFn: () =>
      appMemberService.getVouchers(memberId, {
        status: status as any,
        page,
        limit,
      }),
    enabled: !!memberId,
  });

  return {
    vouchers: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,
  };
}

// 알림 발송 이력 Hook
interface UseNotificationsParams {
  memberId: string;
  type?: string;
  channel?: string;
  page?: number;
  limit?: number;
}

export function useMemberNotifications(params: UseNotificationsParams) {
  const { memberId, type, channel, page = 1, limit = 10 } = params;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-notifications', memberId, type, channel, page, limit],
    queryFn: () =>
      appMemberService.getNotifications(memberId, {
        type: type as any,
        channel: channel as any,
        page,
        limit,
      }),
    enabled: !!memberId,
  });

  return {
    notifications: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    isLoading,
    error,
    refetch,
  };
}

// 회원 포인트 수동 조정 Hook
export function useAdjustPoint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Parameters<typeof appMemberService.adjustPoint>[0]) =>
      appMemberService.adjustPoint(params),
    onSuccess: (_, variables) => {
      // 포인트 조정 성공 시, 연관된 쿼리들을 무효화하여 새로운 데이터를 패치합니다.
      queryClient.invalidateQueries({ queryKey: ['point-history', variables.memberId] });
      queryClient.invalidateQueries({ queryKey: ['app-member', variables.memberId] });
      queryClient.invalidateQueries({ queryKey: ['app-members'] });
    },
  });
}

// 회원 쿠폰 수동 조정 Hook
export function useAdjustCoupon() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: Parameters<typeof appMemberService.adjustCoupon>[0]) =>
      appMemberService.adjustCoupon(params),
    onSuccess: (_, variables) => {
      // 쿠폰 조정 성공 시, 연관된 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['member-coupons', variables.memberId] });
      queryClient.invalidateQueries({ queryKey: ['app-member', variables.memberId] });
    },
  });
}
