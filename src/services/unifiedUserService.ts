/**
 * 통합 유저 서비스
 */
import { mockUnifiedUsers } from '@/lib/api/mockUnifiedUserData';
import type { UnifiedUser, UserType, UnifiedUserSearchFilter } from '@/types/unified-user';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

class UnifiedUserService {
  private users: UnifiedUser[] = [...mockUnifiedUsers];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** 통합 유저 목록 조회 (필터/검색/페이지네이션) */
  async getUsers(params?: UnifiedUserSearchFilter): Promise<{
    data: UnifiedUser[];
    pagination: Pagination;
  }> {
    await this.delay();

    let filtered = [...this.users];

    // userType 필터
    if (params?.userTypes && params.userTypes.length > 0) {
      filtered = filtered.filter((u) => params.userTypes!.includes(u.userType));
    }

    // status 필터
    if (params?.statuses && params.statuses.length > 0) {
      filtered = filtered.filter((u) => params.statuses!.includes(u.status));
    }

    // 키워드 검색 (이름, 전화번호, 이메일)
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(kw) ||
          u.phone.includes(kw) ||
          (u.email && u.email.toLowerCase().includes(kw))
      );
    }

    // 날짜 필터
    if (params?.dateFrom) {
      const from = new Date(params.dateFrom);
      filtered = filtered.filter((u) => u.createdAt >= from);
    }
    if (params?.dateTo) {
      const to = new Date(params.dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((u) => u.createdAt <= to);
    }

    // 페이지네이션
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      pagination: { page, limit, total, totalPages },
    };
  }

  /** ID로 단일 조회 */
  async getUserById(id: string): Promise<{ data: UnifiedUser | null }> {
    await this.delay(200);
    const user = this.users.find((u) => u.id === id) ?? null;
    return { data: user };
  }

  /** userType별 카운트 통계 */
  async getUserStats(): Promise<{ data: Record<UserType, number> & { total: number } }> {
    await this.delay(200);

    const stats: Record<UserType, number> = {
      customer: 0,
      franchise: 0,
      brand_admin: 0,
      guest: 0,
      event_participant: 0,
    };

    for (const user of this.users) {
      stats[user.userType]++;
    }

    return {
      data: {
        ...stats,
        total: this.users.length,
      },
    };
  }

  /** 유형별 목록 조회 */
  async getUsersByType(
    userType: UserType,
    params?: Omit<UnifiedUserSearchFilter, 'userTypes'>
  ): Promise<{ data: UnifiedUser[]; pagination: Pagination }> {
    return this.getUsers({ ...params, userTypes: [userType] });
  }
}

export const unifiedUserService = new UnifiedUserService();
