# 푸시 알림(Push Notification) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **푸시 알림 관리** 페이지(`/marketing/push-notifications`)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 페이지 프로세스 (Page Process)

1. **푸시 목록 조회** (`PushList`) — 상태별(초안/예약/발송중/완료/실패/취소) Badge 표기. 검색, 유형(정보성/광고성) 필터를 제공한다.
2. **푸시 등록/수정** (`PushForm`) — 알림 유형, 제목/본문, 딥링크, 발송 대상(세그먼트), 예약 설정, 트리거 조건, Android 확장 필드를 입력한다.
3. **푸시 상세** (`PushDetail`) — 발송 현황 통계(대상 수, 도달률, 클릭률)와 발송 이력을 조회한다.
4. **세그먼트 설정** — 회원 등급/지역/연령대별 필터로 대상 회원을 선정하며, 예상 발송 수를 실시간으로 표시한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 푸시 기본 정보

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **알림 유형 (type)** | ToggleButton | Y | `info`/`ad` | 정보성/광고성 구분. 광고성 시 수신 동의 회원만 대상이다. |
| **제목 (title)** | Input | Y | 2 ~ 50자 | 푸시 알림 제목이다. |
| **본문 (body)** | Textarea | Y | 최대 200자 | 푸시 알림 내용이다. |
| **딥링크 (deepLink)** | Input | N | scheme 형식 | 알림 클릭 시 앱 내 이동 경로다. |

#### 발송 대상 (세그먼트)

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **회원 등급** | Multi Checkbox | N | VIP/GOLD/SILVER/BRONZE/전체 | 등급별 필터링이다. |
| **지역** | Multi Checkbox | N | 17개 시도 + 전체 | 지역별 필터링이다. |
| **연령대** | Multi Checkbox | N | 10대~60대이상 + 전체 | 연령대별 필터링이다. |
| **예상 발송 수** | Text (ReadOnly) | - | - | 세그먼트 변경 시 실시간 갱신이다. |

#### 발송 스케줄

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **예약 발송 (isScheduled)** | Toggle | N | Boolean | 활성 시 예약일시 입력이다. |
| **예약일시 (scheduledAt)** | DateTimePicker | C(예약시) | ISO 8601 | 미래 시점만 허용한다. |

#### 트리거 조건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **트리거 유형 (triggerType)** | Select | Y | 7가지 | none(즉시/예약)/cart_abandoned/product_viewed/app_installed/purchase_completed/regular_schedule/time_limit 이다. |
| **정기 발송 주기** | ToggleButton | C(regular) | daily/weekly | 정기 스케줄 발송 주기다. |
| **정기 발송 요일** | Multi Checkbox | C(weekly) | 월~일 | 매주 발송 요일 선택이다. |
| **타임 리밋 이벤트** | Select | C(time_limit) | 이벤트 ID | 연결할 타임 리밋 이벤트 선택이다. |

#### Android 확장 필드

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **확장 제목 (androidExpandedTitle)** | Input | N | 최대 50자 | Android 확장 알림 제목이다. |
| **확장 본문 (androidExpandedBody)** | Textarea | N | 최대 500자 | Android 확장 알림 본문이다. |
| **요약 (androidSummary)** | Input | N | 최대 30자 | Android 요약 텍스트다. |
| **소형 아이콘** | File Upload | N | 이미지 파일 | Android 상태바 아이콘이다. |
| **대형 이미지** | File Upload | N | 이미지 파일 | Android 확장 시 대문 이미지다. |

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **type** | Enum | Y | `info`/`ad` | 알림 유형이다. |
| **title** | String | Y | 2 ~ 50자 | 푸시 제목이다. |
| **body** | String | Y | 최대 200자 | 푸시 본문이다. |
| **deepLink** | String | N | scheme 형식 | 앱 내 이동 딥링크다. |
| **status** | Enum | Y | `draft`/`scheduled`/`sending`/`completed`/`failed`/`cancelled` | 발송 상태다. |
| **targetCount** | Integer | Y | 0 이상 | 대상 회원 수다. |
| **triggerType** | Enum | Y | 7가지 | 트리거 유형이다. |
| **triggerConfig** | JSON | N | - | 트리거별 상세 설정(지연시간 등)이다. |
| **scheduledAt** | Timestamp | N | - | 예약 발송 시각이다. |
| **createdAt** | Timestamp | Y | - | 생성 일시다. |
| **updatedAt** | Timestamp | Y | - | 수정 일시다. |

**[API 및 비즈니스 로직 제약사항]**
- 광고성(`ad`) 푸시는 마케팅 수신 동의 회원(`marketingAgreed=true` AND `pushEnabled=true`)만 대상으로 발송한다.
- 정보성(`info`) 푸시는 `pushEnabled=true` 회원 전체를 대상으로 한다.
- 예약 발송은 스케줄러가 `scheduledAt` 도래 시 상태를 `sending`으로 전환 후 FCM/APNs를 통해 발송한다.
- 트리거 기반 발송은 이벤트 발생 시점에 조건 충족 회원에게 자동 발송한다.
- 발송 완료 후 도달률/클릭률 통계를 집계하여 상세 페이지에 노출한다.
