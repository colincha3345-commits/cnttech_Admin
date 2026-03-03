/**
 * 회원 그룹 생성/수정 모달
 */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/components/ui';
import { useCreateGroup, useUpdateGroup } from '@/hooks/useMemberGroups';
import { useToast } from '@/hooks';
import type { MemberGroup } from '@/types/member-segment';

interface GroupFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  group?: MemberGroup | null;
  groups?: MemberGroup[];
  onSuccess: () => void;
}

export const GroupFormModal: React.FC<GroupFormModalProps> = ({
  isOpen,
  onClose,
  group,
  groups,
  onSuccess,
}) => {
  const toast = useToast();
  const isEditMode = !!group;

  // 폼 상태
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // mutations
  const { createGroupAsync, isCreating } = useCreateGroup();
  const { updateGroupAsync, isUpdating } = useUpdateGroup();

  const isLoading = isCreating || isUpdating;

  // 폼 초기화
  useEffect(() => {
    if (isOpen) {
      if (group) {
        setName(group.name);
        setDescription(group.description || '');
      } else {
        setName('');
        setDescription('');
      }
    }
  }, [isOpen, group]);

  // 제출 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('그룹명을 입력해주세요.');
      return;
    }

    const isDuplicate = (groups || []).some(g => g.name.trim() === name.trim() && g.id !== group?.id);
    if (isDuplicate) {
      toast.warning('이미 사용 중인 그룹명입니다. 다른 이름을 입력해주세요.');
      return;
    }

    try {
      if (isEditMode && group) {
        await updateGroupAsync({
          id: group.id,
          data: { name: name.trim(), description: description.trim() || undefined },
        });
        toast.success('그룹이 수정되었습니다.');
      } else {
        await createGroupAsync({
          name: name.trim(),
          description: description.trim() || undefined,
        });
        toast.success('그룹이 생성되었습니다.');
      }
      onSuccess();
    } catch {
      toast.error(isEditMode ? '그룹 수정에 실패했습니다.' : '그룹 생성에 실패했습니다.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? '그룹 수정' : '그룹 생성'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-txt-main mb-1">
            그룹명 <span className="text-critical">*</span>
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="그룹명을 입력하세요"
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-txt-main mb-1">
            설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="그룹에 대한 설명을 입력하세요 (선택)"
            className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            rows={3}
            maxLength={200}
          />
          <p className="text-xs text-txt-muted mt-1">
            {description.length}/200자
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? '처리 중...' : isEditMode ? '수정' : '생성'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
