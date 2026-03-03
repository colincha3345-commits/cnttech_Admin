/**
 * 캠페인 Mock 데이터
 */
import type {
  Campaign,
  CampaignParticipation,
} from '@/types/campaign';

/**
 * 캠페인 목록 (5개)
 */
export const mockCampaigns: Campaign[] = [
  {
    id: 'campaign-1',
    name: '신규 가입 환영 푸시',
    type: 'push',
    status: 'active',
    description: '신규 가입 회원 대상 환영 메시지 및 첫 주문 할인 쿠폰 안내',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    targetCount: 1000,
    participantCount: 523,
    createdAt: new Date('2025-12-15'),
    updatedAt: new Date('2026-02-01'),
    createdBy: 'admin-1',
  },
  {
    id: 'campaign-2',
    name: '2월 프로모션 SMS',
    type: 'sms',
    status: 'active',
    description: '2월 특별 프로모션 안내 SMS 발송',
    startDate: new Date('2026-02-01'),
    endDate: new Date('2026-02-28'),
    targetCount: 5000,
    participantCount: 2341,
    createdAt: new Date('2026-01-25'),
    updatedAt: new Date('2026-02-05'),
    createdBy: 'admin-1',
  },
  {
    id: 'campaign-3',
    name: 'VIP 고객 감사 이벤트',
    type: 'event',
    status: 'completed',
    description: 'VIP 등급 고객 대상 특별 감사 이벤트',
    startDate: new Date('2026-01-15'),
    endDate: new Date('2026-01-31'),
    targetCount: 200,
    participantCount: 187,
    createdAt: new Date('2026-01-10'),
    updatedAt: new Date('2026-02-01'),
    createdBy: 'admin-2',
  },
  {
    id: 'campaign-4',
    name: '휴면 고객 재활성화 이메일',
    type: 'email',
    status: 'scheduled',
    description: '3개월 이상 미접속 고객 대상 재활성화 이메일',
    startDate: new Date('2026-02-15'),
    endDate: new Date('2026-03-15'),
    targetCount: 800,
    participantCount: 0,
    createdAt: new Date('2026-02-05'),
    updatedAt: new Date('2026-02-05'),
    createdBy: 'admin-1',
  },
  {
    id: 'campaign-5',
    name: '생일 축하 쿠폰',
    type: 'coupon',
    status: 'active',
    description: '생일 고객 대상 자동 쿠폰 발급',
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-12-31'),
    targetCount: 2000,
    participantCount: 156,
    createdAt: new Date('2025-12-20'),
    updatedAt: new Date('2026-02-05'),
    createdBy: 'admin-2',
  },
];

/**
 * 캠페인 참여 기록
 * 각 회원이 여러 캠페인에 참여할 수 있음
 */
