# 직원 관리 페이지 기획서

> **경로**: `/staff/headquarters`, `/staff/franchise`
> **관련 파일**: `src/pages/Staff/HeadquartersStaff.tsx`, `src/pages/Staff/FranchiseStaff.tsx`

---

## 📋 개요

본사 직원 및 가맹점 직원의 계정을 통합적으로 관리하는 페이지이다. 두 페이지는 동일한 패턴(테이블 목록 + 검색 + 필터 + 페이지네이션 + CRUD 모달)을 공유하며, 필터 조건과 API 엔드포인트만 다르다.

- **본사 직원 관리** (`/staff/headquarters`): 본사 소속 직원을 팀 기준으로 관리
- **가맹점 직원 관리** (`/staff/franchise`): 가맹점 소속 직원을 매장 기준으로 관리

---

## 🎯 주요 기능

| 기능 | 설명 |
| --- | --- |
| **직원 목록 조회** | 테이블 형태로 직원 목록 표시, 페이지네이션 지원 (10건/페이지) |
| **검색** | 이름 또는 아이디로 키워드 검색 |
| **필터링** | 본사: 소속팀/상태 필터, 가맹점: 소속 가맹점/상태 필터 |
| **직원 추가** | StaffFormModal을 통한 직원 초대 (비밀번호 제외, 사용자가 직접 설정) |
| **직원 수정** | StaffFormModal을 통한 직원 정보 수정 |
| **직원 삭제** | ConfirmDialog를 통한 삭제 확인 후 삭제 |
| **개인정보 마스킹** | 연락처를 MaskedData 컴포넌트로 마스킹 처리 |
| **상태 뱃지** | 직원 상태에 따른 색상 배지 표시 |


---

## 🖼️ 화면 구성

### 1. 헤더 영역
- 페이지 제목: "본사 직원 관리" / "가맹점 직원 관리"
- 부제: 총 직원 수 표시
- [직원 추가] 버튼 (PlusOutlined 아이콘)

### 2. 필터 영역 (Card)
- **본사 직원**: 소속팀 드롭다운 (useTeams에서 팀 목록 로드) + 상태 드롭다운 + 키워드 검색
- **가맹점 직원**: 가맹점 드롭다운 (useStores에서 매장 목록 로드) + 상태 드롭다운 + 키워드 검색
- [검색] 버튼

### 3. 테이블 영역 (Card)
| 컬럼 | 설명 |
| --- | --- |
| 이름 | 직원 이름 (font-medium) |
| 아이디 | 로그인 ID |
| 소속팀/소속 가맹점 | teamId/storeId를 이름으로 변환하여 표시 |
| 연락처 | MaskedData 컴포넌트로 마스킹 |
| 이메일 | 이메일 주소 |
| 상태 | Badge 컴포넌트 (상태별 색상) |
| 최근 접속 | lastLoginAt 한국어 날짜 포맷 (MM/DD HH:mm) |
| 액션 | 수정(EditOutlined), 삭제(DeleteOutlined) 아이콘 버튼 |


### 4. 페이지네이션 영역
- 총 N명 중 X-Y명 표시
- 이전/다음 버튼 + 페이지 번호 (최대 5개 표시, 슬라이딩 윈도우)

### 5. 상태 배지 색상 매핑

| 상태 | 라벨 | Badge variant |
| --- | --- | --- |
| `active` | 활성 | `success` (초록) |
| `inactive` | 비활성 | `warning` (노랑) |
| `invited` | 초대됨 | `info` (파랑) |
| `pending_approval` | 승인대기 | `info` (파랑) |
| `rejected` | 거절됨 | `critical` (빨강) |


---

## 🔄 사용자 플로우

### 직원 추가 플로우
```
[직원 추가] 버튼 클릭
  → StaffFormModal 오픈 (staffType: 'headquarters' | 'franchise')
  → 이름, 연락처, 이메일, 로그인ID, 소속(팀/매장) 입력
  → 저장 → 초대 이메일 발송 (status: 'invited')
  → 직원이 초대 링크에서 비밀번호 설정 (status: 'pending_approval')
  → 관리자가 승인 (status: 'active')
```

