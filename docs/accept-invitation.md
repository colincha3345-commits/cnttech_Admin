# 초대 수락 페이지 기획서

> **경로**: `/invitation/accept`
> **관련 파일**: `src/pages/Invitation/AcceptInvitation.tsx`

---

## 📋 개요

관리자가 초대한 직원이 초대 링크를 통해 비밀번호를 설정하는 공개 페이지이다. 인증 없이 접근 가능하며(Public Route), URL 쿼리 파라미터로 전달된 토큰을 기반으로 초대 유효성을 검증한 후 비밀번호 설정 폼을 제공한다. 비밀번호 설정이 완료되면 관리자 승인 대기 상태(`pending_approval`)로 전환된다.

### 초대 워크플로우 위치
```
관리자: 직원 초대 (invited)
  → 초대 이메일 발송 (토큰 포함 링크)
  → 직원: [이 페이지] 초대 링크 접속 → 토큰 검증 → 비밀번호 설정 (pending_approval)
  → 관리자: 계정 승인/거절 (active / rejected)
```

---

## 🎯 주요 기능

| 기능 | 설명 |
| --- | --- |
| **토큰 검증** | URL 쿼리 파라미터(`?token=xxx`)에서 토큰을 추출하여 유효성 검증 |
| **비밀번호 설정** | 새 비밀번호 + 비밀번호 확인 입력 |
| **비밀번호 강도 표시** | 입력 중 실시간 강도 표시 (약함/보통/강함) |
| **비밀번호 유효성 검사** | 최소 6자, 확인 비밀번호 일치 검증 |
| **에러 상태 처리** | 토큰 없음, 만료, 이미 설정됨, 유효하지 않음 등 |
| **성공 상태** | 설정 완료 후 관리자 승인 대기 안내 + 로그인 페이지 링크 |


---

## 🖼️ 화면 구성

모든 상태는 화면 중앙에 카드 형태(`max-w-md`)로 표시된다.

### 1. 로딩 상태 (토큰 검증 중)
```
┌─────────────────────────────┐
│                              │
│         [Spinner]            │
│   초대 링크를 확인하고 있습니다...│
│                              │
└─────────────────────────────┘
```

### 2. 토큰 없음 상태 (잘못된 접근)
```
┌─────────────────────────────┐
│                              │
│      [CloseCircleOutlined]   │
│         빨간색, 5xl          │
│                              │
│    잘못된 접근입니다            │
│   초대 링크가 올바르지 않습니다.  │
│                              │
│    [로그인 페이지로 이동]       │
│                              │
└─────────────────────────────┘
```

### 3. 검증 실패 상태 (만료/이미설정/미존재)
```
┌─────────────────────────────┐
│                              │
│      [CloseCircleOutlined]   │
│         빨간색, 5xl          │
│                              │
│    초대가 만료되었습니다        │
│    (또는 상황별 제목)          │
│                              │
│    INVITATION_ERROR_MESSAGES │
│    에러 메시지                │
│                              │
│    [로그인하기] 또는           │
│    "관리자에게 재발송 요청"     │
│                              │
└─────────────────────────────┘
```

### 4. 비밀번호 설정 폼 (메인 화면)
```
┌──────────────────────────────────┐
│                                   │
│     [🔒 아이콘]                    │
│     primary/10 배경, 원형          │
│                                   │
│       환영합니다!                   │
│     이름님, 비밀번호를 설정해주세요.  │
│                                   │
│  새 비밀번호 *                      │
│  ┌────────────────────────────┐  │
│  │ 비밀번호를 입력하세요         │  │
│  └────────────────────────────┘  │
│  비밀번호 강도         약함/보통/강함 │
│                                   │
│  비밀번호 확인 *                    │
│  ┌────────────────────────────┐  │
│  │ 비밀번호를 다시 입력하세요     │  │
│  └────────────────────────────┘  │
│                                   │
│  (에러 메시지 표시 영역)            │
│                                   │
│  * 비밀번호는 6자 이상이어야 합니다.  │
│                                   │
│  [       비밀번호 설정 완료       ]  │
│                                   │
│  ┌────────────────────────────┐  │
│  │ 비밀번호 설정 후 관리자 승인이  │  │
│  │ 필요합니다. 승인이 완료되면    │  │
│  │ 로그인할 수 있습니다.         │  │
│  └────────────────────────────┘  │
│                                   │
└──────────────────────────────────┘
```

