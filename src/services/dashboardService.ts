import { mockStats } from '@/lib/api/mockData';
import type {
  DashboardStats,
  DashboardDateRange,
  MarketingStats,
  MarketingPerformanceItem,
  DashboardExportData,
  OrderDetailsData,
  DailySalesItem,
  MemberAnalyticsData,
  ApiResponse,
} from '@/types';
import { delay } from '@/utils/async';

/** 마케팅 성과 Mock 데이터 */
const MOCK_MARKETING_ITEMS: MarketingPerformanceItem[] = [
  { id: 'b1', name: '신메뉴 출시 배너', type: 'banner', impressions: 45200, clicks: 3616, ctr: 8.0, conversions: 542, conversionRate: 15.0, trafficSource: '앱 메인', avgDwellTime: 32 },
  { id: 'b2', name: '봄 시즌 프로모션', type: 'banner', impressions: 38500, clicks: 2695, ctr: 7.0, conversions: 377, conversionRate: 14.0, trafficSource: '앱 메인', avgDwellTime: 28 },
  { id: 'b3', name: '멤버십 가입 유도', type: 'banner', impressions: 29800, clicks: 1788, ctr: 6.0, conversions: 268, conversionRate: 15.0, trafficSource: '앱 메인', avgDwellTime: 45 },
  { id: 'b4', name: '배달비 무료 이벤트', type: 'banner', impressions: 52100, clicks: 5731, ctr: 11.0, conversions: 860, conversionRate: 15.0, trafficSource: '푸시 알림', avgDwellTime: 22 },
  { id: 'b5', name: '포인트 2배 적립', type: 'banner', impressions: 33700, clicks: 2359, ctr: 7.0, conversions: 330, conversionRate: 14.0, trafficSource: '앱 메인', avgDwellTime: 18 },
  { id: 'e1', name: '설날 특별 이벤트', type: 'event', impressions: 62000, clicks: 8060, ctr: 13.0, conversions: 1209, conversionRate: 15.0, trafficSource: '푸시 알림', avgDwellTime: 65 },
  { id: 'e2', name: '친구 초대 이벤트', type: 'event', impressions: 41500, clicks: 4565, ctr: 11.0, conversions: 685, conversionRate: 15.0, trafficSource: '카카오톡 공유', avgDwellTime: 48 },
  { id: 'e3', name: '리뷰 작성 이벤트', type: 'event', impressions: 28900, clicks: 2312, ctr: 8.0, conversions: 347, conversionRate: 15.0, trafficSource: '앱 주문완료', avgDwellTime: 35 },
  { id: 'e4', name: '스탬프 적립 이벤트', type: 'event', impressions: 35200, clicks: 3168, ctr: 9.0, conversions: 475, conversionRate: 15.0, trafficSource: '앱 메인', avgDwellTime: 42 },
  { id: 'e5', name: '출석체크 이벤트', type: 'event', impressions: 48600, clicks: 5832, ctr: 12.0, conversions: 875, conversionRate: 15.0, trafficSource: '앱 메인', avgDwellTime: 15 },
];

/** 회원 분석 Mock 데이터 */
const MOCK_MEMBER_ANALYTICS: MemberAnalyticsData = {
  summary: { total: 88000, active: 62500, inactive: 18200, newSignup: 140, withdrawal: 8 },
  gender: [
    { label: '여성', value: 52.3, count: 46024 },
    { label: '남성', value: 44.1, count: 38808 },
    { label: '미지정', value: 3.6, count: 3168 },
  ],
  age: [
    { range: '10대', percentage: 4.2, count: 3696 },
    { range: '20대', percentage: 28.5, count: 25080 },
    { range: '30대', percentage: 32.1, count: 28248 },
    { range: '40대', percentage: 21.8, count: 19184 },
    { range: '50대', percentage: 9.6, count: 8448 },
    { range: '60대+', percentage: 3.8, count: 3344 },
  ],
  membership: [
    { grade: 'VIP', count: 2640, percentage: 3.0 },
    { grade: '골드', count: 8800, percentage: 10.0 },
    { grade: '실버', count: 22000, percentage: 25.0 },
    { grade: '브론즈', count: 54560, percentage: 62.0 },
  ],
  growth: { newCustomerRate: 18.5, newCustomerChange: 2.3, existingCustomerRate: 81.5, existingRetentionChange: -0.8, monthlyNewAvg: 4200, monthlyChurnAvg: 380 },
  topCustomers: [
    { rank: 1, name: '김**', totalOrders: 142, totalAmount: 4250000, lastOrder: '2026-03-22', grade: 'VIP' },
    { rank: 2, name: '이**', totalOrders: 128, totalAmount: 3890000, lastOrder: '2026-03-23', grade: 'VIP' },
    { rank: 3, name: '박**', totalOrders: 115, totalAmount: 3420000, lastOrder: '2026-03-21', grade: 'VIP' },
    { rank: 4, name: '최**', totalOrders: 98, totalAmount: 2980000, lastOrder: '2026-03-23', grade: '골드' },
    { rank: 5, name: '정**', totalOrders: 92, totalAmount: 2750000, lastOrder: '2026-03-20', grade: '골드' },
  ],
  orderFrequency: [
    { label: '주문 1회', percentage: 35.2, count: 30976 },
    { label: '주문 2~5회', percentage: 28.4, count: 24992 },
    { label: '주문 6~10회', percentage: 18.6, count: 16368 },
    { label: '주문 11~20회', percentage: 11.3, count: 9944 },
    { label: '주문 21회+', percentage: 6.5, count: 5720 },
  ],
};

