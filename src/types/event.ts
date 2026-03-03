/**
 * 이벤트 관리 도메인 타입 정의
 * 이벤트 생성/관리, 딥링크, 공유, 참여자 수집, 통계
 */

import type { BadgeVariant } from './index';

// ============================================
// Enum 타입
// ============================================

export type EventStatus = 'scheduled' | 'active' | 'ended';

// 이벤트 유형
export type EventType = 'general' | 'participation';

// 참여자 수집 방식
export type ParticipantCollectionMode = 'auto' | 'form_input';

// 입력수집 폼 필드
export type ParticipantFormField = 'name' | 'phone' | 'email' | 'address';

export type ShareChannel = 'kakao' | 'facebook' | 'instagram' | 'twitter' | 'link_copy';

export type ParticipantActionType = 'page_view' | 'order_click' | 'share';

// ============================================
// 라벨 매핑
// ============================================

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  scheduled: '예약됨',
  active: '진행중',
  ended: '종료',
};

export const EVENT_STATUS_BADGE: Record<EventStatus, BadgeVariant> = {
  scheduled: 'info',
  active: 'success',
  ended: 'default',
};

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  general: '일반이벤트',
  participation: '참여이벤트',
};

export const COLLECTION_MODE_LABELS: Record<ParticipantCollectionMode, string> = {
  auto: '회원 자동수집',
  form_input: '입력수집',
};

export const PARTICIPANT_FORM_FIELD_LABELS: Record<ParticipantFormField, string> = {
  name: '이름',
  phone: '연락처',
  email: '이메일',
  address: '주소',
};

export const SHARE_CHANNEL_LABELS: Record<ShareChannel, string> = {
  kakao: '카카오톡',
  facebook: '페이스북',
  instagram: '인스타그램',
  twitter: 'X(트위터)',
  link_copy: '링크 복사',
};

export const PARTICIPANT_ACTION_LABELS: Record<ParticipantActionType, string> = {
  page_view: '페이지 조회',
  order_click: '주문 클릭',
  share: '공유',
};

// ============================================
// 엔티티 타입
// ============================================

export interface EventStats {
  pageViews: number;
  uniqueVisitors: number;
  orderButtonClicks: number;
  shareCount: number;
  participantCount: number;
  conversionRate: number;
}

export interface Event {
  id: string;

  // 이벤트 유형
  eventType: EventType;

  // 기본 정보
  title: string;
  description: string;
  content: string;
  bannerImageUrl: string;
  detailImageUrl: string;

  // 일정 & 게시 예약
  status: EventStatus;
  eventStartDate: string;
  eventEndDate: string;
  publishDate: string | null;

  // 딥링크 & 프로모션
  deepLink: string;
  promoLink: string;

  // 버튼 설정
  orderButtonEnabled: boolean;
  orderButtonLabel: string;
  orderButtonLink: string;
  shareButtonEnabled: boolean;

  // 공유 설정
  shareChannels: ShareChannel[];
  shareTitle: string;
  shareDescription: string;
  shareImageUrl: string;

  // 참여자 설정 (참여이벤트 전용)
  collectionMode: ParticipantCollectionMode;
  formFields: ParticipantFormField[];
  consentRequired: boolean;
  thirdPartyConsentRequired: boolean;
  consentText: string;
  thirdPartyConsentText: string;

  // 통계
  stats: EventStats;

  // 메타
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface EventParticipant {
  id: string;
  eventId: string;
  // 회원 자동수집 시 사용
  memberId: string | null;
  memberName: string;
  memberPhone: string;
  memberEmail: string;
  // 입력수집 시 추가 필드
  memberAddress: string;
  collectionMode: ParticipantCollectionMode;
  participatedAt: string;
  hasConsented: boolean;
  hasThirdPartyConsented: boolean;
  actionType: ParticipantActionType;
}

// ============================================
// 폼 데이터 (평탄화)
// ============================================

export interface EventFormData {
  // 이벤트 유형
  eventType: EventType;

  // 기본 정보
  title: string;
  description: string;
  content: string;
  bannerImageUrl: string;
  detailImageUrl: string;

  // 일정
  eventStartDate: string;
  eventEndDate: string;
  usePublishSchedule: boolean;
  publishDate: string;

