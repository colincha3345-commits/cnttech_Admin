import { clsx } from 'clsx';

type SpinnerSize = 'sm' | 'md' | 'lg';
type SpinnerLayout = 'inline' | 'center' | 'fullHeight';

interface SpinnerProps {
  /** 스피너 크기 */
  size?: SpinnerSize;
  /** 로딩 텍스트 (null이면 텍스트 없음) */
  text?: string | null;
  /** 레이아웃 모드 */
  layout?: SpinnerLayout;
  /** 추가 CSS 클래스 */
  className?: string;
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'spinner-sm',
  md: 'spinner',
  lg: 'spinner-lg',
};

const layoutClasses: Record<SpinnerLayout, string> = {
  inline: 'inline-flex items-center gap-2',
  center: 'flex items-center justify-center py-12',
  fullHeight: 'flex items-center justify-center h-64',
};

/**
 * 공통 로딩 스피너 컴포넌트
 *
 * @example
 * // 버튼 내부용 (인라인)
 * <Spinner size="sm" text="처리 중..." layout="inline" />
 *
 * // 테이블/리스트 로딩용
 * <Spinner text="로딩 중..." layout="center" />
 *
 * // 페이지 로딩용
 * <Spinner text="로딩 중..." layout="fullHeight" />
 */
export function Spinner({
  size = 'md',
  text = '로딩 중...',
  layout = 'center',
  className,
}: SpinnerProps) {
  return (
    <div className={clsx(layoutClasses[layout], className)}>
      <span className={sizeClasses[size]} />
      {text && <span className="ml-2 text-txt-muted">{text}</span>}
    </div>
  );
}

/**
 * 버튼 내부용 인라인 스피너
 */
export function InlineSpinner({ text = '처리 중...' }: { text?: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className="spinner" />
      {text}
    </span>
  );
}
