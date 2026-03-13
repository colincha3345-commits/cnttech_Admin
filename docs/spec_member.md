# 회원(Member) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **회원(Member) 관리 카테고리**의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서입니다. 모든 명세는 개발 시 예외 처리 및 데이터 정합성을 보장하기 위해 작성되었습니다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/app-members` | 전체 회원 목록 (AppMemberList) | app-members:read |
| `/app-members/inactive` | 90일 미접속 회원 (AppMemberList filter=inactive_90days) | app-members:read |
| `/app-members/no-order` | 미주문 회원 (AppMemberList filter=no_order) | app-members:read |
| `/app-members/:id` | 회원 상세 (AppMemberDetail) | app-members:read |

> **구현 특이사항**: 회원 상세 탭: MemberInfoTab(기본정보/단골매장/배달지), OrderHistoryTab, PointHistoryTab, CouponHistoryTab, VoucherHistoryTab(교환권). PointAdjustModal/CouponAdjustModal로 수동 지급.


## 1. 페이지 프로세스 (Page Process)

1. **회원 목록 조회 (List View)**
   - 관리자가 회원 메뉴에 진입하면 기본적으로 최신 가입일순으로 정렬된 회원 리스트를 노출합니다.
   - 상단 검색 영역에서 텍스트(이름, 연락처 등), 등급, 상태, 가입일 범위, 마케팅 동의 여부 필터를 적용하여 조회할 수 있도록 합니다.
   - 리스트 항목 클릭 시 **회원 상세 페이지**로 이동합니다.

2. **회원 상세 조회 (Detail View)**
   - 선택한 회원의 기본 신상 정보, 소셜 연결 상태, 약관 동의 이력, 구매 내역 및 포인트 잔액을 한 화면에 탭 또는 카드 형태로 분리하여 제공합니다.
   - 상태 변경(장기미접속 해제, 강제 탈퇴 등) 및 수동 관리 기능(포인트 수기 지급 등)이 필요한 경우 모달을 통해 별도 프로세스를 거치도록 합니다.

3. **기능 제어 및 보상 (Action & Reward)**
   - 회원 목록에서 대상자를 다중 선택하여 일괄 혜택(포인트/쿠폰)을 지급하거나 엑셀로 내보내는 기능을 우측 상단 액션 바에 배치합니다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **검색 키워드** | Input (텍스트) | N | 최대 50자 | 엔터 키 또는 [검색] 버튼 클릭 시 상태 업데이트 하도록 합니다. |
| **회원명 (name)** | Text | Y | 2자 ~ 20자 이내 | 리스트 및 상세 화면 최상단 렌더링. 빈 값 비허용 처리합니다. |
| **연락처 (phone)** | Text | Y | 11자리 고정 (숫자) | `010-****-1234` 형식으로 자동 하이픈 및 부분 마스킹 렌더링을 적용합니다. |
| **이메일 (email)** | Text | Y | 이메일 정규식 준수 | 유효성 검증 포맷 실패 시 빨간색 Error Text 노출합니다. |
| **성별 (gender)** | Select / Text | N | `male`, `female` | 미입력 시 '선택 안함' 또는 '-' 로 표기합니다. |
| **상태 배지** | Badge | Y | - | 상태(`active`, `inactive`, `dormant`, `withdrawn`)별로 서로 다른 색상의 UI 배지를 적용합니다. |
| **소셜 연동 마크** | Icon | N | - | 카카오, 네이버, 애플 등 연동된 SNS가 있을 시 각 브랜드 아이콘을 표출합니다. |
| **약관/마케팅 동의**| Checkbox (Readonly) | Y | Boolean | 회원 수정 시 임의 변경 불가(Read-only) 정책을 따릅니다. |

