import React, { useState } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';

import { Card, Badge, Input, Pagination } from '@/components/ui';
import { useMemberOrders } from '@/hooks';
import {
  ORDER_STATUS_LABELS,
  MEMBER_ORDER_TYPE_LABELS,
} from '@/types/app-member';
import type { OrderStatus } from '@/types/app-member';

interface OrderHistoryTabProps {
  memberId: string;
}

export const OrderHistoryTab: React.FC<OrderHistoryTabProps> = ({ memberId }) => {
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(10);

  const { orders, pagination, isLoading } = useMemberOrders({
    memberId,
    status: statusFilter || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit,
  });

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 주문 상태별 Badge 색상
  const getStatusBadgeVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
      case 'preparing':
        return 'info';
      case 'ready':
      case 'delivered':
        return 'success';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  // 주문 상세 토글
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  return (
    <div className="p-6 space-y-4">
      {/* 필터 */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">상태:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 날짜 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">기간:</span>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="h-9 w-36"
            />
            <span className="text-txt-muted">~</span>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="h-9 w-36"
            />
          </div>
        </div>
      </Card>

      {/* 주문 목록 */}
      <Card>
        <div className="divide-y divide-border">
          {isLoading ? (
            <div className="text-center py-12 text-txt-muted">로딩 중...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 text-txt-muted">주문 내역이 없습니다.</div>
          ) : (
            orders.map((order) => (
              <div key={order.id}>
                {/* 주문 헤더 */}
                <div
                  className="p-4 cursor-pointer hover:bg-bg-hover transition-colors"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button className="text-txt-muted">
                        {expandedOrders.has(order.id) ? (
                          <DownOutlined />
                        ) : (
                          <RightOutlined />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-txt-main">
                            {order.orderNumber}
                          </span>
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {ORDER_STATUS_LABELS[order.status]}
                          </Badge>
                          <Badge variant="secondary">
                            {MEMBER_ORDER_TYPE_LABELS[order.orderType]}
                          </Badge>
                        </div>
                        <p className="text-sm text-txt-muted mt-1">
                          {formatDate(order.orderDate)} · {order.storeName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-txt-main">
                        {formatCurrency(order.finalAmount)}원
                      </p>
                      {order.discountAmount > 0 && (
                        <p className="text-xs text-critical">
                          -{formatCurrency(order.discountAmount)}원 할인
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 주문 상세 (확장됐을 때) */}
                {expandedOrders.has(order.id) && (
                  <div className="px-4 pb-4 bg-bg-hover/50">
                    <div className="ml-8 p-4 rounded-lg bg-bg-card border border-border">
                      <h4 className="text-sm font-medium text-txt-main mb-3">
                        주문 상품 ({order.items.length}개)
                      </h4>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-start text-sm"
                          >
                            <div>
                              <p className="text-txt-main">{item.productName}</p>
                              {item.options.length > 0 && (
                                <p className="text-xs text-txt-muted">
                                  옵션: {item.options.join(', ')}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-txt-main">
                                {formatCurrency(item.price)}원
                              </p>
                              <p className="text-xs text-txt-muted">
                                x{item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4 pt-3 border-t border-border">
                        <div className="flex justify-between text-sm">
                          <span className="text-txt-muted">상품 금액</span>
                          <span className="text-txt-main">
                            {formatCurrency(order.totalAmount)}원
                          </span>
                        </div>
                        {order.discountAmount > 0 && (
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-txt-muted">할인 금액</span>
                            <span className="text-critical">
                              -{formatCurrency(order.discountAmount)}원
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm mt-1 font-bold">
                          <span className="text-txt-main">결제 금액</span>
                          <span className="text-primary">
                            {formatCurrency(order.finalAmount)}원
                          </span>
                        </div>
                        <p className="text-xs text-txt-muted mt-2">
                          결제 수단: {order.paymentMethod}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          totalElements={pagination.total}
          limit={limit}
          onLimitChange={setLimit}
          unit="건"
        />
      </Card>
    </div>
  );
};
