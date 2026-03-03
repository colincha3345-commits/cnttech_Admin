# 팀 관리 페이지 기획서

> **경로**: `/staff/teams`
> **관련 파일**: `src/pages/Staff/Teams.tsx`

---

## 📋 개요

본사 직원의 소속 팀을 관리하는 페이지이다. 팀은 그리드 카드 레이아웃으로 표시되며, 팀 이름, 설명, 멤버 수, 생성일 등의 정보를 제공한다. 간단한 CRUD(생성/조회/수정/삭제) 기능을 지원한다.

---

## 🎯 주요 기능

| 기능 | 설명 |
| --- | --- |
| **팀 목록 조회** | 그리드 카드 형태로 팀 목록 표시 (반응형 1/2/3열) |
| **팀 추가** | TeamFormModal을 통한 팀 생성 |
| **팀 수정** | TeamFormModal을 통한 팀 정보 수정 |
| **팀 삭제** | ConfirmDialog를 통한 삭제 확인 (소속 직원이 있으면 삭제 불가) |
| **멤버 수 표시** | 각 팀 카드에 소속 멤버 수 Badge 표시 |


---

## 🖼️ 화면 구성

### 1. 헤더 영역
- 페이지 제목: "팀 관리"
- 부제: "본사 직원 소속 팀을 관리합니다."
- [팀 추가] 버튼 (PlusOutlined 아이콘)

### 2. 팀 카드 그리드
- **레이아웃**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- 반응형: 모바일 1열, 태블릿 2열, 데스크탑 3열

### 3. 팀 카드 구조 (Card)
```
┌──────────────────────────────────────┐
│ [아이콘]  팀 이름           [수정][삭제] │
│           N명 (Badge)                  │
│                                        │
│ 팀 설명 텍스트 (최대 2줄, line-clamp)     │
│ ────────────────────────────────────── │
│ 생성일: YYYY. MM. DD.                   │
└──────────────────────────────────────┘
```

- **아이콘**: TeamOutlined (primary 색상, 10x10 rounded-lg 배경)
- **멤버 수**: Badge variant="secondary" (`N명`)
- **설명**: 2줄 제한 (`line-clamp-2`), 없으면 표시하지 않음
- **생성일**: `ko-KR` 로케일 날짜 포맷
- **액션 버튼**: EditOutlined (수정), DeleteOutlined (삭제)

### 4. 빈 상태
- 팀이 없을 경우 전체 너비 카드(`col-span-full`)
- TeamOutlined 아이콘 (4xl, muted)
- "등록된 팀이 없습니다." 텍스트
- [첫 번째 팀 추가하기] 버튼 (variant="outline")

---

## 🔄 사용자 플로우

### 팀 추가 플로우
```
[팀 추가] 버튼 클릭 (또는 빈 상태에서 [첫 번째 팀 추가하기] 클릭)
  → TeamFormModal 오픈
  → 팀 이름(필수), 설명(선택) 입력
  → 저장
  → 성공 시 목록 자동 갱신
```

### 팀 수정 플로우
```
팀 카드 [수정] 아이콘 클릭
  → TeamFormModal 오픈 (기존 데이터 로드)
  → 정보 수정
  → 저장
  → 성공 시 목록 자동 갱신
```

### 팀 삭제 플로우
```
팀 카드 [삭제] 아이콘 클릭
  → ConfirmDialog 표시: "'팀이름' 팀을 삭제하시겠습니까? 소속 직원이 있는 팀은 삭제할 수 없습니다."
  → [삭제] 클릭 → 삭제 처리
  → 성공 토스트: "팀이 삭제되었습니다."
  → 실패 시 에러 토스트 (소속 직원 존재 등)
```

---

## 📦 데이터 구조