**[UI/UX 상호작용 제약사항]**
- 테이블 데이터 로드 시 Skeleton UI 또는 Spinner를 사용하여 로딩 상태를 명확히 인지시킵니다.
- 엑셀 다운로드 클릭 시 즉시 다운로드가 아닌 백그라운드 다운로드 알림(Toast)을 띄우고 완료 시 파일 저장이 이루어지도록 합니다.

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 시스템 고유 식별자. 외부에 노출 시 사용 권장합니다. |
| **memberId** | String | Y | 5 ~ 20자 | 로그인에 사용되는 고유 아이디. 중복 불가 처리되어야 합니다. (Unique) |
| **name** | String | Y | 2 ~ 20자 | 암호화 대상 제외. |
| **phone** | String | Y | 11자 (숫자만) | DB 저장 시 하이픈(-) 제거 및 단방향/양방향 암호화 처리를 권장합니다. |
| **email** | String | Y | 최대 100자 | 이메일 유효성 검증. |
| **grade** | String | Y | Enum Value 매핑 | `grade-vip` 등 동적 등급 테이블의 외래키(FK) 형태로 관리합니다. |
| **status** | Enum | Y | - | 'active', 'inactive', 'dormant', 'withdrawn' 4가지 상태만 허용합니다. |
| **pointBalance** | Integer | Y | 0 이상 | 음수(-) 가 될 수 없으며 동시성 제어가 필요한 트랜잭션 컬럼입니다. |
| **birthDate** | String | N | YYYY-MM-DD | 생년월일이다. |
| **gender** | Enum | N | - | 'male', 'female' 만 허용한다. |
| **linkedSns** | JSON | N | 배열 | [{snsType(kakao/naver/google/apple/facebook), snsKey(SNS 고유키), connectedAt}] SNS 연동 목록이다. |
| **termsAgreements** | JSON | N | 배열 | [{termsType(service/privacy/marketing/location/third_party), agreedAt, version}] 약관 동의 이력이다. |
| **favoriteStores** | JSON | N | 배열, 최대 3개 | [{storeId, storeName, address, phone, registeredAt}] 단골매장이다. |
| **deliveryAddresses** | JSON | N | 배열, 최대 10개 | [{id, alias, address, jibunAddress, addressDetail, zipCode, lat, lng, isDefault, lastUsedAt, createdAt}] 배달지 목록이다. |
| **marketingAgreed** | Boolean | Y | - | 마케팅 수신 동의 여부다. |
| **pushEnabled** | Boolean | Y | - | 푸시 알림 활성화 여부다. |
| **smsEnabled** | Boolean | Y | - | SMS 수신 동의 여부다. |
| **emailEnabled** | Boolean | Y | - | 이메일 수신 동의 여부다. |

**[API 및 비즈니스 로직 제약사항]**
- **조회 API (`GET /api/members`)**
  - 회원 목록 조회 시 민감 정보(연락처 전체 등)는 마스킹 처리하여 반환(Response)해야 합니다.
  - Pagination(page, limit 파라미터)은 필수로 적용되어야 합니다.
- **휴면 전환 배치 (Batch)**
  - 매일 자정, `lastLoginAt` 기준 1년 이상 미접속 계정을 `dormant` 상태로 일괄 전환하는 스케줄러가 필수적으로 구동되어야 합니다.
- **포인트 수정 API (`POST /api/members/{id}/points`)**
  - 관리자의 수기 포인트 조작 시 반드시 해당 사유(reason) 필드를 필수 파라미터로 받아 로그(Audit)에 남기도록 합니다.

**[⚠️ 트래픽/성능 검토]**
- **휴면 전환 배치** — 매일 자정 대량 UPDATE가 발생한다. 청크(1,000건) 단위 처리 + 인덱스(lastLoginAt) 필수이다.
- **포인트 동시성** — pointBalance 갱신 시 SELECT FOR UPDATE 또는 optimistic lock을 적용한다. 동시 결제 시 음수 전환 방지 필수이다.
- **민감정보 마스킹** — 목록 API는 기본 마스킹 반환. unmask 권한이 있는 경우에만 원문 조회 API를 별도 제공한다. 원문 조회 시 감사 로그 기록한다.
- **엑셀 다운로드** — 1만 건 이상 시 비동기 처리 + 다운로드 링크 반환이다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 회원 조회 → 상세 확인

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 회원 메뉴 진입 | 최신 가입일순 회원 목록 렌더링 | 연락처 마스킹(010-****-1234) |
| 2 | 검색: "홍길동" 입력 + 등급 "VIP" 선택 | 필터 적용된 목록 갱신 | 복합 필터 AND 조건 |
| 3 | 회원 행 클릭 | 상세 페이지 이동 → 5개 탭 렌더링 | 기본정보/주문/포인트/쿠폰/교환권 |
| 4 | 기본정보 탭 확인 | 이름, 연락처, 이메일, 등급 Badge, SNS 연동 아이콘 표시 | 약관 동의 항목 ReadOnly |

