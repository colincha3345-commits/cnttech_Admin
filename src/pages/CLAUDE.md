# 프론트엔드 페이지 개발 규칙

## 디렉토리 구조
```
pages/
├── AppMembers/       # 앱 회원 관리
├── AuditLogs/        # 감사 로그
├── Dashboard/        # 대시보드
├── DeliveryZone/     # 배달권역
├── Design/           # 디자인 관리
├── Invitation/       # 초대
├── Login/            # 로그인/인증
├── Marketing/        # 마케팅 (할인, 쿠폰, 포인트, 혜택, 푸시)
├── Menu/             # 메뉴 (상품, 카테고리, 옵션)
├── Orders/           # 주문 관리
├── Settings/         # 설정
├── Settlement/       # 정산
├── Staff/            # 직원 관리
├── Store/            # 매장 관리
├── Support/          # 고객지원
├── Users/            # 사용자 관리
├── events/           # 이벤트
└── permissions/      # 권한 관리
```

## 페이지 컴포넌트 작성 규칙

### 네이밍
- 파일: PascalCase (`OrderList.tsx`, `ProductDetail.tsx`)
- 폴더: PascalCase (도메인 단위)
- barrel export: 각 폴더 `index.ts`에서 re-export

### 구조 패턴
```tsx
// 1. imports — @/ 절대경로 필수
import { useState } from 'react';
import { DataTable, Button } from '@/components/ui';
import { useProducts } from '@/hooks';
import type { Product } from '@/types';

// 2. 타입 정의 (페이지 내부용)
interface FilterState { ... }

// 3. 컴포넌트 (함수 선언)
export default function ProductList() {
  // hooks → state → handlers → return JSX
}
```

### 필수 패턴
- **API 호출**: 직접 fetch 금지 → `@/hooks`의 커스텀 훅 사용
- **상태관리**: 로컬 state 우선, 전역 필요 시 `@/stores` (zustand)
- **폼 유효성**: 저장 전 필수값 체크 → `showAlert()` 또는 Toast
- **숫자 입력**: `<Input type="number">` 사용 시 초기값은 실제 number 타입 (0, 1 등). `'' as unknown as number` 금지
- **에러 처리**: try-catch + Toast 알림
- **로딩 상태**: `<Spinner />` 또는 `<PageLoader />` 표시

### 금지 사항
- `any` 타입 사용 금지
- 상대경로 import 금지 (`../` 대신 `@/`)
- 페이지 컴포넌트 내 직접 API fetch 금지
- inline style 금지 → CSS class 또는 Tailwind 사용
- `console.log` 커밋 금지

## 할인/쿠폰/포인트 정책
- 모든 할인은 상호 배타적 (할인+쿠폰 ❌, 할인+포인트 ❌, 쿠폰+포인트 ❌)
- 할인 자동적용 우선순위: 할인 금액이 가장 작은 것 우선 (본사 비용 최소화)
- 고객 쿠폰 UI: 상품 품절/변경 시 UI 변경 없음 → 주문 시점에 서버 검증
- 에러코드: `DISCOUNT_COUPON_CONFLICT`, `DISCOUNT_POINT_CONFLICT`
