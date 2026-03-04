/**
 * 혜택 캠페인 관련 타입 정의
 *
 * 특정 트리거 조건에 따라 쿠폰 자동 발급 또는 포인트 적립을
 * 수행하는 자동화 캠페인. 기존 Campaign 타입과 별개의 독립적인 타입.
 */

import type { MemberGrade } from './member';
import type { BadgeVariant } from './index';
import type { EarnType } from './point';

// ============================================
// 트리거 유형
// ============================================

/**
 * 혜택 캠페인 트리거 유형 (8가지)
 */
export type BenefitCampaignTrigger =
  | 'order'              // 주문 시
  | 'signup'             // 회원 가입 시
  | 'membership_upgrade' // 멤버십 등급 달성 시
  | 'birthday'           // 생일
  | 'member_group'       // 회원그룹 발급
  | 'referral_code'      // 추천인 코드 입력 시
  | 'manual_upload'      // 수기 업로드
  | 'promo_code';        // 난수 발행쿠폰

export const BENEFIT_CAMPAIGN_TRIGGER_LABELS: Record<BenefitCampaignTrigger, string> = {
  order: '주문 시',
  signup: '회원 가입 시',
  membership_upgrade: '멤버십 달성 시',
  birthday: '생일',
  member_group: '회원그룹 발급',
  referral_code: '추천인 코드 입력 시',
  manual_upload: '수기 업로드',
  promo_code: '난수 발행쿠폰',
};

export const BENEFIT_CAMPAIGN_TRIGGER_DESCRIPTIONS: Record<BenefitCampaignTrigger, string> = {
  order: '주문 완료 시 자동으로 혜택을 지급합니다. 최소 주문 금액, N번째 주문 등 조건을 설정할 수 있습니다.',
  signup: '신규 회원 가입 시 자동으로 혜택을 지급합니다.',
  membership_upgrade: '회원 등급이 특정 등급에 도달하면 자동으로 혜택을 지급합니다.',
  birthday: '고객의 생일에 자동으로 혜택을 지급합니다. 생일 전후 지급 시점을 설정할 수 있습니다.',
  member_group: '회원 그룹을 선택하여 해당 그룹 전체에게 즉시 혜택을 일괄 발급합니다.',
  referral_code: '추천인 코드를 입력하면 자동으로 혜택을 지급합니다.',
  manual_upload: '회원 세그먼트 리스트(CSV/Excel)를 업로드하여 수기로 혜택을 지급합니다.',
  promo_code: '랜덤 코드를 일괄 생성하거나 외부 코드를 업로드하여, 코드 입력(매칭) 시 쿠폰 또는 포인트를 지급합니다.',
};

// ============================================
// 트리거별 조건 인터페이스
// ============================================

export interface OrderTriggerCondition {
  minOrderAmount: number | null;
  nthOrder: number | null;
  isEveryNthOrder: boolean;
  specificProductIds: string[];
}

export interface SignupTriggerCondition {
  delayMinutes: number;
}

export interface MembershipUpgradeTriggerCondition {
  targetGrades: MemberGrade[];
}

export interface BirthdayTriggerCondition {
  daysBefore: number;
  daysAfter: number;
  repeatYearly: boolean;
}

/**
 * 수동 발급 대상 유형
 */
export type ManualIssueTargetType = 'individuals' | 'groups' | 'grades';

export const MANUAL_ISSUE_TARGET_TYPE_LABELS: Record<ManualIssueTargetType, string> = {
  individuals: '개인 선택',
  groups: '그룹 선택',
  grades: '등급 선택',
};

/**
 * 회원그룹 발급 트리거 조건
 */
export interface MemberGroupTriggerCondition {
  manualIssueTargetType: ManualIssueTargetType;
  manualIssueMemberIds: string[];   // 개인 선택 시 회원 ID 목록
  manualIssueGroupIds: string[];    // 그룹 선택 시 그룹 ID 목록
  manualIssueGradeIds: string[];    // 등급 선택 시 등급 ID 목록
}

