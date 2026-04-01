---
name: deploy
description: "배포 관련 파일 변경 시 자동 배포 전 체크리스트 실행"
---

# 배포 체크

## 트리거 조건
다음 파일 변경 시 자동 실행:
- `vercel.json`
- `package.json`
- `vite.config.ts`
- `tsconfig.json`

## 점검 항목

### 빌드 검증
- [ ] `npx tsc --noEmit` 타입 에러 없음
- [ ] `npm run build` 빌드 성공
- [ ] `npm run lint` 린트 통과

### 보안 점검
- [ ] `.env` 변수가 코드에 직접 노출 안 됨
- [ ] `console.log` / `debugger` 문 잔존 없음
- [ ] 하드코딩된 API URL/키 없음

### 설정 검증
- [ ] `vercel.json`에 SPA rewrites 설정 존재
- [ ] `package.json` 의존성 변경 시 lock 파일 동기화
- [ ] 환경변수 추가 시 Vercel 프로젝트 설정에도 반영 필요 여부 확인
