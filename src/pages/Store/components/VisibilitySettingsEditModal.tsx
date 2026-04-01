/**
 * 매장 노출 설정 모달
 * isVisible 단일 토글로 관리
 */
import React, { useState } from 'react';

import { Modal, Button, Switch, Spinner } from '@/components/ui';

interface VisibilitySettingsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  isVisible: boolean;
  onSave: (isVisible: boolean) => void;
  isSaving?: boolean;
}

export const VisibilitySettingsEditModal: React.FC<VisibilitySettingsEditModalProps> = ({
  isOpen,
  onClose,
  isVisible,
  onSave,
  isSaving = false,
}) => {
  const [value, setValue] = useState(isVisible);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(value);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="매장 노출 설정" size="sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center justify-between p-4 border border-border rounded-lg">
          <span className="text-sm font-medium">매장 노출</span>
          <Switch checked={value} onCheckedChange={setValue} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Spinner size="sm" /> : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
