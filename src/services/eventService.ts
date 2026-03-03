/**
 * 이벤트 서비스
 * VITE_ENABLE_MOCK=true  → 인메모리 mock 데이터 사용
 * VITE_ENABLE_MOCK=false → 실제 백엔드 API 호출
 */
import { apiClient, IS_MOCK_MODE, mockDelay } from '@/lib/api';
import { mockEvents, mockEventParticipants } from '@/lib/api/mockEventData';
import type {
  Event,
  EventFormData,
  EventListParams,
  EventParticipant,
  EventStats,
  EventStatsOverview,
  EventStatus,
} from '@/types/event';
import { PROMO_LINK_BASE, APP_DEEP_LINK_BASE } from '@/constants/event';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

function createEmptyStats(): EventStats {
  return { pageViews: 0, uniqueVisitors: 0, orderButtonClicks: 0, shareCount: 0, participantCount: 0, conversionRate: 0 };
}

function formToEvent(formData: EventFormData, id: string): Omit<Event, 'id' | 'status' | 'promoLink' | 'stats' | 'createdAt' | 'updatedAt' | 'createdBy'> {
  return {
    eventType: formData.eventType,
    title: formData.title,
    description: formData.description,
    content: formData.content,
    bannerImageUrl: formData.bannerImageUrl,
    detailImageUrl: formData.detailImageUrl,
    eventStartDate: formData.eventStartDate,
    eventEndDate: formData.eventEndDate,
    publishDate: formData.usePublishSchedule ? formData.publishDate : null,
    deepLink: formData.deepLink || `${APP_DEEP_LINK_BASE}${id}`,
    orderButtonEnabled: formData.orderButtonEnabled,
    orderButtonLabel: formData.orderButtonLabel,
    orderButtonLink: formData.orderButtonLink,
    shareButtonEnabled: formData.shareButtonEnabled,
    shareChannels: formData.shareChannels,
    shareTitle: formData.shareTitle,
    shareDescription: formData.shareDescription,
    shareImageUrl: formData.shareImageUrl,
    collectionMode: formData.collectionMode,
    formFields: formData.formFields,
    consentRequired: formData.consentRequired,
    thirdPartyConsentRequired: formData.thirdPartyConsentRequired,
    consentText: formData.consentText,
    thirdPartyConsentText: formData.thirdPartyConsentText,
  };
}

// ============================================================
// Mock 구현
// ============================================================
class MockEventService {
  private events: Event[] = [...mockEvents];
  private participants: EventParticipant[] = [...mockEventParticipants];

