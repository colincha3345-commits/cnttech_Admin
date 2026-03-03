/**
 * 회원 그룹에 회원 추가 모달
 */
import React, { useState } from 'react';
import { Modal, Button, Badge, SearchInput } from '@/components/ui';
import { useAppMembers } from '@/hooks';
import { useAddMembersToGroup } from '@/hooks/useMemberGroups';
import { useToast } from '@/hooks';
import { MEMBER_STATUS_LABELS } from '@/types';
import { getMemberGradeLabel, getGradeBadgeVariant } from '@/utils/memberGrade';
import type { Member } from '@/types/member';

interface AddMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  onSuccess: () => void;
}

export const AddMembersModal: React.FC<AddMembersModalProps> = ({
  isOpen,
  onClose,
  groupId,
  onSuccess,
}) => {
  const toast = useToast();

  // 검색 상태
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [page, setPage] = useState(1);

  // 선택된 회원
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

  // 회원 검색
  const { members, pagination, isLoading } = useAppMembers({
    filter: 'all',
    page,
    limit: 10,
    searchKeyword: searchKeyword || undefined,
    searchType: 'all',
  });

  // 회원 추가 mutation
  const { addMembersAsync, isAdding } = useAddMembersToGroup();

  // 검색 핸들러
  const handleSearch = () => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  // 회원 선택/해제
  const handleToggleMember = (member: Member) => {
    const isSelected = selectedMembers.some((m) => m.id === member.id);
    if (isSelected) {
      setSelectedMembers((prev) => prev.filter((m) => m.id !== member.id));
    } else {
      setSelectedMembers((prev) => [...prev, member]);
    }
  };

  // 선택 회원 제거
  const handleRemoveSelected = (memberId: string) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== memberId));
  };

  // 회원 추가 제출
  const handleSubmit = async () => {
    if (selectedMembers.length === 0) {
      toast.error('추가할 회원을 선택해주세요.');
      return;
    }

    try {
      await addMembersAsync({
        groupId,
        memberIds: selectedMembers.map((m) => m.id),
      });
      toast.success(`${selectedMembers.length}명의 회원이 그룹에 추가되었습니다.`);
      setSelectedMembers([]);
      setKeyword('');
      setSearchKeyword('');
      onSuccess();
    } catch {
      toast.error('회원 추가에 실패했습니다.');
    }
  };

  // 모달 닫기 시 상태 초기화
  const handleClose = () => {
    setSelectedMembers([]);
    setKeyword('');
    setSearchKeyword('');
    setPage(1);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="회원 추가"
      size="xl"
    >
      <div className="space-y-4">
        {/* 선택된 회원 표시 */}
        {selectedMembers.length > 0 && (
          <div className="p-3 bg-bg-hover rounded-lg">
            <p className="text-sm font-medium text-txt-main mb-2">
              선택된 회원 ({selectedMembers.length}명)
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedMembers.map((member) => (
                <span
                  key={member.id}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-bg-main rounded-full text-sm"
                >
                  {member.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveSelected(member.id)}
                    className="text-txt-muted hover:text-critical"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 검색 */}
        <div className="mb-4 max-w-[400px]">
          <SearchInput
            placeholder="이름, 아이디, 연락처로 검색"
            value={keyword}
            onChange={setKeyword}
            onSearch={handleSearch}
          />
        </div>

        {/* 검색 결과 */}
        <div className="border border-border rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="p-4 text-center text-txt-muted">검색 중...</div>
          ) : members.length === 0 ? (
            <div className="p-4 text-center text-txt-muted">
              {searchKeyword ? '검색 결과가 없습니다.' : '회원을 검색해주세요.'}
            </div>
          ) : (
            <>
              <table className="w-full table-fixed">
                <thead className="bg-bg-hover">
                  <tr>
                    <th className="w-12 px-4 py-2 text-left text-xs font-medium text-txt-muted">선택</th>
                    <th className="w-24 px-4 py-2 text-left text-xs font-medium text-txt-muted">이름</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-txt-muted">아이디</th>
                    <th className="w-20 px-4 py-2 text-left text-xs font-medium text-txt-muted">등급</th>
                    <th className="w-24 px-4 py-2 text-left text-xs font-medium text-txt-muted">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((member) => {
                    const isSelected = selectedMembers.some((m) => m.id === member.id);
                    return (
                      <tr
                        key={member.id}
                        className={`cursor-pointer hover:bg-bg-hover ${isSelected ? 'bg-primary/5' : ''
                          }`}
                        onClick={() => handleToggleMember(member)}
                      >
                        <td className="px-4 py-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => { }}
                            className="w-4 h-4"
                          />
                        </td>
                        <td className="px-4 py-2 text-sm font-medium text-txt-main">
                          {member.name}
                        </td>
                        <td className="px-4 py-2 text-sm text-txt-secondary font-mono">
                          {member.memberId}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Badge variant={getGradeBadgeVariant(member.grade)}>
                            {getMemberGradeLabel(member.grade)}
                          </Badge>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Badge
                            variant={member.status === 'active' ? 'success' : 'default'}
                          >
                            {MEMBER_STATUS_LABELS[member.status]}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* 간단 페이지네이션 */}
              {pagination.totalPages > 1 && (
                <div className="p-2 border-t border-border flex items-center justify-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    이전
                  </Button>
                  <span className="text-sm text-txt-muted">
                    {page} / {pagination.totalPages}
                  </span>
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
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedMembers.length === 0 || isAdding}
          >
            {isAdding ? '추가 중...' : `${selectedMembers.length}명 추가`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