### 직원 수정 플로우
```
테이블 행 [수정] 아이콘 클릭
  → StaffFormModal 오픈 (기존 데이터 로드)
  → 정보 수정
  → 저장
```

### 직원 삭제 플로우
```
테이블 행 [삭제] 아이콘 클릭
  → ConfirmDialog 표시: "'이름' 직원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
  → [삭제] 클릭 → 삭제 처리
  → 성공 토스트: "직원이 삭제되었습니다."
  → 실패 시 에러 토스트
```

### 검색/필터 플로우
```
필터 변경 또는 검색 실행
  → page를 1로 리셋
  → 변경된 파라미터로 API 재요청
```

---

## 📦 데이터 구조

### StaffAccount
```typescript
interface StaffAccount {
  id: string;
  staffType: StaffType;              // 'headquarters' | 'franchise'
  name: string;
  phone: string;
  email: string;
  loginId: string;
  teamId?: string;                   // 본사 직원인 경우
  storeId?: string;                  // 가맹점 직원인 경우
  status: StaffStatus;               // 'invited' | 'pending_approval' | 'active' | 'inactive' | 'rejected'
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  invitationToken?: string;          // 초대 토큰 (UUID)
  invitationExpiresAt?: Date;        // 초대 만료 시간 (48시간)
  invitedAt?: Date;
  passwordSetAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  mfaEnabled: boolean;               // Staff는 기본 true
}
```

### StaffInviteFormData (생성 시)
```typescript
interface StaffInviteFormData {
  staffType: StaffType;
  name: string;
  phone: string;
  email: string;
  loginId: string;
  teamId?: string;
  storeId?: string;
}
```

### StaffAccountUpdateData (수정 시)
```typescript
interface StaffAccountUpdateData {
  name?: string;
  phone?: string;
  email?: string;
  teamId?: string;
  storeId?: string;
  status?: StaffStatus;
}
```

---

## 🔌 API 엔드포인트

### 본사 직원

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `GET` | `/api/staff/headquarters` | 본사 직원 목록 조회 (필터, 페이지네이션) | `useHeadquartersStaff` |
| `POST` | `/api/staff/headquarters` | 본사 직원 추가 (초대) | StaffFormModal 내부 |
| `PUT` | `/api/staff/headquarters/:id` | 본사 직원 정보 수정 | StaffFormModal 내부 |
| `DELETE` | `/api/staff/headquarters/:id` | 본사 직원 삭제 | `useDeleteHeadquartersStaff` |


### 가맹점 직원

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `GET` | `/api/staff/franchise` | 가맹점 직원 목록 조회 (필터, 페이지네이션) | `useFranchiseStaff` |
| `POST` | `/api/staff/franchise` | 가맹점 직원 추가 (초대) | StaffFormModal 내부 |
| `PUT` | `/api/staff/franchise/:id` | 가맹점 직원 정보 수정 | StaffFormModal 내부 |
| `DELETE` | `/api/staff/franchise/:id` | 가맹점 직원 삭제 | `useDeleteFranchiseStaff` |


### 공통

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `GET` | `/api/teams` | 팀 목록 조회 | `useTeams` |
| `GET` | `/api/stores` | 매장 목록 조회 | `useStores` |


### 요청 파라미터 (GET)
```typescript
{
  teamId?: string;          // 본사: 팀 필터
  storeId?: string;         // 가맹점: 매장 필터
  status?: StaffStatus;     // 상태 필터
  keyword?: string;         // 검색 키워드 (이름, 로그인ID)
  page: number;             // 페이지 번호 (1부터)
  limit: number;            // 페이지 크기 (기본 10)
}
```

