/**
 * 등급 라벨/배지 조회 유틸
 *
 * 동적 등급 시스템 도입으로, 등급 정보를 캐시에서 조회하고
 * 캐시가 없으면 기존 MEMBER_GRADE_LABELS로 fallback한다.
 */

import type { BadgeVariant } from '@/types';
import { MEMBER_GRADE_LABELS } from '@/types/member';

interface GradeCacheEntry {
  name: string;
  badgeVariant: BadgeVariant;
}

let gradeCache: Map<string, GradeCacheEntry> | null = null;

/**
 * 등급 캐시 초기화
 */
export function initGradeCache(
  grades: Array<{ id: string; name: string; badgeVariant: BadgeVariant }>,
) {
  gradeCache = new Map(
    grades.map((g) => [g.id, { name: g.name, badgeVariant: g.badgeVariant }]),
  );
}

/**
 * 등급 라벨 조회
 */
export function getMemberGradeLabel(gradeId: string): string {
  const cached = gradeCache?.get(gradeId);
  if (cached) return cached.name;
  const fallback = MEMBER_GRADE_LABELS[gradeId];
  if (fallback) return fallback;
  return gradeId;
}

/**
 * 등급 Badge 색상 조회
 */
export function getGradeBadgeVariant(gradeId: string): BadgeVariant {
  const cached = gradeCache?.get(gradeId);
  if (cached) return cached.badgeVariant;
  switch (gradeId) {
    case 'grade-vip':
    case 'vip':
      return 'critical';
    case 'grade-gold':
    case 'gold':
      return 'warning';
    case 'grade-silver':
    case 'silver':
      return 'info';
    case 'grade-normal':
    case 'bronze':
      return 'default';
    default:
      return 'secondary';
  }
}
