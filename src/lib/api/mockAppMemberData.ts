/**
 * 앱회원관리 Mock 데이터
 */
import type {
  AppUsageLog,
  MemberOrder,
  PointHistory,
  MemberCoupon,
  MemberVoucher,
  MemberNotification,
} from '@/types/app-member';

// ============================================
// 앱 사용 로그
// ============================================
export const mockAppUsageLogs: AppUsageLog[] = [
  // member-1 (김VIP) 로그
  {
    id: 'log-1',
    memberId: 'member-1',
    action: 'login',
    detail: '앱 로그인',
    deviceInfo: { os: 'ios', osVersion: '17.2', appVersion: '2.5.0', deviceModel: 'iPhone 15 Pro' },
    ipAddress: '192.168.1.100',
    createdAt: new Date('2026-02-09T09:30:00'),
  },
  {
    id: 'log-2',
    memberId: 'member-1',
    action: 'view_product',
    detail: '뿌링클 한마리 상품 조회',
    deviceInfo: { os: 'ios', osVersion: '17.2', appVersion: '2.5.0', deviceModel: 'iPhone 15 Pro' },
    ipAddress: '192.168.1.100',
    createdAt: new Date('2026-02-09T09:32:00'),
  },
  {
    id: 'log-3',
    memberId: 'member-1',
    action: 'add_cart',
    detail: '뿌링클 한마리 장바구니 추가',
    deviceInfo: { os: 'ios', osVersion: '17.2', appVersion: '2.5.0', deviceModel: 'iPhone 15 Pro' },
    ipAddress: '192.168.1.100',
    createdAt: new Date('2026-02-09T09:33:00'),
  },
  {
    id: 'log-4',
    memberId: 'member-1',
    action: 'order',
    detail: '주문 완료 (주문번호: ORD-20260209-001)',
    deviceInfo: { os: 'ios', osVersion: '17.2', appVersion: '2.5.0', deviceModel: 'iPhone 15 Pro' },
    ipAddress: '192.168.1.100',
    createdAt: new Date('2026-02-09T09:35:00'),
  },
  {
    id: 'log-5',
    memberId: 'member-1',
    action: 'coupon_download',
    detail: '10% 할인 쿠폰 다운로드',
    deviceInfo: { os: 'ios', osVersion: '17.2', appVersion: '2.5.0', deviceModel: 'iPhone 15 Pro' },
    ipAddress: '192.168.1.100',
    createdAt: new Date('2026-02-08T14:20:00'),
  },
  // member-2 (이골드) 로그
  {
    id: 'log-6',
    memberId: 'member-2',
    action: 'login',
    detail: '앱 로그인',
    deviceInfo: { os: 'android', osVersion: '14', appVersion: '2.5.0', deviceModel: 'Galaxy S24' },
    ipAddress: '192.168.1.101',
    createdAt: new Date('2026-02-08T14:20:00'),
  },
  {
    id: 'log-7',
    memberId: 'member-2',
    action: 'review_write',
    detail: '맛초킹 한마리 리뷰 작성 (별점 5점)',
    deviceInfo: { os: 'android', osVersion: '14', appVersion: '2.5.0', deviceModel: 'Galaxy S24' },
    ipAddress: '192.168.1.101',
    createdAt: new Date('2026-02-08T14:25:00'),
  },
  {
    id: 'log-8',
    memberId: 'member-2',
    action: 'point_use',
    detail: '포인트 1,000P 사용',
    deviceInfo: { os: 'android', osVersion: '14', appVersion: '2.5.0', deviceModel: 'Galaxy S24' },
    ipAddress: '192.168.1.101',
    createdAt: new Date('2026-02-05T12:00:00'),
  },
  // member-3 (박실버) 로그
  {
    id: 'log-9',
    memberId: 'member-3',
    action: 'login',
    detail: '앱 로그인',
    deviceInfo: { os: 'web', osVersion: 'Chrome 121', appVersion: 'web', deviceModel: 'Desktop' },
    ipAddress: '192.168.1.102',
    createdAt: new Date('2026-02-07T11:00:00'),
  },
  {
    id: 'log-10',
    memberId: 'member-3',
    action: 'inquiry',
    detail: '배달 관련 문의 등록',
    deviceInfo: { os: 'web', osVersion: 'Chrome 121', appVersion: 'web', deviceModel: 'Desktop' },
    ipAddress: '192.168.1.102',
    createdAt: new Date('2026-02-07T11:15:00'),
  },
];