export interface ReferralCodeTriggerCondition {
  referralCodes: string[];
  singleUsePerCode: boolean;
}

export interface ManualUploadTriggerCondition {
  uploadedFileName: string | null;
  uploadedMemberIds: string[];
  uploadedAt: string | null;
}

/**
 * 프로모션 코드 생성 방식
 */
export type PromoCodeGenerationMethod = 'random' | 'upload';

/**
 * 프로모션 코드 사용 조건
 */
export interface PromoCodeUsageCondition {
  maxUsesPerCode: number;           // 코드당 최대 사용 횟수 (1 = 1회용)
  maxUsesPerMember: number;         // 회원당 최대 사용 횟수
  codeValidityDays: number | null;  // 코드 유효기간 (일), null = 캠페인 기간과 동일
}

/**
 * 개별 프로모션 코드
 */
export interface PromoCode {
  code: string;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}

/**
 * 난수 발행쿠폰 트리거 조건
 */
export interface PromoCodeTriggerCondition {
  generationMethod: PromoCodeGenerationMethod;
  codePrefix: string;               // 코드 접두사 (예: "PROMO")
  codeLength: number;               // 랜덤 부분 길이 (기본 8)
  codeQuantity: number;             // 생성 수량
  promoCodes: PromoCode[];          // 생성/업로드된 코드 목록
  uploadedFileName: string | null;  // 업로드 파일명
  usageCondition: PromoCodeUsageCondition;
}

// ============================================
// 지급 지연 설정
// ============================================

export type BenefitDelayUnit = 'none' | 'days' | 'hours';

export const BENEFIT_DELAY_UNIT_LABELS: Record<BenefitDelayUnit, string> = {
  none: '즉시 지급',
  days: '일 단위 지연',
  hours: '시간 지정 지연',
};

// ============================================
// 혜택 유형
// ============================================

export type CampaignBenefitType = 'coupon' | 'point';

export const CAMPAIGN_BENEFIT_TYPE_LABELS: Record<CampaignBenefitType, string> = {
  coupon: '쿠폰 지급',
  point: '포인트 적립',
};

export interface CouponBenefitConfig {
  couponId: string;
  couponName: string;
}

export interface PointBenefitConfig {
  earnType: EarnType;
  pointAmount: number;
  percentageRate: number;
  maxEarnPoints: number | null;
  pointValidityDays: number | null;
  pointDescription: string;
}

export interface BenefitDelayConfig {
  unit: BenefitDelayUnit;
  days: number;        // unit === 'days' 일 때 지연 일수
  hour: number;        // unit === 'hours' 일 때 시 (0~23)
  minute: number;      // unit === 'hours' 일 때 분 (0~59)
}

export interface BenefitConfig {
  couponBenefits: CouponBenefitConfig[];
  pointBenefits: PointBenefitConfig[];
  delay?: BenefitDelayConfig;
}

// ============================================
// 캠페인 상태
// ============================================

export type BenefitCampaignStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

export const BENEFIT_CAMPAIGN_STATUS_LABELS: Record<BenefitCampaignStatus, string> = {
  draft: '초안',
  active: '진행중',
  paused: '일시중지',
  completed: '완료',
  cancelled: '취소됨',
};

export const BENEFIT_CAMPAIGN_STATUS_BADGE: Record<BenefitCampaignStatus, BadgeVariant> = {
  draft: 'secondary',
  active: 'success',
  paused: 'warning',
  completed: 'default',
  cancelled: 'critical',
};

// ============================================
// 메인 인터페이스
// ============================================

export interface BenefitCampaign {
  id: string;
  name: string;
  description: string;

  trigger: BenefitCampaignTrigger;
  orderCondition?: OrderTriggerCondition;
  signupCondition?: SignupTriggerCondition;
  membershipCondition?: MembershipUpgradeTriggerCondition;
  birthdayCondition?: BirthdayTriggerCondition;
  memberGroupCondition?: MemberGroupTriggerCondition;
  referralCodeCondition?: ReferralCodeTriggerCondition;
  manualUploadCondition?: ManualUploadTriggerCondition;
  promoCodeCondition?: PromoCodeTriggerCondition;

