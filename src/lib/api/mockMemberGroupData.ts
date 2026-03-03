/**
 * 회원 그룹 Mock 데이터
 */
import type { MemberGroup, MemberGroupMapping } from '@/types/member-segment';

/**
 * 회원 그룹 목록 (3개)
 */
export const mockMemberGroups: MemberGroup[] = [
  {
    id: 'group-1',
    name: 'VIP 고객 관리',
    description: 'VIP 등급 고객 특별 관리 그룹 - 우선 응대 및 특별 혜택 제공',
    memberCount: 3,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-02-01'),
    createdBy: 'admin-1',
  },
  {
    id: 'group-2',
    name: '휴면 고객 재활성화',
    description: '3개월 이상 미접속 고객 대상 재활성화 캠페인 그룹',
    memberCount: 4,
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-02-05'),
    createdBy: 'admin-1',
  },
  {
    id: 'group-3',
    name: '2월 프로모션 대상',
    description: '2월 특별 프로모션 참여 고객 - 추가 할인 혜택 제공',
    memberCount: 6,
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-08'),
    createdBy: 'admin-2',
  },
];

/**
 * 그룹-회원 매핑 (중복 허용: 한 회원이 여러 그룹에 속할 수 있음)
 */
export const mockMemberGroupMappings: MemberGroupMapping[] = [
  // group-1: VIP 고객 관리 (member-1, member-2, member-10)
  {
    id: 'gm-1',
    groupId: 'group-1',
    memberId: 'member-1',
    addedAt: new Date('2026-01-10'),
    addedBy: 'admin-1',
  },
  {
    id: 'gm-2',
    groupId: 'group-1',
    memberId: 'member-2',
    addedAt: new Date('2026-01-10'),
    addedBy: 'admin-1',
  },
  {
    id: 'gm-3',
    groupId: 'group-1',
    memberId: 'member-10',
    addedAt: new Date('2026-01-15'),
    addedBy: 'admin-1',
  },

  // group-2: 휴면 고객 재활성화 (member-6, member-7, member-1, member-11)
  // member-1은 group-1, group-2 둘 다 속함 (중복 허용)
  {
    id: 'gm-4',
    groupId: 'group-2',
    memberId: 'member-6',
    addedAt: new Date('2026-01-20'),
    addedBy: 'admin-1',
  },
  {
    id: 'gm-5',
    groupId: 'group-2',
    memberId: 'member-7',
    addedAt: new Date('2026-01-20'),
    addedBy: 'admin-1',
  },
  {
    id: 'gm-6',
    groupId: 'group-2',
    memberId: 'member-1',
    addedAt: new Date('2026-02-01'),
    addedBy: 'admin-2',
  },
  {
    id: 'gm-7',
    groupId: 'group-2',
    memberId: 'member-11',
    addedAt: new Date('2026-02-05'),
    addedBy: 'admin-1',
  },

  // group-3: 2월 프로모션 대상 (member-1, member-2, member-3, member-5, member-9, member-12)
  {
    id: 'gm-8',
    groupId: 'group-3',
    memberId: 'member-1',
    addedAt: new Date('2026-02-01'),
    addedBy: 'admin-2',
  },
  {
    id: 'gm-9',
    groupId: 'group-3',
    memberId: 'member-2',
    addedAt: new Date('2026-02-01'),
    addedBy: 'admin-2',
  },
  {
    id: 'gm-10',
    groupId: 'group-3',
    memberId: 'member-3',
    addedAt: new Date('2026-02-01'),
    addedBy: 'admin-2',
  },
  {
    id: 'gm-11',
    groupId: 'group-3',
    memberId: 'member-5',
    addedAt: new Date('2026-02-03'),
    addedBy: 'admin-1',
  },
  {
    id: 'gm-12',
    groupId: 'group-3',
    memberId: 'member-9',
    addedAt: new Date('2026-02-05'),
    addedBy: 'admin-1',
  },
  {
    id: 'gm-13',
    groupId: 'group-3',
    memberId: 'member-12',
    addedAt: new Date('2026-02-08'),
    addedBy: 'admin-2',
  },
];

/**
 * 특정 그룹의 회원 ID 목록 조회
 */
export function getGroupMemberIds(groupId: string): string[] {
  return mockMemberGroupMappings
    .filter((m) => m.groupId === groupId)
    .map((m) => m.memberId);
}

/**
 * 특정 회원이 속한 그룹 ID 목록 조회
 */
export function getMemberGroupIds(memberId: string): string[] {
  return mockMemberGroupMappings
    .filter((m) => m.memberId === memberId)
    .map((m) => m.groupId);
}

/**
 * 그룹 회원 수 재계산
 */
export function recalculateGroupMemberCount(groupId: string): number {
  return mockMemberGroupMappings.filter((m) => m.groupId === groupId).length;
}
