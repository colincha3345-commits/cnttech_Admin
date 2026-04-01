---
description: "코드 리뷰 — 현재 변경사항에 대한 코드 품질 점검"
---

# 코드 리뷰

## 실행 절차
1. `git diff --staged` 또는 `git diff`로 변경사항 확인
2. 인자가 있으면 해당 파일만 점검: $ARGUMENTS
3. 아래 체크리스트 기반 점검 수행

## 체크리스트
- [ ] Clean Architecture 준수: Page → Hook → Service → API 흐름
- [ ] 컴포넌트에서 직접 fetch/API 호출 없음
- [ ] `any` 타입 사용 없음
- [ ] 하드코딩 값 없음 (`constants/` 사용)
- [ ] 네이밍 컨벤션 준수 (PascalCase/camelCase/UPPER_SNAKE_CASE/kebab-case)
- [ ] 에러 핸들링 존재
- [ ] 권한(permission) 관련 로직이 15메뉴×4권한 구조 준수
- [ ] Mock 데이터 구조가 REST API 교체 가능한 형태
- [ ] 중복 코드 2곳 이상 → 함수 추출 필요
- [ ] `@/` 절대 경로 사용

## 출력 형식
- 모든 항목 통과: "QA 통과" 한 줄
- 문제 발견: `파일:줄번호` + 문제 요약 + 수정 제안
