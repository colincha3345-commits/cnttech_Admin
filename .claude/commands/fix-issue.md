---
description: "GitHub 이슈 기반 버그 수정 — 이슈 번호를 받아 분석 후 수정"
---

# 이슈 수정

## 인자
$ARGUMENTS = 이슈 번호 또는 버그 설명

## 실행 절차
1. **이슈 확인**: `gh issue view $ARGUMENTS` 로 내용 파악
2. **관련 파일 탐색**: 해당 도메인 폴더만 탐색 (pages/hooks/services/types)
3. **영향 범위 분석**:
   - 관련 페이지, 훅, 서비스, 타입 파일 목록
   - 연쇄 영향 있는 컴포넌트 식별
4. **수정 계획 수립**: 파일별 변경 내용 요약
5. **사용자 확인 후 구현**

## 주의사항
- 기획에 없는 해석 금지
- 수정 범위 3개 파일 초과 시 사용자에게 범위 확인
- Mock 데이터 수정 시 `src/lib/api/mock*.ts`만 수정
- 수정 완료 후 `npx tsc --noEmit` + `npm run build` 검증
