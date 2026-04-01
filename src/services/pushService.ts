/**
 * 푸시 알림 서비스
 * VITE_ENABLE_MOCK=true  → 인메모리 mock 데이터 사용
 * VITE_ENABLE_MOCK=false → 실제 백엔드 API 호출
 */
import { apiClient, IS_MOCK_MODE, mockDelay } from '@/lib/api';
import type {
  PushNotification,
  PushDetail,
  PushRecipient,
  PushListParams,
  PushEstimateParams,
  PushStatus,
  TriggerType,
} from '@/types/push';
import { ORDER_TRIGGER_TYPES } from '@/types/push';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Mock 데이터
const mockPushList: PushNotification[] = [
  {
    id: '1',
    type: 'ad',
    title: '[깜짝할인] 저녁 한정 치킨 3,000원 할인!',
    body: '오늘 저녁은 치킨이닭! 매장 방문 시 화면을 보여주세요.',
    status: 'completed',
    targetCount: 15200,
    triggerType: 'none',
    createdAt: new Date('2026-02-20T10:00:00'),
    updatedAt: new Date('2026-02-20T10:00:00'),
    scheduledAt: new Date('2026-02-20T18:00:00'),
  },
  {
    id: '2',
    type: 'info',
    title: '장바구니에 담긴 상품을 확인해보세요',
    body: '회원님이 담아두신 상품이 아직 남아있어요. 지금 결제하시면 내일 바로 픽업 가능합니다!',
    status: 'sending',
    targetCount: 300,
    triggerType: 'cart_abandoned',
    createdAt: new Date('2026-02-25T09:00:00'),
    updatedAt: new Date('2026-02-25T09:00:00'),
  },
  {
    id: '3',
    type: 'ad',
    title: '신메뉴 마라치킨 출시 완료',
    body: '가장 먼저 만나보는 신메뉴 혜택! 지금 바로 앱에서 확인하세요.',
    status: 'scheduled',
    targetCount: 50000,
    triggerType: 'none',
    createdAt: new Date('2026-02-25T09:30:00'),
    updatedAt: new Date('2026-02-25T09:30:00'),
    scheduledAt: new Date('2026-02-28T12:00:00'),
  },
  {
    id: '4',
    type: 'info',
    title: '주문이 접수되었습니다',
    body: '{{매장명}}에서 {{고객명}}님의 주문({{주문번호}})을 확인했습니다. 맛있게 준비할게요!',
    status: 'active',
    targetCount: 8420,
    totalSentCount: 8420,
    triggerType: 'order_confirmed',
    createdAt: new Date('2026-01-15T10:00:00'),
    updatedAt: new Date('2026-03-30T14:00:00'),
  },
  {
    id: '5',
    type: 'info',
    title: '주문이 완료되었습니다',
    body: '{{고객명}}님, {{매장명}} 주문({{주문금액}})이 완료되었습니다. 이용해주셔서 감사합니다!',
    status: 'active',
    targetCount: 7650,
    totalSentCount: 7650,
    triggerType: 'order_completed',
    createdAt: new Date('2026-01-15T10:30:00'),
    updatedAt: new Date('2026-03-30T14:00:00'),
  },
];

const mockRecipients: PushRecipient[] = [
  { id: 'h1', userId: 'user_001', name: '김철수', phone: '010-1234-5611', status: 'delivered', openedAt: null },
  { id: 'h2', userId: 'user_002', name: '이영희', phone: '010-2345-6722', status: 'opened', openedAt: '2026-02-20 18:30' },
  { id: 'h3', userId: 'user_003', name: '박민준', phone: '010-3456-7833', status: 'failed', openedAt: null },
  { id: 'h4', userId: 'user_004', name: '정수아', phone: '010-4567-8944', status: 'delivered', openedAt: null },
];

