# 개발 진행 상황

## 기획 명세서 작성 현황

| 카테고리 | 파일명 | 상태 |
| :--- | :--- | :---: |
| 회원 | spec_member.md | ✅ 완료 |
| 매장 | spec_store.md | ✅ 완료 |
| 프로모션 (할인/쿠폰) | spec_promotion.md | ✅ 완료 |
| 혜택 캠페인 | spec_benefit_campaign.md | ✅ 완료 |
| 이벤트 | spec_event.md | ✅ 완료 |
| 주문 | spec_order.md | ✅ 완료 |
| 메뉴 | spec_menu.md | ✅ 완료 |
| 직원 | spec_staff.md | ✅ 완료 |
| 정산 | spec_settlement.md | ✅ 완료 |
| 고객센터 | spec_support.md | ✅ 완료 |
| 디자인 | spec_design.md | ✅ 완료 |
| 포인트 설정 | spec_point.md | ✅ 완료 |
| 푸시 알림 | spec_push.md | ✅ 완료 |
| 권한 관리 | spec_permission.md | ✅ 완료 |
| 멤버십 등급 | spec_grade.md | ✅ 완료 |
| 회원 추출/그룹 | spec_member_segment.md | ✅ 완료 |
| 대시보드 | spec_dashboard.md | ✅ 완료 |
| 인증 (로그인/초대) | spec_auth.md | ✅ 완료 |
| 배달권역 | spec_delivery_zone.md | ✅ 완료 |
| 감사 로그 | spec_audit_log.md | ✅ 완료 |
| 시스템 설정 | spec_settings.md | ✅ 완료 |

## 정책서 현황

| 정책서 | 파일명 | 상태 |
| :--- | :--- | :---: |
| 할인/쿠폰 정책 | policy_discount_coupon.md | ✅ 완료 |
| 개인정보 처리 방안 | policy_privacy_data.md | ✅ 완료 |

## 최근 작업 이력

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
