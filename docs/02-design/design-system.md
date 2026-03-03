# Admin Dashboard Design System

> 브랜드 주문 및 관리 Admin by Cnttech
>
> **Version**: 1.0.0
> **Date**: 2026-02-02
> **Architecture**: Glassmorphism + Soft Border

---

## 1. Color Palette

### Primary Colors

| 구분 | 컬러명 | Hex Code | CSS Variable | 용도 |
| --- | --- | --- | --- | --- |
| Primary | Electric Indigo | `#4F46E5` | `--primary` | 주요 액션 버튼, 활성 상태 |
| Secondary | Slate Gray | `#0F172A` | `--secondary` | 사이드바 배경, 헤더 텍스트 |
| Success | Emerald Green | `#10B981` | `--success` | 인증 성공, 권한 승인 |
| Warning | Amber Orange | `#F59E0B` | `--warning` | 마스킹 해제 시도, 일시 오류 |
| Critical | Rose Red | `#E11D48` | `--critical` | 미인가 접근, 보안 위반 |


### Background Colors

| 용도 | Light Mode | Dark Mode | CSS Variable |
| --- | --- | --- | --- |
| 메인 배경 | `#F8FAFC` | `#0F172A` | `--bg-main` |
| 카드/모달 | `#FFFFFF` | `#1E293B` | `--bg-card` |
| 인풋 필드 | `#FFFFFF` | `#334155` | `--bg-input` |
| 비활성화 | `#F1F5F9` | `#1E293B` | `--bg-disabled` |
| 호버 | `#F1F5F9` | `#334155` | `--bg-hover` |


### Text Colors

| 용도 | Light Mode | Dark Mode | CSS Variable |
| --- | --- | --- | --- |
| 본문 | `#0F172A` | `#F8FAFC` | `--text-main` |
| 부가 정보 | `#64748B` | `#94A3B8` | `--text-muted` |
| 비활성화 | `#94A3B8` | `#64748B` | `--text-disabled` |
| 반전 (버튼) | `#FFFFFF` | `#FFFFFF` | `--text-inverse` |


---

## 2. Typography

### Font Family

| 용도 | 폰트 | CSS Variable |
| --- | --- | --- |
| 본문 | Inter Variable, Pretendard Variable | `--font-sans` |
| 데이터/코드 | JetBrains Mono, Fira Code | `--font-mono` |


### Font Scale (Minor Third)

| Size | Rem | Pixel | CSS Variable | 용도 |
| --- | --- | --- | --- | --- |
| xs | 0.75rem | 12px | `--text-xs` | 캡션, 마스킹 레이블 |
| sm | 0.875rem | 14px | `--text-sm` | 일반 텍스트, 입력 필드 |
| base | 1rem | 16px | `--text-base` | 본문, 버튼 |
| lg | 1.125rem | 18px | `--text-lg` | 서브 섹션 타이틀 |
| xl | 1.25rem | 20px | `--text-xl` | 섹션 타이틀 |
| 2xl | 1.5rem | 24px | `--text-2xl` | 대시보드 요약 숫자 |


### Line Height & Letter Spacing

| 속성 | 값 | CSS Variable |
| --- | --- | --- |
| 행간 (tight) | 1.2 | `--leading-tight` |
| 행간 (normal) | 1.5 | `--leading-normal` |
| 자간 | -0.01em | `--tracking-tight` |


---

## 3. Spacing System

### Base Scale (4px)

| Token | Rem | Pixel | CSS Variable |
| --- | --- | --- | --- |
| s-1 | 0.25rem | 4px | `--s-1` |
| s-2 | 0.5rem | 8px | `--s-2` |
| s-3 | 0.75rem | 12px | `--s-3` |
| s-4 | 1rem | 16px | `--s-4` |
| s-6 | 1.5rem | 24px | `--s-6` |
| s-8 | 2rem | 32px | `--s-8` |
| s-12 | 3rem | 48px | `--s-12` |


### Semantic Spacing

| 용도 | 값 | CSS Variable |
| --- | --- | --- |
| 레이아웃 패딩 | 24px | `--layout-padding` |
| 카드 패딩 | 16px | `--card-padding` |
| 인풋 갭 | 8px | `--input-gap` |
| 섹션 갭 | 32px | `--section-gap` |


---

## 4. Components

### 4.1 Card (Glassmorphism)

```css
.admin-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: var(--card-padding);
}
```

