/**
 * 시스템 설정 서비스
 * VITE_ENABLE_MOCK=true  → 인메모리 mock 데이터
 * VITE_ENABLE_MOCK=false → 실제 백엔드 API 호출
 */
import { apiClient, IS_MOCK_MODE, mockDelay } from '@/lib/api';
import type { ApiResponse } from '@/lib/api';
import type { BrandConfig } from '@/types/settings';

const mockBrandConfig: BrandConfig = {
  brandInfo: {
    name: 'CNTTECH',
    logoUrl: 'https://via.placeholder.com/120x40?text=CNTTECH',
  },
  orderTypes: ['DELIVERY', 'PICKUP', 'RESERVATION'],
  initialSettings: {
    operatingHours: '평일 09:00 - 22:00 / 주말 10:00 - 22:00',
    deliveryFee: 3000,
    minOrderAmount: {
      delivery: 15000,
      pickup: 0,
    },
  },
  integration: {
    pg: { provider: 'TossPayments', type: 'PLATFORM' },
    pos: { provider: 'OKPOS', type: 'DIRECT' },
  },
  contract: {
    period: { start: '2025-01-01', end: '2026-12-31' },
    commissionRate: 3.5,
    plan: '요금제 A',
    managerContact: '02-1234-5678 (내선 123)',
  },
  menuControl: {
    type: 'HQ',
    syncBaseMenu: true,
    allowPriceChange: false,
    allowAddMenu: false,
    allowDeleteMenu: false,
  },
  supportLinks: {
    guideUrl: 'https://notion.so/guide',
    inquiryUrl: 'http://pf.kakao.com/inquiry',
  },
};

class MockSettingsService {
  async getBrandConfig(): Promise<BrandConfig> {
    await mockDelay();
    return mockBrandConfig;
  }
}

class RealSettingsService {
  private readonly BASE = '/settings';

  async getBrandConfig(): Promise<BrandConfig> {
    const res = await apiClient.get<ApiResponse<BrandConfig>>(`${this.BASE}/brand-config`);
    return res.data;
  }
}

export const settingsService = IS_MOCK_MODE
  ? new MockSettingsService()
  : new RealSettingsService();