export const mockCampaignParticipations: CampaignParticipation[] = [
  // member-1 (김VIP) - campaign-1, campaign-3, campaign-5 참여
  {
    id: 'cp-1',
    campaignId: 'campaign-1',
    memberId: 'member-1',
    eventType: 'view',
    participatedAt: new Date('2024-01-15T10:30:00'),
    metadata: { source: 'push_notification' },
  },
  {
    id: 'cp-2',
    campaignId: 'campaign-3',
    memberId: 'member-1',
    eventType: 'purchase',
    participatedAt: new Date('2026-01-20T14:20:00'),
    metadata: { orderId: 'ORD-20260120-001' },
  },
  {
    id: 'cp-3',
    campaignId: 'campaign-5',
    memberId: 'member-1',
    eventType: 'coupon_download',
    participatedAt: new Date('2026-01-15T09:00:00'),
    metadata: { couponId: 'cp-birthday-001' },
  },

  // member-2 (이골드) - campaign-1, campaign-2 참여
  {
    id: 'cp-4',
    campaignId: 'campaign-1',
    memberId: 'member-2',
    eventType: 'click',
    participatedAt: new Date('2024-02-10T11:15:00'),
  },
  {
    id: 'cp-5',
    campaignId: 'campaign-2',
    memberId: 'member-2',
    eventType: 'view',
    participatedAt: new Date('2026-02-05T08:45:00'),
  },

  // member-3 (박실버) - campaign-1, campaign-2, campaign-5 참여
  {
    id: 'cp-6',
    campaignId: 'campaign-1',
    memberId: 'member-3',
    eventType: 'signup',
    participatedAt: new Date('2024-03-05T16:30:00'),
  },
  {
    id: 'cp-7',
    campaignId: 'campaign-2',
    memberId: 'member-3',
    eventType: 'click',
    participatedAt: new Date('2026-02-03T10:00:00'),
  },
  {
    id: 'cp-8',
    campaignId: 'campaign-5',
    memberId: 'member-3',
    eventType: 'coupon_download',
    participatedAt: new Date('2026-02-01T12:00:00'),
  },

  // member-4 (최브론즈) - campaign-2 참여
  {
    id: 'cp-9',
    campaignId: 'campaign-2',
    memberId: 'member-4',
    eventType: 'view',
    participatedAt: new Date('2026-02-02T15:30:00'),
  },

  // member-5 (정신규) - campaign-1, campaign-2 참여
  {
    id: 'cp-10',
    campaignId: 'campaign-1',
    memberId: 'member-5',
    eventType: 'signup',
    participatedAt: new Date('2026-02-01T09:15:00'),
  },
  {
    id: 'cp-11',
    campaignId: 'campaign-2',
    memberId: 'member-5',
    eventType: 'click',
    participatedAt: new Date('2026-02-06T11:00:00'),
  },

  // member-6 (강휴면) - campaign-4 대상 (예정)
  // 아직 참여 없음

  // member-7 (윤장기) - 참여 없음

  // member-8 (임탈퇴) - campaign-1 참여 이력
  {
    id: 'cp-12',
    campaignId: 'campaign-1',
    memberId: 'member-8',
    eventType: 'view',
    participatedAt: new Date('2023-06-01T10:00:00'),
  },

  // member-9 ~ member-14 추가 참여 기록
  {
    id: 'cp-13',
    campaignId: 'campaign-2',
    memberId: 'member-9',
    eventType: 'view',
    participatedAt: new Date('2026-02-04T13:20:00'),
  },
  {
    id: 'cp-14',
    campaignId: 'campaign-3',
    memberId: 'member-10',
    eventType: 'purchase',
    participatedAt: new Date('2026-01-25T16:45:00'),
    metadata: { orderId: 'ORD-20260125-010' },
  },
  {
    id: 'cp-15',
    campaignId: 'campaign-5',
    memberId: 'member-11',
    eventType: 'coupon_download',
    participatedAt: new Date('2026-01-20T11:30:00'),
  },
  {
    id: 'cp-16',
    campaignId: 'campaign-2',
    memberId: 'member-12',
    eventType: 'click',
    participatedAt: new Date('2026-02-07T09:15:00'),
  },
  {
    id: 'cp-17',
    campaignId: 'campaign-1',
    memberId: 'member-13',
    eventType: 'signup',
    participatedAt: new Date('2025-11-15T14:00:00'),
  },
  {
    id: 'cp-18',
    campaignId: 'campaign-2',
    memberId: 'member-14',
    eventType: 'view',
    participatedAt: new Date('2026-02-08T10:30:00'),
  },
];

/**
 * 특정 캠페인의 참여자 ID 목록 조회
 */
export function getCampaignParticipantIds(campaignId: string): string[] {
  return [
    ...new Set(
      mockCampaignParticipations
        .filter((p) => p.campaignId === campaignId)
        .map((p) => p.memberId)
    ),
  ];
}

/**
 * 특정 회원의 참여 캠페인 ID 목록 조회
 */
export function getMemberCampaignIds(memberId: string): string[] {
  return [
    ...new Set(
      mockCampaignParticipations
        .filter((p) => p.memberId === memberId)
        .map((p) => p.campaignId)
    ),
  ];
}
