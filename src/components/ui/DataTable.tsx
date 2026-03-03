import { type ReactNode } from 'react';
import { clsx } from 'clsx';

import { Spinner } from './Spinner';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
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
}: DataTableProps<T>) {
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
              <th key={String(column.key)} className={column.className}>
                {column.header}
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
