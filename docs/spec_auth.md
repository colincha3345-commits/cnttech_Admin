# 인증(Auth) 시스템 기획 명세서

본 문서는 관리자 대시보드의 **로그인**(`/login`) 및 **초대 수락**(`/accept-invitation`) 페이지의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/login` | 로그인 (LoginPage) | 공개 |
| `/invitation/accept` | 초대 수락 (AcceptInvitation) | 공개 |


## 1. 페이지 프로세스 (Page Process)

### 1.1 로그인 (`/login`)

1. **이메일/비밀번호 입력** — 이메일과 비밀번호를 입력하여 로그인한다.
2. **로그인 시도 제한** — 연속 실패 시 잔여 시도 횟수를 표시하며, 초과 시 계정을 잠금한다.
3. **계정 잠금** — 잠금 시 해제까지 남은 시간을 카운트다운으로 표시한다.
4. **2차 인증 (MFA)** — 이메일 OTP 인증을 통한 2단계 인증을 수행한다. OTP 재발송 기능을 제공한다.
5. **인증 성공** — 이전 페이지 또는 대시보드(`/dashboard`)로 리다이렉트한다.

### 1.2 초대 수락 (`/accept-invitation`)

1. **토큰 검증** — URL 쿼리의 `token` 파라미터로 초대 유효성을 검증한다.
2. **비밀번호 설정** — 유효한 초대 시 비밀번호 설정 폼을 표시한다. 비밀번호 강도를 실시간 표시한다.
3. **계정 활성화** — 비밀번호 설정 완료 시 계정을 활성화하고 로그인 페이지로 안내한다.
4. **오류 처리** — 만료/무효 토큰 시 에러 메시지와 재요청 안내를 표시한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 로그인

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **이메일 (email)** | Input | Y | 이메일 형식 | 로그인 이메일이다. |
| **비밀번호 (password)** | Input (password) | Y | 6자 이상 | 비밀번호 입력이다. |
| **OTP 코드** | OTPInput (6자리) | C(MFA) | 숫자 6자리 | 이메일로 발송된 인증 코드다. |
| **잔여 시도 횟수** | Text | - | - | 로그인 실패 시 표시다. |
| **잠금 카운트다운** | Text | - | 초 단위 | 계정 잠금 시 해제 남은 시간이다. |
| **OTP 재발송** | Button | C(MFA) | 쿨다운 적용 | 재발송 시 쿨다운 타이머를 적용한다. |

#### 초대 수락

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **초대 토큰 (token)** | URL Query | Y | - | URL에서 자동 추출한다. |
| **비밀번호 (password)** | Input (password) | Y | 6자 이상 | 새 비밀번호 입력이다. |
| **비밀번호 확인 (confirmPassword)** | Input (password) | Y | password와 일치 | 비밀번호 재입력 확인이다. |
| **비밀번호 강도** | Text | - | 약함/보통/강함 | 실시간 강도 표시(색상 분기)다. |

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 로그인 API

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **email** | String | Y | 이메일 형식 | 로그인 이메일이다. |
| **password** | String | Y | 6자 이상 | 해시 비교이다. |
| **loginAttempts** | Integer | Y | 0 이상 | 연속 실패 횟수다. |
| **lockedUntil** | Timestamp | N | - | 잠금 해제 시각이다. |
| **mfaRequired** | Boolean | Y | - | 2차 인증 필요 여부다. |

#### 초대 토큰 (InvitationToken)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **token** | String | Y | UUID v4 | 초대 토큰이다. |
| **accountId** | UUID (FK) | Y | - | 대상 계정이다. |
| **expiresAt** | Timestamp | Y | - | 토큰 만료 시각이다. |
| **isUsed** | Boolean | Y | - | 사용 완료 여부다. |

**[API 및 비즈니스 로직 제약사항]**
- 로그인 실패 5회 초과 시 계정을 15분간 잠금한다. 잠금 해제는 시간 경과 또는 관리자 수동 해제다.
- MFA OTP는 이메일로 발송하며 유효시간 5분이다. 재발송 쿨다운은 60초다.
- 초대 토큰은 발급 후 72시간 유효하며, 1회 사용 후 무효화된다.
- 비밀번호 정책: 최소 6자 이상. 대소문자+숫자+특수문자 조합 기반 강도 판정(weak/medium/strong)이다.
- 인증 성공 시 JWT 토큰을 발급하며, 세션 타임아웃은 30분이다.
- `rememberMe` 옵션 시 장기 세션 유지를 허용한다.
- AuthUser에는 `staffType`(headquarters/franchise) 필드가 포함된다.
- AuthErrorCode 확장: `ACCOUNT_INVITED`(초대됨, 비밀번호 미설정), `ACCOUNT_REJECTED`(승인 거절), `INVITATION_EXPIRED`(초대 만료), `INVITATION_NOT_FOUND`(유효하지 않은 초대) 추가.
- AccountPolicy: `maxInactiveDays`(30일), `sessionConcurrencyLimit`(1), `maxLoginAttempts`(5), `lockoutDurationMinutes`(15) 기본값 적용.

**[⚠️ 트래픽/성능 검토]**
- **로그인 시도 제한** — loginAttempts/lockedUntil은 Redis에 저장하여 DB 부하를 줄인다. Key: `login_attempts:{email}`, TTL: 30분.
- **MFA OTP** — OTP 발송은 이메일 서비스 외부 호출이므로 비동기 큐로 처리한다. 발송 실패 시 재시도 로직이 필요하다.
- **JWT 세션** — 세션 타임아웃(30분)은 슬라이딩 윈도우로 구현하되, Refresh Token 방식을 권장한다. Access Token TTL: 15분, Refresh Token TTL: 7일.

---

## 3. 정상작동 시나리오

### 시나리오 1: 로그인 성공 (MFA 포함)

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | `/login` 접속 | 이메일/비밀번호 폼 렌더링 | 빈 폼, 버튼 비활성 |
| 2 | 이메일/비밀번호 입력 후 로그인 클릭 | `POST /api/auth/login` 호출 | 로딩 스피너 표시 |
| 3 | 서버: 자격증명 일치 + MFA 필요 판정 | `{ mfaRequired: true }` 반환, OTP 이메일 발송 | OTP 입력 폼으로 전환 |
| 4 | OTP 6자리 입력 후 확인 | `POST /api/auth/verify-mfa` 호출 | 로딩 스피너 표시 |
| 5 | 서버: OTP 일치 | JWT(Access+Refresh) 발급, 세션 생성 | `/dashboard`로 리다이렉트 |

### 시나리오 2: 초대 수락 → 비밀번호 설정

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 초대 이메일 링크 클릭 → `/invitation/accept?token=xxx` | `GET /api/auth/invitation?token=xxx` 호출 | 토큰 유효성 검증 |
| 2 | 유효 시 비밀번호 설정 폼 표시 | 비밀번호 + 확인 필드 렌더링 | 강도 표시기 초기 상태 |
| 3 | 비밀번호 입력 (8자 이상, 대/소/숫/특수) | 실시간 강도 판정 → "강함" 표시 | 확인 필드 일치 검증 |
| 4 | 설정 완료 클릭 | `POST /api/auth/set-password` 호출. status→pending_approval | "계정이 활성화되었습니다" + 로그인 페이지 이동 |

---

## 4. 개발자용 정책 설명

### 4.1. 계정 잠금 정책

```
조건: loginAttempts >= maxLoginAttempts(5)
처리: lockedUntil = now() + lockoutDurationMinutes(15분)
해제: (1) 시간 경과 자동 해제 (2) 관리자 수동 해제 API
저장소: Redis key="login_attempts:{email}", TTL=30분
초기화: 로그인 성공 시 loginAttempts=0, lockedUntil=null
```

**프론트엔드 분기:**
- `loginAttempts < 5`: 잔여 횟수 텍스트 `"N회 남음"`
- `lockedUntil > now()`: 카운트다운 타이머 표시, 로그인 버튼 비활성화

### 4.2. 세션 동시접속 제한 정책

```
sessionConcurrencyLimit = 1
처리: 신규 로그인 시 기존 세션 강제 만료
기존 세션 사용자 화면: "다른 기기에서 로그인하여 현재 세션이 종료되었습니다" → 로그인 페이지 이동
```

### 4.3. 토큰 정책

```
Access Token: TTL=15분, 슬라이딩 윈도우
Refresh Token: TTL=7일 (rememberMe=true 시 30일)
초대 토큰: TTL=72시간, 1회 사용 후 isUsed=true로 무효화
MFA OTP: TTL=5분, 재발송 쿨다운=60초
```



### 공통 규칙 (Common Rules)
- Base URL: `{VITE_API_URL}`
- 인증: HttpOnly 쿠키 기반 세션 인증
- 공통 응답: `{ "data": ... }` 또는 `{ "data": [...], "pagination": {...} }`
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`


