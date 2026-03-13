import React, { useState } from 'react';
import { PlusOutlined, GiftOutlined, WarningOutlined } from '@ant-design/icons';

import { Card, Badge, Button, Pagination } from '@/components/ui';
import { usePointHistory, useAppMember } from '@/hooks';
import { POINT_TYPE_LABELS } from '@/types/app-member';
import type { PointType } from '@/types/app-member';
import { PointAdjustModal } from '../components/PointAdjustModal';

interface PointHistoryTabProps {
  memberId: string;
}

export const PointHistoryTab: React.FC<PointHistoryTabProps> = ({ memberId }) => {
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 15;

  const { history, pagination, summary, isLoading, refetch } = usePointHistory({
    memberId,
    type: typeFilter || undefined,
    page,
    limit,
  });

  const { member, refetch: refetchMember } = useAppMember(memberId);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
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

  // 포인트 타입별 Badge 색상
  const getTypeBadgeVariant = (type: PointType) => {
    if (type.startsWith('earn_')) return 'success';
    if (type.startsWith('use_') || type.startsWith('withdraw_')) return 'critical';
    if (type === 'expired') return 'warning';
    return 'secondary';
  };

  // 금액 색상
  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-success';
    if (amount < 0) return 'text-critical';
    return 'text-txt-muted';
  };

  const handleSuccess = () => {
    refetch();
    refetchMember();
  };

  return (
    <div className="p-6 space-y-4">
      {/* 요약 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <GiftOutlined className="text-primary text-lg" />
            </div>
            <div>
              <p className="text-sm text-txt-muted">현재 잔액</p>
              <p className={`text-xl font-bold ${summary.currentBalance < 0 ? 'text-critical' : 'text-primary'}`}>
                {formatCurrency(summary.currentBalance)}P
              </p>
              {summary.currentBalance < 0 && (
                <p className="text-xs text-critical mt-1">마이너스 잔고 — 포인트 사용 차단 중</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-txt-muted">총 적립</p>
          <p className="text-xl font-bold text-success">
            +{formatCurrency(summary.totalEarned)}P
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-txt-muted">총 사용</p>
          <p className="text-xl font-bold text-critical">
            -{formatCurrency(summary.totalUsed)}P
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start gap-2">
            <WarningOutlined className="text-warning mt-1" />
            <div>
              <p className="text-sm text-txt-muted">30일 내 만료</p>
              <p className="text-xl font-bold text-warning">
                {formatCurrency(summary.expiringSoon)}P
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 필터 및 버튼 */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 타입 필터 */}
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
              {Object.entries(POINT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 지급/회수 버튼 */}
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusOutlined className="mr-1" />
            포인트 조정
          </Button>
        </div>
      </Card>

      {/* 이력 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="whitespace-nowrap">일시</th>
                <th className="whitespace-nowrap">유형</th>
                <th className="whitespace-nowrap">금액</th>
                <th className="whitespace-nowrap">잔액</th>
                <th className="whitespace-nowrap">설명</th>
                <th className="whitespace-nowrap">만료일</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="text-txt-muted">로딩 중...</div>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="text-txt-muted">포인트 이력이 없습니다.</div>
                  </td>
                </tr>
              ) : (
                history.map((item) => (
                  <tr key={item.id}>
                    <td className="whitespace-nowrap text-sm">
                      {formatDateTime(item.createdAt)}
                    </td>
                    <td>
                      <Badge variant={getTypeBadgeVariant(item.type)}>
                        {POINT_TYPE_LABELS[item.type]}
                      </Badge>
                    </td>
                    <td className={`font-medium ${getAmountColor(item.amount)}`}>
                      {item.amount > 0 ? '+' : ''}
                      {formatCurrency(item.amount)}P
                    </td>
                    <td className={`text-sm ${item.balance < 0 ? 'text-critical font-medium' : 'text-txt-secondary'}`}>
                      {formatCurrency(item.balance)}P
                    </td>
                    <td className="max-w-xs">
                      <p className="text-sm text-txt-main truncate">{item.description}</p>
                      {item.adminMemo && (
                        <p className="text-xs text-txt-muted truncate">
                          관리자: {item.adminMemo}
                        </p>
                      )}
                    </td>
                    <td className="text-sm text-txt-muted whitespace-nowrap">
                      {item.expiresAt
                        ? new Date(item.expiresAt).toLocaleDateString('ko-KR')
                        : '-'}
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

      {/* 포인트 조정 모달 */}
      {member && (
        <PointAdjustModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          memberId={memberId}
          memberName={member.name}
          currentBalance={summary.currentBalance}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};
