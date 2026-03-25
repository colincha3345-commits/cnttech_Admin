/**
 * 매장 관련 타입 정의
 * @file src/types/store.ts
 */

// ============================================
// 기본 타입
// ============================================

// 매장 상태
export type StoreStatus = 'active' | 'inactive' | 'pending' | 'terminated';

// 계약 상태
export type ContractStatus = 'active' | 'expired' | 'pending_renewal';

// 지역
export type Region =
  | '서울'
  | '경기'
  | '인천'
  | '부산'
  | '대구'
  | '대전'
  | '광주'
  | '울산'
  | '세종'
  | '강원'
  | '충북'
  | '충남'
  | '전북'
  | '전남'
  | '경북'
  | '경남'
  | '제주';

// 매장-직원 연결 역할
export type StoreStaffRole = 'owner' | 'staff';

// ============================================
// 세부 정보 인터페이스
// ============================================

// 주소 정보
export interface AddressInfo {
  zipCode: string;
  address: string;
  addressDetail: string;
  region: Region;
  latitude?: number;
  longitude?: number;
}

// 가맹점주 정보
export interface OwnerInfo {
  name: string;
  phone: string;
  email?: string;
}

// 사업자 정보
export interface BusinessInfo {
  businessNumber: string;
  businessName: string;
  representativeName: string;
  businessType?: string;
  businessCategory?: string;
}

// 계약 정보 — 브랜드 본사가 해당 매장(가맹점)을 관리하기 위한 계약 데이터
export interface ContractInfo {
  contractDate: Date;        // 가맹 계약 시작일
  expirationDate: Date;      // 가맹 계약 만료일
  contractStatus: ContractStatus;
  contractType?: ContractType;  // 계약 유형
  royaltyRate?: number;      // 로열티 비율 (%, 본사→가맹점 수수료)
  depositAmount?: number;    // 보증금 (원)
  contractDocumentUrl?: string;
  notes?: string;
}

// 계약 유형
export type ContractType = 'franchise' | 'direct' | 'license';


// 계좌 정보
export interface BankAccountInfo {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// ============================================
// 영업 정보 (확장)
// ============================================

// 앱 운영 상태 (실시간 상태)
export type AppOperatingStatus =
  | 'open' // 영업중
  | 'preparing' // 준비중
  | 'break_time' // 휴식시간
  | 'closed' // 영업종료
  | 'temporarily_closed'; // 임시휴업

// 요일 타입 (discount.ts의 DayOfWeek와 충돌 방지를 위해 WeekDay로 명명)
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// 요일별 영업시간
export interface DayOperatingHours {
  isOpen: boolean;
  openTime?: string; // HH:mm
  closeTime?: string; // HH:mm
  breakStart?: string; // 휴게시간 시작
  breakEnd?: string; // 휴게시간 종료
  lastOrderMinutes?: number; // 라스트오더 시간 (마감 n분 전)
}

// 정기휴무 타입
export type RegularClosedType =
  | 'weekly' // 매주 (예: 매주 월요일)
  | 'monthly_nth' // 매월 n번째 요일 (예: 매월 첫째주 월요일)
  | 'monthly_date'; // 매월 특정 일자 (예: 매월 1일, 15일)

// 정기휴무 정보
export interface RegularClosedDay {
  type: RegularClosedType;
  dayOfWeek?: WeekDay; // weekly, monthly_nth에서 사용
  nthWeek?: number; // monthly_nth에서 사용 (1-5, 5=마지막주)
  dates?: number[]; // monthly_date에서 사용 (1-31)
  description?: string; // 휴무 설명
}

// 매장 편의시설
export interface StoreAmenities {
  // 주차
  hasParking: boolean;
  parkingNote?: string; // 주차 관련 안내 (예: "건물 지하주차장 2시간 무료")

  // 좌석
  hasDineIn: boolean; // 매장 내 식사 가능
  seatCapacity?: number; // 좌석 수

