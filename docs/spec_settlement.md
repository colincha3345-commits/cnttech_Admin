# 정산(Settlement) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **정산관리 카테고리**(정산 내역, 통계/조회)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/settlement` | 정산 목록 (SettlementList) | settlement:read |
| `/settlement/stats` | 정산 통계 (SettlementStats) | settlement:read |
| `/settlement/:id` | 정산 상세 (SettlementDetail) | settlement:read |


## 1. 페이지 프로세스 (Page Process)

### 1.1 정산 내역 (`/settlement`)

1. **정산 목록 조회** — 정산 기간, 매장, 상태(정산대기/산출완료/지급완료/보류) 필터를 적용하여 목록을 조회한다. 매장별 총매출, 할인, 수수료, 실정산액을 요약 컬럼으로 노출한다.
2. **정산 상세** — 행 클릭 시 상세 페이지로 이동한다. 정산 구성 요소(매출, 배달비, 할인, 본사지원금, 포인트, 쿠폰, 교환권, 플랫폼수수료)를 표 형태로 분해하여 보여준다.
3. **주문별 상세** — 정산에 포함된 개별 주문 내역을 하단 테이블에 나열한다. 주문번호, 일시, 메뉴, 금액, 결제수단, 실정산액을 표기한다.
4. **상태 변경** — 산출완료 → 지급완료로 상태를 전환한다. 보류 처리 시 사유를 입력한다.

### 1.2 통계/조회 (`/settlement/stats`)

1. **기간별 통계** — 월별/주별/일별 총매출, 총정산, 수수료 추이를 차트와 테이블로 제공한다.
2. **매장별 비교** — 매장별 정산 금액을 비교하는 랭킹 테이블을 노출한다.
3. **엑셀 내보내기** — 조회된 통계 데이터를 다운로드한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 정산 내역

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **정산 기간 필터** | DateRange | N | YYYY-MM-DD | 기본값은 당월이다. |
| **매장 필터** | Select (Search) | N | - | 매장명 검색 가능한 Select다. |
| **상태 필터** | Select | N | 4가지 | pending/calculated/completed/on_hold 선택이다. |
| **상태 Badge** | Badge | Y | - | pending=warning, calculated=info, completed=success, on_hold=critical 색상이다. |
| **매장명 (storeName)** | Text | Y | - | 정산 대상 매장명이다. |
| **정산 기간 (period)** | Text | Y | - | "YYYY-MM-DD ~ YYYY-MM-DD" 형식이다. |
| **총매출 (totalSales)** | Number (ReadOnly) | Y | 천 단위 콤마 | 기간 내 총 매출액이다. |
| **배달비 (deliveryFee)** | Number (ReadOnly) | Y | 천 단위 콤마 | 배달비 합계다. |
| **할인 합계** | Number (ReadOnly) | Y | 천 단위 콤마 | promotionDiscount 총액이다. |
| **본사 지원금 (hqSupport)** | Number (ReadOnly) | Y | 천 단위 콤마 | 본사 부담 할인금 (가맹점 수입 합산)이다. |
| **포인트 사용 (pointsUsed)** | Number (ReadOnly) | Y | 천 단위 콤마 | 포인트 사용 합계다. |
| **쿠폰 사용 (couponsUsed)** | Number (ReadOnly) | Y | 천 단위 콤마 | 쿠폰 할인 합계다. |
| **교환권 사용 (vouchersUsed)** | Number (ReadOnly) | Y | 천 단위 콤마 | 교환권/상품권 합계다. |
| **수수료 (platformFee)** | Number (ReadOnly) | Y | 천 단위 콤마 | 플랫폼 수수료다. |
| **실정산액 (netAmount)** | Number (ReadOnly) | Y | 천 단위 콤마, 볼드 | 최종 정산 금액이다. 강조 표시한다. |
| **주문 건수 (orderCount)** | Number (ReadOnly) | Y | - | 기간 내 총 주문수다. |
| **지급일 (paymentDate)** | Text | N | YYYY-MM-DD | completed 상태 시 노출한다. |

