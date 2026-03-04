import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

import { Card, Button, Badge, Spinner, MaskedData, ConfirmDialog, SearchInput } from '@/components/ui';
import {
  useFranchiseStaff,
  useStores,
  useDeleteFranchiseStaff,
  useToast,
} from '@/hooks';
import { STAFF_STATUS_LABELS } from '@/types/staff';
import type { StaffAccount, StaffStatus } from '@/types/staff';

export const FranchiseStaff: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [storeFilter, setStoreFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StaffStatus | ''>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<StaffAccount | null>(null);
  const limit = 10;

  const { stores } = useStores();
  const { data, isLoading } = useFranchiseStaff({
    storeId: storeFilter || undefined,
    status: statusFilter || undefined,
    keyword: keyword || undefined,
    page,
    limit,
  });
  const deleteStaff = useDeleteFranchiseStaff();

  const staff = data?.data || [];
  const pagination = data?.pagination;


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleEdit = (item: StaffAccount) => {
    navigate(`/staff/edit/franchise/${item.id}`);
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

  const getStatusBadgeVariant = (status: StaffStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'invited':
      case 'pending_approval':
        return 'info';
      case 'rejected':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  const getStoreName = (storeId?: string) => {
    if (!storeId || !stores) return '-';
    const store = stores.find((s) => s.id === storeId);
    return store?.name || '-';
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">가맹점 직원 관리</h1>
          <p className="text-sm text-txt-muted mt-1">
            가맹점 직원 계정을 관리합니다. (총 {pagination?.total || 0}명)
          </p>
        </div>
        <Button onClick={() => navigate('/staff/edit/franchise/new')}>
          <PlusOutlined className="mr-1" />
          직원 추가
        </Button>
      </div>

      {/* 필터 */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
          {/* 가맹점 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">가맹점:</span>
            <select
              value={storeFilter}
              onChange={(e) => {
                setStoreFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {stores?.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">상태:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StaffStatus | '');
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {Object.entries(STAFF_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 검색 */}
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              placeholder="이름 또는 아이디로 검색"
              value={keyword}
              onChange={setKeyword}
              className="w-[300px]"
            />
          </div>

          <Button type="submit" variant="outline">
            검색
          </Button>
        </form>
      </Card>

      {/* 테이블 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table w-full min-w-[900px]">
            <thead>
              <tr>
                <th className="whitespace-nowrap">이름</th>
                <th className="whitespace-nowrap">아이디</th>
                <th className="whitespace-nowrap">소속 가맹점</th>
                <th className="whitespace-nowrap">연락처</th>
                <th className="whitespace-nowrap">이메일</th>
                <th className="whitespace-nowrap">상태</th>
                <th className="whitespace-nowrap">최근 접속</th>
                <th className="whitespace-nowrap w-20"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <Spinner size="sm" />
                  </td>
                </tr>
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12">
                    <p className="text-txt-muted">등록된 직원이 없습니다.</p>
                  </td>
                </tr>
              ) : (
                staff.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium text-txt-main">{item.name}</td>
                    <td className="text-sm text-txt-secondary">{item.loginId}</td>
                    <td className="text-sm">{getStoreName(item.storeId)}</td>
                    <td>
                      <MaskedData value={item.phone} />
                    </td>
                    <td className="text-sm text-txt-secondary">{item.email}</td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(item.status)}>
                        {STAFF_STATUS_LABELS[item.status]}
                      </Badge>
                    </td>
                    <td className="text-sm text-txt-muted whitespace-nowrap">
                      {item.lastLoginAt
                        ? new Date(item.lastLoginAt).toLocaleString('ko-KR', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                        : '-'}
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-primary transition-colors"
                          title="수정"
                        >
                          <EditOutlined />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(item)}
                          className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors"
                          title="삭제"
                        >
                          <DeleteOutlined />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <p className="text-sm text-txt-muted">
              총 {pagination.total}명 중 {(page - 1) * limit + 1}-
              {Math.min(page * limit, pagination.total)}명 표시
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
                    className={`w-8 h-8 rounded text-sm ${page === pageNum
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

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="직원 삭제"
        message={`'${deleteTarget?.name}' 직원을 삭제하시겠습니다? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
};
