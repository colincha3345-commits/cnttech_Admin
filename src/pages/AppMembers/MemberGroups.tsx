/**
 * 회원 그룹 관리 페이지
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UsergroupAddOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import { Card, Button, Badge, ConfirmDialog, SearchInput } from '@/components/ui';
import { useMemberGroups, useDeleteGroup } from '@/hooks/useMemberGroups';
import { useToast } from '@/hooks';
import type { MemberGroup } from '@/types/member-segment';
import { GroupFormModal } from './components/GroupFormModal';

export const MemberGroups: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // 검색 및 페이지네이션 상태
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 모달 상태
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<MemberGroup | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);

  // 데이터 조회
  const { groups, pagination, isLoading, refetch } = useMemberGroups({
    page,
    limit,
    keyword: searchKeyword,
  });

  const { deleteGroup, isDeleting } = useDeleteGroup();

  // 검색 핸들러
  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  // 그룹 상세 이동
  const handleRowClick = (group: MemberGroup) => {
    navigate(`/app-members/groups/${group.id}`);
  };

  // 그룹 삭제
  const handleDelete = async () => {
    if (!deletingGroupId) return;

    try {
      await deleteGroup(deletingGroupId);
      toast.success('그룹이 삭제되었습니다.');
      setDeletingGroupId(null);
      refetch();
    } catch {
      toast.error('그룹 삭제에 실패했습니다.');
    }
  };

  // 날짜 포맷
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-txt-main flex items-center gap-2">
          <UsergroupAddOutlined />
          회원 그룹 관리
        </h1>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <PlusOutlined className="mr-1" />
          그룹 생성
        </Button>
      </div>

      {/* 검색 */}
      <Card className="p-4">
        <div className="max-w-[400px]">
          <SearchInput
            placeholder="그룹명으로 검색"
            value={keyword}
            onChange={setKeyword}
            onSearch={handleSearch}
          />
        </div>
      </Card>

      {/* 그룹 목록 */}
      <Card className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-txt-muted">로딩 중...</div>
        ) : groups.length === 0 ? (
          <div className="p-8 text-center text-txt-muted">
            {searchKeyword ? '검색 결과가 없습니다.' : '생성된 그룹이 없습니다.'}
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th>그룹명</th>
                  <th>설명</th>
                  <th className="text-center">회원 수</th>
                  <th>생성일</th>
                  <th className="text-center w-24">관리</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr
                    key={group.id}
                    onClick={() => handleRowClick(group)}
                    className="cursor-pointer hover:bg-bg-hover"
                  >
                    <td>
                      <span className="font-medium text-txt-main">{group.name}</span>
                    </td>
                    <td>
                      <span className="text-txt-secondary text-sm">
                        {group.description || '-'}
                      </span>
                    </td>
                    <td className="text-center">
                      <Badge variant="info">{group.memberCount}명</Badge>
                    </td>
                    <td className="text-txt-secondary text-sm">
                      {formatDate(group.createdAt)}
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGroup(group);
                          }}
                        >
                          <EditOutlined />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingGroupId(group.id);
                          }}
                          disabled={isDeleting}
                        >
                          <DeleteOutlined className="text-critical" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-border flex items-center justify-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* 그룹 생성/수정 모달 */}
      <GroupFormModal
        isOpen={isCreateModalOpen || !!editingGroup}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingGroup(null);
        }}
        group={editingGroup}
        groups={groups}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          setEditingGroup(null);
          refetch();
        }}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deletingGroupId}
        onClose={() => setDeletingGroupId(null)}
        onConfirm={handleDelete}
        title="그룹 삭제"
        message="이 그룹을 삭제하시겠습니까? 그룹에 속한 회원들은 그룹에서 자동으로 제외됩니다."
        confirmText="삭제"
        cancelText="취소"
        type="warning"
      />
    </div>
  );
};
