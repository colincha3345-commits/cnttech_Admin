# 매장(Store) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **매장(Store) 관리 카테고리**의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서입니다. 매장은 영업 상태와 배달 설정의 실시간 연동이 매우 중요한 도메인입니다.

---

## 1. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/staff/stores` | 매장 목록 | staff:read |
| `/staff/stores/new` | 매장 등록 | staff:write |
| `/staff/stores/:id` | 매장 상세 | staff:read |
| `/staff/stores/:id/edit` | 매장 수정 | staff:write |
| `/staff/stores/:id/edit/operating` | 영업정보 수정 | staff:write |
| `/staff/stores/:id/edit/integration` | 연동코드 수정 | staff:write |
| `/staff/stores/:id/edit/amenities` | 편의시설 수정 | staff:write |
| `/staff/stores/:id/edit/closed-day` | 휴무일 수정 | staff:write |
| `/staff/stores/:id/edit/payment-methods` | 결제수단 수정 | staff:write |

---

## 2. 페이지 프로세스 (Page Process)

1. **매장 목록 조회** (`StoreList`) — 현재 운영중(`active`)인 매장을 우선 노출한다. 지역, 계약 상태, 매장명, 점주명 조합 필터를 제공한다.
2. **매장 등록/수정** (`StoreForm`) — 탭 형태의 복합 입력 폼(기본정보, 영업/배달설정, 연동, 노출)으로 구성한다.
3. **매장 상세** (`StoreDetail`) — 읽기 전용 정보 표시. 앱 운영 상태(open/preparing/break_time/closed/temporarily_closed) 토글 제공. 하위 편집 페이지 진입점 제공.
4. **영업정보 수정** (`OperatingInfoEdit`) — 평일/주말/공휴일 영업시간, 요일별 개별 시간, 배달/포장 설정, 예약 설정, 라스트오더 시간 관리.
5. **휴무일 수정** (`ClosedDayEdit`) — 정기휴무(weekly/monthly_nth/monthly_date)와 비정기휴무(날짜+사유) 관리.
6. **편의시설 수정** (`AmenitiesEdit`) — 주차(대수, 안내문), 매장식사(좌석수), 와이파이(비밀번호) 설정.
7. **결제수단 수정** (`PaymentMethodsEdit`) — 현금/카드/간편결제 허용 여부 관리.
8. **연동코드 수정** (`IntegrationCodesEdit`) — POS/PG 연동 코드 관리. 일괄 업로드(PG/POS Bulk Upload Modal) 지원.
9. **노출 설정** (`VisibilitySettingsEditModal`) — 채널별(app/web/kiosk/배민/요기요/쿠팡이츠) 매장 노출 on/off 관리.
10. **직원 연결** (`StaffLinkModal`) — 매장 소유 점주 계정 검색 연결.

---

## 3. 세부 개발 명세

### 3.1. 프론트엔드 (Frontend) 개발 요건

#### 기본 정보

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **매장명 (name)** | Input | Y | 최대 50자 | 상단 제목과 연동 실시간 변경 표출한다. |
| **사업자번호 (businessNumber)** | Input | Y | 10자리 고정 | 000-00-00000 포맷 하이픈 자동 생성한다. |
| **주소 (address)** | Input + 지도 | Y | - | 카카오맵/네이버 지도 API로 위도/경도 자동 바인딩한다. |
| **계좌 정보 (bankAccount)** | Select + Input | Y | 은행별 계좌길이 | 입금 은행 Select와 계좌번호 Input 병렬 배치한다. |
| **계약 기간 (contract)** | DateRange | Y | YYYY-MM-DD | 시작일/종료일 Range Picker이다. |
| **상태 (status)** | Badge | Y | - | active=success, inactive=secondary, pending=warning, terminated=critical이다. |

#### 영업 정보

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **앱 운영 상태 (appOperatingStatus)** | StatusToggle | Y | 5가지 | open/preparing/break_time/closed/temporarily_closed이다. |
| **평일 영업시간 (weekdayHours)** | TimePicker | Y | HH:mm | openTime, closeTime, breakStart, breakEnd이다. |
| **주말 영업시간 (weekendHours)** | TimePicker | Y | HH:mm | 평일과 동일 구조이다. |
| **공휴일 영업시간 (holidayHours)** | TimePicker | N | HH:mm | 미설정 시 주말 시간 따른다. |
| **요일별 개별 시간 (dailyHours)** | TimePicker × 7 | N | HH:mm | 설정 시 평일/주말 시간보다 우선한다. |
| **라스트오더 (lastOrderMinutes)** | Number Input | N | 0 이상 | 마감 N분 전 주문 마감이다. |
| **정기휴무 (regularClosedDays)** | Dynamic List | N | - | weekly/monthly_nth/monthly_date 3가지 유형이다. |
| **비정기휴무 (irregularClosedDays)** | Dynamic List | N | YYYY-MM-DD + 사유 | 날짜+사유 입력이다. |
| **임시휴업 (isTemporarilyClosed)** | Switch | N | Boolean | 즉시 영업 중단이다. |

