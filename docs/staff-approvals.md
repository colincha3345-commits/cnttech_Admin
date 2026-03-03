# 계정 승인 관리 페이지 기획서

> **경로**: `/staff/approvals`
> **관련 파일**: `src/pages/Staff/StaffApprovals.tsx`

---

## 📋 개요

초대 링크를 통해 비밀번호 설정을 완료한 직원 계정의 승인/거절을 처리하는 관리 페이지이다. 직원 초대 워크플로우의 마지막 단계로, 관리자가 신규 직원 계정을 승인해야 해당 직원이 시스템에 로그인할 수 있다.

### 초대 워크플로우 위치
```
관리자: 직원 초대 (invited)
  → 직원: 초대 링크에서 비밀번호 설정 (pending_approval)
  → 관리자: [이 페이지] 승인/거절 (active / rejected)
```

---

## 🎯 주요 기능

| 기능 | 설명 |
| --- | --- |
| **승인 대기 목록 조회** | 비밀번호 설정 완료 후 승인 대기 중인 직원 목록 표시 |
| **직원 유형 필터** | 본사/가맹점별 필터링 |
| **계정 승인** | ConfirmDialog를 통한 승인 처리 → 직원 로그인 가능 |
| **계정 거절** | 거절 사유 입력 모달 → 거절 처리 (사유는 이메일로 전달) |
| **소속 정보 표시** | 직원 유형에 따라 팀명/매장명 자동 변환 표시 |


---

## 🖼️ 화면 구성

### 1. 헤더 영역
- 페이지 제목: "계정 승인 관리"
- 부제: "비밀번호 설정을 완료한 직원 계정의 승인을 관리합니다. (총 N건)"

### 2. 필터 영역 (Card)
- **직원 유형** 드롭다운: 전체 / 본사 / 가맹점

### 3. 승인 대기 테이블 (Card)
| 컬럼 | 설명 |
| --- | --- |
| 이름 | 직원 이름 (font-medium) |
| 아이디 | 로그인 ID |
| 이메일 | 이메일 주소 |
| 유형 | Badge (본사=info, 가맹점=secondary) + STAFF_TYPE_LABELS |
| 소속 | 본사→팀명(getTeamName), 가맹점→매장명(getStoreName) |
| 비밀번호 설정일 | passwordSetAt 한국어 날짜 포맷 |
| 액션 | [승인] 버튼(primary) + [거절] 버튼(outline) |


### 4. 빈 상태
- "승인 대기 중인 계정이 없습니다." 텍스트

### 5. 승인 확인 다이얼로그 (ConfirmDialog)
- 제목: "계정 승인"
- 메시지: "'이름' 직원의 계정을 승인하시겠습니까? 승인 후 해당 직원은 로그인이 가능합니다."
- 확인 버튼: "승인" (type="info")

### 6. 거절 사유 입력 모달 (Modal, size="sm")
```
┌── 계정 승인 거절 ────────────────────┐
│                                       │
│ '이름' 직원의 계정 승인을 거절합니다.      │
│                                       │
│ 거절 사유 (선택)                        │
│ ┌─────────────────────────────────┐  │
│ │ 거절 사유를 입력하세요              │  │
│ └─────────────────────────────────┘  │
│ 거절 사유는 해당 직원에게 이메일로 전달됩니다. │
│                                       │
│                     [취소] [거절]       │
└───────────────────────────────────────┘
```

---

## 🔄 사용자 플로우

### 계정 승인 플로우
```
테이블 행 [승인] 버튼 클릭
  → ConfirmDialog 표시
  → [승인] 클릭
  → approveMutation.mutateAsync({ staffId, approverId })
  → 성공 토스트: "이름님의 계정이 승인되었습니다."
  → 목록 refetch
  → 실패 시 에러 토스트
```

### 계정 거절 플로우
```
테이블 행 [거절] 버튼 클릭
  → 거절 사유 입력 모달 표시
  → 거절 사유 입력 (선택)
  → [거절] 클릭
  → rejectMutation.mutateAsync({ staffId, rejectorId, reason })
  → 성공 토스트: "이름님의 계정이 거절되었습니다."
  → 거절 사유 초기화 + 목록 refetch
  → 실패 시 에러 토스트
```

### 취소 플로우 (거절 모달)
```
[취소] 클릭 또는 모달 닫기
  → rejectTarget 초기화
  → rejectReason 초기화
```

---

## 📦 데이터 구조

### StaffAccount (승인 대기 항목)
```typescript
interface StaffAccount {
  id: string;
  staffType: StaffType;           // 'headquarters' | 'franchise'
  name: string;
  loginId: string;
  email: string;
  teamId?: string;                // 본사 직원인 경우
  storeId?: string;               // 가맹점 직원인 경우
  status: 'pending_approval';     // 이 페이지에서는 항상 pending_approval
  passwordSetAt?: Date;           // 비밀번호 설정 일시
  // ... (StaffAccount 전체 필드)
}
```

### ApprovalData
```typescript
interface ApprovalData {
  staffId: string;
  action: 'approve' | 'reject';
  reason?: string;                // 거절 시 사유
}
```

### PendingApprovalCount
```typescript
interface PendingApprovalCount {
  headquarters: number;
  franchise: number;
  total: number;
}
```

### 상수
```typescript
const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  headquarters: '본사',
  franchise: '가맹점',
};
```

---