---

## 관리자 및 권한 (Admin Auth & Users) API

### 5-1. 관리자 로그인
```
POST /admin/auth/login
```
**Request Body**
```json
{
  "email": "admin@cntt.co.kr",
  "password": "hashed_password"
}
```
**Response** `200 OK`
```json
{
  "data": {
    "accessToken": "eyJ...",
    "user": AdminUser
  }
}
```

### 5-2. 관리자 토큰 갱신
```
POST /admin/auth/refresh
```
**Response** `200 OK`

### 5-3. 관리자 로그아웃
```
POST /admin/auth/logout
```
**Response** `200 OK`

### 5-4. 관리자 계정 목록 조회
```
GET /admin/users
```
**Query Parameters**
- `roleId` (string, N)
- `status` (string, N) - `active` | `inactive`
- `page`, `limit`

**Response** `200 OK`
```json
{
  "data": [AdminUser],
  "pagination": { "page": 1, "limit": 20, "total": 10, "totalPages": 1 }
}
```

### 5-5. 관리자 계정 등록
```
POST /admin/users
```
**Request Body**
```json
{
  "email": "newadmin@cntt.co.kr",
  "name": "홍길동",
  "department": "운영팀",
  "roleIds": ["role-1"]
}
```
**Response** `201 Created`