### 시나리오 2: 포인트 수동 지급

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 회원 상세 → [포인트 지급] 클릭 | PointAdjustModal 표시 | 금액, 사유 필드 |
| 2 | 금액: 5000, 사유: "CS 보상" 입력 | 실시간 유효성 검증 | 금액 > 0, 사유 필수 |
| 3 | [지급] 클릭 | `POST /api/members/:id/points` → 성공 Toast | pointBalance 갱신, 감사로그 기록 |
| 4 | 포인트 이력 탭 확인 | 새 이력 행 추가 (type=manual_add) | 잔액 정확성 검증 |

### 시나리오 3: 일괄 쿠폰 발급

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 목록에서 회원 다중 선택 (체크박스) | 선택 건수 표시 + 액션 바 활성화 | 선택 수 ≤ 전체 페이지 건수 |
| 2 | [쿠폰 발급] 클릭 | CouponAdjustModal → 쿠폰 검색/선택 | 활성(active) 쿠폰만 표시 |
| 3 | 쿠폰 선택 후 [발급] | `POST /api/members/bulk/coupons` → 비동기 처리 | 완료 Toast + 발급 결과 |

---

## 4. 개발자용 정책 설명

### 4.1. 민감정보 마스킹 정책

```
목록 API 기본 반환: 연락처 마스킹 (010-****-1234)
원문 조회: unmask 권한 보유자만 별도 API로 접근
원문 조회 시: 감사 로그(UNMASK_DATA) 자동 기록
DB 저장: phone 필드는 하이픈 제거 후 양방향 암호화
```

### 4.2. 휴면 전환 정책

```
조건: lastLoginAt < now() - 365일
실행: 매일 00:00 배치
처리: status → 'dormant', 개인정보 분리보관(별도 테이블)
복원: 고객앱 재로그인 시 자동 복원 → status='active' + 개인정보 원복
청크: 1,000건 단위 처리, 인덱스(lastLoginAt) 필수
```

### 4.3. 포인트 동시성 제어

```
pointBalance 갱신 시 반드시:
  SELECT pointBalance FROM members WHERE id=:id FOR UPDATE
  → 연산 → UPDATE members SET pointBalance=:newBalance
음수 전환 방지: newBalance < 0 이면 트랜잭션 롤백 + INSUFFICIENT_POINTS 에러
```

### 4.4. 약관 동의 변경 정책

```
관리자 화면에서 약관 동의 상태 변경 불가 (ReadOnly)
고객 앱에서만 변경 가능
termsAgreements는 이력(배열) 형태로 저장 — 최신 항목이 현재 동의 상태
```



### 공통 규칙 (Common Rules)
- Base URL: `{VITE_API_URL}`
- 인증: HttpOnly 쿠키 기반 세션 인증
- 공통 응답: `{ "data": ... }` 또는 `{ "data": [...], "pagination": {...} }`
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`


---

## 회원 (Member) API

### 4-1. 회원 목록 조회

```
GET /members
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| searchType | string | N | `all` \| `name` \| `memberId` \| `phone` \| `email` |
| searchKeyword | string | N | 검색어 |
| grades | string | N | 등급 ID (콤마 구분, 예: `grade-vip,grade-gold`) |
| statuses | string | N | `active` \| `inactive` \| `dormant` \| `withdrawn` (콤마 구분) |
| registeredFrom | string | N | 가입일 시작 (YYYY-MM-DD) |
| registeredTo | string | N | 가입일 종료 (YYYY-MM-DD) |
| orderCountMin | number | N | 최소 주문 횟수 |
| orderCountMax | number | N | 최대 주문 횟수 |
| totalAmountMin | number | N | 최소 총 주문 금액 |
| totalAmountMax | number | N | 최대 총 주문 금액 |
| marketingAgreed | boolean | N | 마케팅 동의 여부 |
| page | number | N | 페이지 (기본값: 1) |
| limit | number | N | 페이지당 건수 (기본값: 20) |

