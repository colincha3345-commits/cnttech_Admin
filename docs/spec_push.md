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
