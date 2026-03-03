/**
 * 멤버십 등급 Mock 데이터
 */
import type { MembershipGrade } from '@/types/membership-grade';

export const mockMembershipGrades: MembershipGrade[] = [
  {
    id: 'grade-vip',
    name: 'VIP',
    description: '최상위 등급 회원',
    badgeVariant: 'critical',
    order: 1,
    achievementCondition: {
      minTotalOrderAmount: 1000000,
      minOrderCount: 50,
      calculationPeriod: { type: 'recent_months', months: 12 },
      retentionMonths: 12,
    },
    benefits: {
      point: { earnMultiplier: 2.0 },
      coupon: {
        autoIssueCouponIds: ['4'],
        issueOnUpgrade: true,
        issueMonthly: true,
        monthlyIssueDay: 1,
      },
    },
    isActive: true,
    isDefault: false,
    memberCount: 123,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    createdBy: 'admin',
  },
  {
    id: 'grade-gold',
    name: '골드',
    description: '우수 회원',
    badgeVariant: 'warning',
    order: 2,
    achievementCondition: {
      minTotalOrderAmount: 500000,
      minOrderCount: 30,
      calculationPeriod: { type: 'recent_months', months: 12 },
      retentionMonths: 12,
    },
    benefits: {
      point: { earnMultiplier: 1.5 },
      coupon: {
        autoIssueCouponIds: [],
        issueOnUpgrade: true,
        issueMonthly: false,
        monthlyIssueDay: null,
      },
    },
    isActive: true,
    isDefault: false,
    memberCount: 456,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    createdBy: 'admin',
  },
  {
    id: 'grade-silver',
    name: '실버',
    description: '일반 우수 회원',
    badgeVariant: 'info',
    order: 3,
    achievementCondition: {
      minTotalOrderAmount: 200000,
      minOrderCount: 10,
      calculationPeriod: { type: 'recent_months', months: 12 },
      retentionMonths: 12,
    },
    benefits: {
      point: { earnMultiplier: 1.2 },
      coupon: {
        autoIssueCouponIds: [],
        issueOnUpgrade: true,
        issueMonthly: false,
        monthlyIssueDay: null,
      },
    },
    isActive: true,
    isDefault: false,
    memberCount: 789,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    createdBy: 'admin',
  },
  {
    id: 'grade-normal',
    name: '일반',
    description: '기본 등급',
    badgeVariant: 'secondary',
    order: 4,
    achievementCondition: {
      minTotalOrderAmount: null,
      minOrderCount: null,
      calculationPeriod: { type: 'lifetime', months: null },
      retentionMonths: null,
    },
    benefits: {
      point: { earnMultiplier: 1.0 },
      coupon: {
        autoIssueCouponIds: [],
        issueOnUpgrade: false,
        issueMonthly: false,
        monthlyIssueDay: null,
      },
    },
    isActive: true,
    isDefault: true,
    memberCount: 2345,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    createdBy: 'admin',
  },
];
