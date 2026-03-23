/**
 * 지사 관리 페이지 — 카드 그리드 레이아웃
 * [2026-03-23] 신규
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons';

import { Card, Button, Badge, Spinner, ConfirmDialog } from '@/components/ui';
import { useBranches, useDeleteBranch, useToast } from '@/hooks';
import type { Branch } from '@/types/branch';

export const Branches: React.FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);

  const { data: branches, isLoading } = useBranches();
  const deleteBranch = useDeleteBranch();

  const handleEdit = (branch: Branch) => {
    navigate(`/staff/branches/${branch.id}/edit`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteBranch.mutateAsync(deleteTarget.id);
      toast.success('지사가 삭제되었습니다.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '지사 삭제에 실패했습니다.');
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
          <h1 className="text-2xl font-bold text-txt-main">지사 관리</h1>
          <p className="text-sm text-txt-muted mt-1">지역 지사를 관리합니다.</p>
        </div>
        <Button onClick={() => navigate('/staff/branches/new')}>
          <PlusOutlined className="mr-1" />
          지사 추가
        </Button>
      </div>

      {/* 지사 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches && branches.length > 0 ? (
          branches.map((branch) => (
            <Card key={branch.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BankOutlined className="text-primary text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-txt-main">{branch.name}</h3>
                    <p className="text-xs text-txt-muted">{branch.region}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(branch)}
                    className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-primary transition-colors"
                    title="수정"
                  >
                    <EditOutlined />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(branch)}
                    className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors"
                    title="삭제"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
              {branch.managerName && (
                <p className="text-sm text-txt-muted mt-3">지사장: {branch.managerName}</p>
              )}
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">직원 {branch.memberCount}명</Badge>
                <Badge variant="secondary">매장 {branch.storeCount}개</Badge>
              </div>
              {branch.description && (
                <p className="text-sm text-txt-muted mt-2 line-clamp-2">{branch.description}</p>
              )}
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-8 text-center">
            <BankOutlined className="text-4xl text-txt-muted mb-3" />
            <p className="text-txt-muted">등록된 지사가 없습니다.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/staff/branches/new')}
            >
              첫 번째 지사 추가하기
            </Button>
          </Card>
        )}
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="지사 삭제"
        message={`'${deleteTarget?.name}' 지사를 삭제하시겠습니까? 소속 직원/매장이 있는 지사는 삭제할 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
};