  // 와이파이
  hasWifi: boolean;
}

// 비정기 휴무
export interface IrregularClosedDay {
  date: string; // YYYY-MM-DD
  reason?: string;
}

// 배달 상세 설정
export interface DeliverySettings {
  isAvailable: boolean;
  /** 배달 최소주문금액 (읽기전용 — 상권관리 메인상권에서 설정) */
  minOrderAmount?: number;
  /** 예상 배달시간 (분) — 고객 앱 안내용 */
  estimatedMinutes?: number;
}

// 포장 상세 설정
export interface PickupSettings {
  isAvailable: boolean;
  minOrderAmount?: number; // 포장 최소주문금액
  /** 예상 포장 준비시간 (분) — 고객 앱 안내용 */
  estimatedMinutes?: number;
}

// 영업 정보
export interface OperatingInfo {
  // 앱 운영 상태 (실시간)
  appOperatingStatus?: AppOperatingStatus;

  // 요일별 영업시간 (간편 설정)
  weekdayHours: DayOperatingHours; // 평일
  weekendHours: DayOperatingHours; // 주말
  holidayHours?: DayOperatingHours; // 공휴일

  // 요일별 개별 영업시간 (이 값이 있으면 weekdayHours/weekendHours보다 우선)
  dailyHours?: Record<WeekDay, DayOperatingHours>;

  // 정기휴무
  regularClosedDays?: RegularClosedDay[];

  // 비정기 휴무
  irregularClosedDays?: IrregularClosedDay[];

  // 배달비: 상권관리(DeliveryZone)에서 설정. OperatingInfo에는 포함하지 않음.
  // → DeliveryZone.deliveryFee (메인상권 기본 배달비)
  // → 추가상권: 메인상권 배달비 + 추가상권 deliveryFee

  // 영업 상태
  isTemporarilyClosed: boolean; // 임시휴업
  temporaryCloseReason?: string;
  temporaryCloseReasonDetail?: string; // "기타" 선택 시 직접 입력
  temporaryCloseStartDate?: Date;
  temporaryCloseEndDate?: Date;

  // 배달/포장 가능 여부 (하위 호환)
  isDeliveryAvailable: boolean;
  isPickupAvailable: boolean;

  // 배달/포장 상세 설정
  deliverySettings?: DeliverySettings;
  pickupSettings?: PickupSettings;

  // 예약 설정 (배달/포장 통합)
  isReservationAvailable?: boolean;
  reservationLeadTimeMinutes?: number;

  // 매장 노출 여부
  isVisible?: boolean;
}

// ============================================
// 연동 코드 정보
// ============================================

// POS 연동 정보
export interface PosIntegration {
  posVendor?: 'okcashbag' | 'kcp' | 'unionpos' | 'okpos' | 'other';
  posCode?: string;
  isConnected: boolean;
  lastSyncAt?: Date;
}

// SK 할인/적립 연동
export interface SkIntegration {
  storeCode?: string; // 가맹점 코드 (SK에서 채번)
  fullCode?: string; // V902 + storeCode 형태
  isEnabled: boolean;
  registeredAt?: Date;
}

// PG사 연동 (스마트로 등)
export interface PgIntegration {
  pgVendor?: 'smartro' | 'kcp' | 'nicepay' | 'toss' | 'other';
  mid?: string; // Merchant ID
  apiKey?: string; // API Key (마스킹 저장)
  isTestMode: boolean;
  isEnabled: boolean;
  registeredAt?: Date;
}

// 교환권 벤더사 연동
export interface VoucherVendorIntegration {
  vendorName?: string; // 벤더사명
  storeCode?: string; // 가맹점 코드
  isEnabled: boolean;
  registeredAt?: Date;
}

// 통합 연동 정보
export interface IntegrationCodes {
  pos: PosIntegration;
  sk: SkIntegration;
  pg: PgIntegration;
  voucherVendor: VoucherVendorIntegration;
}

// ============================================
// 노출 설정
// ============================================

export type VisibilityChannel = 'app' | 'web' | 'kiosk' | 'baemin' | 'yogiyo' | 'coupangeats';

export interface ChannelVisibility {
  channel: VisibilityChannel;
  isVisible: boolean;
  priority?: number; // 노출 우선순위
}

export interface VisibilitySettings {
  // 채널별 노출 설정
  channels: ChannelVisibility[];