#### 통계/조회

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **조회 기간** | DateRange | Y | YYYY-MM-DD | 통계 조회 범위다. |
| **집계 단위** | Select | Y | 일별/주별/월별 | 기본값은 월별이다. |
| **매장 필터** | Multi Select | N | - | 복수 매장 비교 선택이다. |
| **차트** | Bar/Line Chart | Y | - | 매출/정산/수수료 추이를 시각화한다. |
| **엑셀 다운로드** | Button | N | - | 현재 조회 결과를 다운로드한다. |

**[UI/UX 상호작용 제약사항]**
- 정산 상세의 금액 필드는 모두 ReadOnly이며, 천 단위 콤마와 원(₩) 단위를 표기한다.
- 실정산액(netAmount)은 볼드 + 프라이머리 컬러로 강조한다.
- 보류(on_hold) 처리 시 사유 입력 모달을 필수로 노출한다.

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 정산 고유 식별자다. |
| **storeId (FK)** | UUID | Y | - | 정산 대상 매장 참조다. |
| **period** | String | Y | - | "YYYY-MM-DD ~ YYYY-MM-DD" 형식이다. |
| **totalSales** | Integer | Y | 0 이상 | 기간 내 총매출이다. |
| **deliveryFee** | Integer | Y | 0 이상 | 배달비 합계다. |
| **promotionDiscount** | Integer | Y | 0 이상 | 총 할인액이다. |
| **hqSupport** | Integer | Y | 0 이상 | 본사 지원 할인금이다. |
| **pointsUsed** | Integer | Y | 0 이상 | 포인트 사용 합계다. |
| **couponsUsed** | Integer | Y | 0 이상 | 쿠폰 사용 합계다. |
| **vouchersUsed** | Integer | Y | 0 이상 | 교환권/상품권 합계다. |
| **platformFee** | Integer | Y | 0 이상 | 플랫폼 수수료다. |
| **netAmount** | Integer | Y | - | 최종 실정산액이다. 음수도 가능하다(수수료 > 매출 시). |
| **status** | Enum | Y | - | 'pending', 'calculated', 'completed', 'on_hold' 4가지다. |
| **paymentDate** | Date | N | - | 지급 완료일이다. |
| **orderCount** | Integer | Y | 0 이상 | 기간 내 주문 건수다. |

**[API 및 비즈니스 로직 제약사항]**
- **정산 산출 배치** — 정산 기간(반월/월단위) 종료 시 자동으로 주문 데이터를 집계하여 Settlement 레코드를 생성한다. netAmount = totalSales + deliveryFee + hqSupport - promotionDiscount - platformFee 공식을 적용한다.
- **정산액 계산 공식** — 포인트/쿠폰/교환권 사용분은 정산 정책에 따라 본사 부담 또는 가맹점 부담을 분리한다. hqSupport(본사 지원금)는 가맹점 수입으로 합산한다.
- **상태 전이** — pending → calculated(배치 산출 후) → completed(지급 완료) 순서다. on_hold는 어느 단계에서든 전환 가능하며, 사유를 별도 컬럼에 기록한다.
- **동시성 주의** — 정산 배치 실행 중 주문 데이터 변경(취소 등)이 발생할 경우 스냅샷 시점 기준으로 산출하며, 이후 변경분은 다음 정산에 반영한다.

**[⚠️ 트래픽/성능 검토]**
- **정산 배치** — 반월/월 단위로 대량 주문 데이터를 집계한다. 배치 실행 중 주문 변경(취소)은 스냅샷 시점 기준이며, 이후 변경분은 다음 정산에 반영한다.
- **집계 쿼리** — 기간별 SUM 쿼리가 무거우므로 materialized view 또는 사전 집계 테이블을 권장한다.
- **통계 차트** — 월별/주별 통계는 캐시(1시간 TTL)를 적용하여 반복 조회 부하를 줄인다.