### 5-6. 역할(Role) 목록 조회
```
GET /admin/roles
```
**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "role-1",
      "name": "최고 관리자",
      "permissions": ["all"]
    }
  ]
}
```

---


---

<!-- MERGED FROM spec_staff.md -->
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

---

## 3. 정상작동 시나리오

### 시나리오 1: 본사 직원 초대 → 승인

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 본사 직원 목록 → [초대] 클릭 | 등록 폼 페이지 이동 | 필수 필드 표시 |
| 2 | 이름/연락처/이메일/로그인ID 입력 | 실시간 유효성 검증 | 로그인ID 4~20자 영문+숫자 |
| 3 | [중복확인] 클릭 | `GET /api/staff/check-loginid?id=xxx` | "사용 가능" 또는 "중복" 표시 |
| 4 | 소속팀 선택 후 [초대] | `POST /api/staff/invite` → 초대 이메일 발송 | status=invited, 토큰 48시간 유효 |
| 5 | 초대받은 직원: 이메일 링크 클릭 → 비밀번호 설정 | `POST /api/staff/set-password` | status→pending_approval |
| 6 | 관리자: 승인 대기 목록에서 확인 → [승인] | `PATCH /api/staff/:id/approve` | status→active |

### 시나리오 2: 비밀번호 변경 (마이페이지)

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 마이페이지(자기 상세) 진입 | 기본정보 + 비밀번호 변경 섹션 노출 | 본인만 접근 가능 |
| 2 | 현재 비밀번호 + 새 비밀번호 + 확인 입력 | 복잡도(8자+대/소/숫/특수) 실시간 검증 | 불일치 시 에러 |
| 3 | [변경] 클릭 | `POST /api/staff/:id/change-password` | 현재 비밀번호 서버 검증 후 갱신 |

---

## 4. 개발자용 정책 설명

### 4.1. 직원 상태 전이

```
invited → pending_approval : 비밀번호 설정 완료 시
pending_approval → active : 관리자 승인
pending_approval → rejected : 관리자 반려 (사유 필수)
active → inactive : 관리자가 비활성화
inactive → active : 관리자가 재활성화
```

### 4.2. 초대 토큰 정책

```
생성: UUID v4, TTL=48시간
만료 시: "초대가 만료되었습니다. 관리자에게 재초대를 요청하세요" 표시
사용 후: 즉시 삭제 (재사용 불가)
발송 실패: 비동기 큐 재시도 3회, 실패 시 관리자 알림
```

### 4.3. 비밀번호 정책

```
최소 8자 이상
대문자 + 소문자 + 숫자 + 특수문자 조합 필수
해싱: bcrypt cost factor=12
초기화: 임시 비밀번호 8자 랜덤 생성 → 감사 로그 기록
```

### 4.4. 팀 삭제 보호 정책

```
teamId를 참조하는 직원이 1명 이상 → 삭제 거부 (409 Conflict)
삭제 전: 해당 팀 직원을 다른 팀으로 이동 필요
```



---

<!-- MERGED FROM spec_permission.md -->
# 권한 관리(Permission) 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **권한 관리** 페이지(`/permissions`)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/permissions` | 권한 관리 (PermissionManagement) | permissions:read |


## 1. 페이지 프로세스 (Page Process)

1. **계정 목록 조회** — 좌측 패널에 관리자 계정 목록을 표시한다. 검색, 역할별(매니저/뷰어) 필터, 상태별(활성/비활성) 필터를 제공한다.
2. **권한 설정** — 우측 패널에 선택된 계정의 메뉴별 접근 권한을 설정한다. 메뉴 그룹 단위 일괄 설정 및 개별 토글을 지원한다.
3. **저장** — 변경사항 감지 시 저장/초기화 버튼 활성화. 저장 시 감사 로그를 기록한다.
4. **제약** — admin 역할만 수정 가능하며, admin 계정의 권한은 변경 불가(항상 전체 권한)다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 계정 목록

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **검색** | SearchInput | N | - | 이름/이메일로 검색한다. |
| **역할 필터** | ToggleButton | N | all/manager/viewer | 역할별 필터링이다. admin은 별도 표시다. |
| **상태 필터** | ToggleButton | N | all/active/inactive | 활성/비활성 필터링이다. |
| **계정 카드** | Card | - | - | 이름, 이메일, 부서, 역할 Badge, 상태 표시다. |