### 5. 설정 완료 상태
```
┌──────────────────────────────────┐
│                                   │
│      [CheckCircleOutlined]        │
│        초록색, 5xl                 │
│                                   │
│     설정이 완료되었습니다            │
│                                   │
│   관리자 승인 후 로그인할 수 있습니다. │
│   승인이 완료되면 이메일로            │
│   안내해 드립니다.                   │
│                                   │
│    [로그인 페이지로 이동]             │
│                                   │
└──────────────────────────────────┘
```

### 비밀번호 강도 표시

| 조건 | 라벨 | 색상 |
| --- | --- | --- |
| 길이 0 | (표시 안 함) | - |
| 6자 미만 | 약함 | `text-critical` (빨강) |
| 6~7자 | 보통 | `text-warning` (노랑) |
| 8자 이상 + 대문자 + 숫자 | 강함 | `text-success` (초록) |
| 8자 이상 (조건 미충족) | 보통 | `text-warning` (노랑) |


---

## 🔄 사용자 플로우

### 정상 플로우
```
초대 이메일에서 링크 클릭
  → /invitation/accept?token=xxx 접속
  → Spinner 표시: "초대 링크를 확인하고 있습니다..."
  → useValidateInvitation(token) 실행
  → 검증 성공 (isValid: true, staff 정보 반환)
  → 비밀번호 설정 폼 표시 (직원 이름 포함)
  → 비밀번호 입력 (실시간 강도 표시)
  → 확인 비밀번호 입력 (실시간 일치 검증)
  → [비밀번호 설정 완료] 클릭
  → setPasswordMutation.mutateAsync({ token, password, confirmPassword })
  → 성공 토스트: "비밀번호가 설정되었습니다. 관리자 승인 후 로그인할 수 있습니다."
  → 완료 상태 화면 표시
  → [로그인 페이지로 이동] 링크 제공
```

### 토큰 없음 플로우
```
/invitation/accept (token 파라미터 없음) 접속
  → "잘못된 접근입니다" 에러 화면 표시
  → [로그인 페이지로 이동] 링크 제공
```

### 토큰 만료 플로우
```
/invitation/accept?token=expired-token 접속
  → 토큰 검증 실행
  → validation.error === 'EXPIRED'
  → "초대가 만료되었습니다" 화면 표시
  → 메시지: "초대 링크가 만료되었습니다. 관리자에게 재발송을 요청해주세요."
  → "관리자에게 초대 재발송을 요청해주세요." 안내
```

### 이미 설정됨 플로우
```
/invitation/accept?token=already-used-token 접속
  → 토큰 검증 실행
  → validation.error === 'ALREADY_SET'
  → "이미 설정된 계정입니다" 화면 표시
  → 메시지: "이미 비밀번호가 설정된 계정입니다."
  → [로그인하기] 버튼 제공
```

### 유효하지 않은 토큰 플로우
```
/invitation/accept?token=invalid-token 접속
  → 토큰 검증 실행
  → validation.error === 'NOT_FOUND'
  → "유효하지 않은 초대" 화면 표시
  → 메시지: "유효하지 않은 초대 링크입니다."
```

---

## 📦 데이터 구조

### InvitationValidation (토큰 검증 결과)
```typescript
interface InvitationValidation {
  isValid: boolean;
  staff?: StaffAccount;                    // 검증 성공 시 직원 정보
  error?: 'EXPIRED' | 'ALREADY_SET' | 'NOT_FOUND';
}
```

