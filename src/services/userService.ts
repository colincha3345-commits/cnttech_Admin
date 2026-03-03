import { mockUsers } from '@/lib/api/mockData';
import type { User, UserStatus, ApiResponse } from '@/types';
import { delay } from '@/utils/async';

// In-memory store for mock
let users = [...mockUsers];

export const userService = {
  async getUsers(params?: { query?: string }): Promise<ApiResponse<User[]>> {
    await delay(500);

    let filtered = users;

    // 검색어 필터링
    if (params?.query) {
      const searchTerm = params.query.toLowerCase();
      filtered = users.filter(
        (u) =>
          u.name.toLowerCase().includes(searchTerm) ||
          u.email.toLowerCase().includes(searchTerm)
      );
    }

    return {
      success: true,
      data: filtered,
      meta: {
        page: 1,
        limit: 20,
        total: filtered.length,
      },
    };
  },

  async getUserById(id: string): Promise<ApiResponse<User | null>> {
    await delay(300);

    const user = users.find(u => u.id === id);

    return {
      success: true,
      data: user || null,
    };
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<ApiResponse<User | null>> {
    await delay(500);

    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
      return {
        success: true,
        data: null,
      };
    }

    users[index] = {
      ...users[index]!,
      status,
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: users[index]!,
    };
  },

  async unmaskUserData(userId: string, field: string): Promise<ApiResponse<{ value: string }>> {
    await delay(300);

    const user = users.find(u => u.id === userId);
    if (!user) {
      return {
        success: false,
        data: { value: '' },
      } as ApiResponse<{ value: string }>;
    }

    // In real app, this would log to audit and check permissions
    const value = user[field as keyof User];

    return {
      success: true,
      data: { value: String(value) },
    };
  },
};
