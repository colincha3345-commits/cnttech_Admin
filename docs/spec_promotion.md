# 프로모션(할인/쿠폰) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **할인 및 쿠폰(Promotion) 카테고리**의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서입니다. 결제 금액 계산의 핵심이 되므로 엄격한 제약조건 룰이 적용되어야 합니다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/marketing/discounts` | 할인 관리 (Discounts) | marketing:read |
| `/marketing/coupons` | 쿠폰 관리 (Coupons) | marketing:read |


## 1. 페이지 프로세스 (Page Process)

1. **할인/쿠폰 목록 및 현황 조회**
   - 두 메뉴 모두 진행 상태(`active`, `inactive`, `expired` 등) 탭 구분을 통해 목록을 렌더링합니다.
   - 쿠폰의 경우 발급 수량 및 실제 사용(`usageCount`) 대비 잔여 수량 프로그레스 바를 리스트에 표출하여 직관적 파악을 돕습니다.
   
2. **프로모션 정책 생성 (Create Form)**
   - 생성 버튼 클릭 시 세부 설정 폼으로 진입합니다.
   - (1) 기본 정보 (명칭, 유형) -> (2) 범위 지정 (장바구니 전체인가 상품구간인가) -> (3) 할인 금액/비율 입력 -> (4) 타겟 매장 및 기한 설정 순서의 스텝퍼(Stepper) 혹은 1페이지 롱폼 형태로 구동됩니다.
   - 쿠폰은 1인 1매 여부, 발행수량 세팅이 필수이며 할인은 상시 적용 정책 스케줄러 세팅이 강조됩니다.

3. **적용 및 정산 통계 확인**
   - 활성화된 쿠폰 및 할인은 주문 결제 프로세스에 즉시 반영됩니다.
   - 프로모션 상세 조회 모달에서 본사/가맹점 정산 비율(`headquartersRatio`, `franchiseRatio`) 기반의 총 할인 비용 누적 데시보드를 확인할 수 있도록 구현합니다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **프로모션명** | Input | Y | 2 ~ 50자 이내 | 고객에게 노출되는 쿠폰/할인 타이틀입니다. |
| **할인 방식 선택**| Radio | Y | `정률(%)`, `정액(원)` | 정률 선택 시 인풋 우측에 '%', 정액 선택 시 '원' 단위가 동적 변환 표출되어야 합니다. |
| **할인 값** | Input (Number) | Y | 정률: 1~100% / 정액: 0 초과 | 정률 할인(%)의 경우 최대 할인 금액 제한 인풋창(`maxDiscountAmount`)을 의존적으로 활성화시켜 입력받습니다. |
| **적용 범위** | Select / Checkbox | Y | `cart_total`, `specific_product` | 특정 상품 할인 선택 시, 시스템에 등록된 상품군을 검색하고 복수 선택할 수 있는 팝업 모달이 병행되어야 합니다. |
| **적용 기간** | DatePicker | N | YYYY-MM-DD HH:mm | 쿠폰은 시작-종료일 명시가 필수이며, 무기한 할인은 '상시 적용(always)' 체크박스를 둡니다. |
| **절사 규칙** | Select | N | `round`, `ceil`, `floor` / 10, 100단위 | 정률 할인 결과값 단수 처리를 어떤 체계로 할지 선택하는 컨트롤러를 노출합니다. |
| **정산 비율** | Slider / Number Input| Y | 두 합계가 100% | 총합 100 조건을 맞추기 위해, 한쪽 인풋 수정 시 타겟 인풋이 자동 계산(100 - X) 연동되도록 합니다. |

**[UI/UX 상호작용 제약사항]**
- 증정 조건(사은품, N+1) 할인 유형 선택 시, 현금 할인 인풋 필드 영역은 통째로 숨김 처리하고 증정품 수량(`buyQuantity`, `getQuantity`) 인풋이 나타나야 합니다.
- 타겟 매장 지정 시 트리 구조 또는 멀티 셀렉터를 사용하여 `Include`/`Exclude` 처리 가시성을 확보합니다.

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 할인/쿠폰 고유 키 |
| **discountType** | Enum | Y | - | 'fixed_amount', 'percentage' 및 쿠폰 별도코드 적용 |
| **discountValue**| Integer | Y | > 0 | 값이 비합리적 범위(ex: \%인데 100이상)일 시 Exception 반환해야 합니다. |
| **applyScope** | Enum | Y | - | 적용 기준 (장바구니 총액, 상품한정, 배달비). |
| **totalCount** | Integer | N | Nullable | 총 발행 제한이 있는 선착순 쿠폰인 경우. Null 이력 시 상시/무제한 발급으로 인식합니다. |
| **headquartersRatio** | Integer | Y | 0~100 | 프랜차이즈 배분율 검증 데이터 무결성 체크(`headquartersRatio + franchiseRatio == 100`) 통과가 필수입니다. |

**[API 및 비즈니스 로직 제약사항]**
- **동시성 제어 (Race Condition)**
  - 한정 발급 수량이 등록된 쿠폰의 유저 측 `POST /api/coupons/{id}/download` 호출 시, 여러 건이 동시 접수되어 수량이 초과 발급(오버셀링)되지 않도록 인메모리 락(Lock) 또는 트랜잭션 격리 수준을 조정하는 방벽 구축이 필수입니다.
- **할인액 계산 로직 연산 서버 분리**
  - 프론트엔드가 계산한 최종 금액 데이터를 신뢰하지 않습니다. 주문/결제 승인 직전, 서버가 단독으로 쿠폰의 요일, 매장 포함여부 등을 밸리데이션하고 자체 할인 금액 계산 엔진 모듈을 돌려 검증한 후 진행시켜야 합니다.
- **무기한 쿠폰 방지**
  - 앱 유저 보유 쿠폰 중 `endDate`를 지난 건은 별도의 만료 배치(Worker)를 두어 쿠폰 상태(`status`)를 일괄 `expired` 시키는 구조를 갖춥니다.

