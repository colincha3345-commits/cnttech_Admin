import { apiClient, IS_MOCK_MODE, mockDelay } from '@/lib/api';
import { mockMembershipGrades } from '@/lib/api/mockMembershipGradeData';
import type { MembershipGrade, MembershipGradeFormData } from '@/types/membership-grade';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface MembershipGradeListParams {
  keyword?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface MembershipGradeStats {
  total: number;
  active: number;
  totalMembers: number;
}

class MockMembershipGradeService {
  private grades: MembershipGrade[] = [...mockMembershipGrades];

  async getGrades(params?: MembershipGradeListParams): Promise<{ data: MembershipGrade[]; pagination: Pagination }> {
    await mockDelay();
    const { keyword = '', isActive, page = 1, limit = 50 } = params || {};
    let result = [...this.grades];

    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(lower) || g.description.toLowerCase().includes(lower));
    }
    if (isActive !== undefined) {
      result = result.filter((g) => g.isActive === isActive);
    }

    result.sort((a, b) => a.order - b.order);
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getGradeById(id: string): Promise<{ data: MembershipGrade }> {
    await mockDelay();
    const grade = this.grades.find((g) => g.id === id);
    if (!grade) throw new Error('등급을 찾을 수 없습니다.');
    return { data: grade };
  }

  async createGrade(formData: MembershipGradeFormData): Promise<{ data: MembershipGrade }> {
    await mockDelay();
    const maxOrder = Math.max(...this.grades.map((g) => g.order), 0);
    const newGrade: MembershipGrade = {
      id: `grade-${Date.now()}`,
      ...this.formToGrade(formData),
      order: maxOrder + 1,
      memberCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
    };
    this.grades = [...this.grades, newGrade];
    return { data: newGrade };
  }

  async updateGrade(id: string, formData: MembershipGradeFormData): Promise<{ data: MembershipGrade }> {
    await mockDelay();
    let updated: MembershipGrade | null = null;
    this.grades = this.grades.map((g) => {
      if (g.id === id) {
        updated = { ...g, ...this.formToGrade(formData), order: g.order, updatedAt: new Date() };
        return updated;
      }
      return g;
    });
    if (!updated) throw new Error('등급을 찾을 수 없습니다.');
    return { data: updated };
  }

  async deleteGrade(id: string): Promise<void> {
    await mockDelay();
    const grade = this.grades.find((g) => g.id === id);
    if (!grade) throw new Error('등급을 찾을 수 없습니다.');
    if (grade.isDefault) throw new Error('기본 등급은 삭제할 수 없습니다.');
    if (grade.memberCount > 0) throw new Error(`해당 등급에 ${grade.memberCount}명의 회원이 있어 삭제할 수 없습니다.`);
    this.grades = this.grades.filter((g) => g.id !== id);
  }

  async duplicateGrade(id: string): Promise<{ data: MembershipGrade }> {
    await mockDelay();
    const original = this.grades.find((g) => g.id === id);
    if (!original) throw new Error('등급을 찾을 수 없습니다.');
    const maxOrder = Math.max(...this.grades.map((g) => g.order), 0);
    const duplicate: MembershipGrade = {
      ...original,
      id: `grade-${Date.now()}`,
      name: `${original.name} (복사본)`,
      order: maxOrder + 1,
      isDefault: false,
      memberCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.grades = [...this.grades, duplicate];
    return { data: duplicate };
  }

  async reorderGrades(gradeIds: string[]): Promise<{ data: MembershipGrade[] }> {
    await mockDelay();
    this.grades = this.grades.map((g) => {
      const newOrder = gradeIds.indexOf(g.id);
      if (newOrder === -1) return g;
      return { ...g, order: newOrder + 1, updatedAt: new Date() };
    });
    const sorted = [...this.grades].sort((a, b) => a.order - b.order);
    return { data: sorted };
  }

  async getStats(): Promise<{ data: MembershipGradeStats }> {
    await mockDelay(100);
    return {
      data: {
        total: this.grades.length,
        active: this.grades.filter((g) => g.isActive).length,
        totalMembers: this.grades.reduce((sum, g) => sum + g.memberCount, 0),
      },
    };
  }

  private formToGrade(
    formData: MembershipGradeFormData,
  ): Omit<MembershipGrade, 'id' | 'order' | 'memberCount' | 'createdAt' | 'updatedAt' | 'createdBy'> {
    const isDefault = formData.minTotalOrderAmount === null && formData.minOrderCount === null;
    return {
      name: formData.name,
      description: formData.description,
      badgeVariant: formData.badgeVariant,
      achievementCondition: {
        minTotalOrderAmount: formData.minTotalOrderAmount,
        minOrderCount: formData.minOrderCount,
        calculationPeriod: {
          type: formData.calculationPeriodType,
          months: formData.calculationPeriodMonths,
        },
        retentionMonths: formData.retentionMonths,
      },
      benefits: {
        point: { earnMultiplier: formData.pointEarnMultiplier },
        coupon: {
          autoIssueCouponIds: formData.autoIssueCouponIds,
          issueOnUpgrade: formData.couponIssueOnUpgrade,
          issueMonthly: formData.couponIssueMonthly,
          monthlyIssueDay: formData.couponMonthlyIssueDay,
        },
      },
      isActive: formData.isActive,
      isDefault,
    };
  }
}

// ============================================================
// Real API 구현
// ============================================================
class RealMembershipGradeService {
  private readonly BASE = '/membership-grades';

  async getGrades(params?: MembershipGradeListParams): Promise<{ data: MembershipGrade[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.isActive !== undefined) query.set('isActive', String(params.isActive));
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiClient.get<{ data: MembershipGrade[]; pagination: Pagination }>(`${this.BASE}?${query.toString()}`);
  }
  async getGradeById(id: string): Promise<{ data: MembershipGrade }> {
    return apiClient.get<{ data: MembershipGrade }>(`${this.BASE}/${id}`);
  }
  async createGrade(formData: MembershipGradeFormData): Promise<{ data: MembershipGrade }> {
    return apiClient.post<{ data: MembershipGrade }>(this.BASE, formData);
  }
  async updateGrade(id: string, formData: MembershipGradeFormData): Promise<{ data: MembershipGrade }> {
    return apiClient.put<{ data: MembershipGrade }>(`${this.BASE}/${id}`, formData);
  }
  async deleteGrade(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
  async duplicateGrade(id: string): Promise<{ data: MembershipGrade }> {
    return apiClient.post<{ data: MembershipGrade }>(`${this.BASE}/${id}/duplicate`);
  }
  async reorderGrades(gradeIds: string[]): Promise<{ data: MembershipGrade[] }> {
    return apiClient.patch<{ data: MembershipGrade[] }>(`${this.BASE}/reorder`, { gradeIds });
  }
  async getStats(): Promise<{ data: MembershipGradeStats }> {
    return apiClient.get<{ data: MembershipGradeStats }>(`${this.BASE}/stats`);
  }
}

// ============================================================
// 환경변수에 따라 구현체 선택
// ============================================================
export const membershipGradeService: MockMembershipGradeService | RealMembershipGradeService =
  IS_MOCK_MODE ? new MockMembershipGradeService() : new RealMembershipGradeService();
