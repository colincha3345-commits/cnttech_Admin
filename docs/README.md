# Admin Dashboard 기획문서

CNTTECH 관리자 대시보드의 기획 문서 인덱스입니다.

---

## 기획 명세서 (21건)

| 카테고리 | 파일 | 설명 |
| :--- | :--- | :--- |
| 인증 | spec_auth.md | 로그인, MFA, 초대수락 |
| 대시보드 | spec_dashboard.md | 핵심 지표 모니터링 |
| 회원 | spec_member.md | 앱회원 목록/상세/수동지급 |
| 회원추출/그룹 | spec_member_segment.md | 세그먼트 필터, 그룹 저장 |
| 멤버십등급 | spec_grade.md | 등급 CRUD, 달성조건, 자동쿠폰 |
| 매장 | spec_store.md | 매장 등록/수정, 영업정보, 배달설정 |
| 메뉴 | spec_menu.md | 카테고리/메뉴/옵션 관리 |
| 주문 | spec_order.md | 주문 접수→완료, 취소/환원, 복합결제 |
| 프로모션 | spec_promotion.md | 할인/쿠폰 생성, 정산비율 |
| 이벤트 | spec_event.md | 이벤트 생성, 참여자 관리, 당첨 |
| 혜택캠페인 | spec_benefit_campaign.md | 트리거 기반 자동 혜택 |
| 포인트 | spec_point.md | 적립/사용/소멸 정책 설정 |
| 푸시알림 | spec_push.md | 알림 발송/예약 |
| 직원 | spec_staff.md | 본사/가맹 직원 초대/승인/팀 |
| 정산 | spec_settlement.md | 정산 산출/지급/통계 |
| 권한 | spec_permission.md | 메뉴별 접근 수준 관리 |
| 디자인 | spec_design.md | 배너/팝업/아이콘뱃지/메인화면 |
| 배달권역 | spec_delivery_zone.md | 지도 폴리곤 권역/배달비 |
| 감사로그 | spec_audit_log.md | 로그 조회, 알림 설정 |
| 고객센터 | spec_support.md | 1:1문의, FAQ, 약관 |
| 시스템설정 | spec_settings.md | 전역 설정 관리 |

## 정책서

| 파일 | 설명 |
| :--- | :--- |
| policy_discount_coupon.md | 할인 중복불가, 쿠폰 상품변경, 쿠폰 삭제 정책 |

## 상위 기획

| 파일 | 설명 |
| :--- | :--- |
| architecture_concept.md | SaaS 플랫폼 계층 아키텍처 (슈퍼어드민/브랜드허브/운영접점) |
| brand_hub_strategy.md | 브랜드 허브 전략 및 상위 시스템 관계 정의 |

## 디자인

| 파일 | 설명 |
| :--- | :--- |
| 02-design/design-system.md | 디자인 시스템 가이드 |
| design-system/color-guide.md | 컬러 가이드 |

## 프로젝트 관리

| 파일 | 설명 |
| :--- | :--- |
| progress.md | 작업 이력 및 진행 현황 |

---

## 기술 스택

- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **State**: Zustand (+ persist)
- **Styling**: Tailwind CSS
- **Build**: Vite

## 테스트 계정

| 역할 | 이메일 | 비밀번호 | MFA |
| :--- | :--- | :--- | :---: |
| Admin | admin@cnttech.co.kr | Admin123! | ON |
| Manager | manager@cnttech.co.kr | Manager123! | OFF |
| Viewer | viewer@cnttech.co.kr | Viewer123! | OFF |

---

## docx 폴더 구조

```
docs/docx/
  02_디자인/        ← design-system, color-guide
  README.docx       ← 이 문서
  progress.docx     ← 작업 이력
```
