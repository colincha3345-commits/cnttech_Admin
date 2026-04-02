import type { OrderMenuItem, OrderDiscount, PaymentMethod, OrderDeliveryType } from './order';

export type SettlementStatus = 'pending' | 'completed';

// ============================================
// 정산 상세 분류 타입
// ============================================

/** 브랜드/가맹점 부담 분리 */
export interface BurdenSplit {
    brand: number;
    franchise: number;
    total: number;
}

/** 교환권 정산 (금액권/교환권 분리) */
export interface VoucherSettlement {
    giftCard: number;    // 금액권
    exchange: number;    // 교환권
}

/** PG수수료 상세 */
export interface PgFeeDetail {
    pg: number;
    easyPay: number;
    pgTotal: number;
    cnt: number;
}

/** 주문중개수수료 */
export interface OrderBrokerFee {
    brand: number;
    orderTotal: number;
}

// ============================================
// 정산 요약
// ============================================

export interface Settlement {
    id: string;
    storeId: string;
    storeName: string;
    period: string;
    totalSales: number;          // 정상가합계
    deliveryFee: number;         // 배달비 합계
    deliveryFeeBurden: BurdenSplit; // 배달비 부담 (브랜드/가맹점)
    couponUsed: number;          // 쿠폰 사용 합계
    couponBurden: BurdenSplit;   // 쿠폰 부담 (브랜드/가맹점)
    pointsUsed: number;
    eventDiscount: number;       // 이벤트 할인 합계
    eventDiscountBurden: BurdenSplit; // 이벤트 할인 부담
    voucherSettlement: VoucherSettlement; // 금액권/교환권
    totalPaymentAmount: number;  // 총결제금액
    pgFeeDetail: PgFeeDetail;
    orderBrokerFee: OrderBrokerFee;
    netAmount: number;           // 최종 정산액
    status: SettlementStatus;
    paymentDate?: string;
    orderCount: number;
    createdAt: string;
}

// ============================================
// 주문별 정산 항목
// ============================================

export interface SettlementOrderItem {
    orderId: string;
    orderNumber: string;
    orderDate: string;
    menus: OrderMenuItem[];
    discount: OrderDiscount;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerPhone: string;
    orderType: OrderDeliveryType;
    deliveryAddress?: string;
    // 정산 컬럼
    regularPriceTotal: number;       // 정상가합계
    eventDiscountBurden: BurdenSplit; // 이벤트 할인부담
    deliveryFee: number;
    deliveryFeeBurden: BurdenSplit;   // 배달비 부담
    couponAmount: number;
    couponBurden: BurdenSplit;       // 쿠폰 부담
    pointUsed: number;
    voucherSettlement: VoucherSettlement; // 금액권/교환권
    totalPaymentAmount: number;      // 총결제금액
    pgFeeDetail: PgFeeDetail;
    orderBrokerFee: OrderBrokerFee;
    netAmount: number;               // 정산금액
}

export interface SettlementDetailData extends Settlement {
    orders: SettlementOrderItem[];
}
