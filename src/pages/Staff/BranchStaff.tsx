/**
 * 지사 직원 목록 페이지
 * [2026-03-23] 신규
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, MailOutlined, CloseCircleOutlined } from '@ant-design/icons';

import { Card, Button, Badge, Spinner, MaskedData, ConfirmDialog, SearchInput, Pagination, SortableHeader } from '@/components/ui';
import { useTableSort } from '@/hooks/useTableSort';
import {
  useBranchStaff,
  useBranches,
  useDeleteBranchStaff,
  useResendBranchInvitation,
  useCancelBranchInvitation,
  useToast,
} from '@/hooks';
import { STAFF_STATUS_LABELS } from '@/types/staff';
import type { StaffAccount, StaffStatus } from '@/types/staff';

export const BranchStaff: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | ''>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<StaffAccount | null>(null);
  const [cancelTarget, setCancelTarget] = useState<StaffAccount | null>(null);
  const [limit, setLimit] = useState(10);

  const { sortKey, sortOrder, handleSort, sortData } = useTableSort<StaffAccount>();
  const { data: branchesData } = useBranches();
  const { data, isLoading } = useBranchStaff({
    branchId: branchFilter || undefined,
    status: statusFilter || undefined,
    keyword: keyword || undefined,
    page,
    limit,
  });
  const deleteStaff = useDeleteBranchStaff();
  const resendInvitation = useResendBranchInvitation();
  const cancelInvitation = useCancelBranchInvitation();

  const staff = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleEdit = (item: StaffAccount) => {
    navigate(`/staff/edit/branch/${item.id}`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStaff.mutateAsync(deleteTarget.id);
      toast.success('직원이 삭제되었습니다.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    }
  };

  const handleResendInvitation = async (item: StaffAccount) => {
    try {
      await resendInvitation.mutateAsync(item.id);
      toast.success('초대 이메일이 재발송되었습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '초대 재발송에 실패했습니다.');
    }
  };

  const handleCancelInvitation = async () => {
    if (!cancelTarget) return;
    try {
      await cancelInvitation.mutateAsync(cancelTarget.id);
      toast.success('초대가 취소되었습니다.');
      setCancelTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '초대 취소에 실패했습니다.');
    }
  };

  const getStatusBadgeVariant = (status: StaffStatus) => {
    const map: Record<StaffStatus, 'success' | 'warning' | 'info' | 'secondary' | 'critical'> = {
      active: 'success',
      inactive: 'secondary',
      invited: 'info',
      pending_approval: 'warning',
      rejected: 'critical',
    };
    return map[status];
  };

  const getBranchName = (branchId?: string) => {
    if (!branchId || !branchesData) return '-';
    return branchesData.find((b) => b.id === branchId)?.name || '-';
  };

  if (isLoading) {
    return <Spinner layout="center" />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">지사 직원 관리</h1>
          <p className="text-sm text-txt-muted mt-1">지사 소속 직원을 관리합니다.</p>
        </div>
        <Button onClick={() => navigate('/staff/edit/branch/new')}>
          <PlusOutlined className="mr-1" />
          직원 초대
        </Button>
      </div>

      {/* 필터 */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <select
            value={branchFilter}
            onChange={(e) => { setBranchFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="">전체 지사</option>
            {branchesData?.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as StaffStatus | ''); setPage(1); }}
            className="px-3 py-2 border border-border rounded-lg text-sm"
          >
            <option value="">전체 상태</option>
            {Object.entries(STAFF_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <SearchInput
            value={keyword}
            onChange={(v) => { setKeyword(v); setPage(1); }}
            placeholder="이름 또는 아이디 검색"
          />
        </form>
      </Card>

      {/* 목록 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-bg-secondary border-b border-border">
                <SortableHeader label="이름" sortKey="name" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="px-4 py-3 text-xs font-semibold text-txt-muted" />
                <SortableHeader label="아이디" sortKey="loginId" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="px-4 py-3 text-xs font-semibold text-txt-muted" />
                <SortableHeader label="소속지사" sortKey="branchId" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="px-4 py-3 text-xs font-semibold text-txt-muted" />
                <SortableHeader label="연락처" sortKey="phone" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="px-4 py-3 text-xs font-semibold text-txt-muted" />
                <SortableHeader label="상태" sortKey="status" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="px-4 py-3 text-xs font-semibold text-txt-muted" />
                <SortableHeader label="최근 로그인" sortKey="lastLoginAt" currentSortKey={sortKey} currentSortOrder={sortOrder} onSort={handleSort} className="px-4 py-3 text-xs font-semibold text-txt-muted" />
                <th className="px-4 py-3 text-xs font-semibold text-txt-muted">액션</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-txt-muted">직원이 없습니다.</td></tr>
              ) : (
                sortData(staff).map((item) => (
                  <tr key={item.id} className="border-b border-border hover:bg-bg-hover transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-txt-main">{item.name}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{item.loginId}</td>
                    <td className="px-4 py-3 text-sm text-txt-secondary">{getBranchName(item.branchId)}</td>
                    <td className="px-4 py-3"><MaskedData value={item.phone} /></td>
                    <td className="px-4 py-3">
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {STAFF_STATUS_LABELS[item.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-txt-muted whitespace-nowrap">
                      {item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {item.status === 'invited' ? (
                          <>
                            <button onClick={() => handleResendInvitation(item)} className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-primary transition-colors" title="초대 재발송" disabled={resendInvitation.isPending}>
                              <MailOutlined />
                            </button>
                            <button onClick={() => setCancelTarget(item)} className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors" title="초대 취소">
                              <CloseCircleOutlined />
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setDeleteTarget(item)} className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors" title="삭제">
                            <DeleteOutlined />
                          </button>
                        )}
                        <button onClick={() => handleEdit(item)} className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-primary transition-colors" title="수정">
                          <EditOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} totalElements={pagination.total} limit={limit} onLimitChange={setLimit} unit="명" />
        )}
      </Card>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="직원 삭제" message={`'${deleteTarget?.name}' 직원을 삭제하시겠습니까?`} confirmText="삭제" type="warning" />
      <ConfirmDialog isOpen={!!cancelTarget} onClose={() => setCancelTarget(null)} onConfirm={handleCancelInvitation} title="초대 취소" message={`'${cancelTarget?.name}' 직원의 초대를 취소하시겠습니까?`} confirmText="초대 취소" type="warning" />
    </div>
  );
};
