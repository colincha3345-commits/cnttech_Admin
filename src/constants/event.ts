/**
 * 이벤트 관리 상수
 */

import type { EventStatus, EventType } from '@/types/event';

// 상태 필터 옵션
export const EVENT_STATUS_FILTER_OPTIONS: { value: EventStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'scheduled', label: '예약됨' },
  { value: 'active', label: '진행중' },
  { value: 'ended', label: '종료' },
];

// 폼 탭
export type EventFormTab = 'basic' | 'share' | 'participant';

export const EVENT_FORM_TABS: { value: EventFormTab; label: string }[] = [
  { value: 'basic', label: '기본 정보' },
  { value: 'share', label: '버튼 & 공유' },
  { value: 'participant', label: '참여자 & 통계' },
];

// 이벤트 유형 필터 옵션
export const EVENT_TYPE_FILTER_OPTIONS: { value: EventType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'general', label: '일반이벤트' },
  { value: 'participation', label: '참여이벤트' },
];

// 프로모션 링크 베이스 URL
export const PROMO_LINK_BASE = 'https://promo.cnttech.co.kr/events/';

// 앱 딥링크 베이스 URL
export const APP_DEEP_LINK_BASE = 'myapp://events/';
