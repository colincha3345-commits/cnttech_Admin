# 대시보드(Dashboard) 기획 명세서

본 문서는 관리자 대시보드 내 **대시보드** 페이지(`/dashboard`)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/dashboard` | 대시보드 (Dashboard) | dashboard:read |
| `/dashboard/ga4` | GA4 통계 (GA4Statistics) | dashboard:read |
| `/dashboard/ga4/device` | GA4 디바이스 상세 (GA4DeviceDetail) | dashboard:read |
| `/dashboard/ga4/funnel` | GA4 퍼널 분석 (GA4FunnelDetail) | dashboard:read |


## 1. 페이지 프로세스 (Page Process)

1. **기간 필터** — 오늘/어제/최근7일/최근30일/직접입력 프리셋으로 조회 기간을 설정한다.
2. **핵심 통계 카드** — 전체 주문 금액(`todayRevenue`), 전체 주문 수(`todayOrders`), 등록 가맹점 수(`totalStores`), 신규 가입 회원 수(`newSignupNormal + newSignupSimple`)를 상단에 표시한다. `useDashboard` → `DashboardStats` 기반.
3. **정보 카드** — 매출 현황(전체/완료/취소 금액), 회원 현황(전체/신규일반/신규간편/탈퇴), 문의 현황(대기`pending`/완료`resolved`) 등 섹션별 요약 정보와 바로가기 버튼을 제공한다. `DashboardStats` 기반.
4. **주문 상세 차트** — 주문 유형별/채널별/결제수단별/회원별 비율을 탭으로 전환하여 표시한다. `useOrderDetails` hook 연동.
5. **일별 매출 차트** — 선택 기간의 일별 매출 추이를 막대 차트로 표시한다. `useDailySales(dateRange)` hook 연동. 기간 변경 시 자동 재조회.
6. **회원 분석** — 회원 상태 요약, 성별/연령대 분포, 등급별 구성, 성장 지표, Top5 고객, 주문 빈도를 표시한다. `useMemberAnalytics` hook 연동.
7. **마케팅 성과** — 배너/이벤트별 노출·클릭·전환율을 테이블로 표시한다. `useMarketingStats` hook 연동.
8. **GA4 통계** — 디바이스별 상세(`GA4DeviceDetail`), 퍼널 분석(`GA4FunnelDetail`) 컴포넌트를 제공한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 데이터 소스 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **기간 필터 (dateRange)** | DateRangeFilter | Y | 로컬 state | 오늘/어제/7일/30일/직접입력. 변경 시 전체 데이터 재조회. |
| **전체 주문 금액** | StatCard | - | `stats.todayRevenue` | 통화 포맷 표시. |
| **전체 주문 수** | StatCard | - | `stats.todayOrders` | 숫자 표시. |
| **등록 가맹점 수** | StatCard | - | `stats.totalStores` | 숫자 표시. |
| **신규 가입 회원 수** | StatCard | - | `stats.newSignupNormal + newSignupSimple` | 일반+간편 합산 표시. |
| **매출 현황 InfoCard** | Card | - | `stats.todayRevenue / todayCompletedRevenue / todayCancelledRevenue` | 전체/완료/취소 금액. |
| **회원 현황 InfoCard** | Card | - | `stats.totalMembers / newSignupNormal / newSignupSimple / withdrawalCount` | 전체/일반가입/간편가입/탈퇴. |
| **문의 현황 InfoCard** | Card | - | `stats.pendingInquiries / resolvedInquiries` | 대기/완료. (InquiryStatus: pending/resolved) |
| **주문 상세 차트** | OrderDetailsChart | - | `useOrderDetails` → `OrderDetailsData` | 유형/채널/결제/회원별 탭 전환. |
| **일별 매출 차트** | DailySalesChart | - | `useDailySales(dateRange)` → `DailySalesItem[]` | 기간 연동 막대 차트. |
| **회원 분석** | MemberAnalytics | - | `useMemberAnalytics` → `MemberAnalyticsData` | 요약/성별/연령/등급/성장/Top5/빈도. |
| **마케팅 성과** | MarketingPerformance | - | `useMarketingStats` → `MarketingStats` | 배너/이벤트 성과 테이블. |

---

### 2.2. 백엔드 (Backend) 개발 요건

#### DashboardStats (통계 요약)

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **todayRevenue** | Decimal | Y | 기간 내 총 매출 |
| **todayCompletedRevenue** | Decimal | Y | 주문 완료 금액 |
| **todayCancelledRevenue** | Decimal | Y | 주문 취소 금액 |
| **todayOrders** | Integer | Y | 기간 내 총 주문 수 |
| **totalProducts** | Integer | Y | 등록 상품 수 |
| **totalStores** | Integer | Y | 등록 가맹점 수 |
| **yesterdayOrders** | Integer | Y | 전일 주문 수 |
| **yesterdayRevenue** | Decimal | Y | 전일 매출 |
| **ordersChange** | Float | Y | 주문 수 변화율(%) |
| **revenueChange** | Float | Y | 매출 변화율(%) |
| **totalMembers** | Integer | Y | 전체 회원 수 |
| **newSignupNormal** | Integer | Y | 신규 일반 회원가입 수 |
| **newSignupSimple** | Integer | Y | 신규 간편 회원가입 수 |
| **withdrawalCount** | Integer | Y | 탈퇴 회원 수 |
| **pendingInquiries** | Integer | Y | 대기 중 문의 (InquiryStatus: pending) |
| **resolvedInquiries** | Integer | Y | 처리 완료 (InquiryStatus: resolved) |

#### 개별 API 응답 데이터

| 필드 | 타입 | API | 비고 |
| :--- | :--- | :--- | :--- |
| **dailySales** | DailySalesItem[] | `GET /dashboard/daily-sales` | 일별 매출/주문수/평균주문금액 |
| **orderDetails** | OrderDetailsData | `GET /dashboard/order-details` | 유형별/채널별/결제수단별/회원별 비율+건수 |
| **memberAnalytics** | MemberAnalyticsData | `GET /dashboard/member-analytics` | 요약/성별/연령/등급/성장/Top5/주문빈도 |
| **marketingPerformance** | MarketingStats | `GET /dashboard/marketing` | 배너/이벤트 성과 |

**[API 및 비즈니스 로직 제약사항]**
- 대시보드 API는 집계 쿼리 성능을 위해 Redis 캐싱을 권장한다. 캐시 TTL은 기간 프리셋에 따라 차등 설정한다.
- 페이지 진입 시 `usePageViewLog`로 접속 이력을 자동 기록한다.
- 모든 통계 컴포넌트는 서비스 레이어를 통해 데이터를 조회하며, 컴포넌트 내 하드코딩 데이터를 사용하지 않는다.

**[⚠️ 트래픽/성능 검토]**
- **집계 쿼리** — 대시보드 API는 다수의 집계(SUM/COUNT)를 동시에 실행한다. Redis 캐싱(프리셋별 TTL 차등: 오늘=1분, 최근7일=5분, 최근30일=30분)을 권장한다.
- **GA4 통계** — 외부 GA4 API 호출이므로 서버사이드 프록시 + 캐시(1시간 TTL)를 적용한다. GA4 API 할당량에 주의한다.

---

## 2.3. 권한별 유즈케이스

| 권한 | 유즈케이스 |
| :--- | :--- |
| **최고 관리자** | - 전 가맹점 통합 매출/동향 열람, 전사 지표 및 마케팅 성과 확인 |
| **운영 관리자** | - 담당 권역 및 브랜드 매출 및 마케팅 성과 통계 조회 |
| **가맹점주** | - 자기 매장의 매출, 주문 현황, 고객 리뷰 통계만 제한적으로 조회 |

---

## 3. 정상작동 시나리오

### 시나리오 1: 대시보드 진입 → 현황 확인

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 로그인 후 `/dashboard` 이동 | `useDashboard` → StatCard 4개 + InfoCard 3개 로드 | 모든 값 서비스 연동 확인 |
| 2 | 기간 필터 변경 (최근 7일) | 통계/일별매출 자동 재조회 | DailySalesChart 기간 반영 |
| 3 | 주문 상세 탭 전환 | `useOrderDetails` → 유형/채널/결제/회원 데이터 표시 | 탭별 데이터 변경 |
| 4 | 회원 분석 확인 | `useMemberAnalytics` → 요약/성별/연령/등급/Top5 표시 | 하드코딩 없음 확인 |
| 5 | 매출현황 "주문내역 확인하러 가기" 클릭 | `/orders`로 이동 | 라우트 정상 이동 |
| 6 | 문의현황 "1:1 문의 확인하러 가기" 클릭 | `/support`로 이동 | 라우트 정상 이동 |



### 공통 규칙 (Common Rules)
- Base URL: `{VITE_API_URL}`
- 인증: HttpOnly 쿠키 기반 세션 인증
- 공통 응답: `{ "data": ... }` 또는 `{ "data": [...], "pagination": {...} }`
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`


