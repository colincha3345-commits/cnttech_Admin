# API 서비스 레이어 규칙

## 역할
- 프론트엔드와 백엔드 API 사이의 추상화 레이어
- 현재: mock 데이터 기반 → 추후: 실제 REST API 교체 예정
- 페이지 컴포넌트에서 직접 호출 금지 → 반드시 `@/hooks`를 통해 사용

## 호출 체인
```
Page → Hook (@/hooks) → Service (@/services) → API (mock / REST)
```

## 서비스 파일 목록 및 도메인 매핑
| 서비스 | 도메인 | 타입 정의 |
|--------|--------|-----------|
| authService | 로그인/인증/세션 | `@/types/auth` |
| orderService | 주문 조회/취소/메모 | `@/types/order` |
| productService | 상품 CRUD | `@/types/product` |
| categoryService | 카테고리 관리 | `@/types/category` |
| optionCategoryService | 옵션 항목 CRUD | `@/types/product` |
| optionGroupService | 옵션 그룹 CRUD | `@/types/product` |
| discountService | 할인 관리 | `@/types/discount` |
| couponService | 쿠폰 관리 | `@/types/coupon` |
| pointService | 포인트 설정 | `@/types/point` |
| benefitCampaignService | 혜택 캠페인 | `@/types/benefit-campaign` |
| storeService | 매장 관리 | `@/types/store` |
| staffService | 직원 관리 | `@/types/staff` |
| settlementService | 정산 | `@/types/settlement` |
| membershipGradeService | 회원 등급 | `@/types/membership-grade` |
| deliveryZoneService | 배달권역 | `@/types/delivery-zone` |
| userService | HQ 사용자 | `@/types` |
| permissionService | 권한/RBAC | `@/types/permission` |
| auditService | 감사 로그 | `@/types/audit` |
| supportService | 고객지원 | `@/types/support` |
| eventService | 이벤트 | `@/types/event` |
| designService | 디자인 관리 | `@/types/design` |
| contentService | 콘텐츠 관리 | `@/types/content` |
| dashboardService | 대시보드 통계 | 자체 정의 |

## 작성 규칙

### 네이밍
- 파일: camelCase + `Service` 접미사 (`orderService.ts`)
- 클래스: PascalCase (`OrderService`)
- 메서드: camelCase, CRUD 동사 접두사 (`getOrders`, `createProduct`, `updateStore`, `deleteOption`)

### 구조 패턴
```typescript
// 1. 타입 import
import type { Order, OrderSearchFilter } from '@/types/order';

// 2. 클래스 또는 함수 export
class OrderService {
  private delay(ms = 300): Promise<void> { ... }

  /** 목록 조회 — 필터 + 페이지네이션 */
  async getOrders(filter: OrderSearchFilter): Promise<{ data: Order[]; pagination: Pagination }> { ... }

  /** 단건 조회 */
  async getOrder(id: string): Promise<Order | null> { ... }

  /** 상태 변경 */
  async updateStatus(id: string, status: OrderStatus): Promise<void> { ... }
}

export const orderService = new OrderService();
```

### API 교체 가이드 (mock → REST)
```typescript
// Before (mock)
async getOrders(filter) {
  await this.delay();
  return this.orders.filter(...);
}

// After (REST)
async getOrders(filter) {
  const res = await fetch(`/api/orders?${qs.stringify(filter)}`);
  if (!res.ok) throw new ApiError(res.status);
  return res.json();
}
```
- mock `delay()` → 실제 네트워크 요청으로 교체
- `this.orders` 로컬 배열 → API 엔드포인트 호출
- 응답 형식: `{ data: T[], pagination: { page, limit, total, totalPages } }`
- 에러: HTTP status 기반 `ApiError` throw

### 금지 사항
- `any` 타입 금지
- 서비스 내 UI 로직(Toast, Alert) 금지 → Hook/Page에서 처리
- 서비스 간 직접 호출 금지 (순환 의존 방지)
- `console.log` 커밋 금지

## 비즈니스 정책 (서비스에서 검증)
- 할인/쿠폰/포인트 중복 적용 불가 → 서버 검증 필수
- 에러코드: `DISCOUNT_COUPON_CONFLICT`, `DISCOUNT_POINT_CONFLICT`
- 주문 취소: 상태별 취소 가능 여부 검증
- 인증: 로그인 시도 5회 초과 시 15분 잠금
