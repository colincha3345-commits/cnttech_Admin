export type PushType = 'info' | 'ad';
export type PushStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed' | 'cancelled';
export type TriggerType =
    | 'none'
    | 'cart_abandoned'
    | 'product_viewed'
    | 'app_installed'
    | 'purchase_completed'
    | 'regular_schedule'
    | 'time_limit';

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