---

## 대시보드 (Dashboard) API

### 10-1. HQ 메인 대시보드 통계
```http
GET /dashboard/summary
```
**Query Parameters**: `preset` (yesterday, today, last7days, lastMonth, custom), `from`, `to`
**Response** `200 OK`
```json
{
  "data": {
    "totalProducts": 1284,
    "todayOrders": 156,
    "todayRevenue": 4850000,
    "todayCompletedRevenue": 2910000,
    "todayCancelledRevenue": 485000,
    "totalStores": 89,
    "yesterdayOrders": 142,
    "yesterdayRevenue": 4320000,
    "ordersChange": 9.86,
    "revenueChange": 12.27,
    "totalMembers": 88000,
    "newSignupNormal": 80,
    "newSignupSimple": 60,
    "withdrawalCount": 8,
    "pendingInquiries": 80,
    "resolvedInquiries": 8
  }
}
```

### 10-2. 주문 상세 분석
```http
GET /dashboard/order-details
```
**Response** `200 OK`
```json
{
  "data": {
    "byType": [{ "label": "배달", "value": 55, "count": 1560 }, { "label": "포장", "value": 35, "count": 992 }, { "label": "매장식사", "value": 10, "count": 283 }],
    "byChannel": [{ "label": "앱", "value": 52, "count": 1474 }, { "label": "키오스크", "value": 22, "count": 623 }, { "label": "POS", "value": 15, "count": 425 }, { "label": "웹", "value": 11, "count": 312 }],
    "byPayment": [{ "label": "카드", "value": 48, "count": 1360 }, { "label": "카카오페이", "value": 20, "count": 567 }],
    "byMember": [{ "label": "회원", "value": 85, "count": 2409 }]
  }
}
```

