import React, { useState } from 'react';
import { DownloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Input, Modal, Label } from '@/components/ui';

interface ExportReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export const ExportReasonModal: React.FC<ExportReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = '회원 목록 내보내기',
  description = '개인정보보호법에 따라 다운로드 사유가 기록됩니다. 사유를 구체적으로 입력해 주세요.',
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            isLoading={isLoading}
            disabled={!reason.trim()}
          >
            <DownloadOutlined className="mr-1" />
            내보내기
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg">
          <InfoCircleOutlined className="text-info mt-0.5" />
          <p className="text-xs text-txt-secondary leading-relaxed">
            {description}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label required>다운로드 사유</Label>
          <Input
            placeholder="예: 2024년 4월 정기 마케팅 문자 발송용"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && reason.trim()) handleConfirm();
            }}
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
};
