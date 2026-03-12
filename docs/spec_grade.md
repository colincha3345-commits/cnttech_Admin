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

#### 등급 혜택

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **포인트 적립 배율 (earnMultiplier)** | Number Input | Y | 0.1 이상 | 기본 적립의 N배 적용이다. 1.0 = 기본. |
| **자동 발급 쿠폰 (autoIssueCouponIds)** | Multi Select | N | 쿠폰 ID 목록 | 등급 달성 또는 매월 자동 발급할 쿠폰이다. |
| **등급 승급 시 발급 (issueOnUpgrade)** | Checkbox | N | Boolean | 등급 달성(승급) 시 쿠폰 즉시 발급이다. |
| **매월 정기 발급 (issueMonthly)** | Checkbox | N | Boolean | 매월 자동 쿠폰 발급 활성화다. |
| **정기 발급일 (monthlyIssueDay)** | Number Input | C(monthly) | 1 ~ 28 | 매월 발급일이다. |

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
| **benefits** | JSON | Y | - | 혜택 설정 객체다. |
| **isActive** | Boolean | Y | - | 활성 여부다. |
| **isDefault** | Boolean | Y | - | 기본 등급 여부. 삭제 불가다. |
| **memberCount** | Integer | Y | 0 이상 | 해당 등급 회원 수(캐시)다. |
| **createdAt** | Timestamp | Y | - | 생성 일시다. |
| **updatedAt** | Timestamp | Y | - | 수정 일시다. |
| **createdBy** | String | Y | - | 생성자 ID다. |

**[API 및 비즈니스 로직 제약사항]**
- 등급 순서 변경은 배열 순서 일괄 업데이트 API로 처리한다.
- 등급 삭제 시 해당 등급 회원은 기본 등급(`isDefault=true`)으로 자동 이동한다.
- 등급 복제 시 이름에 "(복사)" 접미사를 추가하고 `isDefault=false`로 설정한다.
- 등급 평가 배치: `retentionMonths` 초과 회원의 등급을 재평가하는 스케줄러가 필요하다.
- 쿠폰 자동 발급: `issueMonthly=true`인 등급의 `monthlyIssueDay`에 해당 등급 회원에게 쿠폰을 발급한다.
- 프론트엔드 등급 캐시(`initGradeCache`)를 통해 등급 ID → 라벨/Badge 매핑을 전역 관리한다.

**[⚠️ 트래픽/성능 검토]**
- **등급 평가 배치** — retentionMonths 초과 회원 재평가는 대량 쿼리. 청크 단위 처리 + 인덱스(grade, lastEvaluatedAt) 필수이다.
- **쿠폰 자동 발급** — monthlyIssueDay에 해당 등급 전체 회원 대상 쿠폰 발급. Message Queue로 비동기 처리한다.
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
| 5 | 혜택: 포인트 1.5배 + 자동쿠폰 선택 | 쿠폰 검색 모달 → 선택 | earnMultiplier ≥ 0.1 |
| 6 | [저장] → 좌측 목록에 추가 | `POST /api/grades` → 목록 갱신 | 순서 자동 최하위 |

### 시나리오 2: 등급 순서 변경 (드래그 앤 드롭)

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 좌측 등급 목록에서 항목 드래그 | 드래그 중 시각적 피드백 | @dnd-kit 라이브러리 |
| 2 | 원하는 위치에 드롭 | 목록 순서 재배치 | 즉시 반영 |
| 3 | [순서 저장] 클릭 | `PUT /api/grades/order` [{id, order}] 배열 전송 | 전체 순서 일괄 업데이트 |

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
승급 시: issueOnUpgrade=true인 쿠폰 자동 발급
```

### 4.2. 기본 등급 보호 정책

```
isDefault=true 등급:
  - 삭제 불가 (400 에러)
  - 시스템에 반드시 1개 존재
  - 등급 삭제 시 해당 등급 회원은 기본 등급으로 자동 이동
```

### 4.3. 쿠폰 자동 발급 정책

```
issueMonthly=true인 등급:
  - 매월 monthlyIssueDay에 해당 등급 전체 회원에게 autoIssueCouponIds 쿠폰 발급
  - 비동기 Message Queue로 처리 (대량 회원 대응)
  - 발급 실패 시 재시도 3회 후 관리자 알림
```

