// 메뉴 관리 타입 정의

export type ProductStatus = 'active' | 'inactive' | 'pending';

export interface ProductTag {
  code: string;
  name: string;
  color?: string;
}

export interface ProductOption {
  id: string;
  name: string;
  price: number;
}

export interface ProductOptionGroup {
  id: string;
  name: string;
  isRequired: boolean;
  isApplied: boolean;
  options: ProductOption[];
}

export interface OriginInfo {
  ingredient: string;
  origin: string;
}

export interface NutritionInfo {
  calories: number;
  sodium: number;
  carbs: number;
  sugar: number;
  fat: number;
  protein: number;
  servingSize: string;
  sizeName?: string; // 사이즈명 (예: 레귤러, 라지)
}

/**
 * 사이즈/옵션별 영양정보
 */
export interface NutritionBySize {
  id: string;
  sizeName: string; // 예: "레귤러", "라지"
  nutrition: NutritionInfo;
}

export interface Allergen {
  code: string;
  name: string;
}

/**
 * 채널별 노출 설정
 * 주문앱 / POS / 키오스크 / 테이블오더 각 채널의 노출 여부
 */
export interface ProductChannels {
  app: boolean;              // 주문앱 노출
  pos: boolean;              // POS 노출
  kiosk: boolean;            // 키오스크 노출
  tableOrder: boolean;       // 테이블오더 노출
}

/**
 * POS 버튼 색상 팔레트 프리셋
 */
export const POS_COLOR_PALETTE = [
  '#FF6B35', '#FF4D4F', '#FA8C16', '#FADB14',
  '#52C41A', '#13C2C2', '#1890FF', '#722ED1',
  '#EB2F96', '#8C8C8C', '#262626', '#FFFFFF',
] as const;

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  subImageUrls?: string[]; // 서브 이미지 (최대 5개)

  // 속성 태그
  tags: ProductTag[];

  // 카테고리 (다중 1차+2차 쌍)
  categoryPairs?: CategoryPair[];
  // Legacy
  mainCategoryId: string;
  mainCategoryName?: string;
  subCategoryIds: string[];
  subCategoryNames?: string[];

  // 옵션
  optionGroups: ProductOptionGroup[];

  // 판매 설정
  status: ProductStatus;
  isVisible: boolean;
  scheduledAt?: Date;

  // 판매기간
  salesStartDate?: Date;
  salesEndDate?: Date;

  // 가맹점 적용
  applyToAll: boolean;
  storeIds: string[];

  // 포스 연동
  posCode?: string;
  posDisplayName?: string;       // POS 표시용 상품명 (미입력 시 name 사용)
  posColor?: string;             // POS 버튼 색상 (HEX, 예: #FF6B35)

  // 채널별 노출 설정 (미설정 시 전체 채널 노출)
  channels?: ProductChannels;

  // 결제 정책
  allowCoupon: boolean;
  allowVoucher: boolean;
  allowGiftCard: boolean;

  // 상세 정보
  origin: OriginInfo[];
  nutrition: NutritionInfo;
  nutritionBySize?: NutritionBySize[]; // 사이즈별 영양정보
  allergens: Allergen[];

  // 아이콘뱃지
  badgeIds: string[];

  // 표시 순서
  displayOrder: number;

  // 메타
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * 카테고리 쌍 (1차 + 2차 조합)
 */
export interface CategoryPair {
  id: string;
  mainCategoryId: string;
  subCategoryId: string;
}

export interface ProductFormData {
  // 기본 정보
  name: string;
  price: number;
  description: string;
  imageFile?: File;
  imageUrl?: string;
  subImageUrls?: string[]; // 서브 이미지 (최대 5개)
  subImageFiles?: File[];
  tags: string[];

  // 카테고리 (다중 1차+2차 쌍)
  categoryPairs: CategoryPair[];
  // Legacy (하위 호환)
  mainCategoryId: string;
  subCategoryIds: string[];

  // 옵션
  optionGroupIds: string[];

  // 판매 설정
  status: ProductStatus;
  isVisible: boolean;
  scheduledAt?: Date;

  // 판매기간
  salesStartDate?: Date;
  salesEndDate?: Date;

  // 가맹점
  applyToAll: boolean;
  storeIds: string[];

  // 포스
  posCode?: string;
  posDisplayName?: string;
  posColor?: string;

  // 채널별 노출 (미설정 시 전체 채널 노출)
  channels?: ProductChannels;

  // 결제 정책
  allowCoupon: boolean;
  allowVoucher: boolean;
  allowGiftCard: boolean;

  // 상세 정보
  origin: OriginInfo[];
  nutrition: NutritionInfo;
  nutritionBySize?: NutritionBySize[]; // 사이즈별 영양정보
  allergens: string[];

