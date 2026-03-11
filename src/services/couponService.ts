/**
 * 쿠폰 서비스
 * VITE_ENABLE_MOCK=true  → 인메모리 mock 데이터 사용
 * VITE_ENABLE_MOCK=false → 실제 백엔드 API 호출
 */
import { apiClient, IS_MOCK_MODE, mockDelay } from '@/lib/api';
import { mockCoupons } from '@/lib/api/mockCouponData';
import type { Coupon, CouponFormData } from '@/types/coupon';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface CouponListParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface CouponStats {
  total: number;
  active: number;
  totalUsed: number;
}

// helper
function formToCoupon(formData: CouponFormData): Omit<Coupon, 'id' | 'usedCount' | 'status' | 'isActive' | 'createdAt' | 'updatedAt' | 'createdBy'> {
  return {
    name: formData.name,
    description: formData.description,
    notice: formData.notice,
    discountType: formData.discountType,
    discountValue: formData.discountValue,
    minOrderAmount: formData.minOrderAmount,
    maxDiscountAmount: formData.maxDiscountAmount,
    applyScope: formData.applyScope,
    orderType: formData.orderType,
    startDate: formData.startDate || null,
    endDate: formData.endDate || null,
    autoDelete: formData.autoDelete,
    singleUsePerMember: formData.singleUsePerMember,
    totalCount: formData.totalCount,
    applicableProductIds: formData.applicableProductIds,
    applicableCategoryIds: formData.applicableCategoryIds,
    schedule: {
      availableDays: formData.availableDays,
      availableTimeRanges: [{ startTime: formData.availableStartTime, endTime: formData.availableEndTime }],
    },
    storeRestriction: {
      type: formData.storeRestrictionType,
      storeIds: formData.restrictedStoreIds,
    },
    settlementRatio: {
      headquartersRatio: formData.headquartersRatio,
      franchiseRatio: formData.franchiseRatio,
    },
  };
}

// ============================================================
// Mock 구현
// ============================================================
class MockCouponService {
  private coupons: Coupon[] = [...mockCoupons];

