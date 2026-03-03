/**
 * 캠페인 관련 타입 정의
 */

/**
 * 캠페인 유형
 */
export type CampaignType = 'push' | 'sms' | 'email' | 'event' | 'coupon';

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  push: '푸시 알림',
  sms: 'SMS',
  email: '이메일',
  event: '이벤트',
  coupon: '쿠폰 발급',
};

/**
 * 캠페인 상태
 */
export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: '초안',
  scheduled: '예약됨',
  active: '진행중',
  completed: '완료',
  cancelled: '취소됨',
};

/**
 * 캠페인
 */
export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  description?: string;
  startDate: Date;
  endDate: Date;
  targetCount: number;
  participantCount: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * 캠페인 참여 이벤트 유형
 */
export type ParticipationEventType = 'click' | 'view' | 'purchase' | 'signup' | 'coupon_download';

export const PARTICIPATION_EVENT_TYPE_LABELS: Record<ParticipationEventType, string> = {
  click: '클릭',
  view: '조회',
  purchase: '구매',
  signup: '가입',
  coupon_download: '쿠폰 다운로드',
};

/**
 * 캠페인 참여 기록
 */
export interface CampaignParticipation {
  id: string;
  campaignId: string;
  memberId: string;
  eventType: ParticipationEventType;
  participatedAt: Date;
  metadata?: Record<string, unknown>;
}

/**
 * 캠페인 요약 정보 (목록용)
 */
export interface CampaignSummary {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  participantCount: number;
}

/**
 * 캠페인 검색 필터
 */
export interface CampaignSearchFilter {
  type?: CampaignType;
  status?: CampaignStatus;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
}
