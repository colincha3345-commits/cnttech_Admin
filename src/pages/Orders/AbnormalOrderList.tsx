import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePageViewLog } from '@/hooks/useActivityLog';
import type { OrderDeliveryType, OrderSearchFilter } from '@/types/order';
import { useAbnormalOrderList } from '@/hooks';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  DataTable,
  Pagination,
  SearchInput,
} from '@/components/ui';
import {
  WarningOutlined,
  ReloadOutlined,
  EyeOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  ORDER_DELIVERY_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/types';
import { maskName } from '@/utils/mask';

const STORE_OPTIONS = [
  { value: '', label: '전체 가맹점' },
  { value: 'store-1', label: '강남점' },
  { value: 'store-2', label: '홍대점' },
  { value: 'store-3', label: '잠실점' },
  { value: 'store-4', label: '신촌점' },
  { value: 'store-5', label: '건대점' },
];

const REFRESH_OPTIONS: { value: number | false; label: string }[] = [
  { value: false, label: '수동' },
  { value: 15000, label: '15초' },
  { value: 30000, label: '30초' },
  { value: 60000, label: '1분' },
];

/** 경과 시간 포맷 */
function formatElapsed(orderDate: Date): string {
  const diff = Date.now() - new Date(orderDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}분 경과`;
  const hours = Math.floor(minutes / 60);
  const remainMin = minutes % 60;
  return `${hours}시간 ${remainMin}분 경과`;
}

export function AbnormalOrderList() {
  usePageViewLog('orders-abnormal');
  const navigate = useNavigate();

  // 필터 상태
  const [keyword, setKeyword] = useState('');
  const [orderType, setOrderType] = useState<OrderDeliveryType | ''>('');
  const [storeId, setStoreId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortKey, setSortKey] = useState<string>('orderDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [refreshInterval, setRefreshInterval] = useState<number | false>(30000);

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortKey(key);
    setSortOrder(order);
    setPage(1);
  };

  const searchParams = useMemo<OrderSearchFilter>(() => {
    const params: OrderSearchFilter = { page, limit };
    if (keyword) params.keyword = keyword;
    if (orderType) params.orderType = orderType;
    if (storeId) params.storeId = storeId;
    if (dateFrom) params.dateFrom = new Date(dateFrom);
    if (dateTo) params.dateTo = new Date(dateTo);
    return params;
  }, [keyword, orderType, storeId, dateFrom, dateTo, page, limit]);

  const { data: listData, isLoading, refetch } = useAbnormalOrderList(searchParams, { refetchInterval: refreshInterval });

  const orders = listData?.data ?? [];
  const pagination = listData?.pagination;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ko-KR').format(amount) + '원';

  const formatDate = (date: Date) =>
    new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleReset = () => {
    setKeyword('');
    setOrderType('');
    setStoreId('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 경고 배너 */}
      <div className="flex items-center gap-2 px-4 py-3 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning">
        <WarningOutlined />
        접수 후 8분 이상 POS 수신이 없는 주문입니다. CS 처리가 필요합니다.
      </div>

      {/* 검색 필터 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-txt-main flex items-center gap-2">
              <SearchOutlined />
              이상주문 검색
            </h3>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              초기화
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">시작일</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">종료일</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">주문유형</label>
              <select
                value={orderType}
                onChange={(e) => { setOrderType(e.target.value as OrderDeliveryType | ''); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">전체</option>
                {Object.entries(ORDER_DELIVERY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">가맹점</label>
              <select
                value={storeId}
                onChange={(e) => { setStoreId(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {STORE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">검색</label>
              <SearchInput
                value={keyword}
                onChange={setKeyword}
                placeholder="주문번호, 이름, 연락처, 매장명"
                onSearch={() => setPage(1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 이상주문 목록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-txt-main flex items-center gap-2">
              <WarningOutlined className="text-warning" />
              이상주문 목록
              {pagination && (
                <span className="text-critical font-bold">({pagination.total}건)</span>
              )}
            </h3>
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
                onClick={() => refetch()}
                disabled={isLoading}
              >
                <ReloadOutlined className={isLoading ? 'animate-spin' : ''} />
                <span className="ml-1">업데이트</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            columns={[
              {
                key: 'orderNumber',
                header: '주문번호',
                sortable: true,
                render: (order) => (
                  <span className="font-mono text-xs text-primary">{order.orderNumber}</span>
                ),
              },
              {
                key: 'orderDate',
                header: '접수일시',
                sortable: true,
                render: (order) => (
                  <span className="text-txt-sub whitespace-nowrap">{formatDate(order.orderDate)}</span>
                ),
              },
              {
                key: 'elapsed',
                header: '경과시간',
                render: (order) => (
                  <Badge variant="critical">{formatElapsed(order.orderDate)}</Badge>
                ),
              },
              {
                key: 'orderType',
                header: '유형',
                sortable: true,
                render: (order) => (
                  <Badge variant="secondary">
                    {ORDER_DELIVERY_TYPE_LABELS[order.orderType as keyof typeof ORDER_DELIVERY_TYPE_LABELS]}
                  </Badge>
                ),
              },
              {
                key: 'memberName',
                header: '주문자',
                sortable: true,
                render: (order) => (
                  <span className="text-txt-main">{maskName(order.memberName)}</span>
                ),
              },
              {
                key: 'storeName',
                header: '가맹점',
                sortable: true,
                render: (order) => (
                  <span className="text-txt-sub">{order.storeName}</span>
                ),
              },
              {
                key: 'totalAmount',
                header: '결제금액',
                sortable: true,
                className: 'text-right',
                render: (order) => (
                  <span className="font-medium text-txt-main whitespace-nowrap">
                    {formatCurrency(order.totalAmount)}
                  </span>
                ),
              },
              {
                key: 'paymentMethod',
                header: '결제수단',
                render: (order) => (
                  <span className="text-txt-sub text-xs">
                    {PAYMENT_METHOD_LABELS[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                  </span>
                ),
              },
              {
                key: 'status',
                header: '상태',
                className: 'text-center',
                render: () => (
                  <Badge variant="warning">접수 대기</Badge>
                ),
              },
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
                      navigate(`/orders/${order.id}`);
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
            onRowClick={(order) => navigate(`/orders/${order.id}`)}
            emptyMessage={
              <div className="flex flex-col items-center py-4">
                <WarningOutlined className="text-4xl mb-2 text-txt-muted" />
                <p>이상주문이 없습니다</p>
              </div>
            }
          />

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
    </div>
  );
}