## 🔌 API 엔드포인트

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `GET` | `/api/staff/approvals/pending` | 승인 대기 목록 조회 | `usePendingApprovals` |
| `POST` | `/api/staff/approvals/:id/approve` | 계정 승인 | `useApproveStaff` |
| `POST` | `/api/staff/approvals/:id/reject` | 계정 거절 | `useRejectStaff` |
| `GET` | `/api/teams` | 팀 목록 조회 (소속 표시용) | `useTeams` |
| `GET` | `/api/stores` | 매장 목록 조회 (소속 표시용) | `useStores` |


### 요청 파라미터 (GET - 승인 대기 목록)
```typescript
{
  staffType?: StaffType;   // 직원 유형 필터 ('headquarters' | 'franchise')
}
```

### 승인 요청 (POST - approve)
```json
{
  "staffId": "staff-123",
  "approverId": "admin"
}
```

### 거절 요청 (POST - reject)
```json
{
  "staffId": "staff-123",
  "rejectorId": "admin",
  "reason": "소속 팀 확인이 필요합니다."
}
```

### 응답 형식 (GET)
```json
{
  "data": [StaffAccount],
  "pagination": {
    "total": 5
  }
}
```

---

## 🔒 보안 고려사항

| 항목 | 설명 |
| --- | --- |
| **승인 권한** | 관리자 권한이 있는 사용자만 승인/거절 가능 |
| **승인자 기록** | 승인/거절 시 처리자 ID를 함께 저장 (`approverId`, `rejectorId`) |
| **거절 사유 전달** | 거절 사유는 해당 직원에게 이메일로 자동 전달 |
| **이중 처리 방지** | mutation 진행 중 버튼 비활성화 (`isPending` 체크) |
| **인증/인가** | 인증된 관리자만 접근 가능 (Protected Route) |
| **감사 로그** | 승인/거절 이력은 서버에서 감사 로그로 관리 |


---

## 🎨 UI 컴포넌트

### 사용 컴포넌트 (`@/components/ui`)
- `Card`: 필터 영역, 테이블 영역 감싸기
- `Button`: 승인/거절 버튼 (size="sm")
- `Badge`: 직원 유형 배지 (본사=info, 가맹점=secondary)
- `Spinner`: 로딩 상태 표시 (layout="center")
- `ConfirmDialog`: 승인 확인 다이얼로그 (type="info")
- `Modal`: 거절 사유 입력 모달 (size="sm")
- `Input`: 거절 사유 입력 필드

### 아이콘 (`@ant-design/icons`)
- `CheckOutlined`: 승인 버튼 아이콘
- `CloseOutlined`: 거절 버튼 아이콘

### Hooks
| Hook | 용도 |
| --- | --- |
| `usePendingApprovals` | 승인 대기 목록 조회 (`data`, `isLoading`, `refetch`) |
| `useApproveStaff` | 계정 승인 mutation (`mutateAsync`, `isPending`) |
| `useRejectStaff` | 계정 거절 mutation (`mutateAsync`, `isPending`) |
| `useTeams` | 팀 목록 조회 (소속 표시용) |
| `useStores` | 매장 목록 조회 (소속 표시용) |
| `useToast` | 성공/에러 토스트 알림 |


---

## 🧪 테스트 시나리오

### 단위 테스트
- [ ] 직원 유형별 Badge 색상 매핑 (headquarters=info, franchise=secondary) 검증
- [ ] 팀명 변환 (`getTeamName`) 함수 검증 (teamId가 없는 경우 '-' 반환)
- [ ] 매장명 변환 (`getStoreName`) 함수 검증 (storeId가 없는 경우 '-' 반환)
- [ ] 소속 표시 로직 (headquarters→팀명, franchise→매장명) 검증
- [ ] 빈 목록 시 "승인 대기 중인 계정이 없습니다." 표시 확인

### 통합 테스트
- [ ] 직원 유형 필터 변경 시 목록 갱신 확인
- [ ] 승인 처리 후 목록에서 해당 항목 제거 확인
- [ ] 거절 처리 후 목록에서 해당 항목 제거 확인
- [ ] 거절 사유 입력 후 모달 닫힘 및 사유 초기화 확인
- [ ] mutation 진행 중 버튼 비활성화 확인

### E2E 테스트
- [ ] 승인 전체 플로우: 대기 목록 조회 → 승인 확인 → 토스트 표시 → 목록 갱신
- [ ] 거절 전체 플로우: 대기 목록 조회 → 거절 사유 입력 → 거절 처리 → 토스트 표시 → 목록 갱신
- [ ] 거절 모달 취소 시 상태 초기화 확인
- [ ] 네트워크 에러 시 에러 토스트 표시 확인

---

## 📌 TODO

- [ ] `approverId`/`rejectorId`를 현재 로그인한 사용자 ID로 동적 주입 (현재 하드코딩: `'admin'`)
- [ ] 일괄 승인/거절 기능 (체크박스 선택)
- [ ] 승인/거절 이력 조회 페이지 추가
- [ ] 승인 대기 건수 사이드바 뱃지 연동 (`PendingApprovalCount`)
- [ ] 페이지네이션 추가 (대기 건수가 많아질 경우)
- [ ] 비밀번호 설정일 기준 정렬 기능
- [ ] 승인 알림 (이메일/푸시) 자동 발송

---

**작성일**: 2026-02-11
**최종 수정일**: 2026-02-11
**작성자**: Claude Code
