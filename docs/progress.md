# 개발 진행 상황

## 기획 명세서 작성 현황

| 카테고리 | 파일명 | 상태 |
| :--- | :--- | :---: |
| 회원 (등급/세그먼트 병합) | spec_member.md | ✅ 완료 |
| 매장 (배달권역 병합) | spec_store.md | ✅ 완료 |
| 프로모션 (쿠폰/포인트/이벤트/캠페인/푸시 병합) | spec_promotion.md | ✅ 완료 |
| 주문 | spec_order.md | ✅ 완료 |
| 메뉴 | spec_menu.md | ✅ 완료 |
| 정산 | spec_settlement.md | ✅ 완료 |
| 고객센터 | spec_support.md | ✅ 완료 |
| 디자인 | spec_design.md | ✅ 완료 |
| 대시보드 (감사로그 병합) | spec_dashboard.md | ✅ 완료 |
| 인증 (로그인/직원/권한 병합) | spec_auth.md | ✅ 완료 |
| 시스템 설정 | spec_settings.md | ✅ 완료 |

## 정책서 현황

| 정책서 | 파일명 | 상태 |
| :--- | :--- | :---: |
| 할인/쿠폰 정책 | policy_discount_coupon.md | ✅ 완료 |
| 개인정보 처리 방안 | policy_privacy_data.md | ✅ 완료 |

## API 스키마 현황

| 문서 | 파일명 | 상태 |
| :--- | :--- | :---: |
| API 스키마 문서 병합 | 전 도메인 `spec_*.md` 파일 최하단으로 통합. `api-schema.md` 폐기 | ✅ 완료 |

## 최근 작업 이력

