import { Button } from './Button';

interface PaginationProps {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
    totalElements?: number;
    limit?: number;
    unit?: string;
    onLimitChange?: (limit: number) => void;
    limitOptions?: number[];
}

export function Pagination({
    page,
    totalPages,
    onPageChange,
    className = '',
    totalElements,
    limit,
    unit = '개',
    onLimitChange,
    limitOptions = [10, 20, 50, 100],
}: PaginationProps) {
    if (totalPages <= 1 && !onLimitChange) return null;

    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (page <= 3) {
                for (let i = 1; i <= maxVisiblePages; i++) {
                    pages.push(i);
                }
            } else if (page >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                for (let i = page - 2; i <= page + 2; i++) {
                    pages.push(i);
                }
            }
        }
        return pages;
    };

    return (
        <div className={`flex items-center justify-between mt-4 pt-4 border-t border-border ${className}`}>
            <div className="flex items-center gap-3">
                {onLimitChange && limit !== undefined && (
                    <select
                        value={limit}
                        onChange={(e) => {
                            onLimitChange(Number(e.target.value));
                            onPageChange(1);
                        }}
                        className="px-2 py-1 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                        {limitOptions.map((n) => (
                            <option key={n} value={n}>{n}{unit}씩</option>
                        ))}
                    </select>
                )}
                {totalElements !== undefined && limit !== undefined && (
                    <p className="text-sm text-txt-muted">
                        총 {totalElements.toLocaleString()}{unit} 중 {(page - 1) * limit + 1}-
                        {Math.min(page * limit, totalElements)}{unit} 표시
                    </p>
                )}
            </div>
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 flex-1">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => onPageChange(page - 1)}
                    >
                        이전
                    </Button>
                    {getPageNumbers().map((p) => (
                        <Button
                            key={p}
                            variant={p === page ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => onPageChange(p)}
                        >
                            {p}
                        </Button>
                    ))}
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => onPageChange(page + 1)}
                    >
                        다음
                    </Button>
                </div>
            )}
        </div>
    );
}
