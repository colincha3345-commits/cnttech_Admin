/**
 * 할인 서비스
 * VITE_ENABLE_MOCK=true  → 인메모리 mock 데이터 사용
 * VITE_ENABLE_MOCK=false → 실제 백엔드 API 호출
 */
import { apiClient, IS_MOCK_MODE, mockDelay } from '@/lib/api';
import { mockDiscounts } from '@/lib/api/mockDiscountData';
import type { Discount, DiscountFormData } from '@/types/discount';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface DiscountListParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

// ============================================================
// Mock 구현
// ============================================================
class MockDiscountService {
  private discounts: Discount[] = [...mockDiscounts];

  async getDiscounts(params?: DiscountListParams): Promise<{ data: Discount[]; pagination: Pagination }> {
    await mockDelay();
    const { keyword = '', page = 1, limit = 50 } = params ?? {};
    let result = [...this.discounts];
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(lower));
    }
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getDiscountById(id: string): Promise<{ data: Discount }> {
    await mockDelay();
    const discount = this.discounts.find((d) => d.id === id);
    if (!discount) throw new Error('할인을 찾을 수 없습니다.');
    return { data: discount };
  }

  async createDiscount(formData: DiscountFormData): Promise<{ data: Discount }> {
    await mockDelay();
    const newDiscount: Discount = {
      id: `discount-${Date.now()}`,
      ...formData,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.discounts = [...this.discounts, newDiscount];
    return { data: newDiscount };
  }

  async updateDiscount(id: string, formData: DiscountFormData): Promise<{ data: Discount }> {
    await mockDelay();
    let updated: Discount | null = null;
    this.discounts = this.discounts.map((d) => {
      if (d.id === id) {
        updated = { ...d, ...formData, updatedAt: new Date() };
        return updated;
      }
      return d;
    });
    if (!updated) throw new Error('할인을 찾을 수 없습니다.');
    return { data: updated };
  }

  async deleteDiscount(id: string): Promise<void> {
    await mockDelay();
    this.discounts = this.discounts.filter((d) => d.id !== id);
  }

  async getStats(): Promise<{ data: { total: number; active: number } }> {
    await mockDelay(100);
    return {
      data: {
        total: this.discounts.length,
        active: this.discounts.filter((d) => d.isActive).length,
      },
    };
  }
}

// ============================================================
// Real API 구현
// ============================================================
class RealDiscountService {
  private readonly BASE = '/discounts';

  async getDiscounts(params?: DiscountListParams): Promise<{ data: Discount[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiClient.get<{ data: Discount[]; pagination: Pagination }>(`${this.BASE}?${query.toString()}`);
  }

  async getDiscountById(id: string): Promise<{ data: Discount }> {
    return apiClient.get<{ data: Discount }>(`${this.BASE}/${id}`);
  }

  async createDiscount(formData: DiscountFormData): Promise<{ data: Discount }> {
    return apiClient.post<{ data: Discount }>(this.BASE, formData);
  }

  async updateDiscount(id: string, formData: DiscountFormData): Promise<{ data: Discount }> {
    return apiClient.put<{ data: Discount }>(`${this.BASE}/${id}`, formData);
  }

  async deleteDiscount(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }

  async getStats(): Promise<{ data: { total: number; active: number } }> {
    return apiClient.get<{ data: { total: number; active: number } }>(`${this.BASE}/stats`);
  }
}

// ============================================================
// 환경변수에 따라 구현체 선택
// ============================================================
export const discountService: MockDiscountService | RealDiscountService =
  IS_MOCK_MODE ? new MockDiscountService() : new RealDiscountService();
