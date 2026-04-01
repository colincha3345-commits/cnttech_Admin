---
description: "Vercel 배포 전 체크리스트 실행 및 배포"
---

# 배포

## 1단계: 사전 점검
```bash
npx tsc --noEmit     # 타입 에러
npm run build        # 빌드 성공
npm run lint         # 린트 통과
```

## 2단계: 보안 점검
- [ ] `.env` 파일이 `.gitignore`에 포함
- [ ] 하드코딩된 API 키/비밀번호 없음
- [ ] 권한 관련 민감 데이터 노출 없음
- [ ] `console.log` / `debugger` 문 제거

## 3단계: Git 상태 확인
- [ ] 미커밋 변경사항 없음
- [ ] 현재 브랜치와 main 동기화

## 4단계: 배포
- Vercel 배포 상태 확인
- 필요 시 `vercel --prod` 실행

## 결과 보고
- 모든 항목 통과: "배포 준비 완료"
- 실패 항목: 문제점 + 해결 방법 제시