  // 아이콘뱃지
  badgeIds: string[];

  // 표시 순서
  displayOrder: number;
}

export interface Store {
  id: string;
  name: string;
  region: string;
  address: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors?: string[];
  error?: string;
}

export interface ApplyResult {
  success: boolean;
  appliedCount: number;
}

/**
 * 일괄변경 타입 정의
 */
export type BulkEditType = 'status' | 'price' | 'stock';

export interface BulkPriceUpdate {
  changeType: 'fixed' | 'percentage';
  value: number;
}

export interface BulkStatusUpdate {
  status: ProductStatus;
}

export interface BulkStockUpdate {
  isVisible: boolean;
}

export type BulkEditUpdate =
  | { type: 'status'; data: BulkStatusUpdate }
  | { type: 'price'; data: BulkPriceUpdate }
  | { type: 'stock'; data: BulkStockUpdate };

/**
 * 일괄변경 결과
 */
export interface BulkUpdateResult {
  success: string[]; // 성공한 product IDs
  failed: Array<{
    id: string;
    name: string;
    reason: string;
  }>;
  successCount: number;
  failCount: number;
}

/**
 * 노출순서 관리 타입
 */
export interface DisplayOrderUpdate {
  productId: string;
  displayOrder: number;
}

export interface BulkDisplayOrderUpdate {
  updates: DisplayOrderUpdate[];
}

/**
 * 옵션 카테고리 (옵션 메뉴)
 */
export interface OptionCategory {
  id: string;
  name: string;              // 옵션명
  posCode: string;           // 포스코드
  price: number;             // 가격
  maxQuantity: number;       // 최대 선택 수량 (1~99)
  imageUrl?: string;         // 옵션 이미지 (선택사항)
  isVisible: boolean;        // 노출 여부
  displayOrder: number;      // 표시 순서
  createdAt: Date;
  updatedAt: Date;
}

export interface OptionCategoryFormData {
  name: string;
  posCode: string;
  price: number;
  maxQuantity: number;       // 최대 선택 수량 (1~99)
  imageFile?: File;
  imageUrl?: string;
  isVisible: boolean;
  displayOrder: number;
}

/**
 * 옵션 그룹 아이템 타입 (옵션 vs 상품)
 */
export type OptionItemType = 'option' | 'product';

/**
 * 가격 계산 방식
 * - original: 원가 그대로 사용 (기본 옵션 가격)
 * - override: 그룹 내 지정 가격 사용 (예: 반반피자에서 불고기피자 선택 시 +0원)
 * - differential: 기준 상품 대비 차액 (예: 기본 피자 대비 +3,000원)
 */
export type OptionPriceType = 'original' | 'override' | 'differential';

/**
 * 옵션 그룹 아이템
 * 옵션 또는 상품을 옵션 그룹에 연결할 때 사용
 */
export interface OptionGroupItem {
  id: string;                        // 아이템 고유 ID
  type: OptionItemType;              // 'option' | 'product'
  referenceId: string;               // OptionCategory.id 또는 Product.id
  priceType: OptionPriceType;        // 가격 계산 방식
  overridePrice: number;             // priceType이 'override'일 때 적용 가격
  differentialBaseId?: string;       // priceType이 'differential'일 때 기준 상품 ID
  displayOrder: number;              // 그룹 내 표시 순서
}

/**
 * 옵션 그룹
 * 옵션 및 상품을 성격에 맞게 묶은 바구니
 * 예: [도우 변경], [소스 추가], [사이드 선택], [1+1피자선택]
 */
export interface OptionGroup {
  id: string;
  name: string;              // 그룹명
  isRequired: boolean;       // 필수/선택 여부
  minSelection: number;      // 최소 선택 수량
  maxSelection: number;      // 최대 선택 수량
  displayOrder: number;      // 노출 순서
  isVisible: boolean;        // 노출 여부
  items: OptionGroupItem[];  // 연결된 옵션/상품 목록
  optionIds: string[];       // [Legacy] 연결된 옵션 ID 목록
  createdAt: Date;
  updatedAt: Date;
}

export interface OptionGroupFormData {
  name: string;
  isRequired: boolean;
  minSelection: number;
  maxSelection: number;
  displayOrder: number;
  isVisible: boolean;
  items: OptionGroupItem[];  // 연결된 옵션/상품 목록
  optionIds: string[];       // [Legacy] 연결된 옵션 ID 목록
}

/**
 * 가격 계산 헬퍼 함수용 타입
 */
export interface CalculatedItemPrice {
  itemId: string;
  originalPrice: number;     // 원래 가격 (옵션 또는 상품 가격)
  calculatedPrice: number;   // 계산된 최종 가격
  priceType: OptionPriceType;
  displayText: string;       // 표시 텍스트 (예: "+3,000원", "무료")
}
