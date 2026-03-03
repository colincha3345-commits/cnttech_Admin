import type { Product, ProductFormData, Store, ProductOptionGroup, DisplayOrderUpdate } from '../types/product';

// Mock 데이터
const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: '뿌링클',
    price: 15000,
    description: 'BHC 대표 메뉴, 달콤한 치즈 가루와 바삭한 치킨의 조화',
    imageUrl: 'https://via.placeholder.com/400x300?text=뿌링클',
    tags: [{ code: 'MAIN', name: '메인', color: '#FF6B6B' }],
    mainCategoryId: '1',
    mainCategoryName: '한마리',
    subCategoryIds: [],
    subCategoryNames: [],
    optionGroups: [
      {
        id: 'opt-1',
        name: '사이즈 선택',
        isRequired: true,
        isApplied: true,
        options: [
          { id: 'opt-1-1', name: '레귤러', price: 0 },
          { id: 'opt-1-2', name: '라지', price: 2000 },
        ],
      },
    ],
    status: 'active',
    isVisible: true,
    applyToAll: true,
    storeIds: [],
    posCode: 'M001',
    allowCoupon: true,
    allowVoucher: true,
    allowGiftCard: false,
    origin: [
      { ingredient: '닭고기', origin: '국내산' },
      { ingredient: '치즈가루', origin: '미국산' },
    ],
    nutrition: {
      calories: 850,
      sodium: 1200,
      carbs: 65,
      sugar: 15,
      fat: 45,
      protein: 35,
      servingSize: '1마리',
    },
    allergens: [
      { code: 'MILK', name: '유제품' },
      { code: 'WHEAT', name: '밀' },
    ],
    badgeIds: ['badge-001'],
    displayOrder: 1,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'colin@cntt.co.kr',
  },
  {
    id: 'prod-2',
    name: '맛초킹',
    price: 15000,
    description: '매콤달콤한 맛의 치킨',
    imageUrl: 'https://via.placeholder.com/400x300?text=맛초킹',
    tags: [{ code: 'MAIN', name: '메인', color: '#FF6B6B' }],
    mainCategoryId: '1',
    mainCategoryName: '한마리',
    subCategoryIds: [],
    subCategoryNames: [],
    optionGroups: [],
    status: 'active',
    isVisible: true,
    applyToAll: true,
    storeIds: [],
    allowCoupon: true,
    allowVoucher: true,
    allowGiftCard: false,
    origin: [{ ingredient: '닭고기', origin: '국내산' }],
    nutrition: {
      calories: 900,
      sodium: 1400,
      carbs: 70,
      sugar: 20,
      fat: 48,
      protein: 38,
      servingSize: '1마리',
    },
    allergens: [{ code: 'WHEAT', name: '밀' }],
    badgeIds: ['badge-002'],
    displayOrder: 2,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'colin@cntt.co.kr',
  },
  {
    id: 'prod-3',
    name: '콜라',
    price: 2000,
    description: '시원한 콜라',
    imageUrl: 'https://via.placeholder.com/400x300?text=콜라',
    tags: [{ code: 'DRINK', name: '음료', color: '#4ECDC4' }],
    mainCategoryId: '3',
    mainCategoryName: '음료',
    subCategoryIds: [],
    subCategoryNames: [],
    optionGroups: [],
    status: 'inactive',
    isVisible: false,
    applyToAll: true,
    storeIds: [],
    allowCoupon: false,
    allowVoucher: false,
    allowGiftCard: false,
    origin: [],
    nutrition: {
      calories: 200,
      sodium: 50,
      carbs: 50,
      sugar: 50,
      fat: 0,
      protein: 0,
      servingSize: '500ml',
    },
    allergens: [],
    badgeIds: [],
    displayOrder: 3,
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-15'),
    createdBy: 'colin@cntt.co.kr',
  },
];

const mockStores: Store[] = [
  { id: 'store-1', name: '강남점', region: '서울', address: '서울시 강남구 테헤란로 123' },
  { id: 'store-2', name: '홍대점', region: '서울', address: '서울시 마포구 양화로 456' },
  { id: 'store-3', name: '부산 서면점', region: '부산', address: '부산시 부산진구 서면로 789' },
  { id: 'store-4', name: '대구 동성로점', region: '대구', address: '대구시 중구 동성로 111' },
  { id: 'store-5', name: '인천 구월점', region: '인천', address: '인천시 남동구 구월로 222' },
];

const mockOptionGroups: ProductOptionGroup[] = [
  {
    id: 'opt-1',
    name: '사이즈 선택',
    isRequired: true,
    isApplied: false,
    options: [
      { id: 'opt-1-1', name: '레귤러', price: 0 },
      { id: 'opt-1-2', name: '라지', price: 2000 },
    ],
  },
  {
    id: 'opt-2',
    name: '토핑 추가',
    isRequired: false,
    isApplied: false,
    options: [
      { id: 'opt-2-1', name: '치즈 추가', price: 1000 },
      { id: 'opt-2-2', name: '베이컨 추가', price: 1500 },
    ],
  },
  {
    id: 'opt-3',
    name: '소스 선택',
    isRequired: false,
    isApplied: false,
    options: [
      { id: 'opt-3-1', name: '양념소스', price: 0 },
      { id: 'opt-3-2', name: '갈릭소스', price: 500 },
      { id: 'opt-3-3', name: '허니머스터드', price: 500 },
    ],
  },
];

// Mock API 서비스
class ProductService {
  private products: Product[] = [...mockProducts];
  private stores: Store[] = [...mockStores];
  private optionGroups: ProductOptionGroup[] = [...mockOptionGroups];

