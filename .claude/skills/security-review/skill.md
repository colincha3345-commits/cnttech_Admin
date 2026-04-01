---
name: security-review
description: "권한/인증/민감데이터 관련 파일 변경 시 자동 보안 점검"
---

# 보안 리뷰

## 트리거 조건
다음 파일 변경 시 자동 실행:
- `src/stores/authStore.ts`
- `src/pages/Permissions/**`
- `src/hooks/usePermission*`
- `src/services/authService.ts`
- `src/services/permissionService.ts`
- `src/types/permission*`
- `src/types/auth.ts`
- `src/utils/permissionChecker.ts`
- `.env*`

## 점검 항목

### 인증 (Authentication)
- [ ] 토큰이 하드코딩/console.log로 노출되지 않는지
- [ ] 로그인/로그아웃 시 상태 완전 초기화
- [ ] 토큰 만료 처리 로직 존재
- [ ] 보호된 라우트 설정 확인

### 권한 (Authorization)
- [ ] 15메뉴 × 4권한(view/write/masking/download) 매트릭스 무결성
- [ ] view 권한 없는 메뉴는 라우터 레벨에서 차단
- [ ] write 권한 없으면 CUD 버튼 비활성화
- [ ] masking 권한 시 개인정보 마스킹 적용
- [ ] download 권한 없으면 엑셀/PDF 다운로드 차단

### 데이터 보호
- [ ] 개인정보(이름, 연락처, 이메일) 마스킹 처리
- [ ] API 키/시크릿 하드코딩 없음
- [ ] `.env` 파일 gitignore 포함
- [ ] 브라우저 콘솔에 민감 데이터 출력 없음

### 프론트엔드 보안
- [ ] `dangerouslySetInnerHTML` 사용 시 sanitize 적용
- [ ] 외부 입력값 XSS 방지 검증
- [ ] TinyMCE 에디터 입력 sanitize 확인
