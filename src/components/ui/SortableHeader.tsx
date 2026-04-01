/**
 * 소팅 가능한 테이블 헤더 컴포넌트
 * 수동 <table>에서 사용
 */
import { CaretUpFilled, CaretDownFilled } from '@ant-design/icons';

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentSortKey: string;
  currentSortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  sortKey,
  currentSortKey,
  currentSortOrder,
  onSort,
  className,
}: SortableHeaderProps) {
  const isActive = currentSortKey === sortKey;

  return (
    <th
      className={`cursor-pointer select-none hover:bg-bg-hover ${className ?? ''}`}
      onClick={() => onSort(sortKey)}
    >
      {label}
      <span className="inline-flex flex-col ml-1 -space-y-1 align-middle">
        <CaretUpFilled
          style={{ fontSize: 10 }}
          className={isActive && currentSortOrder === 'asc' ? 'text-primary' : 'text-txt-muted/30'}
        />
        <CaretDownFilled
          style={{ fontSize: 10 }}
          className={isActive && currentSortOrder === 'desc' ? 'text-primary' : 'text-txt-muted/30'}
        />
      </span>
    </th>
  );
}
