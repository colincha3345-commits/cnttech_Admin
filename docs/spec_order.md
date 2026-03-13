# 주문(Order) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **주문관리 카테고리**의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/orders` | 주문 목록 (OrderList) | orders:read |
| `/orders/:id` | 주문 상세 (OrderDetail) | orders:read |


## 1. 페이지 프로세스 (Page Process)

1. **주문 목록 조회** — 기본적으로 당일 주문을 최신순으로 노출한다. 상단 필터 영역에서 기간, 주문유형(배달/포장/매장식사), 상태, 매장, 키워드를 조합하여 검색한다.
2. **주문 상세 조회** — 목록 항목 클릭 시 상세 페이지로 이동한다. 3탭(기본정보/결제정보/메모) 구조로 주문 내역, 결제 수단, 할인 적용 현황, 관리자 메모를 확인한다.
3. **주문 상태 변경** — 상세 페이지에서 접수 → 준비중 → 완료 순서로 상태를 전이한다. 취소 시 사유 선택 및 상세 사유 입력 후 처리한다.
4. **복합결제 개별 취소** — 복합결제(mixed) 주문의 경우 개별 결제수단별로 취소를 처리한다. E쿠폰(금액권/교환권)도 개별 취소 대상에 포함한다.
5. **엑셀 내보내기** — 조회 결과를 선택한 컬럼 구성으로 다운로드한다. 백그라운드 처리 후 Toast로 완료를 안내한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **검색 키워드** | Input | N | 최대 50자 | 주문번호, 회원명, 매장명으로 검색한다. |
| **조회 기간** | DateRange | N | YYYY-MM-DD | 기본값은 당일이다. 최대 90일 범위 제한한다. |
| **주문 유형 필터** | Select | N | `delivery`/`pickup`/`dine_in` | 전체/배달/포장/매장식사 선택 가능하다. |
| **주문 상태 필터** | Select | N | 6가지 상태 | pending/confirmed/preparing/ready/completed/cancelled 선택 가능하다. |
| **채널 필터** | Select | N | `app`/`kiosk`/`pos`/`web` | 전체/앱/키오스크/POS/웹 선택한다. |
| **주문번호** | Text (ReadOnly) | Y | - | 상세 화면 최상단에 굵게 표출한다. |
| **주문 상태 Badge** | Badge | Y | - | pending=warning, confirmed=info, preparing=info, ready=success, completed=success, cancelled=critical 색상을 적용한다. |
| **주문자 정보** | Text | Y | - | 회원명 + 마스킹된 연락처를 표출한다. |
| **메뉴 항목** | Table | Y | - | 상품명, 카테고리, 수량, 단가, 소계를 테이블로 렌더링한다. |
| **할인 내역** | Info Row | N | - | 쿠폰명, 쿠폰할인, 포인트사용, 할인합계를 나열한다. |
| **결제 수단** | Badge + Text | Y | - | 카드/현금/간편결제 등 라벨을 Badge로 표출한다. |
| **복합결제 상세** | Table | C(복합결제시) | - | 결제수단별 금액, 상태(결제완료/취소완료), 개별 취소 버튼을 제공한다. |
| **현금영수증** | Text | N | - | 요청여부, 유형(소득공제/지출증빙), 번호를 표출한다. |
| **취소 사유** | Select + Textarea | C(취소시) | 상세사유 최대 200자 | 고객요청/재료소진/매장마감/기타 중 선택 후 상세 입력한다. |
| **관리자 메모** | Textarea + List | N | 메모당 최대 500자 | 작성자와 시각을 함께 표기한다. 삭제 불가 정책이다. |
| **엑셀 컬럼 선택** | Checkbox List | Y | - | 다운로드 전 포함 컬럼을 선택한다. |