**Response** `200 OK`
```json
{
  "data": [Member],
  "pagination": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
}
```

### 4-2. 회원 상세 조회

```
GET /members/:id
```

**Response** `200 OK`
```json
{
  "data": Member
}
```

**Member 스키마**
```typescript
interface Member {
  id: string;
  memberId: string;
  name: string;
  phone: string;
  email: string;
  grade: string;
  status: 'active' | 'inactive' | 'dormant' | 'withdrawn';

  birthDate: string | null;
  gender: 'male' | 'female' | null;

  linkedSns: SnsConnection[];
  termsAgreements: TermsAgreement[];

  orderCount: number;
  totalOrderAmount: number;
  lastOrderDate: DateString | null;

  registeredAt: DateString;
  lastLoginAt: DateString | null;

  marketingAgreed: boolean;
  marketingAgreedAt: DateString | null;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;

  pointBalance: number;

  favoriteStores: FavoriteStore[];
  deliveryAddresses: DeliveryAddress[];
}

interface SnsConnection {
  snsType: 'kakao' | 'naver' | 'google' | 'apple' | 'facebook';
  snsKey: string;
  connectedAt: DateString;
}

interface TermsAgreement {
  termsType: 'service' | 'privacy' | 'marketing' | 'location' | 'third_party';
  agreedAt: DateString;
  version: string;
  revokedAt?: DateString | null;
  revokeReason?: string;
}

interface FavoriteStore {
  storeId: string;
  storeName: string;
  address: string;
  phone: string;
  registeredAt: DateString;
}

interface DeliveryAddress {
  id: string;
  alias: string;
  address: string;
  jibunAddress?: string;
  addressDetail: string;
  zipCode: string;
  lat: number | null;
  lng: number | null;
  isDefault: boolean;
  lastUsedAt: DateString | null;
  createdAt: DateString;
}
```

### 4-3. 회원 상태 변경

```
PATCH /members/:id/status
```

**Request Body**
```json
{
  "status": "inactive"
}
```

**Response** `200 OK`
```json
{
  "data": Member
}
```

### 4-4. 회원 등급 변경

```
PATCH /members/:id/grade
```

**Request Body**
```json
{
  "grade": "grade-vip"
}
```

**Response** `200 OK`
```json
{
  "data": Member
}
```

### 4-5. 회원 주문 내역 조회

```
GET /members/:id/orders
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | N | 페이지 (기본값: 1) |
| limit | number | N | 페이지당 건수 (기본값: 20) |

**Response** `200 OK`
```json
{
  "data": [Order],
  "pagination": { "page": 1, "limit": 20, "total": 50, "totalPages": 3 }
}
```

### 4-6. 회원 포인트 내역 조회

```
GET /members/:id/points
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | N | 페이지 (기본값: 1) |
| limit | number | N | 페이지당 건수 (기본값: 20) |

**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "pt-1",
      "type": "earn" | "use" | "expire" | "cancel",
      "amount": 500,
      "balance": 3500,
      "description": "주문 적립",
      "orderId": "ord-1",
      "createdAt": "2026-03-13T09:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### 4-7. 회원 보유 쿠폰 조회

```
GET /members/:id/coupons
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| page | number | N | 페이지 (기본값: 1) |
| limit | number | N | 페이지당 건수 (기본값: 20) |

**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "mc-1",
      "couponId": "coupon-1",
      "couponName": "신규 가입 3,000원 할인",
      "discountType": "fixed",
      "discountValue": 3000,
      "status": "available" | "used" | "expired",
      "issuedAt": "2026-03-01T00:00:00Z",
      "usedAt": null,
      "expiresAt": "2026-04-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---


---

## 회원 초대 및 리워드 (Invitation/Referrals) API

### 15-1. 초대(리퍼럴) 현황 조회
```
GET /invitations/stats
```
**Response** `200 OK`
```json
{
  "data": {
    "totalInvitations": 1500,
    "totalJoined": 450,
    "totalOrdered": 320,
    "totalRewardsPaid": 1500000
  }
}
```

### 15-2. 추천인 리워드 설정
```
PUT /invitations/rewards/settings
```
**Request Body**
```json
{
  "inviterReward": { "type": "point", "amount": 3000 },
  "inviteeReward": { "type": "coupon", "couponId": "coupon-welcome-1" },
  "triggerEvent": "first_order"
}
```
**Response** `200 OK`


---

<!-- MERGED FROM spec_grade.md -->
# 멤버십 등급 관리(Grade Management) 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **멤버십 등급 관리** 페이지(`/app-members/grade-management`)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/app-members/grades` | 멤버십 등급 관리 (GradeManagement) | app-members:read |


