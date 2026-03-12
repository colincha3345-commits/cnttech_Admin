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

