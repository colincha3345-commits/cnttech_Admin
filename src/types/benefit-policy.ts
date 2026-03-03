/**
 * 혜택 우선순위 및 중복 적용 정책
 *
 * 적용 순서: 원가 → 본사할인 → 증정할인 → 쿠폰 → 최종가
 * 중복 정책: 할인과 쿠폰 중복 적용 허용
 * 한도 정책: 주문별 최대 할인금액 제한
 */

/**
 * 혜택 유형
 */
export type BenefitType =
  | 'company_discount'  // 본사 할인
  | 'gift_discount'     // 증정 할인
  | 'coupon';           // 쿠폰

/**
 * 혜택 적용 순서 (낮을수록 먼저 적용)
 */
export const BENEFIT_PRIORITY: Record<BenefitType, number> = {
  company_discount: 1,  // 1순위: 본사 할인
  gift_discount: 2,     // 2순위: 증정 할인
  coupon: 3,            // 3순위: 쿠폰
};

/**
 * 중복 적용 규칙
 */
export interface StackingRule {
  type1: BenefitType;
  type2: BenefitType;
  canStack: boolean;  // 중복 적용 가능 여부
}

/**
 * 기본 중복 적용 규칙
 * - 다른 유형 간: 중복 적용 가능
 * - 같은 유형 내: 최대 혜택 1개만 적용
 */
export const DEFAULT_STACKING_RULES: StackingRule[] = [
  // 본사할인 + 증정할인: 가능
  { type1: 'company_discount', type2: 'gift_discount', canStack: true },
  // 본사할인 + 쿠폰: 가능
  { type1: 'company_discount', type2: 'coupon', canStack: true },
  // 증정할인 + 쿠폰: 가능
  { type1: 'gift_discount', type2: 'coupon', canStack: true },
  // 같은 유형끼리: 불가 (최대 혜택 1개만)
  { type1: 'company_discount', type2: 'company_discount', canStack: false },
  { type1: 'gift_discount', type2: 'gift_discount', canStack: false },
  { type1: 'coupon', type2: 'coupon', canStack: false },
];

/**
 * 주문 할인 한도 설정
 */
export interface OrderDiscountLimit {
  isEnabled: boolean;
  maxDiscountAmount: number;  // 주문당 최대 할인 금액 (원)
}

/**
 * 기본 주문 할인 한도
 */
export const DEFAULT_ORDER_DISCOUNT_LIMIT: OrderDiscountLimit = {
  isEnabled: true,
  maxDiscountAmount: 10000,  // 기본값: 10,000원
};

/**
 * 혜택 계산 결과
 */
export interface BenefitCalculationResult {
  originalPrice: number;           // 원가
  appliedBenefits: AppliedBenefit[];  // 적용된 혜택 목록
  totalDiscount: number;           // 총 할인 금액
  limitApplied: boolean;           // 한도 적용 여부
  limitedAmount: number;           // 한도로 인해 제한된 금액
  finalPrice: number;              // 최종 결제 금액
}

/**
 * 적용된 개별 혜택
 */
export interface AppliedBenefit {
  id: string;
  type: BenefitType;
  name: string;
  discountAmount: number;          // 할인 금액
  appliedOrder: number;            // 적용 순서
}

/**
 * 혜택 적용 가능 여부 확인
 */
export function canStackBenefits(type1: BenefitType, type2: BenefitType): boolean {
  if (type1 === type2) return false;  // 같은 유형은 중복 불가

  const rule = DEFAULT_STACKING_RULES.find(
    (r) =>
      (r.type1 === type1 && r.type2 === type2) ||
      (r.type1 === type2 && r.type2 === type1)
  );

  return rule?.canStack ?? true;
}

/**
 * 혜택 적용 순서 정렬
 */
export function sortBenefitsByPriority<T extends { type: BenefitType }>(
  benefits: T[]
): T[] {
  return [...benefits].sort(
    (a, b) => BENEFIT_PRIORITY[a.type] - BENEFIT_PRIORITY[b.type]
  );
}

/**
 * 주문 할인 한도 적용
 */
export function applyOrderDiscountLimit(
  totalDiscount: number,
  limit: OrderDiscountLimit
): { finalDiscount: number; limitApplied: boolean; limitedAmount: number } {
  if (!limit.isEnabled) {
    return {
      finalDiscount: totalDiscount,
      limitApplied: false,
      limitedAmount: 0,
    };
  }

  if (totalDiscount <= limit.maxDiscountAmount) {
    return {
      finalDiscount: totalDiscount,
      limitApplied: false,
      limitedAmount: 0,
    };
  }

  return {
    finalDiscount: limit.maxDiscountAmount,
    limitApplied: true,
    limitedAmount: totalDiscount - limit.maxDiscountAmount,
  };
}

/**
 * 혜택 계산 (순차 적용)
 *
 * @example
 * const result = calculateBenefits(15000, [
 *   { id: 'd1', type: 'company_discount', name: '10% 할인', discountAmount: 1500 },
 *   { id: 'c1', type: 'coupon', name: '1000원 쿠폰', discountAmount: 1000 },
 * ]);
 * // result.finalPrice = 12500
 */
export function calculateBenefits(
  originalPrice: number,
  benefits: Omit<AppliedBenefit, 'appliedOrder'>[],
  limit: OrderDiscountLimit = DEFAULT_ORDER_DISCOUNT_LIMIT
): BenefitCalculationResult {
  // 우선순위 정렬
  const sortedBenefits = sortBenefitsByPriority(benefits);

  // 같은 유형 중 최대 혜택만 선택
  const selectedBenefits = selectBestBenefitsByType(sortedBenefits);

  // 순차 적용
  let currentPrice = originalPrice;
  const appliedBenefits: AppliedBenefit[] = [];

  selectedBenefits.forEach((benefit, index) => {
    const discountAmount = Math.min(benefit.discountAmount, currentPrice);
    currentPrice -= discountAmount;

    appliedBenefits.push({
      ...benefit,
      discountAmount,
      appliedOrder: index + 1,
    });
  });

  const totalDiscount = originalPrice - currentPrice;

  // 한도 적용
  const { finalDiscount, limitApplied, limitedAmount } = applyOrderDiscountLimit(
    totalDiscount,
    limit
  );

  return {
    originalPrice,
    appliedBenefits,
    totalDiscount,
    limitApplied,
    limitedAmount,
    finalPrice: originalPrice - finalDiscount,
  };
}

/**
 * 같은 유형 중 최대 혜택 선택
 */
function selectBestBenefitsByType<T extends { type: BenefitType; discountAmount: number }>(
  benefits: T[]
): T[] {
  const bestByType = new Map<BenefitType, T>();

  benefits.forEach((benefit) => {
    const existing = bestByType.get(benefit.type);
    if (!existing || benefit.discountAmount > existing.discountAmount) {
      bestByType.set(benefit.type, benefit);
    }
  });

  // 우선순위 순서대로 반환
  return Array.from(bestByType.values()).sort(
    (a, b) => BENEFIT_PRIORITY[a.type] - BENEFIT_PRIORITY[b.type]
  );
}
