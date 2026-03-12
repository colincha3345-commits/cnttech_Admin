/**
 * 상권(배달 구역) 관리 서비스
 */
import type {
  DeliveryZone,
  DeliveryZoneFormData,
  DeliveryZoneListParams,
} from '@/types/delivery-zone';

// ============================================
// Mock 데이터
// ============================================

const mockDeliveryZones: DeliveryZone[] = [
  {
    id: 'dz-001',
    storeId: 'store-1',
    storeName: '강남점',
    name: '강남 기본 상권',
    zoneLevel: 'main',
    type: 'radius',
    center: { lat: 37.4979, lng: 127.0276 },
    radius: 3,
    deliveryFee: 3000,
    minOrderAmount: 15000,
    isActive: true,
    color: '#3B82F6',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-15'),
  },
  {
    id: 'dz-002',
    storeId: 'store-1',
    storeName: '강남점',
    name: '강남 확장 상권',
    zoneLevel: 'main',
    type: 'radius',
    center: { lat: 37.4979, lng: 127.0276 },
    radius: 5,
    deliveryFee: 5000,
    minOrderAmount: 20000,
    isActive: true,
    color: '#10B981',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: 'dz-005',
    storeId: 'store-1',
    storeName: '강남점',
    name: '강남역 소상권',
    zoneLevel: 'sub',
    parentZoneId: 'dz-001',
    type: 'radius',
    center: { lat: 37.4979, lng: 127.0276 },
    radius: 1.5,
    deliveryFee: 1000,
    isActive: true,
    color: '#8B5CF6',
    createdAt: new Date('2025-02-10'),
    updatedAt: new Date('2025-02-10'),
  },
  {
    id: 'dz-003',
    storeId: 'store-2',
    storeName: '홍대점',
    name: '홍대 기본 상권',
    zoneLevel: 'main',
    type: 'radius',
    center: { lat: 37.5563, lng: 126.9236 },
    radius: 2.5,
    deliveryFee: 2500,
    minOrderAmount: 12000,
    isActive: true,
    color: '#F59E0B',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
  },
  {
    id: 'dz-004',
    storeId: 'store-3',
    storeName: '부산 서면점',
    name: '서면 기본 상권',
    zoneLevel: 'main',
    type: 'radius',
    center: { lat: 37.5133, lng: 127.1001 },
    radius: 4,
    deliveryFee: 3500,
    isActive: false,
    color: '#EF4444',
    createdAt: new Date('2025-03-01'),
    updatedAt: new Date('2025-03-01'),
  },
];

// ============================================
// 서비스
// ============================================

class DeliveryZoneService {
  private zones: DeliveryZone[] = [...mockDeliveryZones];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getDeliveryZones(
    params?: DeliveryZoneListParams
  ): Promise<DeliveryZone[]> {
    await this.delay();

    const { storeId, isActive, keyword } = params || {};
    let result = [...this.zones];

    if (storeId) {
      result = result.filter((z) => z.storeId === storeId);
    }

    if (isActive !== undefined) {
      result = result.filter((z) => z.isActive === isActive);
    }

    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter(
        (z) =>
          z.name.toLowerCase().includes(lower) ||
          z.storeName.toLowerCase().includes(lower)
      );
    }

    // 메인상권 우선, 생성일 내림차순
    return result.sort((a, b) => {
      if (a.zoneLevel !== b.zoneLevel) {
        return a.zoneLevel === 'main' ? -1 : 1;
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  async getDeliveryZone(id: string): Promise<DeliveryZone | null> {
    await this.delay();
    return this.zones.find((z) => z.id === id) || null;
  }

  async createDeliveryZone(data: DeliveryZoneFormData): Promise<DeliveryZone> {
    await this.delay();

    const storeCoords: Record<string, { lat: number; lng: number; name: string }> = {
      'store-1': { lat: 37.4979, lng: 127.0276, name: '강남점' },
      'store-2': { lat: 37.5563, lng: 126.9236, name: '홍대점' },
      'store-3': { lat: 37.5133, lng: 127.1001, name: '부산 서면점' },
    };

    const storeInfo = storeCoords[data.storeId] || {
      lat: 37.5665, lng: 126.978, name: '알 수 없는 매장',
    };

    const newZone: DeliveryZone = {
      id: `dz-${Date.now()}`,
      storeId: data.storeId,
      storeName: storeInfo.name,
      name: data.name,
      zoneLevel: data.zoneLevel,
      parentZoneId: data.parentZoneId,
      type: data.type,
      center: data.center ?? { lat: storeInfo.lat, lng: storeInfo.lng },
      radius: data.radius,
      polygon: data.polygon,
      deliveryFee: data.deliveryFee,
      minOrderAmount: data.zoneLevel === 'main' ? data.minOrderAmount : undefined,
      isActive: data.isActive,
      color: data.color,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.zones.push(newZone);
    return newZone;
  }

  async updateDeliveryZone(
    id: string,
    data: Partial<DeliveryZoneFormData>
  ): Promise<DeliveryZone> {
    await this.delay();

    const index = this.zones.findIndex((z) => z.id === id);
    if (index === -1) throw new Error('상권을 찾을 수 없습니다.');

    const existing = this.zones[index]!;
    const updated: DeliveryZone = {
      ...existing,
      name: data.name ?? existing.name,
      zoneLevel: data.zoneLevel ?? existing.zoneLevel,
      parentZoneId: data.parentZoneId ?? existing.parentZoneId,
      type: data.type ?? existing.type,
      center: data.center ?? existing.center,
      radius: data.radius ?? existing.radius,
      polygon: data.polygon ?? existing.polygon,
      deliveryFee: data.deliveryFee ?? existing.deliveryFee,
      minOrderAmount: data.zoneLevel === 'sub' ? undefined : (data.minOrderAmount ?? existing.minOrderAmount),
      isActive: data.isActive ?? existing.isActive,
      color: data.color ?? existing.color,
      updatedAt: new Date(),
    };
    this.zones[index] = updated;

    return updated;
  }

  async deleteDeliveryZone(id: string): Promise<void> {
    await this.delay();

    const index = this.zones.findIndex((z) => z.id === id);
    if (index === -1) throw new Error('상권을 찾을 수 없습니다.');

    this.zones.splice(index, 1);
  }
}

export const deliveryZoneService = new DeliveryZoneService();

// ============================================
// Real API 엔드포인트 (백엔드 연동 시)
// ============================================
// GET    /api/delivery-zones?storeId=&isActive=&keyword=&page=&limit=  → 목록 조회
// GET    /api/delivery-zones/:id                                       → 상세 조회
// POST   /api/delivery-zones                                           → 생성 (minOrderAmount: 메인상권만)
// PATCH  /api/delivery-zones/:id                                       → 수정 (minOrderAmount: 메인상권만)
// DELETE /api/delivery-zones/:id                                       → 삭제
//
// 주의: 최소주문금액(minOrderAmount)은 메인상권(zoneLevel='main')에서만 설정 가능
//       소상권(zoneLevel='sub')은 minOrderAmount를 null로 전송
//       매장(Store)의 DeliverySettings.minOrderAmount는 해당 매장의 메인상권 값을 참조 (읽기전용)