// ============================================
// 주문 내역
// ============================================
export const mockMemberOrders: MemberOrder[] = [
  // member-1 (김VIP) 주문
  {
    id: 'order-1',
    memberId: 'member-1',
    orderNumber: 'ORD-20260209-001',
    orderDate: new Date('2026-02-09T09:35:00'),
    orderType: 'delivery',
    status: 'preparing',
    items: [
      { productId: 'prod-1', productName: '뿌링클 한마리', quantity: 1, price: 22000, options: ['순살', '매운맛'] },
      { productId: 'prod-5', productName: '콜라 1.25L', quantity: 2, price: 2500, options: [] },
    ],
    totalAmount: 27000,
    discountAmount: 2000,
    finalAmount: 25000,
    paymentMethod: '카카오페이',
    storeId: 'store-1',
    storeName: '강남점',
  },
  {
    id: 'order-2',
    memberId: 'member-1',
    orderNumber: 'ORD-20260208-015',
    orderDate: new Date('2026-02-08T18:30:00'),
    orderType: 'delivery',
    status: 'completed',
    items: [
      { productId: 'prod-2', productName: '맛초킹 한마리', quantity: 1, price: 23000, options: ['뼈', '오리지널'] },
    ],
    totalAmount: 23000,
    discountAmount: 0,
    finalAmount: 23000,
    paymentMethod: '신용카드',
    storeId: 'store-1',
    storeName: '강남점',
  },
  {
    id: 'order-3',
    memberId: 'member-1',
    orderNumber: 'ORD-20260205-008',
    orderDate: new Date('2026-02-05T12:00:00'),
    orderType: 'pickup',
    status: 'completed',
    items: [
      { productId: 'prod-3', productName: '후라이드 반마리', quantity: 2, price: 11000, options: [] },
    ],
    totalAmount: 22000,
    discountAmount: 2200,
    finalAmount: 19800,
    paymentMethod: '네이버페이',
    storeId: 'store-2',
    storeName: '서초점',
  },
  // member-2 (이골드) 주문
  {
    id: 'order-4',
    memberId: 'member-2',
    orderNumber: 'ORD-20260205-012',
    orderDate: new Date('2026-02-05T19:00:00'),
    orderType: 'delivery',
    status: 'completed',
    items: [
      { productId: 'prod-1', productName: '뿌링클 한마리', quantity: 1, price: 22000, options: ['순살'] },
      { productId: 'prod-6', productName: '치즈볼', quantity: 1, price: 5000, options: [] },
    ],
    totalAmount: 27000,
    discountAmount: 1000,
    finalAmount: 26000,
    paymentMethod: '카카오페이',
    storeId: 'store-3',
    storeName: '역삼점',
  },
  {
    id: 'order-5',
    memberId: 'member-2',
    orderNumber: 'ORD-20260201-003',
    orderDate: new Date('2026-02-01T20:30:00'),
    orderType: 'delivery',
    status: 'cancelled',
    items: [
      { productId: 'prod-2', productName: '맛초킹 한마리', quantity: 2, price: 23000, options: [] },
    ],
    totalAmount: 46000,
    discountAmount: 0,
    finalAmount: 46000,
    paymentMethod: '신용카드',
    storeId: 'store-3',
    storeName: '역삼점',
  },
];

// ============================================
// 포인트 이력
// ============================================
export const mockPointHistory: PointHistory[] = [
  // member-1 (김VIP) 포인트
  {
    id: 'point-1',
    memberId: 'member-1',
    type: 'earn_order',
    amount: 250,
    balance: 48500,
    description: '주문 적립 (ORD-20260209-001)',
    relatedOrderId: 'order-1',
    createdAt: new Date('2026-02-09T09:35:00'),
    expiresAt: new Date('2027-02-09'),
  },
  {
    id: 'point-2',
    memberId: 'member-1',
    type: 'earn_order',
    amount: 230,
    balance: 48250,
    description: '주문 적립 (ORD-20260208-015)',
    relatedOrderId: 'order-2',
    createdAt: new Date('2026-02-08T18:30:00'),
    expiresAt: new Date('2027-02-08'),
  },
  {
    id: 'point-3',
    memberId: 'member-1',
    type: 'use_order',
    amount: -2000,
    balance: 48020,
    description: '주문 사용 (ORD-20260205-008)',
    relatedOrderId: 'order-3',
    createdAt: new Date('2026-02-05T12:00:00'),
  },
  {
    id: 'point-4',
    memberId: 'member-1',
    type: 'earn_manual',
    amount: 5000,
    balance: 50020,
    description: 'VIP 등급 보너스',
    adminId: 'admin-1',
    adminMemo: 'VIP 등급 달성 축하 포인트',
    createdAt: new Date('2026-02-01T10:00:00'),
    expiresAt: new Date('2027-02-01'),
  },
  // member-2 (이골드) 포인트
  {
    id: 'point-5',
    memberId: 'member-2',
    type: 'earn_order',
    amount: 260,
    balance: 23400,
    description: '주문 적립 (ORD-20260205-012)',
    relatedOrderId: 'order-4',
    createdAt: new Date('2026-02-05T19:00:00'),
    expiresAt: new Date('2027-02-05'),
  },
  {
    id: 'point-6',
    memberId: 'member-2',
    type: 'use_order',
    amount: -1000,
    balance: 23140,
    description: '주문 사용',
    createdAt: new Date('2026-02-05T12:00:00'),
  },
  {
    id: 'point-7',
    memberId: 'member-2',
    type: 'earn_event',
    amount: 1000,
    balance: 24140,
    description: '2월 이벤트 참여 보상',
    createdAt: new Date('2026-02-03T09:00:00'),
    expiresAt: new Date('2026-03-03'),
  },
];

