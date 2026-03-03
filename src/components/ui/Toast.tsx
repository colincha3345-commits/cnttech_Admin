import React, { useEffect } from 'react';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircleOutlined,
    className: 'border-success bg-[#f0fdf4] text-success',
    iconColor: 'text-success',
  },
  error: {
    icon: CloseCircleOutlined,
    className: 'border-critical bg-[#fef2f2] text-critical',
    iconColor: 'text-critical',
  },
  warning: {
    icon: WarningOutlined,
    className: 'border-warning bg-[#fffbeb] text-warning',
    iconColor: 'text-warning',
  },
  info: {
    icon: InfoCircleOutlined,
    className: 'border-primary bg-[#eff6ff] text-primary',
    iconColor: 'text-primary',
  },
};

export const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 3000, onClose }) => {
  const config = toastConfig[type];
  const Icon = config.icon;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={clsx(
        'flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg',
        'animate-fadeIn',
        config.className
      )}
      role="alert"
    >
      <Icon className={clsx('text-xl flex-shrink-0 mt-0.5', config.iconColor)} />
      <p className="flex-1 text-sm font-medium text-txt-main">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-txt-muted hover:text-txt-main transition-colors"
        aria-label="닫기"
      >
        <CloseOutlined className="text-sm" />
      </button>
    </div>
  );
};
