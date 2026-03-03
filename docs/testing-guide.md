# 테스트 가이드

## 테스트 환경 설정

### 1. 필수 패키지 설치

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

### 2. package.json 스크립트 추가

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### 3. 테스트 실행

```bash
# 일반 테스트
npm test

# UI 모드
npm run test:ui

# 커버리지 리포트
npm run test:coverage
```

## 테스트 작성 가이드

### 기본 구조

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

describe('컴포넌트명', () => {
  beforeEach(() => {
    // 각 테스트 전 실행
  });

  describe('기능 그룹', () => {
    it('테스트 케이스 설명', async () => {
      // Arrange (준비)
      const user = userEvent.setup();
      render(<Component />);

      // Act (실행)
      await user.click(screen.getByText('버튼'));

      // Assert (검증)
      expect(screen.getByText('결과')).toBeInTheDocument();
    });
  });
});
```

### 테스트 대상

#### 1. 컴포넌트 렌더링
```typescript
it('페이지 제목이 표시되어야 한다', () => {
  render(<Products />);
  expect(screen.getByText('메뉴 관리')).toBeInTheDocument();
});
```

#### 2. 사용자 상호작용
```typescript
it('버튼 클릭 시 동작해야 한다', async () => {
  const user = userEvent.setup();
  render(<Products />);

  await user.click(screen.getByText('메뉴 등록'));
  expect(screen.getByText('기본 정보')).toBeInTheDocument();
});
```

#### 3. 데이터 로딩
```typescript
it('데이터가 로드되어야 한다', async () => {
  render(<Products />);

  await waitFor(() => {
    expect(screen.getByText('테스트 메뉴')).toBeInTheDocument();
  });
});
```

#### 4. 폼 검증
```typescript
it('유효성 검사가 작동해야 한다', async () => {
  const user = userEvent.setup();
  render(<Products />);

  await user.click(screen.getByText('저장'));
  expect(screen.getByText('필수 항목입니다')).toBeInTheDocument();
});
```

## Mock 작성

### API Mock
```typescript
vi.mock('@/services/productService', () => ({
  productService: {
    getProducts: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));
```

### Hook Mock
```typescript
vi.mock('@/hooks/useProducts', () => ({
  useProducts: () => ({
    products: [],
    loading: false,
    error: null,
  }),
}));
```

## 테스트 커버리지 목표

| 항목 | 목표 |
| --- | --- |
| 전체 | 80% 이상 |
| 유틸리티 함수 | 90% 이상 |
| 컴포넌트 | 70% 이상 |
| Hooks | 80% 이상 |


## 우선순위

1. **High Priority**
   - 비즈니스 로직 (유효성 검사, 계산)
   - 중요 사용자 플로우 (로그인, 메뉴 등록)
   - 유틸리티 함수

2. **Medium Priority**
   - 컴포넌트 렌더링
   - 상태 관리
   - API 호출

3. **Low Priority**
   - UI 스타일링
   - 애니메이션
   - 정적 페이지

## 참고 자료

- [Vitest 공식 문서](https://vitest.dev/)
- [Testing Library 공식 문서](https://testing-library.com/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
