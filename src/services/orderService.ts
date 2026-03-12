/**
 * 주문관리 서비스
 */
import { mockOrders } from '@/lib/api/mockOrderData';
import type {
  Order,
  OrderSearchFilter,
  OrderStats,
  OrderCancelRequest,
  OrderMemoRequest,
  PaymentItemCancelRequest,
  PaymentItemStatus,
  DiscountCancelType,
} from '@/types/order';
import type { OrderStatus } from '@/types/app-member';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

class OrderService {
  private orders: Order[] = [...mockOrders];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /** 주문 목록 조회 (필터 + 페이지네이션) */
  async getOrders(
    params?: OrderSearchFilter
  ): Promise<{ data: Order[]; pagination: Pagination }> {
    await this.delay();
    const { keyword = '', page = 1, limit = 20, dateFrom, dateTo, orderType, status, storeId } = params || {};

    let result = [...this.orders];

    // 기간 필터
    if (dateFrom) {
      result = result.filter((o) => o.orderDate >= dateFrom);
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter((o) => o.orderDate <= endOfDay);
    }

    // 주문 유형 필터
    if (orderType) {
      result = result.filter((o) => o.orderType === orderType);
    }

    // 상태 필터
    if (status) {
      result = result.filter((o) => o.status === status);
    }

    // 가맹점 필터
    if (storeId) {
      result = result.filter((o) => o.storeId === storeId);
    }

    // 키워드 전체검색 (주문번호, 주문자명, 전화번호, 매장명, 배달주소, 메뉴명)
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter((o) => matchOrderKeyword(o, lower));
    }

    // 최신 주문순 정렬
    result.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    return {
      data: result.slice(startIndex, startIndex + limit),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  /** 주문 상세 조회 */
  async getOrderById(id: string): Promise<{ data: Order }> {
    await this.delay();
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new Error('주문을 찾을 수 없습니다.');
    return { data: order };
  }

  /** 전체 주문 조회 (엑셀 다운로드용, 페이지네이션 없음) */
  async getAllOrders(
    params?: Omit<OrderSearchFilter, 'page' | 'limit'>
  ): Promise<{ data: Order[] }> {
    await this.delay();
    const { keyword = '', dateFrom, dateTo, orderType, status, storeId } = params || {};

    let result = [...this.orders];

    if (dateFrom) {
      result = result.filter((o) => o.orderDate >= dateFrom);
    }
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      result = result.filter((o) => o.orderDate <= endOfDay);
    }
    if (orderType) {
      result = result.filter((o) => o.orderType === orderType);
    }
    if (status) {
      result = result.filter((o) => o.status === status);
    }
    if (storeId) {
      result = result.filter((o) => o.storeId === storeId);
    }
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter((o) => matchOrderKeyword(o, lower));
    }