#### 배달/포장 설정

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **배달 가능 (delivery.isAvailable)** | Switch | Y | Boolean | 배달 설정 섹션 토글이다. |
| **배달 가능시간** | TimePicker | C(배달시) | HH:mm | 시작/종료 시간이다. |
| **배달 최소주문금액** | Number Input | C(배달시) | 0 이상 | 원 단위이다. |
| **배달비 설정** | Dynamic List | Y | 숫자(원) | 거리별/금액별 배달비 추가/삭제 가능한 UI이다. |
| **포장 가능 (pickup.isAvailable)** | Switch | Y | Boolean | 포장 설정 섹션 토글이다. |
| **예약 기능 (reservationAvailable)** | Switch + Number | N | 분 단위 | ON 시 '현재 시간 + N분부터' 입력이다. |

#### 편의시설 / 노출 / 결제수단

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **주차/매장식사/와이파이** | Switch + 하위 Input | Y | ON 시 상세 입력(대수, 좌석수, 비밀번호) 노출이다. |
| **채널별 노출 (visibilitySettings)** | Switch × N | Y | app/web/kiosk/배민/요기요/쿠팡이츠 개별 제어이다. |
| **현금/카드/간편결제** | Switch × N | Y | 결제수단별 허용 여부이다. |

---

### 3.2. 백엔드 (Backend) 개발 요건

