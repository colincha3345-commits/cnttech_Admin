import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  Input,
} from '@/components/ui';
import {
  ORDER_DELIVERY_TYPE_LABELS,
  ORDER_CHANNEL_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
  CANCEL_REASON_LABELS,
  CASH_RECEIPT_TYPE_LABELS,
} from '@/types';
import type { CancelReasonType, OrderPaymentItem, ECouponType } from '@/types/order';
import { E_COUPON_TYPE_LABELS } from '@/types/order';
import { emailService } from '@/services/emailService';
import type { OrderStatus } from '@/types/app-member';
import { useOrder, useCancelOrder, useCancelPaymentItem, useAddOrderMemo, useUpdateOrderStatus } from '@/hooks';
import { useToast } from '@/hooks/useToast';

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

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: orderData, isLoading } = useOrder(id);
  const cancelOrderMutation = useCancelOrder();
  const cancelPaymentItemMutation = useCancelPaymentItem();
  const addMemoMutation = useAddOrderMemo();
  const updateStatusMutation = useUpdateOrderStatus();

  const order = orderData?.data;

  // 메모 입력
  const [memoContent, setMemoContent] = useState('');

  // 전체 취소 모달
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReasonType>('customer_request');
  const [cancelDetail, setCancelDetail] = useState('');

  // 개별 결제수단 취소 모달
  const [paymentCancelModalOpen, setPaymentCancelModalOpen] = useState(false);
  const [targetPaymentItem, setTargetPaymentItem] = useState<OrderPaymentItem | null>(null);
  const [paymentCancelReason, setPaymentCancelReason] = useState<CancelReasonType>('customer_request');
  const [paymentCancelDetail, setPaymentCancelDetail] = useState('');

  // 핀번호 보기 토글
  const [revealedPinIds, setRevealedPinIds] = useState<Set<string>>(new Set());

  // 금액 포맷 (원 단위 표시)
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('ko-KR').format(amount) + '원';

  // 금액 포맷 (숫자만)
  const formatNumber = (amount: number) =>
    new Intl.NumberFormat('ko-KR').format(amount);

  // 날짜 포맷
  const formatDateTime = (date: Date) =>
    new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  // 핀번호 마스킹 (마지막 4자리만 노출)
  const maskPinNumber = (pin: string) => {
    if (pin.length <= 4) return pin;
    return pin.slice(0, -4).replace(/[0-9]/g, '*') + pin.slice(-4);
  };

  const togglePinReveal = (eCouponId: string) => {
    setRevealedPinIds((prev) => {
      const next = new Set(prev);
      if (next.has(eCouponId)) next.delete(eCouponId);
      else next.add(eCouponId);
      return next;
    });
  };

  // 메모 추가
  const handleAddMemo = () => {
    if (!id || !memoContent.trim()) return;
    addMemoMutation.mutate(
      { id, request: { content: memoContent.trim() } },
      {
        onSuccess: () => {
          setMemoContent('');
          toast.success('메모가 추가되었습니다.');
        },
      }
    );
  };

  // 주문 취소
  const handleCancelOrder = () => {
    if (!id) return;
    cancelOrderMutation.mutate(
      { id, request: { reason: cancelReason, reasonDetail: cancelDetail || undefined } },
      {
        onSuccess: () => {
          setCancelModalOpen(false);
          setCancelDetail('');
          toast.success('주문이 취소되었습니다.');
        },
        onError: (error) => {
          toast.error(error instanceof Error ? error.message : '주문 취소에 실패했습니다.');
        },
      }
    );
  };

  // 개별 결제수단 취소
  const handleCancelPaymentItem = () => {
    if (!id || !targetPaymentItem) return;
    cancelPaymentItemMutation.mutate(
      {
        orderId: id,
        request: {
          paymentItemId: targetPaymentItem.id,
          reason: paymentCancelReason,
          reasonDetail: paymentCancelDetail || undefined,
        },
      },
      {
        onSuccess: () => {
          setPaymentCancelModalOpen(false);
          setTargetPaymentItem(null);
          setPaymentCancelDetail('');
          toast.success(`${targetPaymentItem.label} 결제가 취소되었습니다.`);
        },
        onError: (error) => {
          const errorMsg = error instanceof Error ? error.message : '결제 취소에 실패했습니다.';
          toast.error(errorMsg);

          // e쿠폰(금액권/교환권) 취소 실패 시 쿠폰사에 자동 이메일 발송
          const isECoupon = targetPaymentItem.method === 'voucher' || targetPaymentItem.method === 'exchange';
          if (isECoupon && targetPaymentItem.couponCompany && targetPaymentItem.pinNumber && order) {
            const result = emailService.sendECouponCancelFailEmail({
              orderDate: order.orderDate,
              couponNumber: targetPaymentItem.pinNumber,
              couponCompany: targetPaymentItem.couponCompany,
              eCouponName: targetPaymentItem.eCouponName ?? targetPaymentItem.label,
              eCouponType: targetPaymentItem.method as ECouponType,
              orderId: order.id,
              orderNumber: order.orderNumber,
            });
            if (result.success) {
              toast.info(`취소 실패 알림 이메일이 ${targetPaymentItem.couponCompany}(${result.to})로 발송되었습니다.`);
            } else {
              toast.warning(`쿠폰사 이메일이 등록되어 있지 않아 자동 발송에 실패했습니다.`);
            }
          }
        },
      }
    );
  };

  // 상태 변경
  const handleStatusChange = (newStatus: OrderStatus) => {
    if (!id) return;
    updateStatusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`주문 상태가 '${ORDER_STATUS_LABELS[newStatus]}'(으)로 변경되었습니다.`);
        },
      }
    );
  };

  // 개별 결제수단 액션 렌더링
  const renderPaymentItemAction = (payItem: OrderPaymentItem) => {
    if (payItem.status === 'cancelled') {
      return <Badge variant="critical" className="!bg-transparent border border-[#FF3B30]">취소완료</Badge>;
    }
    if (payItem.status === 'paid' && order?.status !== 'cancelled') {
      return (
        <Button
          variant="danger"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setTargetPaymentItem(payItem);
            setPaymentCancelReason('customer_request');
            setPaymentCancelDetail('');
            setPaymentCancelModalOpen(true);
          }}
        >
          취소
        </Button>
      );
    }
    return null;
  };

  // 취소 가능 여부
  const canCancel = order?.status === 'pending' || order?.status === 'confirmed';

  // 다음 상태 추천
  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const flow: Partial<Record<OrderStatus, OrderStatus>> = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
      delivered: 'completed',
    };
    return flow[currentStatus] ?? null;
  };

  if (isLoading) {
    return <div className="text-center py-12 text-txt-muted">로딩 중...</div>;
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-txt-muted mb-4">주문을 찾을 수 없습니다.</p>
        <Button variant="outline" onClick={() => navigate('/orders')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
            <ArrowLeftOutlined />
          </Button>
          <div>
            <h2 className="text-lg font-bold text-txt-main">{order.orderNumber}</h2>
            <p className="text-xs text-txt-muted">{formatDateTime(order.orderDate)}</p>
          </div>
          <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
            {ORDER_STATUS_LABELS[order.status]}
          </Badge>
        </div>
        <div className="flex gap-2">
          {nextStatus && order.status !== 'cancelled' && order.status !== 'completed' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleStatusChange(nextStatus)}
              disabled={updateStatusMutation.isPending}
            >
              {ORDER_STATUS_LABELS[nextStatus]}(으)로 변경
            </Button>
          )}
          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setCancelModalOpen(true)}
            >
              주문 취소
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 주문 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-txt-main">주문 기본 정보</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-txt-muted">주문유형</p>
                  <p className="text-sm font-medium text-txt-main mt-1">{ORDER_DELIVERY_TYPE_LABELS[order.orderType]}</p>
                </div>
                <div>
                  <p className="text-xs text-txt-muted">주문채널</p>
                  <p className="text-sm font-medium text-txt-main mt-1">{ORDER_CHANNEL_LABELS[order.channel]}</p>
                </div>
                <div>
                  <p className="text-xs text-txt-muted">가맹점</p>
                  <p className="text-sm font-medium text-txt-main mt-1">{order.storeName}</p>
                </div>
                <div>
                  <p className="text-xs text-txt-muted">결제수단</p>
                  <p className="text-sm font-medium text-txt-main mt-1">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
                </div>
              </div>
              {order.customerRequest && (
                <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <p className="text-xs text-txt-muted mb-1">고객 요청사항</p>
                  <p className="text-sm text-txt-main">{order.customerRequest}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 고객 정보 */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-txt-main">고객 정보</h3>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-center py-3 px-4 font-medium text-txt-muted">이름</th>
                    <th className="text-center py-3 px-4 font-medium text-txt-muted">연락처</th>
                    <th className="text-center py-3 px-4 font-medium text-txt-muted">배송지주소</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="text-center py-3 px-4 text-txt-main">{order.memberName}</td>
                    <td className="text-center py-3 px-4 text-txt-main">{order.memberPhone}</td>
                    <td className="text-center py-3 px-4 text-txt-main">{order.deliveryAddress || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* 메뉴 상세 */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-txt-main">주문 메뉴</h3>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-medium text-txt-muted">카테고리</th>
                    <th className="text-left py-2 px-3 font-medium text-txt-muted">메뉴명</th>
                    <th className="text-left py-2 px-3 font-medium text-txt-muted">옵션</th>
                    <th className="text-center py-2 px-3 font-medium text-txt-muted">수량</th>
                    <th className="text-right py-2 px-3 font-medium text-txt-muted">단가</th>
                    <th className="text-right py-2 px-3 font-medium text-txt-muted">소계</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="border-b border-border last:border-0">
                      <td className="py-2 px-3 text-txt-sub">{item.categoryName}</td>
                      <td className="py-2 px-3 text-txt-main font-medium">{item.productName}</td>
                      <td className="py-2 px-3 text-txt-muted text-xs">
                        {item.options.length > 0
                          ? item.options.map((o) => `${o.name}(+${formatCurrency(o.price)})`).join(', ')
                          : '-'}
                      </td>
                      <td className="py-2 px-3 text-center text-txt-main">{item.quantity}</td>
                      <td className="py-2 px-3 text-right text-txt-sub">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2 px-3 text-right text-txt-main font-medium">{formatCurrency(item.totalPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* 결제 내역 */}
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-txt-main">결제 내역</h3>
            </CardHeader>
            <CardContent className="p-0">
              {order.payments && order.payments.length > 0 ? (
                /* 복합결제 테이블 */
                <table className="w-full text-sm">
                  <tbody>
                    {/* 배달비 */}
                    <tr className="border-b border-border">
                      <td colSpan={2} className="py-3 px-4 text-txt-muted text-center">배달비</td>
                      <td className="py-3 px-4 text-txt-main text-center">{formatNumber(order.deliveryFee)}</td>
                      <td className="py-3 px-4 w-24"></td>
                    </tr>
                    {/* 할인 */}
                    <tr className="border-b border-border">
                      <td rowSpan={3} className="py-3 px-4 text-txt-muted text-center align-middle border-r border-border">할인</td>
                      <td className="py-3 px-4 text-txt-muted text-center border-r border-border">상품할인</td>
                      <td className="py-3 px-4 text-txt-main text-center">-{formatNumber(order.discount.productDiscount ?? 0)}</td>
                      <td className="py-3 px-4 w-24"></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-txt-muted text-center border-r border-border">할인쿠폰</td>
                      <td className="py-3 px-4 text-txt-main text-center">-{formatNumber(order.discount.couponAmount)}</td>
                      <td className="py-3 px-4 w-24"></td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-txt-muted text-center border-r border-border">제휴할인</td>
                      <td className="py-3 px-4 text-txt-main text-center">-{formatNumber(order.discount.affiliateDiscount ?? 0)}</td>
                      <td className="py-3 px-4 w-24"></td>
                    </tr>
                    {/* E쿠폰 금액권 */}
                    {(() => {
                      const vouchers = order.discount.eCoupons?.filter((ec) => ec.eCouponType === 'voucher') ?? [];
                      if (vouchers.length === 0) return null;
                      return vouchers.map((v, idx) => {
                        const payItem = order.payments?.find((p) => p.eCouponId === v.eCouponId);
                        const isRevealed = revealedPinIds.has(v.eCouponId);
                        return (
                          <tr key={`voucher-${idx}`} className="border-b border-border">
                            {idx === 0 && (
                              <td rowSpan={vouchers.length} className="py-3 px-4 text-txt-muted text-center align-middle border-r border-border">
                                {E_COUPON_TYPE_LABELS.voucher}
                              </td>
                            )}
                            <td className="py-3 px-4 text-txt-muted text-center border-r border-border">
                              <span>{v.couponCompany} - {v.eCouponName}</span>
                              <span className="block text-xs font-mono mt-0.5">
                                핀번호: {isRevealed ? v.pinNumber : maskPinNumber(v.pinNumber)}
                              </span>
                            </td>
                            <td className={`py-3 px-4 text-center ${payItem?.status === 'cancelled' ? 'line-through text-txt-muted' : 'text-txt-main'}`}>
                              -{formatNumber(v.amount)}
                            </td>
                            <td className="py-3 px-4 text-center w-32">
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  className="text-xs text-primary hover:underline"
                                  onClick={(e) => { e.stopPropagation(); togglePinReveal(v.eCouponId); }}
                                >
                                  {isRevealed ? '핀번호 숨기기' : '핀번호 보기'}
                                </button>
                                {payItem && renderPaymentItemAction(payItem)}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                    {/* E쿠폰 교환권 */}
                    {(() => {
                      const exchanges = order.discount.eCoupons?.filter((ec) => ec.eCouponType === 'exchange') ?? [];
                      if (exchanges.length === 0) return null;
                      return exchanges.map((v, idx) => {
                        const payItem = order.payments?.find((p) => p.eCouponId === v.eCouponId);
                        const isRevealed = revealedPinIds.has(v.eCouponId);
                        return (
                          <tr key={`exchange-${idx}`} className="border-b border-border">
                            {idx === 0 && (
                              <td rowSpan={exchanges.length} className="py-3 px-4 text-txt-muted text-center align-middle border-r border-border">
                                {E_COUPON_TYPE_LABELS.exchange}
                              </td>
                            )}
                            <td className="py-3 px-4 text-txt-muted text-center border-r border-border">
                              <span>{v.couponCompany} - {v.eCouponName}</span>
                              {v.productName && <span className="block text-xs">→ {v.productName}</span>}
                              <span className="block text-xs font-mono mt-0.5">
                                핀번호: {isRevealed ? v.pinNumber : maskPinNumber(v.pinNumber)}
                              </span>
                            </td>
                            <td className={`py-3 px-4 text-center ${payItem?.status === 'cancelled' ? 'line-through text-txt-muted' : 'text-txt-main'}`}>
                              -{formatNumber(v.amount)}
                            </td>
                            <td className="py-3 px-4 text-center w-32">
                              <div className="flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  className="text-xs text-primary hover:underline"
                                  onClick={(e) => { e.stopPropagation(); togglePinReveal(v.eCouponId); }}
                                >
                                  {isRevealed ? '핀번호 숨기기' : '핀번호 보기'}
                                </button>
                                {payItem && renderPaymentItemAction(payItem)}
                              </div>
                            </td>
                          </tr>
                        );
                      });
                    })()}
                    {/* 카드/간편결제 등 일반 결제수단 */}
                    {order.payments
                      .filter((p) => p.method !== 'voucher' && p.method !== 'exchange')
                      .map((payItem) => (
                        <tr key={payItem.id} className="border-b border-border">
                          <td colSpan={2} className="py-3 px-4 text-txt-muted text-center">{payItem.label}</td>
                          <td className={`py-3 px-4 text-center ${payItem.status === 'cancelled' ? 'line-through text-txt-muted' : 'text-txt-main'}`}>
                            {formatNumber(payItem.amount)}
                          </td>
                          <td className="py-3 px-4 text-center w-24">
                            {renderPaymentItemAction(payItem)}
                          </td>
                        </tr>
                      ))}
                    {/* 총결제금액 */}
                    <tr>
                      <td colSpan={2} className="py-3 px-4 text-txt-main text-center font-semibold">총결제금액</td>
                      <td className="py-3 px-4 text-txt-main text-center font-semibold">
                        {formatNumber(order.payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0))}
                      </td>
                      <td className="py-3 px-4 w-24"></td>
                    </tr>
                  </tbody>
                </table>
              ) : (
                /* 단일결제 테이블 (기존) */
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-border">
                      <td colSpan={2} className="py-3 px-4 text-txt-muted text-center">배달비</td>
                      <td className="py-3 px-4 text-txt-main text-center">{formatNumber(order.deliveryFee)}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td rowSpan={3} className="py-3 px-4 text-txt-muted text-center align-middle border-r border-border">할인</td>
                      <td className="py-3 px-4 text-txt-muted text-center border-r border-border">상품할인</td>
                      <td className="py-3 px-4 text-txt-main text-center">-{formatNumber(order.discount.productDiscount ?? 0)}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-txt-muted text-center border-r border-border">할인쿠폰</td>
                      <td className="py-3 px-4 text-txt-main text-center">-{formatNumber(order.discount.couponAmount)}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="py-3 px-4 text-txt-muted text-center border-r border-border">제휴할인</td>
                      <td className="py-3 px-4 text-txt-main text-center">-{formatNumber(order.discount.affiliateDiscount ?? 0)}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td colSpan={2} className="py-3 px-4 text-txt-muted text-center font-medium">E쿠폰</td>
                      <td className="py-3 px-4 text-txt-main text-center">-{formatNumber(order.discount.eCouponDiscount ?? 0)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="py-3 px-4 text-txt-main text-center font-semibold">총결제금액</td>
                      <td className="py-3 px-4 text-txt-main text-center font-semibold">{formatNumber(order.totalAmount)}</td>
                    </tr>
                  </tbody>
                </table>
              )}
              {order.cashReceipt.requested && (
                <div className="px-4 py-3 border-t border-border flex justify-between text-sm">
                  <span className="text-txt-muted">현금영수증</span>
                  <span className="text-txt-main">
                    {order.cashReceipt.type ? CASH_RECEIPT_TYPE_LABELS[order.cashReceipt.type] : ''} ({order.cashReceipt.number})
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 취소 정보 */}
          {order.cancelInfo && (
            <Card>
              <CardHeader>
                <h3 className="text-sm font-semibold text-critical">취소 정보</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-txt-muted">취소 사유</span>
                    <span className="text-txt-main">{CANCEL_REASON_LABELS[order.cancelInfo.reason]}</span>
                  </div>
                  {order.cancelInfo.reasonDetail && (
                    <div className="flex justify-between text-sm">
                      <span className="text-txt-muted">상세 사유</span>
                      <span className="text-txt-main">{order.cancelInfo.reasonDetail}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-txt-muted">처리자</span>
                    <span className="text-txt-main">{order.cancelInfo.cancelledBy}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-txt-muted">취소 일시</span>
                    <span className="text-txt-main">{formatDateTime(order.cancelInfo.cancelledAt)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 오른쪽: 메모 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h3 className="text-sm font-semibold text-txt-main">주문 메모</h3>
            </CardHeader>
            <CardContent>
              {/* 메모 목록 */}
              {order.memos.length === 0 ? (
                <p className="text-sm text-txt-muted text-center py-4">등록된 메모가 없습니다</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {order.memos.map((memo) => (
                    <div key={memo.id} className="p-3 bg-hover rounded-lg">
                      <p className="text-sm text-txt-main">{memo.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-txt-muted">
                        <ClockCircleOutlined />
                        <span>{formatDateTime(memo.createdAt)}</span>
                        <span>|</span>
                        <span>{memo.createdBy}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 메모 입력 */}
              <div className="flex gap-2">
                <Input
                  value={memoContent}
                  onChange={(e) => setMemoContent(e.target.value)}
                  placeholder="메모를 입력하세요"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddMemo();
                    }
                  }}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAddMemo}
                  disabled={!memoContent.trim() || addMemoMutation.isPending}
                >
                  <SendOutlined />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 취소 모달 */}
      {cancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationCircleOutlined className="text-xl text-critical" />
              <h3 className="text-lg font-semibold text-txt-main">주문 취소</h3>
            </div>

            <p className="text-sm text-txt-muted mb-4">
              주문번호 <span className="font-mono font-semibold text-txt-main">{order.orderNumber}</span>을 취소하시겠습니까?
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-txt-main mb-1">취소 사유</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value as CancelReasonType)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {Object.entries(CANCEL_REASON_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-txt-main mb-1">상세 사유 (선택)</label>
                <Input
                  value={cancelDetail}
                  onChange={(e) => setCancelDetail(e.target.value)}
                  placeholder="상세 취소 사유를 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setCancelModalOpen(false)}>
                닫기
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelOrder}
                disabled={cancelOrderMutation.isPending}
              >
                {cancelOrderMutation.isPending ? '처리 중...' : '주문 취소'}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* 개별 결제수단 취소 모달 */}
      {paymentCancelModalOpen && targetPaymentItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ExclamationCircleOutlined className="text-xl text-critical" />
              <h3 className="text-lg font-semibold text-txt-main">개별 결제 취소</h3>
            </div>

            <div className="p-3 bg-hover rounded-lg mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-txt-muted">결제수단</span>
                <span className="text-txt-main font-medium">{targetPaymentItem.label}</span>
              </div>
              {targetPaymentItem.couponCompany && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-txt-muted">쿠폰사</span>
                  <span className="text-txt-main">{targetPaymentItem.couponCompany}</span>
                </div>
              )}
              {targetPaymentItem.eCouponName && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-txt-muted">쿠폰명</span>
                  <span className="text-txt-main">{targetPaymentItem.eCouponName}</span>
                </div>
              )}
              {targetPaymentItem.pinNumber && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-txt-muted">핀번호</span>
                  <span className="text-txt-main font-mono">{targetPaymentItem.pinNumber}</span>
                </div>
              )}
              <div className="flex justify-between text-sm mt-1">
                <span className="text-txt-muted">결제금액</span>
                <span className="text-txt-main font-medium">{formatCurrency(targetPaymentItem.amount)}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-txt-main mb-1">취소 사유</label>
                <select
                  value={paymentCancelReason}
                  onChange={(e) => setPaymentCancelReason(e.target.value as CancelReasonType)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {Object.entries(CANCEL_REASON_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-txt-main mb-1">상세 사유 (선택)</label>
                <Input
                  value={paymentCancelDetail}
                  onChange={(e) => setPaymentCancelDetail(e.target.value)}
                  placeholder="상세 취소 사유를 입력하세요"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => setPaymentCancelModalOpen(false)}>
                닫기
              </Button>
              <Button
                variant="danger"
                onClick={handleCancelPaymentItem}
                disabled={cancelPaymentItemMutation.isPending}
              >
                {cancelPaymentItemMutation.isPending ? '처리 중...' : '결제 취소'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