**[⚠️ 트래픽/성능 검토]**
- **쿠폰 동시성 (Race Condition)** — 한정 수량 쿠폰의 `POST /api/coupons/{id}/download` 호출 시 오버셀링 방지. Redis DECR + DB 트랜잭션 이중 체크를 권장한다.
- **할인액 계산** — 프론트엔드 계산 결과를 신뢰하지 않는다. 서버 자체 할인 엔진으로 재검증 후 결제를 진행한다.
- **쿠폰 만료 배치** — endDate 지난 쿠폰을 expired로 일괄 전환하는 Worker가 필요하다. 청크 단위 처리로 DB Lock 최소화한다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 할인 생성 → 활성화

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 할인 목록 → [할인 등록] 클릭 | 생성 폼 렌더링 | 필수 필드 빈 상태 |
| 2 | 기본정보: 할인명 입력, 할인방식 선택(정률) | 정률 선택 시 '%' 단위 표시 + maxDiscountAmount 입력 활성화 | 방식별 UI 동적 전환 |
| 3 | 할인값: 20% 입력, 최대 할인 5,000원 | 실시간 유효성 검증 (1~100%) | maxDiscountAmount > 0 |
| 4 | 적용범위: "특정 상품" 선택 | 상품 검색 모달 팝업 → 복수 선택 | 최소 1개 상품 선택 |
| 5 | 정산 비율: 본사 70 / 가맹 30 입력 | 한쪽 입력 시 반대편 자동 계산 (100-X) | 합계=100 검증 |
| 6 | 적용기간: 시작~종료일 설정 | DatePicker 범위 선택 | 종료일 > 시작일 |
| 7 | [저장] 클릭 | `POST /api/discounts` → 성공 Toast → 목록 이동 | 목록에 신규 할인(active) 표시 |

### 시나리오 2: 쿠폰 생성 → 고객 다운로드

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 쿠폰 목록 → [쿠폰 등록] | 생성 폼 렌더링 | 쿠폰 고유 필드(발행수량, 1인1매) 표시 |
| 2 | 발행수량: 1000매, 1인1매: ON | totalCount=1000, perUserLimit=1 설정 | null이면 무제한 |
| 3 | 할인 설정 + 정산 비율 입력 | 할인과 동일한 검증 | 합계=100 |
| 4 | [저장] 클릭 | `POST /api/coupons` → 생성 완료 | status=active |
| 5 | 고객앱에서 쿠폰 다운로드 | `POST /api/coupons/:id/download` → Redis DECR + DB 트랜잭션 | remainingCount 차감, 동시성 제어 |

---

## 4. 개발자용 정책 설명

### 4.1. 할인 중복 불가 정책 (⚠️ 핵심 정책)

```
규칙: 장바구니에 할인 적용 상품이 1건이라도 존재하면 쿠폰 사용 불가
      할인/쿠폰/포인트는 모두 상호 배타적 — 동시 적용 불가

프론트엔드 처리:
  - 할인상품 담기 → couponSelector.disabled = true, pointInput.disabled = true
  - 쿠폰 적용 중 할인상품 추가 → 쿠폰 자동 해제 + Toast
  - 포인트 사용 중 할인상품 추가 → 포인트 자동 해제 + Toast

백엔드 검증:
  - hasDiscountItem && hasCoupon → DISCOUNT_COUPON_CONFLICT (400)
  - hasDiscountItem && hasPoint → DISCOUNT_POINT_CONFLICT (400)
  - hasCoupon && hasPoint → DISCOUNT_POINT_CONFLICT (400)

참조: docs/policy_discount_coupon.md
```

### 4.2. 할인 자동 적용 우선순위

```
적용 가능 할인이 복수인 경우 서버가 1건만 선택:
  1순위: 할인 금액이 가장 작은 것 (본사 비용 최소화)
  2순위: 종료일이 가까운 것
  3순위: 생성일이 최신인 것
```

### 4.3. 쿠폰 동시성 제어 (Race Condition 방지)

```
한정수량 쿠폰 다운로드 API:
  1. Redis DECR coupon:{id}:remaining → 결과 < 0 이면 즉시 거부 + INCR 복원
  2. DECR 성공 시 DB 트랜잭션으로 usageCount 증가 + 사용자 발급 기록
  3. DB 실패 시 Redis INCR 보상
  이중 체크로 오버셀링 방지
```

### 4.4. 절사 규칙

```
정률 할인 계산: discountAmount = floor(orderAmount * rate / 100)
절사 방식: roundingType(round/ceil/floor) × roundingUnit(10/100)
예시: 15,750원, floor, 100단위 → 15,700원
```

### 4.5. 쿠폰 만료 배치

```
실행: 매일 00:00
대상: endDate < now() AND status = 'active'
처리: status → 'expired', 청크 1,000건 단위
고객앱: expired 쿠폰은 쿠폰함에서 "기간 만료" 라벨 표시
삭제 가능 시점: 만료 후 7일 경과 (policy_discount_coupon.md 참조)
```



### 공통 규칙 (Common Rules)
- Base URL: `{VITE_API_URL}`
- 인증: HttpOnly 쿠키 기반 세션 인증
- 공통 응답: `{ "data": ... }` 또는 `{ "data": [...], "pagination": {...} }`
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`


---

## 쿠폰 (Coupon) API

### 3-1. 쿠폰 목록 조회

```
GET /coupons
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| keyword | string | N | 쿠폰명 검색 |
| status | string | N | `active` \| `suspended` \| `expired` \| `exhausted` |
| page | number | N | 페이지 (기본값: 1) |
| limit | number | N | 페이지당 건수 (기본값: 50) |

**Response** `200 OK`
```json
{
  "data": [Coupon],
  "pagination": { "page": 1, "limit": 50, "total": 30, "totalPages": 1 }
}
```

### 3-2. 쿠폰 상세 조회

```
GET /coupons/:id
```

**Response** `200 OK`
```json
{
  "data": Coupon
}
```