  // 검색 노출
  isSearchable: boolean;

  // 신규 매장 뱃지
  showNewBadge: boolean;
  newBadgeEndDate?: Date;

  // 이벤트 매장 표시
  showEventBadge: boolean;
  eventBadgeText?: string;

  // 추천 매장
  isRecommended: boolean;
  recommendedOrder?: number;
}

// ============================================
// 결제 수단
// ============================================

export type SimplePaymentType =
  | 'kakaopay'
  | 'naverpay'
  | 'tosspay'
  | 'samsungpay'
  | 'payco'
  | 'applepay';

export interface SimplePaymentSetting {
  type: SimplePaymentType;
  isEnabled: boolean;
}

export interface PaymentMethods {
  isCardEnabled: boolean;
  isCashEnabled: boolean;
  isPointEnabled: boolean;
  simplePayments: SimplePaymentSetting[];
}

// ============================================
// 메인 엔티티
// ============================================

// 확장된 Store 타입
export interface Store {
  id: string;
  name: string;
  code?: string;
  branchId: string;      // 소속 지사 (필수) [2026-03-23 추가]
  status: StoreStatus;
  address: AddressInfo;
  owner: OwnerInfo;
  business: BusinessInfo;
  contract: ContractInfo;
  bankAccount: BankAccountInfo;
  openingDate?: Date;
  operatingHours?: string; // 기존 호환용 (간단한 문자열)

  // 확장된 영업/연동/노출 정보
  operatingInfo?: OperatingInfo;
  integrationCodes?: IntegrationCodes;
  visibilitySettings?: VisibilitySettings;

  // 매장 편의시설
  amenities?: StoreAmenities;