  async getEvents(params?: EventListParams): Promise<{ data: Event[]; pagination: Pagination }> {
    await mockDelay();
    const { status, eventType, keyword = '', page = 1, limit = 50 } = params ?? {};
    let result = [...this.events];
    if (status && status !== 'all') result = result.filter((e) => e.status === status);
    if (eventType && eventType !== 'all') result = result.filter((e) => e.eventType === eventType);
    if (keyword) result = result.filter((e) => e.title.toLowerCase().includes(keyword.toLowerCase()));
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getEventById(id: string): Promise<{ data: Event }> {
    await mockDelay();
    const event = this.events.find((e) => e.id === id);
    if (!event) throw new Error('이벤트를 찾을 수 없습니다.');
    return { data: event };
  }

  async createEvent(formData: EventFormData): Promise<{ data: Event }> {
    await mockDelay();
    const id = `evt-${Date.now()}`;
    const now = new Date().toISOString();
    const newEvent: Event = { ...formToEvent(formData, id), id, status: 'scheduled', promoLink: `${PROMO_LINK_BASE}${id}`, stats: createEmptyStats(), createdAt: now, updatedAt: now, createdBy: 'admin' };
    this.events = [...this.events, newEvent];
    return { data: newEvent };
  }

  async updateEvent(id: string, formData: EventFormData, existingStatus?: EventStatus): Promise<{ data: Event }> {
    await mockDelay();
    let updated: Event | null = null;
    this.events = this.events.map((e) => {
      if (e.id === id) { updated = { ...e, ...formToEvent(formData, id), status: existingStatus ?? e.status, updatedAt: new Date().toISOString() }; return updated; }
      return e;
    });
    if (!updated) throw new Error('이벤트를 찾을 수 없습니다.');
    return { data: updated };
  }

  async deleteEvent(id: string): Promise<void> {
    await mockDelay();
    this.events = this.events.filter((e) => e.id !== id);
    this.participants = this.participants.filter((p) => p.eventId !== id);
  }

  async duplicateEvent(id: string): Promise<{ data: Event }> {
    await mockDelay();
    const original = this.events.find((e) => e.id === id);
    if (!original) throw new Error('이벤트를 찾을 수 없습니다.');
    const newId = `evt-${Date.now()}`;
    const now = new Date().toISOString();
    const duplicate: Event = { ...original, id: newId, title: `${original.title} (복사본)`, status: 'scheduled', promoLink: `${PROMO_LINK_BASE}${newId}`, stats: createEmptyStats(), createdAt: now, updatedAt: now };
    this.events = [...this.events, duplicate];
    return { data: duplicate };
  }

  async getStatsOverview(): Promise<{ data: EventStatsOverview }> {
    await mockDelay(100);
    return { data: { total: this.events.length, active: this.events.filter((e) => e.status === 'active').length, scheduled: this.events.filter((e) => e.status === 'scheduled').length, totalParticipants: this.participants.length } };
  }

  async getParticipants(eventId: string, params?: { keyword?: string; actionType?: string; page?: number; limit?: number }): Promise<{ data: EventParticipant[]; pagination: Pagination }> {
    await mockDelay();
    const { keyword = '', actionType, page = 1, limit = 20 } = params ?? {};
    let result = this.participants.filter((p) => p.eventId === eventId);
    if (actionType && actionType !== 'all') result = result.filter((p) => p.actionType === actionType);
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter((p) => p.memberName.toLowerCase().includes(lower) || p.memberPhone.includes(lower) || p.memberEmail.toLowerCase().includes(lower));
    }
    result.sort((a, b) => new Date(b.participatedAt).getTime() - new Date(a.participatedAt).getTime());
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async exportParticipants(eventId: string): Promise<{ data: EventParticipant[] }> {
    await mockDelay(100);
    return { data: this.participants.filter((p) => p.eventId === eventId) };
  }
}

// ============================================================
// Real API 구현
// ============================================================
class RealEventService {
  private readonly BASE = '/events';

  async getEvents(params?: EventListParams): Promise<{ data: Event[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.eventType && params.eventType !== 'all') query.set('eventType', params.eventType);
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiClient.get<{ data: Event[]; pagination: Pagination }>(`${this.BASE}?${query.toString()}`);
  }
  async getEventById(id: string): Promise<{ data: Event }> {
    return apiClient.get<{ data: Event }>(`${this.BASE}/${id}`);
  }
  async createEvent(formData: EventFormData): Promise<{ data: Event }> {
    return apiClient.post<{ data: Event }>(this.BASE, formData);
  }
  async updateEvent(id: string, formData: EventFormData, existingStatus?: EventStatus): Promise<{ data: Event }> {
    return apiClient.put<{ data: Event }>(`${this.BASE}/${id}`, { ...formData, status: existingStatus });
  }
  async deleteEvent(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE}/${id}`);
  }
  async duplicateEvent(id: string): Promise<{ data: Event }> {
    return apiClient.post<{ data: Event }>(`${this.BASE}/${id}/duplicate`);
  }
  async getStatsOverview(): Promise<{ data: EventStatsOverview }> {
    return apiClient.get<{ data: EventStatsOverview }>(`${this.BASE}/stats`);
  }
  async getParticipants(eventId: string, params?: { keyword?: string; actionType?: string; page?: number; limit?: number }): Promise<{ data: EventParticipant[]; pagination: Pagination }> {
    const query = new URLSearchParams();
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.actionType && params.actionType !== 'all') query.set('actionType', params.actionType);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiClient.get<{ data: EventParticipant[]; pagination: Pagination }>(`${this.BASE}/${eventId}/participants?${query.toString()}`);
  }
  async exportParticipants(eventId: string): Promise<{ data: EventParticipant[] }> {
    return apiClient.get<{ data: EventParticipant[] }>(`${this.BASE}/${eventId}/participants/export`);
  }
}

// ============================================================
// 환경변수에 따라 구현체 선택
// ============================================================
export const eventService: MockEventService | RealEventService =
  IS_MOCK_MODE ? new MockEventService() : new RealEventService();