**Coupon 스키마**
```typescript
interface Coupon {
  id: string;
  name: string;
  description: string;
  notice: string;

  // 할인
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;

  // 적용 범위
  applyScope: 'cart_total' | 'specific_product' | 'delivery_fee';
  orderType: 'all' | 'delivery' | 'pickup';
  channel: 'all' | 'app' | 'pc_web' | 'mobile_web';

  // 유효 기간
  startDate: string | null;
  endDate: string | null;
  autoDelete: boolean;

  // 발급/사용
  singleUsePerMember: boolean;
  totalCount: number | null;
  issuedCount: number;
  usedCount: number;

  // 적용 대상
  applicableProductIds: string[];
  applicableCategoryIds: string[];

  // 스케줄
  schedule: {
    availableDays: number[];
    availableTimeRanges: TimeSlot[];
  };

  // 가맹점 제한
  storeRestriction: {
    type: 'all' | 'include' | 'exclude';
    storeIds: string[];
  };

  // 정산
  settlementRatio: {
    headquartersRatio: number;
    franchiseRatio: number;
  };

  // 상태
  status: 'active' | 'suspended' | 'expired' | 'exhausted';

  // 정지/유예
  suspendedAt?: DateString;
  gracePeriodDays?: number;
  graceExpiresAt?: DateString;
  autoDeleteAt?: DateString;

  // 메타
  createdAt: DateString;
  updatedAt: DateString;
  createdBy: string;
}
```

### 3-3. 쿠폰 생성

```
POST /coupons
```

**Request Body**
```typescript
interface CreateCouponRequest {
  name: string;                    // 쿠폰명 (최대 30자, 특수문자 불가)
  description: string;
  notice: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;           // 0 초과, percentage 시 100 이하
  minOrderAmount: number;
  maxDiscountAmount: number | null;

  applyScope: 'cart_total' | 'specific_product' | 'delivery_fee';
  orderType: 'all' | 'delivery' | 'pickup';
  channel: 'all' | 'app' | 'pc_web' | 'mobile_web';

  startDate: string;               // YYYY-MM-DD
  endDate: string;                 // YYYY-MM-DD
  autoDelete: boolean;
  singleUsePerMember: boolean;
  totalCount: number | null;       // null = 무제한

  applicableProductIds: string[];
  applicableCategoryIds: string[];

  availableDays: number[];         // 0~6 (일~토)
  availableStartTime: string;      // "HH:mm"
  availableEndTime: string;        // "HH:mm"

  storeRestrictionType: 'all' | 'include' | 'exclude';
  restrictedStoreIds: string[];

  headquartersRatio: number;       // 본사 부담 비율 (%)
  franchiseRatio: number;          // 가맹점 부담 비율 (%)
}
```

**Response** `201 Created`
```json
{
  "data": Coupon
}
```

### 3-4. 쿠폰 수정

```
PUT /coupons/:id
```

**Request Body**: `CreateCouponRequest`와 동일

**Response** `200 OK`
```json
{
  "data": Coupon
}
```

### 3-5. 쿠폰 삭제

```
DELETE /coupons/:id
```

**Response** `204 No Content`

### 3-6. 쿠폰 정지

```
PATCH /coupons/:id/suspend
```

**Request Body**
```json
{
  "gracePeriodDays": 7
}
```

**Response** `200 OK`
```json
{
  "data": Coupon
}
```

### 3-7. 쿠폰 활성화

```
PATCH /coupons/:id/activate
```

**Response** `200 OK`
```json
{
  "data": Coupon
}
```

### 3-8. 쿠폰 복제

```
POST /coupons/:id/duplicate
```

**Response** `201 Created`
```json
{
  "data": Coupon
}
```

### 3-9. 쿠폰 통계

```
GET /coupons/stats
```

**Response** `200 OK`
```json
{
  "data": {
    "total": 30,
    "active": 15,
    "totalIssued": 5000,
    "totalUsed": 3200
  }
}
```

---


---

## 마케팅 확장 (Point, Discount, Event) API

### 8-1. 포인트 수동 적립/차감
```
POST /points/manual
```
**Request Body**
```json
{
  "memberId": "mem-123",
  "type": "earn",
  "amount": 1000,
  "reason": "고객 보상"
}
```
**Response** `200 OK`

### 8-2. 할인 프로모션(캠페인) 조회
```
GET /promotions/discounts
```
**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "promo-1",
      "name": "신메뉴 출시 할인",
      "discountValue": 2000,
      "startDate": "...",
      "endDate": "..."
    }
  ],
  "pagination": { ... }
}
```

### 8-3. 이벤트 배너 목록 조회
```
GET /marketing/events
```
**Response** `200 OK`

---


---

<!-- MERGED FROM spec_benefit_campaign.md -->
# 혜택 캠페인(Benefit Campaign) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **혜택 캠페인(Benefit Campaign) 카테고리**의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서입니다. 자동화 마케팅 기능이므로 트리거와 배포 지연 로직의 완벽한 처리가 요구됩니다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/marketing/campaigns` | 혜택 캠페인 (BenefitCampaigns) | marketing:read |


## 1. 페이지 프로세스 (Page Process)

1. **캠페인 목록 및 통계 (List View)**
   - 등록된 자동화 캠페인 현황(활성, 일시중지, 종료 등상태 배지)을 리스트업 합니다.
   - 각 캠페인당 누적 발급 쿠폰 수량(`totalIssuedCount`) 및 실제 수혜 인원수(`totalBeneficiaryCount`) 요약 수치를 컬럼으로 노출합니다.

2. **캠페인 세팅 프로세스 (Setup Flow)**
   - 등록 시작 시 (1) 조건 트리거 선택 (8가지 항목) -> (2) 조건 상세 입력 -> (3) 혜택 보상(쿠폰/포인트) 설정 -> (4) 지연 지급 예약 여부로 이어지는 스텝별(Step-by-step) 위자드 형태를 채택합니다.
   - '회원그룹 즉시발급(`member_group`)', '난수 코드 생성/업로드(`promo_code`)', '리스트 수기 업로드(`manual_upload`)' 와 같이 대량 배포가 수반되는 트리거의 경우, 배포 대상 회원수(목록 수량)를 최종 확인하는 얼럿 팝업 단계가 필수 추가됩니다.

3. **현황 모니터링 (Monitoring)**
   - 상세 페이지에서는 캠페인 조건 리드온리(Read-only) 정보와, 진행 간 실패(Error)난 혜택 미지급자 로그 탭을 제공하여 관리자의 재처리(Retry) 편의성을 확보합니다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **캠페인명**| Input (Text) | Y | 최대 50자 | 직관적인 관리용 타이틀입니다. |
