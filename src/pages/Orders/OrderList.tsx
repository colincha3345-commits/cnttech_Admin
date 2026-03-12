import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  DownloadOutlined,
  EyeOutlined,
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  SearchInput,
  DataTable,
  Pagination,
} from '@/components/ui';
import { usePageViewLog } from '@/hooks/useActivityLog';
import {
  ORDER_DELIVERY_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
} from '@/types';
import type { OrderDeliveryType, OrderSearchFilter } from '@/types/order';
import type { OrderStatus } from '@/types/app-member';
import { useOrderList, useOrderStats, useOrdersForExport } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { auditService } from '@/services/auditService';
import { downloadOrdersExcel } from '@/utils/excel';
import { maskName } from '@/utils/mask';

// 상태별 뱃지 variant
const STATUS_BADGE_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'success' | 'warning' | 'critical' | 'info'> = {
  pending: 'warning',
  confirmed: 'info',
  preparing: 'info',
  ready: 'success',
  delivered: 'success',
  completed: 'success',
  cancelled: 'critical',
};

// 가맹점 목록 (mock)
const STORE_OPTIONS = [
  { value: '', label: '전체 가맹점' },
  { value: 'store-1', label: '강남점' },
  { value: 'store-2', label: '홍대점' },
  { value: 'store-3', label: '잠실점' },
  { value: 'store-4', label: '신촌점' },
  { value: 'store-5', label: '건대점' },
];

