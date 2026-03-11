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
usePolicy: {minUsePoints, maxUseRate, useUnit}
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