| **트리거 유형** | Select | Y | - | 선택한 조건(`order`, `signup`, `birthday` 등 8개)에 맞춰 하단 폼(조건 상세 입력부)의 UI가 다이내믹하게 교체(Dynamic Rendering) 되어야 합니다. |
| **난수 쿠폰 조건**| Input, Number | C(조건) | 길이: 4~20 | `promo_code` 트리거 선택 시, 접두사, 코드 길이, 생성 수량 등을 설정합니다. 수량은 100,000개 이내로 입력 제한합니다. |
| **보상 종류 (혜택)**| Select + Input | Y | 쿠폰 / 포인트 | 포인트 선택 시 정액(Point) / 정률(%)을 선택하고, %일 때는 `maxEarnPoints` 상한선 제한 인풋을 종속적으로 받습니다. |
| **지연 발급 설정** | Radio / Time | N | `none`, `days`, `hours` | 기본값은 즉시발급(`none`)이며, N일 후/특정 시간대 선택 시 하위 Number 인풋 노출 처리합니다. |
| **캠페인 기간** | DatePicker | N | YYYY-MM-DD | 종료일 없는 `isAlwaysOn` (상시) 체크박스 제공합니다. |

**[UI/UX 상호작용 제약사항]**
- 다이나믹 폼 렌더링 시 기존에 기입했던 값의 보존 처리는 하지 않고, 트리거 유형이 바뀔 경우 조건 관련 하위 폼의 값을 초기화(Reset)하여 유효성 에러 충돌을 막습니다. 
- 복수 혜택(쿠폰+포인트 다수) 추가가 가능하도록, "+ 보상 추가" 버튼을 통해 배열형 폼 필드로 렌더링되게 설계합니다.

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 시스템 고유 식별자 |
| **trigger** | Enum | Y | 8가지 허용 | 혜택 발동의 1차 진입 조건문입니다. |
| **특정 트리거 설정**| JSON | Y | - | 타입별로 조건(orderCondition, birthdayCondition 등)을 구조화된 JSON 형태로 관리하여 확정성에 대응합니다. |
| **benefitConfig** | JSON (Array)| Y | - | 쿠폰 배열, 포인트 배열 정보를 포함하며 최소 1개의 보상 객체가 비어있지 않아야 유효합니다. |
| **status** | Enum | Y | - | 'draft', 'active', 'paused', 'completed', 'cancelled' |

**[API 및 비즈니스 로직 제약사항]**
- **이벤트 기반 백그라운드 큐 (Message Queue / Event Driven)**
  - 실제 쇼핑몰 앱 쪽에서 `회원가입 발생`, `주문 인서트 발생` 이벤트가 떨어질 때, 캠페인 리스너가 이를 비동기로 감지하도록 설계되어야 합니다.
  - 가시성 처리를 위해, `지연 발급(Delay)`이 걸려있을 시점에는 큐 시스템(Redis/RabbitMQ 등) 또는 RDB 크론잡 스케줄 테이블에 "지급예정일시"를 박아넣고 실행 시점 도래 여부만 감지하는 방식으로 분리 구성합니다.
- **쿠폰/포인트 난수 발급 (Bulk Insert)**
  - 백만 건 단위의 PromoCode 대량 생성은 Memory Out을 유발할 수 있으므로, 청크(Chunk) 단위로 DB Batch Insert를 수행하여 시스템 병목을 낮추도록 강제합니다.
- **수동 발급(`manual_upload`) 검증기**
  - 관리자가 Excel/CSV 파일을 통해 대상자 계정을 올려 혜택을 수동 발급할 때, 파일 파서는 내장된 유저 식별자 중복 여부 및 비정상 계정 여부를 업로드(API 요청) 직후 빠르게 `Validation` 후 실패 사유를 리턴해 주어야 합니다.

**[⚠️ 트래픽/성능 검토]**
- **이벤트 기반 큐** — 회원가입/주문 이벤트를 Message Queue(Redis/RabbitMQ)로 비동기 감지. 캠페인 리스너가 조건 매칭 후 혜택을 발급한다.
- **지연 발급** — 큐 시스템 또는 RDB 스케줄 테이블에 "지급예정일시"를 저장하고 크론잡으로 실행한다.
- **PromoCode 대량 생성** — 100,000건 이내 제한이지만, 청크(1,000건) 단위 DB Batch Insert로 Memory Out을 방지한다.
- **수동 업로드 검증** — CSV/Excel 파서가 업로드 직후 중복/비정상 계정을 빠르게 검증하여 실패 사유를 반환한다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 자동화 캠페인 생성

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 캠페인 목록 → [캠페인 등록] | 생성 폼 렌더링 | 트리거/혜택/대상 설정 |
| 2 | 트리거: "회원가입 완료" 선택 | 트리거 조건 설정 폼 | 트리거 유형별 옵션 |
| 3 | 혜택: "쿠폰 자동 발급" + 쿠폰 선택 | 활성 쿠폰 검색 모달 | 쿠폰 1개 이상 선택 |
| 4 | 배포 지연: "즉시" 선택 | 지연 시간 입력 비활성화 | 0 = 즉시 |
| 5 | [저장] → 활성화 | `POST /api/campaigns` → active 상태 | 트리거 리스너 등록 |
| 6 | 신규 회원 가입 시 | 자동으로 쿠폰 발급 | 이벤트 기반 실행 확인 |

### 시나리오 2: 캠페인 통계 확인

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 캠페인 상세 → 통계 탭 | 발동 횟수, 성공/실패 건수, 혜택 지급 현황 | 기간별 차트 |
| 2 | 기간 필터 변경 | 차트/테이블 갱신 | 필터 반영 |

---

## 4. 개발자용 정책 설명

### 4.1. 트리거 실행 정책

```
트리거 이벤트: 이벤트 버스(Pub/Sub)로 수신
배포 지연(delayMinutes): 0=즉시, N>0 → 스케줄러 큐에 등록 후 N분 후 실행
실패 시: 재시도 3회 (exponential backoff), 최종 실패 시 캠페인 로그에 기록
동시 트리거: 동일 회원에 대해 동일 캠페인이 중복 트리거되지 않도록 memberId+campaignId 중복 체크
```

### 4.2. 캠페인 비활성화 정책

```
비활성(inactive) 전환 시: 트리거 리스너 해제, 대기 중인 지연 작업 취소
재활성화 시: 트리거 리스너 재등록, 비활성 기간 중 누락된 이벤트는 소급 처리하지 않음
```



