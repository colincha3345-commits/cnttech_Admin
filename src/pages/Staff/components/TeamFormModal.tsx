import React, { useState, useEffect } from 'react';
import { CloseOutlined } from '@ant-design/icons';

import { Button, Input, Label } from '@/components/ui';
import { useCreateTeam, useUpdateTeam, useToast } from '@/hooks';
import type { Team, TeamFormData } from '@/types/staff';

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  team?: Team | null;
}

export const TeamFormModal: React.FC<TeamFormModalProps> = ({
  isOpen,
  onClose,
  team,
}) => {
  const toast = useToast();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();

  const [formData, setFormData] = useState<TeamFormData>({
    name: '',
    description: '',
  });

  const isEditMode = !!team;
  const isLoading = createTeam.isPending || updateTeam.isPending;

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        description: team.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [team, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('팀 이름을 입력해주세요.');
      return;
    }

    try {
      if (isEditMode && team) {
        await updateTeam.mutateAsync({
          id: team.id,
          data: formData,
        });
        toast.success('팀 정보가 수정되었습니다.');
      } else {
        await createTeam.mutateAsync(formData);
        toast.success('새 팀이 생성되었습니다.');
      }
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-card rounded-xl shadow-lg w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-txt-main">
            {isEditMode ? '팀 수정' : '팀 추가'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-bg-hover rounded transition-colors"
            disabled={isLoading}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* 팀 이름 */}
            <div className="space-y-2">
              <Label required>팀 이름</Label>
              <Input
                placeholder="팀 이름을 입력하세요"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                disabled={isLoading}
              />
            </div>

            {/* 설명 */}
            <div className="space-y-2">
              <Label>설명</Label>
              <textarea
                placeholder="팀 설명을 입력하세요 (선택)"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                disabled={isLoading}
                className="w-full min-h-[80px] px-4 py-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex justify-end gap-3 p-4 border-t border-border">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading || !formData.name.trim()}>
              {isLoading ? '처리 중...' : isEditMode ? '수정' : '생성'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