**[UI/UX 상호작용 제약사항]**
- 상태 변경 시 이전 단계로의 역행은 허용하지 않는다(completed → preparing 불가). 취소만 예외적으로 모든 상태에서 가능하다.
- 복합결제 개별 취소 시 해당 결제수단의 행만 '취소완료'로 변경하며, 전체 취소가 아님을 안내 메시지로 명시한다.

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 시스템 고유 식별자다. |
| **orderNumber** | String | Y | 자동생성 | 날짜+시퀀스 기반 채번이다. 중복 불가다. |
| **orderType** | Enum | Y | - | 'delivery', 'pickup', 'dine_in' 만 허용한다. |
| **channel** | Enum | Y | - | 'app', 'kiosk', 'pos', 'web' 만 허용한다. |
| **status** | Enum | Y | - | 6가지 상태 전이 규칙을 서버에서 검증한다. |
| **memberId (FK)** | UUID | Y | - | 주문자 회원 참조다. |
| **storeId (FK)** | UUID | Y | - | 주문 매장 참조다. |
| **items** | JSON | Y | 배열, 최소 1개 | [{productId, quantity, unitPrice, options}] 구조다. |
| **subtotalAmount** | Integer | Y | 0 이상 | 상품 합계다. |
| **deliveryFee** | Integer | Y | 0 이상 | 배달 주문 시 배달비다. |
| **totalAmount** | Integer | Y | 0 이상 | 최종 결제 금액이다. |
| **paymentMethod** | Enum | Y | 8가지 | 'mixed' 시 payments 배열이 필수다. |
| **payments** | JSON | N | - | 복합결제 시 [{method, amount, status}] 배열이다. |
| **discount** | JSON | Y | - | {couponId, couponName, couponAmount, pointUsed, discountAmount, productDiscount, affiliateDiscount, eCouponDiscount, eCoupons: [{eCouponId, eCouponName, eCouponType(voucher/exchange), amount, productId, couponCompany, pinNumber}]}이다. |
| **cashReceipt** | JSON | Y | - | {requested(Boolean), type(income_deduction/expense_proof), number} 현금영수증 정보다. |
| **cancelInfo** | JSON | N | - | 취소 시 {reason(customer_request/out_of_stock/store_closed/other), reasonDetail, cancelledBy, cancelledAt}을 기록한다. |
| **customerRequest** | String | N | 최대 200자 | 고객 요청사항(배달 요청 메모 등)이다. |
| **memos** | JSON | Y | 배열 | [{id, content, createdBy, createdAt}] 관리자 메모 목록이다. |

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/api/orders` | 주문 목록 조회. Pagination + dateFrom/dateTo/orderType/status/storeId/keyword 필터이다. |
| GET | `/api/orders/:id` | 주문 상세 조회이다. |
| PATCH | `/api/orders/:id/status` | 주문 상태 변경 (FSM 검증)이다. |
| POST | `/api/orders/:id/cancel` | 주문 전체 취소. 쿠폰/포인트/E쿠폰 자동 환원이다. |
| POST | `/api/orders/:id/payments/:paymentItemId/cancel` | 복합결제 개별 결제수단 취소다. |
| POST | `/api/orders/:id/memos` | 관리자 메모 추가다. |
| POST | `/api/orders/export` | 엑셀 내보내기 (비동기, 선택 컬럼 OrderExportColumn 기반)다. |

**[API 및 비즈니스 로직 제약사항]**
- **상태 전이 검증** — 서버에서 유효한 상태 전이만 허용한다. pending→confirmed→preparing→ready→completed 순서와, 어느 단계에서든 cancelled 전이가 가능하다.
- **취소 시 원복 처리** — 쿠폰/포인트/E쿠폰 사용분을 원래 계정으로 자동 환원하는 트랜잭션 로직이 필수다.
- **복합결제 개별취소 API (`POST /api/orders/{id}/payments/{paymentItemId}/cancel`)** — 개별 결제수단별 PG 취소 호출을 분리하며, 부분취소 불가 PG사의 경우 전액취소 후 재결제 처리 플로우를 구현한다.
- **주문번호 채번** — 동시 다발 주문 시 중복 방지를 위해 DB 시퀀스 또는 분산 ID 생성기(Snowflake 등)를 사용한다.
- **엑셀 내보내기** — 대량 데이터(1만 건 이상) 시 비동기 처리 후 다운로드 링크를 제공하는 방식을 권장한다.

**[⚠️ 트래픽/성능 검토]**
- **주문번호 채번** — 동시 다발 주문 시 중복 방지를 위해 DB 시퀀스 또는 Snowflake ID를 사용한다.
- **상태 전이 검증** — 서버에서 유효한 전이만 허용. FSM(Finite State Machine) 패턴 적용을 권장한다.
- **취소 시 원복** — 쿠폰/포인트/E쿠폰 환원을 단일 트랜잭션으로 처리한다. 외부 PG 취소 호출이 포함되므로 Saga 패턴 또는 보상 트랜잭션을 고려한다.
- **엑셀 내보내기** — 1만 건 이상 시 비동기 처리 + S3 업로드 후 다운로드 링크 반환이다.
- **복합결제 개별취소** — 부분취소 불가 PG사 대응을 위한 전액취소→재결제 플로우 구현이 필요하다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 주문 접수 → 완료

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 주문 목록 페이지 진입 | 당일 주문 최신순 로드 | 기본 필터=당일, 페이지네이션 |
| 2 | 신규 주문(pending) 행 클릭 | 상세 페이지 이동, 3탭 렌더링 | 기본정보/결제정보/메모 탭 |
| 3 | [접수] 버튼 클릭 | ConfirmDialog → `PATCH /api/orders/:id/status` {status:"confirmed"} | Badge: warning→info 전환 |
| 4 | [준비중] 클릭 | status→preparing | Badge: info 유지 |
| 5 | [준비완료] 클릭 | status→ready | Badge: info→success |
| 6 | [완료] 클릭 | status→completed | Badge: success, 상태변경 버튼 비활성화 |

### 시나리오 2: 주문 취소 + 쿠폰/포인트 환원

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 주문 상세에서 [취소] 클릭 | 취소 사유 선택 모달 표시 | 4개 사유 Select + 상세 Textarea |
| 2 | 사유 선택 + 상세 입력 후 확인 | `POST /api/orders/:id/cancel` 호출 | status→cancelled |
| 3 | 서버: 쿠폰 사용분 환원 | 쿠폰 상태 used→active 복원, 사용횟수 차감 | 쿠폰 서비스 트랜잭션 |
| 4 | 서버: 포인트 사용분 환원 | pointBalance += 사용 포인트, 이력 기록 | 포인트 동시성 제어 |
| 5 | 서버: PG 결제 취소 호출 | PG사 취소 API 호출 → 성공 시 결제 상태 갱신 | Saga 패턴 보상 트랜잭션 |
| 6 | 성공 Toast + 상세 갱신 | cancelled Badge, 취소 정보 섹션 표시 | cancelInfo 필드 노출 |

### 시나리오 3: 복합결제 개별 취소

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 결제정보 탭에서 복합결제 상세 확인 | 결제수단별 행(카드/간편결제/E쿠폰 등) 렌더링 | 각 행에 개별취소 버튼 |
| 2 | 특정 결제수단의 [취소] 클릭 | ConfirmDialog → `POST /api/orders/:id/payments/:paymentItemId/cancel` | 해당 행만 "취소완료" 전환 |
| 3 | "전체 취소가 아닌 부분 취소입니다" 안내 | 나머지 결제수단은 유지 | 전체 상태는 그대로 |

---

## 4. 개발자용 정책 설명

### 4.1. 주문 상태 전이 규칙 (FSM)

```
허용 전이:
  pending → confirmed → preparing → ready → completed
  (모든 상태) → cancelled