---

<!-- MERGED FROM spec_event.md -->
# 이벤트(Event) 기능 통합 기획 명세서

본 문서는 관리자 대시보드 내 **이벤트(Event) 홍보 및 수집 페이지 카테고리**의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서입니다. 프론트엔드 연동, 푸시 알림, 통계 기능을 포함합니다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/events` | 이벤트 관리 (EventManagement) | events:read |

> **구현 컴포넌트**: EventForm(등록/수정 폼), EventParticipantList(참여자 목록).


## 1. 페이지 프로세스 (Page Process)

1. **이벤트 목록 및 현황 노출**
   - 배너 형태의 이벤트 목록을 노출하며 (종료, 예약됨, 진행중 상태 배지 표기) 조회수(`pageViews`) 및 참여수 통계를 요약하여 리스트 우측에 표기합니다.
   
2. **이벤트 기획 및 등록 폼 작성**
   - 기본 콘텐츠(배너/내용) -> 노출 일정 및 예약 발행 -> 주문이동 버튼 딥링크 설정 -> 공유(SNS / 푸시) 메시지 최적화 -> 고객참여 양식(동의 및 수집 정보) 세팅이라는 일련의 기획 과정을 단일 등록 화면 내에서 처리합니다.
   - 우측 등 빈 캔버스 측면에 **모바일 모달/팝업 또는 스크린 형태에서의 실제 노출 프리뷰 UI**를 제공하여 작성자의 이해를 돕습니다. (푸시 알림 디자인 포함)

3. **고객 참여 개인정보 다운로드**
   - 이벤트가 "참여이벤트(`participation`)"로 설정되고, 고객 정보를 수집할 경우, 별도의 [참여자 목록] 팝업 또는 상세 페이지에서 이름/기타 필드/참여 일시/정보제공 동의여부 리스트를 암호화 해제된 엑셀(CSV) 형식으로 반환받는 다운로드 버튼을 둡니다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **이벤트명 (title)** | Input | Y | 최대 100자 | 앱과 관리자에서 표출될 텍스트입니다. |
| **내용 (description)** | Textarea | N | 최대 500자 | 간략 설명으로 SNS 공유 등 메타 정보에 공통 치환될 수 있습니다. |
| **이벤트 이미지** | File Upload | Y | 5MB 이하 권장 | `bannerImageUrl`, `detailImageUrl` 두 항목으로 업로드(AWS S3 등 연동 처리) 되며 진행률 프로그레스를 표출해야 합니다. |
| **예약 발행일**| Checkbox + DatePicker | N | YYYY-MM-DD HH:mm | `usePublishSchedule` 토글 버튼 활성 시 노출됩니다. |
| **외부 연동 딥링크** | Input | N | 도메인, 스키마 형태 | 앱 내 특정 상품으로 던지거나(Scheme 딥링크), 랜딩 페이지(Web)로 분기하는 URL 박스. `deepLink` 필드 |
| **주문버튼 / 공유버튼** | Checkbox + Input | Y(활성시) | 라벨명 입력 필수 | 노출 활성 여부를 제어하고, 공유 채널 체크박스(카톡, 페이스북 등) 멀티 선택 지원합니다. |
| **푸시 알림 메세지** | Input / Textarea | N | 제목/본문 각각 제한 | 앱 푸시 발송 시 사용자 스마트폰에 노출될 Title과 Body 문구를 별도 섹션에서 묶습니다. |
| **입력수집 양식** | Checkbox 멀티 | C(참여이벤트시) | 이름/전화/이메일 등 | `eventType`이 `participation` 일 때 나타나는 다이나믹 폼 영역. "개인정보 동의" 및 "제3자 제공" 체크박스를 필수 처리 시 문구 입력칸(`consentText`)을 강제로 열어줍니다. |

**[UI/UX 상호작용 제약사항]**
- 참여이벤트 여부(`eventType`)를 선택하는 토글 또는 라디오가 페이지 최상단에 있어야 하며, 전환 시 하단 `참여자 설정 폼` 전체가 노출/숨김 토글되어야 합니다.
- 푸시 알림 타이틀 및 바디 입력칸 옆에 모바일 OS 기준(iOS 단말 형태) Mockup 화면에 메시지 말풍선이 실시간 시뮬레이션 표출되도록 구현합니다(PopupManagement의 프리뷰 모델 차용).

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 식별자. 외부에 파라미터로 공유되므로 예측 불가능한 값 필수. |
| **eventType** | Enum | Y | - | 'general', 'participation' 만 지원 |
| **status**| Enum | Y | - | 'scheduled', 'active', 'ended' (현재 시각 비교하여 배치 또는 조회단에서 동적 반환) |
| **publishDate**| DateTime | N | - | 예약/일정 설정이 활성화된 경우에 한정 |
| **shareChannels JSON** | JSON | N | - | `["kakao", "link_copy"]` 형태 배열. Front API에서 버튼 노출 여부로 파싱 |
| **stats JSON** | JSON | Y | - | 페이지 조회수, 주문버튼 클릭수 집계를 위한 스택 데이터 |

**[API 및 비즈니스 로직 제약사항]**
- **개인정보 취급 및 로깅 설계 (`EventParticipant`)**
  - 참여자 입력 이벤트의 경우 `collectionMode=form_input` 일 시 전송되는 이름/연락처 등은 DB 저장 시 양방향 암호화 처리(AES-256 등)를 수행해야 합니다.
  - 마케팅 및 개인정보 약관 동의 플래그(`hasConsented`) 값은 필히 T/F boolean 컬럼과 동의 당시 앱의 IP나 시각 메타를 기록하여 보안 이슈를 대비합니다.
- **오픈그래프(OG) 메타 및 스키마 분기 처리**
  - 앱에서의 SNS 공유 호출 시(ShareChannel 이벤트) 어드민에서 입력한 `shareTitle`, `shareImageUrl`이 카카오톡 메시지에 온전히 실릴 수 있도록 별도의 Public 조회 GET 엔드포인트를 열어 카카오 크롤러가 이미지와 라벨을 긁어갈 수 있게 제공해야 합니다.
- **실시간 통계 증분 동시성 이슈**
  - 고객 클릭, 버튼 이동 시 수집되는 `EventStats` (클릭수/방문자수 등) 기록은 트래픽 스파이크(병목)를 막기 위해 RDB 증가(UPDATE +1) 쿼리 보다는 Redis 카운터 증가 후 특정 지연 시점(Interval)에 Data Base로 Sync 해주는 최적화 구조를 권장합니다.

**[⚠️ 트래픽/성능 검토]**
- **실시간 통계** — EventStats(클릭수/방문자수)는 Redis 카운터 증가 → 주기적(1분) DB Sync. RDB UPDATE +1 직접 호출은 병목 유발한다.
- **개인정보 암호화** — 참여자 정보(이름/연락처)는 AES-256 양방향 암호화로 DB 저장한다.
- **OG 메타** — SNS 공유용 Public GET 엔드포인트는 인증 없이 접근 가능하되, Rate Limiting(100req/분)을 적용한다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 이벤트 생성 → 참여 확인

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 이벤트 목록 → [이벤트 등록] | 생성 폼 렌더링 | 필수 필드 표시 |
| 2 | 이벤트명/설명/기간/참여조건 입력 | 실시간 유효성 검증 | 종료일 > 시작일 |
| 3 | 참여 폼 설정 (설문/응모) | 폼 빌더 UI | 필드 추가/삭제/순서변경 |
| 4 | [저장] → 이벤트 생성 완료 | `POST /api/events` → 목록 이동 | status=active |
| 5 | 고객앱에서 이벤트 참여 | 참여 데이터 수집 | 참여자 수 실시간 집계 |
| 6 | 관리자: 이벤트 상세 → 참여 현황 탭 | 참여자 목록 + 통계 렌더링 | DataTable + 차트 |

### 시나리오 2: 이벤트 종료 → 당첨자 선정

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 종료된 이벤트 상세 진입 | 참여자 전체 목록 표시 | 종료일 경과 확인 |
| 2 | [당첨자 추출] 클릭 | 당첨 인원 입력 → 랜덤 추출 | 중복 당첨 방지 |
| 3 | 당첨자 확인 후 [확정] | 당첨자 상태 갱신 + 알림 발송 | 푸시/SMS 연동 |

---

## 4. 개발자용 정책 설명

### 4.1. 이벤트 참여 제한 정책

```
1인 참여 횟수: maxParticipationPerUser 설정 (null=무제한)
동일인 중복 참여: memberId 기준 카운트 검증
참여 가능 기간: startDate ~ endDate 범위 내에서만 폼 제출 허용
기간 외 접근: "이벤트가 종료되었습니다" 안내 표시
```

### 4.2. 당첨자 추출 정책

```
추출 방식: 서버 랜덤 (Math.random이 아닌 crypto.randomInt 사용)
중복 당첨: 동일 이벤트 내 중복 당첨 불가
당첨 확정 후: 변경 불가 (append-only)
```



---

<!-- MERGED FROM spec_point.md -->
# 포인트 설정(Point Settings) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **포인트 설정** 페이지의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/marketing/points` | 포인트 설정 (PointSettings) | marketing:read |