### PasswordSetupData (비밀번호 설정 요청)
```typescript
interface PasswordSetupData {
  token: string;
  password: string;
  confirmPassword: string;
}
```

### INVITATION_ERROR_MESSAGES (에러 메시지 맵)
```typescript
const INVITATION_ERROR_MESSAGES: Record<InvitationErrorType, string> = {
  EXPIRED: '초대 링크가 만료되었습니다. 관리자에게 재발송을 요청해주세요.',
  ALREADY_SET: '이미 비밀번호가 설정된 계정입니다.',
  NOT_FOUND: '유효하지 않은 초대 링크입니다.',
};
```

### 비밀번호 유효성 규칙
| 규칙 | 에러 메시지 |
| --- | --- |
| 6자 미만 | "비밀번호는 6자 이상이어야 합니다." |
| 확인 불일치 | "비밀번호가 일치하지 않습니다." |


---

## 🔌 API 엔드포인트

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `GET` | `/api/invitation/validate?token=xxx` | 초대 토큰 검증 | `useValidateInvitation` |
| `POST` | `/api/invitation/set-password` | 비밀번호 설정 | `useSetPassword` |


### 토큰 검증 요청 (GET)
```
GET /api/invitation/validate?token=550e8400-e29b-41d4-a716-446655440000
```

### 토큰 검증 응답
```json
// 성공
{
  "isValid": true,
  "staff": {
    "id": "staff-123",
    "name": "홍길동",
    "email": "hong@example.com",
    "staffType": "headquarters"
  }
}

// 실패 - 만료
{
  "isValid": false,
  "error": "EXPIRED"
}

// 실패 - 이미 설정
{
  "isValid": false,
  "error": "ALREADY_SET"
}

// 실패 - 미존재
{
  "isValid": false,
  "error": "NOT_FOUND"
}
```

### 비밀번호 설정 요청 (POST)
```json
{
  "token": "550e8400-e29b-41d4-a716-446655440000",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

### 비밀번호 설정 응답
```json
// 성공
{
  "data": {
    "success": true,
    "staffId": "staff-123"
  }
}

