/**
 * 직원 계정 승인 관리 페이지
 */
import React, { useState } from 'react';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { Card, Button, Badge, Spinner, ConfirmDialog, Modal, Input } from '@/components/ui';
import { usePendingApprovals, useApproveStaff, useRejectStaff, useToast, useTeams, useStores } from '@/hooks';
import { STAFF_TYPE_LABELS } from '@/types/staff';
import type { StaffAccount, StaffType } from '@/types/staff';

export const StaffApprovals: React.FC = () => {
  const toast = useToast();
  const [staffTypeFilter, setStaffTypeFilter] = useState<StaffType | ''>('');
  const [approveTarget, setApproveTarget] = useState<StaffAccount | null>(null);
  const [rejectTarget, setRejectTarget] = useState<StaffAccount | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, refetch } = usePendingApprovals({
    staffType: staffTypeFilter || undefined,
  });

  const { data: teams } = useTeams();
  const { stores } = useStores();

  const approveMutation = useApproveStaff();
  const rejectMutation = useRejectStaff();

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

  const handleApprove = async () => {
    if (!approveTarget) return;

    try {
      await approveMutation.mutateAsync({
        staffId: approveTarget.id,
        approverId: 'admin', // 실제로는 현재 로그인한 사용자 ID
      });
      toast.success(`${approveTarget.name}님의 계정이 승인되었습니다.`);
      setApproveTarget(null);
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '승인에 실패했습니다.');
    }
  };

  const handleReject = async () => {
    if (!rejectTarget) return;

    try {
      await rejectMutation.mutateAsync({
        staffId: rejectTarget.id,
        rejectorId: 'admin',
        reason: rejectReason || undefined,
      });
      toast.success(`${rejectTarget.name}님의 계정이 거절되었습니다.`);
      setRejectTarget(null);
      setRejectReason('');
      refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '거절에 실패했습니다.');
    }
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
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => setApproveTarget(staff)}
                          disabled={approveMutation.isPending}
                        >
                          <CheckOutlined className="mr-1" />
                          승인
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setRejectTarget(staff)}
                          disabled={rejectMutation.isPending}
                        >
                          <CloseOutlined className="mr-1" />
                          거절
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 승인 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!approveTarget}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleApprove}
        title="계정 승인"
        message={`'${approveTarget?.name}' 직원의 계정을 승인하시겠습니까? 승인 후 해당 직원은 로그인이 가능합니다.`}
        confirmText="승인"
        type="info"
      />

      {/* 거절 사유 입력 모달 */}
      <Modal
        isOpen={!!rejectTarget}
        onClose={() => {
          setRejectTarget(null);
          setRejectReason('');
        }}
        title="계정 승인 거절"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-txt-secondary">
            '<span className="font-medium text-txt-main">{rejectTarget?.name}</span>' 직원의 계정 승인을 거절합니다.
          </p>

          <div>
            <label className="block text-sm font-medium text-txt-main mb-2">
              거절 사유 (선택)
            </label>
            <Input
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거절 사유를 입력하세요"
            />
            <p className="text-xs text-txt-muted mt-1">
              거절 사유는 해당 직원에게 이메일로 전달됩니다.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                setRejectTarget(null);
                setRejectReason('');
              }}
            >
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending ? '처리 중...' : '거절'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
