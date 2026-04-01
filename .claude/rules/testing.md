# 테스트 및 QA 규칙

## 경량 QA 절차
1. **터미널 결과 의존**: 파일 수정 후 `npm run build` 에러 로그만 보고 직접 수정 (원본 파일 통째 분석 지양)
2. **핵심 검증**: Entity ↔ Form 매핑, 필수 유효성 체크, Toast 처리 등 필수 로직만 단건 확인
3. **QA 결과 출력**: 버그 발견 시 "버그: [내용]", 통과 시 "QA 통과" 한 줄만 출력

## 빌드 검증 명령
```bash
npx tsc --noEmit     # 타입 체크
npm run build        # 번들 빌드
npm run lint         # ESLint 검증
```

## Mock 데이터 검증
- Mock 응답 구조가 실제 API 스펙(`docs/spec_*.md`)과 일치하는지 확인
- Mock 파일 위치: `src/lib/api/mock*.ts`
- 새 Mock 추가 시 반드시 타입(`src/types/`) 먼저 정의
- Mock → REST 전환 시 서비스 레이어만 수정하도록 설계

## 검증 우선순위
1. 타입 에러 (tsc)
2. 빌드 에러 (vite)
3. 린트 경고/에러 (eslint)
4. 런타임 동작 (브라우저 확인)