// 실패
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "비밀번호가 일치하지 않습니다."
  }
}
```

---

## 🔒 보안 고려사항

| 항목 | 설명 |
| --- | --- |
| **Public Route** | 인증 없이 접근 가능 (비로그인 사용자 대상) |
| **토큰 기반 인증** | UUID 형식 초대 토큰으로 접근 제어 |
| **토큰 만료** | 초대 토큰은 48시간 후 자동 만료 (`invitationExpiresAt`) |
| **일회성 토큰** | 비밀번호 설정 완료 후 토큰 무효화 (재사용 불가) |
| **비밀번호 최소 길이** | 최소 6자 이상 (클라이언트 + 서버 양쪽 검증) |
| **비밀번호 확인** | 이중 입력 확인으로 오타 방지 |
| **승인 워크플로우** | 비밀번호 설정만으로 로그인 불가, 관리자 승인 필수 |
| **토큰 노출 방지** | URL 쿼리 파라미터로 전달되므로 HTTPS 필수 |
| **입력 비밀번호 마스킹** | `type="password"` 적용 |
| **브루트포스 방지** | 서버 측 토큰 검증 횟수 제한 권장 |


---

## 🎨 UI 컴포넌트

### 사용 컴포넌트 (`@/components/ui`)
- `Button`: 비밀번호 설정 완료 버튼, 로그인 페이지 이동 버튼
- `Input`: 비밀번호 입력 필드 (type="password")
- `Spinner`: 토큰 검증 로딩 표시

### 외부 라이브러리
- `react-router-dom`: `useSearchParams` (토큰 추출), `Link` (로그인 페이지 링크)

### 아이콘 (`@ant-design/icons`)
- `CheckCircleOutlined`: 성공 상태 아이콘 (text-success)
- `CloseCircleOutlined`: 에러 상태 아이콘 (text-critical)
- `LockOutlined`: 비밀번호 설정 폼 헤더 아이콘 (text-primary)

### Hooks
| Hook | 용도 |
| --- | --- |
| `useValidateInvitation` | 초대 토큰 유효성 검증 (`data`, `isLoading`) |
| `useSetPassword` | 비밀번호 설정 mutation (`mutateAsync`, `isPending`) |
| `useToast` | 성공/에러 토스트 알림 |


### 상태 관리
| State | 타입 | 용도 |
| --- | --- | --- |
| `password` | `string` | 새 비밀번호 입력 |
| `confirmPassword` | `string` | 비밀번호 확인 입력 |
| `passwordError` | `string | null` | 비밀번호 유효성 에러 메시지 |
| `isSubmitted` | `boolean` | 설정 완료 여부 (완료 화면 전환) |


---

## 🧪 테스트 시나리오

### 단위 테스트
- [ ] 비밀번호 강도 함수 (`getPasswordStrength`) 검증
  - 빈 문자열 → 라벨 없음
  - 5자 이하 → "약함" (critical)
  - 6~7자 → "보통" (warning)
  - 8자 이상 + 대문자 + 숫자 → "강함" (success)
  - 8자 이상, 조건 미충족 → "보통" (warning)
- [ ] 비밀번호 유효성 검사 (`useEffect`) 검증
  - 6자 미만 → "비밀번호는 6자 이상이어야 합니다."
  - 확인 불일치 → "비밀번호가 일치하지 않습니다."
  - 유효한 입력 → `passwordError === null`
- [ ] 에러 메시지 매핑 (`INVITATION_ERROR_MESSAGES`) 검증

### 통합 테스트
- [ ] 토큰 없이 접근 시 "잘못된 접근입니다" 화면 표시 확인
- [ ] 만료된 토큰으로 접근 시 "초대가 만료되었습니다" 화면 표시 확인
- [ ] 이미 사용된 토큰으로 접근 시 "이미 설정된 계정입니다" + [로그인하기] 버튼 확인
- [ ] 유효한 토큰으로 접근 시 비밀번호 설정 폼 + 직원 이름 표시 확인
- [ ] 비밀번호 설정 완료 후 완료 화면 전환 확인
- [ ] 설정 실패 시 에러 토스트 표시 확인
- [ ] mutation 진행 중 버튼 비활성화 + "설정 중..." 텍스트 확인

### E2E 테스트
- [ ] 전체 정상 플로우: 토큰 검증 → 비밀번호 입력 → 강도 표시 → 설정 완료 → 완료 화면
- [ ] 에러 플로우: 만료 토큰 → 에러 화면 → 안내 메시지
- [ ] 유효성 검사 플로우: 5자 입력 → 에러 표시 → 6자 이상 → 에러 해제 → 불일치 → 에러 → 일치 → 에러 해제
- [ ] 비밀번호 강도 실시간 변화 확인

---

## 📌 TODO

- [ ] 비밀번호 강도 규칙 강화 (특수문자 포함 등)
- [ ] 비밀번호 입력 시 보기/숨기기 토글 아이콘 추가
- [ ] 초대 토큰 만료 시 재발송 요청 기능 (이 페이지에서 직접)
- [ ] 비밀번호 설정 후 자동 로그인 (승인 불필요 시)
- [ ] reCAPTCHA 등 봇 방지 메커니즘 추가
- [ ] 토큰 검증 실패 횟수 제한 및 IP 차단
- [ ] 다국어 지원 (초대 대상이 외국인일 경우)
- [ ] 비밀번호 정책 서버 설정 연동 (최소 길이, 복잡도 등)

---

**작성일**: 2026-02-11
**최종 수정일**: 2026-02-11
**작성자**: Claude Code
