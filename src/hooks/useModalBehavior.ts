import { useEffect, useRef, type RefObject } from 'react';

interface UseModalBehaviorOptions {
  isOpen: boolean;
  onClose?: () => void;
  /** ESC 키로 닫기 허용 여부 (기본: true) */
  closeOnEscape?: boolean;
  /** 배경 스크롤 방지 (기본: true) */
  preventScroll?: boolean;
  /** 열릴 때 자동 포커스 (기본: true) */
  autoFocus?: boolean;
}

/**
 * 모달/다이얼로그 공통 동작 훅
 * ESC 키 처리, 스크롤 방지, 포커스 관리를 통합 관리
 */
export function useModalBehavior<T extends HTMLElement = HTMLDivElement>(
  options: UseModalBehaviorOptions
): RefObject<T> {
  const { isOpen, onClose, closeOnEscape = true, preventScroll = true, autoFocus = true } = options;
  const ref = useRef<T>(null);

  // ESC 키 처리
  useEffect(() => {
    if (!isOpen || !closeOnEscape || !onClose) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  // 스크롤 방지
  useEffect(() => {
    if (!preventScroll) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, preventScroll]);

  // 자동 포커스
  useEffect(() => {
    if (isOpen && autoFocus && ref.current) {
      ref.current.focus();
    }
  }, [isOpen, autoFocus]);

  return ref;
}
