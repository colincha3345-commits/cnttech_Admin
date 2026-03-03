# Progress

## 프로젝트 개요

- **프레임워크**: React + TypeScript + Vite
- **상태관리**: Zustand (auth), TanStack Query (서버 상태)
- **스타일**: Tailwind CSS + 커스텀 디자인 토큰 (globals.css)
- **아키텍처**: Clean Architecture (Pages → Hooks → Services → API Client)
- **인증**: 이메일/비밀번호 + MFA(이메일 인증) + 계정 잠금 + 세션 타임아웃
- **권한**: RBAC (admin/manager/viewer) + 리소스별 read/write 접근 제어
- **데이터**: Mock 서비스 기반 (실제 API 연동 준비 완료)

---

## 카테고리별 기능 현황

### 1. Dashboard (대시보드)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 운영 현황 (StatCard ×4, InfoCard ×3) | ✅ | Dashboard.tsx |
| 기간 필터 (어제/오늘/최근7일/전월/기간선택) | ✅ | DateRangeFilter.tsx |
| 엑셀 다운로드 (3시트: 매출/운영요약/마케팅성과) | ✅ | excel.ts |
| 주문 상세 차트 (원형) | ✅ | OrderDetailsChart.tsx |
| 일별 매출 차트 (막대) | ✅ | DailySalesChart.tsx |
| 마케팅 성과 분석 (배너/이벤트 CTR, 전환율, 유입경로, 체류시간) | ✅ | MarketingPerformance.tsx |
| 최근 로그인 이력 (auditService 연동) | ✅ | RecentLogins.tsx |
| 회원 분석 (가입/탈퇴/활성/휴면/성별/연령/멤버십/TOP고객) | ✅ | MemberAnalytics.tsx |
| GA4 통계 현황 (사용자/세션/페이지뷰/이탈률) | ✅ | GA4Statistics.tsx |
| GA4 디바이스 상세 (디바이스/브라우저/OS/해상도 탭) | ✅ | GA4DeviceDetail.tsx |
| GA4 퍼널 상세 (퍼널/일별추이/이탈분석/TOP상품 탭) | ✅ | GA4FunnelDetail.tsx |


### 2. Menu (메뉴관리)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 상품 목록 (검색/필터/정렬/페이지네이션) | ✅ | Products.tsx |
| 상품 등록/수정 (슬라이드 패널, 이미지 업로드) | ✅ | Products.tsx |
| 상품 뱃지 연동 (badgeIds 필드, CSV import 포함) | ✅ | Products.tsx |
| 카테고리 설정 (1차/2차, 다중 카테고리 페어) | ✅ | Products.tsx |
| 드래그 앤 드롭 순서 변경 | ✅ | Products.tsx |
| 일괄 수정/삭제 | ✅ | Products.tsx |
| 입력필드 BR태그 지원 + min/max 제한 (메뉴명 50자, 가격 0~9,999,999, 설명 500자) | ✅ | Products.tsx |
| 카테고리 관리 (1차/2차, CRUD) | ✅ | Categories.tsx |
| 카테고리 입력필드 BR태그 지원 + min/max 제한 (이름 50자, 순서 1~999, 설명 200자) | ✅ | Categories.tsx |
| 옵션 카테고리 관리 | ✅ | OptionCategories.tsx |
| 옵션 입력필드 BR태그 지원 + min/max 제한 (옵션명 50자, 가격 0~9,999,999, 순서 1~999) | ✅ | OptionCategories.tsx |
| 옵션 그룹 관리 (옵션 항목 CRUD) | ✅ | OptionGroups.tsx |
| 그룹 입력필드 BR태그 지원 + min/max 제한 (그룹명 50자, 수량 0~99, 순서 1~999) | ✅ | OptionGroups.tsx |


### 3. Orders (주문관리)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 주문 목록 (검색/상태필터/날짜필터) | ✅ | OrderList.tsx |
| 주문 상세 (주문정보/결제/배송/타임라인) | ✅ | OrderDetail.tsx |
| 주문 상태 변경 | ✅ | OrderDetail.tsx |
| 엑셀 다운로드 (감사로그 기록) | ✅ | OrderList.tsx |
| e쿠폰 취소 실패 시 자동 이메일 발송 | ✅ | OrderDetail.tsx, emailService.ts |
| 페이지 방문 활동 로그 자동 수집 | ✅ | useActivityLog.ts |


### 4. AppMembers (앱회원관리)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 회원 목록 (전체/휴면/미주문 필터) | ✅ | AppMemberList.tsx |
| 회원 상세 (탭: 기본정보/주문/포인트/쿠폰/알림/이용로그/교환권) | ✅ | AppMemberDetail.tsx + tabs/ |
| 회원 등급 관리 (등급별 혜택 설정) | ✅ | GradeManagement.tsx |
| 회원 그룹 관리 (그룹 CRUD) | ✅ | MemberGroups.tsx |
| 회원 그룹 상세 (회원 추가/제거) | ✅ | MemberGroupDetail.tsx |
| 회원 추출 (조건 기반 필터링) | ✅ | MemberExtract.tsx |