## 1. 페이지 프로세스 (Page Process)

1. **등급 목록 조회** — 좌측 패널에 등급 목록을 순서대로 표시한다. 드래그 앤 드롭(`@dnd-kit`)으로 순서 변경이 가능하다.
2. **등급 등록/수정** — 우측 패널에서 등급명, 설명, Badge 색상, 달성 조건, 혜택(포인트 배율, 자동 쿠폰 발급)을 설정한다.
3. **등급 복제/삭제** — 기존 등급을 복제하여 새 등급을 빠르게 생성할 수 있다. 기본 등급(`isDefault=true`)은 삭제 불가다.
4. **통계** — 등급별 회원 수 분포와 전체 등급 수를 상단 통계 카드에 표시한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 등급 기본 정보

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **등급명 (name)** | Input | Y | 2 ~ 20자 | 고객에게 노출되는 등급 이름이다. |
| **설명 (description)** | Textarea | N | 최대 200자 | 등급 설명 텍스트다. |
| **Badge 색상 (badgeVariant)** | ToggleButtonGroup | Y | success/warning/info/critical/default/secondary/primary | 목록 및 회원 상세에서 표시할 Badge 색상이다. |
| **순서 (order)** | Drag & Drop | Y | 1 이상 | 등급 우선순위. 드래그로 변경한다. |

#### 달성 조건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **최소 총 주문금액 (minTotalOrderAmount)** | Number Input | N | null=조건 없음 | 달성에 필요한 누적 주문 금액이다. |
| **최소 주문 횟수 (minOrderCount)** | Number Input | N | null=조건 없음 | 달성에 필요한 누적 주문 횟수다. |
| **산정 기간 유형 (calculationPeriod.type)** | ToggleButton | Y | `lifetime`/`recent_months` | 전체 기간 또는 최근 N개월이다. |
| **산정 개월 수 (calculationPeriod.months)** | Number Input | C(recent_months) | 1 이상 | 최근 N개월 기간 설정이다. |
| **등급 유지 기간 (retentionMonths)** | Number Input | N | null=무제한 | 등급 유지 개월 수. 초과 시 재평가한다. |

#### 등급 혜택 (캠페인 연동)

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **연결된 쿠폰/포인트** | Badge (ReadOnly) | N | - | 마케팅 > 혜택 캠페인에서 `membership_upgrade` 트리거로 해당 등급이 설정된 캠페인의 혜택을 읽기 전용으로 노출합니다. |
| **안내 메시지** | Text | - | - | "포인트·쿠폰 혜택은 마케팅 > 혜택 캠페인에서 '멤버십 달성 시' 트리거로 관리합니다." 메시지를 제공합니다. |

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **name** | String | Y | 2 ~ 20자 | 등급명이다. |
| **description** | String | N | 최대 200자 | 등급 설명이다. |
| **badgeVariant** | Enum | Y | 7가지 | Badge UI 색상이다. |
| **order** | Integer | Y | 1 이상 | 등급 정렬 순서다. |
| **achievementCondition** | JSON | Y | - | 달성 조건 객체다. |
| **isActive** | Boolean | Y | - | 활성 여부다. |
| **isDefault** | Boolean | Y | - | 기본 등급 여부. 삭제 불가다. |
| **memberCount** | Integer | Y | 0 이상 | 해당 등급 회원 수(캐시)다. |
| **createdAt** | Timestamp | Y | - | 생성 일시다. |
| **updatedAt** | Timestamp | Y | - | 수정 일시다. |
| **createdBy** | String | Y | - | 생성자 ID다. |

