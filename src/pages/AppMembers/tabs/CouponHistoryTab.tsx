import React, { useState } from 'react';
import { PlusOutlined, TagOutlined } from '@ant-design/icons';

import { Card, Badge, Button, Pagination } from '@/components/ui';
import { useMemberCoupons, useAppMember } from '@/hooks';
import { MEMBER_COUPON_STATUS_LABELS } from '@/types/app-member';
import type { MemberCouponStatus } from '@/types/app-member';
import { CouponAdjustModal } from '../components/CouponAdjustModal';

interface CouponHistoryTabProps {
  memberId: string;
}

export const CouponHistoryTab: React.FC<CouponHistoryTabProps> = ({ memberId }) => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 15;

  const { coupons, pagination, summary, isLoading, refetch } = useMemberCoupons({
    memberId,
    status: statusFilter || undefined,
    page,
    limit,
  });

  const { member } = useAppMember(memberId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
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

  // 쿠폰 상태별 Badge 색상
  const getStatusBadgeVariant = (status: MemberCouponStatus) => {
    switch (status) {
      case 'available':
        return 'success';
      case 'used':
        return 'info';
      case 'expired':
        return 'warning';
      case 'withdrawn':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  const handleSuccess = () => {
    refetch();
  };

  return (
    <div className="p-6 space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TagOutlined className="text-success text-lg" />
            </div>
            <div>
              <p className="text-sm text-txt-muted">사용 가능</p>
              <p className="text-xl font-bold text-success">
                {summary.availableCount}장
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-txt-muted">사용 완료</p>
          <p className="text-xl font-bold text-info">
            {summary.usedCount}장
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-txt-muted">만료</p>
          <p className="text-xl font-bold text-warning">
            {summary.expiredCount}장
          </p>
        </Card>
      </div>

      {/* 필터 및 버튼 */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 상태 필터 */}
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
              {Object.entries(MEMBER_COUPON_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 지급/회수 버튼 */}
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusOutlined className="mr-1" />
            쿠폰 조정
          </Button>
        </div>
      </Card>

      {/* 쿠폰 목록 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="whitespace-nowrap">쿠폰명</th>
                <th className="whitespace-nowrap">할인</th>
                <th className="whitespace-nowrap">상태</th>
                <th className="whitespace-nowrap">발급일</th>
                <th className="whitespace-nowrap">사용일</th>
                <th className="whitespace-nowrap">만료일</th>
                <th className="whitespace-nowrap">비고</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-txt-muted">로딩 중...</div>
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="text-txt-muted">쿠폰 이력이 없습니다.</div>
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <p className="font-medium text-txt-main">{coupon.couponName}</p>
                    </td>
                    <td className="text-sm">
                      {coupon.discountType === 'percentage' ? (
                        <span className="text-primary font-medium">
                          {coupon.discountValue}%
                        </span>
                      ) : (
                        <span className="text-primary font-medium">
                          {formatCurrency(coupon.discountValue)}원
                        </span>
                      )}
                    </td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(coupon.status)}>
                        {MEMBER_COUPON_STATUS_LABELS[coupon.status]}
                      </Badge>
                    </td>
                    <td className="text-sm text-txt-secondary whitespace-nowrap">
                      {formatDateTime(coupon.issuedAt)}
                    </td>
                    <td className="text-sm text-txt-secondary whitespace-nowrap">
                      {coupon.usedAt ? formatDateTime(coupon.usedAt) : '-'}
                    </td>
                    <td className="text-sm text-txt-secondary whitespace-nowrap">
                      {formatDate(coupon.expiresAt)}
                    </td>
                    <td className="text-sm text-txt-muted max-w-xs">
                      {coupon.adminMemo && (
                        <span className="truncate block">{coupon.adminMemo}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          totalElements={pagination.total}
          limit={limit}
          unit="건"
        />
      </Card>

      {/* 쿠폰 조정 모달 */}
      {member && (
        <CouponAdjustModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          memberId={memberId}
          memberName={member.name}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};
