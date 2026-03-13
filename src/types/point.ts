/**
 * 포인트 설정 관련 타입 정의
 *
 * 주문 시 포인트 적립/사용/소멸 정책을 관리하는 글로벌 설정.
 * 개별 회원 포인트 이력은 app-member.ts의 PointHistory 타입 재사용.
 */

import type { BadgeVariant } from './index';
import type { PointType, PointHistory } from './app-member';

// ============================================
// 적립 정책
// ============================================

export type EarnType = 'fixed' | 'percentage';

export const EARN_TYPE_LABELS: Record<EarnType, string> = {
  fixed: '정액',
  percentage: '정률',
};

export const EARN_TYPE_DESCRIPTIONS: Record<EarnType, string> = {
  fixed: 'N원 주문 시 N포인트 적립',
  percentage: '주문금액의 N% 적립',
};

export interface EarnPolicy {
  type: EarnType;
  fixedUnit: number;          // 정액: 기준 금액 (예: 1000원)
  fixedPoints: number;        // 정액: 적립 포인트 (예: 10P)
  percentageRate: number;     // 정률: 적립 비율 (예: 1%)
  maxEarnPoints: number | null; // 정률: 최대 적립 한도 (null=무제한)
  minOrderAmount: number;     // 최소 주문금액
}

// ============================================
// 사용 정책
// ============================================

export type UseUnit = 1 | 10 | 100 | 500 | 1000;

export const USE_UNIT_OPTIONS: { value: UseUnit; label: string }[] = [
  { value: 1, label: '1P 단위' },
  { value: 10, label: '10P 단위' },
  { value: 100, label: '100P 단위' },
  { value: 500, label: '500P 단위' },
  { value: 1000, label: '1,000P 단위' },
];

export interface UsePolicy {
  minUsePoints: number;       // 최소 사용 포인트
  maxUseRate: number;         // 최대 사용 비율 (결제금액의 N%)
  useUnit: UseUnit;           // 사용 단위
  allowNegativeBalance: boolean; // 주문취소 시 마이너스 잔고 허용 (방안 A)
}

// ============================================
// 유효기간 정책
// ============================================

export interface ExpiryPolicy {
  defaultValidityDays: number;     // 기본 유효기간 (일)
  expiryNotificationDays: number;  // 만료 알림 (N일 전)
}

// ============================================
// 포인트 설정 메인 인터페이스
// ============================================

export interface PointSettingsData {
  id: string;
  earnPolicy: EarnPolicy;
  usePolicy: UsePolicy;
  expiryPolicy: ExpiryPolicy;
  isActive: boolean;
  updatedAt: Date;
  updatedBy: string;
}

// ============================================
// 시스템 통계
// ============================================

export interface PointSystemStats {
  totalEarned: number;
  totalUsed: number;
  totalExpired: number;
  currentBalance: number;
}

// ============================================
// 시스템 포인트 이력 (회원명 포함)
// ============================================

export interface SystemPointHistory extends PointHistory {
  memberName: string;
}

// ============================================
// 포인트 타입별 Badge
// ============================================

export const POINT_TYPE_BADGE: Record<PointType, BadgeVariant> = {
  earn_order: 'success',
  earn_event: 'success',
  earn_manual: 'info',
  use_order: 'critical',
  withdraw_manual: 'warning',
  withdraw_cancel: 'critical',
  expired: 'secondary',
};

// ============================================
// 이력 필터
// ============================================

export type PointHistoryFilterType = 'all' | 'earn' | 'use' | 'expired';

export const POINT_HISTORY_FILTER_OPTIONS: { value: PointHistoryFilterType; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'earn', label: '적립' },
  { value: 'use', label: '사용/회수' },
  { value: 'expired', label: '소멸' },
];

// ============================================
// 폼 데이터 (평면화)
// ============================================

export interface PointSettingsFormData {
  // 적립 정책
  earnType: EarnType;
  fixedUnit: number;
  fixedPoints: number;
  percentageRate: number;
  maxEarnPoints: number | null;
  minOrderAmount: number;

  // 사용 정책
  minUsePoints: number;
  maxUseRate: number;
  useUnit: UseUnit;
  allowNegativeBalance: boolean;

  // 유효기간
  defaultValidityDays: number;
  expiryNotificationDays: number;
}

// ============================================
// 기본값
// ============================================

export const DEFAULT_POINT_SETTINGS_FORM: PointSettingsFormData = {
  earnType: 'fixed',
  fixedUnit: 1000,
  fixedPoints: 10,
  percentageRate: 1,
  maxEarnPoints: null,
  minOrderAmount: 0,

  minUsePoints: 100,
  maxUseRate: 50,
  useUnit: 100,
  allowNegativeBalance: true,

  defaultValidityDays: 365,
  expiryNotificationDays: 30,
};

// ============================================
// 유효성 검증
// ============================================

export function validatePointSettings(data: PointSettingsFormData): string[] {
  const errors: string[] = [];

  // 적립 정책
  if (data.earnType === 'fixed') {
    if (data.fixedUnit < 100) {
      errors.push('기준 금액은 100원 이상이어야 합니다.');
    }
    if (data.fixedPoints < 1) {
      errors.push('적립 포인트는 1P 이상이어야 합니다.');
    }
    if (data.fixedPoints > data.fixedUnit) {
      errors.push('적립 포인트가 기준 금액을 초과할 수 없습니다.');
    }
  } else {
    if (data.percentageRate <= 0 || data.percentageRate > 100) {
      errors.push('적립 비율은 0% 초과 100% 이하여야 합니다.');
    }
    if (data.maxEarnPoints !== null && data.maxEarnPoints < 1) {
      errors.push('최대 적립 포인트는 1P 이상이어야 합니다.');
    }
  }
  if (data.minOrderAmount < 0) {
    errors.push('최소 주문금액은 0 이상이어야 합니다.');
  }

  // 사용 정책
  if (data.minUsePoints < 1) {
    errors.push('최소 사용 포인트는 1P 이상이어야 합니다.');
  }
  if (data.maxUseRate <= 0 || data.maxUseRate > 100) {
    errors.push('최대 사용 비율은 0% 초과 100% 이하여야 합니다.');
  }

  // 유효기간
  if (data.defaultValidityDays < 1) {
    errors.push('기본 유효기간은 1일 이상이어야 합니다.');
  }
  if (data.expiryNotificationDays < 1) {
    errors.push('만료 알림은 1일 전 이상이어야 합니다.');
  }
  if (data.expiryNotificationDays >= data.defaultValidityDays) {
    errors.push('만료 알림 일수는 유효기간보다 작아야 합니다.');
  }

  return errors;
}