### Team
```typescript
interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### TeamFormData
```typescript
interface TeamFormData {
  name: string;
  description?: string;
}
```

---

## 🔌 API 엔드포인트

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `GET` | `/api/teams` | 팀 목록 조회 | `useTeams` |
| `POST` | `/api/teams` | 팀 생성 | TeamFormModal 내부 |
| `PUT` | `/api/teams/:id` | 팀 수정 | TeamFormModal 내부 |
| `DELETE` | `/api/teams/:id` | 팀 삭제 | `useDeleteTeam` |


### 응답 형식 (GET)
```json
{
  "data": [
    {
      "id": "team-1",
      "name": "개발팀",
      "description": "서비스 개발 담당",
      "memberCount": 5,
      "createdAt": "2026-01-15T09:00:00Z",
      "updatedAt": "2026-02-01T10:30:00Z"
    }
  ]
}
```

---

## 🔒 보안 고려사항

| 항목 | 설명 |
| --- | --- |
| **삭제 제한** | 소속 직원이 있는 팀은 삭제할 수 없음 (서버에서 검증) |
| **삭제 확인** | 삭제 전 ConfirmDialog를 통한 이중 확인 |
| **인증/인가** | 인증된 관리자만 접근 가능 (Protected Route) |
| **입력 검증** | 팀 이름 필수 입력, 중복 이름 검증 (서버 측) |


---

## 🎨 UI 컴포넌트

### 사용 컴포넌트 (`@/components/ui`)
- `Card`: 팀 카드 컨테이너
- `Button`: 팀 추가, 첫 번째 팀 추가하기 버튼
- `Badge`: 멤버 수 배지 (variant="secondary")
- `Spinner`: 로딩 상태 표시 (layout="center")
- `ConfirmDialog`: 삭제 확인 다이얼로그

### 페이지 내부 컴포넌트
- `TeamFormModal`: 팀 생성/수정 모달 (`./components/TeamFormModal`)

### 아이콘 (`@ant-design/icons`)
- `PlusOutlined`: 팀 추가 버튼
- `EditOutlined`: 수정 아이콘 버튼
- `DeleteOutlined`: 삭제 아이콘 버튼
- `TeamOutlined`: 팀 카드 아이콘, 빈 상태 아이콘

### Hooks
| Hook | 용도 |
| --- | --- |
| `useTeams` | 팀 목록 조회 (`data`, `isLoading`) |
| `useDeleteTeam` | 팀 삭제 mutation |
| `useToast` | 성공/에러 토스트 알림 |


---

## 🧪 테스트 시나리오

### 단위 테스트
- [ ] 팀 카드 렌더링 검증 (이름, 설명, 멤버 수, 생성일)
- [ ] 설명이 없는 팀 카드에서 설명 영역이 숨겨지는지 확인
- [ ] 빈 상태 UI 표시 확인 (팀이 0개일 때)
- [ ] 로딩 상태에서 Spinner 표시 확인

### 통합 테스트
- [ ] 팀 추가 후 그리드 목록 자동 갱신 확인
- [ ] 팀 수정 후 카드 정보 갱신 확인
- [ ] 팀 삭제 후 카드 제거 및 토스트 확인
- [ ] 소속 직원이 있는 팀 삭제 시 에러 토스트 확인

### E2E 테스트
- [ ] 전체 CRUD 플로우 (추가 → 조회 → 수정 → 삭제) 검증
- [ ] 반응형 레이아웃 동작 확인 (1열/2열/3열 전환)
- [ ] 빈 상태에서 [첫 번째 팀 추가하기] 버튼 동작 확인

---

## 📌 TODO

- [ ] 팀 카드 드래그&드롭 순서 변경 기능
- [ ] 팀별 멤버 목록 펼치기/접기 기능
- [ ] 팀 검색/필터 기능 추가 (팀 수가 많아질 경우)
- [ ] 팀 카드에 최근 활동 정보 표시
- [ ] 팀 병합/분리 기능
- [ ] 팀장 지정 기능

---

**작성일**: 2026-02-11
**최종 수정일**: 2026-02-11
**작성자**: Claude Code