금지 전이:
  completed → (어떤 상태든) : 완료 후 역행 불가
  cancelled → (어떤 상태든) : 취소 후 복원 불가

서버 검증: 요청 status가 현재 status의 허용 전이 목록에 없으면 → 400 INVALID_STATUS_TRANSITION
```

### 4.2. 취소 시 환원 처리 순서

```
1. 쿠폰 환원: coupon.usageCount -= 1, coupon.status → active (만료일 미경과 시)
2. 포인트 환원: member.pointBalance += order.discount.pointUsed (SELECT FOR UPDATE)
3. E쿠폰 환원: eCoupon.status → active, pinNumber 재활성화
4. PG 결제 취소: 각 결제수단별 PG사 취소 API 호출
5. 위 4단계를 단일 트랜잭션으로 처리. PG 외부호출 실패 시 Saga 보상 트랜잭션 실행
```

### 4.3. 주문번호 채번 규칙

```
형식: {YYYYMMDD}-{6자리 시퀀스}  예: 20260312-000001
동시성: DB 시퀀스 또는 Snowflake ID 사용
중복 방지: UNIQUE 제약 + 시퀀스 gap 허용
```

### 4.4. 관리자 메모 정책

```
삭제 불가 (append-only)
수정 불가 (작성 후 변경 불가)
각 메모에 createdBy(작성자 ID) + createdAt(작성 시각) 필수 기록
```



### 공통 규칙 (Common Rules)
- Base URL: `{VITE_API_URL}`
- 인증: HttpOnly 쿠키 기반 세션 인증
- 공통 응답: `{ "data": ... }` 또는 `{ "data": [...], "pagination": {...} }`
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`


