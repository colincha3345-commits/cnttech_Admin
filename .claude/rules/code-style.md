# 코드 스타일 규칙

## 네이밍 컨벤션
- 컴포넌트: **PascalCase** (예: `OrderDetailPage`, `PermissionToggle`)
- 함수/변수: **camelCase** (예: `fetchOrderList`, `isPermitted`)
- 상수: **UPPER_SNAKE_CASE** (예: `MENU_PERMISSIONS`, `API_BASE_URL`)
- 폴더: **kebab-case** (예: `delivery-zone`, `app-members`)
- 타입/인터페이스: **PascalCase** (예: `OrderType`, `MemberFormProps`)

## 파일 구조
- 페이지: `src/pages/{도메인}/{기능}.tsx`
- 훅: `src/hooks/use{도메인}{기능}.ts`
- 서비스: `src/services/{도메인}Service.ts`
- 타입: `src/types/{도메인}.ts`
- 상수: `src/constants/{도메인}.ts`
- Mock 데이터: `src/lib/api/mock{Domain}Data.ts`

## 임포트 규칙
- `@/` 절대 경로 사용 필수 (상대 경로 금지)
- 순서: React → 외부 라이브러리 → 내부 모듈 → 타입 → 스타일

## 컴포넌트 규칙
- 함수형 컴포넌트만 사용
- Props 타입은 별도 interface로 정의
- 한 파일에 export default 컴포넌트 1개만

## 상태 관리
- 서버 상태: React Query (`@tanstack/react-query`)
- 인증 상태: Zustand (`src/stores/authStore.ts`)
- 로컬 UI 상태: `useState` / `useReducer`
- 컴포넌트에서 직접 fetch/API 호출 금지 → 반드시 hooks 경유

## 타입 규칙
- `any` 타입 사용 금지
- 서비스 함수 반환 타입 명시 필수
- Props interface 정의 필수

## 권한 코드 패턴
- 15메뉴 × 4권한(view/write/masking/download) 토글 구조
- 권한 체크는 유틸/훅을 통해 수행
- 하드코딩된 권한 문자열 금지 → `constants/`에서 참조
