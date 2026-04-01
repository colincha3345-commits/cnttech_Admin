/**
 * 상권(배달 구역) 관련 타입 정의
 * @file src/types/delivery-zone.ts
 */

// ============================================
// 기본 타입
// ============================================

// 상권 타입
export type ZoneType = 'radius' | 'polygon';

// 상권 레벨
export type ZoneLevel = 'main' | 'sub';

// 좌표
export interface Coordinate {
  lat: number;
  lng: number;
}

// ============================================
// 엔티티
// ============================================

// 배달 구역
export interface DeliveryZone {
  id: string;
  storeId: string;
  storeName: string;
  name: string;
  zoneLevel: ZoneLevel;
  parentZoneId?: string; // 소상권일 때 메인상권 ID
  type: ZoneType;
  center: Coordinate;
  radius?: number; // km (반경 모드)
  polygon?: Coordinate[]; // 폴리곤 좌표
  deliveryFee: number; // 메인상권: 기본 배달비 / 추가상권: 추가 배달비 (고객 청구 = 메인 배달비 + 추가 배달비)
  // minOrderAmount 삭제 — 최소주문금액은 매장관리(Store.deliverySettings)에서 설정
  innerRadius?: number; // 동심원 소상권: 내측 반경 (km)
  outerRadius?: number; // 동심원 소상권: 외측 반경 (km)
  isActive: boolean;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

// 소구역 (2차 구현 예정)
export interface SubZone {
  id: string;
  parentZoneId: string;
  name: string;
  type: ZoneType;
  polygon?: Coordinate[];
  radius?: number;
  center?: Coordinate;
  deliveryFee: number; // 추가배달비
  isActive: boolean;
  color: string;
  priority: number;
}

// ============================================
// 폼 데이터
// ============================================

export interface DeliveryZoneFormData {
  storeId: string;
  name: string;
  zoneLevel: ZoneLevel;
  parentZoneId?: string;
  type: ZoneType;
  radius?: number;
  polygon?: Coordinate[];
  center?: Coordinate;
  deliveryFee: number; // 메인상권: 기본 배달비 / 추가상권: 추가 배달비 (고객 청구 = 메인 배달비 + 추가 배달비)
  // minOrderAmount 삭제 — 매장관리에서 설정
  isActive: boolean;
  color: string;
  // 반경 기반 소상권 자동 생성
  useSubZones?: boolean;          // 소상권 사용 여부 (반경 모드 메인상권 전용)
  subZoneIntervalMeters?: number; // 소상권 거리 간격 (미터, 100m 단위)
}

// 소상권 일괄 생성 시 구간별 입력 데이터
export interface SubZoneInterval {
  innerRadius: number;  // 내측 반경 (km)
  outerRadius: number;  // 외측 반경 (km)
  deliveryFee: number;  // 추가 배달비 (원)
  name: string;         // 표시명 (예: "0m ~ 500m")
}

// ============================================
// 조회 파라미터
// ============================================

export interface DeliveryZoneListParams {
  storeId?: string;
  isActive?: boolean;
  keyword?: string;
  page?: number;
  limit?: number;
}

// ============================================
// 상수
// ============================================

export const ZONE_TYPE_LABELS: Record<ZoneType, string> = {
  radius: '반경',
  polygon: '폴리곤',
};

export const ZONE_LEVEL_LABELS: Record<ZoneLevel, string> = {
  main: '메인 상권',
  sub: '소상권',
};

export const DEFAULT_ZONE_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];