---

## 주문 (Order) API

### 2-1. 주문 목록 조회

```
GET /orders
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| dateFrom | DateString | N | 조회 시작일 |
| dateTo | DateString | N | 조회 종료일 |
| orderType | string | N | `delivery` \| `pickup` \| `dine_in` |
| status | string | N | `pending` \| `confirmed` \| `preparing` \| `ready` \| `delivered` \| `completed` \| `cancelled` |
| storeId | string | N | 가맹점 ID |
| keyword | string | N | 통합 검색 (주문번호, 주문자명, 전화번호, 매장명, 배달주소, 메뉴명) |
| page | number | N | 페이지 (기본값: 1) |
| limit | number | N | 페이지당 건수 (기본값: 20) |

**Response** `200 OK`
```json
{
  "data": [Order],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### 2-2. 주문 상세 조회

```
GET /orders/:id
```

**Response** `200 OK`
```json
{
  "data": Order
}
```

**Order 스키마**
```typescript
interface Order {
  id: string;
  orderNumber: string;
  orderType: 'delivery' | 'pickup' | 'dine_in';
  channel: 'app' | 'kiosk' | 'pos' | 'web';
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'completed' | 'cancelled';
  orderDate: DateString;

  // 주문자
  memberId: string;
  memberName: string;
  memberPhone: string;

  // 가맹점
  storeId: string;
  storeName: string;

  // 메뉴
  items: OrderMenuItem[];

  // 금액
  subtotalAmount: number;
  discount: OrderDiscount;
  deliveryFee: number;
  totalAmount: number;

  // 결제
  paymentMethod: PaymentMethod;
  cashReceipt: CashReceipt;
  payments?: OrderPaymentItem[];

  // 배달
  deliveryAddress?: string;

  // 부가
  memos: OrderMemo[];
  cancelInfo?: OrderCancelInfo;
  customerRequest?: string;

  createdAt: DateString;
  updatedAt: DateString;
}

type PaymentMethod = 'card' | 'cash' | 'kakao_pay' | 'naver_pay' | 'toss_pay' | 'mobile_gift_card' | 'mobile_voucher' | 'mixed';

interface OrderMenuItem {
  productId: string;
  productName: string;
  categoryName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  options: { name: string; price: number }[];
}

interface OrderDiscount {
  couponId?: string;
  couponName?: string;
  couponAmount: number;
  pointUsed: number;
  discountAmount: number;
  productDiscount?: number;
  affiliateDiscount?: number;
  eCouponDiscount?: number;
  eCoupons?: ECouponUsage[];
  couponCancelled?: boolean;
  couponCancelledAt?: DateString;
  couponCancelledBy?: string;
  affiliateDiscountCancelled?: boolean;
  affiliateDiscountCancelledAt?: DateString;
  affiliateDiscountCancelledBy?: string;
}

interface ECouponUsage {
  eCouponId: string;
  eCouponName: string;
  eCouponType: 'voucher' | 'exchange';
  amount: number;
  productId?: string;
  productName?: string;
  couponCompany: string;
  pinNumber: string;
}

interface CashReceipt {
  requested: boolean;
  type?: 'income_deduction' | 'expense_proof';
  number?: string;
}

interface OrderPaymentItem {
  id: string;
  method: PaymentMethod | 'voucher' | 'exchange';
  label: string;
  amount: number;
  status: 'paid' | 'cancelled';
  cancelInfo?: PaymentItemCancelInfo;
  eCouponId?: string;
  eCouponName?: string;
  productName?: string;
  couponCompany?: string;
  pinNumber?: string;
}

interface OrderMemo {
  id: string;
  content: string;
  createdBy: string;
  createdAt: DateString;
}

interface OrderCancelInfo {
  reason: 'customer_request' | 'out_of_stock' | 'store_closed' | 'other';
  reasonDetail?: string;
  cancelledBy: string;
  cancelledAt: DateString;
}
```

### 2-3. 전체 주문 조회 (엑셀 다운로드용)

```
GET /orders/all
```

**Query Parameters**: 2-1과 동일 (page, limit 제외)

**Response** `200 OK`
```json
{
  "data": [Order]
}
```

### 2-4. 주문 통계

```
GET /orders/stats
```

**Response** `200 OK`
```json
{
  "data": {
    "totalOrders": 150,
    "pendingOrders": 5,
    "completedToday": 42,
    "cancelledToday": 3,
    "todayRevenue": 1250000
  }
}
```

### 2-5. 주문 취소

```
POST /orders/:id/cancel
```

**Request Body**
```json
{
  "reason": "customer_request",
  "reasonDetail": "고객 변심"
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| reason | string | Y | `customer_request` \| `out_of_stock` \| `store_closed` \| `other` |
| reasonDetail | string | N | 상세 사유 |

**Response** `200 OK`
```json
{
  "data": Order
}
```

**비즈니스 규칙**: `pending`, `confirmed` 상태에서만 취소 가능

### 2-6. 주문 상태 변경

```
PATCH /orders/:id/status
```

**Request Body**
```json
{
  "status": "confirmed"
}
```

**Response** `200 OK`
```json
{
  "data": Order
}
```

### 2-7. 주문 메모 추가

```
POST /orders/:id/memos
```

**Request Body**
```json
{
  "content": "고객 요청: 소스 별도 포장"
}
```

**Response** `200 OK`
```json
{
  "data": Order
}
```

### 2-8. 개별 결제수단 취소 (복합결제)

```
POST /orders/:id/payments/:paymentItemId/cancel
```

**Request Body**
```json
{
  "reason": "customer_request",
  "reasonDetail": "카드 결제분 취소"
}
```

**Response** `200 OK`
```json
{
  "data": Order
}
```

**비즈니스 규칙**: `paid` 상태인 결제수단만 취소 가능. 모든 결제수단 취소 시 주문 상태도 `cancelled`로 변경.

### 2-9. 쿠폰/제휴할인 취소

```
POST /orders/:id/discounts/:type/cancel
```

**Path Parameters**

| 파라미터 | 설명 |
|----------|------|
| type | `coupon` \| `affiliate` |

**Response** `200 OK`
```json
{
  "data": Order
}
```

**비즈니스 규칙**: 취소된 주문은 할인 취소 불가. 취소 금액만큼 `totalAmount` 증가.

---