export function OrderList() {
  usePageViewLog('orders');
  const navigate = useNavigate();

  // 필터 상태
  const [keyword, setKeyword] = useState('');
  const [orderType, setOrderDeliveryType] = useState<OrderDeliveryType | ''>('');
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [storeId, setStoreId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // 자동 업데이트 간격 (ms, false=끔)
  const [refreshInterval, setRefreshInterval] = useState<number | false>(60000);

  const REFRESH_OPTIONS: { value: number | false; label: string }[] = [
    { value: false, label: '수동' },
    { value: 30000, label: '30초' },
    { value: 60000, label: '1분' },
    { value: 180000, label: '3분' },
    { value: 300000, label: '5분' },
  ];

  // 필터 params 빌드
  const searchParams = useMemo<OrderSearchFilter>(() => {
    const params: OrderSearchFilter = { page, limit: 10 };
    if (keyword) params.keyword = keyword;
    if (orderType) params.orderType = orderType;
    if (status) params.status = status;
    if (storeId) params.storeId = storeId;
    if (dateFrom) params.dateFrom = new Date(dateFrom);
    if (dateTo) params.dateTo = new Date(dateTo);
    return params;
  }, [keyword, orderType, status, storeId, dateFrom, dateTo, page]);

  // 엑셀용 필터 (페이지네이션 없음)
  const exportParams = useMemo(() => {
    const params: Omit<OrderSearchFilter, 'page' | 'limit'> = {};
    if (keyword) params.keyword = keyword;
    if (orderType) params.orderType = orderType;
    if (status) params.status = status;
    if (storeId) params.storeId = storeId;
    if (dateFrom) params.dateFrom = new Date(dateFrom);
    if (dateTo) params.dateTo = new Date(dateTo);
    return params;
  }, [keyword, orderType, status, storeId, dateFrom, dateTo]);

  // 서버사이드 훅
  const { data: orderListData, isLoading, refetch: refetchOrders } = useOrderList(searchParams, { refetchInterval: refreshInterval });
  const { data: statsData } = useOrderStats();
  const { refetch: fetchExportData } = useOrdersForExport(exportParams);

  const orders = orderListData?.data ?? [];
  const pagination = orderListData?.pagination;
  const stats = statsData?.data;

  // 신규 주문 깜박임 효과: 이전 ID 목록과 비교하여 새로 추가된 주문 감지
  const prevOrderIdsRef = useRef<Set<string> | null>(null);
  const [flashingIds, setFlashingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));

    if (prevOrderIdsRef.current !== null) {
      const newIds = new Set<string>();
      for (const id of currentIds) {
        if (!prevOrderIdsRef.current.has(id)) {
          newIds.add(id);
        }
      }
      if (newIds.size > 0) {
        setFlashingIds(newIds);
        // 애니메이션 종료 후 상태 해제
        const timer = setTimeout(() => setFlashingIds(new Set()), 1500);
        return () => clearTimeout(timer);
      }
    }

    prevOrderIdsRef.current = currentIds;
  }, [orders]);

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

  // 엑셀 다운로드
  const handleExcelDownload = async () => {
    const { user } = useAuthStore.getState();
    const result = await fetchExportData();
    if (result.data?.data) {
      downloadOrdersExcel(result.data.data);

      auditService.log({
        action: 'DATA_EXPORT',
        resource: 'orders',
        userId: user?.id ?? 'anonymous',
        details: { count: result.data.data.length },
      });
    }
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setKeyword('');
    setOrderDeliveryType('');
    setStatus('');
    setStoreId('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <ShoppingCartOutlined className="text-lg text-primary" />
              </div>
              <div>
                <p className="text-xs text-txt-muted">전체 주문</p>
                <p className="text-xl font-bold text-txt-main">{stats?.totalOrders ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <ClockCircleOutlined className="text-lg text-warning" />
              </div>
              <div>
                <p className="text-xs text-txt-muted">대기 중</p>
                <p className="text-xl font-bold text-txt-main">{stats?.pendingOrders ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircleOutlined className="text-lg text-success" />
              </div>
              <div>
                <p className="text-xs text-txt-muted">오늘 완료</p>
                <p className="text-xl font-bold text-txt-main">{stats?.completedToday ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-critical/10 flex items-center justify-center">
                <CloseCircleOutlined className="text-lg text-critical" />
              </div>
              <div>
                <p className="text-xs text-txt-muted">오늘 취소</p>
                <p className="text-xl font-bold text-txt-main">{stats?.cancelledToday ?? 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 필터 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-txt-main flex items-center gap-2">
              <SearchOutlined />
              주문 검색
            </h3>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={handleResetFilters}>
                초기화
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExcelDownload}
              >
                <DownloadOutlined className="mr-1" />
                엑셀 다운로드
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 기간 */}
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

            {/* 주문유형 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">주문유형</label>
              <select
                value={orderType}
                onChange={(e) => { setOrderDeliveryType(e.target.value as OrderDeliveryType | ''); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">전체</option>
                {Object.entries(ORDER_DELIVERY_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">상태</label>
              <select
                value={status}
                onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">전체</option>
                {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 가맹점 */}
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

            {/* 키워드 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">검색</label>
              <SearchInput
                value={keyword}
                onChange={setKeyword}
                placeholder="주문번호, 이름, 연락처, 주소, 매장명, 메뉴명"
                onSearch={() => setPage(1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 주문 목록 테이블 */}
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
                  onClick={() => refetchOrders()}
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
            columns={[
              { key: 'orderNumber', header: '주문번호', render: (order) => <span className="font-mono text-xs text-primary">{order.orderNumber}</span> },
              { key: 'orderDate', header: '일시', render: (order) => <span className="text-txt-sub whitespace-nowrap">{formatDate(order.orderDate)}</span> },
              { key: 'orderType', header: '유형', render: (order) => <Badge variant="secondary">{ORDER_DELIVERY_TYPE_LABELS[order.orderType]}</Badge> },
              { key: 'memberName', header: '주문자', render: (order) => <span className="text-txt-main">{maskName(order.memberName)}</span> },
              { key: 'storeName', header: '가맹점', render: (order) => <span className="text-txt-sub">{order.storeName}</span> },
              { key: 'items', header: '메뉴', render: (order) => <span className="text-txt-sub max-w-[200px] truncate block">{getMenuSummary(order.items)}</span> },
              { key: 'totalAmount', header: '결제금액', className: 'text-right', render: (order) => <span className="font-medium text-txt-main whitespace-nowrap">{formatCurrency(order.totalAmount)}</span> },
              { key: 'paymentMethod', header: '결제수단', render: (order) => <span className="text-txt-sub text-xs">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</span> },
              { key: 'status', header: '상태', className: 'text-center', render: (order) => <Badge variant={STATUS_BADGE_VARIANT[order.status]}>{ORDER_STATUS_LABELS[order.status]}</Badge> },
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
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
