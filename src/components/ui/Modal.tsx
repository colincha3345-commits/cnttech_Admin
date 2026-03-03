import { createPortal } from 'react-dom';
import { CloseOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';

import { useModalBehavior } from '@/hooks/useModalBehavior';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  footer?: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  footer,
  className,
}: ModalProps) {
  const modalRef = useModalBehavior<HTMLDivElement>({
    isOpen,
    onClose,
    closeOnEscape: true,
    preventScroll: true,
    autoFocus: true,
  });

  if (!isOpen) return null;

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
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        className={clsx(
          'relative w-full bg-bg-card rounded-xl shadow-lg animate-scaleIn max-h-[90vh] flex flex-col',
          sizeClasses[size],
          className
        )}
        tabIndex={-1}
      >
        {/* 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            {title && (
              <h2 id="modal-title" className="text-lg font-semibold text-txt-main">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 text-txt-muted hover:text-txt-main rounded-md transition-colors ml-auto"
                aria-label="닫기"
              >
                <CloseOutlined style={{ fontSize: 16 }} />
              </button>
            )}
          </div>
        )}

        {/* 내용 */}
        <div className="p-4 overflow-y-auto flex-1">{children}</div>

        {/* 푸터 */}
        {footer && (
          <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