// ============================================
// 쿠폰 이력
// ============================================
export const mockMemberCoupons: MemberCoupon[] = [
  // member-1 (김VIP) 쿠폰
  {
    id: 'mc-1',
    memberId: 'member-1',
    couponId: 'coupon-1',
    couponName: '10% 할인 쿠폰',
    discountType: 'percentage',
    discountValue: 10,
    status: 'available',
    issuedAt: new Date('2026-02-08T14:20:00'),
    expiresAt: new Date('2026-03-08'),
  },
  {
    id: 'mc-2',
    memberId: 'member-1',
    couponId: 'coupon-2',
    couponName: '3,000원 할인 쿠폰',
    discountType: 'fixed',
    discountValue: 3000,
    status: 'used',
    issuedAt: new Date('2026-01-15T10:00:00'),
    usedAt: new Date('2026-02-05T12:00:00'),
    usedOrderId: 'order-3',
    expiresAt: new Date('2026-02-15'),
  },
  {
    id: 'mc-3',
    memberId: 'member-1',
    couponId: 'coupon-3',
    couponName: 'VIP 전용 5,000원 쿠폰',
    discountType: 'fixed',
    discountValue: 5000,
    status: 'available',
    issuedAt: new Date('2026-02-01T00:00:00'),
    expiresAt: new Date('2026-02-28'),
    adminId: 'admin-1',
    adminMemo: 'VIP 등급 혜택 자동 지급',
  },
  // member-2 (이골드) 쿠폰
  {
    id: 'mc-4',
    memberId: 'member-2',
    couponId: 'coupon-4',
    couponName: '5% 할인 쿠폰',
    discountType: 'percentage',
    discountValue: 5,
    status: 'expired',
    issuedAt: new Date('2026-01-01T00:00:00'),
    expiresAt: new Date('2026-01-31'),
  },
  {
    id: 'mc-5',
    memberId: 'member-2',
    couponId: 'coupon-1',
    couponName: '10% 할인 쿠폰',
    discountType: 'percentage',
    discountValue: 10,
    status: 'available',
    issuedAt: new Date('2026-02-05T00:00:00'),
    expiresAt: new Date('2026-03-05'),
  },
];

// ============================================
// 교환권 이력
// ============================================
export const mockMemberVouchers: MemberVoucher[] = [
  // member-1 (김VIP) 교환권
  {
    id: 'voucher-1',
    memberId: 'member-1',
    voucherType: 'gifticon',
    voucherCode: 'GIFT-1234-5678',
    voucherName: '뿌링클 한마리 교환권',
    productId: 'prod-1',
    productName: '뿌링클 한마리',
    status: 'used',
    registeredAt: new Date('2026-01-20T10:00:00'),
    usedAt: new Date('2026-01-25T18:00:00'),
    usedOrderId: 'order-old-1',
    expiresAt: new Date('2026-04-20'),
  },
  {
    id: 'voucher-2',
    memberId: 'member-1',
    voucherType: 'mobile_voucher',
    voucherCode: 'MOB-9876-5432',
    voucherName: '모바일 상품권 10,000원',
    status: 'registered',
    registeredAt: new Date('2026-02-05T14:00:00'),
    expiresAt: new Date('2027-02-05'),
  },
  // member-2 (이골드) 교환권
  {
    id: 'voucher-3',
    memberId: 'member-2',
    voucherType: 'brand_voucher',
    voucherCode: 'BRAND-1111-2222',
    voucherName: '치킨 세트 교환권',
    status: 'expired',
    registeredAt: new Date('2025-06-01T10:00:00'),
    expiresAt: new Date('2025-12-31'),
  },
];

