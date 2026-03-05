# 포인트 설정(Point Settings) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **포인트 설정** 페이지(`/marketing/point-settings`)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 페이지 프로세스 (Page Process)

1. **시스템 통계 조회** — 전체 적립/사용/소멸/잔액 4개 통계 카드를 상단에 표시한다.
2. **적립 정책 설정** — 정액(fixedUnit당 fixedPoints) 또는 정률(percentageRate%) 방식 중 택 1. 최소 주문금액, 최대 적립 한도를 설정한다.
3. **사용 정책 설정** — 최소 사용 포인트, 최대 사용 비율(%), 사용 단위(1/10/100/500/1000P)를 설정한다.
4. **유효기간 정책** — 기본 유효기간(일)과 만료 알림 발송 시점(일 전)을 설정한다. 변경 시 이후 적립 포인트부터 적용.
5. **포인트 이력 조회** — 전체/적립/사용/소멸/수동 필터별 이력을 DataTable로 조회하며 페이지네이션을 지원한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 적립 정책

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **적립 방식 (earnType)** | ToggleButtonGroup | Y | `fixed`/`percentage` | 정액/정률 전환 시 하단 폼이 동적 변경된다. |
| **기준 금액 (fixedUnit)** | Number Input | C(fixed) | 100 이상 | 정액 방식: N원당 적립 기준이다. |
| **적립 포인트 (fixedPoints)** | Number Input | C(fixed) | 1 이상 | 정액 방식: 기준 금액당 적립 포인트다. |
| **적립 비율 (percentageRate)** | Number Input | C(percentage) | 0.1 ~ 100 | 정률 방식: 주문금액의 N% 적립이다. |
| **최대 적립 (maxEarnPoints)** | Number Input | N | null=무제한 | 정률 방식: 1회 최대 적립 한도다. |
| **최소 주문금액 (minOrderAmount)** | Number Input | N | 0 이상 | 0이면 모든 주문에 적립된다. |

#### 사용 정책

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **최소 사용 (minUsePoints)** | Number Input | Y | 1 이상 | N포인트 이상부터 사용 가능이다. |
| **최대 사용 비율 (maxUseRate)** | Number Input | Y | 1 ~ 100 | 결제금액의 최대 N%까지 사용 가능이다. |
| **사용 단위 (useUnit)** | Select | Y | 1/10/100/500/1000 | N포인트 단위로 사용 가능이다. |

#### 유효기간

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **기본 유효기간 (defaultValidityDays)** | Number Input | Y | 1 ~ 3650 | 적립일로부터 N일 후 소멸이다. |
| **만료 알림 (expiryNotificationDays)** | Number Input | Y | 1 ~ 365 | 만료 N일 전 알림 발송이다. |

#### 포인트 이력

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **필터 (historyFilter)** | ToggleButton | N | all/earn/use/expire/manual | 유형별 이력 필터링이다. |
| **DataTable 컬럼** | Table | - | 일시/회원/유형/금액/잔액/사유/만료일 | Badge로 유형 구분, 금액 색상(적립=success, 사용=critical)이다. |

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 포인트 설정

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **earnPolicy.type** | Enum | Y | `fixed`/`percentage` | 적립 방식이다. |
| **earnPolicy.fixedUnit** | Integer | C | 100 이상 | 정액 기준 금액이다. |
| **earnPolicy.fixedPoints** | Integer | C | 1 이상 | 정액 적립 포인트다. |
| **earnPolicy.percentageRate** | Decimal | C | 0.1 ~ 100 | 정률 적립 비율이다. |
| **earnPolicy.maxEarnPoints** | Integer | N | null 허용 | 정률 최대 한도다. |
| **earnPolicy.minOrderAmount** | Integer | N | 0 이상 | 최소 주문금액이다. |
| **usePolicy.minUsePoints** | Integer | Y | 1 이상 | 최소 사용 포인트다. |
| **usePolicy.maxUseRate** | Integer | Y | 1 ~ 100 | 최대 사용 비율이다. |
| **usePolicy.useUnit** | Enum | Y | 1/10/100/500/1000 | 사용 단위다. |
| **expiryPolicy.defaultValidityDays** | Integer | Y | 1 ~ 3650 | 기본 유효기간이다. |
| **expiryPolicy.expiryNotificationDays** | Integer | Y | 1 ~ 365 | 만료 알림 시점이다. |

#### 시스템 포인트 이력

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **memberId** | UUID (FK) | Y | - | 회원 참조다. |
| **memberName** | String | Y | - | 회원 이름(조회용 역정규화)이다. |
| **type** | Enum | Y | `earn`/`use`/`expire`/`manual_add`/`manual_deduct` | 포인트 유형이다. |
| **amount** | Integer | Y | - | 양수=적립, 음수=사용/소멸이다. |
| **balance** | Integer | Y | 0 이상 | 처리 후 잔액이다. |
| **description** | String | Y | 최대 200자 | 사유 텍스트다. |
| **expiresAt** | Timestamp | N | - | 적립 포인트 만료일이다. |
| **createdAt** | Timestamp | Y | - | 처리 일시다. |

**[API 및 비즈니스 로직 제약사항]**
- 설정 변경 시 감사 로그(`auditService.log`)를 기록한다.
- 유효기간 변경은 변경 이후 적립분부터 적용한다. 기존 적립 포인트의 만료일은 변경하지 않는다.
- 포인트 소멸은 매일 배치 스케줄러로 `expiresAt`이 지난 적립 건을 자동 소멸 처리한다.
- 만료 알림은 `expiryNotificationDays`일 전 푸시/SMS로 발송한다.
