import React, { useState } from 'react';
import { WalletOutlined } from '@ant-design/icons';

import { Card, Badge } from '@/components/ui';
import { useMemberVouchers } from '@/hooks';
import {
  VOUCHER_TYPE_LABELS,
  VOUCHER_STATUS_LABELS,
} from '@/types/app-member';
import type { VoucherStatus, VoucherType } from '@/types/app-member';

interface VoucherHistoryTabProps {
  memberId: string;
}

export const VoucherHistoryTab: React.FC<VoucherHistoryTabProps> = ({ memberId }) => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const limit = 15;

  const { vouchers, pagination, isLoading } = useMemberVouchers({
    memberId,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
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

  // 교환권 상태별 Badge 색상
  const getStatusBadgeVariant = (status: VoucherStatus) => {
    switch (status) {
      case 'registered':
        return 'success';
      case 'used':
        return 'info';
      case 'expired':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // 교환권 유형별 Badge 색상
  const getTypeBadgeVariant = (type: VoucherType) => {
    switch (type) {
      case 'gifticon':
        return 'info';
      case 'mobile_voucher':
        return 'success';
      case 'brand_voucher':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // 요약 계산
  const registeredCount = vouchers.filter((v) => v.status === 'registered').length;
  const usedCount = vouchers.filter((v) => v.status === 'used').length;
  const expiredCount = vouchers.filter((v) => v.status === 'expired').length;

  return (
    <div className="p-6 space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <WalletOutlined className="text-success text-lg" />
            </div>
            <div>
              <p className="text-sm text-txt-muted">등록됨</p>
              <p className="text-xl font-bold text-success">
                {registeredCount}건
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-txt-muted">사용 완료</p>
          <p className="text-xl font-bold text-info">
            {usedCount}건
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-txt-muted">만료</p>
          <p className="text-xl font-bold text-warning">
            {expiredCount}건
          </p>
        </Card>
      </div>

      {/* 필터 */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-txt-muted">상태:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">전체</option>
            {Object.entries(VOUCHER_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* 교환권 목록 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="whitespace-nowrap">유형</th>
                <th className="whitespace-nowrap">코드</th>
                <th className="whitespace-nowrap">상품명</th>
                <th className="whitespace-nowrap">상태</th>
                <th className="whitespace-nowrap">등록일</th>
                <th className="whitespace-nowrap">사용일</th>
                <th>만료일</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-txt-muted">로딩 중...</div>
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-txt-muted">교환권 이력이 없습니다.</div>
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td>
                      <Badge variant={getTypeBadgeVariant(voucher.voucherType)}>
                        {VOUCHER_TYPE_LABELS[voucher.voucherType]}
                      </Badge>
                    </td>
                    <td>
                      <code className="px-2 py-1 bg-bg-hover rounded text-xs font-mono">
                        {voucher.voucherCode}
                      </code>
                    </td>
                    <td>
                      <div>
                        <p className="font-medium text-txt-main">{voucher.voucherName}</p>
                        {voucher.productName && (
                          <p className="text-xs text-txt-muted">{voucher.productName}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(voucher.status)}>
                        {VOUCHER_STATUS_LABELS[voucher.status]}
                      </Badge>
                    </td>
                    <td className="text-sm text-txt-secondary whitespace-nowrap">
                      {formatDateTime(voucher.registeredAt)}
                    </td>
                    <td className="text-sm text-txt-secondary whitespace-nowrap">
                      {voucher.usedAt ? formatDateTime(voucher.usedAt) : '-'}
                    </td>
                    <td className="text-sm text-txt-secondary whitespace-nowrap">
                      {formatDate(voucher.expiresAt)}
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
