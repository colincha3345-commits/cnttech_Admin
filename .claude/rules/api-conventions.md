# API / 서비스 레이어 규칙

## Clean Architecture 호출 흐름
```
Page(컴포넌트) → Hook(useXxx) → Service(xxxService) → lib/api(apiClient)
```
- 컴포넌트에서 직접 fetch/axios 호출 **절대 금지**
- API fetch는 Service/Hook에서만 처리

## 서비스 레이어 (`src/services/`)
- 파일명: `{도메인}Service.ts`
- 함수는 순수 함수 스타일로 작성
- 반환 타입 명시 필수 (`Promise<XxxType>`)
- 에러는 서비스에서 catch하지 않고 훅/컴포넌트로 전파

## Hook 레이어 (`src/hooks/`)
- React Query의 `useQuery`/`useMutation`으로 서비스 호출
- queryKey 규칙: `[도메인, 액션, 파라미터]` (예: `['orders', 'list', { page }]`)
- 에러/로딩 상태는 훅에서 관리

## API 클라이언트 (`src/lib/api/`)
- `apiClient.ts`: 공통 요청 설정 (baseURL, 인터셉터, 헤더, 타임아웃 15초)
- Mock → REST 전환 시 **서비스 레이어만 수정**하도록 설계
- Mock 파일: `mock{Domain}Data.ts`

## 응답 타입 규칙
- 모든 API 응답 타입은 `src/types/`에 정의
- 페이지네이션: 공통 제네릭 타입 사용
- 에러 응답: `ApiError` 클래스 기반 표준 에러 타입

## 백엔드 확장성
- 모든 코드는 백엔드 API 연동을 고려하여 작성
- Mock 데이터 구조 = 실제 API 스펙 구조 일치 유지
