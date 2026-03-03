/**
 * 회원 세그먼트 필터 및 그룹 관련 타입
 */
import type { Gender, MemberGrade, MemberStatus } from './member';
import type { PromotionOrderType } from './promotion-common';
import { PROMOTION_ORDER_TYPE_LABELS } from './promotion-common';

// 공통 타입 re-export (하위 호환)
export type { PromotionOrderType } from './promotion-common';
export { PROMOTION_ORDER_TYPE_LABELS } from './promotion-common';

/**
 * 연령대 범위
 */
export interface AgeRange {
  minAge?: number;
  maxAge?: number;
}

/**
 * 기간 범위
 */
export interface DateRange {
  from?: string; // YYYY-MM-DD
  to?: string;
}

/**
 * 금액/횟수 범위
 */
export interface AmountRange {
  min?: number;
  max?: number;
}

/**
 * 수신 동의 타입
 */
export type ConsentType = 'marketing' | 'push' | 'sms' | 'email';

export const CONSENT_TYPE_LABELS: Record<ConsentType, string> = {
  marketing: '마케팅 수신',
  push: '푸시 알림',
  sms: 'SMS',
  email: '이메일',
};

/** @deprecated PromotionOrderType 사용 권장 */
export type OrderTypeFilter = PromotionOrderType;

/** @deprecated PROMOTION_ORDER_TYPE_LABELS 사용 권장 */
export const ORDER_TYPE_FILTER_LABELS = PROMOTION_ORDER_TYPE_LABELS;

/**
 * 수신 동의 필터
 */
export interface ConsentFilter {
  type: ConsentType;
  agreed: boolean;
}

/**
 * 쿠폰 사용 필터
 */
export interface CouponUsageFilter {
  couponIds?: string[];
  used?: boolean;
}

/**
 * 메뉴 주문 필터
 */
export interface MenuOrderFilter {
  productIds?: string[];
  ordered?: boolean;
}

/**
 * 캠페인 참여 필터
 */
export interface CampaignParticipationFilter {
  campaignIds?: string[];
  participated?: boolean;
}

/**
 * 세그먼트 필터 조건
 */
export interface MemberSegmentFilter {
  // 기본 정보
  ageRange?: AgeRange;
  gender?: Gender | null;
  grades?: MemberGrade[];
  statuses?: MemberStatus[];

  // 가입 정보
  registeredDateRange?: DateRange;

  // 수신 동의
  consentFilters?: ConsentFilter[];

  // 주문 관련 (기간별)
  orderPeriod?: DateRange;
  orderType?: PromotionOrderType;
  orderCountRange?: AmountRange;
  orderAmountRange?: AmountRange;

  // 미주문 필터 (일수)
  noOrderDays?: number; // 예: 90 = 3개월

  // 쿠폰 사용 필터
  couponFilter?: CouponUsageFilter;

  // 메뉴 주문 필터
  menuFilter?: MenuOrderFilter;

  // 캠페인 참여 필터
  campaignFilter?: CampaignParticipationFilter;

  // 그룹 필터
  groupIds?: string[];
}

/**
 * 세그먼트 필터 탭 유형
 */
export type SegmentFilterTab = 'basic' | 'order' | 'marketing' | 'advanced';

export const SEGMENT_FILTER_TAB_LABELS: Record<SegmentFilterTab, string> = {
  basic: '기본 정보',
  order: '주문 조건',
  marketing: '마케팅',
  advanced: '고급 필터',
};

// ============================================
// 회원 그룹 관련 타입
// ============================================

/**
 * 회원 그룹
 */
export interface MemberGroup {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * 그룹-회원 매핑 (중복 가능)
 */
export interface MemberGroupMapping {
  id: string;
  groupId: string;
  memberId: string;
  addedAt: Date;
  addedBy: string;
}

/**
 * 그룹 생성/수정 폼 데이터
 */
export interface MemberGroupFormData {
  name: string;
  description?: string;
}

/**
 * 그룹 회원 추가 요청
 */
export interface AddMembersToGroupRequest {
  groupId: string;
  memberIds: string[];
}

/**
 * 그룹 회원 제거 요청
 */
export interface RemoveMembersFromGroupRequest {
  groupId: string;
  memberIds: string[];
}
