import React, { useState } from 'react';
import {
  BellOutlined,
  MailOutlined,
  MobileOutlined,
  MessageOutlined,
  DownOutlined,
  RightOutlined,
} from '@ant-design/icons';

import { Card, Badge } from '@/components/ui';
import { useMemberNotifications } from '@/hooks';
import {
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_CHANNEL_LABELS,
  NOTIFICATION_STATUS_LABELS,
} from '@/types/app-member';
import type {
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from '@/types/app-member';

interface NotificationHistoryTabProps {
  memberId: string;
}

export const NotificationHistoryTab: React.FC<NotificationHistoryTabProps> = ({
  memberId,
}) => {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [channelFilter, setChannelFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [expandedNotifications, setExpandedNotifications] = useState<Set<string>>(new Set());
  const limit = 15;

  const { notifications, pagination, isLoading } = useMemberNotifications({
    memberId,
    type: typeFilter || undefined,
    channel: channelFilter || undefined,
    page,
    limit,
  });

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 알림 유형별 Badge 색상
  const getTypeBadgeVariant = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return 'success';
      case 'promotion':
        return 'warning';
      case 'point':
        return 'info';
      case 'coupon':
        return 'default';
      case 'system':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // 채널 아이콘
  const getChannelIcon = (channel: NotificationChannel) => {
    switch (channel) {
      case 'push':
        return <BellOutlined />;
      case 'sms':
        return <MobileOutlined />;
      case 'email':
        return <MailOutlined />;
      case 'kakao':
        return <MessageOutlined />;
      default:
        return <BellOutlined />;
    }
  };

  // 상태별 Badge 색상
  const getStatusBadgeVariant = (status: NotificationStatus) => {
    switch (status) {
      case 'sent':
        return 'info';
      case 'delivered':
        return 'success';
      case 'read':
        return 'default';
      case 'failed':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  // 알림 상세 토글
  const toggleNotificationDetails = (notificationId: string) => {
    setExpandedNotifications((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(notificationId)) {
        newSet.delete(notificationId);
      } else {
        newSet.add(notificationId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* 필터 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* 유형 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">유형:</span>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {Object.entries(NOTIFICATION_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 채널 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">채널:</span>
            <select
              value={channelFilter}
              onChange={(e) => {
                setChannelFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {Object.entries(NOTIFICATION_CHANNEL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 알림 목록 */}
      <Card>
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="text-center py-12 text-txt-muted">로딩 중...</div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12 text-txt-muted">알림 발송 이력이 없습니다.</div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id}>
                {/* 알림 헤더 */}
                <div
                  className="p-4 cursor-pointer hover:bg-bg-hover transition-colors"
                  onClick={() => toggleNotificationDetails(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <button className="text-txt-muted mt-1">
                      {expandedNotifications.has(notification.id) ? (
                        <DownOutlined />
                      ) : (
                        <RightOutlined />
                      )}
                    </button>

                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {getChannelIcon(notification.channel)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getTypeBadgeVariant(notification.notificationType)}>
                          {NOTIFICATION_TYPE_LABELS[notification.notificationType]}
                        </Badge>
                        <Badge variant="secondary">
                          {NOTIFICATION_CHANNEL_LABELS[notification.channel]}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(notification.status)}>
                          {NOTIFICATION_STATUS_LABELS[notification.status]}
                        </Badge>
                      </div>
                      <p className="font-medium text-txt-main mt-1 truncate">
                        {notification.title}
                      </p>
                      <p className="text-sm text-txt-muted mt-0.5">
                        {formatDateTime(notification.sentAt)}
                        {notification.readAt && (
                          <span className="ml-2">
                            · 읽음: {formatDateTime(notification.readAt)}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 알림 상세 (확장됐을 때) */}
                {expandedNotifications.has(notification.id) && (
                  <div className="px-4 pb-4 bg-bg-hover/50">
                    <div className="ml-12 p-4 rounded-lg bg-bg-card border border-border">
                      <h4 className="text-sm font-medium text-txt-muted mb-2">내용</h4>
                      <p className="text-sm text-txt-main whitespace-pre-wrap">
                        {notification.content}
                      </p>
                      {notification.campaignName && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-txt-muted">
                            캠페인: {notification.campaignName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-txt-muted">
              총 {formatCurrency(pagination.total)}건 중{' '}
              {(page - 1) * limit + 1}-{Math.min(page * limit, pagination.total)}건 표시
            </p>
            <div className="flex gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-hover"
              >
                이전
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum: number;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-8 h-8 rounded text-sm ${
                      page === pageNum
                        ? 'bg-primary text-white'
                        : 'border border-border hover:bg-bg-hover'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
                className="px-3 py-1 rounded border border-border text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-bg-hover"
              >
                다음
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