class PushService {
  /** 푸시 목록 조회 */
  async getList(params?: PushListParams): Promise<{
    data: PushNotification[];
    pagination: Pagination;
  }> {
    if (IS_MOCK_MODE) {
      await mockDelay();
      let filtered = [...mockPushList];

      if (params?.keyword) {
        const kw = params.keyword.toLowerCase();
        filtered = filtered.filter(
          (p) => p.title.toLowerCase().includes(kw) || p.body.toLowerCase().includes(kw),
        );
      }
      if (params?.status) {
        filtered = filtered.filter((p) => p.status === params.status);
      }

      filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const total = filtered.length;
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);

      return {
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }

    const query = new URLSearchParams();
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    return apiClient.get<{ data: PushNotification[]; pagination: Pagination }>(
      `/push?${query.toString()}`,
    );
  }

  /** 푸시 상세 조회 */
  async getDetail(id: string): Promise<PushDetail> {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const item = mockPushList.find((p) => p.id === id);
      if (!item) throw new Error('푸시를 찾을 수 없습니다.');

      return {
        ...item,
        sentAt: item.scheduledAt ?? item.createdAt,
        stats: {
          sent: item.targetCount,
          delivered: Math.floor(item.targetCount * 0.97),
          failed: Math.floor(item.targetCount * 0.03),
          opened: Math.floor(item.targetCount * 0.56),
          openRate: 57.4,
        },
      };
    }

    return apiClient.get<PushDetail>(`/push/${id}`);
  }

  /** 푸시 수신자 목록 조회 */
  async getRecipients(
    pushId: string,
    params?: { page?: number; limit?: number; status?: string },
  ): Promise<{ data: PushRecipient[]; pagination: Pagination }> {
    if (IS_MOCK_MODE) {
      await mockDelay();
      let filtered = [...mockRecipients];
      if (params?.status) {
        filtered = filtered.filter((r) => r.status === params.status);
      }

      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;
      const total = filtered.length;
      const start = (page - 1) * limit;

      return {
        data: filtered.slice(start, start + limit),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    }

    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);

    return apiClient.get<{ data: PushRecipient[]; pagination: Pagination }>(
      `/push/${pushId}/recipients?${query.toString()}`,
    );
  }

  /** 푸시 발송/예약 생성 */
  async create(payload: FormData): Promise<PushNotification> {
    if (IS_MOCK_MODE) {
      await mockDelay(500);
      const triggerType = (payload.get('triggerType') as TriggerType) ?? 'none';
      const isOrderTrigger = ORDER_TRIGGER_TYPES.includes(triggerType);
      const newPush: PushNotification = {
        id: `push_${Date.now()}`,
        type: (payload.get('type') as 'ad' | 'info') ?? 'info',
        title: (payload.get('title') as string) ?? '',
        body: (payload.get('body') as string) ?? '',
        status: isOrderTrigger
          ? 'active'
          : payload.get('isScheduled') === 'true'
            ? 'scheduled'
            : 'sending',
        targetCount: 0,
        triggerType,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      return newPush;
    }

    return apiClient.post<PushNotification>('/push', payload);
  }

  /** 예상 발송 대상자 수 조회 */
  async estimateCount(params: PushEstimateParams): Promise<{ count: number }> {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const hasFilter =
        !params.grades.includes('전체') ||
        !params.regions.includes('전체') ||
        !params.ages.includes('전체') ||
        params.triggerType !== 'none';
      return { count: hasFilter ? Math.floor(Math.random() * 3000) + 100 : 12400 };
    }

    return apiClient.post<{ count: number }>('/push/estimate-count', params);
  }

  /** 자동 발송 활성/비활성 토글 */
  async toggleStatus(id: string): Promise<PushNotification> {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const item = mockPushList.find((p) => p.id === id);
      if (!item) throw new Error('푸시를 찾을 수 없습니다.');
      item.status = (item.status === 'active' ? 'inactive' : 'active') as PushStatus;
      item.updatedAt = new Date();
      return { ...item };
    }

    return apiClient.post<PushNotification>(`/push/${id}/toggle-status`);
  }

  /** 푸시 취소 */
  async cancel(id: string): Promise<void> {
    if (IS_MOCK_MODE) {
      await mockDelay();
      const item = mockPushList.find((p) => p.id === id);
      if (item) item.status = 'cancelled' as PushStatus;
      return;
    }

    return apiClient.post(`/push/${id}/cancel`);
  }
}

export const pushService = new PushService();
