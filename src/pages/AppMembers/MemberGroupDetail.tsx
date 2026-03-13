/**
 * 회원 그룹 상세 페이지
 */
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';

import { Card, Button, Badge, ConfirmDialog, MaskedData, Pagination } from '@/components/ui';
import {
  useMemberGroup,
  useGroupMembers,
  useDeleteGroup,
  useRemoveMembersFromGroup,
} from '@/hooks/useMemberGroups';
import { useToast } from '@/hooks';
import { MEMBER_STATUS_LABELS } from '@/types';
import { getMemberGradeLabel, getGradeBadgeVariant } from '@/utils/memberGrade';
import type { Member } from '@/types/member';
import { GroupFormModal } from './components/GroupFormModal';
import { AddMembersModal } from './components/AddMembersModal';

export const MemberGroupDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  // 페이지네이션 상태
  const [page, setPage] = useState(1);
  const limit = 10;

  // 선택된 회원 (다중 제거용)
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  // 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMembersModalOpen, setIsAddMembersModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

  // 데이터 조회
  const { group, isLoading: isLoadingGroup, refetch: refetchGroup } = useMemberGroup(id);
  const {
    members,
    pagination,
    isLoading: isLoadingMembers,
    refetch: refetchMembers,
  } = useGroupMembers(id, { page, limit });

  const { deleteGroup, isDeleting } = useDeleteGroup();
  const { removeMembers, isRemoving } = useRemoveMembersFromGroup();

  // 상태별 Badge 색상
  const getStatusBadgeVariant = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'dormant':
        return 'default';
      case 'withdrawn':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  // 날짜 포맷
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // 전체 선택/해제
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedMemberIds(members.map((m) => m.id));
    } else {
      setSelectedMemberIds([]);
    }
  };

  // 개별 선택
  const handleSelectMember = (memberId: string, checked: boolean) => {
    if (checked) {
      setSelectedMemberIds((prev) => [...prev, memberId]);
    } else {
      setSelectedMemberIds((prev) => prev.filter((mid) => mid !== memberId));
    }
  };

  // 그룹 삭제
  const handleDeleteGroup = async () => {
    if (!id) return;

    try {
      await deleteGroup(id);
      toast.success('그룹이 삭제되었습니다.');
      navigate('/app-members/groups');
    } catch {
      toast.error('그룹 삭제에 실패했습니다.');
    }
  };

  // 회원 제거
  const handleRemoveMembers = async () => {
    if (!id || selectedMemberIds.length === 0) return;

    try {
      await removeMembers({ groupId: id, memberIds: selectedMemberIds });
      toast.success(`${selectedMemberIds.length}명의 회원이 그룹에서 제거되었습니다.`);
      setSelectedMemberIds([]);
      setIsRemoveDialogOpen(false);
      refetchGroup();
      refetchMembers();
    } catch {
      toast.error('회원 제거에 실패했습니다.');
    }
  };

  // 개별 회원 제거
  const handleRemoveSingleMember = async (memberId: string) => {
    if (!id) return;

    try {
      await removeMembers({ groupId: id, memberIds: [memberId] });
      toast.success('회원이 그룹에서 제거되었습니다.');
      refetchGroup();
      refetchMembers();
    } catch {
      toast.error('회원 제거에 실패했습니다.');
    }
  };

  if (isLoadingGroup) {
    return (
      <div className="p-8 text-center text-txt-muted">로딩 중...</div>
    );
  }

  if (!group) {
    return (
      <div className="p-8 text-center">
        <p className="text-txt-muted mb-4">그룹을 찾을 수 없습니다.</p>
        <Button variant="secondary" onClick={() => navigate('/app-members/groups')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/app-members/groups')}
            className="mb-2"
          >
            <ArrowLeftOutlined className="mr-1" />
            목록으로
          </Button>
          <h1 className="text-2xl font-bold text-txt-main">{group.name}</h1>
          {group.description && (
            <p className="text-txt-secondary mt-1">{group.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsEditModalOpen(true)}
          >
            <EditOutlined className="mr-1" />
            수정
          </Button>
          <Button
            variant="secondary"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={isDeleting}
          >
            <DeleteOutlined className="mr-1" />
            삭제
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsAddMembersModalOpen(true)}
          >
            <UserAddOutlined className="mr-1" />
            회원 추가
          </Button>
        </div>
      </div>

      {/* 회원 목록 */}
      <Card className="p-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold text-txt-main">
            소속 회원 ({group.memberCount}명)
          </h3>
          {selectedMemberIds.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsRemoveDialogOpen(true)}
            >
              <UserDeleteOutlined className="mr-1" />
              선택 제거 ({selectedMemberIds.length}명)
            </Button>
          )}
        </div>

        {isLoadingMembers ? (
          <div className="p-8 text-center text-txt-muted">로딩 중...</div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-txt-muted">
            그룹에 속한 회원이 없습니다.
          </div>
        ) : (
          <>
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedMemberIds.length === members.length && members.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4"
                    />
                  </th>
                  <th>이름</th>
                  <th>아이디</th>
                  <th>등급</th>
                  <th>상태</th>
                  <th>연락처</th>
                  <th>가입일</th>
                  <th className="w-20 text-center">관리</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedMemberIds.includes(member.id)}
                        onChange={(e) => handleSelectMember(member.id, e.target.checked)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td
                      className="font-medium text-txt-main cursor-pointer hover:text-primary"
                      onClick={() => navigate(`/app-members/${member.id}`)}
                    >
                      {member.name}
                    </td>
                    <td className="text-txt-secondary font-mono text-sm">
                      {member.memberId}
                    </td>
                    <td>
                      <Badge variant={getGradeBadgeVariant(member.grade)}>
                        {getMemberGradeLabel(member.grade)}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={getStatusBadgeVariant(member.status)}>
                        {MEMBER_STATUS_LABELS[member.status]}
                      </Badge>
                    </td>
                    <td>
                      <MaskedData value={member.phone} />
                    </td>
                    <td className="text-txt-secondary text-sm">
                      {formatDate(member.registeredAt)}
                    </td>
                    <td className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSingleMember(member.id)}
                        disabled={isRemoving}
                      >
                        <UserDeleteOutlined className="text-critical" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 페이지네이션 */}
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              totalElements={pagination.total}
              limit={limit}
              unit="명"
            />
          </>
        )}
      </Card>

      {/* 그룹 수정 모달 */}
      <GroupFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        group={group}
        onSuccess={() => {
          setIsEditModalOpen(false);
          refetchGroup();
        }}
      />

      {/* 회원 추가 모달 */}
      <AddMembersModal
        isOpen={isAddMembersModalOpen}
        onClose={() => setIsAddMembersModalOpen(false)}
        groupId={id!}
        onSuccess={() => {
          setIsAddMembersModalOpen(false);
          refetchGroup();
          refetchMembers();
        }}
      />

      {/* 그룹 삭제 확인 */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteGroup}
        title="그룹 삭제"
        message="이 그룹을 삭제하시겠습니까? 그룹에 속한 회원들은 그룹에서 자동으로 제외됩니다."
        confirmText="삭제"
        cancelText="취소"
        type="warning"
      />

      {/* 회원 제거 확인 */}
      <ConfirmDialog
        isOpen={isRemoveDialogOpen}
        onClose={() => setIsRemoveDialogOpen(false)}
        onConfirm={handleRemoveMembers}
        title="회원 제거"
        message={`선택한 ${selectedMemberIds.length}명의 회원을 그룹에서 제거하시겠습니까?`}
        confirmText="제거"
        cancelText="취소"
        type="warning"
      />
    </div>
  );
};
