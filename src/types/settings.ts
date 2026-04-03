/**
 * 시스템 설정 타입 정의
 * 읽기 전용 — 슈퍼어드민에서 세팅한 브랜드/계약/운영 정보
 */

/** 연동 주체 */
export type IntegrationType = 'PLATFORM' | 'DIRECT';

/** 주문 유형 */
export type SettingsOrderType = 'DELIVERY' | 'PICKUP' | 'RESERVATION' | 'ECOUPON';

/** 브랜드 기본 정보 */
export interface BrandInfo {
  name: string;
  logoUrl: string;
}

/** 최소 주문금액 */
export interface MinOrderAmount {
  delivery: number;
  pickup: number;
}

/** 초기 운영 설정 */
export interface InitialSettings {
  operatingHours: string;
  deliveryFee: number;
  minOrderAmount: MinOrderAmount;
}

/** PG/POS 연동 정보 */
export interface IntegrationInfo {
  provider: string;
  type: IntegrationType;
}

/** 연동 설정 */
export interface IntegrationSettings {
  pg: IntegrationInfo;
  pos: IntegrationInfo;
}

/** 계약 기간 */
export interface ContractPeriod {
  start: string;
  end: string;
}

/** 설정 계약 정보 */
export interface SettingsContractInfo {
  period: ContractPeriod;
  commissionRate: number;
  plan: string;
  managerContact: string;
}

/** 메뉴 설정 권한 */
export type MenuControlType = 'HQ_ONLY' | 'HQ_AND_STORE' | 'STORE_ONLY';

export const MENU_CONTROL_TYPE_LABELS: Record<MenuControlType, string> = {
  HQ_ONLY: '본사 설정',
  HQ_AND_STORE: '본사+가맹점 협업',
  STORE_ONLY: '가맹점 자율',
};

/** 메뉴 설정 권한 상세 */
export interface MenuControlSettings {
  type: MenuControlType;
  /** 본사 기본 메뉴 동기화 여부 */
  syncBaseMenu: boolean;
  /** 가격 수정 허용 여부 */
  allowPriceEdit: boolean;
  /** 신규 메뉴 추가 허용 여부 */
  allowAddMenu: boolean;
  /** 메뉴 삭제 허용 여부 */
  allowDeleteMenu: boolean;
  /** 옵션 수정 허용 여부 */
  allowOptionEdit: boolean;
  /** 품절 처리 허용 여부 */
  allowSoldOut: boolean;
  /** 카테고리 수정 허용 여부 */
  allowCategoryEdit: boolean;
}

/** 지원 링크 */
export interface SupportLinks {
  guideUrl: string;
  inquiryUrl: string;
}

/** 브랜드 설정 전체 (API 응답) */
export interface BrandConfig {
  brandInfo: BrandInfo;
  orderTypes: SettingsOrderType[];
  initialSettings: InitialSettings;
  integration: IntegrationSettings;
  contract: SettingsContractInfo;
  menuControl: MenuControlSettings;
  supportLinks: SupportLinks;
}

export const SETTINGS_ORDER_TYPE_LABELS: Record<SettingsOrderType, string> = {
  DELIVERY: '배달',
  PICKUP: '포장',
  RESERVATION: '예약',
  ECOUPON: '이쿠폰',
};

export const INTEGRATION_TYPE_LABELS: Record<IntegrationType, string> = {
  PLATFORM: '플랫폼 연동',
  DIRECT: '직접 계약',
};