### 5. Marketing (마케팅)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 할인 관리 (할인 CRUD, 조건 설정) | ✅ | Discounts.tsx |
| 쿠폰 관리 (쿠폰 발급/조회) | ✅ | Coupons.tsx |
| 혜택 캠페인 관리 (트리거 조건 설정) | ✅ | BenefitCampaigns.tsx |
| 트리거 조건 폼 (행동/일정/대상 기반) | ✅ | TriggerConditionForm.tsx |
| 포인트 설정 (적립률/사용조건) | ✅ | PointSettings.tsx |
| 푸시 알림 목록 | ✅ | PushNotifications/PushList.tsx |
| 푸시 알림 등록/수정 | ✅ | PushNotifications/PushForm.tsx |
| 푸시 알림 상세 | ✅ | PushNotifications/PushDetail.tsx |


### 6. Events (이벤트)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 이벤트 목록 (상태별 필터/검색) | ✅ | EventManagement.tsx |
| 이벤트 등록/수정 폼 | ✅ | components/EventForm.tsx |
| 이벤트 참여자 목록 | ✅ | components/EventParticipantList.tsx |


### 7. Design (디자인관리)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 배너 관리 (CRUD, 노출 순서, 기간 설정) | ✅ | BannerManagement.tsx |
| 팝업 관리 (CRUD, 타겟팅, 기간 설정) | ✅ | PopupManagement.tsx |
| 아이콘뱃지 관리 (이미지/텍스트 타입, 200KB 제한) | ✅ | IconBadgeManagement.tsx |
| 메인화면 관리 (섹션 구성) | ✅ | MainScreenManagement.tsx |


### 8. Settlement (정산관리)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 정산 목록 (검색/상태필터/정산실행) | ✅ | SettlementList.tsx |
| 정산 상세 (금액산출내역/주문별 상세) | ✅ | SettlementDetail.tsx |
| 정산 통계 (일별/월별/연별 조회) | ✅ | SettlementStats.tsx |
| 디자인 토큰 통일 (text-gray → txt-main/muted) | ✅ | 전체 Settlement 파일 |


### 9. Store (매장관리)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 매장 목록 (검색/필터) | ✅ | StoreList.tsx |
| 매장 등록/수정 폼 | ✅ | StoreForm.tsx |
| 매장 상세 (운영정보/결제수단/편의시설/휴무일 등 모달) | ✅ | StoreDetail.tsx + components/ |
| 변경 감지 (미변경 시 API 미호출) | ✅ | StoreDetail.tsx |
| POS/PG 일괄 업로드 | ✅ | components/POSBulkUploadModal.tsx 등 |


### 10. Staff (직원관리)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 본사 직원 관리 (CRUD) | ✅ | HeadquartersStaff.tsx |
| 가맹점 직원 관리 | ✅ | FranchiseStaff.tsx |
| 직원 등록/수정 모달 | ✅ | components/StaffFormModal.tsx |
| 가입 승인 관리 | ✅ | StaffApprovals.tsx |
| 팀 관리 (CRUD) | ✅ | Teams.tsx |
| 팀 등록/수정 모달 | ✅ | components/TeamFormModal.tsx |


### 11. Support (고객센터)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 1:1 문의 관리 (type="customer") | ✅ | InquiryList.tsx |
| 가맹 문의 관리 (type="franchise") | ✅ | InquiryList.tsx |
| FAQ 관리 (CRUD) | ✅ | FaqManagement.tsx |
| 약관관리 (CRUD, 버전/공고일 관리, 이미지 첨부 10MB, BR태그 지원) | ✅ | TermsManagement.tsx |


### 12. Permissions (권한관리)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 계정 목록 + 메뉴별 접근 권한 설정 | ✅ | PermissionManagement.tsx |
| RBAC (admin/manager/viewer) | ✅ | ProtectedRoute.tsx |
| 리소스별 read/write 권한 제어 | ✅ | PermissionManagement.tsx |
| design/settlement 라우트 권한 추가 | ✅ | App.tsx |


### 13. Settings (설정)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| FAQ/도움말 아코디언 | ✅ | Settings.tsx |


### 14. AuditLogs (감사로그)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 감사 로그 목록 (검색/필터/심각도 분류) | ✅ | AuditLogList.tsx |
| 알람 설정 (이메일/푸시, 모니터링 액션) | ✅ | AuditLogList.tsx |
| auditService (기록/조회/최근로그인/보안알림) | ✅ | auditService.ts |
| 페이지 방문 자동 로그 수집 | ✅ | useActivityLog.ts |


### 15. Login / Invitation (인증)