  // 딥링크
  deepLink: string;

  // 버튼
  orderButtonEnabled: boolean;
  orderButtonLabel: string;
  orderButtonLink: string;
  shareButtonEnabled: boolean;

  // 공유
  shareChannels: ShareChannel[];
  shareTitle: string;
  shareDescription: string;
  shareImageUrl: string;

  // 푸시 알림 미리보기
  pushTitle: string;
  pushBody: string;

  // 참여자 (참여이벤트 전용)
  collectionMode: ParticipantCollectionMode;
  formFields: ParticipantFormField[];
  consentRequired: boolean;
  thirdPartyConsentRequired: boolean;
  consentText: string;
  thirdPartyConsentText: string;
}

// ============================================
// 기본값
// ============================================

export const DEFAULT_EVENT_FORM: EventFormData = {
  eventType: 'general',

  title: '',
  description: '',
  content: '',
  bannerImageUrl: '',
  detailImageUrl: '',

  eventStartDate: '',
  eventEndDate: '',
  usePublishSchedule: false,
  publishDate: '',

  deepLink: '',

  orderButtonEnabled: true,
  orderButtonLabel: '주문하러 가기',
  orderButtonLink: '',
  shareButtonEnabled: true,

  shareChannels: ['kakao', 'link_copy'],
  shareTitle: '',
  shareDescription: '',
  shareImageUrl: '',

  pushTitle: '',
  pushBody: '',

  collectionMode: 'auto',
  formFields: ['name', 'phone'],
  consentRequired: false,
  thirdPartyConsentRequired: false,
  consentText: '개인정보 수집 및 이용에 동의합니다.',
  thirdPartyConsentText: '개인정보 제3자 제공에 동의합니다.',
};

// ============================================
// 검증
// ============================================

export function validateEventForm(data: EventFormData): string[] {
  const errors: string[] = [];

  // 기본 정보
  if (!data.title.trim()) {
    errors.push('이벤트 제목을 입력해주세요.');
  }
  if (!data.bannerImageUrl) {
    errors.push('배너 이미지를 등록해주세요.');
  }

  // 일정
  if (!data.eventStartDate) {
    errors.push('이벤트 시작일을 설정해주세요.');
  }
  if (!data.eventEndDate) {
    errors.push('이벤트 종료일을 설정해주세요.');
  }
  if (data.eventStartDate && data.eventEndDate && data.eventStartDate >= data.eventEndDate) {
    errors.push('종료일은 시작일 이후여야 합니다.');
  }

  // 게시 예약
  if (data.usePublishSchedule && !data.publishDate) {
    errors.push('게시 예약 일시를 설정해주세요.');
  }
  if (data.usePublishSchedule && data.publishDate && new Date(data.publishDate) <= new Date()) {
    errors.push('게시 예약 일시는 현재 시간 이후여야 합니다.');
  }

  // 주문 버튼
  if (data.orderButtonEnabled) {
    if (!data.orderButtonLabel.trim()) {
      errors.push('주문 버튼 텍스트를 입력해주세요.');
    }
    if (!data.orderButtonLink.trim()) {
      errors.push('주문 버튼 링크를 입력해주세요.');
    }
  }

  // 공유
  if (data.shareButtonEnabled && data.shareChannels.length === 0) {
    errors.push('공유 채널을 1개 이상 선택해주세요.');
  }

  // 참여이벤트 검증
  if (data.eventType === 'participation') {
    if (data.collectionMode === 'form_input' && data.formFields.length === 0) {
      errors.push('입력수집 필드를 1개 이상 선택해주세요.');
    }
    if (data.consentRequired && !data.consentText.trim()) {
      errors.push('개인정보 동의 문구를 입력해주세요.');
    }
    if (data.thirdPartyConsentRequired && !data.thirdPartyConsentText.trim()) {
      errors.push('제3자 제공 동의 문구를 입력해주세요.');
    }
  }

  return errors;
}

// ============================================
// 검색/필터 타입
// ============================================

export interface EventListParams {
  keyword?: string;
  status?: EventStatus | 'all';
  eventType?: EventType | 'all';
  page?: number;
  limit?: number;
}

export interface EventStatsOverview {
  total: number;
  active: number;
  scheduled: number;
  totalParticipants: number;
}