    result.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
    return { data: result };
  }

  /** 주문 통계 */
  async getStats(): Promise<{ data: OrderStats }> {
    await this.delay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = this.orders.filter((o) => o.orderDate >= today);

    return {
      data: {
        totalOrders: this.orders.length,
        pendingOrders: this.orders.filter((o) => o.status === 'pending').length,
        completedToday: todayOrders.filter((o) => o.status === 'completed').length,
        cancelledToday: todayOrders.filter((o) => o.status === 'cancelled').length,
        todayRevenue: todayOrders
          .filter((o) => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.totalAmount, 0),
      },
    };
  }

  /** 주문 취소 (pending/confirmed 상태만 가능) */
  async cancelOrder(
    id: string,
    request: OrderCancelRequest
  ): Promise<{ data: Order }> {
    await this.delay();
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new Error('주문을 찾을 수 없습니다.');

    if (order.status !== 'pending' && order.status !== 'confirmed') {
      throw new Error('결제 대기 또는 주문 확인 상태에서만 취소할 수 있습니다.');
    }

    const now = new Date();
    const updatedOrder: Order = {
      ...order,
      status: 'cancelled',
      cancelInfo: {
        reason: request.reason,
        reasonDetail: request.reasonDetail,
        cancelledBy: '관리자',
        cancelledAt: now,
      },
      // 복합결제 시 모든 결제수단도 일괄 취소
      payments: order.payments?.map((p) => ({
        ...p,
        status: 'cancelled' as PaymentItemStatus,
        cancelInfo: {
          reason: request.reason,
          reasonDetail: request.reasonDetail,
          cancelledBy: '관리자',
          cancelledAt: now,
        },
      })),
      updatedAt: now,
    };

    this.orders = this.orders.map((o) => (o.id === id ? updatedOrder : o));
    return { data: updatedOrder };
  }

  /** 개별 결제수단 취소 (복합결제) */
  async cancelPaymentItem(
    orderId: string,
    request: PaymentItemCancelRequest
  ): Promise<{ data: Order }> {
    await this.delay();
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('주문을 찾을 수 없습니다.');
    if (!order.payments) throw new Error('복합결제 주문만 개별 취소가 가능합니다.');

    const paymentItem = order.payments.find((p) => p.id === request.paymentItemId);
    if (!paymentItem) throw new Error('결제 항목을 찾을 수 없습니다.');
    if (paymentItem.status !== 'paid') throw new Error('결제완료 상태의 결제수단만 취소할 수 있습니다.');

    const now = new Date();
    const updatedPayments = order.payments.map((p) =>
      p.id === request.paymentItemId
        ? {
            ...p,
            status: 'cancelled' as PaymentItemStatus,
            cancelInfo: {
              reason: request.reason,
              reasonDetail: request.reasonDetail,
              cancelledBy: '관리자',
              cancelledAt: now,
            },
          }
        : p
    );

    const allCancelled = updatedPayments.every((p) => p.status === 'cancelled');

    const updatedOrder: Order = {
      ...order,
      payments: updatedPayments,
      status: allCancelled ? 'cancelled' : order.status,
      cancelInfo: allCancelled
        ? { reason: request.reason, reasonDetail: '개별 결제수단 전체 취소', cancelledBy: '관리자', cancelledAt: now }
        : order.cancelInfo,
      updatedAt: now,
    };

    this.orders = this.orders.map((o) => (o.id === orderId ? updatedOrder : o));
    return { data: updatedOrder };
  }

  /** 주문 상태 변경 */
  async updateOrderStatus(
    id: string,
    status: OrderStatus
  ): Promise<{ data: Order }> {
    await this.delay();
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new Error('주문을 찾을 수 없습니다.');

    const updatedOrder: Order = {
      ...order,
      status,
      updatedAt: new Date(),
    };

    this.orders = this.orders.map((o) => (o.id === id ? updatedOrder : o));
    return { data: updatedOrder };
  }

  /** 쿠폰/제휴할인 취소 */
  async cancelDiscountItem(
    orderId: string,
    type: DiscountCancelType
  ): Promise<{ data: Order }> {
    await this.delay();
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) throw new Error('주문을 찾을 수 없습니다.');
    if (order.status === 'cancelled') throw new Error('취소된 주문은 할인 취소가 불가능합니다.');

    const now = new Date();
    const discount = { ...order.discount };

    if (type === 'coupon') {
      if (discount.couponCancelled) throw new Error('이미 쿠폰 할인이 취소되었습니다.');
      discount.couponCancelled = true;
      discount.couponCancelledAt = now;
      discount.couponCancelledBy = '관리자';
    } else {
      if (discount.affiliateDiscountCancelled) throw new Error('이미 제휴할인이 취소되었습니다.');
      discount.affiliateDiscountCancelled = true;
      discount.affiliateDiscountCancelledAt = now;
      discount.affiliateDiscountCancelledBy = '관리자';
    }

    // 할인 취소분 총결제금액에 반영
    const cancelledAmount = type === 'coupon' ? discount.couponAmount : (discount.affiliateDiscount ?? 0);
    const updatedOrder: Order = {
      ...order,
      discount,
      totalAmount: order.totalAmount + cancelledAmount,
      updatedAt: now,
    };

    this.orders = this.orders.map((o) => (o.id === orderId ? updatedOrder : o));
    return { data: updatedOrder };
  }

  /** 주문 메모 추가 */
  async addMemo(
    id: string,
    request: OrderMemoRequest
  ): Promise<{ data: Order }> {
    await this.delay();
    const order = this.orders.find((o) => o.id === id);
    if (!order) throw new Error('주문을 찾을 수 없습니다.');

    const newMemo = {
      id: `memo-${Date.now()}`,
      content: request.content,
      createdBy: '관리자',
      createdAt: new Date(),
    };

    const updatedOrder: Order = {
      ...order,
      memos: [...order.memos, newMemo],
      updatedAt: new Date(),
    };

    this.orders = this.orders.map((o) => (o.id === id ? updatedOrder : o));
    return { data: updatedOrder };
  }
}

/** 주문 키워드 전체검색 (주문번호, 이름, 연락처, 매장명, 배달주소, 메뉴명) */
function matchOrderKeyword(order: Order, keyword: string): boolean {
  return (
    order.orderNumber.toLowerCase().includes(keyword) ||
    order.memberName.toLowerCase().includes(keyword) ||
    order.memberPhone.includes(keyword) ||
    order.storeName.toLowerCase().includes(keyword) ||
    (order.deliveryAddress?.toLowerCase().includes(keyword) ?? false) ||
    order.items.some((item) => item.productName.toLowerCase().includes(keyword))
  );
}

export const orderService = new OrderService();
