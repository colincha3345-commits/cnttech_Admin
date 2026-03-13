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
