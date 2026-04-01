/**
 * 매장 관리 서비스
 * 매장 CRUD 및 매장-직원 연결 관리
 */
import {
  mockStores,
  mockStoreStaffLinks,
  toStoreSummary,
} from '@/lib/api/mockStoreData';
import { mockFranchiseStaff } from '@/lib/api/mockStaffData';
import type {
  Store,
  StoreSummary,
  StoreStaffLink,
  StoreWithStaff,
  StoreFormData,
  StoreStaffLinkFormData,
  StoreStatus,
  ContractStatus,
  Region,
  OperatingInfo,
  IntegrationCodes,
  StoreAmenities,
  OperatingInfoFormData,
  IntegrationCodesFormData,
  AmenitiesFormData,
  POSBulkUploadRow,
  PGBulkUploadRow,
  BulkUploadResult,
  BulkUploadPreviewItem,
  PaymentMethods,
  PaymentMethodsFormData,
} from '@/types/store';
import type { StaffAccount } from '@/types/staff';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface StoreListParams {
  region?: Region;
  status?: StoreStatus;
  contractStatus?: ContractStatus;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface StaffWithStores {
  staff: StaffAccount;
  stores: Array<{
    store: Store;
    link: StoreStaffLink;
  }>;
}

class StoreService {
  private stores: Store[] = [...mockStores];
  private storeStaffLinks: StoreStaffLink[] = [...mockStoreStaffLinks];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // 매장 조회
  // ============================================

  /**
   * 매장 목록 조회 (페이지네이션)
   */
  async getStores(
    params?: StoreListParams
  ): Promise<{ data: Store[]; pagination: Pagination }> {
    await this.delay();

    const {
      region,
      status,
      contractStatus,
      keyword = '',
      page = 1,
      limit = 10,
    } = params || {};

    let result = [...this.stores];

    // 지역 필터
    if (region) {
      result = result.filter((s) => s.address.region === region);
    }

    // 상태 필터
    if (status) {
      result = result.filter((s) => s.status === status);
    }

    // 계약 상태 필터
    if (contractStatus) {
      result = result.filter((s) => s.contract.contractStatus === contractStatus);
    }

    // 키워드 검색 (매장명, 점주명, 사업자번호)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerKeyword) ||
          s.owner.name.toLowerCase().includes(lowerKeyword) ||
          s.business.businessNumber.includes(keyword)
      );
    }

    // 정렬: 최신 등록순
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 매장 요약 목록 조회 (셀렉터용, 페이지네이션 없음)
   */
  async getStoreSummaries(params?: {
    region?: Region;
    status?: StoreStatus;
  }): Promise<StoreSummary[]> {
    await this.delay(100);

    const { region, status } = params || {};

    let result = [...this.stores];

    if (region) {
      result = result.filter((s) => s.address.region === region);
    }

    if (status) {
      result = result.filter((s) => s.status === status);
    }

    // 활성 매장 우선, 이름순 정렬
    result.sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      return a.name.localeCompare(b.name, 'ko');
    });

    return result.map(toStoreSummary);
  }

  /**
   * 매장 상세 조회
   */
  async getStore(id: string): Promise<Store | null> {
    await this.delay();
    return this.stores.find((s) => s.id === id) || null;
  }

  /**
   * 매장 상세 조회 (연결된 직원 포함)
   */
  async getStoreWithStaff(id: string): Promise<StoreWithStaff | null> {
    await this.delay();

    const store = this.stores.find((s) => s.id === id);
    if (!store) {
      return null;
    }

    // 해당 매장에 연결된 직원 조회
    const links = this.storeStaffLinks.filter((link) => link.storeId === id);

    const staffLinks = links
      .map((link) => {
        const staff = mockFranchiseStaff.find((s) => s.id === link.staffId);
        if (!staff) return null;

        return {
          ...link,
          staffName: staff.name,
          staffEmail: staff.email,
          staffPhone: staff.phone,
          staffStatus: staff.status,
        };
      })
      .filter(Boolean) as StoreWithStaff['staffLinks'];

    return {
      ...store,
      staffLinks,
    };
  }

  // ============================================
  // 매장 생성/수정/삭제
  // ============================================

  /**
   * 매장 생성
   */
  async createStore(data: StoreFormData): Promise<Store> {
    await this.delay();

    // 사업자번호 중복 검사
    const isDuplicate = await this.checkBusinessNumberDuplicate(
      data.business.businessNumber
    );
    if (isDuplicate) {
      throw new Error('이미 등록된 사업자번호입니다.');
    }

    const newStore: Store = {
      id: `store-${Date.now()}`,
      name: data.name,
      code: data.code,
      branchId: data.branchId,
      status: data.status || 'pending',
      address: data.address,
      owner: data.owner,
      business: data.business,
      contract: {
        ...data.contract,
        contractDate: new Date(data.contract.contractDate),
        expirationDate: new Date(data.contract.expirationDate),
      },
      bankAccount: data.bankAccount,
      openingDate: data.openingDate ? new Date(data.openingDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
    };

    this.stores.unshift(newStore);
    return newStore;
  }

  /**
   * 매장 수정
   */
  async updateStore(
    id: string,
    data: Partial<StoreFormData>
  ): Promise<Store> {
    await this.delay();

    const store = this.stores.find((s) => s.id === id);
    if (!store) {
      throw new Error('매장을 찾을 수 없습니다.');
    }

    // 사업자번호 변경 시 중복 검사
    if (
      data.business?.businessNumber &&
      data.business.businessNumber !== store.business.businessNumber
    ) {
      const isDuplicate = await this.checkBusinessNumberDuplicate(
        data.business.businessNumber,
        id
      );
      if (isDuplicate) {
        throw new Error('이미 등록된 사업자번호입니다.');
      }
    }

    // 필드 업데이트
    if (data.name !== undefined) store.name = data.name;
    if (data.code !== undefined) store.code = data.code;
    if (data.status !== undefined) store.status = data.status;
    if (data.address) store.address = { ...store.address, ...data.address };
    if (data.owner) store.owner = { ...store.owner, ...data.owner };
    if (data.business) store.business = { ...store.business, ...data.business };
    if (data.contract) {
      store.contract = {
        ...store.contract,
        ...data.contract,
        contractDate: data.contract.contractDate
          ? new Date(data.contract.contractDate)
          : store.contract.contractDate,
        expirationDate: data.contract.expirationDate
          ? new Date(data.contract.expirationDate)
          : store.contract.expirationDate,
      };
    }
    if (data.bankAccount)
      store.bankAccount = { ...store.bankAccount, ...data.bankAccount };
    if (data.openingDate !== undefined) {
      store.openingDate = data.openingDate
        ? new Date(data.openingDate)
        : undefined;
    }
    store.updatedAt = new Date();
    return store;
  }

  /**
   * 매장 삭제
   */
  async deleteStore(id: string): Promise<void> {
    await this.delay();

    const index = this.stores.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('매장을 찾을 수 없습니다.');
    }

    // 연결된 직원이 있는지 확인
    const hasLinkedStaff = this.storeStaffLinks.some(
      (link) => link.storeId === id
    );
    if (hasLinkedStaff) {
      throw new Error(
        '연결된 직원이 있는 매장은 삭제할 수 없습니다. 먼저 직원 연결을 해제해주세요.'
      );
    }

    this.stores.splice(index, 1);
  }

  // ============================================
  // 매장-직원 연결 관리
  // ============================================

  /**
   * 직원을 매장에 연결
   */
  async linkStaffToStore(data: StoreStaffLinkFormData): Promise<StoreStaffLink> {
    await this.delay();

    // 매장 존재 확인
    const store = this.stores.find((s) => s.id === data.storeId);
    if (!store) {
      throw new Error('매장을 찾을 수 없습니다.');
    }

    // 직원 존재 확인
    const staff = mockFranchiseStaff.find((s) => s.id === data.staffId);
    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    // 이미 연결되어 있는지 확인
    const existingLink = this.storeStaffLinks.find(
      (link) => link.storeId === data.storeId && link.staffId === data.staffId
    );
    if (existingLink) {
      throw new Error('이미 해당 매장에 연결된 직원입니다.');
    }

    // owner 역할인 경우, 해당 매장에 이미 owner가 있는지 확인
    if (data.role === 'owner') {
      const existingOwner = this.storeStaffLinks.find(
        (link) => link.storeId === data.storeId && link.role === 'owner'
      );
      if (existingOwner) {
        throw new Error('이 매장에는 이미 점주가 지정되어 있습니다.');
      }
    }

    const newLink: StoreStaffLink = {
      id: `link-${Date.now()}`,
      storeId: data.storeId,
      staffId: data.staffId,
      role: data.role,
      isPrimary: data.isPrimary || false,
      createdAt: new Date(),
      createdBy: 'admin',
    };

    this.storeStaffLinks.push(newLink);
    return newLink;
  }

  /**
   * 직원-매장 연결 해제
   */
  async unlinkStaffFromStore(linkId: string): Promise<void> {
    await this.delay();

    const index = this.storeStaffLinks.findIndex((link) => link.id === linkId);
    if (index === -1) {
      throw new Error('연결 정보를 찾을 수 없습니다.');
    }

    this.storeStaffLinks.splice(index, 1);
  }

  /**
   * 직원이 연결된 매장 목록 조회
   */
  async getStoresForStaff(staffId: string): Promise<StaffWithStores> {
    await this.delay();

    const staff = mockFranchiseStaff.find((s) => s.id === staffId);
    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    const links = this.storeStaffLinks.filter((link) => link.staffId === staffId);

    const stores = links
      .map((link) => {
        const store = this.stores.find((s) => s.id === link.storeId);
        if (!store) return null;
        return { store, link };
      })
      .filter(Boolean) as StaffWithStores['stores'];

    return { staff, stores };
  }

  /**
   * 해당 매장에 연결되지 않은 직원 목록 조회 (연결 모달용)
   */
  async getUnlinkedStaff(storeId: string): Promise<StaffAccount[]> {
    await this.delay();

    // 이미 연결된 직원 ID 목록
    const linkedStaffIds = this.storeStaffLinks
      .filter((link) => link.storeId === storeId)
      .map((link) => link.staffId);

    // 연결되지 않은 활성 직원만 반환
    return mockFranchiseStaff.filter(
      (staff) =>
        !linkedStaffIds.includes(staff.id) && staff.status === 'active'
    );
  }

  /**
   * 매장 연결 정보 업데이트 (역할/주매장 변경)
   */
  async updateStoreStaffLink(
    linkId: string,
    data: Partial<Pick<StoreStaffLink, 'role' | 'isPrimary'>>
  ): Promise<StoreStaffLink> {
    await this.delay();

    const link = this.storeStaffLinks.find((l) => l.id === linkId);
    if (!link) {
      throw new Error('연결 정보를 찾을 수 없습니다.');
    }

    // owner로 변경 시, 해당 매장에 이미 owner가 있는지 확인
    if (data.role === 'owner' && link.role !== 'owner') {
      const existingOwner = this.storeStaffLinks.find(
        (l) => l.storeId === link.storeId && l.role === 'owner' && l.id !== linkId
      );
      if (existingOwner) {
        throw new Error('이 매장에는 이미 점주가 지정되어 있습니다.');
      }
    }

    if (data.role !== undefined) link.role = data.role;
    if (data.isPrimary !== undefined) link.isPrimary = data.isPrimary;

    return link;
  }

  // ============================================
  // 영업정보/연동/노출설정 업데이트
  // ============================================

  /**
   * 영업 정보 업데이트
   */
  async updateOperatingInfo(
    storeId: string,
    data: OperatingInfoFormData
  ): Promise<OperatingInfo> {
    await this.delay();

    const store = this.stores.find((s) => s.id === storeId);
    if (!store) {
      throw new Error('매장을 찾을 수 없습니다.');
    }

    const operatingInfo: OperatingInfo = {
      appOperatingStatus: store.operatingInfo?.appOperatingStatus,
      weekdayHours: data.weekdayHours,
      weekendHours: data.weekendHours,
      holidayHours: data.holidayHours,
      dailyHours: data.dailyHours,
      regularClosedDays: data.regularClosedDays,
      irregularClosedDays: data.irregularClosedDays,
      isTemporarilyClosed: data.isTemporarilyClosed,
      temporaryCloseReason: data.temporaryCloseReason,
      temporaryCloseReasonDetail: data.temporaryCloseReasonDetail,
      temporaryCloseStartDate: data.temporaryCloseStartDate
        ? new Date(data.temporaryCloseStartDate)
        : undefined,
      temporaryCloseEndDate: data.temporaryCloseEndDate
        ? new Date(data.temporaryCloseEndDate)
        : undefined,
      isDeliveryAvailable: data.deliverySettings?.isAvailable ?? data.isDeliveryAvailable,
      isPickupAvailable: data.pickupSettings?.isAvailable ?? data.isPickupAvailable,
      deliverySettings: data.deliverySettings,
      pickupSettings: data.pickupSettings,
      isVisible: data.isVisible,
    };

    store.operatingInfo = operatingInfo;
    store.updatedAt = new Date();

    return operatingInfo;
  }

  /**
   * 연동 코드 정보 업데이트
   */
  async updateIntegrationCodes(
    storeId: string,
    data: IntegrationCodesFormData
  ): Promise<IntegrationCodes> {
    await this.delay();

    const store = this.stores.find((s) => s.id === storeId);
    if (!store) {
      throw new Error('매장을 찾을 수 없습니다.');
    }

    // SK 코드 자동 생성 (V902 + storeCode)
    const skFullCode = data.sk.storeCode
      ? `V902${data.sk.storeCode}`
      : undefined;

    const integrationCodes: IntegrationCodes = {
      pos: {
        posVendor: data.pos.posVendor as IntegrationCodes['pos']['posVendor'],
        posCode: data.pos.posCode,
        isConnected: data.pos.isConnected,
        lastSyncAt: data.pos.isConnected ? new Date() : undefined,
      },
      sk: {
        storeCode: data.sk.storeCode,
        fullCode: skFullCode,
        isEnabled: data.sk.isEnabled,
        registeredAt: data.sk.isEnabled
          ? store.integrationCodes?.sk?.registeredAt || new Date()
          : undefined,
      },
      pg: {
        pgVendor: data.pg.pgVendor as IntegrationCodes['pg']['pgVendor'],
        mid: data.pg.mid,
        apiKey: data.pg.apiKey,
        isTestMode: data.pg.isTestMode,
        isEnabled: data.pg.isEnabled,
        registeredAt: data.pg.isEnabled
          ? store.integrationCodes?.pg?.registeredAt || new Date()
          : undefined,
      },
      voucherVendor: {
        vendorName: data.voucherVendor.vendorName,
        storeCode: data.voucherVendor.storeCode,
        isEnabled: data.voucherVendor.isEnabled,
        registeredAt: data.voucherVendor.isEnabled
          ? store.integrationCodes?.voucherVendor?.registeredAt || new Date()
          : undefined,
      },
    };

    store.integrationCodes = integrationCodes;
    store.updatedAt = new Date();

    return integrationCodes;
  }

  /**
   * 편의시설 정보 업데이트
   */
  async updateAmenities(
    storeId: string,
    data: AmenitiesFormData
  ): Promise<StoreAmenities> {
    await this.delay();

    const store = this.stores.find((s) => s.id === storeId);
    if (!store) {
      throw new Error('매장을 찾을 수 없습니다.');
    }

    const amenities: StoreAmenities = {
      hasParking: data.hasParking,
      parkingNote: data.parkingNote,
      hasDineIn: data.hasDineIn,
      seatCapacity: data.seatCapacity,
      hasWifi: data.hasWifi,
    };

    store.amenities = amenities;
    store.updatedAt = new Date();

    return amenities;
  }

  /**
   * 결제 수단 업데이트
   */
  async updatePaymentMethods(
    storeId: string,
    data: PaymentMethodsFormData
  ): Promise<PaymentMethods> {
    await this.delay();

    const store = this.stores.find((s) => s.id === storeId);
    if (!store) {
      throw new Error('매장을 찾을 수 없습니다.');
    }

    const paymentMethods: PaymentMethods = {
      isCardEnabled: data.isCardEnabled,
      isCashEnabled: data.isCashEnabled,
      isPointEnabled: data.isPointEnabled,
      simplePayments: data.simplePayments,
    };

    store.paymentMethods = paymentMethods;
    store.updatedAt = new Date();

    return paymentMethods;
  }

  // ============================================
  // 검증
  // ============================================

  /**
   * 사업자번호 중복 확인
   */
  async checkBusinessNumberDuplicate(
    businessNumber: string,
    excludeId?: string
  ): Promise<boolean> {
    await this.delay(100);

    const normalized = businessNumber.replace(/-/g, '');
    return this.stores.some((store) => {
      if (excludeId && store.id === excludeId) return false;
      return store.business.businessNumber.replace(/-/g, '') === normalized;
    });
  }

  /**
   * 매장 코드 중복 확인
   */
  async checkStoreCodeDuplicate(
    code: string,
    excludeId?: string
  ): Promise<boolean> {
    await this.delay(100);

    return this.stores.some((store) => {
      if (excludeId && store.id === excludeId) return false;
      return store.code?.toLowerCase() === code.toLowerCase();
    });
  }

  // ============================================
  // 통계
  // ============================================

  /**
   * 매장 통계 조회 (대시보드용)
   */
  async getStoreStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    expiringSoon: number; // 30일 이내 계약 만료
  }> {
    await this.delay(100);

    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    return {
      total: this.stores.length,
      active: this.stores.filter((s) => s.status === 'active').length,
      pending: this.stores.filter((s) => s.status === 'pending').length,
      expiringSoon: this.stores.filter(
        (s) =>
          s.status === 'active' &&
          s.contract.expirationDate <= thirtyDaysLater &&
          s.contract.expirationDate > now
      ).length,
    };
  }

  // ============================================
  // 일괄 업로드 (Bulk Upload)
  // ============================================

  /**
   * 매장 매칭 (매장명 + 사업자번호)
   */
  private findStoreByNameAndBusinessNumber(
    storeName: string,
    businessNumber: string
  ): Store | undefined {
    const normalizedBN = businessNumber.replace(/-/g, '');
    return this.stores.find(
      (s) =>
        s.name === storeName &&
        s.business.businessNumber.replace(/-/g, '') === normalizedBN
    );
  }

  /**
   * POS 일괄 업로드 미리보기
   */
  async previewPOSBulkUpload(rows: POSBulkUploadRow[]): Promise<BulkUploadPreviewItem[]> {
    await this.delay(200);

    return rows.map((row, index) => {
      const store = this.findStoreByNameAndBusinessNumber(
        row.storeName,
        row.businessNumber
      );

      return {
        row: index + 1,
        storeName: row.storeName,
        businessNumber: row.businessNumber,
        storeId: store?.id,
        isMatched: !!store,
        matchError: store ? undefined : '매장을 찾을 수 없습니다.',
        data: {
          posVendor: row.posVendor,
          posCode: row.posCode,
        },
      };
    });
  }

  /**
   * POS 일괄 업로드 실행
   */
  async executePOSBulkUpload(rows: POSBulkUploadRow[]): Promise<BulkUploadResult> {
    await this.delay(500);

    const result: BulkUploadResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    rows.forEach((row, i) => {
      const store = this.findStoreByNameAndBusinessNumber(
        row.storeName,
        row.businessNumber
      );

      if (!store) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          storeName: row.storeName,
          businessNumber: row.businessNumber,
          reason: '매장을 찾을 수 없습니다.',
        });
        return;
      }

      // POS 정보 업데이트
      if (!store.integrationCodes) {
        store.integrationCodes = {
          pos: { isConnected: false },
          sk: { isEnabled: false },
          pg: { isTestMode: true, isEnabled: false },
          voucherVendor: { isEnabled: false },
        };
      }

      store.integrationCodes.pos = {
        posVendor: row.posVendor as IntegrationCodes['pos']['posVendor'],
        posCode: row.posCode,
        isConnected: true,
        lastSyncAt: new Date(),
      };
      store.updatedAt = new Date();
      result.success++;
    });

    return result;
  }

  /**
   * PG 일괄 업로드 미리보기
   */
  async previewPGBulkUpload(rows: PGBulkUploadRow[]): Promise<BulkUploadPreviewItem[]> {
    await this.delay(200);

    return rows.map((row, index) => {
      const store = this.findStoreByNameAndBusinessNumber(
        row.storeName,
        row.businessNumber
      );

      return {
        row: index + 1,
        storeName: row.storeName,
        businessNumber: row.businessNumber,
        storeId: store?.id,
        isMatched: !!store,
        matchError: store ? undefined : '매장을 찾을 수 없습니다.',
        data: {
          pgVendor: row.pgVendor,
          mid: row.mid,
          apiKey: row.apiKey || '',
        },
      };
    });
  }

  /**
   * PG 일괄 업로드 실행
   */
  async executePGBulkUpload(rows: PGBulkUploadRow[]): Promise<BulkUploadResult> {
    await this.delay(500);

    const result: BulkUploadResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    rows.forEach((row, i) => {
      const store = this.findStoreByNameAndBusinessNumber(
        row.storeName,
        row.businessNumber
      );

      if (!store) {
        result.failed++;
        result.errors.push({
          row: i + 1,
          storeName: row.storeName,
          businessNumber: row.businessNumber,
          reason: '매장을 찾을 수 없습니다.',
        });
        return;
      }

      // PG 정보 업데이트
      if (!store.integrationCodes) {
        store.integrationCodes = {
          pos: { isConnected: false },
          sk: { isEnabled: false },
          pg: { isTestMode: true, isEnabled: false },
          voucherVendor: { isEnabled: false },
        };
      }

      store.integrationCodes.pg = {
        pgVendor: row.pgVendor as IntegrationCodes['pg']['pgVendor'],
        mid: row.mid,
        apiKey: row.apiKey,
        isTestMode: false,
        isEnabled: true,
        registeredAt: new Date(),
      };
      store.updatedAt = new Date();
      result.success++;
    });

    return result;
  }
}

export const storeService = new StoreService();
