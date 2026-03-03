# Admin Dashboard 기획문서

CNTTECH 관리자 대시보드의 페이지별 기획문서입니다.

---

## 📚 문서 목록

### 1. [로그인 페이지](./login.md)
**경로**: `/login`
**주요 기능**:
- 이메일 + 비밀번호 기반 인증
- 2단계 인증 (MFA)
- 계정 잠금 시스템
- 로그인 시도 제한

**핵심 보안**:
- Rate Limiting (5회/15분)
- OTP 인증
- 비밀번호 정책 검증

---

### 2. [대시보드 페이지](./dashboard.md)
**경로**: `/dashboard`
**주요 기능**:
- 핵심 지표 모니터링 (매출, 주문, 회원)
- 매출/회원/문의 현황
- 주문 상세 분석 (탭 기반 필터)
- 일별 매출 트렌드

**시각화**:
- StatCard (4개 핵심 지표)
- 바 차트 (주문 상세, 일별 매출)

---

### 3. [사용자 관리 페이지](./users.md)
**경로**: `/users`
**주요 기능**:
- 사용자 목록 조회 및 검색
- 개인정보 마스킹/언마스킹
- 사용자 추가 (단일/일괄/CSV)
- 역할 기반 권한 관리 (RBAC)

**핵심 보안**:
- 자동 마스킹 (연락처, 이메일)
- 언마스킹 감사 로그
- 역할 기반 접근 제어

---

### 4. [설정 페이지](./settings.md)
**경로**: `/settings`
**주요 기능**:
- 시스템 설정 관리
- FAQ (아코디언 컴포넌트)
- 일반/보안/알림 설정
- 컴포넌트 문서

**특징**:
- Accordion 컴포넌트 데모
- WAI-ARIA 접근성 준수

---

### 5. [카테고리 관리 페이지](./categories.md)
**경로**: `/menu/categories`
**주요 기능**:
- 카테고리 계층 구조 (1depth/2depth)
- CRUD 기능 (생성, 조회, 수정, 삭제)
- 트리 구조 시각화
- 실시간 프리뷰

**특징**:
- 드래그 앤 드롭 정렬 (향후)
- 노출/숨김 토글
- 표시 순서 관리

---

### 6. [메뉴 관리 페이지](./products.md)
**경로**: `/menu/products`
**주요 기능**:
- 메뉴 등록 및 관리 (이름, 가격, 이미지, 설명)
- 가맹점 적용 관리 (전체/선택)
- 포스 코드 연동
- 옵션 그룹 적용
- 멀티 카테고리 설정

**핵심 기능**:
- 판매 상태 관리 (판매중/중지/대기)
- 게시 예약 스케줄링
- 결제 정책 설정 (쿠폰/교환권/금액권)
- 상세 정보 (원산지/영양정보/알레르기)

---

### 7. [옵션 카테고리 관리 페이지](./option-categories.md)
**경로**: `/menu/option-categories`
**주요 기능**:
- 옵션 카테고리 CRUD (이름, 이미지, POS 코드)
- 가격 및 노출 상태 관리
- 2컬럼 레이아웃 (목록 + 폼)

---

### 8. [옵션 그룹 관리 페이지](./option-groups.md)
**경로**: `/menu/option-groups`
**주요 기능**:
- 옵션 그룹 생성/수정/삭제
- 그룹 내 아이템 관리 (옵션/상품)
- 가격 유형 (원가/재설정/차액), 선택 규칙 (필수/선택, 최소/최대)

---

### 9. [할인 관리 페이지](./discounts.md)
**경로**: `/marketing/discounts`
**주요 기능**:
- 할인 CRUD (본사할인/가맹점할인)
- 할인 방식 (정률/정액), 기간 설정
- 대상 매장/상품 지정
- 2컬럼 레이아웃 (목록 + 폼)

---

### 10. [쿠폰 관리 페이지](./coupons.md)
**경로**: `/marketing/coupons`
**주요 기능**:
- 5가지 발급 유형 (다운로드/자동발급/조건부/코드입력/관리자)
- 할인 유형 (정률/정액/무료배송)
- 랜덤 코드 생성, 정산 비율 설정
- 적용 범위 (전체/카테고리/상품)

