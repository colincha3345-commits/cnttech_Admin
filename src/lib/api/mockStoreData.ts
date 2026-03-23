/**
 * 매장 Mock 데이터
 * @file src/lib/api/mockStoreData.ts
 */
import type { Store, StoreStaffLink, StoreSummary, Region, DayOperatingHours } from '@/types/store';

// ============================================
// 확장된 매장 데이터
// ============================================

export const mockStores: Store[] = [
  {
    id: 'store-1',
    name: '강남점',
    code: 'GN001',
    branchId: 'branch-002', // 서울지사
    status: 'active',
    address: {
      zipCode: '06132',
      address: '서울시 강남구 테헤란로 123',
      addressDetail: '1층',
      region: '서울',
      latitude: 37.5012,
      longitude: 127.0396,
    },
    owner: {
      name: '홍길동',
      phone: '010-1234-5678',
      email: 'hong.gangnam@example.com',
    },
    business: {
      businessNumber: '123-45-67890',
      businessName: '강남치킨',
      representativeName: '홍길동',
      businessType: '음식점업',
      businessCategory: '치킨전문점',
    },
    contract: {
      contractDate: new Date('2023-01-01'),
      expirationDate: new Date('2026-12-31'),
      contractStatus: 'active',
    },
    bankAccount: {
      bankCode: '004',
      bankName: '국민은행',
      accountNumber: '123-456-789012',
      accountHolder: '홍길동',
    },
    openingDate: new Date('2023-02-01'),
    operatingHours: '11:00-23:00',

    // 확장된 영업 정보
    operatingInfo: {
      appOperatingStatus: 'open',
      weekdayHours: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
      weekendHours: { isOpen: true, openTime: '11:00', closeTime: '24:00' },
      holidayHours: { isOpen: true, openTime: '12:00', closeTime: '22:00' },
      dailyHours: {
        monday: { isOpen: false } as DayOperatingHours, // 정기휴무
        tuesday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
        wednesday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
        thursday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
        friday: { isOpen: true, openTime: '11:00', closeTime: '24:00' },
        saturday: { isOpen: true, openTime: '11:00', closeTime: '24:00' },
        sunday: { isOpen: true, openTime: '12:00', closeTime: '22:00' },
      },
      regularClosedDays: [
        { type: 'weekly', dayOfWeek: 'monday', description: '매주 월요일 정기휴무' },
      ],
      irregularClosedDays: [
        { date: '2026-02-18', reason: '설 연휴 (임시 휴무)' },
        { date: '2026-02-19', reason: '설 연휴 (임시 휴무)' },
      ],
      deliveryFee: 3000,
      freeDeliveryMinAmount: 20000,
      isTemporarilyClosed: false,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
      deliverySettings: {
        isAvailable: true,
        availableStartTime: '11:30',
        availableEndTime: '22:30',
        minOrderAmount: 15000,
        isReservationAvailable: true,
        reservationLeadTimeMinutes: 30,
      },
      pickupSettings: {
        isAvailable: true,
        availableStartTime: '11:00',
        availableEndTime: '22:00',
        minOrderAmount: 10000,
        isReservationAvailable: true,
        reservationLeadTimeMinutes: 15,
      },
      isVisible: true,
    },

    // 매장 편의시설
    amenities: {
      hasParking: true,
      parkingNote: '건물 지하주차장 2시간 무료',
      hasDineIn: true,
      seatCapacity: 30,
      hasWifi: true,
    },

    // 연동 코드 정보
    integrationCodes: {
      pos: {
        posVendor: 'okpos',
        posCode: 'GN001-POS',

        isConnected: true,
        lastSyncAt: new Date('2026-02-10T09:00:00'),
      },
      sk: {
        storeCode: '12345',
        fullCode: 'V90212345',
        isEnabled: true,
        registeredAt: new Date('2023-02-01'),
      },
      pg: {
        pgVendor: 'smartro',
        mid: 'MID_GN001_2023',
        apiKey: 'sk_live_****',
        isTestMode: false,
        isEnabled: true,
        registeredAt: new Date('2023-01-20'),
      },
      voucherVendor: {
        vendorName: '기프티콘',
        storeCode: 'GFT-GN001',
        isEnabled: true,
        registeredAt: new Date('2023-02-01'),
      },
    },

    // 결제 수단
    paymentMethods: {
      isCardEnabled: true,
      isCashEnabled: true,
      isPointEnabled: true,
      simplePayments: [
        { type: 'kakaopay', isEnabled: true },
        { type: 'naverpay', isEnabled: true },
        { type: 'tosspay', isEnabled: true },
        { type: 'samsungpay', isEnabled: false },
        { type: 'payco', isEnabled: false },
        { type: 'applepay', isEnabled: true },
      ],
    },

    // 노출 설정
    visibilitySettings: {
      channels: [
        { channel: 'app', isVisible: true, priority: 1 },
        { channel: 'web', isVisible: true, priority: 2 },
        { channel: 'kiosk', isVisible: true, priority: 3 },
        { channel: 'baemin', isVisible: true, priority: 4 },
        { channel: 'yogiyo', isVisible: false },
        { channel: 'coupangeats', isVisible: true, priority: 5 },
      ],
      isSearchable: true,
      showNewBadge: false,
      showEventBadge: true,
      eventBadgeText: '런칭 프로모션',
      isRecommended: true,
      recommendedOrder: 1,
    },

    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'admin',
  },
  {
    id: 'store-2',
    name: '홍대점',
    code: 'HD001',
    branchId: 'branch-002', // 서울지사
    status: 'active',
    address: {
      zipCode: '04038',
      address: '서울시 마포구 양화로 456',
      addressDetail: '2층',
      region: '서울',
      latitude: 37.5565,
      longitude: 126.9239,
    },
    owner: {
      name: '김철수',
      phone: '010-2345-6789',
      email: 'kim.hongdae@example.com',
    },
    business: {
      businessNumber: '234-56-78901',
      businessName: '홍대치킨',
      representativeName: '김철수',
      businessType: '음식점업',
      businessCategory: '치킨전문점',
    },
    contract: {
      contractDate: new Date('2023-03-01'),
      expirationDate: new Date('2025-06-30'),
      contractStatus: 'pending_renewal',
    },
    bankAccount: {
      bankCode: '088',
      bankName: '신한은행',
      accountNumber: '110-234-567890',
      accountHolder: '김철수',
    },
    openingDate: new Date('2023-04-15'),
    operatingHours: '12:00-24:00',

    operatingInfo: {
      appOperatingStatus: 'open',
      weekdayHours: { isOpen: true, openTime: '12:00', closeTime: '24:00' },
      weekendHours: { isOpen: true, openTime: '12:00', closeTime: '02:00' },
      regularClosedDays: [], // 연중무휴
      deliveryFee: 2500,
      freeDeliveryMinAmount: 18000,
      isTemporarilyClosed: false,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
    },

    // 매장 편의시설
    amenities: {
      hasParking: false,
      hasDineIn: true,
      seatCapacity: 24,
      hasWifi: true,
    },
    integrationCodes: {
      pos: {
        posVendor: 'okpos',
        posCode: 'HD001-POS',
        isConnected: true,
        lastSyncAt: new Date('2026-02-10T08:30:00'),
      },
      sk: {
        storeCode: '23456',
        fullCode: 'V90223456',
        isEnabled: true,
        registeredAt: new Date('2023-04-15'),
      },
      pg: {
        pgVendor: 'smartro',
        mid: 'MID_HD001_2023',
        isTestMode: false,
        isEnabled: true,
      },
      voucherVendor: { isEnabled: false },
    },
    visibilitySettings: {
      channels: [
        { channel: 'app', isVisible: true, priority: 1 },
        { channel: 'web', isVisible: true, priority: 2 },
        { channel: 'baemin', isVisible: true, priority: 3 },
        { channel: 'yogiyo', isVisible: true, priority: 4 },
        { channel: 'coupangeats', isVisible: false },
        { channel: 'kiosk', isVisible: false },
      ],
      isSearchable: true,
      showNewBadge: false,
      showEventBadge: false,
      isRecommended: false,
    },

    createdAt: new Date('2023-03-01'),
    updatedAt: new Date('2024-06-20'),
    createdBy: 'admin',
  },
  {
    id: 'store-3',
    name: '부산 서면점',
    code: 'BS001',
    branchId: 'branch-005', // 부산지사
    status: 'active',
    address: {
      zipCode: '47285',
      address: '부산시 부산진구 서면로 789',
      addressDetail: '1층 101호',
      region: '부산',
      latitude: 35.1579,
      longitude: 129.0598,
    },
    owner: {
      name: '박영희',
      phone: '010-3456-7890',
      email: 'park.seomyeon@example.com',
    },
    business: {
      businessNumber: '345-67-89012',
      businessName: '서면치킨',
      representativeName: '박영희',
      businessType: '음식점업',
      businessCategory: '치킨전문점',
    },
    contract: {
      contractDate: new Date('2022-06-01'),
      expirationDate: new Date('2027-05-31'),
      contractStatus: 'active',
    },
    bankAccount: {
      bankCode: '011',
      bankName: '농협은행',
      accountNumber: '302-0123-4567-89',
      accountHolder: '박영희',
    },
    openingDate: new Date('2022-07-01'),
    operatingHours: '11:00-22:00',

    operatingInfo: {
      appOperatingStatus: 'open',
      weekdayHours: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
      weekendHours: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
      regularClosedDays: [
        { type: 'monthly_nth', dayOfWeek: 'tuesday', nthWeek: 2, description: '매월 둘째주 화요일' },
        { type: 'monthly_nth', dayOfWeek: 'tuesday', nthWeek: 4, description: '매월 넷째주 화요일' },
      ],
      deliveryFee: 2000,
      freeDeliveryMinAmount: 15000,
      isTemporarilyClosed: false,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
    },

    // 매장 편의시설
    amenities: {
      hasParking: true,
      parkingNote: '매장 앞 전용주차 5대',
      hasDineIn: true,
      seatCapacity: 20,
      hasWifi: true,
    },
    integrationCodes: {
      pos: {
        posVendor: 'unionpos',
        posCode: 'BS001-POS',
        isConnected: true,
      },
      sk: {
        storeCode: '34567',
        fullCode: 'V90234567',
        isEnabled: true,
      },
      pg: {
        pgVendor: 'kcp',
        mid: 'MID_BS001_2022',
        isTestMode: false,
        isEnabled: true,
      },
      voucherVendor: {
        vendorName: '카카오 선물하기',
        storeCode: 'KKO-BS001',
        isEnabled: true,
      },
    },
    visibilitySettings: {
      channels: [
        { channel: 'app', isVisible: true, priority: 1 },
        { channel: 'web', isVisible: true, priority: 2 },
        { channel: 'baemin', isVisible: true, priority: 3 },
        { channel: 'yogiyo', isVisible: false },
        { channel: 'coupangeats', isVisible: false },
        { channel: 'kiosk', isVisible: false },
      ],
      isSearchable: true,
      showNewBadge: false,
      showEventBadge: false,
      isRecommended: false,
    },

    createdAt: new Date('2022-06-01'),
    updatedAt: new Date('2024-03-10'),
    createdBy: 'admin',
  },
  {
    id: 'store-4',
    name: '대구 동성로점',
    code: 'DG001',
    branchId: 'branch-005', // 부산지사
    status: 'active',
    address: {
      zipCode: '41938',
      address: '대구시 중구 동성로 111',
      addressDetail: 'A동 102호',
      region: '대구',
      latitude: 35.8676,
      longitude: 128.5932,
    },
    owner: {
      name: '이민준',
      phone: '010-4567-8901',
      email: 'lee.dongseongro@example.com',
    },
    business: {
      businessNumber: '456-78-90123',
      businessName: '동성로치킨',
      representativeName: '이민준',
      businessType: '음식점업',
      businessCategory: '치킨전문점',
    },
    contract: {
      contractDate: new Date('2024-01-01'),
      expirationDate: new Date('2027-12-31'),
      contractStatus: 'active',
    },
    bankAccount: {
      bankCode: '020',
      bankName: '우리은행',
      accountNumber: '1002-123-456789',
      accountHolder: '이민준',
    },
    openingDate: new Date('2024-02-15'),
    operatingHours: '11:30-22:30',

    operatingInfo: {
      appOperatingStatus: 'open',
      weekdayHours: { isOpen: true, openTime: '11:30', closeTime: '22:30' },
      weekendHours: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
      regularClosedDays: [
        { type: 'weekly', dayOfWeek: 'sunday', description: '매주 일요일 정기휴무' },
      ],
      deliveryFee: 2500,
      freeDeliveryMinAmount: 18000,
      isTemporarilyClosed: false,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
    },

    // 매장 편의시설
    amenities: {
      hasParking: true,
      parkingNote: '인근 공영주차장 이용 (1시간 무료 주차권 제공)',
      hasDineIn: true,
      seatCapacity: 28,
      hasWifi: true,
    },
    integrationCodes: {
      pos: {
        posVendor: 'okpos',
        posCode: 'DG001-POS',
        isConnected: true,
      },
      sk: {
        storeCode: '45678',
        fullCode: 'V90245678',
        isEnabled: true,
      },
      pg: {
        pgVendor: 'smartro',
        mid: 'MID_DG001_2024',
        isTestMode: false,
        isEnabled: true,
      },
      voucherVendor: { isEnabled: false },
    },
    visibilitySettings: {
      channels: [
        { channel: 'app', isVisible: true, priority: 1 },
        { channel: 'web', isVisible: true, priority: 2 },
        { channel: 'baemin', isVisible: false },
        { channel: 'yogiyo', isVisible: false },
        { channel: 'coupangeats', isVisible: false },
        { channel: 'kiosk', isVisible: false },
      ],
      isSearchable: true,
      showNewBadge: true,
      newBadgeEndDate: new Date('2026-05-15'),
      showEventBadge: false,
      isRecommended: false,
    },

    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-02-15'),
    createdBy: 'admin',
  },
  {
    id: 'store-5',
    name: '인천 구월점',
    code: 'IC001',
    branchId: 'branch-003', // 경기지사
    status: 'pending',
    address: {
      zipCode: '21555',
      address: '인천시 남동구 구월로 222',
      addressDetail: '3층',
      region: '인천',
      latitude: 37.4486,
      longitude: 126.7052,
    },
    owner: {
      name: '최수진',
      phone: '010-5678-9012',
      email: 'choi.guwol@example.com',
    },
    business: {
      businessNumber: '567-89-01234',
      businessName: '구월치킨',
      representativeName: '최수진',
      businessType: '음식점업',
      businessCategory: '치킨전문점',
    },
    contract: {
      contractDate: new Date('2026-01-15'),
      expirationDate: new Date('2029-01-14'),
      contractStatus: 'active',
    },
    bankAccount: {
      bankCode: '081',
      bankName: '하나은행',
      accountNumber: '157-910234-56789',
      accountHolder: '최수진',
    },
    openingDate: new Date('2026-03-01'),
    operatingHours: '11:00-22:00',

    operatingInfo: {
      appOperatingStatus: 'closed', // 오픈예정
      weekdayHours: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
      weekendHours: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
      regularClosedDays: [
        { type: 'weekly', dayOfWeek: 'tuesday', description: '매주 화요일 정기휴무' },
      ],
      deliveryFee: 3000,
      freeDeliveryMinAmount: 20000,
      isTemporarilyClosed: false,
      isDeliveryAvailable: true,
      isPickupAvailable: true,
    },

    // 매장 편의시설
    amenities: {
      hasParking: true,
      parkingNote: '건물 지하주차장',
      hasDineIn: true,
      seatCapacity: 40,
      hasWifi: true,
    },
    integrationCodes: {
      pos: { isConnected: false }, // 오픈예정이라 미연동
      sk: { isEnabled: false },
      pg: {
        pgVendor: 'smartro',
        mid: 'MID_IC001_2026',
        isTestMode: true, // 테스트 모드
        isEnabled: false,
      },
      voucherVendor: { isEnabled: false },
    },
    visibilitySettings: {
      channels: [
        { channel: 'app', isVisible: false }, // 오픈 전 비노출
        { channel: 'web', isVisible: false },
        { channel: 'baemin', isVisible: false },
        { channel: 'yogiyo', isVisible: false },
        { channel: 'coupangeats', isVisible: false },
        { channel: 'kiosk', isVisible: false },
      ],
      isSearchable: false,
      showNewBadge: true,
      showEventBadge: false,
      isRecommended: false,
    },

    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-01-20'),
    createdBy: 'admin',
  },
];