#### Store 테이블

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 가맹점 식별 고유키이다. |
| **name** | String | Y | 최대 50자 | 매장명이다. |
| **status** | Enum | Y | - | 'active', 'inactive', 'pending', 'terminated' 만 허용한다. |
| **businessNumber** | String | Y | 10자 (숫자) | Unique Constraint 필수이다. |
| **address** | JSON | Y | - | {zipCode, address, addressDetail, lat, lng} 객체이다. |
| **ownerInfo** | JSON | Y | - | {name, phone, email} 점주 정보이다. |
| **businessInfo** | JSON | Y | - | {businessNumber, businessName, representativeName} 사업자 정보이다. |
| **contractInfo** | JSON | Y | - | {startDate, endDate, status, contractType} 계약 정보이다. |
| **bankAccountInfo** | JSON | Y | - | {bankName, accountNumber, accountHolder} 계좌 정보이다. |
| **operatingInfo** | JSON | Y | - | {appOperatingStatus, weekdayHours, weekendHours, holidayHours, dailyHours, regularClosedDays, irregularClosedDays, deliveryFee, freeDeliveryMinAmount, deliveryFeeByDistance, isTemporarilyClosed, temporaryCloseReason, temporaryCloseStartDate, temporaryCloseEndDate, isDeliveryAvailable, isPickupAvailable, deliverySettings, pickupSettings, isVisible}이다. |
| **visibilitySettings** | JSON | N | - | {channels: [{channel, isVisible, priority}], isSearchable, showNewBadge, newBadgeEndDate, showEventBadge, eventBadgeText, isRecommended, recommendedOrder} 노출 설정이다. |
| **amenities** | JSON | N | - | {hasParking, parkingCapacity, hasDineIn, seatCapacity, hasWifi, wifiPassword}이다. |
| **paymentMethods** | JSON | N | - | {isCardEnabled, isCashEnabled, isPointEnabled, simplePayments: [{type(kakaopay/naverpay/tosspay/samsungpay/payco/applepay), isEnabled}]}이다. |
| **integrationCodes** | JSON | N | - | {pos: {posVendor(okcashbag/kcp/unionpos/okpos/other), posCode, isConnected, lastSyncAt}, sk: {storeCode, fullCode, isEnabled}, pg: {pgVendor(smartro/kcp/nicepay/toss/other), mid, apiKey, isTestMode, isEnabled}, voucherVendor: {vendorName, storeCode, isEnabled}}이다. |
| **deliveryFee** | Integer | Y | 0 이상 | 기본 배달비이다. |

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/api/stores` | 매장 목록 조회. Pagination 필수. region, status, keyword 필터이다. |
| GET | `/api/stores/:id` | 매장 상세 조회이다. |
| POST | `/api/stores` | 매장 등록. StaffLink 트랜잭션 포함이다. |
| PUT | `/api/stores/:id` | 매장 전체 수정이다. |
| PATCH | `/api/stores/:id/status` | 앱 운영 상태 변경. **경량 단일 API**이다. |
| PATCH | `/api/stores/:id/operating` | 영업정보 수정이다. |
| PATCH | `/api/stores/:id/amenities` | 편의시설 수정이다. |
| PATCH | `/api/stores/:id/payment-methods` | 결제수단 수정이다. |
| PATCH | `/api/stores/:id/visibility` | 노출 설정 수정이다. |
| PATCH | `/api/stores/:id/integration` | 연동코드 수정이다. |
| POST | `/api/stores/:id/integration/test` | POS/PG 연동 테스트이다. |
| POST | `/api/stores/bulk/pg-upload` | PG 일괄 업로드이다. |
| POST | `/api/stores/bulk/pos-upload` | POS 일괄 업로드이다. |
| GET | `/api/stores/check-business-number` | 사업자번호 중복 확인이다. |

**[API 및 비즈니스 로직 제약사항]**
- **상태 변경 API** — 영업중→임시휴업 등은 POS앱 실시간 연동 고려하여 경량 단일 API로 분리한다. WebSocket/SSE Push를 권장한다.
- **예약 가능 시간 유효성** — `reservationLeadTimeMinutes`가 매장 마감시간을 초과하는 모순을 서버에서 밸리데이션한다.
- **StaffLink 트랜잭션** — 매장 생성 후 점주(Owner) 계정 매핑 및 권한 인서트를 트랜잭션 단위로 완료한다.
- **operatingInfo PATCH** — JSON 전체 교체 방식(PUT semantics)을 권장한다. 부분 병합 시 JSON 깊이 문제 발생 가능하다.

**[⚠️ 트래픽/성능 검토]**
- **앱 운영 상태 조회** — 고객앱 매장 목록 조회 시 appOperatingStatus 실시간 반영 필요. Redis에 매장별 운영 상태 캐싱, 변경 시 즉시 갱신(Write-through)한다.
- **매장 목록 API** — 지역+상태 조합 조회가 빈번하므로 `(region, status)` 복합 인덱스를 생성한다.
- **POS 연동 테스트** — 외부 API 호출이므로 타임아웃(5초)과 Circuit Breaker를 적용한다.

---

## 4. 정상작동 시나리오

### 시나리오 1: 매장 신규 등록

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 매장 목록 → [매장 등록] 클릭 | 등록 폼 렌더링 | 필수 필드 빈 상태 |
| 2 | 기본정보 입력 (매장명, 전화, 주소) | 실시간 유효성 검증 | 매장명 2~50자, 전화 형식 |
| 3 | 영업정보 입력 (영업시간, 배달비) | 배달비 조건별 입력 폼 동적 표시 | 무료배달 최소금액 ≥ 0 |
| 4 | 결제수단 설정 (카드/현금/간편결제) | 간편결제 6종 토글 스위치 | 최소 1개 이상 활성화 |
| 5 | 연동정보 입력 (POS/PG) | 벤더별 코드 입력 필드 | 형식 검증 |
| 6 | [저장] 클릭 | `POST /api/stores` → 성공 Toast → 목록 이동 | 목록에 신규 매장 표시 |

### 시나리오 2: 임시 휴업 설정

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 매장 상세 → 영업정보 탭 | 현재 영업 상태 표시 | isOpen 상태 확인 |
| 2 | "임시휴업" 토글 활성화 | 사유/시작일/종료일 입력 필드 노출 | 종료일 > 시작일 검증 |
| 3 | 정보 입력 후 저장 | `PATCH /api/stores/:id` → 매장 상태 변경 | 고객앱에서 해당 매장 비노출 또는 "휴업중" 표시 |

---

## 5. 개발자용 정책 설명

### 5.1. 매장 노출 정책

```
isVisible=false → 고객앱 검색/목록에서 완전 비노출
isOpen=false (임시휴업) → 고객앱에서 "휴업중" 라벨 표시, 주문 접수 차단
temporaryCloseReason 필수 입력, temporaryCloseEndDate 도래 시 자동 복원하지 않음 (관리자 수동 전환)
```

### 5.2. 배달비 정책

```
deliveryFee: 기본 배달비 (0 이상)
freeDeliveryMinAmount: 무료배달 최소 주문금액. null이면 무료배달 없음
deliveryFeeByDistance: [{minDistance, maxDistance, fee}] 거리별 배달비 구간
적용 우선순위: 거리별 > 기본 배달비 > 무료배달 조건 판정
```

### 5.3. 정산 비율 정책

```
프로모션(할인/쿠폰) 생성 시 headquartersRatio + franchiseRatio = 100 필수
서버 검증: 합계 ≠ 100이면 400 Bad Request 반환
변경 시 기존 진행 중인 프로모션에는 소급 적용하지 않음. 신규 생성분부터 적용
```