---

## 2. 페이지 프로세스

1. **시스템 통계 조회** — 전체 적립/사용/소멸/잔액 4개 통계 카드를 상단에 표시한다.
2. **적립 정책 설정** — 정액(fixedUnit당 fixedPoints) 또는 정률(percentageRate%) 방식 중 택 1. 최소 주문금액, 최대 적립 한도 설정.
3. **사용 정책 설정** — 최소 사용 포인트, 최대 사용 비율(%), 사용 단위(1/10/100/500/1000P) 설정.
4. **유효기간 정책** — 기본 유효기간(일)과 만료 알림 발송 시점(일 전) 설정. 변경 시 이후 적립분부터 적용.
5. **포인트 이력 조회** — 전체/적립/사용/소멸/수동 필터별 이력을 DataTable로 조회, 페이지네이션 지원.

---

## 3. 세부 개발 명세

### 3.1. 프론트엔드

#### 적립 정책

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 |
| :--- | :--- | :---: | :--- | :--- |
| **적립 방식 (earnType)** | ToggleButtonGroup | Y | `fixed`/`percentage` | 전환 시 하단 폼 동적 변경이다. |
| **기준 금액 (fixedUnit)** | Number Input | C(fixed) | 100 이상 | 정액: N원당 적립 기준이다. |
| **적립 포인트 (fixedPoints)** | Number Input | C(fixed) | 1 이상 | 정액: 기준금액당 적립 포인트다. |
| **적립 비율 (percentageRate)** | Number Input | C(percentage) | 0.1 ~ 100 | 정률: 주문금액의 N%다. |
| **최대 적립 (maxEarnPoints)** | Number Input | N | null=무제한 | 정률: 1회 최대 적립 한도다. |
| **최소 주문금액 (minOrderAmount)** | Number Input | N | 0 이상 | 0이면 모든 주문 적립이다. |

#### 사용 정책

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 |
| :--- | :--- | :---: | :--- | :--- |
| **최소 사용 (minUsePoints)** | Number Input | Y | 1 이상 | N포인트 이상 사용 가능이다. |
| **최대 사용 비율 (maxUseRate)** | Number Input | Y | 1 ~ 100 | 결제금액의 최대 N%이다. |
| **사용 단위 (useUnit)** | Select | Y | 1/10/100/500/1000 | N포인트 단위 사용이다. |
| **본사 부담 비율 (headquartersRatio)** | Number Input | Y | 0 ~ 100 | 포인트 사용 시 본사가 부담하는 비율(%)이다. 입력 시 가맹점 비율 자동 계산. |
| **가맹점 부담 비율 (franchiseRatio)** | Number Input | Y | 0 ~ 100 | 포인트 사용 시 가맹점이 부담하는 비율(%)이다. 두 비율 합계 = 100%. 정산 시 가맹점 부담분은 차감, 본사 부담분은 hqSupport로 보전. |
| **마이너스 잔고 정책** | 안내 문구 (ReadOnly) | - | 항상 허용 | 주문 취소 시 포인트 강제 회수로 잔액 마이너스 가능. 고정 정책이며 OFF 옵션 없음. |