#### 권한 설정 (메뉴별)

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **메뉴 (menu)** | Text (ReadOnly) | Y | 13개 메뉴 | dashboard/menu/marketing/events/orders/app-members/staff/design/settlement/support/audit-logs/permissions/settings 이다. |
| **조회 (view)** | Checkbox | Y | Boolean | 해당 메뉴 접근 가능 여부다. |
| **쓰기 (write)** | Checkbox | Y | Boolean | 생성/수정/삭제 가능 여부다. view 비활성 시 자동 비활성이다. |
| **마스킹 해제 (masking)** | Checkbox | Y | Boolean | 개인정보 원문 조회 가능 여부다. |
| **다운로드 (download)** | Checkbox | Y | Boolean | 데이터 내보내기 가능 여부다. |

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 계정 권한 (AccountPermission)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **accountId (PK)** | UUID | Y | 36자 | 관리자 계정 식별자다. |
| **accountNo** | Integer | Y | - | 계정 번호다. |
| **accountName** | String | Y | - | 계정명이다. |
| **accountEmail** | String | Y | 이메일 형식 | 계정 이메일이다. |
| **department** | String | Y | - | 소속 부서다. |
| **role** | Enum | Y | `admin`/`manager`/`viewer` | 역할이다. |
| **status** | Enum | Y | `active`/`inactive` | 계정 상태다. |
| **permissions** | JSON | Y | MenuPermission[] | 메뉴별 권한 배열이다. |
| **updatedAt** | Timestamp | Y | - | 마지막 수정 일시다. |
| **updatedBy** | String | Y | - | 수정자 ID다. |

#### 메뉴 권한 (MenuPermission)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **menu** | Enum | Y | 13개 메뉴 | 관리 메뉴 식별자다. |
| **view** | Boolean | Y | - | 조회 권한이다. |
| **write** | Boolean | Y | - | 쓰기 권한이다. |
| **masking** | Boolean | Y | - | 마스킹 해제 권한이다. |
| **download** | Boolean | Y | - | 다운로드 권한이다. |

**[API 및 비즈니스 로직 제약사항]**
- `admin` 역할 계정만 권한 수정 API를 호출할 수 있다.
- `admin` 계정의 권한은 항상 전체 true로 강제되며 수정 요청을 거부한다.
- `view=false`일 때 `write`, `masking`, `download`는 자동으로 false 처리한다.
- 권한 변경 시 감사 로그를 기록하며, 변경 전/후 스냅샷을 함께 저장한다.
- 프론트엔드는 로그인 시 해당 계정의 권한 정보를 가져와 메뉴 접근 및 UI 분기에 활용한다.

**[⚠️ 트래픽/성능 검토]**
- **권한 캐시** — 로그인 시 해당 계정의 권한 정보를 JWT 페이로드 또는 Redis에 캐싱한다. 권한 변경 시 해당 계정의 캐시를 즉시 무효화한다.
- **변경 스냅샷** — 권한 변경 시 전/후 스냅샷을 감사 로그에 JSON으로 저장한다. 데이터 크기가 크므로 압축 저장을 권장한다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 메뉴 권한 설정

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 권한 관리 페이지 진입 | 메뉴별 권한 매트릭스 렌더링 | 직원/팀별 권한 현황 |
| 2 | 대상 직원/팀 선택 | 해당 대상의 현재 권한 로드 | 메뉴별 접근 수준 표시 |
| 3 | 메뉴별 접근 수준 변경 (none/read/write/admin) | 체크박스/Select 변경 | 즉시 상태 반영 |
| 4 | [저장] 클릭 | `PUT /api/permissions` → 성공 Toast | 감사 로그 기록 |
| 5 | 대상 직원 재로그인 시 | 변경된 권한으로 메뉴 접근 | 비허용 메뉴 비노출 |

---

## 4. 개발자용 정책 설명

### 4.1. 접근 수준 체계

```
none: 메뉴 자체 비노출 (라우트 접근 시 403)
read: 조회만 가능 (등록/수정/삭제 버튼 비노출)
write: 조회 + 등록/수정 가능
admin: 모든 작업 + 설정 변경 + 권한 부여 가능
상속: write는 read 포함, admin은 write+read 포함
```

### 4.2. 권한 검증 위치

```
프론트엔드: 라우트 가드 + 버튼/메뉴 조건부 렌더링 (UX 목적)
백엔드: API 미들웨어에서 JWT의 permissions 검증 (보안 목적)
프론트엔드 우회 대비: 반드시 백엔드에서도 검증
```

