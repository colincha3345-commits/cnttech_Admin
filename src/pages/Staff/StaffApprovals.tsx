/**
 * 직원 계정 승인 관리 페이지
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Card, Button, Badge, Spinner } from '@/components/ui';
import { usePendingApprovals, useTeams, useStores } from '@/hooks';
import { STAFF_TYPE_LABELS } from '@/types/staff';
import type { StaffType } from '@/types/staff';

export const StaffApprovals: React.FC = () => {
  const [staffTypeFilter, setStaffTypeFilter] = useState<StaffType | ''>('');
  const navigate = useNavigate();

  const { data, isLoading } = usePendingApprovals({
    staffType: staffTypeFilter || undefined,
  });

  const { data: teams } = useTeams();
  const { stores } = useStores();

  const pendingStaff = data?.data || [];
  const pagination = data?.pagination;

  const getTeamName = (teamId?: string) => {
    if (!teamId || !teams) return '-';
    const team = teams.find((t) => t.id === teamId);
    return team?.name || '-';
  };

  const getStoreName = (storeId?: string) => {
    if (!storeId || !stores) return '-';
    const store = stores.find((s) => s.id === storeId);
    return store?.name || '-';
  };

  if (isLoading) {
    return <Spinner layout="center" />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">계정 승인 관리</h1>
          <p className="text-sm text-txt-muted mt-1">
            비밀번호 설정을 완료한 직원 계정의 승인을 관리합니다.
            (총 {pagination?.total || 0}건)
          </p>
        </div>
      </div>

      {/* 필터 */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-txt-muted">직원 유형:</span>
          <select
            value={staffTypeFilter}
            onChange={(e) => setStaffTypeFilter(e.target.value as StaffType | '')}
            className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">전체</option>
            <option value="headquarters">본사</option>
            <option value="franchise">가맹점</option>
          </select>
        </div>
      </Card>

      {/* 승인 대기 목록 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="whitespace-nowrap">이름</th>
                <th className="whitespace-nowrap">아이디</th>
                <th className="whitespace-nowrap">이메일</th>
                <th className="whitespace-nowrap">유형</th>
                <th className="whitespace-nowrap">소속</th>
                <th className="whitespace-nowrap">비밀번호 설정일</th>
                <th className="whitespace-nowrap w-32">액션</th>
              </tr>
            </thead>
            <tbody>
              {pendingStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <p className="text-txt-muted">승인 대기 중인 계정이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                pendingStaff.map((staff) => (
                  <tr key={staff.id}>
                    <td className="font-medium text-txt-main">{staff.name}</td>
                    <td className="text-sm text-txt-secondary">{staff.loginId}</td>
                    <td className="text-sm text-txt-secondary">{staff.email}</td>
                    <td>
                      <Badge variant={staff.staffType === 'headquarters' ? 'info' : 'secondary'}>
                        {STAFF_TYPE_LABELS[staff.staffType]}
                      </Badge>
                    </td>
                    <td className="text-sm">
                      {staff.staffType === 'headquarters'
                        ? getTeamName(staff.teamId)
                        : getStoreName(staff.storeId)}
                    </td>
                    <td className="text-sm text-txt-muted whitespace-nowrap">
                      {staff.passwordSetAt
                        ? new Date(staff.passwordSetAt).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '-'}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/staff/approvals/${staff.id}`)}
                      >
                        상세 보기
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