**Dark Mode:**
```css
.admin-card {
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

### 4.2 Buttons

| Class | 용도 | 스타일 |
| --- | --- | --- |
| `.btn-primary` | 중요 액션 (승인, 저장) | Electric Indigo 배경 |
| `.btn-secondary` | 보조 액션 (취소, 닫기) | 회색 배경 + 테두리 |
| `.btn-ghost` | 최소 강조 (더보기) | 투명 배경 |
| `.btn-danger` | 위험 액션 (삭제, 잠금) | Rose Red 배경 |
| `.btn-success` | 성공 액션 (활성화) | Emerald 배경 |
| `.btn-unmask` | 마스킹 해제 | Warning 아웃라인 |
| `.btn-icon` | 아이콘 전용 | 40x40 정사각형 |


**사용법:**
```html
<button class="btn-base btn-primary">저장</button>
<button class="btn-base btn-secondary">취소</button>
<button class="btn-base btn-danger">삭제</button>
```

### 4.3 Form Inputs

| Class | 상태 |
| --- | --- |
| `.form-input` | 기본 상태 |
| `.form-input:focus` | 포커스 (Electric Indigo 테두리) |
| `.form-input:read-only` | 읽기 전용 |
| `.form-input:disabled` | 비활성화 |
| `.form-input.error` | 에러 상태 |
| `.form-input.success` | 성공 상태 |


**사용법:**
```html
<div class="form-group">
  <label class="form-label">이메일</label>
  <input type="email" class="form-input" placeholder="example@email.com">
  <span class="form-error">유효하지 않은 이메일입니다.</span>
</div>
```

### 4.4 Masked Data (Security)

```html
<span class="masked-data">010-****-1234</span>
```

- 기본: 4px 블러 처리
- 호버 시: 블러 해제
- `.revealed` 클래스 추가 시: 블러 해제

### 4.5 Badges

| Class | 용도 |
| --- | --- |
| `.badge-success` | 성공/활성 상태 |
| `.badge-warning` | 경고/대기 상태 |
| `.badge-critical` | 오류/위험 상태 |
| `.badge-info` | 정보/기본 상태 |


**사용법:**
```html
<span class="badge badge-success">승인됨</span>
<span class="badge badge-critical">잠금</span>
```

### 4.6 Data Table

**Desktop:** 기본 테이블
**Tablet/Mobile:** 카드 형태로 변환

```html
| 이름 | 이메일 | 상태 |
| --- | --- | --- |
| 홍길동 | hong@example.com | <span class="badge badge-success">활성</span> |

```

---

## 5. Layout

### Admin Container

```html
<div class="admin-container">
  <aside class="admin-sidebar"><!-- 사이드바 --></aside>
  <main class="admin-main">
    <div class="admin-grid">
      <div class="admin-card"><!-- 카드 1 --></div>
      <div class="admin-card"><!-- 카드 2 --></div>
    </div>
  </main>
</div>
```

### Grid System

- `admin-grid`: Auto-fit 그리드 (min 300px)
- Gap: `--section-gap` (32px)

---

## 6. Responsive Breakpoints

| Breakpoint | Width | 변경사항 |
| --- | --- | --- |
| Desktop | > 1024px | 기본 레이아웃 |
| Tablet | ≤ 1024px | 세로 배치, 테이블 카드화 |
| Mobile | ≤ 768px | 사이드바 드로어, 풀와이드 버튼 |


---

## 7. Dark Mode

시스템 설정 자동 감지: `prefers-color-scheme: dark`

수동 토글 시 `:root` 클래스 변경:
```javascript
document.documentElement.classList.toggle('dark');
```

---

## 8. File Structure

```
src/styles/
└── globals.css     # 전체 디자인 시스템 통합

docs/02-design/
└── design-system.md  # 이 문서
```

---

## 9. Usage Examples

### Full Page Layout

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <link rel="stylesheet" href="/src/styles/globals.css">
</head>
<body>
  <div class="admin-container">
    <aside class="admin-sidebar">
      <nav><!-- 네비게이션 --></nav>
    </aside>
    <main class="admin-main">
      <div class="admin-grid">
        <div class="admin-card">
          <h2>사용자 정보</h2>
          <p class="masked-data">010-1234-5678</p>
          <button class="btn-base btn-unmask">마스킹 해제</button>
        </div>
      </div>
    </main>
  </div>
</body>
</html>
```

---

## Version History

| Version | Date | Changes |
| --- | --- | --- |
| 1.0.0 | 2026-02-02 | 초기 버전 |
