# 본사/가맹계정(Staff) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **본사/가맹계정 카테고리**(직원 관리, 승인 관리, 팀 관리)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/staff/headquarters` | 본사 직원 목록 (HeadquartersStaff) | staff:read |
| `/staff/franchise` | 가맹점 직원 목록 (FranchiseStaff) | staff:read |
| `/staff/edit/:type/:id` | 직원 등록/수정 (StaffEditPage) | staff:write |
| `/staff/approvals` | 승인 대기 목록 (StaffApprovals) | staff:write |
| `/staff/approvals/:id` | 승인 상세 (StaffApprovalDetail) | staff:write |
| `/staff/teams` | 팀 목록 (Teams) | staff:read |
| `/staff/teams/new` | 팀 등록 (TeamEditPage) | staff:write |
| `/staff/teams/:id/edit` | 팀 수정 (TeamEditPage) | staff:write |


## 1. 페이지 프로세스 (Page Process)

### 1.1 본사 직원 관리 (`/staff/headquarters`)

1. **직원 목록 조회** — 팀별, 상태별 필터를 적용하여 본사 직원 목록을 조회한다. 상태 Badge(초대됨=info, 승인대기=warning, 활성=success, 비활성=secondary, 거절=critical)를 표출한다.
2. **직원 초대** — [초대] 버튼 클릭 시 등록 페이지(`/staff/edit/headquarters/new`)로 이동한다. 이름, 연락처, 이메일, 로그인ID, 소속팀을 입력하고, 로그인ID 중복 확인 후 초대한다.
3. **직원 상세/수정** — 목록 행 클릭 시 상세 페이지(`/staff/edit/headquarters/:id`)로 이동한다. 기본정보를 수정하거나 비밀번호를 초기화한다.
4. **마이페이지** — 로그인한 사용자가 자신의 상세 페이지에 진입 시 비밀번호 변경 섹션이 추가로 노출된다.

### 1.2 가맹점 직원 관리 (`/staff/franchise`)

1. **직원 목록 조회** — 매장별, 상태별 필터를 적용하여 가맹점 직원 목록을 조회한다.
2. **초대/수정/마이페이지** — 본사 직원과 동일한 프로세스를 따르되, 소속팀 대신 소속매장을 지정한다.

### 1.3 승인 관리 (`/staff/approvals`)

1. **승인 대기 목록** — pending_approval 상태인 직원 계정을 목록으로 노출한다. 직원 유형(본사/가맹점) 탭으로 구분한다.
2. **승인 처리** — 승인 버튼 클릭 시 즉시 active로 전환한다.
3. **반려 처리** — 반려 버튼 클릭 시 사유 입력 모달을 노출하고, 입력 후 rejected로 전환한다.

### 1.4 팀 관리 (`/staff/teams`)

1. **팀 목록** — 카드 그리드 레이아웃으로 팀 목록을 노출한다. 각 카드에 팀명, 설명, 팀원 수를 표기한다.
2. **팀 등록/수정** — 상세 페이지(`/staff/teams/:id`)에서 팀명과 설명을 입력/수정한다.
3. **팀 삭제** — 팀원이 존재하는 팀은 삭제를 차단하고 안내 메시지를 노출한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 직원 계정

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **이름 (name)** | Input | Y | 2 ~ 20자 | 공백만 입력 불가 처리한다. |
| **연락처 (phone)** | Input | Y | 11자리 숫자 | 자동 하이픈 포맷을 적용한다. |
| **이메일 (email)** | Input | Y | 이메일 정규식 | 유효성 검증 실패 시 에러 텍스트를 노출한다. |
| **로그인 ID (loginId)** | Input + Button | Y | 4 ~ 20자, 영문+숫자 | [중복확인] 버튼으로 사용 가능 여부를 체크한다. 수정 모드에서는 ReadOnly다. |
| **소속팀 (teamId)** | Select | C(본사) | - | 본사 직원 초대 시 필수 선택이다. |
| **소속매장 (storeId)** | Select | C(가맹점) | - | 가맹점 직원 초대 시 필수 선택이다. |
| **상태 Badge** | Badge | Y | - | invited=info, pending_approval=warning, active=success, inactive=secondary, rejected=critical 색상이다. |
| **비밀번호 초기화** | Button | C(수정모드) | - | ConfirmDialog 확인 후 임시 비밀번호를 생성하여 알림한다. |
| **현재 비밀번호** | Password Input | C(마이페이지) | - | 비밀번호 변경 시 본인 인증 용도다. |
| **새 비밀번호** | Password Input | C(마이페이지) | 8자 이상, 대/소/숫/특수 포함 | 복잡도 규칙 안내 placeholder를 제공한다. |
| **새 비밀번호 확인** | Password Input | C(마이페이지) | 새 비밀번호와 일치 | 불일치 시 에러 텍스트를 노출한다. |