#### 유효기간 / 이력

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **기본 유효기간 (defaultValidityDays)** | Number Input | Y | 1~3650일이다. |
| **만료 알림 (expiryNotificationDays)** | Number Input | Y | 만료 N일 전 알림이다. |
| **이력 필터 (historyFilter)** | ToggleButton | N | all/earn/use/expire/manual이다. |
| **DataTable** | Table | - | 일시/회원/유형/금액/잔액/사유/만료일이다. |

---

### 3.2. 백엔드

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/api/point-settings` | 포인트 설정 조회이다. |
| PUT | `/api/point-settings` | 포인트 설정 저장. 감사 로그 기록이다. |
| GET | `/api/point-settings/stats` | 시스템 통계(총적립/사용/소멸/잔액) 조회이다. |
| GET | `/api/point-history` | 포인트 이력 조회. type 필터, Pagination이다. |

#### DB 스키마 (PointSettings - 단일 레코드)

earnPolicy: {type, fixedUnit, fixedPoints, percentageRate, maxEarnPoints, minOrderAmount}
usePolicy: {minUsePoints, maxUseRate, useUnit, headquartersRatio, franchiseRatio, allowNegativeBalance(항상 true, 고정)}
expiryPolicy: {defaultValidityDays, expiryNotificationDays}

#### DB 스키마 (PointHistory)

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **id (PK)** | UUID | Y | 고유 식별자다. |
| **memberId (FK)** | UUID | Y | 회원 참조다. |
| **memberName** | String | Y | 역정규화 조회용이다. |
| **type** | Enum | Y | earn/use/expire/manual_add/manual_deduct이다. |
| **amount** | Integer | Y | 양수=적립, 음수=사용/소멸이다. |
| **balance** | Integer | Y | 처리 후 잔액(0 이상)이다. |
| **description** | String | Y | 최대 200자 사유이다. |
| **expiresAt** | Timestamp | N | 적립 포인트 만료일이다. |

**[비즈니스 로직 제약사항]**
- 설정 변경 시 감사 로그(`auditService.log`) 기록한다.
- 유효기간 변경은 변경 이후 적립분부터 적용. 기존 적립 포인트의 만료일은 변경하지 않는다.
- 포인트 잔액은 동시성 제어 필수(SELECT FOR UPDATE 또는 optimistic lock)이다.

**[⚠️ 트래픽/성능 검토]**
- **포인트 소멸 배치** — 매일 자정 `expiresAt`이 지난 적립 건을 자동 소멸 처리. 대량 건(10만+) 처리 시 청크(1,000건) 단위 배치를 권장한다.
- **만료 알림** — `expiryNotificationDays`일 전 대상자에게 푸시/SMS 발송. 발송 대상자가 많을 경우 비동기 큐(Message Queue)로 처리한다.
- **시스템 통계** — SUM 집계 쿼리가 무거우므로 materialized view 또는 별도 집계 테이블 + 주기적 갱신(5분)을 권장한다.

---

## 4. 정상작동 시나리오

### 시나리오 1: 포인트 적립 정책 설정

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 포인트 설정 페이지 진입 | 상단 통계카드 4개(적립/사용/소멸/잔액) + 현재 설정값 로드 | GET /api/point-settings + stats |
| 2 | 적립방식: "정률" 선택 | 정액 필드 숨김, 정률 필드(비율/최대적립) 노출 | UI 동적 전환 |
| 3 | 비율 5%, 최대 500P, 최소 주문 10,000원 입력 | 실시간 유효성 검증 | 0.1~100%, maxEarnPoints > 0 |
| 4 | [저장] 클릭 | `PUT /api/point-settings` → 성공 Toast | 감사 로그 기록 |

### 시나리오 2: 포인트 이력 조회

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 이력 섹션 진입 | 전체 이력 DataTable 로드 | 페이지네이션, 최신순 |
| 2 | 필터: "소멸" 선택 | type=expire 이력만 필터링 | 금액 음수 표시 |
| 3 | 페이지 2로 이동 | 다음 페이지 데이터 로드 | offset 정확성 |

---

## 5. 개발자용 정책 설명

### 5.1. 포인트 적립 계산

```
정액: fixedUnit원당 fixedPoints 적립
  예: 1,000원당 10P → 15,000원 주문 시 150P 적립

정률: orderAmount × percentageRate / 100 (소수점 절사)
  maxEarnPoints가 설정된 경우: min(계산값, maxEarnPoints)
  예: 5%, max 500P → 15,000원 주문 시 min(750, 500) = 500P

적립 조건: orderAmount >= minOrderAmount (0이면 모든 주문)
적립 시점: 주문 완료(completed) 시 자동 적립
취소 시: 적립 포인트 차감 (잔액 부족 시 0까지만)
```

### 5.2. 포인트 사용 제한

```
최소 사용: minUsePoints 이상만 사용 가능
최대 사용: 결제금액 × maxUseRate / 100
사용 단위: useUnit 단위로만 입력 가능 (예: 100P 단위)
할인 중복 불가: 할인/쿠폰 적용 시 포인트 사용 차단 (DISCOUNT_POINT_CONFLICT)
```

### 5.3. 포인트 소멸 배치

```
실행: 매일 00:00
대상: expiresAt < now() AND type='earn' AND 미사용 잔여분
처리: type='expire' 이력 생성 + balance 차감
알림: expiryNotificationDays일 전 대상자에게 푸시/SMS (비동기 큐)
유효기간 변경: 변경 이후 적립분부터 적용. 기존 적립 포인트 만료일 변경하지 않음
```



---

<!-- MERGED FROM spec_push.md -->
# 푸시 알림(Push Notification) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **푸시 알림 관리** 페이지의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/marketing/push` | 푸시 목록 (PushList) | marketing:read |
| `/marketing/push/new` | 푸시 등록 (PushForm) | marketing:write |
| `/marketing/push/:id` | 푸시 상세 (PushDetail) | marketing:read |

---

## 2. 페이지 프로세스

1. **푸시 목록** (`PushList`) — 상태별(draft/scheduled/sending/completed/failed/cancelled) Badge 표기. 검색, 유형(info/ad) 필터 제공.
2. **푸시 등록/수정** (`PushForm`) — 알림 유형, 제목/본문, 딥링크, 발송 대상(세그먼트), 예약 설정, 트리거 조건, Android 확장 필드 입력.
3. **푸시 상세** (`PushDetail`) — 발송 현황 통계(대상 수, 도달률, 클릭률)와 발송 이력 조회.

