import { createPortal } from 'react-dom';
import { type ReactNode } from 'react';
import { CloseCircleOutlined, CheckCircleOutlined, ExclamationCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';

import { Button } from './Button';
import { useModalBehavior } from '@/hooks/useModalBehavior';

type AlertType = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  isOpen: boolean;
  onClose: () => void;
  type?: AlertType;
  title: string;
  description?: string;
  actionLabel?: string;
  cancelLabel?: string;
  onAction?: () => void;
  onCancel?: () => void;
  children?: ReactNode;
  showCancel?: boolean;
  showIcon?: boolean; // 아이콘 표시 여부
  icon?: ReactNode; // 커스텀 아이콘
}

const alertIcons: Record<AlertType, ReactNode> = {
  error: <CloseCircleOutlined style={{ fontSize: 20 }} className="text-critical" />,
  success: <CheckCircleOutlined style={{ fontSize: 20 }} className="text-success" />,
  warning: <ExclamationCircleOutlined style={{ fontSize: 20 }} className="text-warning" />,
  info: <InfoCircleOutlined style={{ fontSize: 20 }} className="text-txt-muted" />,
};

export function Alert({
  isOpen,
  onClose,
  type = 'error',
  title,
  description,
  actionLabel = 'Continue',
  cancelLabel = 'Cancel',
  onAction,
  onCancel,
  children,
  showCancel = true,
  showIcon = false,
  icon,
}: AlertProps) {
  useModalBehavior({
    isOpen,
    onClose: showCancel ? onClose : undefined,
    closeOnEscape: showCancel,
  });

  if (!isOpen) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  // Type에 따라 액션 버튼 variant 결정
  const getActionButtonVariant = () => {
    switch (type) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'unmask';
      case 'success':
        return 'success';
      default:
        return 'fill';
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn"
      onClick={showCancel ? handleCancel : undefined}
    >
      {/* Overlay - Apple Style */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Alert Content - Apple Style */}
      <div
        className="relative bg-white rounded-[20px] shadow-card-hover max-w-md w-full p-6 animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Content */}
        <div className="mb-6">
          {/* Title with optional icon */}
          <div className="flex items-center gap-2 mb-3">
            {(showIcon || icon) && (
              <div className="flex-shrink-0">
                {icon || alertIcons[type]}
              </div>
            )}
            <h3 className="text-lg font-semibold text-txt-main tracking-tight">
              {title}
            </h3>
          </div>

          {/* Description */}
          {description && (
            <p className="text-[15px] text-txt-muted leading-relaxed">
              {description}
            </p>
          )}

          {/* Custom content */}
          {children && (
            <div className="mt-4">
              {children}
            </div>
          )}
        </div>

        {/* Action Buttons - Apple Style */}
        <div className="flex gap-3 justify-end">
          {showCancel && (
            <Button
              variant="secondary"
              onClick={handleCancel}
              className="min-w-[90px]"
            >
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={getActionButtonVariant()}
            onClick={handleAction}
            className="min-w-[90px]"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
