/**
 * 앱회원 서비스
 */
import { mockMembers } from '@/lib/api/mockData';
import {
  mockAppUsageLogs,
  mockMemberOrders,
  mockPointHistory,
  mockMemberCoupons,
  mockMemberVouchers,
  mockMemberNotifications,
  mockInactiveUsageLogs,
} from '@/lib/api/mockAppMemberData';
import {
  getCampaignParticipantIds,
} from '@/lib/api/mockCampaignData';
import {
  getGroupMemberIds,
} from '@/lib/api/mockMemberGroupData';
import type { Member, MemberSearchFilter, MemberGrade, MemberStatus, WithdrawnRecord } from '@/types/member';
import type {
  AppUsageLog,
  AppAction,
  MemberOrder,
  OrderStatus,
  PointHistory,
  PointType,
  PointSummary,
  PointAdjustRequest,
  MemberCoupon,
  MemberCouponStatus,
  CouponSummary,
  CouponAdjustRequest,
  MemberVoucher,
  VoucherStatus,
  MemberNotification,
  NotificationType,
  NotificationChannel,
  MemberListFilter,
} from '@/types/app-member';
import type { MemberSegmentFilter, AgeRange } from '@/types/member-segment';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

class AppMemberService {
  private members: Member[] = [...mockMembers];
  private usageLogs: AppUsageLog[] = [...mockAppUsageLogs, ...mockInactiveUsageLogs];
  private orders: MemberOrder[] = [...mockMemberOrders];
  private pointHistory: PointHistory[] = [...mockPointHistory];
  private coupons: MemberCoupon[] = [...mockMemberCoupons];
  private vouchers: MemberVoucher[] = [...mockMemberVouchers];
  private notifications: MemberNotification[] = [...mockMemberNotifications];
  private withdrawnRecords: WithdrawnRecord[] = [];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // 회원 목록 조회
  // ============================================
  async getMembers(params: {
    filter?: MemberListFilter;
    searchType?: MemberSearchFilter['searchType'];
    searchKeyword?: string;
    grades?: MemberGrade[];
    statuses?: MemberStatus[];
    dateType?: MemberSearchFilter['dateType'];
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Member[]; pagination: Pagination }> {
    await this.delay();

    const {
      filter = 'all',
      searchType = 'all',
      searchKeyword = '',
      grades = [],
      statuses = [],
      dateType,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10,
    } = params;

    let result = [...this.members];

    // 필터별 분기
    switch (filter) {
      case 'inactive_30days':
        result = this.filterInactive30Days(result);
        break;
      case 'inactive_90days':
        result = this.filterInactive90Days(result);
        break;
      case 'no_order':
        result = this.filterNoOrder(result);
        break;
      default:
        // 'all' - 필터 없음
        break;
    }

    // 텍스트 검색
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      result = result.filter((m) => {
        switch (searchType) {
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

    // 등급 필터
    if (grades.length > 0) {
      result = result.filter((m) => grades.includes(m.grade));
    }

    // 상태 필터
    if (statuses.length > 0) {
      result = result.filter((m) => statuses.includes(m.status));
    }

    // 날짜 범위 필터
    if (dateType && (dateFrom || dateTo)) {
      const fromDate = dateFrom ? new Date(dateFrom) : null;
      const toDate = dateTo ? new Date(dateTo + 'T23:59:59') : null;

      result = result.filter((m) => {
        let target: Date | null = null;
        switch (dateType) {
          case 'registeredAt':
            target = m.registeredAt;
            break;
          case 'lastLoginAt':
            target = m.lastLoginAt;
            break;
          case 'lastOrderDate':
            target = m.lastOrderDate;
            break;
        }
        if (!target) return false;
        if (fromDate && target < fromDate) return false;
        if (toDate && target > toDate) return false;
        return true;
      });
    }

    // 전체 수
    const total = result.length;

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 회원 통계
  async getMemberStats(): Promise<{
    total: number;
    inactive30Days: number;
    inactive90Days: number;
    noOrder: number;
  }> {
    await this.delay(100);

    return {
      total: this.members.length,
      inactive30Days: this.filterInactive30Days(this.members).length,
      inactive90Days: this.filterInactive90Days(this.members).length,
      noOrder: this.filterNoOrder(this.members).length,
    };
  }

  // ============================================
  // 회원 상세 조회
  // ============================================
  async getMember(id: string): Promise<Member | null> {
    await this.delay();
    return this.members.find((m) => m.id === id) || null;
  }

  // ============================================
  // 앱 사용 로그
  // ============================================
  async getUsageLogs(
    memberId: string,
    params?: {
      action?: AppAction;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: AppUsageLog[]; pagination: Pagination }> {
    await this.delay();

    const { action, dateFrom, dateTo, page = 1, limit = 10 } = params || {};

    let result = this.usageLogs.filter((log) => log.memberId === memberId);

    // 액션 필터
    if (action) {
      result = result.filter((log) => log.action === action);
    }

    // 날짜 필터
    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((log) => log.createdAt >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((log) => log.createdAt <= to);
    }

    // 최신순 정렬
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // 주문 내역
  // ============================================
  async getOrders(
    memberId: string,
    params?: {
      status?: OrderStatus;
      dateFrom?: string;
      dateTo?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: MemberOrder[]; pagination: Pagination }> {
    await this.delay();

    const { status, dateFrom, dateTo, page = 1, limit = 10 } = params || {};

    let result = this.orders.filter((order) => order.memberId === memberId);

    if (status) {
      result = result.filter((order) => order.status === status);
    }

    if (dateFrom) {
      const from = new Date(dateFrom);
      result = result.filter((order) => order.orderDate >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter((order) => order.orderDate <= to);
    }

    // 최신순 정렬
    result.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // 포인트 이력
  // ============================================
  async getPointHistory(
    memberId: string,
    params?: {
      type?: PointType;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: PointHistory[]; pagination: Pagination; summary: PointSummary }> {
    await this.delay();

    const { type, page = 1, limit = 10 } = params || {};

    let result = this.pointHistory.filter((p) => p.memberId === memberId);

    if (type) {
      result = result.filter((p) => p.type === type);
    }

    // 최신순 정렬
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // 요약 계산
    const member = this.members.find((m) => m.id === memberId);
    const allHistory = this.pointHistory.filter((p) => p.memberId === memberId);
    const summary: PointSummary = {
      currentBalance: member?.pointBalance || 0,
      totalEarned: allHistory
        .filter((p) => p.amount > 0)
        .reduce((sum, p) => sum + p.amount, 0),
      totalUsed: Math.abs(
        allHistory
          .filter((p) => p.amount < 0)
          .reduce((sum, p) => sum + p.amount, 0)
      ),
      expiringSoon: allHistory
        .filter((p) => {
          if (!p.expiresAt) return false;
          const thirtyDaysLater = new Date();
          thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
          return p.expiresAt <= thirtyDaysLater && p.amount > 0;
        })
        .reduce((sum, p) => sum + p.amount, 0),
    };

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    };
  }

  // 포인트 수동 조정
  async adjustPoint(request: PointAdjustRequest): Promise<PointHistory> {
    await this.delay();

    const member = this.members.find((m) => m.id === request.memberId);
    if (!member) {
      throw new Error('회원을 찾을 수 없습니다.');
    }

    const amount =
      request.type === 'earn_manual' ? Math.abs(request.amount) : -Math.abs(request.amount);

    // 회수 시 잔액 체크
    if (amount < 0 && member.pointBalance < Math.abs(amount)) {
      throw new Error('포인트가 부족합니다.');
    }

    // 잔액 업데이트
    member.pointBalance += amount;

    const newHistory: PointHistory = {
      id: `point-${Date.now()}`,
      memberId: request.memberId,
      type: request.type,
      amount,
      balance: member.pointBalance,
      description: request.reason,
      adminId: 'admin-1', // 현재 로그인 관리자 ID
      adminMemo: request.reason,
      createdAt: new Date(),
      expiresAt: amount > 0 ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) : undefined,
    };

    this.pointHistory.unshift(newHistory);

    return newHistory;
  }

  // ============================================
  // 쿠폰 이력
  // ============================================
  async getCoupons(
    memberId: string,
    params?: {
      status?: MemberCouponStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: MemberCoupon[]; pagination: Pagination; summary: CouponSummary }> {
    await this.delay();

    const { status, page = 1, limit = 10 } = params || {};

    let result = this.coupons.filter((c) => c.memberId === memberId);

    if (status) {
      result = result.filter((c) => c.status === status);
    }

    // 최신순 정렬
    result.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());

    // 요약 계산
    const allCoupons = this.coupons.filter((c) => c.memberId === memberId);
    const summary: CouponSummary = {
      availableCount: allCoupons.filter((c) => c.status === 'available').length,
      usedCount: allCoupons.filter((c) => c.status === 'used').length,
      expiredCount: allCoupons.filter((c) => c.status === 'expired').length,
    };

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary,
    };
  }

  // 쿠폰 수동 조정
  async adjustCoupon(request: CouponAdjustRequest): Promise<MemberCoupon> {
    await this.delay();

    if (request.type === 'withdraw') {
      // 회수
      const coupon = this.coupons.find(
        (c) => c.memberId === request.memberId && c.couponId === request.couponId && c.status === 'available'
      );
      if (!coupon) {
        throw new Error('회수 가능한 쿠폰을 찾을 수 없습니다.');
      }
      coupon.status = 'withdrawn';
      coupon.adminMemo = request.reason;
      return coupon;
    } else {
      // 지급
      const newCoupon: MemberCoupon = {
        id: `mc-${Date.now()}`,
        memberId: request.memberId,
        couponId: request.couponId,
        couponName: '수동 지급 쿠폰', // 실제로는 couponId로 쿠폰 정보 조회
        discountType: 'fixed',
        discountValue: 3000,
        status: 'available',
        issuedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        adminId: 'admin-1',
        adminMemo: request.reason,
      };
      this.coupons.unshift(newCoupon);
      return newCoupon;
    }
  }

  // ============================================
  // 교환권 이력
  // ============================================
  async getVouchers(
    memberId: string,
    params?: {
      status?: VoucherStatus;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: MemberVoucher[]; pagination: Pagination }> {
    await this.delay();

    const { status, page = 1, limit = 10 } = params || {};

    let result = this.vouchers.filter((v) => v.memberId === memberId);

    if (status) {
      result = result.filter((v) => v.status === status);
    }

    // 최신순 정렬
    result.sort((a, b) => b.registeredAt.getTime() - a.registeredAt.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // 알림 발송 이력
  // ============================================
  async getNotifications(
    memberId: string,
    params?: {
      type?: NotificationType;
      channel?: NotificationChannel;
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: MemberNotification[]; pagination: Pagination }> {
    await this.delay();

    const { type, channel, page = 1, limit = 10 } = params || {};

    let result = this.notifications.filter((n) => n.memberId === memberId);

    if (type) {
      result = result.filter((n) => n.notificationType === type);
    }

    if (channel) {
      result = result.filter((n) => n.channel === channel);
    }

    // 최신순 정렬
    result.sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ============================================
  // 세그먼트 필터링
  // ============================================

  /**
   * 세그먼트 조건으로 회원 조회
   */
  async getMembersBySegment(
    filter: MemberSegmentFilter,
    page: number = 1,
    limit: number = 10
  ): Promise<{ data: Member[]; pagination: Pagination; totalCount: number }> {
    await this.delay();

    let result = [...this.members];

    // 기본 정보 필터
    if (filter.grades && filter.grades.length > 0) {
      result = result.filter((m) => filter.grades!.includes(m.grade));
    }

    if (filter.statuses && filter.statuses.length > 0) {
      result = result.filter((m) => filter.statuses!.includes(m.status));
    }

    if (filter.gender) {
      result = result.filter((m) => m.gender === filter.gender);
    }

    // 연령대 필터
    if (filter.ageRange) {
      result = this.filterByAge(result, filter.ageRange);
    }

    // 가입일 범위 필터
    if (filter.registeredDateRange) {
      const { from, to } = filter.registeredDateRange;
      if (from) {
        const fromDate = new Date(from);
        result = result.filter((m) => m.registeredAt >= fromDate);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        result = result.filter((m) => m.registeredAt <= toDate);
      }
    }

    // 수신 동의 필터
    if (filter.consentFilters && filter.consentFilters.length > 0) {
      filter.consentFilters.forEach((cf) => {
        result = result.filter((m) => {
          switch (cf.type) {
            case 'marketing':
              return m.marketingAgreed === cf.agreed;
            case 'push':
              return m.pushEnabled === cf.agreed;
            case 'sms':
              return m.smsEnabled === cf.agreed;
            case 'email':
              return m.emailEnabled === cf.agreed;
            default:
              return true;
          }
        });
      });
    }

    // 주문 기간 필터
    if (filter.orderPeriod) {
      result = this.filterByOrderPeriod(result, filter.orderPeriod, filter.orderType);
    }

    // 주문 횟수 범위 필터
    if (filter.orderCountRange) {
      const { min, max } = filter.orderCountRange;
      if (min !== undefined) {
        result = result.filter((m) => m.orderCount >= min);
      }
      if (max !== undefined) {
        result = result.filter((m) => m.orderCount <= max);
      }
    }

    // 주문 금액 범위 필터
    if (filter.orderAmountRange) {
      const { min, max } = filter.orderAmountRange;
      if (min !== undefined) {
        result = result.filter((m) => m.totalOrderAmount >= min);
      }
      if (max !== undefined) {
        result = result.filter((m) => m.totalOrderAmount <= max);
      }
    }

    // 미주문 필터 (N일 이상)
    if (filter.noOrderDays !== undefined) {
      result = this.filterNoOrderDays(result, filter.noOrderDays);
    }

    // 쿠폰 사용 필터
    if (filter.couponFilter) {
      result = this.filterByCouponUsage(
        result,
        filter.couponFilter.couponIds || [],
        filter.couponFilter.used ?? true
      );
    }

    // 메뉴 주문 필터
    if (filter.menuFilter) {
      result = this.filterByMenuOrder(
        result,
        filter.menuFilter.productIds || [],
        filter.menuFilter.ordered ?? true
      );
    }

    // 캠페인 참여 필터
    if (filter.campaignFilter) {
      result = this.filterByCampaignParticipation(
        result,
        filter.campaignFilter.campaignIds || [],
        filter.campaignFilter.participated ?? true
      );
    }

    // 그룹 필터
    if (filter.groupIds && filter.groupIds.length > 0) {
      const groupMemberIds = new Set<string>();
      filter.groupIds.forEach((groupId) => {
        getGroupMemberIds(groupId).forEach((id) => groupMemberIds.add(id));
      });
      result = result.filter((m) => groupMemberIds.has(m.id));
    }

    // 전체 수
    const totalCount = result.length;

    // 페이지네이션
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
      totalCount,
    };
  }

  // ============================================
  // 필터링 헬퍼 메서드
  // ============================================
  private filterInactive30Days(members: Member[]): Member[] {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return members.filter((m) => !m.lastLoginAt || m.lastLoginAt < thirtyDaysAgo);
  }

  private filterInactive90Days(members: Member[]): Member[] {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return members.filter((m) => !m.lastLoginAt || m.lastLoginAt < ninetyDaysAgo);
  }

  private filterNoOrder(members: Member[]): Member[] {
    return members.filter((m) => m.orderCount === 0);
  }

  /**
   * 연령대 필터 (birthDate 기준)
   */
  private filterByAge(members: Member[], ageRange: AgeRange): Member[] {
    const today = new Date();

    return members.filter((m) => {
      if (!m.birthDate) return false;

      const birthDate = new Date(m.birthDate);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (ageRange.minAge !== undefined && age < ageRange.minAge) return false;
      if (ageRange.maxAge !== undefined && age > ageRange.maxAge) return false;

      return true;
    });
  }

  /**
   * 주문 기간 필터 (기간 내 주문이 있는 회원)
   */
  private filterByOrderPeriod(
    members: Member[],
    period: { from?: string; to?: string },
    orderType?: 'all' | 'delivery' | 'pickup'
  ): Member[] {
    const { from, to } = period;
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    if (toDate) toDate.setHours(23, 59, 59, 999);

    return members.filter((m) => {
      const memberOrders = this.orders.filter((o) => {
        if (o.memberId !== m.id) return false;
        if (fromDate && o.orderDate < fromDate) return false;
        if (toDate && o.orderDate > toDate) return false;
        if (orderType && orderType !== 'all' && o.orderType !== orderType) return false;
        return true;
      });
      return memberOrders.length > 0;
    });
  }

  /**
   * N일 이상 미주문 필터
   */
  private filterNoOrderDays(members: Member[], days: number): Member[] {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);

    return members.filter((m) => {
      if (!m.lastOrderDate) return true;
      return m.lastOrderDate < targetDate;
    });
  }

  /**
   * 쿠폰 사용 여부 필터
   */
  private filterByCouponUsage(
    members: Member[],
    couponIds: string[],
    used: boolean
  ): Member[] {
    if (couponIds.length === 0) {
      // 쿠폰 ID가 없으면 아무 쿠폰이나 사용/미사용 여부로 필터
      return members.filter((m) => {
        const memberCoupons = this.coupons.filter((c) => c.memberId === m.id);
        if (used) {
          return memberCoupons.some((c) => c.status === 'used');
        } else {
          return memberCoupons.every((c) => c.status !== 'used');
        }
      });
    }

    return members.filter((m) => {
      const memberCoupons = this.coupons.filter(
        (c) => c.memberId === m.id && couponIds.includes(c.couponId)
      );
      if (used) {
        return memberCoupons.some((c) => c.status === 'used');
      } else {
        return memberCoupons.length === 0 || memberCoupons.every((c) => c.status !== 'used');
      }
    });
  }

  /**
   * 메뉴 주문 여부 필터
   */
  private filterByMenuOrder(
    members: Member[],
    productIds: string[],
    ordered: boolean
  ): Member[] {
    if (productIds.length === 0) return members;

    return members.filter((m) => {
      const memberOrders = this.orders.filter((o) => o.memberId === m.id);
      const hasOrderedProducts = memberOrders.some((o) =>
        o.items.some((item) => productIds.includes(item.productId))
      );

      return ordered ? hasOrderedProducts : !hasOrderedProducts;
    });
  }

  /**
   * 캠페인 참여 필터
   */
  private filterByCampaignParticipation(
    members: Member[],
    campaignIds: string[],
    participated: boolean
  ): Member[] {
    if (campaignIds.length === 0) return members;

    // 캠페인 참여자 ID 목록 수집
    const participantIds = new Set<string>();
    campaignIds.forEach((cId) => {
      getCampaignParticipantIds(cId).forEach((id) => participantIds.add(id));
    });

    return members.filter((m) => {
      const hasParticipated = participantIds.has(m.id);
      return participated ? hasParticipated : !hasParticipated;
    });
  }

  // ============================================
  // 회원 탈퇴 처리
  // ============================================

  /**
   * 회원 탈퇴 처리
   * - Member 레코드 익명화 (개인정보 삭제)
   * - 주문 레코드 익명화
   * - WithdrawnRecord 생성 (CS 보관용)
   */
  async withdrawMember(memberId: string): Promise<void> {
    await this.delay();

    const memberIndex = this.members.findIndex((m) => m.id === memberId);
    if (memberIndex === -1) {
      throw new Error(`회원을 찾을 수 없습니다: ${memberId}`);
    }

    const member = this.members[memberIndex]!;

    // 1. Member 레코드 익명화
    const withdrawnAt = new Date();
    this.members[memberIndex] = {
      ...member,
      memberId: '', // 재가입 가능하게 로그인ID 초기화
      name: '탈퇴회원', // 익명화
      phone: '', // 삭제
      email: '', // 삭제
      ci: null, // CI 삭제
      birthDate: null, // 생년월일 삭제
      gender: null, // 성별 삭제
      linkedSns: [], // SNS 연동 삭제
      termsAgreements: [], // 약관 동의 이력 삭제
      favoriteStores: [], // 단골매장 삭제
      deliveryAddresses: [], // 배달지 주소 삭제
      status: 'withdrawn',
      withdrawnAt,
    };

    // 2. 해당 회원의 주문 레코드 익명화
    const anonymousId = `WITHDRAWN_${member.id}`;
    const memberOrders = this.orders.filter((o) => o.memberId === memberId);
    const orderNumbers = memberOrders.map((o) => o.orderNumber);

    memberOrders.forEach((order) => {
      const orderIndex = this.orders.findIndex((o) => o.id === order.id);
      if (orderIndex !== -1) {
        this.orders[orderIndex] = {
          ...order,
          memberName: '탈퇴회원',
          memberPhone: '',
        };
      }
    });

    // 3. WithdrawnRecord 생성 (CS 문의 대응용)
    if (orderNumbers.length > 0) {
      this.withdrawnRecords.push({
        anonymousId,
        orderNumbers,
        withdrawnAt,
      });
    }
  }

  /**
   * 탈퇴 회원 기록 조회 (CS 용)
   */
  async getWithdrawnRecord(anonymousId: string): Promise<WithdrawnRecord | null> {
    await this.delay(200);
    return this.withdrawnRecords.find((r) => r.anonymousId === anonymousId) ?? null;
  }
}

export const appMemberService = new AppMemberService();
