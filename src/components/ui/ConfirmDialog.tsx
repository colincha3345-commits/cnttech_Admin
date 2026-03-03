import { createPortal } from 'react-dom';
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import { Button } from './Button';
import { useModalBehavior } from '@/hooks/useModalBehavior';

type DialogType = 'confirm' | 'warning' | 'success' | 'info';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: DialogType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

const iconMap: Record<DialogType, { icon: typeof ExclamationCircleOutlined; color: string }> = {
  confirm: { icon: ExclamationCircleOutlined, color: 'text-warning' },
  warning: { icon: ExclamationCircleOutlined, color: 'text-critical' },
  success: { icon: CheckCircleOutlined, color: 'text-success' },
  info: { icon: InfoCircleOutlined, color: 'text-primary' },
};

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'confirm',
  confirmText = '확인',
  cancelText = '취소',
  showCancel = true,
}: ConfirmDialogProps) {
  const dialogRef = useModalBehavior<HTMLDivElement>({
    isOpen,
    onClose,
    closeOnEscape: true,
    preventScroll: true,
    autoFocus: true,
  });

  if (!isOpen) return null;

  const { icon: Icon, color } = iconMap[type];

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md bg-bg-card rounded-xl shadow-lg animate-scaleIn"
        tabIndex={-1}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-txt-muted hover:text-txt-main rounded-md transition-colors"
          aria-label="닫기"
        >
          <CloseOutlined style={{ fontSize: 16 }} />
        </button>

        {/* 내용 */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            {/* 아이콘 */}
            <div
              className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                type === 'warning' || type === 'confirm'
                  ? 'bg-warning-light'
                  : type === 'success'
                  ? 'bg-success-light'
                  : 'bg-primary-light'
              }`}
            >
              <Icon style={{ fontSize: 20 }} className={color} />
            </div>

            {/* 텍스트 */}
            <div className="flex-1 min-w-0">
              <h3 id="dialog-title" className="text-lg font-semibold text-txt-main">
                {title}
              </h3>
              <p className="mt-2 text-sm text-txt-muted whitespace-pre-wrap">{message}</p>
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-6 flex gap-3 justify-end">
            {showCancel && (
              <Button variant="secondary" onClick={onClose}>
                {cancelText}
              </Button>
            )}
            <Button
              variant={type === 'warning' ? 'danger' : 'primary'}
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