### 10-3. 일별 매출 조회
```http
GET /dashboard/daily-sales
```
**Query Parameters**: `preset`, `from`, `to`
**Response** `200 OK`
```json
{
  "data": [
    { "date": "2026-03-10", "revenue": 1050000, "orders": 85, "avgOrderAmount": 12350 }
  ]
}
```

### 10-4. 회원 분석 조회
```http
GET /dashboard/member-analytics
```
**Response** `200 OK`
```json
{
  "data": {
    "summary": { "total": 88000, "active": 62500, "dormant": 18200, "newSignup": 140, "withdrawal": 8 },
    "gender": [{ "label": "여성", "value": 52.3, "count": 46024 }],
    "age": [{ "range": "20대", "percentage": 28.5, "count": 25080 }],
    "membership": [{ "grade": "VIP", "count": 2640, "percentage": 3.0 }],
    "growth": { "newCustomerRate": 18.5, "monthlyNewAvg": 4200, "monthlyChurnAvg": 380 },
    "topCustomers": [{ "rank": 1, "name": "김**", "totalOrders": 142, "totalAmount": 4250000, "grade": "VIP" }],
    "orderFrequency": [{ "label": "주문 1회", "percentage": 35.2, "count": 30976 }]
  }
}
```

### 10-5. 마케팅 성과 조회
```http
GET /dashboard/marketing
```
**Query Parameters**: `preset`, `from`, `to`
**Response** `200 OK`
```json
{
  "data": {
    "totalImpressions": 372400,
    "totalClicks": 34523,
    "avgCtr": 9.2,
    "avgConversionRate": 14.8,
    "items": [
      {
        "id": "b1",
        "name": "신메뉴 출시 배너",
        "type": "banner",
        "impressions": 45200,
        "clicks": 3616,
        "ctr": 8.0,
        "conversions": 542,
        "conversionRate": 15.0,
        "trafficSource": "앱 메인",
        "avgDwellTime": 32
      }
    ]
  }
}
```