#### 승인 관리

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **직원 유형 탭** | Tab | Y | 본사/가맹점 | 탭 전환 시 목록을 재조회한다. |
| **승인 버튼** | Button | Y | - | 클릭 즉시 active로 전환하고 Toast를 노출한다. |
| **반려 사유** | Textarea (Modal) | Y(반려시) | 최대 200자 | 빈 사유는 허용하지 않는다. |

#### 팀 관리

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **팀명 (name)** | Input | Y | 2 ~ 30자 | 중복 팀명을 허용하지 않는다. |
| **설명 (description)** | Textarea | N | 최대 200자 | 미입력 시 빈 문자열이다. |
| **팀원 수** | Text (ReadOnly) | Y | - | 목록 카드에 자동 집계 수치를 표출한다. |

**[UI/UX 상호작용 제약사항]**
- 초대 완료 시 "초대 이메일이 발송되었습니다" Toast를 노출하고 목록 페이지로 이동한다.
- 로그인ID 중복확인은 입력값 변경 시 체크 상태를 초기화하여 재확인을 유도한다.
- 비밀번호 초기화는 admin 또는 write 권한이 있는 계정만 접근 가능하다.

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 직원 계정

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 시스템 고유 식별자다. |
| **staffType** | Enum | Y | - | 'headquarters', 'franchise' 만 허용한다. |
| **loginId** | String | Y | 4 ~ 20자 | Unique 제약 필수다. 영문+숫자만 허용한다. |
| **name** | String | Y | 2 ~ 20자 | 이름이다. |
| **phone** | String | Y | 11자리 | 하이픈 제거 후 저장한다. |
| **email** | String | Y | 최대 100자 | 이메일 형식 검증 필수다. |
| **status** | Enum | Y | - | 'invited', 'pending_approval', 'active', 'inactive', 'rejected' 5가지 상태다. |
| **invitationToken** | UUID | N | - | 초대 시 생성, 수락 후 삭제한다. |
| **invitationExpiresAt** | DateTime | N | - | 초대 후 48시간으로 설정한다. |
| **passwordHash** | String | N | - | bcrypt 해싱이다. invited 상태에서는 null이다. |

#### 팀

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **name** | String | Y | 2 ~ 30자 | Unique 제약 필수다. |
| **description** | String | N | 최대 200자 | 팀 설명이다. |
| **memberCount** | Integer | Y | 0 이상 | 가상 컬럼 또는 집계 쿼리로 산출한다. |

**[API 및 비즈니스 로직 제약사항]**
- **초대 API (`POST /api/staff/invite`)** — 초대 토큰(UUID)을 생성하고 초대 이메일을 발송한다. 토큰 만료 시간은 48시간이다.
- **비밀번호 설정 (`POST /api/staff/set-password`)** — 토큰 유효성 검증 후 비밀번호를 설정하고 status를 pending_approval로 전환한다.
- **비밀번호 초기화 (`POST /api/staff/{id}/reset-password`)** — 임시 비밀번호(8자 랜덤)를 생성하여 반환한다. 감사 로그에 초기화 이력을 기록한다.
- **비밀번호 변경 (`POST /api/staff/{id}/change-password`)** — 현재 비밀번호 일치 여부를 검증한 후 새 비밀번호로 갱신한다. 복잡도 규칙(8자 이상, 대/소/숫/특수)을 서버에서 재검증한다.
- **팀 삭제 API** — teamId를 참조하는 직원이 1명 이상일 경우 삭제를 거부하고 409 Conflict를 반환한다.

**[⚠️ 트래픽/성능 검토]**
- **초대 이메일** — 외부 SMTP 호출이므로 비동기 큐로 처리한다. 발송 실패 시 3회 재시도한다.
- **비밀번호 해싱** — bcrypt cost factor=12를 권장한다. 로그인 시 해싱 비교가 CPU 집약적이므로 적절한 worker pool을 구성한다.