// ============================================
// 알림 발송 이력
// ============================================
export const mockMemberNotifications: MemberNotification[] = [
  // member-1 (김VIP) 알림
  {
    id: 'noti-1',
    memberId: 'member-1',
    notificationType: 'order',
    channel: 'push',
    title: '주문이 접수되었습니다',
    content: '주문번호 ORD-20260209-001이 접수되었습니다. 맛있게 준비하고 있어요!',
    status: 'read',
    sentAt: new Date('2026-02-09T09:35:00'),
    readAt: new Date('2026-02-09T09:36:00'),
  },
  {
    id: 'noti-2',
    memberId: 'member-1',
    notificationType: 'order',
    channel: 'push',
    title: '배달이 시작되었습니다',
    content: '주문하신 음식이 배달 중입니다. 곧 도착할 예정이에요!',
    status: 'delivered',
    sentAt: new Date('2026-02-09T10:00:00'),
  },
  {
    id: 'noti-3',
    memberId: 'member-1',
    notificationType: 'promotion',
    channel: 'push',
    title: '[VIP 전용] 특별 할인!',
    content: 'VIP 고객님만을 위한 20% 특별 할인 쿠폰이 발급되었습니다.',
    status: 'read',
    sentAt: new Date('2026-02-01T10:00:00'),
    readAt: new Date('2026-02-01T11:30:00'),
    campaignId: 'campaign-1',
    campaignName: '2월 VIP 프로모션',
  },
  {
    id: 'noti-4',
    memberId: 'member-1',
    notificationType: 'point',
    channel: 'kakao',
    title: '포인트가 적립되었습니다',
    content: '주문 감사 포인트 250P가 적립되었습니다. 현재 잔액: 48,500P',
    status: 'delivered',
    sentAt: new Date('2026-02-09T09:36:00'),
  },
  // member-2 (이골드) 알림
  {
    id: 'noti-5',
    memberId: 'member-2',
    notificationType: 'coupon',
    channel: 'sms',
    title: '쿠폰이 곧 만료됩니다',
    content: '보유하신 5% 할인 쿠폰이 3일 후 만료됩니다. 서둘러 사용해주세요!',
    status: 'delivered',
    sentAt: new Date('2026-01-28T09:00:00'),
  },
  {
    id: 'noti-6',
    memberId: 'member-2',
    notificationType: 'promotion',
    channel: 'email',
    title: '[골드 회원] 2월 특별 이벤트 안내',
    content: '골드 회원님께 드리는 2월 특별 이벤트! 주문 시 더블 포인트 적립!',
    status: 'sent',
    sentAt: new Date('2026-02-01T09:00:00'),
    campaignId: 'campaign-2',
    campaignName: '2월 골드 이벤트',
  },
  {
    id: 'noti-7',
    memberId: 'member-2',
    notificationType: 'system',
    channel: 'push',
    title: '앱 업데이트 안내',
    content: '새로운 기능이 추가된 버전 2.5.0이 출시되었습니다. 업데이트해주세요!',
    status: 'failed',
    sentAt: new Date('2026-01-15T10:00:00'),
  },
];

// ============================================
// 미주문 / 30일 미접속 회원 샘플 데이터 보완
// ============================================
// 추가 앱 사용 로그 (30일 미접속 회원용)
export const mockInactiveUsageLogs: AppUsageLog[] = [
  {
    id: 'log-inactive-1',
    memberId: 'member-6', // 한휴면 (dormant)
    action: 'login',
    detail: '앱 로그인',
    deviceInfo: { os: 'ios', osVersion: '16.5', appVersion: '2.3.0', deviceModel: 'iPhone 13' },
    ipAddress: '192.168.1.200',
    createdAt: new Date('2025-06-15T09:00:00'),
  },
  {
    id: 'log-inactive-2',
    memberId: 'member-6',
    action: 'logout',
    detail: '앱 로그아웃',
    deviceInfo: { os: 'ios', osVersion: '16.5', appVersion: '2.3.0', deviceModel: 'iPhone 13' },
    ipAddress: '192.168.1.200',
    createdAt: new Date('2025-06-15T10:00:00'),
  },
];
