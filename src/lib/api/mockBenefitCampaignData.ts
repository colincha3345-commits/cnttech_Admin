/**
 * 혜택 캠페인 Mock 데이터
 */
import type { BenefitCampaign } from '@/types/benefit-campaign';

export const mockBenefitCampaigns: BenefitCampaign[] = [
  {
    id: 'bc-1',
    name: '첫 주문 혜택',
    description: '첫 주문 시 쿠폰 + 포인트 적립',
    trigger: 'order',
    orderCondition: { minOrderAmount: 15000, nthOrder: 1, isEveryNthOrder: false, specificProductIds: [] },
    benefitConfig: {
      couponBenefits: [{ couponId: '1', couponName: '첫 주문 쿠폰 (20% 할인)' }],
      pointBenefits: [{ earnType: 'percentage' as const, pointAmount: 0, percentageRate: 5, maxEarnPoints: 5000, pointValidityDays: 90, pointDescription: '첫 주문 감사 포인트 (주문금액의 5%)' }],
    },
    isAlwaysOn: false,
    startDate: '2026-01-01', endDate: '2026-12-31', status: 'active',
    totalIssuedCount: 342, totalBeneficiaryCount: 342,
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-02-01'), createdBy: 'admin',
  },
  {
    id: 'bc-2',
    name: '신규 가입 환영',
    description: '회원 가입 시 쿠폰 2장 자동 발급',
    trigger: 'signup',
    signupCondition: { delayMinutes: 0 },
    benefitConfig: {
      couponBenefits: [
        { couponId: '1', couponName: '첫 주문 쿠폰 (20% 할인)' },
        { couponId: '3', couponName: '봄맞이 쿠폰 (15% 할인)' },
      ],
      pointBenefits: [{ earnType: 'fixed' as const, pointAmount: 500, percentageRate: 0, maxEarnPoints: null, pointValidityDays: 30, pointDescription: '가입 환영 포인트' }],
    },
    isAlwaysOn: true,
    startDate: '2026-01-01', endDate: null, status: 'active',
    totalIssuedCount: 523, totalBeneficiaryCount: 523,
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-01-15'), createdBy: 'admin',
  },
  {
    id: 'bc-3',
    name: '생일 축하 캠페인',
    description: '생일 당일 쿠폰 + 포인트 지급',
    trigger: 'birthday',
    birthdayCondition: { daysBefore: 0, daysAfter: 30, repeatYearly: true },
    benefitConfig: {
      couponBenefits: [{ couponId: '2', couponName: '생일 축하 쿠폰 (5,000원 할인)' }],
      pointBenefits: [{ earnType: 'fixed' as const, pointAmount: 2000, percentageRate: 0, maxEarnPoints: null, pointValidityDays: 30, pointDescription: '생일 축하 포인트' }],
    },
    isAlwaysOn: true,
    startDate: '2026-01-01', endDate: null, status: 'active',
    totalIssuedCount: 128, totalBeneficiaryCount: 64,
    createdAt: new Date('2026-01-01'), updatedAt: new Date('2026-02-01'), createdBy: 'admin',
  },
  {
    id: 'bc-4',
    name: 'VIP 등급 달성 보상',
    description: 'VIP 달성 시 특별 쿠폰 지급',
    trigger: 'membership_upgrade',
    membershipCondition: { targetGrades: ['vip'] },
    benefitConfig: {
      couponBenefits: [{ couponId: '4', couponName: 'VIP 전용 쿠폰 (30% 할인)' }],
      pointBenefits: [],
    },
    isAlwaysOn: true,
    startDate: '2026-01-01', endDate: null, status: 'draft',
    totalIssuedCount: 0, totalBeneficiaryCount: 0,
    createdAt: new Date('2026-02-05'), updatedAt: new Date('2026-02-05'), createdBy: 'admin',
  },
  {
    id: 'bc-5',
    name: 'VIP 그룹 특별 혜택 캠페인',
    description: 'VIP 회원 그룹에 포인트 일괄 발급',
    trigger: 'member_group',
    memberGroupCondition: {
      manualIssueTargetType: 'groups',
      manualIssueMemberIds: [],
      manualIssueGroupIds: ['g-001', 'g-002'],
      manualIssueGradeIds: [],
    },
    benefitConfig: {
      couponBenefits: [],
      pointBenefits: [{ earnType: 'fixed' as const, pointAmount: 5000, percentageRate: 0, maxEarnPoints: null, pointValidityDays: 90, pointDescription: 'VIP 그룹 특별 포인트' }],
    },
    isAlwaysOn: false,
    startDate: '2026-02-01', endDate: '2026-06-30', status: 'active',
    totalIssuedCount: 46, totalBeneficiaryCount: 28,
    createdAt: new Date('2026-02-01'), updatedAt: new Date('2026-02-08'), createdBy: 'admin',
  },
  {
    id: 'bc-6',
    name: '봄 프로모션 코드 이벤트',
    description: '난수 발행 코드로 봄 시즌 할인 쿠폰 지급',
    trigger: 'promo_code',
    promoCodeCondition: {
      generationMethod: 'random',
      codePrefix: 'SPRING',
      codeLength: 8,
      codeQuantity: 500,
      promoCodes: [
        { code: 'SPRING-ABCD1234', usedCount: 3, isActive: true, createdAt: '2026-02-01T00:00:00.000Z' },
        { code: 'SPRING-EFGH5678', usedCount: 0, isActive: true, createdAt: '2026-02-01T00:00:00.000Z' },
        { code: 'SPRING-JKMN9012', usedCount: 1, isActive: true, createdAt: '2026-02-01T00:00:00.000Z' },
      ],
      uploadedFileName: null,
      usageCondition: {
        maxUsesPerCode: 1,
        maxUsesPerMember: 1,
        codeValidityDays: 90,
      },
    },
    benefitConfig: {
      couponBenefits: [{ couponId: '5', couponName: '프로모션 코드 (3,000원 할인)' }],
      pointBenefits: [],
    },
    isAlwaysOn: false,
    startDate: '2026-02-01', endDate: '2026-04-30', status: 'active',
    totalIssuedCount: 4, totalBeneficiaryCount: 4,
    createdAt: new Date('2026-02-01'), updatedAt: new Date('2026-02-10'), createdBy: 'admin',
  },
];

export const mockAvailableCoupons = [
  { id: '1', name: '첫 주문 쿠폰 (20% 할인)' },
  { id: '2', name: '생일 축하 쿠폰 (5,000원 할인)' },
  { id: '3', name: '봄맞이 쿠폰 (15% 할인)' },
  { id: '4', name: 'VIP 전용 쿠폰 (30% 할인)' },
  { id: '5', name: '프로모션 코드 (3,000원 할인)' },
];