**[API 및 비즈니스 로직 제약사항]**
- 등급 순서 변경은 배열 순서 일괄 업데이트 API로 처리한다.
- 등급 삭제 시 해당 등급 회원은 기본 등급(`isDefault=true`)으로 자동 이동한다.
- 등급 복제 시 이름에 "(복사본)" 접미사를 추가하고 `isDefault=false`로 설정한다.
- 등급 평가 배치: `retentionMonths` 초과 회원의 등급을 재평가하는 스케줄러가 필요하다.
- 프론트엔드 등급 캐시(`initGradeCache`)를 통해 등급 ID → 라벨/Badge 매핑을 전역 관리한다.

**[⚠️ 트래픽/성능 검토]**
- **등급 평가 배치** — retentionMonths 초과 회원 재평가는 대량 쿼리. 청크 단위 처리 + 인덱스(grade, lastEvaluatedAt) 필수이다.
- **등급 캐시** — 프론트엔드 initGradeCache + 서버 Redis 캐시로 등급 ID→라벨 매핑을 전역 관리한다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 등급 등록

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 등급 관리 진입 | 좌측 등급 목록 + 우측 폼 렌더링 | 기본 등급(isDefault) 존재 확인 |
| 2 | [등급 추가] 클릭 | 빈 폼 표시 | 필수 필드 초기 상태 |
| 3 | 등급명/설명/Badge색상 입력 | 실시간 유효성 검증 | 2~20자, Badge 7종 중 선택 |
| 4 | 달성조건: 최소 주문 50,000원 + 최근 3개월 | 조건 입력 폼 | null=조건 없음 |
| 5 | 혜택 안내 영역 확인 | ReadOnly 목록 | 캠페인과 연동됨 |
| 6 | [저장] → 좌측 목록에 추가 | `POST /membership-grades` → 갱신 | 순서 자동 최하위 |

### 시나리오 2: 등급 순서 변경 (드래그 앤 드롭)

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 좌측 등급 목록에서 항목 드래그 | 드래그 중 시각적 피드백 | @dnd-kit 라이브러리 |
| 2 | 원하는 위치에 드롭 | 목록 순서 재배치 | 즉시 반영 |
| 3 | [순서 저장] 클릭 또는 드롭 시 바로 반영 | `PATCH /membership-grades/reorder` { gradeIds } | 전체 순서 일괄 업데이트 |

---

## 4. 개발자용 정책 설명

### 4.1. 등급 평가 배치

```
실행: retentionMonths가 설정된 등급에 대해 매월 1일 00:00
대상: lastEvaluatedAt + retentionMonths < now()인 회원
처리:
  1. 회원의 calculationPeriod 기간 내 주문 금액/횟수 집계
  2. 달성 조건 충족 → 등급 유지 또는 승급
  3. 미충족 → 한 단계 하위 등급으로 강등
  4. 기본 등급(isDefault) 미만으로 강등 불가
승급 시: 해당 등급을 트리거(`targetGrades`)로 지정한 '마케팅 > 혜택 캠페인' 룰에 의해 쿠폰 및 포인트가 자동 발급됨.
```

### 4.2. 기본 등급 보호 정책

```
isDefault=true 등급:
  - 삭제 불가 (400 에러)
  - 시스템에 반드시 1개 존재
  - 등급 삭제 시 해당 등급 회원은 기본 등급으로 자동 이동
```



### 공통 규칙 (Common Rules)
- Base URL: `{VITE_API_URL}`
- 인증: HttpOnly 쿠키 기반 세션 인증
- 공통 응답: `{ "data": ... }` 또는 `{ "data": [...], "pagination": {...} }`
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`


---

## 회원 등급 (Membership Grades) API

### 13-1. 등급 전체 통계 조회
```http
GET /membership-grades/stats
```
**Response** `200 OK`
```json
{
  "data": {
    "total": 5,
    "active": 4,
    "totalMembers": 12500
  }
}
```

### 13-2. 멤버십 등급 목록 조회
```http
GET /membership-grades
```
**Query Parameters**: `keyword` (이름/설명), `isActive` (boolean), `page`, `limit`
**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "grade-vip",
      "name": "VIP",
      "description": "VIP 등급입니다",
      "badgeVariant": "critical",
      "order": 1,
      "achievementCondition": {
        "minTotalOrderAmount": 500000,
        "minOrderCount": 30,
        "calculationPeriod": { "type": "recent_months", "months": 6 },
        "retentionMonths": 6
      },
      "isActive": true,
      "isDefault": false,
      "memberCount": 542,
      "createdAt": "2026-03-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "total": 5, "totalPages": 1 }
}
```

