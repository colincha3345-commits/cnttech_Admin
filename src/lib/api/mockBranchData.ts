/**
 * 지사 Mock 데이터
 * [2026-03-23] 신규 — 지사 계층 구조 추가
 */
import type { Branch } from '@/types/branch';

export const mockBranches: Branch[] = [
  {
    id: 'branch-001',
    name: '본사 직영',
    region: '서울 강남',
    description: '본사 직영 관할',
    managerName: '김본사',
    memberCount: 3,
    storeCount: 0,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'branch-002',
    name: '서울지사',
    region: '서울',
    description: '서울 전 지역 관할',
    managerName: '이서울',
    memberCount: 2,
    storeCount: 2,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
  {
    id: 'branch-003',
    name: '경기지사',
    region: '경기/인천',
    description: '경기, 인천 지역 관할',
    managerName: '박경기',
    memberCount: 2,
    storeCount: 1,
    isActive: true,
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
  {
    id: 'branch-004',
    name: '원주지사',
    region: '강원',
    description: '강원 지역 관할',
    managerName: '최원주',
    memberCount: 1,
    storeCount: 0,
    isActive: true,
    createdAt: new Date('2024-04-01'),
    updatedAt: new Date('2024-04-01'),
  },
  {
    id: 'branch-005',
    name: '부산지사',
    region: '부산/대구',
    description: '부산, 대구, 경남 지역 관할',
    managerName: '정부산',
    memberCount: 1,
    storeCount: 2,
    isActive: true,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
  },
];
