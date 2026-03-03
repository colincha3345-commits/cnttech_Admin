/**
 * 멤버십 등급 관리 타입 정의
 *
 * 동적으로 등급을 추가/삭제/순서변경할 수 있는 등급 시스템.
 * 각 등급에 달성 조건(주문 기반)과 혜택(포인트 배율, 쿠폰)을 설정한다.
 */

import type { BadgeVariant } from './index';

// ============================================
// 달성 조건
// ============================================

export type CalculationPeriodType = 'lifetime' | 'recent_months';

export const CALCULATION_PERIOD_TYPE_LABELS: Record<CalculationPeriodType, string> = {
  lifetime: '전체 기간',
  recent_months: '최근 N개월',
};

export interface GradeAchievementCondition {
  minTotalOrderAmount: number | null;
  minOrderCount: number | null;
  calculationPeriod: {
    type: CalculationPeriodType;
    months: number | null;
  };
  retentionMonths: number | null;
}

// ============================================
// 등급별 혜택
// ============================================

export interface GradePointBenefit {
  earnMultiplier: number;
}

export interface GradeCouponBenefit {
  autoIssueCouponIds: string[];
  issueOnUpgrade: boolean;
  issueMonthly: boolean;
  monthlyIssueDay: number | null;
}

export interface GradeBenefits {
  point: GradePointBenefit;
  coupon: GradeCouponBenefit;
}

// ============================================
// 메인 엔티티
// ============================================

export interface MembershipGrade {
  id: string;
  name: string;
  description: string;
  badgeVariant: BadgeVariant;
  order: number;
  achievementCondition: GradeAchievementCondition;
  benefits: GradeBenefits;
  isActive: boolean;
  isDefault: boolean;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ============================================
// 폼 데이터 (평면화)
// ============================================

export interface MembershipGradeFormData {
  name: string;
  description: string;
  badgeVariant: BadgeVariant;

  // 달성 조건
  minTotalOrderAmount: number | null;
  minOrderCount: number | null;
  calculationPeriodType: CalculationPeriodType;
  calculationPeriodMonths: number | null;
  retentionMonths: number | null;

  // 포인트 혜택
  pointEarnMultiplier: number;

  // 쿠폰 혜택
  autoIssueCouponIds: string[];
  couponIssueOnUpgrade: boolean;
  couponIssueMonthly: boolean;
  couponMonthlyIssueDay: number | null;

  isActive: boolean;
}

// ============================================
// 기본값
// ============================================

export const DEFAULT_MEMBERSHIP_GRADE_FORM: MembershipGradeFormData = {
  name: '',
  description: '',
  badgeVariant: 'secondary',

  minTotalOrderAmount: null,
  minOrderCount: null,
  calculationPeriodType: 'lifetime',
  calculationPeriodMonths: null,
  retentionMonths: null,

  pointEarnMultiplier: 1.0,

  autoIssueCouponIds: [],
  couponIssueOnUpgrade: true,
  couponIssueMonthly: false,
  couponMonthlyIssueDay: null,

  isActive: true,
};

// ============================================
// Badge 색상 옵션
// ============================================

export const BADGE_VARIANT_OPTIONS: { value: BadgeVariant; label: string }[] = [
  { value: 'critical', label: '빨강' },
  { value: 'warning', label: '주황' },
  { value: 'success', label: '초록' },
  { value: 'info', label: '파랑' },
  { value: 'default', label: '회색' },
  { value: 'secondary', label: '연회색' },
];

// ============================================
// 유효성 검증
// ============================================

export function validateMembershipGradeForm(data: MembershipGradeFormData): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('등급명을 입력해주세요.');
  }

  // 주문 금액 검증
  if (data.minTotalOrderAmount !== null && data.minTotalOrderAmount < 0) {
    errors.push('최소 주문 금액은 0원 이상이어야 합니다.');
  }

  // 주문 횟수 검증
  if (data.minOrderCount !== null && data.minOrderCount < 1) {
    errors.push('최소 주문 횟수는 1회 이상이어야 합니다.');
  }

  // 산정 기간 검증
  if (data.calculationPeriodType === 'recent_months') {
    if (data.calculationPeriodMonths === null || data.calculationPeriodMonths < 1) {
      errors.push('산정 기간은 1개월 이상이어야 합니다.');
    }
    if (data.calculationPeriodMonths && data.calculationPeriodMonths > 60) {
      errors.push('산정 기간은 60개월을 초과할 수 없습니다.');
    }
  }

  // 유지 기간 검증
  if (data.retentionMonths !== null) {
    if (data.retentionMonths < 1) {
      errors.push('유지 기간은 1개월 이상이어야 합니다.');
    }
    if (data.retentionMonths > 120) {
      errors.push('유지 기간은 120개월을 초과할 수 없습니다.');
    }
  }

  // 포인트 배율 검증
  if (data.pointEarnMultiplier < 1.0) {
    errors.push('포인트 적립 배율은 1.0배 이상이어야 합니다.');
  }
  if (data.pointEarnMultiplier > 10.0) {
    errors.push('포인트 적립 배율은 10.0배를 초과할 수 없습니다.');
  }

  // 쿠폰 발급 검증
  if (data.couponIssueMonthly && !data.couponMonthlyIssueDay) {
    errors.push('매월 자동 발급을 선택한 경우 발급일을 지정해주세요.');
  }
  if (data.couponMonthlyIssueDay !== null) {
    if (data.couponMonthlyIssueDay < 1 || data.couponMonthlyIssueDay > 28) {
      errors.push('매월 발급일은 1~28일 사이여야 합니다.');
    }
  }

  return errors;
}