  // 결제 수단
  paymentMethods?: PaymentMethods;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

// 기존 호환용 간소화 Store
export interface StoreSummary {
  id: string;
  name: string;
  region: Region;
  address: string;
}

// 매장-직원 연결
/**
 * 매장-직원 연결 (1:1 제약)
 * - 각 가맹점(storeId)은 정확히 1명의 직원(staffId)과만 매칭
 * - 한 직원은 최대 1개 매장에만 소속 가능
 */
export interface StoreStaffLink {
  id: string;
  storeId: string;
  staffId: string;
  role: StoreStaffRole;
  isPrimary: boolean;  // 1:1 제약에 의해 항상 true (주 담당자는 필연적으로 유일)
  createdAt: Date;
  createdBy: string;
}

// 매장 상세 (연결된 직원 포함)
export interface StoreWithStaff extends Store {
  staffLinks: Array<
    StoreStaffLink & {
      staffName: string;
      staffEmail: string;
      staffPhone: string;
      staffStatus: string;
    }
  >;
}

// 직원별 연결된 매장 정보
export interface StaffWithStores {
  staffId: string;
  stores: Array<{
    store: StoreSummary;
    role: StoreStaffRole;
    isPrimary: boolean;
  }>;
}

// ============================================
// 폼 데이터
// ============================================

// 주소 폼 데이터
export interface AddressFormData {
  zipCode: string;
  address: string;
  addressDetail: string;
  region: Region;
  latitude?: number;
  longitude?: number;
}

// 점주 폼 데이터
export interface OwnerFormData {
  name: string;
  phone: string;
  email?: string;
}

// 사업자 폼 데이터
export interface BusinessFormData {
  businessNumber: string;
  businessName: string;
  representativeName: string;
  businessType?: string;
  businessCategory?: string;
}

// 계약 폼 데이터 (날짜는 string으로 입력받음)
export interface ContractFormData {
  contractDate: string;
  expirationDate: string;
  contractStatus: ContractStatus;
  contractType?: ContractType;
  royaltyRate?: number;
  depositAmount?: number;
  contractDocumentUrl?: string;
  notes?: string;
}

// 계좌 폼 데이터
export interface BankAccountFormData {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}

// 매장 생성/수정 폼 데이터
export interface StoreFormData {
  name: string;
  code?: string;
  branchId: string;      // 소속 지사 (필수)
  status: StoreStatus;
  address: AddressFormData;
  owner: OwnerFormData;
  business: BusinessFormData;
  contract: ContractFormData;
  bankAccount: BankAccountFormData;
  openingDate?: string;
  operatingHours?: string;
}

/**
 * 매장-직원 연결 폼 데이터 (1:1 제약)
 * - 한 매장에는 1명의 직원만 연결 가능
 * - 기존 연결이 있으면 덮어쓰기 전 제거 필요
 */
export interface StoreStaffLinkFormData {
  storeId: string;
  staffId: string;
  role: StoreStaffRole;
  isPrimary?: boolean;  // 1:1 제약에 의해 항상 true로 설정됨
}

// 영업 정보 폼 데이터
export interface OperatingInfoFormData {
  weekdayHours: DayOperatingHours;
  weekendHours: DayOperatingHours;
  holidayHours?: DayOperatingHours;
  dailyHours?: Record<WeekDay, DayOperatingHours>;
  regularClosedDays?: RegularClosedDay[];
  irregularClosedDays?: IrregularClosedDay[];
  isTemporarilyClosed: boolean;
  temporaryCloseReason?: string;
  temporaryCloseReasonDetail?: string; // "기타" 선택 시 직접 입력
  temporaryCloseStartDate?: string;
  temporaryCloseEndDate?: string;
  isDeliveryAvailable: boolean;
  isPickupAvailable: boolean;
  deliverySettings?: DeliverySettings;
  pickupSettings?: PickupSettings;
  // 예약 설정 (배달/포장 통합)
  isReservationAvailable?: boolean;
  reservationLeadTimeMinutes?: number; // 현재 시간 + n분부터 예약 가능
  isVisible?: boolean;
}

// 결제 수단 폼 데이터
export interface PaymentMethodsFormData {
  isCardEnabled: boolean;
  isCashEnabled: boolean;
  isPointEnabled: boolean;
  simplePayments: SimplePaymentSetting[];
}

// 연동 코드 폼 데이터
export interface IntegrationCodesFormData {
  pos: {
    posVendor?: string;
    posCode?: string;
    isConnected: boolean;
  };
  sk: {
    storeCode?: string;
    isEnabled: boolean;
  };
  pg: {
    pgVendor?: string;
    mid?: string;
    apiKey?: string;
    isTestMode: boolean;
    isEnabled: boolean;
  };
  voucherVendor: {
    vendorName?: string;
    storeCode?: string;
    isEnabled: boolean;
  };
}

// 노출 설정 폼 데이터
export interface VisibilitySettingsFormData {
  channels: ChannelVisibility[];
  isSearchable: boolean;
  showNewBadge: boolean;
  newBadgeEndDate?: string;
  showEventBadge: boolean;
  eventBadgeText?: string;
  isRecommended: boolean;
  recommendedOrder?: number;
}

// 편의시설 폼 데이터
export interface AmenitiesFormData {
  hasParking: boolean;
  parkingNote?: string;
  hasDineIn: boolean;
  seatCapacity?: number;
  hasWifi: boolean;
}

// ============================================
// 조회 파라미터
// ============================================

export interface StoreListParams {
  status?: StoreStatus;
  region?: Region;
  keyword?: string;
  contractStatus?: ContractStatus;
  page?: number;
  limit?: number;
}

// ============================================
// 상수 및 라벨
// ============================================

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  active: '운영중',
  inactive: '휴업',
  pending: '오픈예정',
  terminated: '폐점',
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  active: '정상',
  expired: '만료',
  pending_renewal: '갱신대기',
};

export const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  franchise: '가맹',
  direct: '직영',
  license: '라이선스',
};

export const STORE_STAFF_ROLE_LABELS: Record<StoreStaffRole, string> = {
  owner: '가맹점주',
  staff: '직원',
};