- 2026-03-13: 메뉴 설정 권한 추가 — `MenuControlType`(HQ/STORE), `MenuControlSettings` 타입 + `MENU_CONTROL_TYPE_LABELS` 상수. `BrandConfig`에 `menuControl` 필드 추가. Settings.tsx에 메뉴 설정 권한 카드(설정 주체 Badge, 가맹점 자율 시 동기화/가격변경/추가/삭제 허용 상세 표시). 빌드 에러 0건.
- 2026-03-13: 포인트 적립 시점 변경 — 결제/배달 완료 → 고객 '주문확정' 클릭 시 적립. `POINT_TYPE_LABELS.earn_order` → '주문확정 적립', 정책서 §0.4/§6.1 반영, mock 데이터 description 일괄 수정. 빌드 에러 0건.
- 2026-03-13: 할인/쿠폰 정책서에 포인트 기능 추가 — §0.4에 `withdraw_cancel` 용어 추가, §6.3 포인트 설정(PointSettings 11개 필드), §6.4 관리자 수동 조정(지급/회수 + 마이너스 잔고 confirm), §6.5 이력 관리자 UI(잔액 표시/Badge 색상) 추가.
- 2026-03-13: 쿠폰 삭제 정책 수정 — 미정산 주문 조건 제거(쿠폰 삭제와 정산 무관). 정책서 3.3~3.4 기준 코드 정합성 수정: expired 유예기간(endDate+7일) 미경과 시 삭제 버튼 disabled + 툴팁 안내, 삭제 확인 모달 메시지 정책 일치화. 빌드 에러 0건.
- 2026-03-13: 마이너스 포인트 정책(방안 A) 반영 — 주문취소 시 강제 회수로 마이너스 잔고 허용. `PointType`에 `withdraw_cancel` 추가, `UsePolicy.allowNegativeBalance` 플래그 추가, `PointAdjustModal` 잔액 초과 회수 허용(confirm 경고), `PointHistoryTab`/`PointSettings` 마이너스 잔고 UI(빨간색 표시 + 사용 차단 안내). 빌드 에러 0건.
- 2026-03-13: 시스템 설정 페이지 구현 — spec_settings.md 기반 읽기 전용 설정 페이지. `settings.ts` 타입, `settingsService.ts` Mock/Real 서비스, `useSettings.ts` 훅, `Settings.tsx` 페이지(브랜드 정보/운영 유형/연동 및 계약/지원 채널 4개 카드). 빌드 에러 0건.
- 2026-03-13: API 스키마 명세서 작성 — 4개 도메인(상품 10개, 주문 9개, 쿠폰 9개, 회원 7개) REST API 엔드포인트 + Request/Response 스키마 정의. 기존 TypeScript 타입 기반, 공통 응답/에러 형식 포함.
- 2026-03-12: 개인정보보호법 미흡 기능 4건 구현 — (1) `TermsAgreement`에 `revokedAt`/`revokeReason` 철회 필드 추가 + 약관 동의 이력 테이블에 상태/철회일/사유 컬럼 추가, (2) `MaskedData` 컴포넌트에 개인정보 열람 사유 입력 모달 추가(사유가 audit log에 기록), (3) 회원 내보내기 모달에 다운로드 사유 필수 입력 필드 추가 + `MemberExportRequest.reason` 타입 반영, (4) 푸시 발송 시 광고성 야간 발송(21~08시) 차단 로직 추가(정보통신망법 제50조). 빌드 에러 0건.
- 2026-03-12: 고객 데이터 처리 방안 문서 작성 — KISA 안전성 확보조치 기준(2025.11) 및 개인정보보호법(2025.10) 기반. Member 타입 전수 분류(필수/선택/마케팅/제3자), 동의 체계 점검(TermsAgreement 철회 필드 누락), 암호화·접근통제·접속기록·파기 정책 정의, 프론트엔드 조치사항 10건 도출.
- 2026-03-12: 쿠폰 사용정지 기능 확장 — 정지 시 유예기간(n일) + 7일 후 자동 삭제(`autoDeleteAt` 필드), 정지/만료 쿠폰 수동 삭제 버튼 + 확인 다이얼로그(고객 쿠폰 동시 삭제 안내), 쿠폰 목록 상단 상태 필터(전체/활성/정지/만료/비활성) 추가. 할인상품 동시 주문 무제한 허용 — `benefit-policy.ts` 같은 유형(본사할인/증정할인) 중복 적용 `canStack: true`로 변경, `selectBestBenefitsByType` → 중복 허용 유형은 전체 적용 로직으로 수정. 빌드 에러 0건.
- 2026-03-12: 공통 입력 폼 검토 및 수정 — CSS: hover 시 placeholder 투명 제거(focus만 유지), focus ring 가시성 강화(0.08→0.15). `Textarea`/`Select` 컴포넌트에 `label`/`error` prop 추가(Input과 동일 패턴). raw `<input>` 사용 페이지 5건(BannerManagement, IconBadgeManagement, PopupManagement, FaqManagement, PushForm) → `<Input>`/`<Select>`/`<Textarea>` 컴포넌트로 전환하여 label-input htmlFor/id 연결 수정. FaqManagement `text-gray-700` → `text-txt-main` 디자인 토큰 수정. 빌드 에러 0건.
- 2026-03-12: 마케팅관리 카테고리 QA — 쿠폰 정책 변경(삭제→정지/활성) 레거시 코드 정리: `useCoupons.ts`에서 `useDeleteCoupon`/`useToggleCouponActive` 삭제, `couponService.ts`에서 `deleteCoupon`/`toggleActive` 삭제, `hooks/index.ts` export 정리. `PushForm.tsx` console.log 2건 제거. `push.ts` `triggerConfig?: any` → `Record<string, unknown>` 타입 안전성 수정. 마케팅 8개 페이지(Discounts, Coupons, BenefitCampaigns, PointSettings, PushList, PushForm, PushDetail, TriggerConditionForm) 정합성 검증 완료, 빌드 에러 0건.
- 2026-03-12: 전체 페이지 QA — Product 삭제 정책(P8) 미적용 필드 정리: `ProductTag` 삭제, `Product`·`ProductFormData`에서 `tags`/`isVisible`/`scheduledAt` 제거, `productService.ts` mock·createProduct·getTagName 정리, `Products.tsx` 삭제 필드 참조 제거, `csv.ts` 태그/앱노출 컬럼 제거. 83개 페이지 정합성 검증 완료, 빌드 에러 0건.
- 2026-03-12: 전체 기획서 21건에 "정상작동 시나리오" 섹션 추가. 정책이 필요한 15건에 "개발자용 정책 설명" 섹션 추가 (코드블록 형태의 규칙/수식/조건 명시). docx 21건 재변환 + 테이블 포맷(152 tables).
- 2026-03-12: 할인/쿠폰 도메인 정책서 신규 작성 — 할인 중복불가 정책, 쿠폰 적용상품 상태변경 정책, 쿠폰 삭제 정책(유효기간 만료 후 7일 유예). docx 변환 + 테이블 포맷 적용.
- 2026-03-11: 코드 vs 기획서 비교 업데이트 — spec_auth(lockout 15분, rememberMe, staffType, AuthErrorCode 확장, AccountPolicy), spec_store(operatingInfo 상세 필드, integrationCodes 4사 연동, paymentMethods 간편결제6종, visibilitySettings 확장), spec_order(API 7개 엔드포인트, discount/cashReceipt/customerRequest/memos DB필드, ECoupon 상세), spec_member(linkedSns/termsAgreements/favoriteStores/deliveryAddresses/marketing 수신동의 DB필드), spec_audit_log(18개 액션 정확 매핑, severity 매핑 명시, sessionId/requestId 필드, AuditAlarmConfig 테이블). docx 파일 5건 재변환 + 테이블 포맷 적용.
- 2026-03-10: 전체 기획서 21건 구현 코드 기반 전면 수정 — 라우트 구조 추가, 필드 불일치 수정, 백엔드 API 엔드포인트 명세 보강, 트래픽/성능 검토 섹션 추가. 누락 기획서 3건 신규 작성(배달권역, 감사로그, 시스템설정). 매장(store) spec 전면 재작성(영업정보/편의시설/결제수단/노출설정 등 하위 편집 페이지 반영). 고객센터(support) InquiryStatus 2상태로 수정. 푸시(push) 라우트 /marketing/push로 수정. 포인트(point) 라우트 /marketing/points로 수정. 회원추출(member_segment) 라우트 /app-members/extract로 수정.
- 2026-03-05: 상품 채널별 노출 설정 추가 (주문앱/POS/키오스크·테이블오더), POS 전용 필드(posDisplayName, posColor, 12색 팔레트), spec_menu.md 및 product.ts 업데이트
- 2026-03-04: 미작성 기획 명세서 6건 추가 (spec_point, spec_push, spec_permission, spec_grade, spec_member_segment, spec_dashboard, spec_auth)
- 2026-03-04: 앱회원 배달지 주소 목록 추가 (DeliveryAddress 인터페이스, MemberInfoTab UI, mockData)
- 2026-03-04: 팝업 등록 폼 전시설정 우선 배치 (PopupManagement.tsx 리팩토링)
- 2026-03-04: 앱회원 단골매장 추가 (FavoriteStore 인터페이스, MemberInfoTab UI, mockData)
- 2026-03-04: implemented_features.md 섹션 5~10 추가 (주문/메뉴/직원/정산/고객센터/디자인)
- 2026-03-13: autoConfirmDays(자동확정) 기능 제거 — 타입/서비스/mock/페이지/정책서에서 삭제
- 2026-03-13: 정책서 5건 보완 — 적립기준금액 구체화, 관리자 강제환불 자동회수, suspended 삭제 7일유예, 할인 단건적용, PG 최소결제 캡룰
- 2026-03-13: 금액권(Voucher) 정책 추가 — §0.5 용어정의, §1.1 중복적용 테이블에 금액권+할인/쿠폰/포인트 허용 반영
- 2026-03-13: Products.tsx 성능/가독성 최적화 — (1) filteredProducts에 useMemo 적용, (2) IIFE 안티패턴 제거→ChannelBadges/SalesPeriodBadgeDisplay 컴포넌트 추출, (3) ProductForm 컴포넌트 분리(1887줄→1062줄+ProductForm.tsx), NutritionInputField 헬퍼로 반복 제거
- 2026-03-13: 코드리뷰 — (1) useCategories.ts 오타 수정("집장"→"저장"), (2) RecommendedMenuManager Clean Architecture 위반 수정(productService 직접 import→useProducts 훅), (3) 검색 초기상태/빈결과 구분(hasSearched 플래그), (4) 이미 추가된 메뉴 disabled+추가됨 표시
- 2026-03-13: MainScreenManagement 추천메뉴 중심 UI 확장 — 모달 방식→인라인 검색+순서관리로 변경, 비연동 섹션에 LockOutlined+"연동 예정" 표시, 추천메뉴 섹션 primary 하이라이트
- 2026-03-13: 등급 생성 시 쿠폰 발급 기능 삭제 — GradeCouponBenefit 타입/폼필드/검증/mock 데이터에서 쿠폰 관련 4개 필드 제거. 등급 폼 쿠폰 섹션을 혜택 캠페인 연동 읽기 전용 표시로 교체(membership_upgrade 트리거 캠페인의 쿠폰명 Badge 노출). 빌드 에러 0건.
- 2026-03-13: 등급 포인트 혜택도 혜택 캠페인으로 이관 — GradePointBenefit/GradeBenefits 타입 삭제, MembershipGrade에서 benefits 필드 제거, 폼/검증/서비스/mock 정리. 등급 폼 혜택 섹션을 쿠폰+포인트 통합 읽기 전용으로 변경(캠페인 연동 Badge 표시). 빌드 에러 0건.
- 2026-03-13: 등급 관리 코드리뷰 반영 — (1) 혜택 캠페인 연동을 name→ID 기반 매칭으로 변경(targetGrades에 grade-vip 형태 사용), UPGRADE_GRADES/mock 데이터 일괄 수정, (2) getLinkedBenefits IIFE→useMemo 최적화, (3) 달성 조건 AND 설명 추가, (4) 취소 버튼 수정 모드 시 원본 롤백 동작으로 변경. 빌드 에러 0건.
- 2026-03-23: spec_auth.md 문서-구현 싱크 — (1) 비밀번호 최소길이 6자→8자 통일, (2) 초대토큰 TTL 72h→48h 통일, (3) rememberMe 미구현 항목 제거, (4) API 섹션 AdminUser→Staff 기반 전면 교체, (5) 초대수락 메시지 "활성화"→"승인대기" 명확화
- 2026-03-23: 권한 서비스 감사 로그 추가 — permissionService에 권한 변경/초기화 시 전/후 스냅샷 기록. 데드코드 삭제(StaffFormModal.tsx, HeadquartersStaffEdit.tsx)
- 2026-03-23: 초대 취소/재초대 기능 구현 — (1) staffService.cancelInvitation 추가, (2) HQ/Franchise hook에 useCancelInvitation/useResendInvitation 추가, (3) 목록 UI invited 상태 행에 [재초대][초대취소] 버튼 추가
- 2026-03-23: 로그인 잠금 정책 변경 — (1) 5회 실패 시 15분 자동해제→영구잠금으로 변경, (2) 관리자 비밀번호 재발급으로만 해제, (3) resetPassword에 이메일 임시비번 발송+unlockAccount 추가, (4) LoginPage 카운트다운 제거→고정 잠금 메시지
- 2026-03-23: 지사(Branch) 계층 구조 추가 — (1) StaffType에 'branch' 추가(3종: 본사/지사/가맹점), (2) Branch 타입 및 mockBranchData 신규 생성, (3) Store.branchId 필수 필드 추가 및 mock 반영, (4) Product.menuVisibility(all/hq_branch/branch_franchise) 필드 추가, (5) branchService CRUD 서비스 신규, (6) staffService.inviteBranchStaff/getBranchStaff 등 지사직원 CRUD 추가, (7) useBranches/useBranchStaff hook 신규, (8) Branches(카드그리드)/BranchEditPage/BranchStaff(목록) 페이지 신규, (9) StaffEditPage 3종 staffType 분기+지사 드롭다운 추가, (10) App.tsx 라우트 4개 추가. 빌드 에러 0건.
- 2026-03-23: 영업정보 배달/포장 최소 1개 필수 검증 — OperatingInfoEdit에서 (1) 토글 시 실시간 차단(상대 채널이 OFF면 현재 채널 OFF 불가), (2) submit 시 이중 검증. spec_store.md에 FE/BE 제약사항 반영.
- 2026-03-23: 영업시간 요일별 설정 UX/UI 개선 — renderTimeRow 카드형 레이아웃으로 전면 재설계. (1) 요일 라벨 축약→전체(월→월요일), (2) checkbox→Switch 토글+영업/휴무 텍스트, (3) 시간 Input w-28→w-36 h-12 확대, (4) 라스트오더/휴게시간 별도 행+레이블, (5) 휴무 행 반투명(opacity-60) 시각 구분, (6) 카드형 border+rounded-xl+padding.
- 2026-03-23: 영업정보 공통 스타일 통일 및 기능 추가 — (1) 간편 설정(평일/주말/공휴일)에 누락된 휴게시간 추가+선택 표기, (2) 배달/포장 시간 Input w-32→w-36 h-12 확대, (3) time/date input 전체 영역 클릭 시 picker 열리도록 CSS 추가(globals.css), (4) 임시휴업 사유 텍스트→버튼 선택(재료소진/기기점검/개인사정/기타)+기타 직접입력+API연동(temporaryCloseReasonDetail), (5) 날짜 Input h-12 확대, (6) label 스타일 통일(text-sm font-medium text-txt-secondary mb-2).
- 2026-03-23: 매장 등록 소속 지사 UI 추가 — StoreForm.tsx 기본정보 상단에 소속 지사 Select(필수)+useBranches()+유효성 검증 추가.
- 2026-03-23: 계정 초대 UX 개선 — (1) StaffEditPage 신규 생성 시 계정 유형 선택 버튼(본사/지사/가맹점) 추가, (2) 본사(팀)/지사/가맹점 소속 선택을 모두 검색 드롭다운으로 통일(실시간 필터+선택 표시+해제+외부 클릭 닫힘), (3) 유형 전환 시 소속+검색 상태 초기화.
- 2026-03-24: 대시보드 엑셀 다운로드 버그 수정 — (1) useDashboardExport queryKey에 from/to 누락→기간 변경해도 캐시된 이전 결과 반환 문제 수정, (2) getExportData fallback을 당일→최근 30일로 변경하여 전체 기간 데이터 생성, (3) handleExcelDownload 에러 처리 추가.
- 2026-03-24: 대시보드 엑셀 주문상세 데이터 누락 수정 — (1) OrderDetailsData/OrderDetailItem 타입 추가(유형별/채널별/결제수단별/회원별), (2) DashboardExportData에 orderDetails 필드 추가, (3) dashboardService에 MOCK_ORDER_DETAILS 데이터+getExportData 반환 포함, (4) excel.ts에 '주문상세' 시트 추가(구분/항목/비율/건수). 엑셀 시트: 매출현황+운영요약+주문상세+마케팅성과 4시트.
- 2026-03-24: 대시보드 엑셀 다운로드 기능 삭제 + 전체 데이터 서비스 연동 — (1) 엑셀 다운로드 버튼/hook/import 삭제, (2) DashboardStats에 미연동 8개 필드 추가(completedRevenue/cancelledRevenue/minOrderCount/회원현황4개/문의현황4개), (3) StatCard 최소주문건수+신규가입 stats 연동, (4) InfoCard 매출/회원/문의 현황 하드코딩→stats 연동, (5) OrderDetailsChart 자체 mock→useOrderDetails hook 연동, (6) DailySalesChart 고정 mock→useDailySales hook+dateRange 연동+실매출 바 높이 비례, (7) MemberAnalytics 자체 mock 7개 상수→useMemberAnalytics hook 연동, (8) MemberAnalyticsData/DailySalesItem 타입 신규, (9) dashboardService에 getOrderDetails/getDailySales/getMemberAnalytics API 3개 추가.
- 2026-03-24: spec_dashboard.md 기획문서 업데이트 — (1) 페이지 프로세스 엑셀 삭제+hook 연동 명시(9단계), (2) FE 명세 13개 항목+데이터소스 컬럼으로 전면 교체, (3) BE 명세 DashboardStats 필드+개별 API 4개 테이블, (4) API 섹션 10-1~10-6 재구성, (5) 시나리오 6단계 서비스 연동 기반으로 교체.
- 2026-03-24: 대시보드 데이터 소스 기반 수정 — (1) minOrderCount 삭제→등록 가맹점 수로 교체, (2) 문의 현황 4종(신규/미확인/확인/진행중)→2종(pending/resolved)으로 InquiryStatus 기반 수정, (3) 주문 유형 배달/포장→배달/포장/매장식사(OrderDeliveryType 기반), (4) 채널 앱/웹/전화→앱/키오스크/POS/웹(OrderChannel 기반), (5) 결제수단 카드/현금/포인트→카드/카카오페이/네이버페이/토스페이/현금/모바일상품권/금액권/복합결제(PaymentMethod 기반), (6) spec_dashboard.md/mockData/타입/서비스 일괄 반영.
- 2026-03-24: 대시보드 최근 로그인 이력 삭제 — RecentLogins 컴포넌트 import/렌더링 삭제, spec_dashboard.md에서 프로세스/FE명세 삭제.
- 2026-03-24: 배달/포장 가능시간 로직 삭제 → 영업시간+라스트오더 자동 계산으로 변경 — (1) DeliverySettings/PickupSettings에서 availableStartTime/EndTime 필드 삭제, (2) OperatingInfoEdit에서 가능시간 Input 제거→안내 문구로 교체, (3) StoreDetail에서 표시 제거→자동 적용 안내, (4) mockStoreData 정리, (5) spec_store.md 배달가능시간 행 삭제+주문가능시간 로직 BE 제약사항 추가.
- 2026-03-24: 예약 기능 배달/포장 통합 — (1) DeliverySettings/PickupSettings에서 isReservationAvailable/reservationLeadTimeMinutes 삭제, (2) OperatingInfo/OperatingInfoFormData에 통합 예약 필드 추가, (3) OperatingInfoEdit 배달/포장 내 예약 UI 삭제→별도 '예약 설정' 아코디언 섹션으로 통합(배달/포장 모두 적용), (4) StoreDetail 개별 예약 표시 제거, (5) mockStoreData 통합 필드로 이동, (6) spec_store.md 예약 항목 통합 반영.
- 2026-03-24: spec_settlement.md 정산 문서 업데이트 — (1) promotionDiscount 등 영문 필드에 구성요소 상세 설명 추가(couponAmount+pointUsed+discountAmount), (2) 실무자 이해용 한글 용어 병기(매출합계/배달비합계/본사지원금/플랫폼수수료 등), (3) netAmount 음수 금지 정책 반영(음수=플랫폼 손실, 사전 검증 필수), (4) 정산 스냅샷 정책→마감 후 취소/환불 정책으로 쉽게 풀어쓰기("마감 후 환불은 다음 정산에 차감"), (5) 본사 지원금 계산 예시 보강.
- 2026-03-24: 정산 E쿠폰/포인트 부담 비율 추가 — (1) spec_settlement.md 4.5절 E쿠폰(교환권/금액권) 정산주체=외부 쿠폰사 명시(ECouponUsage.couponCompany 기반), (2) 4.6절 포인트 사용 시 본사/가맹점 부담 비율 정책 추가, (3) point.ts UsePolicy/PointSettingsFormData에 headquartersRatio/franchiseRatio 필드 추가, (4) PointSettings.tsx 사용 정책 섹션에 부담 비율 입력 UI(연동 자동합산 100%+예시 표시) 추가, (5) validatePointSettings에 비율 합계 100% 검증 추가, (6) mockPointData/pointService 반영.
- 2026-03-24: PG사 결제 수수료 정산 반영 — (1) super-admin FeePolicy에 pgFeeRate 필드 추가+mock 데이터 반영(2.5~3.0%), (2) admin-dashboard Settlement 타입에 pgFee 필드 추가, (3) 정산 공식 변경: netAmount = totalSales + deliveryFee + hqSupport - promotionDiscount - platformFee - pgFee, (4) SettlementDetail.tsx에 PG 수수료 행 추가(수식 A+B-C+D-E-F), (5) SettlementList.tsx 테이블에 PG 수수료 컬럼 추가, (6) mockSettlementData pgFee+netAmount 재계산, (7) spec_settlement.md FE/BE 명세+개발자용 공식 일괄 반영.
- 2026-03-24: 기획문서 일괄 동기화 — (1) spec_promotion.md 포인트 사용 정책 FE 명세에 headquartersRatio/franchiseRatio 행 추가, (2) spec_promotion.md DB 스키마 usePolicy에 부담 비율 필드 반영, (3) super-admin progress.md에 FeePolicy.pgFeeRate 추가 이력 기록.
- 2026-03-24: 포인트 마이너스 잔고 정책 고정화 — (1) 기획에 미사용 옵션이 없으므로 allowNegativeBalance를 항상 true 고정(UsePolicy 리터럴 타입 `true`), (2) PointSettingsFormData에서 allowNegativeBalance 필드 제거, (3) PointSettings.tsx 토글 UI 제거→고정 안내 문구로 교체, (4) pointService 저장 시 true 하드코딩, (5) spec_promotion.md 마이너스 잔고=고정 정책 ReadOnly 명시.
- 2026-03-24: 정산 산출내역 E쿠폰 UI 분리 + 배치 마감 기준 명확화 — (1) SettlementDetail.tsx 산출내역에서 교환권/상품권을 할인 하위 항목에서 분리→별도 점선 구분 영역으로 이동("정산주체: 외부 쿠폰사 · 가맹점 정산에 미포함" 안내 표시, vouchersUsed>0 시에만 노출), (2) spec_settlement.md 4.3절 배치 스케줄 구체화(반월 단위, 익일 새벽 02:00 실행, 스냅샷=기간 종료일 23:59:59), (3) 배치 실행 전 취소 시나리오 추가(새벽 01:30 취소→스냅샷 이후이므로 당기 미반영→익월 차감), (4) BE 제약사항에 배치 스케줄+스냅샷≠배치 실행 시각 주의사항 추가, (5) FE 명세 vouchersUsed 설명을 "별도 영역 분리 표시+정산 공식 미포함" 으로 변경.
- 2026-03-24: 권한관리 메뉴 누락 보정 — (1) AdminMenu 타입에 'push'(앱푸시관리)/'delivery-zones'(상권관리) 추가, (2) ADMIN_MENU_LABELS/ADMIN_MENU_ORDER에 두 메뉴 추가, (3) MENU_PERMISSION_CONFIG에 앱푸시(조회/발송)/상권(조회/편집) 하위 권한 추가, (4) rbac.ts ROLE_PERMISSIONS 3종(admin/manager/viewer)에 push/delivery-zones 권한 추가, (5) ROUTE_PERMISSIONS에 /marketing/push→push, /delivery-zones→delivery-zones 매핑 추가, (6) PermissionManagement.tsx MENU_ICONS에 NotificationOutlined/EnvironmentOutlined 추가, (7) spec_auth.md 권한관리 명세 메뉴 개수 13→15개로 수정+push/delivery-zones 목록 반영.
- 2026-03-24: 음수 정산 정책 정리 — 정률 수수료(매출×%) 구조상 수수료가 매출을 초과하는 구조적 음수는 불가. 단, 전기 취소/환불 차감 초과 시 예외적 음수 가능→시스템 사전 차단 없음, 발생 시 운영자 알림+빨간색 강조. spec_settlement.md FE/BE 명세+개발자용 공식 4곳 수정.
- 2026-03-24: 주문 네트워크 오류/PG 데이터 유실 방어 기획 추가 — (1) spec_order.md 4.5절 신규: 네트워크 오류 방어(멱등키 X-Idempotency-Key+지수 백오프 재시도 3회+미완료 주문 조회 폴백), (2) 4.6절 신규: PG 결제 데이터 유실 방어(2단계 주문 생성 패턴: prepare→PG결제→confirm, PG 웹훅 자동확정, 미확정 주문 정리 배치 Reconciliation 매5분, pgApprovalNo UNIQUE 중복방지), (3) 4.1절 FSM에 payment_pending/expired 상태+전이규칙 추가, (4) API 엔드포인트 4개 추가(prepare/confirm/pending조회/PG웹훅), (5) BE 제약사항 멱등키+2단계 주문생성 2항목 추가, (6) OrderStatus 타입에 payment_pending/expired 추가+라벨+Badge variant 반영(OrderList/OrderDetail), (7) spec_settlement.md 정산 대상 필터(payment_pending/expired 제외) 1항목 추가.
- 2026-03-24: 재초대 정책 명문화 — spec_auth.md 4.2절(초대 토큰 정책)에 재초대 정책 추가. 재초대(resend)=토큰+만료일만 갱신(기존 정보 유지), 정보 변경 필요 시=초대취소→신규초대. 코드 변경 없음(기존 resendInvitation 로직 그대로).
- 2026-03-24: 정산 후 취소 정책 추가 — (1) spec_settlement.md 4.3절: 정산 후 취소는 기한 제한 없이 언제든 가능(시스템 차단 없음), 마이너스 주문내역 생성 정책(동일 주문번호+음수 금액+유형 refund+원본 참조), 다음 정산에서 차감 반영, (2) BE 제약사항에 취소 허용+마이너스 내역 2항목 추가, (3) spec_order.md 4.2.1절 신규: 정산 후 취소 정책(기한 제한 없음+마이너스 주문내역 생성 로직+주문 상세 화면 표시 정책).
- 2026-03-25: 배달비 데이터 중복 정리 — 상권관리(DeliveryZone) 기준 단일화. (1) store.ts OperatingInfo/OperatingInfoFormData에서 deliveryFee/freeDeliveryMinAmount/deliveryFeeByDistance 필드 삭제, (2) mockStoreData 5건에서 deliveryFee/freeDeliveryMinAmount 제거, (3) OperatingInfoEdit.tsx 배달비 입력 필드→"상권관리에서 설정" 안내+링크로 교체, (4) StoreDetail.tsx 배달비 직접 표시→안내+링크로 교체, (5) ClosedDayEdit.tsx/storeService.ts deliveryFee 참조 제거, (6) delivery-zone.ts deliveryFee 주석 보강(메인상권 기본/추가상권 합산), (7) spec_store.md FE/BE 명세+5.2절 배달비 정책을 상권관리 단일화로 전면 교체.
- 2026-03-25: spec_store.md 사용자 친화적 용어로 전면 개선 — (1) FE 기본정보: 영문 필드명+개발 타입→한글 명칭+실무 설명으로 교체(예: "Input"→"텍스트 입력", "Badge"→"상태 표시", "Y"→"필수"), (2) 영업정보: 개발 용어→실무 행동 설명(예: "StatusToggle 5가지"→"영업중/준비중/휴게시간/영업종료/임시휴업 중 선택"), (3) 배달/포장: "Boolean Switch"→"켜기/끄기", (4) BE Store 테이블: "UUID/Enum/JSON"→"고유식별자/선택값/묶음 데이터"+한글 필드명 병기, (5) 비즈니스 제약사항: 개발 전문 용어→운영 규칙 관점으로 재작성. 피드백 메모리 저장(feedback_user_friendly_docs.md).
- 2026-03-25: 반경 기반 소상권 자동 생성 기능 — (1) delivery-zone.ts: DeliveryZone에 innerRadius/outerRadius 필드 추가, DeliveryZoneFormData에 useSubZones/subZoneIntervalMeters 추가, SubZoneInterval 인터페이스 신규, (2) deliveryZoneService.ts: createSubZonesBatch(기존 소상권 삭제→동심원 일괄 생성)+getSubZones 메서드 추가, (3) useDeliveryZones.ts: useCreateSubZonesBatch/useSubZones 훅 추가+hooks/index.ts export, (4) DeliveryZoneEditor.tsx: 좌측 폼에 "소상권 사용" 체크박스+거리 간격 입력+미리보기 구간 목록+거리별 배달비 설정 모달(구간별 추가배달비 입력+총 배달비 표시), 우측 패널 소상권 카드에 거리 구간(innerRadius~outerRadius) 표시, 저장 시 소상권 일괄 생성 연동, (5) spec_store.md 상권관리 프로세스+FE 명세에 소상권 자동 생성 정책 추가.
- 2026-03-25: 소상권 사용(거리별) 폴리곤 모드 확장 + 예상시간 추가 — (1) DeliveryZoneEditor.tsx: 소상권 자동 생성을 반경 전용→반경+폴리곤 모두 지원으로 변경, 폴리곤 시 기준 반경(km) 입력 필드 추가, (2) 반경 모드에서 소상권 수동 선택 비활성화+"하단 소상권 사용으로 대체" 안내, 폴리곤에서는 수동 소상권도 유지, (3) store.ts DeliverySettings/PickupSettings에 estimatedMinutes(예상시간, 분) 필드 추가, (4) OperatingInfoEdit.tsx 배달 섹션에 "예상 배달시간" 입력(분)+고객 앱 안내 표시, 포장 섹션에 "예상 준비시간" 입력(분)+안내 표시, (5) spec_store.md FE 명세에 예상 배달시간/준비시간 행 추가.
- 2026-03-25: spec_store.md 상권관리 섹션 소스 기반 전면 동기화 — (1) 프로세스: 3패널 레이아웃 명시, 소상권 자동 생성=반경+폴리곤 모두 지원, 수동 소상권=폴리곤만, (2) FE 명세: 소스(delivery-zone.ts) 기준 전면 교체—상권명/매장선택/그리기도구/상권구분/배달비/최소주문금액/색상/활성여부+소상권사용/기준반경(폴리곤)/거리간격/거리별배달비모달/소상권리스트, (3) BE 스키마: 소스 타입 기반 전면 교체—zoneType 'circle' 삭제(radius로 통합), innerRadius/outerRadius/color/storeName 추가, estimatedMinutes 삭제(매장 영업정보로 이동), (4) API: 소상권 일괄 생성(batch)+조회 2개 추가, (5) 비즈니스 제약사항: 사용자 친화적 문구로 전면 재작성.
- 2026-03-25: 상권 중첩 정책 변경 — 서로 다른 매장 간 상권 중첩 허용. 같은 브랜드 내 여러 매장이 배달 권역을 공유하는 운영 케이스 반영. spec_store.md 제약사항+"중복 차단 안 함(참고용 경고만)"+5.1절 중첩 정책에 타 매장 간 중첩 규칙+중복 체크 API 설명 보강. 코드 변경 없음(기존에 차단 로직 미존재).
- 2026-03-25: 정산 상태값 단순화 — 4가지(pending/calculated/completed/on_hold)→2가지(pending 정산전/completed 정산완료)로 변경. (1) settlement.ts SettlementStatus에서 calculated/on_hold 제거, (2) SettlementList.tsx 라벨 2가지로 교체(정산전/정산완료), (3) mockSettlementData calculated→pending 변경, (4) spec_settlement.md 상태 필터/뱃지/BE 스키마/상태 전이 규칙/프로세스/시나리오 전면 수정—정산일 기준 정산전↔정산완료 자동 전환.
- 2026-03-25: 미완료 주문 자동 완료 정책 추가 — 영업일 기준 자정(00:00) 경과 시 미완료 주문(pending/confirmed/preparing/ready)을 자동으로 completed 전환 후 정산 진행. (1) spec_settlement.md 4.3절에 미완료 주문 자동 완료 처리 섹션 신규(처리 순서: 00:00 자동 완료→02:00 정산 배치, 대상 제외: cancelled/payment_pending/expired), BE 제약사항에 자동 완료+배치 스케줄 수정, (2) spec_order.md 4.1절 FSM에 자동 전이 규칙 추가((pending~ready)→completed, 자정 배치).
- 2026-03-25: 상권 데이터 과부하 수정 — (1) useDeliveryZones에 storeId 필터 추가(전체 조회→선택된 매장만 조회), (2) enabled 옵션으로 params 없이 전체 조회 방지, (3) generateSubZoneIntervals를 순수 함수로 변경(useCallback 의존성 제거), (4) previewIntervals useMemo 안정화.
- 2026-03-25: 소상권 자동 생성 반경 모드 전용으로 변경 — 폴리곤 모드에서 소상권 자동 생성(거리별 배달비) 제거, 폴리곤은 수동 소상권 그리기만 유지. subZoneBaseRadiusKm state 삭제.
- 2026-03-25: 상권 리스트 UX 개선 — (1) 수정 클릭 시 해당 상권 영역으로 지도 flyTo 이동(MapView에 FocusTarget/FlyToTarget 추가), (2) 메인상권 클릭 시 이미 그려진 영역이 있으면 초기화 여부 confirm 얼럿.
- 2026-03-25: 매장 계약정보 성격 변경 — 슈퍼어드민 상속이 아닌 브랜드 본사↔매장 간 가맹 계약 관리 데이터로 변경. (1) store.ts ContractInfo에 contractType(가맹/직영/라이선스), royaltyRate(로열티%), depositAmount(보증금) 필드 추가, ContractType 타입+CONTRACT_TYPE_LABELS 상수 신규, (2) StoreForm.tsx 계약 유형/로열티/보증금 입력 UI 추가, (3) StoreDetail.tsx 계약 유형/로열티/보증금 표시 추가, (4) mockStoreData 5건에 contractType/royaltyRate/depositAmount 반영, (5) spec_store.md "슈퍼어드민에서 상속" 문구 제거, 계약 정보 상세 필드 테이블+본사↔매장 계약 설명 추가.
- 2026-04-01: 상권관리 반경 모드 제한 해제 — 반경 모드에서 소상권을 수동으로 직접 그릴 수 없도록 블락된 제약사항(isSubDisabled) 제거. "기본 상권보다 크게 그릴 수 있다"는 요구사항에 맞춰 자유도를 부여하고, 사용자 안내 문구를 상황에 맞게 최적화. spec_store.md 프론트단 명세도 함께 업데이트.
- 2026-04-01: GA4 디바이스/퍼널 기간 필터 연동 — (1) GA4DeviceDetail에 DateRangeFilter 추가+기간별 세션 수 비례 재계산(useMemo), (2) GA4FunnelDetail에 DateRangeFilter 추가+퍼널 단계·일별 전환·TOP 상품 수치 기간 비례 재계산, (3) GA4Statistics 페이지 UI 개선. spec_dashboard.md 프로세스 반영.
- 2026-04-01: StoreForm 버튼 정렬 수정 — 하단 버튼 영역 정렬 불일치 수정.
- 2026-04-01: 회원 30일 미접속 필터 제거 — MemberListFilter에서 `inactive_30days` 제거, appMemberService/useAppMembers/app-member 타입 정리. 3개월 이상 미접속(`inactive_90days`)만 유지.
- 2026-04-01: 이상주문 목록 기능 추가 — (1) AbnormalOrderList.tsx 신규(pending+8분 경과 주문 자동 감지, 30초 자동새로고침, 경과시간 실시간 표시, 주문유형/매장/키워드 필터), (2) orderService에 getAbnormalOrders/getAbnormalCount 추가, (3) useAbnormalOrderList/useAbnormalOrderCount 훅 추가, (4) mockOrderData에 이상주문 테스트 데이터 3건 추가, (5) App.tsx 라우트+navigation 메뉴 추가. spec_order(추가).md 라우트/프로세스/FE 명세 반영.
- 2026-04-01: 앱푸시 자동 발송 기능 추가(트리거 기반) — (1) TriggerType에 주문 트리거 4종(order_confirmed/order_ready/order_delivering/order_completed) 추가, (2) PushStatus에 active/inactive 추가, (3) PushNotification에 totalSentCount 필드 추가, (4) pushService에 toggleStatus 메서드+자동 발송 mock 데이터 2건 추가, (5) useTogglePushStatus 훅 추가, (6) PushForm에 주문 트리거 optgroup+조건부 UI(발송시점/세그먼트 숨김, 변수 안내) 추가, (7) PushList에 트리거 컬럼+활성/비활성 토글 버튼+누적 발송 표시 추가, (8) PushDetail에 트리거 조건+토글 버튼+누적 발송수 표시 추가. spec_promotion.md 푸시 섹션 전면 반영.
- 2026-04-02: 배너관리 PC/모바일 분리 — Banner/BannerFormData에서 imageUrl→pcImageUrl+mobileImageUrl, linkUrl→pcLinkUrl+mobileLinkUrl 분리. 폼 UI PC/모바일 섹션 분리+권장 사이즈 안내(PC 1200×586, 모바일 331×196). 이미지 유효성 검증 추가.
- 2026-04-02: 임시휴업 단순화 + 영업상태 수동 토글 삭제 — (1) 임시휴업을 단일 토글+사유 선택으로 단순화(복수 기간/날짜 제거, 다음날 자동 해제), (2) StoreDetail에서 appOperatingStatus 수동 상태 전환 UI 삭제(영업상태는 영업시간/휴무일 룰로 자동 계산), (3) OperatingInfo/OperatingInfoFormData에서 temporaryCloseStartDate/temporaryCloseEndDate/temporaryClosePeriods 제거, (4) storeService/ClosedDayEdit 날짜 필드 참조 정리. spec_store.md 전면 반영.
- 2026-04-03: 영업시간 isOpen 토글 삭제 — renderTimeRow에서 영업/휴무 Switch 제거. 영업시간은 항상 시간 입력만 표시. 휴무 판단은 정기휴무/비정기휴무/임시휴업 데이터로만 결정. 요일별 설정 모드는 유지. spec_store.md 영업시간 FE 명세 반영.
- 2026-04-03: 기획서 일괄 업데이트 — (1) spec_design.md 배너 PC/모바일 분리 반영(FE/BE 명세 imageUrl→pcImageUrl+mobileImageUrl, linkUrl→pcLinkUrl+mobileLinkUrl, 권장 사이즈 명시), (2) spec_store.md 영업시간 토글 삭제+공휴일 휴무 토글 명시, (3) 타입 에러 전체 수정(Store 탭 컴포넌트 any→Store 타입, AppMemberList 3건).
