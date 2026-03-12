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