### 13-3. 멤버십 등급 상세 조회
```http
GET /membership-grades/:id
```
**Response** `200 OK` // 단일 Grade 모델 반환

### 13-4. 멤버십 등급 생성 및 수정
```http
POST /membership-grades
PUT /membership-grades/:id
```
**Request Body**: 메타 데이터를 제외한 등급 필드 목록 (MembershipGradeFormData)
**Response** `200 OK` (생성 시 `201 Created`)

### 13-5. 멤버십 등급 복제
```http
POST /membership-grades/:id/duplicate
```
**Response** `201 Created`

### 13-6. 멤버십 등급 삭제
```http
DELETE /membership-grades/:id
```
**Response** `204 No Content`

### 13-7. 멤버십 등급 노출 순서 재배치
```http
PATCH /membership-grades/reorder
```
**Request Body**
```json
{
  "gradeIds": ["grade-3", "grade-2", "grade-1"]
}
```
**Response** `200 OK`


---

<!-- MERGED FROM spec_member_segment.md -->
# 회원 추출 및 그룹 관리(Member Segment) 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **회원 추출** 및 **회원 그룹** 페이지의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/app-members/extract` | 회원 추출 (MemberExtract) | app-members:read |
| `/app-members/groups` | 회원 그룹 목록 (MemberGroups) | app-members:read |
| `/app-members/groups/:id` | 회원 그룹 상세 (MemberGroupDetail) | app-members:read |

---

## 2. 페이지 프로세스

### 2.1 회원 추출 (`/app-members/extract`)

1. **세그먼트 필터 설정** — 4개 탭(기본정보/주문/마케팅/고급)으로 분류된 필터 조건 설정.
2. **결과 미리보기** — 필터 조건에 맞는 회원 목록 실시간 조회.
3. **내보내기** — 선택 컬럼(체크박스)으로 CSV/Excel 다운로드.
4. **그룹 저장** — 추출 결과를 신규/기존 그룹에 저장.
5. **캠페인 연계** — 관련 캠페인 요약 카드 표시, 추출 회원을 캠페인 대상으로 연결.

### 2.2 회원 그룹 (`/app-members/groups`)

1. **그룹 목록** — 검색 + 페이지네이션.
2. **그룹 생성/수정** — GroupFormModal로 그룹명, 설명 입력.
3. **그룹 상세** — 소속 회원 목록 조회/관리. AddMembersModal로 회원 추가.
4. **그룹 삭제** — 확인 후 삭제. 회원 연결만 해제.

---

## 3. 세부 개발 명세

### 3.1. 프론트엔드

#### 기본정보 필터

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **회원 등급 (grades)** | Multi Toggle | N | VIP/골드/실버/브론즈/일반이다. |
| **회원 상태 (statuses)** | Multi Toggle | N | active/dormant/inactive/withdrawn이다. |
| **성별 (gender)** | Toggle | N | all/male/female이다. |
| **연령대 (ageRange)** | Range Input | N | min~max이다. |
| **가입일 (registeredDateRange)** | DateRange | N | from/to이다. |

#### 주문 필터

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **주문 횟수 (orderCountRange)** | Range Input | N | min/max이다. |
| **주문 금액 (totalAmountRange)** | Range Input | N | min/max이다. |
| **주문 유형 (orderType)** | Toggle | N | all/delivery/pickup이다. |
| **마지막 주문일** | DateRange | N | from/to이다. |

#### 마케팅/고급 필터

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **수신 동의 (consents)** | Multi Checkbox | N | marketing/push/sms/email이다. |
| **포인트 잔액** | Range Input | N | min/max이다. |
| **마지막 접속일** | DateRange | N | from/to이다. |
| **쿠폰 사용 여부** | Toggle | N | 쿠폰 사용 필터이다. |
| **특정 메뉴 주문** | Search Select | N | 상품 검색 선택이다. |
| **캠페인 참여** | Search Select | N | 캠페인 검색 선택이다. |

