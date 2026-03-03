import type { OrderMenuItem, OrderDiscount, PaymentMethod } from './order';

export type SettlementStatus = 'pending' | 'calculated' | 'completed' | 'on_hold';

export interface Settlement {
    id: string;
    storeId: string;
    storeName: string;
    period: string; // "2024-02-01 ~ 2024-02-15"
    totalSales: number;
    deliveryFee: number;
    promotionDiscount: number; // 총 할인액
    hqSupport: number; // 본사 지원 할인금 (정산시 수입으로 합산)
    pointsUsed: number; // 포인트 사용액
    couponsUsed: number; // 쿠폰 사용액
    vouchersUsed: number; // 교환권/상품권 사용액
    platformFee: number; // 플랫폼 수수료
    netAmount: number; // 최종 실 정산액
    status: SettlementStatus;
    paymentDate?: string;
    orderCount: number;
    createdAt: string;
}

export interface SettlementOrderItem {
    orderId: string;
    orderNumber: string;
    orderDate: string;
    menus: OrderMenuItem[];
    totalAmount: number;
    discount: OrderDiscount;
    paymentMethod: PaymentMethod;
    netAmount: number; // 실제 정산 대상액 (쿠폰/포인트 정산 규정에 따름)
}

export interface SettlementDetailData extends Settlement {
    orders: SettlementOrderItem[];
}