/**
 * 주문 상세 분석 Mock 데이터
 * - byType: OrderDeliveryType (delivery | pickup | dine_in)
 * - byChannel: OrderChannel (app | kiosk | pos | web)
 * - byPayment: PaymentMethod (card | cash | kakao_pay | naver_pay | toss_pay | mobile_gift_card | mobile_voucher | mixed)
 * - byMember: 회원/비회원
 */
const MOCK_ORDER_DETAILS: OrderDetailsData = {
  byType: [
    { label: '배달', value: 55, count: 1560 },
    { label: '포장', value: 35, count: 992 },
    { label: '매장식사', value: 10, count: 283 },
  ],
  byChannel: [
    { label: '앱', value: 52, count: 1474 },
    { label: '키오스크', value: 22, count: 623 },
    { label: 'POS', value: 15, count: 425 },
    { label: '웹', value: 11, count: 312 },
  ],
  byPayment: [
    { label: '카드', value: 48, count: 1360 },
    { label: '카카오페이', value: 20, count: 567 },
    { label: '네이버페이', value: 12, count: 340 },
    { label: '토스페이', value: 8, count: 227 },
    { label: '현금', value: 5, count: 142 },
    { label: '모바일상품권', value: 4, count: 113 },
    { label: '금액권', value: 2, count: 57 },
    { label: '복합결제', value: 1, count: 28 },
  ],
  byMember: [
    { label: '회원', value: 85, count: 2409 },
    { label: '비회원', value: 15, count: 425 },
  ],
};

/** 일별 매출 Mock 데이터 생성 */
function generateDailySales(from: Date, to: Date) {
  const sales: { date: string; revenue: number; orders: number; avgOrderAmount: number }[] = [];
  const current = new Date(from);
  while (current <= to) {
    const revenue = Math.floor(Math.random() * 500000) + 800000;
    const orders = Math.floor(Math.random() * 40) + 60;
    sales.push({
      date: current.toISOString().split('T')[0]!,
      revenue,
      orders,
      avgOrderAmount: Math.round(revenue / orders),
    });
    current.setDate(current.getDate() + 1);
  }
  return sales;
}

export const dashboardService = {
  async getStats(dateRange?: DashboardDateRange): Promise<ApiResponse<DashboardStats>> {
    await delay(500);
    const multiplier = dateRange?.preset === 'yesterday' ? 0.9 : dateRange?.preset === 'last7days' ? 7 : dateRange?.preset === 'lastMonth' ? 30 : 1;
    return {
      success: true,
      data: {
        ...mockStats,
        todayOrders: Math.round(mockStats.todayOrders * multiplier),
        todayRevenue: Math.round(mockStats.todayRevenue * multiplier),
      },
    };
  },

  async getMarketingStats(_dateRange?: DashboardDateRange): Promise<ApiResponse<MarketingStats>> {
    await delay(400);
    const items = MOCK_MARKETING_ITEMS;
    const totalImpressions = items.reduce((s, i) => s + i.impressions, 0);
    const totalClicks = items.reduce((s, i) => s + i.clicks, 0);
    const avgCtr = totalImpressions > 0 ? Math.round((totalClicks / totalImpressions) * 1000) / 10 : 0;
    const avgConversionRate = Math.round(items.reduce((s, i) => s + i.conversionRate, 0) / items.length * 10) / 10;

    return {
      success: true,
      data: { totalImpressions, totalClicks, avgCtr, avgConversionRate, items },
    };
  },

  /** 주문 상세 분석 조회 */
  async getOrderDetails(): Promise<ApiResponse<OrderDetailsData>> {
    await delay(300);
    return { success: true, data: MOCK_ORDER_DETAILS };
  },

  /** 일별 매출 조회 */
  async getDailySales(dateRange?: DashboardDateRange): Promise<ApiResponse<DailySalesItem[]>> {
    await delay(300);
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 7);
    const from = dateRange?.from ?? defaultFrom;
    const to = dateRange?.to ?? now;
    return { success: true, data: generateDailySales(from, to) };
  },

  /** 회원 분석 조회 */
  async getMemberAnalytics(): Promise<ApiResponse<MemberAnalyticsData>> {
    await delay(400);
    return { success: true, data: MOCK_MEMBER_ANALYTICS };
  },

  // [2026-03-24] from/to fallback: dateRange 없으면 최근 30일 기간으로 전체 데이터 생성
  async getExportData(dateRange?: DashboardDateRange): Promise<ApiResponse<DashboardExportData>> {
    await delay(300);
    const statsRes = await this.getStats(dateRange);
    const now = new Date();
    const defaultFrom = new Date(now);
    defaultFrom.setDate(defaultFrom.getDate() - 30);
    const from = dateRange?.from ?? defaultFrom;
    const to = dateRange?.to ?? now;
    return {
      success: true,
      data: {
        stats: statsRes.data,
        dailySales: generateDailySales(from, to),
        orderDetails: MOCK_ORDER_DETAILS,
        marketing: MOCK_MARKETING_ITEMS,
      },
    };
  },
};