---

## 3. 세부 개발 명세

### 3.1. 프론트엔드

#### 푸시 기본 정보

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 |
| :--- | :--- | :---: | :--- | :--- |
| **알림 유형 (type)** | ToggleButton | Y | `info`/`ad` | 광고성 시 수신 동의 회원만 대상이다. |
| **제목 (title)** | Input | Y | 2 ~ 50자 | 푸시 알림 제목이다. |
| **본문 (body)** | Textarea | Y | 최대 200자 | 푸시 알림 내용이다. |
| **딥링크 (deepLink)** | Input | N | scheme 형식 | 알림 클릭 시 앱 내 이동 경로다. |

#### 발송 대상 (세그먼트)

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **회원 등급** | Multi Checkbox | N | VIP/GOLD/SILVER/BRONZE/전체이다. |
| **지역** | Multi Checkbox | N | 17개 시도 + 전체이다. |
| **연령대** | Multi Checkbox | N | 10대~60대이상 + 전체이다. |
| **예상 발송 수** | Text (ReadOnly) | - | 세그먼트 변경 시 실시간 갱신이다. |

#### 트리거 조건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **트리거 유형 (triggerType)** | Select | Y | none/cart_abandoned/product_viewed/app_installed/purchase_completed/regular_schedule/time_limit 7가지다. |
| **정기 발송 주기** | ToggleButton | C(regular) | daily/weekly이다. |
| **정기 발송 요일** | Multi Checkbox | C(weekly) | 월~일 선택이다. |

#### Android 확장 필드

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **확장 제목** | Input | N | 최대 50자이다. |
| **확장 본문** | Textarea | N | 최대 500자이다. |
| **요약** | Input | N | 최대 30자이다. |
| **소형 아이콘 / 대형 이미지** | File Upload | N | Android 전용이다. |

---

### 3.2. 백엔드

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/api/push-notifications` | 목록 조회. status, type 필터, Pagination이다. |
| GET | `/api/push-notifications/:id` | 상세 조회(통계 포함)이다. |
| POST | `/api/push-notifications` | 등록이다. |
| PUT | `/api/push-notifications/:id` | 수정(draft 상태에서만)이다. |
| POST | `/api/push-notifications/:id/send` | 즉시 발송이다. |
| POST | `/api/push-notifications/:id/cancel` | 예약 취소이다. |
| GET | `/api/push-notifications/estimate-count` | 세그먼트 기반 예상 발송 수 조회이다. |

#### DB 스키마

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **id (PK)** | UUID | Y | 고유 식별자다. |
| **type** | Enum | Y | 'info'/'ad'이다. |
| **title** | String | Y | 2~50자이다. |
| **body** | String | Y | 최대 200자이다. |
| **deepLink** | String | N | scheme 형식이다. |
| **status** | Enum | Y | draft/scheduled/sending/completed/failed/cancelled이다. |
| **targetCount** | Integer | Y | 대상 회원 수다. |
| **triggerType** | Enum | Y | 7가지이다. |
| **triggerConfig** | JSON | N | 트리거별 상세 설정이다. |
| **segment** | JSON | N | {grades, regions, ageRanges} 세그먼트 조건이다. |
| **androidExtended** | JSON | N | {expandedTitle, expandedBody, summary, smallIconUrl, largeImageUrl}이다. |
| **scheduledAt** | Timestamp | N | 예약 발송 시각이다. |
| **sentAt** | Timestamp | N | 실제 발송 완료 시각이다. |
| **stats** | JSON | N | {deliveredCount, clickCount, deliveryRate, clickRate} 통계다. |

**[비즈니스 로직 제약사항]**
- **광고성 푸시** — marketingAgreed=true AND pushEnabled=true 회원만 대상이다.
- **정보성 푸시** — pushEnabled=true 회원 전체 대상이다.
- **예약 발송** — 스케줄러가 scheduledAt 도래 시 status→sending 전환 후 FCM/APNs 발송한다.
- **트리거 기반** — 이벤트 발생 시 조건 충족 회원 자동 발송이다.

**[⚠️ 트래픽/성능 검토]**
- **대량 발송** — 10만 명 이상 대상 시 FCM batch API(500건/요청)로 청크 분할 발송. 발송 큐(Redis/RabbitMQ)를 사용하여 비동기 처리한다.
- **예상 발송 수 API** — 세그먼트 변경마다 호출되므로 debounce(500ms) 적용 + COUNT 쿼리 최적화(인덱스 활용)가 필요하다.
- **통계 집계** — FCM delivery receipt은 비동기이므로 별도 Worker가 수집 후 stats JSON을 갱신한다.

---

## 4. 정상작동 시나리오

### 시나리오 1: 푸시 알림 발송

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 푸시 목록 → [알림 등록] | 생성 폼 렌더링 | 제목/내용/대상/예약시간 |
| 2 | 제목/내용 입력 + 대상: "전체 회원" | 대상 선택 UI | 전체/그룹/조건별 |
| 3 | 발송시간: "예약" → 날짜/시간 선택 | DateTimePicker 표시 | 미래 시점만 선택 가능 |
| 4 | [저장] 클릭 | `POST /api/push-notifications` → 예약 등록 | status=scheduled |
| 5 | 예약 시간 도래 | 서버: FCM/APNs 발송 시작 | 비동기 큐 처리 |
| 6 | 발송 완료 후 | 상태→completed, 성공/실패 건수 집계 | 발송 결과 통계 |

---

## 5. 개발자용 정책 설명

### 5.1. 발송 대상 정책

```
pushEnabled=false인 회원: 발송 대상에서 제외
대상 유형: 전체 회원 / 회원 그룹(member_segment) / 개별 선택
대량 발송(1만+): 청크 단위 비동기 큐 처리
```

### 5.2. 발송 실패 처리

```
FCM/APNs 발송 실패: 재시도 3회 (exponential backoff)
디바이스 토큰 만료: 해당 토큰 삭제 + 회원 pushEnabled 유지
최종 실패: 발송 로그에 기록, 관리자 통계에 실패 건수 표시
```