### 10-6. 상태 변경 감사(Audit) 로그
```http
GET /audit-logs
```
**Query Parameters**
- `resourceType` (string, N) - `order` | `product` | `coupon` | `member` | `settings`
- `action` (string, N) - `create` | `update` | `delete`
- `adminId` (string, N)
- `page`, `limit`

**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "log-1",
      "adminId": "admin-1",
      "adminName": "홍길동",
      "action": "update",
      "resourceType": "product",
      "resourceId": "prod-1",
      "changes": {
        "price": { "from": 15000, "to": 18000 }
      },
      "ipAddress": "192.168.1.1",
      "createdAt": "2026-03-13T09:15:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 100 }
}
```


---


---

<!-- MERGED FROM spec_audit_log.md -->
# 감사 로그(Audit Log) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **감사 로그** 페이지의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/audit-logs` | 감사 로그 목록 (AuditLogList) | audit-logs:read |

---

## 2. 페이지 프로세스

1. **로그 목록 조회** — 기간, 액션 유형, 심각도(info/warning/critical), 수행자 필터를 적용하여 감사 로그를 조회한다.
2. **액션 유형** — login, logout, create, update, delete, status_change, permission_change, password_reset, export, bulk_update, settings_change, masking_view 등 다양한 관리자 활동을 추적한다.
3. **상세 정보** — 각 로그의 수행자, IP, 대상 엔티티, 변경 전/후 데이터, 수행 일시를 표시한다.

---

## 3. 세부 개발 명세

### 3.1. 프론트엔드

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **기간 필터** | DateRange | N | 기본 최근 7일이다. |
| **액션 유형 필터** | Multi Select | N | 18가지 액션 유형이다. |
| **심각도 필터** | ToggleButton | N | all/info/warning/critical이다. |
| **수행자 필터** | Search Input | N | 이름/이메일로 검색이다. |
| **심각도 Badge** | Badge | Y | info=info, warning=warning, critical=critical이다. |
| **수행자 (performedBy)** | Text | Y | 관리자명 + 이메일이다. |
| **액션 (action)** | Badge + Text | Y | 액션 유형별 Badge이다. |
| **대상 (target)** | Text | N | 영향 받은 엔티티 이름/ID이다. |
| **변경 내용** | Expandable Row | N | 변경 전/후 diff 표시이다. |
| **IP 주소** | Text | Y | 접속 IP이다. |
| **일시 (createdAt)** | Text | Y | YYYY-MM-DD HH:mm:ss이다. |

