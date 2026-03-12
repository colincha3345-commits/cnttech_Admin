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