export const APP_OPERATING_STATUS_LABELS: Record<AppOperatingStatus, string> = {
  open: '영업중',
  preparing: '준비중',
  break_time: '휴식시간',
  closed: '영업종료',
  temporarily_closed: '임시휴업',
};

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
  monday: '월요일',
  tuesday: '화요일',
  wednesday: '수요일',
  thursday: '목요일',
  friday: '금요일',
  saturday: '토요일',
  sunday: '일요일',
};

export const WEEK_DAY_SHORT_LABELS: Record<WeekDay, string> = {
  monday: '월',
  tuesday: '화',
  wednesday: '수',
  thursday: '목',
  friday: '금',
  saturday: '토',
  sunday: '일',
};

export const REGULAR_CLOSED_TYPE_LABELS: Record<RegularClosedType, string> = {
  weekly: '매주',
  monthly_nth: '매월 n번째 요일',
  monthly_date: '매월 특정 일자',
};

// 간편결제 라벨
export const SIMPLE_PAYMENT_LABELS: Record<SimplePaymentType, string> = {
  kakaopay: '카카오페이',
  naverpay: '네이버페이',
  tosspay: '토스페이',
  samsungpay: '삼성페이',
  payco: '페이코',
  applepay: '애플페이',
};

export const SIMPLE_PAYMENT_LIST: Array<{ code: SimplePaymentType; name: string }> = [
  { code: 'kakaopay', name: '카카오페이' },
  { code: 'naverpay', name: '네이버페이' },
  { code: 'tosspay', name: '토스페이' },
  { code: 'samsungpay', name: '삼성페이' },
  { code: 'payco', name: '페이코' },
  { code: 'applepay', name: '애플페이' },
];

// 요일 순서 (UI에서 반복용)
export const WEEK_DAYS: WeekDay[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
];

export const REGIONS: Region[] = [
  '서울',
  '경기',
  '인천',
  '부산',
  '대구',
  '대전',
  '광주',
  '울산',
  '세종',
  '강원',
  '충북',
  '충남',
  '전북',
  '전남',
  '경북',
  '경남',
  '제주',
];