### 3.2. 백엔드

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/api/audit-logs` | 로그 목록 조회. 기간, action, severity, performer 필터, Pagination이다. |
| GET | `/api/audit-logs/:id` | 로그 상세(변경 diff 포함)이다. |
| POST | `/api/audit-logs` | 로그 기록 (내부 서비스 간 호출)이다. |

#### DB 스키마 (AuditLog)

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **id (PK)** | UUID | Y | 고유 식별자다. |
| **action** | Enum | Y | LOGIN/LOGIN_FAILED/LOGOUT/MFA_VERIFIED/MFA_FAILED/PASSWORD_CHANGED/USER_CREATED/USER_UPDATED/USER_DELETED/USER_STATUS_CHANGE/PERMISSION_CHANGED/UNMASK_DATA/DATA_EXPORT/DATA_DOWNLOAD/DOWNLOAD_HISTORY_VIEW/SESSION_EXPIRED/ACCESS_DENIED/ACCESS_ATTEMPT/SETTINGS_CHANGED (18가지)이다. |
| **severity** | Enum | Y | 'info', 'warning', 'critical'이다. |
| **performedBy** | UUID (FK) | Y | 수행자 계정 참조다. |
| **performerName** | String | Y | 역정규화 조회용이다. |
| **performerEmail** | String | Y | 역정규화 조회용이다. |
| **targetEntity** | String | N | 대상 엔티티 타입(store, member, order 등)이다. |
| **targetId** | String | N | 대상 엔티티 ID다. |
| **description** | String | Y | 활동 설명이다. |
| **previousData** | JSON | N | 변경 전 스냅샷이다. |
| **newData** | JSON | N | 변경 후 스냅샷이다. |
| **ipAddress** | String | Y | 접속 IP이다. |
| **userAgent** | String | N | 브라우저 정보다. |
| **sessionId** | String | N | 세션 식별자다. |
| **requestId** | String | N | 요청 추적 ID다. |
| **createdAt** | Timestamp | Y | 기록 일시다. |

#### 알람 설정 (AuditAlarmConfig)

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **id** | UUID | Y | 관리자 계정 ID다. |
| **receiveEmail** | Boolean | Y | 이메일 알림 수신 여부다. |
| **receivePush** | Boolean | Y | 푸시 알림 수신 여부다. |
| **monitoredActions** | JSON | Y | 알림 대상 액션 배열이다. |

**[비즈니스 로직 제약사항]**
- 감사 로그는 수정/삭제 불가(Append-only)이다.
- 심각도 매핑: LOGIN_FAILED/MFA_FAILED/PASSWORD_CHANGED/USER_STATUS_CHANGE/UNMASK_DATA/DATA_EXPORT/SETTINGS_CHANGED=warning, USER_DELETED/PERMISSION_CHANGED/ACCESS_DENIED=critical, 나머지=info이다.
- 로그인 실패도 기록하되, 비밀번호 원문은 절대 기록하지 않는다.

**[⚠️ 트래픽/성능 검토]**
- **INSERT 빈도** — 관리자 활동마다 기록되므로 INSERT 부하가 높을 수 있다. 비동기 큐(Message Queue)를 통한 기록을 권장한다.
- **조회 인덱스** — (createdAt DESC, action, severity) 복합 인덱스 필수. 기간 필터 조회가 가장 빈번하다.
- **데이터 보관** — 로그 데이터가 무한 증가하므로 90일 이상 된 로그는 Cold Storage(S3)로 아카이빙하고 DB에서 삭제하는 정책을 권장한다.
- **알림 설정** — AuditAlarmConfig를 통해 critical 로그 발생 시 Slack/이메일 알림을 발송할 수 있다.

---

## 4. 정상작동 시나리오

### 시나리오 1: 감사 로그 조회

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 감사 로그 페이지 진입 | 최근 로그 목록 로드 | 최신순 정렬, 페이지네이션 |
| 2 | 필터: 액션="LOGIN_FAILED" + 기간 설정 | 필터 적용 → 목록 갱신 | 복합 필터 AND |
| 3 | 로그 행 클릭 | 상세 모달: IP, User-Agent, 요청 본문 | sessionId, requestId 표시 |

### 시나리오 2: 알림 설정

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 알림 설정 탭 진입 | 현재 알림 설정 로드 | AuditAlarmConfig |
| 2 | 모니터링 액션 선택 (ACCESS_DENIED 등) | 체크박스 선택 | monitoredActions 배열 |
| 3 | 알림 채널: 이메일 ON, 푸시 ON | 토글 스위치 | receiveEmail, receivePush |
| 4 | [저장] | 설정 저장 → 해당 액션 발생 시 알림 발송 | 실시간 알림 동작 |

---

## 5. 개발자용 정책 설명

### 5.1. 감사 로그 보존 정책

```
보존 기간: 최소 1년 (법적 요건에 따라 연장 가능)
삭제: 자동 삭제 불가. 관리자도 삭제 권한 없음 (append-only)
아카이브: 6개월 경과 로그는 별도 아카이브 테이블로 이동 가능
```

### 5.2. severity 매핑

```
CRITICAL: LOGIN_FAILED, ACCESS_DENIED, ACCESS_ATTEMPT, MFA_FAILED
HIGH: USER_DELETED, PERMISSION_CHANGED, PASSWORD_CHANGED, UNMASK_DATA
MEDIUM: USER_CREATED, USER_UPDATED, USER_STATUS_CHANGE, DATA_EXPORT, DATA_DOWNLOAD, SETTINGS_CHANGED
LOW: LOGIN, LOGOUT, MFA_VERIFIED, SESSION_EXPIRED, DOWNLOAD_HISTORY_VIEW
```

### 5.3. 알림 트리거 정책

```
monitoredActions에 포함된 액션 발생 시:
  - receiveEmail=true → 이메일 발송 (비동기 큐)
  - receivePush=true → 관리자 앱 푸시 발송
CRITICAL 액션: 알림 설정과 무관하게 항상 발송 (강제)
```