| 기능 | 상태 | 파일 |
| --- | --- | --- |
| 이메일/비밀번호 로그인 | ✅ | LoginPage.tsx |
| MFA 이메일 인증 (6자리 코드) | ✅ | LoginPage.tsx, authService.ts |
| 계정 잠금 (5회 실패 → 15분 잠금) | ✅ | authService.ts |
| 세션 타임아웃 | ✅ | useSessionTimeout.ts |
| 초대 수락 + 비밀번호 설정 | ✅ | AcceptInvitation.tsx |
| 보안 강화 (crypto.randomUUID, sessionStorage) | ✅ | authStore.ts, mockAuth.ts |


---

## 공통 인프라

### 레이아웃

| 항목 | 파일 |
| --- | --- |
| 관리자 레이아웃 (사이드바 + 헤더 + 본문) | AdminLayout.tsx |
| 사이드바 (카테고리 자동확장, 독립 스크롤) | Sidebar.tsx, globals.css |
| 헤더 (페이지 타이틀, 알림, 글로벌 검색) | Header.tsx, GlobalSearch.tsx, NotificationPanel.tsx |


### 공통 UI 컴포넌트 (52개)

Button, Card, Input, Badge, MaskedData, DataTable, Pagination, Tooltip, Accordion, DropdownMenu, Alert, InputGroup, Label, Switch, Textarea, Select, Separator, ImageUpload, MultiImageUpload, CategorySelector, CategoryFilter, MultiCategorySelector, StoreSelector, OptionGroupSelector, DateTimePicker, DateRangeFilter, SalesPeriodPicker, SearchInput, DraggableProductItem, Toast, ToastContainer, Skeleton, ProductImage, Spinner, BulkEditModal, ConfirmDialog, Modal, DiscountModal, ProductSelector, MemberSelector, ToggleButtonGroup, StatCard, OTPInput, PermissionGate, ProtectedRoute, DevGuide

### 서비스 레이어 (28개)

appMember, audit, auth, benefitCampaign, campaign, category, content, coupon, dashboard, design, discount, email, event, memberExport, memberGroup, membershipGrade, optionCategory, optionGroup, order, permission, point, product, settlement, staff, store, support, unifiedUser, user

### 커스텀 훅 (33개)

useActivityLog, useAppMembers, useBenefitCampaigns, useCategories, useContent, useCoupons, useDashboard, useDebounce, useDesign, useDiscounts, useEvents, useFranchiseStaff, useHeadquartersStaff, useMemberExtract, useMemberGroups, useMembershipGrades, useModalBehavior, useOptionCategories, useOptionGroups, useOrders, usePermissions, usePointSettings, useProducts, useSessionTimeout, useStaffApprovals, useStoreManagement, useStores, useSupport, useTeams, useToast, useUnifiedUsers, useUsers

---

## 최근 변경 이력

### 2026-03-03
- **Support**: 약관관리 페이지 추가 (CRUD, 버전/공고일 관리, 이미지 첨부 10MB, BR태그 지원)
- **Events**: 이벤트 참여자 개인정보 마스킹 (MaskedData 적용, CSV 마스킹, events unmask 권한)
- **Menu**: 입력필드 BR태그 지원 + min/max 제한 (Products, Categories, OptionCategories, OptionGroups)

### 2026-02-27
- **Dashboard**: 최근 로그인 이력 섹션 추가 (auditService.getRecentLogins 연동)
- **Dashboard**: GA4 디바이스/퍼널 상세 분석 페이지
- **Dashboard**: 회원 분석 섹션 (가입/탈퇴/활성/휴면/성별/연령/멤버십/TOP고객)
- **Dashboard**: 기간 필터 + 엑셀 다운로드 + 마케팅 성과 분석
- **Hooks**: usePageViewLog/useActivityLogger 훅, 주요 페이지에 자동 로그 수집 적용
- **Sidebar**: 카테고리 온/오프 오류 수정 (자동확장 + NavLink end prop)
- **Sidebar**: GNB/본문 스크롤 분리 (sidebar-nav overflow-y: auto)
- **Settlement**: 디자인 토큰 통일 (text-gray → txt-main/muted/sub)
- **Menu**: 상품등록 카테고리 정렬 UI 수정 (items-end)
- **Orders**: e쿠폰 취소 실패 시 자동 이메일 발송

### 2026-02-26
- **Store**: 상세페이지 편집 모달 변경 감지 추가
- **Auth**: AccessDeniedPage → 접근 가능한 라우트로 리다이렉트
- **Support**: 고객센터 카테고리 신규 생성 (1:1문의, 가맹문의, FAQ)
- **Menu**: 상품등록 뱃지 연동 (badgeIds, CSV import)
- **Design**: 아이콘뱃지 이미지/텍스트 타입, 200KB 제한
- **Auth**: 보안 강화 (crypto.randomUUID, sessionStorage, MFA 난수)
- **Permissions**: 접근 제어 강화 (design/settlement 라우트 권한)
