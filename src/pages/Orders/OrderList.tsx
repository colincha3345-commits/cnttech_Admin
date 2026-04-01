import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { usePageViewLog } from '@/hooks/useActivityLog';
import type { OrderDeliveryType, OrderSearchFilter } from '@/types/order';
import type { OrderStatus } from '@/types/app-member';
import { useOrderList, useOrderStats, useOrdersForExport } from '@/hooks';
import { useAuthStore } from '@/stores/authStore';
import { auditService } from '@/services/auditService';
import { downloadOrdersExcel } from '@/utils/excel';

import { OrderStatsCards } from './components/OrderStatsCards';
import { OrderSearchFilter as OrderSearchFilterComponent } from './components/OrderSearchFilter';
import { OrderTable } from './components/OrderTable';

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
  const [limit, setLimit] = useState(10);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortKey(key);
    setSortOrder(order);
    setPage(1);
  };

  // 자동 업데이트 간격 (ms, false=끔)
  const [refreshInterval, setRefreshInterval] = useState<number | false>(60000);

  // 필터 params 빌드
  const searchParams = useMemo<OrderSearchFilter>(() => {
    const params: OrderSearchFilter = { page, limit };
    if (keyword) params.keyword = keyword;
    if (orderType) params.orderType = orderType;
    if (status) params.status = status;
    if (storeId) params.storeId = storeId;
    if (dateFrom) params.dateFrom = new Date(dateFrom);
    if (dateTo) params.dateTo = new Date(dateTo);
    return params;
  }, [keyword, orderType, status, storeId, dateFrom, dateTo, page, limit]);

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
      <OrderStatsCards stats={stats} />

      {/* 검색 필터 */}
      <OrderSearchFilterComponent
        keyword={keyword}
        setKeyword={setKeyword}
        orderType={orderType}
        setOrderType={setOrderDeliveryType}
        status={status}
        setStatus={setStatus}
        storeId={storeId}
        setStoreId={setStoreId}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        onSearch={() => setPage(1)}
        onReset={handleResetFilters}
        onExcelDownload={handleExcelDownload}
      />

      {/* 주문 목록 테이블 */}
      <OrderTable
        orders={orders}
        isLoading={isLoading}
        pagination={pagination}
        stats={stats}
        sortKey={sortKey}
        sortOrder={sortOrder}
        onSort={handleSort}
        page={page}
        setPage={setPage}
        limit={limit}
        setLimit={setLimit}
        refreshInterval={refreshInterval}
        setRefreshInterval={setRefreshInterval}
        onRefresh={() => refetchOrders()}
        flashingIds={flashingIds}
        onRowClick={(id) => navigate(`/orders/${id}`)}
      />
    </div>
  );
}
