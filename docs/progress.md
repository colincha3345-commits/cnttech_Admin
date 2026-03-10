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

## 최근 작업 이력

- 2026-03-10: 전체 기획서 21건 구현 코드 기반 전면 수정 — 라우트 구조 추가, 필드 불일치 수정, 백엔드 API 엔드포인트 명세 보강, 트래픽/성능 검토 섹션 추가. 누락 기획서 3건 신규 작성(배달권역, 감사로그, 시스템설정). 매장(store) spec 전면 재작성(영업정보/편의시설/결제수단/노출설정 등 하위 편집 페이지 반영). 고객센터(support) InquiryStatus 2상태로 수정. 푸시(push) 라우트 /marketing/push로 수정. 포인트(point) 라우트 /marketing/points로 수정. 회원추출(member_segment) 라우트 /app-members/extract로 수정.
- 2026-03-05: 상품 채널별 노출 설정 추가 (주문앱/POS/키오스크·테이블오더), POS 전용 필드(posDisplayName, posColor, 12색 팔레트), spec_menu.md 및 product.ts 업데이트
- 2026-03-04: 미작성 기획 명세서 6건 추가 (spec_point, spec_push, spec_permission, spec_grade, spec_member_segment, spec_dashboard, spec_auth)
- 2026-03-04: 앱회원 배달지 주소 목록 추가 (DeliveryAddress 인터페이스, MemberInfoTab UI, mockData)
- 2026-03-04: 팝업 등록 폼 전시설정 우선 배치 (PopupManagement.tsx 리팩토링)
- 2026-03-04: 앱회원 단골매장 추가 (FavoriteStore 인터페이스, MemberInfoTab UI, mockData)
- 2026-03-04: implemented_features.md 섹션 5~10 추가 (주문/메뉴/직원/정산/고객센터/디자인)
