import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  DataTable,
  Pagination,
} from '@/components/ui';
import { ShoppingCartOutlined, ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import {
  ORDER_DELIVERY_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
} from '@/types';
import type { OrderStatus } from '@/types/app-member';
import { maskName } from '@/utils/mask';

// 상태별 뱃지 variant
const STATUS_BADGE_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'critical' | 'info'> = {
  payment_pending: 'secondary',
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  delivered: 'success',
  completed: 'success',
  cancelled: 'critical',
  expired: 'default',
};

const REFRESH_OPTIONS: { value: number | false; label: string }[] = [
  { value: false, label: '수동' },
  { value: 30000, label: '30초' },
  { value: 60000, label: '1분' },
  { value: 180000, label: '3분' },
  { value: 300000, label: '5분' },
];

interface OrderTableProps {
  orders: any[];
  isLoading: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats?: {
    todayRevenue?: number;
  };
  sortKey: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string, order: 'asc' | 'desc') => void;
  page: number;
  setPage: (v: number) => void;
  limit: number;
  setLimit: (v: number) => void;
  refreshInterval: number | false;
  setRefreshInterval: (v: number | false) => void;
  onRefresh: () => void;
  flashingIds: Set<string>;
  onRowClick: (id: string) => void;
}

export function OrderTable({
  orders, isLoading, pagination, stats,
  sortKey, sortOrder, onSort,
  page, setPage, limit, setLimit,
  refreshInterval, setRefreshInterval, onRefresh,
  flashingIds, onRowClick
}: OrderTableProps) {

  // 금액 포맷
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ko-KR').format(amount) + '원';

  // 날짜 포맷
  const formatDate = (date: Date) =>
    new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  // 메뉴 요약
  const getMenuSummary = (items: { productName: string; quantity: number }[]) => {
    const firstItem = items[0];
    if (!firstItem) return '-';
    const first = `${firstItem.productName}(${firstItem.quantity})`;
    if (items.length === 1) return first;
    return `${first} 외 ${items.length - 1}건`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-txt-main">
            주문 목록 {pagination && <span className="text-txt-muted font-normal">({pagination.total}건)</span>}
          </h3>
          <div className="flex items-center gap-3">
            {stats?.todayRevenue !== undefined && (
              <p className="text-sm text-txt-muted">
                오늘 매출: <span className="font-semibold text-primary">{formatCurrency(stats.todayRevenue)}</span>
              </p>
            )}
            <div className="flex items-center gap-2">
              <select
                value={refreshInterval === false ? '' : String(refreshInterval)}
                onChange={(e) => {
                  const v = e.target.value;
                  setRefreshInterval(v === '' ? false : Number(v));
                }}
                className="px-2 py-1.5 border border-border rounded-lg text-xs bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {REFRESH_OPTIONS.map((opt) => (
                  <option key={String(opt.value)} value={opt.value === false ? '' : String(opt.value)}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                title="목록 업데이트"
              >
                <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
                <span className="ml-1">업데이트</span>
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <DataTable
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={onSort}
          columns={[
            { key: 'orderNumber', header: '주문번호', sortable: true, render: (order) => <span className="font-mono text-xs text-primary">{order.orderNumber}</span> },
            { key: 'orderDate', header: '일시', sortable: true, render: (order) => <span className="text-txt-sub whitespace-nowrap">{formatDate(order.orderDate)}</span> },
            { key: 'orderType', header: '유형', sortable: true, render: (order) => <Badge variant="secondary">{ORDER_DELIVERY_TYPE_LABELS[order.orderType as keyof typeof ORDER_DELIVERY_TYPE_LABELS]}</Badge> },
            { key: 'memberName', header: '주문자', sortable: true, render: (order) => <span className="text-txt-main">{maskName(order.memberName)}</span> },
            { key: 'storeName', header: '가맹점', sortable: true, render: (order) => <span className="text-txt-sub">{order.storeName}</span> },
            { key: 'items', header: '메뉴', render: (order) => <span className="text-txt-sub max-w-[200px] truncate block">{getMenuSummary(order.items)}</span> },
            { key: 'totalAmount', header: '결제금액', sortable: true, className: 'text-right', render: (order) => <span className="font-medium text-txt-main whitespace-nowrap">{formatCurrency(order.totalAmount)}</span> },
            { key: 'paymentMethod', header: '결제수단', sortable: true, render: (order) => <span className="text-txt-sub text-xs">{PAYMENT_METHOD_LABELS[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}</span> },
            { key: 'status', header: '상태', sortable: true, className: 'text-center', render: (order) => <Badge variant={STATUS_BADGE_VARIANT[order.status as OrderStatus]}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge> },
            {
              key: 'actions',
              header: '상세',
              className: 'text-center',
              render: (order) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowClick(order.id);
                  }}
                >
                  <EyeOutlined />
                </Button>
              ),
            },
          ]}
          data={orders}
          isLoading={isLoading}
          keyExtractor={(order) => order.id}
          onRowClick={(order) => onRowClick(order.id)}
          rowClassName={(order) => flashingIds.has(order.id) ? 'animate-row-flash' : ''}
          emptyMessage={
            <div className="flex flex-col items-center py-4">
              <ShoppingCartOutlined className="text-4xl mb-2 text-txt-muted" />
              <p>주문 내역이 없습니다</p>
            </div>
          }
        />

        {/* 페이지네이션 */}
        {pagination && (
          <Pagination
            page={page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
            limit={limit}
            onLimitChange={setLimit}
          />
        )}
      </CardContent>
    </Card>
  );
}