  async getCoupons(params?: CouponListParams): Promise<{ data: Coupon[]; pagination: Pagination }> {
    await mockDelay();
    const { keyword = '', page = 1, limit = 50 } = params ?? {};
    let result = [...this.coupons];
    if (keyword) result = result.filter((c) => c.name.toLowerCase().includes(keyword.toLowerCase()));
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getCouponById(id: string): Promise<{ data: Coupon }> {
    await mockDelay();
    const coupon = this.coupons.find((c) => c.id === id);
    if (!coupon) throw new Error('쿠폰을 찾을 수 없습니다.');
    return { data: coupon };
  }

  async createCoupon(formData: CouponFormData): Promise<{ data: Coupon }> {
    await mockDelay();
    const newCoupon: Coupon = { id: `coupon-${Date.now()}`, ...formToCoupon(formData), usedCount: 0, status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date(), createdBy: 'admin' };
    this.coupons = [...this.coupons, newCoupon];
    return { data: newCoupon };
  }

  async updateCoupon(id: string, formData: CouponFormData): Promise<{ data: Coupon }> {
    await mockDelay();
    let updated: Coupon | null = null;
    this.coupons = this.coupons.map((c) => {
      if (c.id === id) { updated = { ...c, ...formToCoupon(formData), updatedAt: new Date() }; return updated; }
      return c;
    });
    if (!updated) throw new Error('쿠폰을 찾을 수 없습니다.');
    return { data: updated };
  }

  async deleteCoupon(id: string): Promise<void> {
    await mockDelay();
    this.coupons = this.coupons.filter((c) => c.id !== id);
  }

  async toggleActive(id: string): Promise<{ data: Coupon }> {
    await mockDelay();
    let toggled: Coupon | null = null;
    this.coupons = this.coupons.map((c) => {
      if (c.id === id) { toggled = { ...c, isActive: !c.isActive, status: c.isActive ? 'inactive' : 'active', updatedAt: new Date() }; return toggled; }
      return c;
    });
    if (!toggled) throw new Error('쿠폰을 찾을 수 없습니다.');
    return { data: toggled };
  }

  async suspendCoupon(id: string, gracePeriodDays: number): Promise<{ data: Coupon }> {
    await mockDelay();
    let suspended: Coupon | null = null;
    const now = new Date();
    const graceExpiresAt = new Date(now.getTime() + gracePeriodDays * 24 * 60 * 60 * 1000);
    this.coupons = this.coupons.map((c) => {
      if (c.id === id) {
        suspended = { ...c, isActive: false, status: 'suspended', suspendedAt: now, gracePeriodDays, graceExpiresAt, updatedAt: now };
        return suspended;
      }
      return c;
    });
    if (!suspended) throw new Error('쿠폰을 찾을 수 없습니다.');
    return { data: suspended };
  }

  async activateCoupon(id: string): Promise<{ data: Coupon }> {
    await mockDelay();
    let activated: Coupon | null = null;
    this.coupons = this.coupons.map((c) => {
      if (c.id === id) {
        activated = { ...c, isActive: true, status: 'active', suspendedAt: undefined, gracePeriodDays: undefined, graceExpiresAt: undefined, updatedAt: new Date() };
        return activated;
      }
      return c;
    });
    if (!activated) throw new Error('쿠폰을 찾을 수 없습니다.');
    return { data: activated };
  }

  async duplicateCoupon(id: string): Promise<{ data: Coupon }> {
    await mockDelay();
    const original = this.coupons.find((c) => c.id === id);
    if (!original) throw new Error('쿠폰을 찾을 수 없습니다.');
    const duplicate: Coupon = { ...original, id: `coupon-${Date.now()}`, name: `${original.name} (복사본)`, usedCount: 0, status: 'active', isActive: true, createdAt: new Date(), updatedAt: new Date() };
    this.coupons = [...this.coupons, duplicate];
    return { data: duplicate };
  }

  async getStats(): Promise<{ data: CouponStats }> {
    await mockDelay(100);
    return { data: { total: this.coupons.length, active: this.coupons.filter((c) => c.isActive).length, totalUsed: this.coupons.reduce((sum, c) => sum + c.usedCount, 0) } };
  }
}

// ============================================================
// Real API 구현
// ============================================================
class RealCouponService {
  private readonly BASE = '/coupons';

  async getCoupons(params?: CouponListParams): Promise<{ data: Coupon[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiClient.get<{ data: Coupon[]; pagination: Pagination }>(`${this.BASE}?${query.toString()}`);
  }
  async getCouponById(id: string): Promise<{ data: Coupon }> {
    return apiClient.get<{ data: Coupon }>(`${this.BASE}/${id}`);
  }
  async createCoupon(formData: CouponFormData): Promise<{ data: Coupon }> {
    return apiClient.post<{ data: Coupon }>(this.BASE, formData);
  }
  async updateCoupon(id: string, formData: CouponFormData): Promise<{ data: Coupon }> {
    return apiClient.put<{ data: Coupon }>(`${this.BASE}/${id}`, formData);
  }
  async deleteCoupon(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
  async toggleActive(id: string): Promise<{ data: Coupon }> {
    return apiClient.patch<{ data: Coupon }>(`${this.BASE}/${id}/toggle-active`);
  }
  async suspendCoupon(id: string, gracePeriodDays: number): Promise<{ data: Coupon }> {
    return apiClient.patch<{ data: Coupon }>(`${this.BASE}/${id}/suspend`, { gracePeriodDays });
  }
  async activateCoupon(id: string): Promise<{ data: Coupon }> {
    return apiClient.patch<{ data: Coupon }>(`${this.BASE}/${id}/activate`);
  }
  async duplicateCoupon(id: string): Promise<{ data: Coupon }> {
    return apiClient.post<{ data: Coupon }>(`${this.BASE}/${id}/duplicate`);
  }
  async getStats(): Promise<{ data: CouponStats }> {
    return apiClient.get<{ data: CouponStats }>(`${this.BASE}/stats`);
  }
}

// ============================================================
// 환경변수에 따라 구현체 선택
// ============================================================
export const couponService: MockCouponService | RealCouponService =
  IS_MOCK_MODE ? new MockCouponService() : new RealCouponService();