export const BANKS: Array<{ code: string; name: string }> = [
  { code: '004', name: '국민은행' },
  { code: '011', name: '농협은행' },
  { code: '020', name: '우리은행' },
  { code: '081', name: '하나은행' },
  { code: '088', name: '신한은행' },
  { code: '003', name: '기업은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '027', name: '씨티은행' },
  { code: '039', name: '경남은행' },
  { code: '034', name: '광주은행' },
  { code: '031', name: '대구은행' },
  { code: '032', name: '부산은행' },
  { code: '090', name: '카카오뱅크' },
  { code: '092', name: '토스뱅크' },
  { code: '089', name: '케이뱅크' },
];

// 에러 코드
export const STORE_ERROR_CODES = {
  DUPLICATE_BUSINESS_NUMBER: '이미 등록된 사업자번호입니다.',
  DUPLICATE_CODE: '이미 사용중인 매장코드입니다.',
  INVALID_BUSINESS_NUMBER: '유효하지 않은 사업자번호 형식입니다.',
  CONTRACT_EXPIRED: '계약이 만료되었습니다.',
  STAFF_ALREADY_LINKED: '이미 해당 매장에 연결된 직원입니다.',
  OWNER_LIMIT_EXCEEDED: '매장당 가맹점주는 1명만 등록 가능합니다.',
  HAS_LINKED_STAFF: '연결된 직원이 있는 매장은 삭제할 수 없습니다.',
} as const;

// ============================================
// 연동 관련 상수
// ============================================

// POS 벤더 목록
export const POS_VENDORS = [
  { code: 'okcashbag', name: 'OK캐쉬백POS' },
  { code: 'kcp', name: 'KCP POS' },
  { code: 'unionpos', name: '유니온포스' },
  { code: 'okpos', name: 'OKPOS' },
  { code: 'other', name: '기타' },
] as const;

// PG사 목록
export const PG_VENDORS = [
  { code: 'smartro', name: '스마트로' },
  { code: 'kcp', name: 'NHN KCP' },
  { code: 'nicepay', name: '나이스페이' },
  { code: 'toss', name: '토스페이먼츠' },
  { code: 'other', name: '기타' },
] as const;

// 교환권 벤더사 목록
export const VOUCHER_VENDORS = [
  { code: 'gifticon', name: '기프티콘' },
  { code: 'kakao', name: '카카오 선물하기' },
  { code: 'naver', name: '네이버 선물' },
  { code: 'cultureland', name: '컬쳐랜드' },
  { code: 'other', name: '기타' },
] as const;

// 노출 채널 목록
export const VISIBILITY_CHANNELS: Array<{
  code: VisibilityChannel;
  name: string;
  icon?: string;
}> = [
    { code: 'app', name: '자사 앱' },
    { code: 'web', name: '웹사이트' },
    { code: 'kiosk', name: '키오스크' },
    { code: 'baemin', name: '배달의민족' },
    { code: 'yogiyo', name: '요기요' },
    { code: 'coupangeats', name: '쿠팡이츠' },
  ];

// 기본 영업시간
export const DEFAULT_OPERATING_HOURS: DayOperatingHours = {
  isOpen: true,
  openTime: '11:00',
  closeTime: '22:00',
  lastOrderMinutes: 30,
};

// 기본 노출 설정
export const DEFAULT_VISIBILITY_SETTINGS: VisibilitySettings = {
  channels: [
    { channel: 'app', isVisible: true, priority: 1 },
    { channel: 'web', isVisible: true, priority: 2 },
    { channel: 'kiosk', isVisible: false },
    { channel: 'baemin', isVisible: false },
    { channel: 'yogiyo', isVisible: false },
    { channel: 'coupangeats', isVisible: false },
  ],
  isSearchable: true,
  showNewBadge: false,
  showEventBadge: false,
  isRecommended: false,
};

// 기본 연동 정보
export const DEFAULT_INTEGRATION_CODES: IntegrationCodes = {
  pos: { isConnected: false },
  sk: { isEnabled: false },
  pg: { isTestMode: true, isEnabled: false },
  voucherVendor: { isEnabled: false },
};

// 기본 요일별 영업시간
export const DEFAULT_DAILY_HOURS: Record<WeekDay, DayOperatingHours> = {
  monday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  tuesday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  wednesday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  thursday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  friday: { isOpen: true, openTime: '11:00', closeTime: '22:00' },
  saturday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
  sunday: { isOpen: true, openTime: '11:00', closeTime: '23:00' },
};

// 기본 결제 수단
export const DEFAULT_PAYMENT_METHODS: PaymentMethods = {
  isCardEnabled: true,
  isCashEnabled: true,
  isPointEnabled: false,
  simplePayments: [
    { type: 'kakaopay', isEnabled: false },
    { type: 'naverpay', isEnabled: false },
    { type: 'tosspay', isEnabled: false },
    { type: 'samsungpay', isEnabled: false },
    { type: 'payco', isEnabled: false },
    { type: 'applepay', isEnabled: false },
  ],
};

// ============================================
// 일괄 업로드 관련 타입
// ============================================

// POS 일괄 업로드 행 데이터
export interface POSBulkUploadRow {
  storeName: string; // 매장명
  businessNumber: string; // 사업자번호
  posVendor: string; // POS 벤더
  posCode: string; // POS 코드
}

// PG 일괄 업로드 행 데이터
export interface PGBulkUploadRow {
  storeName: string; // 매장명
  businessNumber: string; // 사업자번호
  pgVendor: string; // PG사
  mid: string; // MID
  apiKey?: string; // API 키 (선택)
}

// 일괄 업로드 결과
export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    storeName: string;
    businessNumber: string;
    reason: string;
  }>;
}

// 일괄 업로드 미리보기 항목
export interface BulkUploadPreviewItem {
  row: number;
  storeName: string;
  businessNumber: string;
  storeId?: string; // 매칭된 매장 ID
  isMatched: boolean;
  matchError?: string;
  data: Record<string, string>;
}
