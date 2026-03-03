/**
 * 회원 그룹 서비스
 */
import { mockMembers } from '@/lib/api/mockData';
import {
  mockMemberGroups,
  mockMemberGroupMappings,
} from '@/lib/api/mockMemberGroupData';
import type { Member } from '@/types/member';
import type {
  MemberGroup,
  MemberGroupMapping,
  MemberGroupFormData,
} from '@/types/member-segment';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

class MemberGroupService {
  private groups: MemberGroup[] = [...mockMemberGroups];
  private mappings: MemberGroupMapping[] = [...mockMemberGroupMappings];
  private members: Member[] = [...mockMembers];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // 그룹 CRUD
  // ============================================

  /**
   * 그룹 목록 조회
   */
  async getGroups(params?: {
    page?: number;
    limit?: number;
    keyword?: string;
  }): Promise<{ data: MemberGroup[]; pagination: Pagination }> {
    await this.delay();

    const { page = 1, limit = 10, keyword = '' } = params || {};

    let result = [...this.groups];

    // 키워드 검색
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(lowerKeyword) ||
          g.description?.toLowerCase().includes(lowerKeyword)
      );
    }

    // 최신순 정렬
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    // 회원 수 재계산
    paginatedData.forEach((group) => {
      group.memberCount = this.mappings.filter((m) => m.groupId === group.id).length;
    });

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

  /**
   * 그룹 상세 조회
   */
  async getGroup(id: string): Promise<MemberGroup | null> {
    await this.delay();
    const group = this.groups.find((g) => g.id === id);
    if (group) {
      group.memberCount = this.mappings.filter((m) => m.groupId === id).length;
    }
    return group || null;
  }

  /**
   * 그룹 생성
   */
  async createGroup(data: MemberGroupFormData): Promise<MemberGroup> {
    await this.delay();

    const newGroup: MemberGroup = {
      id: `group-${Date.now()}`,
      name: data.name,
      description: data.description,
      memberCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin-1', // 현재 로그인 사용자
    };

    this.groups.unshift(newGroup);
    return newGroup;
  }

  /**
   * 그룹 수정
   */
  async updateGroup(
    id: string,
    data: Partial<MemberGroupFormData>
  ): Promise<MemberGroup> {
    await this.delay();

    const group = this.groups.find((g) => g.id === id);
    if (!group) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    if (data.name) group.name = data.name;
    if (data.description !== undefined) group.description = data.description;
    group.updatedAt = new Date();

    return group;
  }

  /**
   * 그룹 삭제
   */
  async deleteGroup(id: string): Promise<void> {
    await this.delay();

    const index = this.groups.findIndex((g) => g.id === id);
    if (index === -1) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    // 그룹 삭제
    this.groups.splice(index, 1);

    // 매핑도 삭제
    this.mappings = this.mappings.filter((m) => m.groupId !== id);
  }

  // ============================================
  // 그룹 회원 관리
  // ============================================

  /**
   * 그룹 회원 목록 조회
   */
  async getGroupMembers(
    groupId: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<{ data: Member[]; pagination: Pagination }> {
    await this.delay();

    const { page = 1, limit = 10 } = params || {};

    // this.mappings에서 직접 조회 (추가된 회원 반영)
    const memberIds = this.mappings
      .filter((m) => m.groupId === groupId)
      .map((m) => m.memberId);
    const members = this.members.filter((m) => memberIds.includes(m.id));

    const total = members.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = members.slice(startIndex, startIndex + limit);

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

  /**
   * 그룹에 회원 추가
   */
  async addMembersToGroup(groupId: string, memberIds: string[]): Promise<void> {
    await this.delay();

    const group = this.groups.find((g) => g.id === groupId);
    if (!group) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    // 이미 그룹에 속한 회원은 제외
    const existingMemberIds = this.mappings
      .filter((m) => m.groupId === groupId)
      .map((m) => m.memberId);
    const newMemberIds = memberIds.filter((id) => !existingMemberIds.includes(id));

    // 새로운 매핑 추가
    const newMappings: MemberGroupMapping[] = newMemberIds.map((memberId) => ({
      id: `gm-${Date.now()}-${memberId}`,
      groupId,
      memberId,
      addedAt: new Date(),
      addedBy: 'admin-1',
    }));

    this.mappings.push(...newMappings);

    // 그룹 회원 수 업데이트
    group.memberCount = this.mappings.filter((m) => m.groupId === groupId).length;
    group.updatedAt = new Date();
  }

  /**
   * 그룹에서 회원 제거
   */
  async removeMembersFromGroup(groupId: string, memberIds: string[]): Promise<void> {
    await this.delay();

    const group = this.groups.find((g) => g.id === groupId);
    if (!group) {
      throw new Error('그룹을 찾을 수 없습니다.');
    }

    // 매핑 제거
    this.mappings = this.mappings.filter(
      (m) => !(m.groupId === groupId && memberIds.includes(m.memberId))
    );

    // 그룹 회원 수 업데이트
    group.memberCount = this.mappings.filter((m) => m.groupId === groupId).length;
    group.updatedAt = new Date();
  }

  /**
   * 회원별 그룹 조회
   */
  async getMemberGroups(memberId: string): Promise<MemberGroup[]> {
    await this.delay();

    // this.mappings에서 직접 조회 (변경사항 반영)
    const groupIds = this.mappings
      .filter((m) => m.memberId === memberId)
      .map((m) => m.groupId);
    return this.groups.filter((g) => groupIds.includes(g.id));
  }

  /**
   * 그룹 ID 목록으로 회원 ID 목록 조회
   */
  getGroupMemberIds(groupIds: string[]): string[] {
    const memberIds = new Set<string>();
    groupIds.forEach((groupId) => {
      this.mappings
        .filter((m) => m.groupId === groupId)
        .forEach((m) => memberIds.add(m.memberId));
    });
    return Array.from(memberIds);
  }
}

export const memberGroupService = new MemberGroupService();
