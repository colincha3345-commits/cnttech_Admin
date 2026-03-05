# 대시보드(Dashboard) 기획 명세서

본 문서는 관리자 대시보드 내 **대시보드** 페이지(`/dashboard`)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 페이지 프로세스 (Page Process)

1. **기간 필터** — 오늘/어제/최근7일/최근30일/직접입력 프리셋으로 조회 기간을 설정한다.
2. **핵심 통계 카드** — 금일 매출, 신규 주문, 신규 회원, 엑셀 다운로드 기능을 상단에 표시한다.
3. **정보 카드** — 매출 현황, 프로모션 성과, 앱 현황 등 섹션별 요약 정보와 바로가기 버튼을 제공한다.
4. **차트** — 일별 매출 추이(`DailySalesChart`), 주문 상세(`OrderDetailsChart`), 회원 분석(`MemberAnalytics`), 마케팅 성과(`MarketingPerformance`)를 시각화한다.
5. **최근 접속 이력** — 관리자 최근 로그인 이력(`RecentLogins`)을 테이블로 표시한다.
6. **GA4 통계** — 디바이스별 상세(`GA4DeviceDetail`), 퍼널 분석(`GA4FunnelDetail`) 컴포넌트를 제공한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **기간 필터 (dateRange)** | DateRangeFilter | Y | preset + from/to | 오늘/어제/7일/30일/직접입력이다. |
| **금일 매출 (todayRevenue)** | StatCard | - | 통화 포맷 | 전일 대비 변동률 표시다. |
| **신규 주문 (newOrders)** | StatCard | - | 숫자 | 전일 대비 변동률 표시다. |
| **신규 회원 (newMembers)** | StatCard | - | 숫자 | 전일 대비 변동률 표시다. |
| **엑셀 다운로드** | Button | - | - | 대시보드 데이터를 Excel 파일로 내보내기한다. |
| **정보 카드 (InfoCard)** | Card | - | - | 섹션별 통계 요약과 바로가기 버튼이다. |

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **dateRange** | JSON | Y | { from, to } | 조회 기간 파라미터다. |
| **todayRevenue** | Decimal | Y | - | 기간 내 총 매출이다. |
| **todayOrders** | Integer | Y | - | 기간 내 총 주문 수다. |
| **newMembers** | Integer | Y | - | 기간 내 신규 회원 수다. |
| **dailySales** | JSON[] | Y | - | 일별 매출 차트 데이터다. |
| **orderDetails** | JSON | Y | - | 주문 유형별 상세 통계다. |
| **memberAnalytics** | JSON | Y | - | 회원 등급/가입/이탈 분석 데이터다. |
| **marketingPerformance** | JSON | Y | - | 쿠폰/할인/캠페인 성과 데이터다. |

**[API 및 비즈니스 로직 제약사항]**
- 대시보드 API는 집계 쿼리 성능을 위해 Redis 캐싱을 권장한다. 캐시 TTL은 기간 프리셋에 따라 차등 설정한다.
- 엑셀 다운로드는 서버사이드에서 집계 데이터를 생성하여 클라이언트에서 `downloadDashboardExcel` 유틸로 변환한다.
- 페이지 진입 시 `usePageViewLog`로 접속 이력을 자동 기록한다.
