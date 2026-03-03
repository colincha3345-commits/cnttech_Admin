# 컬러 시스템 가이드

> shadcn/ui 스타일을 참고한 디자인 시스템 컬러 가이드

## 현재 컬러 팔레트

### Primary Colors
```css
primary: #4F46E5 (Indigo-600)
primary-hover: #4338CA (Indigo-700)
primary-light: rgba(79, 70, 229, 0.1)
```

### Semantic Colors
```css
success: #10B981 (Emerald-500)
warning: #F59E0B (Amber-500)
critical: #E11D48 (Rose-600)
info: #0EA5E9 (Sky-500)
```

### Background Colors
```css
bg-main: #F8FAFC (Slate-50)
bg-card: #FFFFFF (White)
bg-hover: #F1F5F9 (Slate-100)
bg-disabled: #F1F5F9 (Slate-100)
```

### Text Colors
```css
txt-main: #0F172A (Slate-900)
txt-muted: #64748B (Slate-500)
txt-disabled: #94A3B8 (Slate-400)
txt-inverse: #FFFFFF (White)
```

### Border Colors
```css
border: #E2E8F0 (Slate-200)
border-focus: #4F46E5 (Primary)
border-error: #E11D48 (Critical)
```

---

## shadcn/ui 스타일 확장 (선택사항)

### 옵션 1: CSS 변수 기반 (다크모드 지원)

`src/index.css`에 추가:

```css
@layer base {
  :root {
    /* Primary */
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;

    /* Background */
    --background: 0 0% 100%;
    --foreground: 222 84% 5%;

    /* Card */
    --card: 0 0% 100%;
    --card-foreground: 222 84% 5%;

    /* Muted */
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;

    /* Border */
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 239 84% 67%;
  }

  .dark {
    /* Primary */
    --primary: 239 84% 67%;
    --primary-foreground: 0 0% 100%;

    /* Background */
    --background: 222 84% 5%;
    --foreground: 210 40% 98%;

    /* Card */
    --card: 222 84% 5%;
    --card-foreground: 210 40% 98%;

    /* Muted */
    --muted: 217 33% 17%;
    --muted-foreground: 215 20% 65%;

    /* Border */
    --border: 217 33% 17%;
    --input: 217 33% 17%;
    --ring: 239 84% 67%;
  }
}
```

`tailwind.config.js` 수정:

```javascript
colors: {
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
  background: 'hsl(var(--background))',
  foreground: 'hsl(var(--foreground))',
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  // ... 기존 컬러 유지
}
```

### 옵션 2: 확장된 컬러 스케일

더 세밀한 컬러 변형이 필요한 경우:

```javascript
colors: {
  primary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',  // 현재 DEFAULT
    700: '#4338CA',  // 현재 hover
    800: '#3730A3',
    900: '#312E81',
    950: '#1E1B4B',
  },
}
```

---

## 사용 예제

### 현재 방식 (유지)
```tsx
<div className="bg-bg-main text-txt-main border border-border">
  <button className="bg-primary hover:bg-primary-hover">
    Click me
  </button>
</div>
```

### CSS 변수 방식 (옵션)
```tsx
<div className="bg-background text-foreground border">
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Click me
  </button>
</div>
```

---

## 컬러 사용 가이드라인

### 1. 의미론적 사용
- `primary`: 주요 액션 (버튼, 링크)
- `success`: 성공 메시지, 완료 상태
- `warning`: 주의 메시지, 경고
- `critical`: 오류, 삭제 등 위험한 액션
- `info`: 정보성 메시지

### 2. 접근성
- 텍스트와 배경 간 최소 4.5:1 명암비 유지
- `txt-muted`는 부가 정보에만 사용 (본문 텍스트 X)

### 3. 일관성
- 같은 의미의 요소는 같은 컬러 사용
- hover/active 상태는 기본 컬러의 darker 버전 사용

---

## 참고 자료
- [shadcn/ui Colors](https://ui.shadcn.com/docs/theming)
- [Tailwind CSS Colors](https://tailwindcss.com/docs/customizing-colors)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
