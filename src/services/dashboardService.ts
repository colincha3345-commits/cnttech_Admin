import { mockStats } from '@/lib/api/mockData';
import type {
  DashboardStats,
  DashboardDateRange,
  MarketingStats,
  MarketingPerformanceItem,
  DashboardExportData,
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

  async getExportData(dateRange?: DashboardDateRange): Promise<ApiResponse<DashboardExportData>> {
    await delay(300);
    const statsRes = await this.getStats(dateRange);
    const from = dateRange?.from ?? new Date();
    const to = dateRange?.to ?? new Date();
    return {
      success: true,
      data: {
        stats: statsRes.data,
        dailySales: generateDailySales(from, to),
        marketing: MOCK_MARKETING_ITEMS,
      },
    };
  },
};
