# 테스트 규칙

## 환경 설정 (미구성 — 도입 시 아래 절차 수행)
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```
`vite.config.ts`에 추가:
```typescript
/// <reference types="vitest" />
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});
```

## 디렉토리 구조
```
src/tests/
├── CLAUDE.md          # 이 파일
├── setup.ts           # 테스트 환경 초기화
├── unit/              # 유닛 테스트
│   ├── services/      # 서비스 레이어 테스트
│   ├── hooks/         # 커스텀 훅 테스트
│   └── utils/         # 유틸 함수 테스트
├── components/        # 컴포넌트 테스트
│   ├── ui/            # UI 컴포넌트 렌더링/인터랙션
│   └── pages/         # 페이지 통합 테스트
└── e2e/               # E2E 테스트 (추후)
```

## 파일 네이밍
- `{대상파일명}.test.ts(x)` (예: `orderService.test.ts`, `Input.test.tsx`)

## 테스트 작성 규칙

### 유닛 테스트 (서비스/유틸)
```typescript
import { describe, it, expect, vi } from 'vitest';
import { orderService } from '@/services/orderService';

describe('OrderService', () => {
  describe('getOrders', () => {
    it('필터 조건에 맞는 주문만 반환한다', async () => {
      const result = await orderService.getOrders({ status: 'completed' });
      expect(result.data.every(o => o.status === 'completed')).toBe(true);
    });

    it('페이지네이션이 올바르게 동작한다', async () => {
      const result = await orderService.getOrders({ page: 1, limit: 10 });
      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.pagination.page).toBe(1);
    });
  });
});
```

### 컴포넌트 테스트
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  it('type=number 클릭 시 전체선택된다', () => {
    render(<Input type="number" value={100} onChange={() => {}} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.click(input);
    // select 호출 검증
  });

  it('에러 상태에서 에러 메시지를 표시한다', () => {
    render(<Input error="필수 항목입니다" />);
    expect(screen.getByRole('alert')).toHaveTextContent('필수 항목입니다');
  });
});
```

### 폼 유효성 테스트 (필수)
각 페이지 폼에 대해 최소 검증:
- 필수값 미입력 시 에러 표시
- 범위 초과 입력 시 에러 표시
- 정상 입력 시 저장 성공
- 숫자 필드: 0, 음수, 최대값 경계 테스트

## 우선순위
1. **서비스 레이어**: 비즈니스 로직 검증 (할인 정책, 주문 상태 전이, 인증 잠금)
2. **유효성 검사**: 폼 필수값/범위 체크
3. **UI 컴포넌트**: Input, DataTable, Modal 인터랙션
4. **페이지 통합**: 주요 워크플로우 (주문 처리, 상품 등록)

## 금지 사항
- `any` 타입 금지
- 스냅샷 테스트 남용 금지 → 동작 기반 테스트 우선
- 구현 상세 테스트 금지 → 사용자 행동 기반 테스트
- mock 과다 사용 금지 → 서비스 레이어까지는 실제 로직 테스트
