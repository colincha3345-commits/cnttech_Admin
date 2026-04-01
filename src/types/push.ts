export type PushType = 'info' | 'ad';
export type PushStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled' | 'active' | 'inactive';
export type TriggerType =
    | 'none'
    | 'cart_abandoned'
    | 'product_viewed'
    | 'app_installed'
    | 'purchase_completed'
    | 'regular_schedule'
    | 'time_limit'
    | 'order_confirmed'
    | 'order_ready'
    | 'order_delivering'
    | 'order_completed';

export interface PushNotification {
    id: string;
    type: PushType;
    title: string;
    body: string;
    deepLink?: string;
    scheduledAt?: Date;
    status: PushStatus;
    targetCount: number;
    triggerType: TriggerType;
    triggerConfig?: Record<string, unknown>;
    totalSentCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export type PushDeliveryStatus = 'delivered' | 'opened' | 'failed';

export interface PushStats {
    sent: number;
    delivered: number;
    failed: number;
    opened: number;
    openRate: number;
}

export interface PushDetail extends PushNotification {
    sentAt?: Date;
    stats: PushStats;
}

export interface PushRecipient {
    id: string;
    userId: string;
    name: string;
    phone: string;
    status: PushDeliveryStatus;
    openedAt: string | null;
}

export interface PushListParams {
    keyword?: string;
    status?: PushStatus;
    page?: number;
    limit?: number;
}

export interface PushNotificationForm {
    type: PushType;
    title: string;
    body: string;
    deepLink: string;
    isScheduled: boolean;
    scheduledAt: string;
    triggerType: TriggerType;
    targetUserIds: string[];

    // Android 전용 추가 필드
    androidExpandedTitle?: string;
    androidExpandedBody?: string;
    androidSummary?: string;

    // 정기 발송 유형
    regularScheduleType?: 'daily' | 'weekly';
    regularScheduleDays?: string[]; // 매주 선택 시 요일

    // 특정 시간 제한 이벤트 선택
    timeLimitEventId?: string;
}

export interface PushEstimateParams {
    grades: string[];
    regions: string[];
    ages: string[];
    triggerType: TriggerType;
}

/** 주문 상태 기반 트리거 타입 목록 */
export const ORDER_TRIGGER_TYPES: TriggerType[] = [
    'order_confirmed',
    'order_ready',
    'order_delivering',
    'order_completed',
];

/** 트리거 타입별 한글 라벨 */
export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
    none: '수동 발송',
    cart_abandoned: '장바구니 방치',
    product_viewed: '상품 반복 조회',
    app_installed: '앱 설치',
    purchase_completed: '구매 완료',
    regular_schedule: '정기 발송',
    time_limit: '시간 제한',
    order_confirmed: '매장 접수',
    order_ready: '픽업 준비',
    order_delivering: '배달 출발',
    order_completed: '주문 완료',
};

/** 주문 트리거 여부 판별 */
export function isOrderTrigger(type: TriggerType): boolean {
    return ORDER_TRIGGER_TYPES.includes(type);
}