---

### 11. [캠페인 관리 페이지](./benefit-campaigns.md)
**경로**: `/marketing/campaigns`
**주요 기능**:
- 8가지 트리거 (주문/가입/멤버십/생일/추천/추천코드/수기업로드/난수발행쿠폰)
- 혜택 유형 (쿠폰 지급 + 포인트 적립)
- 캠페인 기간/상태 관리
- 통계 (총 지급 건수, 총 수혜자)

---

### 12. [앱 회원 관리 페이지](./app-members.md)
**경로**: `/app-members/list`, `/app-members/:id`
**주요 기능**:
- 회원 목록 (전체/90일 미접속/미주문)
- 등급/상태 필터, 검색 기능
- 회원 상세 7탭 (정보/이용내역/주문/포인트/쿠폰/교환권/알림)
- 개인정보 마스킹/언마스킹

---

### 13. [회원 데이터 추출 페이지](./member-extract.md)
**경로**: `/app-members/extract`
**주요 기능**:
- 4단계 세그먼트 필터 (기본/주문/마케팅/고급)
- 추출 컬럼 선택 (필수/선택)
- 직접 다운로드 또는 그룹 저장
- 실시간 결과 미리보기

---

### 14. [회원 그룹 관리 페이지](./member-groups.md)
**경로**: `/app-members/groups`, `/app-members/groups/:id`
**주요 기능**:
- 회원 그룹 CRUD (이름, 설명)
- 그룹 내 회원 관리 (추가/제거)
- 다중 선택 일괄 삭제
- 검색 및 페이지네이션

---

### 15. [직원 관리 페이지](./staff.md)
**경로**: `/staff/headquarters`, `/staff/franchise`
**주요 기능**:
- 본사/가맹점 직원 관리 (탭 분리)
- 직원 등록/수정/삭제 (StaffFormModal)
- 팀/매장별 필터, 상태 관리

---

### 16. [팀 관리 페이지](./teams.md)
**경로**: `/staff/teams`
**주요 기능**:
- 팀 CRUD (카드 그리드 레이아웃)
- TeamFormModal (이름, 설명, 권한)
- 팀원 수 표시, 검색 기능

---

### 17. [계정 승인 관리 페이지](./staff-approvals.md)
**경로**: `/staff/approvals`
**주요 기능**:
- 가입 승인 대기 목록
- 승인/반려 처리 (반려 사유 입력)
- 직원 유형별 필터 (본사/가맹점)

---

### 18. [매장 관리 페이지](./stores.md)
**경로**: `/stores`, `/stores/:id`, `/stores/new`, `/stores/:id/edit`
**주요 기능**:
- 매장 목록 (지역/상태/계약 필터)
- 매장 상세 9탭 (기본/대표자/사업자/계약/정산/운영/연동/결제/직원)
- 매장 등록/수정 (사업자번호 검증)
- POS/PG 일괄 업로드

---

### 19. [초대 수락 페이지](./accept-invitation.md)
**경로**: `/accept-invitation`
**주요 기능**:
- 초대 토큰 검증
- 비밀번호 설정 (강도 표시)
- 공개 라우트 (인증 불필요)

---

### 20. [주문 관리 페이지](./orders.md)
**경로**: `/orders`
**주요 기능**:
- 주문 목록 조회 (상태/기간/채널 필터)
- 주문 상세 정보 (3탭: 기본/결제/배송)
- 주문 상태 변경 (접수→준비→완료→취소)
- 환불/부분환불 처리

---

### 21. [이벤트 관리 페이지](./events.md)
**경로**: `/events`
**주요 기능**:
- 2가지 이벤트 유형 (일반/참여)
- 3탭 폼 (기본정보/공유설정/참여자설정)
- 참여자 수집 (자동수집/입력수집)
- 이벤트 통계 (조회수/방문자/클릭/공유)

---

### 22. [권한 관리 페이지](./permissions.md)
**경로**: `/permissions`
**주요 기능**:
- 10개 관리 메뉴 권한 설정
- 3단계 접근 레벨 (조회/편집/마스킹해제)
- 아코디언 UI 기반 계정별 권한 편집
- Indeterminate 체크박스 (부분 선택)

