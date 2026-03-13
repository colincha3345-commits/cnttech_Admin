# 컴포넌트 개발 규칙

## 디렉토리 구조
```
components/
├── ui/          # 범용 UI 컴포넌트 (Input, Button, Modal, DataTable 등)
├── auth/        # 인증 관련 (ProtectedRoute 등)
├── layout/      # 레이아웃 (Sidebar, Header, MainLayout 등)
└── dev/         # 개발용 컴포넌트
```

## UI 컴포넌트 (`components/ui/`)

### 핵심 컴포넌트
| 컴포넌트 | 용도 |
|----------|------|
| Input | 텍스트/숫자 입력. number 타입 클릭 시 전체선택, 스피너 숨김 |
| InputGroup | Input + 접두사/접미사 래핑 |
| Select | 드롭다운 선택 |
| Button | 버튼 (variant: primary/secondary/ghost/danger) |
| Modal | 모달 다이얼로그 |
| ConfirmDialog | 확인/취소 다이얼로그 |
| DataTable | 테이블 (정렬, 필터, 페이지네이션) |
| Toast / ToastContainer | 알림 토스트 |
| Badge | 상태 뱃지 |
| Card | 카드 래퍼 |
| Pagination | 페이지네이션 |
| SearchInput | 검색 입력 (디바운스 내장) |
| ImageUpload / MultiImageUpload | 이미지 업로드 |
| DateTimePicker / DateRangeFilter | 날짜/기간 선택 |
| RichTextEditor | 리치 텍스트 에디터 |
| Spinner / PageLoader | 로딩 표시 |

### 작성 규칙
- `forwardRef` 패턴으로 ref 전달 지원
- `displayName` 설정 필수
- props interface 명시 (HTMLAttributes 확장)
- `clsx`로 className 조합
- CSS: `globals.css` 클래스 기반 (`.form-input`, `.form-label` 등)

### Input 컴포넌트 규칙
```tsx
// ✅ 올바른 사용
<Input type="number" value={formData.price} onChange={...} />
// 초기값: price: 0 (실제 number)

// ❌ 금지
value={formData.price || ''}        // 0이 falsy로 처리됨
price: '' as unknown as number      // 타입 위반
```
- `type="number"` 클릭 시 `select()` 자동 호출 (전체선택)
- `disableSelectOnClick` prop으로 개별 비활성화 가능
- 숫자 스피너(화살표) CSS로 숨김 처리됨

### 컴포넌트 작성 템플릿
```tsx
import { forwardRef, type ComponentHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface MyComponentProps extends ComponentHTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary';
}

export const MyComponent = forwardRef<HTMLDivElement, MyComponentProps>(
  ({ variant = 'primary', className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('base-class', variant, className)} {...props}>
        {children}
      </div>
    );
  }
);
MyComponent.displayName = 'MyComponent';
```

## 금지 사항
- `any` 타입 금지
- 상대경로 import 금지 → `@/` 절대경로
- 컴포넌트 내 API 호출 금지 (ui/ 컴포넌트는 순수 표현 계층)
- inline style 금지
- 비즈니스 로직 포함 금지 → props/callback으로 위임
