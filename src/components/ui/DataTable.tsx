import { type ReactNode } from 'react';
import { clsx } from 'clsx';
import { CaretUpFilled, CaretDownFilled } from '@ant-design/icons';

import { Spinner } from './Spinner';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: ReactNode;
  isLoading?: boolean;
  className?: string;
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T) => string;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string, order: 'asc' | 'desc') => void;
}

function SortIcon({ active, order }: { active: boolean; order?: 'asc' | 'desc' }) {
  return (
    <span className="inline-flex flex-col ml-1 -space-y-1 align-middle">
      <CaretUpFilled
        style={{ fontSize: 10 }}
        className={active && order === 'asc' ? 'text-primary' : 'text-txt-muted/30'}
      />
      <CaretDownFilled
        style={{ fontSize: 10 }}
        className={active && order === 'desc' ? 'text-primary' : 'text-txt-muted/30'}
      />
    </span>
  );
}

export function DataTable<T extends object>({
  columns,
  data,
  keyExtractor,
  emptyMessage = '데이터가 없습니다.',
  isLoading = false,
  className,
  onRowClick,
  rowClassName,
  sortKey,
  sortOrder,
  onSort,
}: DataTableProps<T>) {
  const handleSort = (key: string) => {
    if (!onSort) return;
    if (sortKey === key) {
      onSort(key, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSort(key, 'asc');
    }
  };

  if (isLoading) {
    return <Spinner layout="center" />;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-txt-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={clsx('data-table-wrapper', className)}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={clsx(
                  column.className,
                  column.sortable && onSort && 'cursor-pointer select-none hover:bg-bg-hover',
                )}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                {column.header}
                {column.sortable && onSort && (
                  <SortIcon active={sortKey === String(column.key)} order={sortOrder} />
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              onClick={() => onRowClick?.(item)}
              className={clsx(
                onRowClick && 'cursor-pointer hover:bg-bg-hover',
                rowClassName?.(item)
              )}
            >
              {columns.map((column) => (
                <td
                  key={`${keyExtractor(item)}-${String(column.key)}`}
                  data-label={column.header}
                  className={column.className}
                >
                  {column.render
                    ? column.render(item)
                    : String((item as Record<string, unknown>)[column.key as string] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Mobile Card View */}
      <div className="data-cards">
        {data.map((item) => (
          <div key={keyExtractor(item)} className="data-card">
            {columns.map((column) => (
              <div key={`${keyExtractor(item)}-${String(column.key)}-card`} className="data-card-row">
                <span className="data-card-label">{column.header}</span>
                <span className="data-card-value">
                  {column.render
                    ? column.render(item)
                    : String((item as Record<string, unknown>)[column.key as string] ?? '')}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