// ============================================
// 매장-직원 연결 Mock 데이터
// ============================================

export const mockStoreStaffLinks: StoreStaffLink[] = [
  // 강남점
  {
    id: 'link-1',
    storeId: 'store-1',
    staffId: 'fr-staff-1',
    role: 'owner',
    isPrimary: true,
    createdAt: new Date('2024-02-20'),
    createdBy: 'admin',
  },
  {
    id: 'link-2',
    storeId: 'store-1',
    staffId: 'fr-staff-2',
    role: 'staff',
    isPrimary: false,
    createdAt: new Date('2024-03-01'),
    createdBy: 'admin',
  },
  {
    id: 'link-3',
    storeId: 'store-1',
    staffId: 'fr-staff-10',
    role: 'staff',
    isPrimary: false,
    createdAt: new Date('2024-07-01'),
    createdBy: 'admin',
  },
  // 홍대점
  {
    id: 'link-4',
    storeId: 'store-2',
    staffId: 'fr-staff-3',
    role: 'owner',
    isPrimary: true,
    createdAt: new Date('2024-02-20'),
    createdBy: 'admin',
  },
  {
    id: 'link-5',
    storeId: 'store-2',
    staffId: 'fr-staff-4',
    role: 'staff',
    isPrimary: false,
    createdAt: new Date('2024-04-01'),
    createdBy: 'admin',
  },
  // 부산 서면점
  {
    id: 'link-6',
    storeId: 'store-3',
    staffId: 'fr-staff-5',
    role: 'owner',
    isPrimary: true,
    createdAt: new Date('2022-07-01'),
    createdBy: 'admin',
  },
  {
    id: 'link-7',
    storeId: 'store-3',
    staffId: 'fr-staff-6',
    role: 'staff',
    isPrimary: false,
    createdAt: new Date('2022-08-15'),
    createdBy: 'admin',
  },
  // 대구 동성로점
  {
    id: 'link-8',
    storeId: 'store-4',
    staffId: 'fr-staff-7',
    role: 'owner',
    isPrimary: true,
    createdAt: new Date('2024-02-15'),
    createdBy: 'admin',
  },
  {
    id: 'link-9',
    storeId: 'store-4',
    staffId: 'fr-staff-8',
    role: 'staff',
    isPrimary: false,
    createdAt: new Date('2024-03-01'),
    createdBy: 'admin',
  },
  // 인천 구월점
  {
    id: 'link-10',
    storeId: 'store-5',
    staffId: 'fr-staff-9',
    role: 'owner',
    isPrimary: true,
    createdAt: new Date('2026-01-20'),
    createdBy: 'admin',
  },
];

// ============================================
// 유틸리티 함수
// ============================================

/**
 * Store를 StoreSummary로 변환 (기존 호환용)
 */
export function toStoreSummary(store: Store): StoreSummary {
  return {
    id: store.id,
    name: store.name,
    region: store.address.region,
    address: `${store.address.address} ${store.address.addressDetail}`.trim(),
  };
}

/**
 * 모든 Store를 StoreSummary 배열로 변환
 */
export function getAllStoreSummaries(): StoreSummary[] {
  return mockStores.map(toStoreSummary);
}

/**
 * 지역별 매장 필터링
 */
export function getStoresByRegion(region: Region): Store[] {
  return mockStores.filter((store) => store.address.region === region);
}