  benefitConfig: BenefitConfig;

  isAlwaysOn: boolean;
  startDate: string;
  endDate: string | null;
  status: BenefitCampaignStatus;

  totalIssuedCount: number;
  totalBeneficiaryCount: number;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// ============================================
// 폼 데이터
// ============================================

export interface BenefitCampaignFormData {
  name: string;
  description: string;
  trigger: BenefitCampaignTrigger;

  // order
  orderMinAmount: number | null;
  orderNthOrder: number | null;
  orderIsEveryNth: boolean;
  orderSpecificProductIds: string[];

  // signup
  signupDelayMinutes: number;

  // membership_upgrade
  membershipTargetGrades: MemberGrade[];

  // birthday
  birthdayDaysBefore: number;
  birthdayDaysAfter: number;
  birthdayRepeatYearly: boolean;

  // member_group (회원그룹 발급)
  manualIssueTargetType: ManualIssueTargetType;
  manualIssueMemberIds: string[];
  manualIssueGroupIds: string[];
  manualIssueGradeIds: string[];

  // referral_code
  referralCodes: string[];
  referralCodeSingleUse: boolean;

  // manual_upload
  uploadFileName: string | null;
  uploadMemberIds: string[];

  // promo_code
  promoCodeMethod: PromoCodeGenerationMethod;
  promoCodePrefix: string;
  promoCodeLength: number;
  promoCodeQuantity: number;
  promoCodes: PromoCode[];
  promoCodeUploadFileName: string | null;
  promoCodeMaxUsesPerCode: number;
  promoCodeMaxUsesPerMember: number;
  promoCodeValidityDays: number | null;

  // 혜택 (복수 설정)
  couponBenefits: CouponBenefitConfig[];
  pointBenefits: PointBenefitConfig[];

  // 지급 지연
  benefitDelayUnit: BenefitDelayUnit;
  benefitDelayDays: number;
  benefitDelayHour: number;
  benefitDelayMinute: number;

  // 기간
  isAlwaysOn: boolean;
  startDate: string;
  endDate: string;
}

// ============================================
// 기본값
// ============================================

export const DEFAULT_BENEFIT_CAMPAIGN_FORM: BenefitCampaignFormData = {
  name: '',
  description: '',
  trigger: 'order',

  orderMinAmount: null,
  orderNthOrder: null,
  orderIsEveryNth: false,
  orderSpecificProductIds: [],

  signupDelayMinutes: 0,

  membershipTargetGrades: [],

  birthdayDaysBefore: 0,
  birthdayDaysAfter: 30,
  birthdayRepeatYearly: true,

  manualIssueTargetType: 'groups',
  manualIssueMemberIds: [],
  manualIssueGroupIds: [],
  manualIssueGradeIds: [],

  referralCodes: [],
  referralCodeSingleUse: true,

  uploadFileName: null,
  uploadMemberIds: [],

  promoCodeMethod: 'random' as PromoCodeGenerationMethod,
  promoCodePrefix: '',
  promoCodeLength: 8,
  promoCodeQuantity: 100,
  promoCodes: [] as PromoCode[],
  promoCodeUploadFileName: null,
  promoCodeMaxUsesPerCode: 1,
  promoCodeMaxUsesPerMember: 1,
  promoCodeValidityDays: null,

  couponBenefits: [],
  pointBenefits: [],

  benefitDelayUnit: 'none',
  benefitDelayDays: 1,
  benefitDelayHour: 0,
  benefitDelayMinute: 0,

  isAlwaysOn: false,
  startDate: '',
  endDate: '',
};

// ============================================
// 유효성 검증
// ============================================

export function validateBenefitCampaignForm(data: BenefitCampaignFormData): string[] {
  const errors: string[] = [];

  if (!data.name.trim()) {
    errors.push('캠페인명을 입력해주세요.');
  }

  if (!data.startDate) {
    errors.push('시작일을 입력해주세요.');
  }
  if (!data.isAlwaysOn) {
    if (!data.endDate) {
      errors.push('종료일을 입력해주세요.');
    }
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      errors.push('종료일은 시작일 이후여야 합니다.');
    }
  }