---

### 23. [포인트 설정 페이지](./point-settings.md)
**경로**: `/marketing/points`
**주요 기능**:
- 적립 정책 (고정/비율, 최소주문금액)
- 사용 정책 (최소사용/최대사용비율)
- 만료 정책 (만료일수/자동만료)
- 포인트 이력 테이블 (페이지네이션)

---

### 24. [회원 등급 관리 페이지](./grade-management.md)
**경로**: `/app-members/grades`
**주요 기능**:
- 등급 CRUD (이름, 색상, 아이콘)
- 드래그 앤 드롭 순서 변경 (@dnd-kit)
- 달성 조건 (기간별 주문/금액/방문)
- 등급 혜택 (포인트 배율, 쿠폰, 배송비)

---

## 🎨 디자인 시스템

### 애플 스타일
- **컬러**: 블랙, 다크 그레이, 그레이, 실버 계열
- **타이포그래피**: Inter Variable, Pretendard Variable
- **그림자**: 매우 미묘한 shadow (Apple Style)
- **애니메이션**: fadeIn, slideUp (cubic-bezier)

### 주요 컴포넌트
- `Button` - 11가지 variant
- `Card` - Glassmorphism 효과
- `Input`, `Textarea`, `Select`
- `Badge`, `Switch`, `Accordion`
- `DataTable`, `MaskedData`
- `Alert`, `Spinner`

---

## 🔐 보안 아키텍처

### 4계층 보안 전략
1. **L1 - 인증 (Authentication)**
   - 비밀번호 복잡도 검증
   - 로그인 시도 제한
   - MFA (이메일 OTP)

2. **L2 - 세션 관리 (Session)**
   - JWT 토큰 기반
   - Refresh Token 자동 갱신
   - 세션 타임아웃 (30분)

3. **L3 - 권한 관리 (Authorization)**
   - 역할 기반 접근 제어 (RBAC)
   - 리소스별 권한 검증
   - PermissionGate 컴포넌트

4. **L4 - 감사 로그 (Audit)**
   - 모든 민감한 작업 기록
   - 마스킹 해제 이력
   - 타임스탬프, IP, User Agent

---

## 🛠️ 기술 스택

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **State**: Zustand (+ persist)
- **Styling**: Tailwind CSS
- **Icons**: Ant Design Icons

### 개발 환경
- **Build**: Vite
- **Package Manager**: npm
- **Linting**: ESLint + Prettier

### API (Mock)
- authService
- dashboardService
- userService
- auditService
- discountService
- couponService
- benefitCampaignService
- appMemberService
- memberGroupService
- staffService
- teamService
- storeService
- orderService
- eventService
- permissionService
- pointSettingsService
- membershipGradeService

---

## 📂 프로젝트 구조

```
src/
├── components/       # UI 컴포넌트
│   ├── auth/        # 인증 관련
│   ├── layout/      # 레이아웃
│   └── ui/          # 재사용 UI
├── pages/           # 페이지 컴포넌트
│   ├── Login/
│   ├── Dashboard/
│   ├── Users/
│   ├── Settings/
│   ├── Menu/           # 카테고리, 메뉴, 옵션 카테고리, 옵션 그룹
│   ├── Marketing/      # 할인, 쿠폰, 캠페인, 포인트 설정
│   ├── AppMembers/     # 앱 회원, 데이터 추출, 회원 그룹, 등급 관리
│   ├── Staff/          # 본사/가맹점 직원, 팀, 계정 승인
│   ├── Store/          # 매장 목록, 상세, 등록/수정
│   ├── events/         # 이벤트 관리
│   ├── orders/         # 주문 관리
│   ├── permissions/     # 권한 관리
│   └── Invitation/     # 초대 수락
├── stores/          # Zustand 스토어
├── services/        # API 서비스
├── hooks/           # Custom Hooks
├── types/           # TypeScript 타입
├── constants/       # 상수
├── utils/           # 유틸리티
└── styles/          # 글로벌 스타일
```

---

## 🚀 시작하기

### 설치
```bash
npm install
```

