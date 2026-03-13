/**
 * 포인트 설정 Mock 데이터
 */
import type { PointSettingsData, PointSystemStats, SystemPointHistory } from '@/types/point';

export const mockPointSettings: PointSettingsData = {
  id: 'ps-1',
  earnPolicy: {
    type: 'fixed',
    fixedUnit: 1000,
    fixedPoints: 10,
    percentageRate: 1,
    maxEarnPoints: null,
    minOrderAmount: 5000,
  },
  usePolicy: {
    minUsePoints: 100,
    maxUseRate: 50,
    useUnit: 100,
    allowNegativeBalance: true,
  },
  expiryPolicy: {
    defaultValidityDays: 365,
    expiryNotificationDays: 30,
  },
  isActive: true,
  updatedAt: new Date('2026-02-01'),
  updatedBy: 'admin',
};

export const mockPointStats: PointSystemStats = {
  totalEarned: 2_847_500,
  totalUsed: 1_523_800,
  totalExpired: 342_100,
  currentBalance: 981_600,
};

export const mockPointHistory: SystemPointHistory[] = [
  { id: 'ph-1', memberId: 'm-1', memberName: '김영수', type: 'earn_order', amount: 1500, balance: 12500, description: '주문확정 적립 (주문 #ORD-2026-0215)', relatedOrderId: 'ORD-2026-0215', createdAt: new Date('2026-02-12T14:30:00'), expiresAt: new Date('2027-02-12') },
  { id: 'ph-2', memberId: 'm-2', memberName: '이미영', type: 'use_order', amount: -3000, balance: 8200, description: '주문 사용 (주문 #ORD-2026-0214)', relatedOrderId: 'ORD-2026-0214', createdAt: new Date('2026-02-12T13:15:00') },
  { id: 'ph-3', memberId: 'm-3', memberName: '박지훈', type: 'earn_manual', amount: 5000, balance: 15000, description: 'CS 보상 포인트', adminId: 'admin', adminMemo: '배송 지연 보상', createdAt: new Date('2026-02-12T11:00:00'), expiresAt: new Date('2027-02-12') },
  { id: 'ph-4', memberId: 'm-4', memberName: '최수연', type: 'expired', amount: -2000, balance: 4500, description: '포인트 만료', createdAt: new Date('2026-02-11T00:00:00') },
  { id: 'ph-5', memberId: 'm-5', memberName: '정대호', type: 'earn_order', amount: 800, balance: 9800, description: '주문확정 적립 (주문 #ORD-2026-0210)', relatedOrderId: 'ORD-2026-0210', createdAt: new Date('2026-02-11T16:45:00'), expiresAt: new Date('2027-02-11') },
  { id: 'ph-6', memberId: 'm-1', memberName: '김영수', type: 'use_order', amount: -5000, balance: 11000, description: '주문 사용 (주문 #ORD-2026-0209)', relatedOrderId: 'ORD-2026-0209', createdAt: new Date('2026-02-11T10:20:00') },
  { id: 'ph-7', memberId: 'm-6', memberName: '한소희', type: 'earn_event', amount: 2000, balance: 7000, description: '이벤트 적립 (생일 캠페인)', createdAt: new Date('2026-02-10T09:00:00'), expiresAt: new Date('2026-08-10') },
  { id: 'ph-8', memberId: 'm-7', memberName: '오승환', type: 'withdraw_manual', amount: -10000, balance: 0, description: '포인트 회수 (부정 사용)', adminId: 'admin', adminMemo: '중복 계정 적립 회수', createdAt: new Date('2026-02-10T08:30:00') },
  { id: 'ph-9', memberId: 'm-2', memberName: '이미영', type: 'earn_order', amount: 1200, balance: 11200, description: '주문확정 적립 (주문 #ORD-2026-0205)', relatedOrderId: 'ORD-2026-0205', createdAt: new Date('2026-02-09T17:00:00'), expiresAt: new Date('2027-02-09') },
  { id: 'ph-10', memberId: 'm-8', memberName: '신우진', type: 'use_order', amount: -2500, balance: 3500, description: '주문 사용 (주문 #ORD-2026-0204)', relatedOrderId: 'ORD-2026-0204', createdAt: new Date('2026-02-09T12:10:00') },
  { id: 'ph-11', memberId: 'm-9', memberName: '강은지', type: 'earn_order', amount: 950, balance: 6950, description: '주문확정 적립 (주문 #ORD-2026-0203)', relatedOrderId: 'ORD-2026-0203', createdAt: new Date('2026-02-08T15:30:00'), expiresAt: new Date('2027-02-08') },
  { id: 'ph-12', memberId: 'm-10', memberName: '윤서준', type: 'expired', amount: -1500, balance: 2000, description: '포인트 만료', createdAt: new Date('2026-02-08T00:00:00') },
  { id: 'ph-13', memberId: 'm-3', memberName: '박지훈', type: 'earn_order', amount: 2200, balance: 10000, description: '주문확정 적립 (주문 #ORD-2026-0200)', relatedOrderId: 'ORD-2026-0200', createdAt: new Date('2026-02-07T14:00:00'), expiresAt: new Date('2027-02-07') },
  { id: 'ph-14', memberId: 'm-4', memberName: '최수연', type: 'use_order', amount: -1800, balance: 6500, description: '주문 사용 (주문 #ORD-2026-0198)', relatedOrderId: 'ORD-2026-0198', createdAt: new Date('2026-02-07T11:45:00') },
  { id: 'ph-15', memberId: 'm-5', memberName: '정대호', type: 'earn_manual', amount: 3000, balance: 9000, description: '가입 환영 포인트', adminId: 'admin', createdAt: new Date('2026-02-06T09:00:00'), expiresAt: new Date('2027-02-06') },
];