  // 트리거별 검증
  switch (data.trigger) {
    case 'order':
      if (data.orderMinAmount !== null && data.orderMinAmount < 0) {
        errors.push('최소 주문 금액은 0 이상이어야 합니다.');
      }
      if (data.orderNthOrder !== null && data.orderNthOrder < 1) {
        errors.push('N번째 주문은 1 이상이어야 합니다.');
      }
      break;
    case 'signup':
      if (data.signupDelayMinutes < 0) {
        errors.push('지연 시간은 0 이상이어야 합니다.');
      }
      break;
    case 'membership_upgrade':
      if (data.membershipTargetGrades.length === 0) {
        errors.push('대상 등급을 1개 이상 선택해주세요.');
      }
      break;
    case 'birthday':
      if (data.birthdayDaysBefore < 0) {
        errors.push('지급 시점은 0 이상이어야 합니다.');
      }
      if (data.birthdayDaysAfter < 1) {
        errors.push('사용 가능 기간은 1일 이상이어야 합니다.');
      }
      break;
    case 'member_group':
      if (data.manualIssueGroupIds.length === 0) {
        errors.push('발급 대상 그룹을 1개 이상 선택해주세요.');
      }
      break;
    case 'referral_code':
      if (data.referralCodes.length === 0) {
        errors.push('추천인 코드를 1개 이상 입력해주세요.');
      }
      break;
    case 'manual_upload':
      if (data.uploadMemberIds.length === 0) {
        errors.push('회원 리스트를 업로드해주세요.');
      }
      break;
    case 'promo_code':
      if (data.promoCodes.length === 0) {
        errors.push('프로모션 코드를 생성하거나 업로드해주세요.');
      }
      if (data.promoCodeMethod === 'random') {
        if (data.promoCodeLength < 4 || data.promoCodeLength > 20) {
          errors.push('코드 길이는 4~20자로 설정해주세요.');
        }
        if (data.promoCodeQuantity < 1 || data.promoCodeQuantity > 100000) {
          errors.push('생성 수량은 1~100,000개로 설정해주세요.');
        }
      }
      if (data.promoCodeMaxUsesPerCode < 1) {
        errors.push('코드당 최대 사용 횟수는 1 이상이어야 합니다.');
      }
      break;
  }

  // 혜택 검증
  if (data.couponBenefits.length === 0 && data.pointBenefits.length === 0) {
    errors.push('쿠폰 또는 포인트 혜택을 1개 이상 추가해주세요.');
  }
  data.couponBenefits.forEach((c, i) => {
    if (!c.couponId) {
      errors.push(`쿠폰 혜택 ${i + 1}: 쿠폰을 선택해주세요.`);
    }
  });
  data.pointBenefits.forEach((p, i) => {
    if (p.earnType === 'fixed') {
      if (p.pointAmount <= 0) {
        errors.push(`포인트 혜택 ${i + 1}: 적립 금액을 입력해주세요.`);
      }
      if (p.pointAmount > 1000000) {
        errors.push(`포인트 혜택 ${i + 1}: 1,000,000P 이하로 설정해주세요.`);
      }
    } else {
      if (p.percentageRate <= 0 || p.percentageRate > 100) {
        errors.push(`포인트 혜택 ${i + 1}: 적립 비율은 0% 초과 100% 이하여야 합니다.`);
      }
      if (p.maxEarnPoints !== null && p.maxEarnPoints < 1) {
        errors.push(`포인트 혜택 ${i + 1}: 최대 적립 포인트는 1P 이상이어야 합니다.`);
      }
    }
    if (p.pointValidityDays !== null && p.pointValidityDays < 1) {
      errors.push(`포인트 혜택 ${i + 1}: 유효 기간은 1일 이상이어야 합니다.`);
    }
  });

  return errors;
}
