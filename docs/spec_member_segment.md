# 회원 추출 및 그룹 관리(Member Segment) 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **회원 추출**(`/app-members/member-extract`) 및 **회원 그룹**(`/app-members/groups`) 페이지의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 페이지 프로세스 (Page Process)

### 1.1 회원 추출 (`/app-members/member-extract`)

1. **세그먼트 필터 설정** — 4개 탭(기본정보/주문/마케팅/고급)으로 분류된 필터 조건을 설정한다.
2. **결과 미리보기** — 필터 조건에 맞는 회원 목록을 실시간으로 조회한다.
3. **내보내기** — 선택한 컬럼(체크박스)으로 CSV/Excel 파일을 다운로드한다.
4. **그룹 저장** — 추출 결과를 신규 또는 기존 회원 그룹에 저장한다.
5. **캠페인 연계** — 관련 캠페인 요약 카드를 표시하여 추출 회원을 캠페인 대상으로 빠르게 연결한다.

### 1.2 회원 그룹 (`/app-members/groups`)

1. **그룹 목록 조회** — 검색 및 페이지네이션으로 그룹 목록을 조회한다.
2. **그룹 생성/수정** — 모달(`GroupFormModal`)을 통해 그룹명과 설명을 입력한다.
3. **그룹 상세** — 그룹 상세 페이지(`/app-members/groups/:id`)에서 소속 회원 목록을 조회/관리한다.
4. **그룹 삭제** — 확인 다이얼로그 후 그룹을 삭제한다. 소속 회원의 그룹 연결만 해제된다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 회원 추출 — 기본정보 필터

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **회원 등급 (grades)** | Multi Toggle | N | MemberGrade[] | VIP/골드/실버/브론즈/일반 복수 선택이다. |
| **회원 상태 (statuses)** | Multi Toggle | N | MemberStatus[] | 활성/휴면/장기미접속/탈퇴 복수 선택이다. |
| **성별 (gender)** | Toggle | N | all/male/female | 전체/남성/여성 선택이다. |
| **연령대 (ageRange)** | Range Input | N | min/max | 최소~최대 나이 범위다. |
| **가입일 (registeredDateRange)** | DateRange | N | from/to | 가입 기간 범위다. |

#### 회원 추출 — 주문 필터

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **주문 횟수 (orderCountRange)** | Range Input | N | min/max | 누적 주문 횟수 범위다. |
| **주문 금액 (totalAmountRange)** | Range Input | N | min/max | 누적 주문 금액 범위다. |
| **주문 유형 (orderType)** | Toggle | N | all/delivery/pickup/dine_in | 주문 유형 필터다. |
| **마지막 주문일 (lastOrderDateRange)** | DateRange | N | from/to | 마지막 주문 기간 범위다. |

#### 회원 추출 — 마케팅 필터

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **수신 동의 (consents)** | Multi Checkbox | N | marketing/push/sms/email | 마케팅/푸시/SMS/이메일 동의 여부 필터다. |

#### 회원 추출 — 고급 필터

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **포인트 잔액 (pointBalanceRange)** | Range Input | N | min/max | 보유 포인트 범위다. |
| **마지막 접속일 (lastLoginDateRange)** | DateRange | N | from/to | 최근 접속 기간 범위다. |

#### 내보내기 컬럼 설정

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **내보내기 컬럼 (exportColumns)** | Multi Checkbox | Y | 최소 1개 | 이름/아이디/연락처/이메일/등급/상태/주문횟수/주문금액/포인트/가입일 등이다. |

#### 회원 그룹

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **그룹명 (name)** | Input | Y | 2 ~ 50자 | 그룹 식별 이름이다. |
| **설명 (description)** | Textarea | N | 최대 200자 | 그룹 용도 설명이다. |
| **회원 수 (memberCount)** | Text (ReadOnly) | - | - | 소속 회원 수 표시다. |
| **생성일 (createdAt)** | Text (ReadOnly) | - | - | 그룹 생성 일시다. |

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 회원 세그먼트 필터 (MemberSegmentFilter)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **grades** | Enum[] | N | MemberGrade[] | 등급 필터다. |
| **statuses** | Enum[] | N | MemberStatus[] | 상태 필터다. |
| **gender** | Enum | N | all/male/female | 성별 필터다. |
| **ageRange** | JSON | N | { minAge, maxAge } | 연령 범위다. |
| **registeredDateRange** | JSON | N | { from, to } | 가입일 범위다. |
| **orderCountRange** | JSON | N | { min, max } | 주문 횟수 범위다. |
| **totalAmountRange** | JSON | N | { min, max } | 주문 금액 범위다. |
| **orderType** | Enum | N | PromotionOrderType | 주문 유형 필터다. |
| **consents** | JSON | N | ConsentFilter[] | 수신 동의 필터다. |

#### 회원 그룹 (MemberGroup)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **name** | String | Y | 2 ~ 50자 | 그룹명이다. |
| **description** | String | N | 최대 200자 | 그룹 설명이다. |
| **memberCount** | Integer | Y | 0 이상 | 소속 회원 수(캐시)다. |
| **filter** | JSON | N | MemberSegmentFilter | 동적 그룹의 필터 조건이다. |
| **createdAt** | Timestamp | Y | - | 생성 일시다. |
| **updatedAt** | Timestamp | Y | - | 수정 일시다. |
| **createdBy** | String | Y | - | 생성자 ID다. |

#### 그룹-회원 매핑 (GroupMember)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **groupId (FK)** | UUID | Y | - | 그룹 참조다. |
| **memberId (FK)** | UUID | Y | - | 회원 참조다. |
| **addedAt** | Timestamp | Y | - | 추가 일시다. |

**[API 및 비즈니스 로직 제약사항]**
- 세그먼트 필터 API는 조건 조합에 따른 예상 회원 수를 실시간 반환한다.
- 내보내기 API는 선택된 컬럼만 포함하여 CSV 파일을 생성한다. 개인정보 마스킹 권한에 따라 원문/마스킹 처리한다.
- 그룹 삭제 시 `GroupMember` 매핑만 삭제하며, 회원 데이터는 유지한다.
- 회원 추출에서 그룹 저장 시 기존 그룹에 추가하거나 신규 그룹을 생성할 수 있다.
- 캠페인 연계는 `useMemberSegment` 훅의 결과를 캠페인 대상으로 전달한다.
