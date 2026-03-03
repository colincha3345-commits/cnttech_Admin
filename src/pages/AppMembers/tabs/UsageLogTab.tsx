import React, { useState } from 'react';
import {
  MobileOutlined,
  AppleOutlined,
  AndroidOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

import { Card, Badge, Input } from '@/components/ui';
import { useUsageLogs } from '@/hooks';
import { APP_ACTION_LABELS, DEVICE_OS_LABELS } from '@/types/app-member';
import type { AppAction, DeviceInfo } from '@/types/app-member';

interface UsageLogTabProps {
  memberId: string;
}

export const UsageLogTab: React.FC<UsageLogTabProps> = ({ memberId }) => {
  const [actionFilter, setActionFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { logs, pagination, isLoading } = useUsageLogs({
    memberId,
    action: actionFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit,
  });

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  // 액션별 Badge 색상
  const getActionBadgeVariant = (action: AppAction) => {
    switch (action) {
      case 'login':
      case 'logout':
        return 'info';
      case 'order':
        return 'success';
      case 'cancel_order':
        return 'critical';
      case 'add_cart':
      case 'view_product':
        return 'default';
      case 'coupon_download':
      case 'point_use':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // OS 아이콘
  const getOsIcon = (os: DeviceInfo['os']) => {
    switch (os) {
      case 'ios':
        return <AppleOutlined className="text-gray-600" />;
      case 'android':
        return <AndroidOutlined className="text-green-600" />;
      case 'web':
        return <GlobalOutlined className="text-blue-600" />;
      default:
        return <MobileOutlined />;
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* 필터 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* 액션 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">액션:</span>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {Object.entries(APP_ACTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">기간:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="h-9 w-36"
            />
            <span className="text-txt-muted">~</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="h-9 w-36"
            />
          </div>
        </div>
      </Card>

      {/* 로그 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="whitespace-nowrap">일시</th>
                <th className="whitespace-nowrap">액션</th>
                <th className="whitespace-nowrap">상세</th>
                <th className="whitespace-nowrap">기기정보</th>
                <th className="whitespace-nowrap">IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="text-txt-muted">로딩 중...</div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="text-txt-muted">로그가 없습니다.</div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap text-sm">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {APP_ACTION_LABELS[log.action]}
                      </Badge>
                    </td>
                    <td className="max-w-xs truncate text-sm text-txt-secondary">
                      {log.detail}
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-sm">
                        {getOsIcon(log.deviceInfo.os)}
                        <div>
                          <span className="text-txt-main">
                            {DEVICE_OS_LABELS[log.deviceInfo.os]}
                          </span>
                          <span className="text-txt-muted ml-1">
                            {log.deviceInfo.osVersion}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-txt-muted mt-0.5">
                        {log.deviceInfo.deviceModel} · v{log.deviceInfo.appVersion}
                      </div>
                    </td>
                    <td className="text-sm font-mono text-txt-muted">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
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