#### 그룹

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **그룹명 (name)** | Input | Y | 2~50자이다. |
| **설명 (description)** | Textarea | N | 최대 200자이다. |
| **회원 수** | Text (ReadOnly) | - | 소속 회원 수이다. |

---

### 3.2. 백엔드

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| POST | `/api/members/segment` | 세그먼트 필터로 회원 목록 조회. Pagination이다. |
| POST | `/api/members/segment/count` | 필터 조건별 예상 회원 수 조회이다. |
| POST | `/api/members/segment/export` | 선택 컬럼 기반 CSV/Excel 내보내기이다. |
| GET | `/api/member-groups` | 그룹 목록. Pagination이다. |
| POST | `/api/member-groups` | 그룹 생성이다. |
| GET | `/api/member-groups/:id` | 그룹 상세(소속 회원 포함)이다. |
| PUT | `/api/member-groups/:id` | 그룹 수정이다. |
| DELETE | `/api/member-groups/:id` | 그룹 삭제. GroupMember 매핑만 삭제이다. |
| POST | `/api/member-groups/:id/members` | 그룹에 회원 추가이다. |
| DELETE | `/api/member-groups/:id/members` | 그룹에서 회원 제거이다. |

#### DB 스키마 (MemberGroup)

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **id (PK)** | UUID | Y | 고유 식별자다. |
| **name** | String | Y | 2~50자이다. |
| **description** | String | N | 최대 200자이다. |
| **memberCount** | Integer | Y | 캐시 집계값이다. |
| **filter** | JSON | N | 동적 그룹 필터 조건이다. |
| **createdBy** | String | Y | 생성자 ID다. |

#### DB 스키마 (GroupMember)

groupId (FK), memberId (FK), addedAt — 복합 PK (groupId, memberId)

**[비즈니스 로직 제약사항]**
- 세그먼트 필터 API는 조건 조합별 예상 회원 수를 반환한다.
- 내보내기 시 개인정보 마스킹 권한에 따라 원문/마스킹 처리한다.
- 그룹 삭제 시 GroupMember 매핑만 삭제, 회원 데이터 유지한다.

**[⚠️ 트래픽/성능 검토]**
- **세그먼트 필터 쿼리** — 다중 조건 조합 시 풀스캔 위험. 주요 필터(grade, status, gender, registeredAt)에 복합 인덱스 필수. ORDER BY + LIMIT으로 페이지네이션 최적화한다.
- **예상 회원 수 API** — 실시간 COUNT 쿼리가 무거우므로 근사값(EXPLAIN의 rows 추정치) 또는 캐시(30초 TTL) 사용을 권장한다.
- **CSV 내보내기** — 대량(5만+) 시 비동기 처리 + 다운로드 링크 반환 방식을 권장한다. 동기 처리 시 HTTP 타임아웃 발생 가능하다.

---

## 4. 정상작동 시나리오

### 시나리오 1: 회원 추출 → 쿠폰 발급

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 회원 추출 메뉴 진입 | 추출 필터 폼 렌더링 | 등급/가입일/주문횟수/포인트 등 |
| 2 | 조건: VIP 등급 + 최근 30일 주문 3회 이상 | 필터 조건 설정 | AND 조건 조합 |
| 3 | [추출] 클릭 | 서버 집계 → 결과 목록 렌더링 | 추출 건수 표시 |
| 4 | 전체 선택 → [쿠폰 발급] | 발급 대상 확인 모달 → 쿠폰 선택 | 활성 쿠폰만 표시 |
| 5 | [발급] 클릭 | 비동기 처리 → 완료 Toast | 발급 결과 요약 |

### 시나리오 2: 회원 그룹 저장 → 재활용

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 추출 결과에서 [그룹 저장] 클릭 | 그룹명 입력 모달 | 2~50자 |
| 2 | 그룹명 입력 후 저장 | `POST /api/member-groups` → 성공 | 추출 조건 + 결과 ID 저장 |
| 3 | 이후 푸시/이벤트에서 대상 선택 시 | 저장된 그룹 목록에서 선택 가능 | 그룹 ID로 대상자 조회 |