### 개발 서버
```bash
npm run dev
# http://localhost:3000
```

### 빌드
```bash
npm run build
```

---

## 🧪 테스트 계정

### Admin (MFA 활성화)
```
이메일: admin@cnttech.co.kr
비밀번호: Admin123!
OTP: 콘솔 확인
```

### Manager (MFA 비활성화)
```
이메일: manager@cnttech.co.kr
비밀번호: Manager123!
```

### Viewer (MFA 비활성화)
```
이메일: viewer@cnttech.co.kr
비밀번호: Viewer123!
```

---

## 📌 페이지별 권한 매트릭스

| 페이지 | Admin | Manager | Viewer |
| --- | --- | --- | --- |
| Login | ✅ | ✅ | ✅ |
| Dashboard | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ❌ |
| Settings | ✅ | ⚠️ 일부 | ✅ |
| Categories | ✅ | ✅ | ✅ |
| Products (Menu) | ✅ | ✅ | ✅ |
| Option Categories | ✅ | ✅ | ✅ |
| Option Groups | ✅ | ✅ | ✅ |
| Discounts | ✅ | ✅ | ❌ |
| Coupons | ✅ | ✅ | ❌ |
| Campaigns | ✅ | ✅ | ❌ |
| App Members | ✅ | ✅ | ⚠️ 읽기만 |
| Member Extract | ✅ | ✅ | ❌ |
| Member Groups | ✅ | ✅ | ⚠️ 읽기만 |
| Staff (HQ) | ✅ | ✅ | ❌ |
| Staff (Franchise) | ✅ | ✅ | ❌ |
| Teams | ✅ | ✅ | ❌ |
| Staff Approvals | ✅ | ❌ | ❌ |
| Stores | ✅ | ✅ | ⚠️ 읽기만 |
| Orders | ✅ | ✅ | ⚠️ 읽기만 |
| Events | ✅ | ✅ | ❌ |
| Permissions | ✅ | ❌ | ❌ |
| Point Settings | ✅ | ✅ | ❌ |
| Grade Management | ✅ | ✅ | ❌ |
| Accept Invitation | ✅ | ✅ | ✅ |


---

## 🔄 개발 로드맵

### Phase 1 - 완료
- [x] 로그인 페이지 (MFA 포함)
- [x] 대시보드 페이지
- [x] 사용자 관리 페이지
- [x] 설정 페이지
- [x] 카테고리 관리 페이지

### Phase 2 - 완료
- [x] 메뉴 관리 페이지 (상품, 옵션 카테고리, 옵션 그룹)
- [x] 마케팅 관리 (할인, 쿠폰, 캠페인, 포인트 설정)
- [x] 앱 회원 관리 (회원 목록, 상세, 데이터 추출, 그룹, 등급 관리)
- [x] 직원 관리 (본사/가맹점 직원, 팀, 계정 승인)
- [x] 매장 관리 (목록, 상세, 등록/수정)
- [x] 초대 수락 페이지
- [x] 주문 관리 페이지
- [x] 이벤트 관리 페이지
- [x] 권한 관리 페이지

### Phase 3 - 진행 중
- [ ] 실제 API 연동
- [ ] 문의 관리 페이지

### Phase 4 - 계획
- [ ] 통계 대시보드 고도화
- [ ] 실시간 알림 시스템
- [ ] 데이터 Export 기능
- [ ] 모바일 앱 연동

---

## 📝 문서 작성 규칙

### 각 페이지 기획서에 포함되어야 할 항목
1. 📋 개요 (경로, 권한, 목적)
2. 🎯 주요 기능
3. 🖼️ 화면 구성
4. 🔄 사용자 플로우
5. 📦 데이터 구조
6. 🔌 API 엔드포인트
7. 🔒 보안 고려사항
8. 🎨 UI 컴포넌트
9. 📱 반응형 디자인
10. 🧪 테스트 시나리오
11. 📌 TODO

---

## 📞 문의

기획문서 관련 문의사항은 프로젝트 관리자에게 연락해주세요.

**작성일**: 2026-02-03
**최종 수정일**: 2026-02-20
**작성자**: Claude Code