### 응답 형식
```json
{
  "data": [StaffAccount],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## 🔒 보안 고려사항

| 항목 | 설명 |
| --- | --- |
| **개인정보 마스킹** | 연락처(phone)를 MaskedData 컴포넌트로 마스킹 처리 |
| **초대 기반 가입** | 직원 추가 시 비밀번호를 설정하지 않고, 초대 링크를 통해 본인이 직접 설정 |
| **초대 토큰 만료** | 초대 토큰은 48시간 후 만료 |
| **2FA 기본 활성화** | Staff 계정은 MFA가 기본 활성화 (`mfaEnabled: true`) |
| **승인 워크플로우** | 비밀번호 설정 후 관리자 승인이 필요 (자동 활성화 방지) |
| **삭제 확인** | 삭제 전 ConfirmDialog를 통한 이중 확인 |
| **인증/인가** | 인증된 관리자만 접근 가능 (Protected Route) |


---

## 🎨 UI 컴포넌트

### 사용 컴포넌트 (`@/components/ui`)
- `Card`: 필터 영역, 테이블 영역 감싸기
- `Button`: 직원 추가, 검색, 필터 버튼
- `Badge`: 상태 배지 (variant별 색상)
- `Input`: 키워드 검색 입력
- `Spinner`: 로딩 상태 표시
- `MaskedData`: 연락처 마스킹
- `ConfirmDialog`: 삭제 확인 다이얼로그

### 페이지 내부 컴포넌트
- `StaffFormModal`: 직원 추가/수정 모달 (`./components/StaffFormModal`)

### 아이콘 (`@ant-design/icons`)
- `PlusOutlined`: 직원 추가 버튼
- `SearchOutlined`: 검색 입력 필드 아이콘
- `EditOutlined`: 수정 버튼
- `DeleteOutlined`: 삭제 버튼

### Hooks
| Hook | 용도 |
| --- | --- |
| `useHeadquartersStaff` | 본사 직원 목록 조회 |
| `useFranchiseStaff` | 가맹점 직원 목록 조회 |
| `useTeams` | 팀 목록 조회 (본사 필터용) |
| `useStores` | 매장 목록 조회 (가맹점 필터용) |
| `useDeleteHeadquartersStaff` | 본사 직원 삭제 mutation |
| `useDeleteFranchiseStaff` | 가맹점 직원 삭제 mutation |
| `useToast` | 성공/에러 토스트 알림 |


---

## 🧪 테스트 시나리오

### 단위 테스트
- [ ] 상태별 배지 색상 매핑 (`getStatusBadgeVariant`) 검증
- [ ] 팀명/매장명 변환 함수 (`getTeamName`/`getStoreName`) 검증
- [ ] 날짜 포맷 (lastLoginAt) 검증
- [ ] 빈 목록 시 "등록된 직원이 없습니다." 표시 확인

### 통합 테스트
- [ ] 필터 변경 시 page가 1로 리셋되는지 확인
- [ ] 키워드 검색 후 결과 목록 갱신 확인
- [ ] 직원 추가 후 목록 자동 갱신 확인
- [ ] 직원 수정 후 목록 자동 갱신 확인
- [ ] 직원 삭제 후 목록 자동 갱신 및 토스트 표시 확인
- [ ] 삭제 실패 시 에러 토스트 표시 확인

### E2E 테스트
- [ ] 전체 CRUD 플로우 (추가 → 조회 → 수정 → 삭제) 검증
- [ ] 필터 + 검색 + 페이지네이션 조합 동작 확인
- [ ] MaskedData 마스킹/해제 동작 확인
- [ ] 팀/매장 필터와 상태 필터 조합 동작 확인

---

## 📌 TODO

- [ ] 직원 일괄 초대 기능 (CSV 업로드)
- [ ] 직원 상태 일괄 변경 기능 (체크박스 선택)
- [ ] 직원 목록 Excel 다운로드 기능
- [ ] 접속 이력 상세 조회 기능
- [ ] 권한/역할(Role) 기반 접근 제어 추가
- [ ] 이메일 마스킹 처리 (현재 평문 표시)
- [ ] 테이블 정렬 기능 (이름, 최근 접속 등)

---

**작성일**: 2026-02-11
**최종 수정일**: 2026-02-11
**작성자**: Claude Code