  // 메뉴 목록 조회
  async getProducts(params?: {
    categoryId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: Product[]; pagination: { page: number; limit: number; total: number } }> {
    await this.delay();

    let filtered = [...this.products];

    // 카테고리 필터
    if (params?.categoryId) {
      filtered = filtered.filter((p) => p.mainCategoryId === params.categoryId);
    }

    // 상태 필터
    if (params?.status) {
      filtered = filtered.filter((p) => p.status === params.status);
    }

    // 검색
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search)
      );
    }

    // displayOrder 기준 정렬
    filtered = filtered.sort((a, b) => a.displayOrder - b.displayOrder);

    // 페이지네이션
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paged = filtered.slice(start, end);

    return {
      data: paged,
      pagination: {
        page,
        limit,
        total: filtered.length,
      },
    };
  }

  // 메뉴 상세 조회
  async getProduct(id: string): Promise<Product | null> {
    await this.delay();
    return this.products.find((p) => p.id === id) || null;
  }

  // 메뉴 생성
  async createProduct(data: ProductFormData): Promise<Product> {
    await this.delay();

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      name: data.name,
      price: data.price,
      description: data.description,
      imageUrl: data.imageUrl || 'https://via.placeholder.com/400x300?text=New+Product',
      tags: data.tags.map((code) => ({ code, name: this.getTagName(code) })),
      mainCategoryId: data.mainCategoryId,
      subCategoryIds: data.subCategoryIds,
      optionGroups: this.optionGroups
        .filter((og) => data.optionGroupIds.includes(og.id))
        .map((og) => ({ ...og, isApplied: true })),
      status: data.status,
      isVisible: data.isVisible,
      scheduledAt: data.scheduledAt,
      applyToAll: data.applyToAll,
      storeIds: data.storeIds,
      posCode: data.posCode,
      allowCoupon: data.allowCoupon,
      allowVoucher: data.allowVoucher,
      allowGiftCard: data.allowGiftCard,
      origin: data.origin,
      nutrition: data.nutrition,
      allergens: data.allergens.map((code) => ({ code, name: this.getAllergenName(code) })),
      badgeIds: data.badgeIds || [],
      displayOrder: data.displayOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'colin@cntt.co.kr',
    };

    this.products.push(newProduct);
    return newProduct;
  }

  // 메뉴 수정
  async updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product> {
    await this.delay();

    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('메뉴를 찾을 수 없습니다');
    }

    const existing = this.products[index];
    if (!existing) {
      throw new Error('메뉴를 찾을 수 없습니다');
    }
    const updated: Product = {
      ...existing,
      ...Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      ),
      id: existing.id,
      createdAt: existing.createdAt,
      createdBy: existing.createdBy,
      updatedAt: new Date(),
    };

    this.products[index] = updated;
    return updated;
  }

  // 메뉴 삭제
  async deleteProduct(id: string): Promise<{ message: string; meta: { affectedStores: number } }> {
    await this.delay();

    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new Error('메뉴를 찾을 수 없습니다');
    }

    const product = this.products[index];
    if (!product) {
      throw new Error('메뉴를 찾을 수 없습니다');
    }
    const affectedStores = product.applyToAll ? this.stores.length : product.storeIds.length;

    this.products.splice(index, 1);

    return {
      message: '메뉴가 삭제되었습니다',
      meta: { affectedStores },
    };
  }

  // 이미지 업로드 (Mock)
  async uploadImage(file: File): Promise<{ imageUrl: string }> {
    await this.delay(1000);

    // Mock: 실제로는 서버에 업로드하고 URL을 받아옴
    const mockUrl = `https://via.placeholder.com/400x300?text=${encodeURIComponent(file.name)}`;

    return { imageUrl: mockUrl };
  }

  // 가맹점 목록 조회
  async getStores(params?: { region?: string; search?: string }): Promise<Store[]> {
    await this.delay();

    let filtered = [...this.stores];

    if (params?.region) {
      filtered = filtered.filter((s) => s.region === params.region);
    }

    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) || s.address.toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  // 옵션 그룹 목록 조회
  async getOptionGroups(): Promise<ProductOptionGroup[]> {
    await this.delay();
    return [...this.optionGroups];
  }

  // 포스 코드 중복 검증
  async validatePosCode(posCode: string, productId?: string): Promise<boolean> {
    await this.delay();

    const existing = this.products.find((p) => p.posCode === posCode);

    if (!productId) {
      return existing === undefined;
    }

    return existing === undefined || existing.id === productId;
  }

  // 일괄 노출순서 업데이트
  async updateDisplayOrders(updates: DisplayOrderUpdate[]): Promise<void> {
    await this.delay();

    updates.forEach(({ productId, displayOrder }) => {
      const product = this.products.find((p) => p.id === productId);
      if (product) {
        product.displayOrder = displayOrder;
        product.updatedAt = new Date();
      }
    });
  }

  // Helper: Delay 시뮬레이션
  private delay(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Helper: 태그 이름 변환
  private getTagName(code: string): string {
    const tagMap: Record<string, string> = {
      MAIN: '메인',
      SIDE: '사이드',
      DRINK: '음료',
      DESSERT: '디저트',
    };
    return tagMap[code] || code;
  }

  // Helper: 알레르기 이름 변환
  private getAllergenName(code: string): string {
    const allergenMap: Record<string, string> = {
      MILK: '유제품',
      WHEAT: '밀',
      EGG: '계란',
      SOY: '대두',
      PEANUT: '땅콩',
      SHELLFISH: '갑각류',
    };
    return allergenMap[code] || code;
  }
}

export const productService = new ProductService();
