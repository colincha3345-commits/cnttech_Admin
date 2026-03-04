# 시스템 구현 상세 기능 명세서

본 문서는 관리자 시스템에 현재(26.03.04 기준)까지 구현 및 세팅된 도메인별 기능의 속성, 상태값, 플로우, 작동 요소를 엑셀 형태의 표로 상세히 정리한 문서입니다.

## 1. 회원 (Member)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **기본 정보** | 신상 정보 | 이름, 연락처(마스킹), 이메일, 생년월일, 성별 | App/Web/Admin | `male`, `female` | 회원가입/수정 화면에서 수집. 연락처는 자동 하이픈 및 마스킹 처리 |
| | 계정 식별 | 회원ID (memberId), 고유 식별자(PK) | App/Web/Admin | `active`, `inactive`(휴면), `dormant`(장기미접속), `withdrawn`(탈퇴) | 탈퇴 요청 시 유예기간 또는 즉시파기 정책에 따라 status 변경. 장기 미접속자 배치(Batch)로 dormant 전환 |
| | 소셜 연동 | 카카오, 네이버, 구글, 애플, 페이스북 (SnsConnection) | App/Web | `kakao`, `naver`, `google`, `apple`, `facebook` | 다중 소셜 연동 병합 및 해제 가능. SNS 고유키(snsKey) 저장 |
| **등급/활동** | 멤버십 등급 | 등급ID (grade-vip, grade-gold 등 동적) | App/Web/Admin | `grade-vip`, `grade-gold`, `grade-silver`, `grade-normal` 등 | 전월(또는 특정 기간) 실적에 따라 동적 갱신 배치 처리 적용 |
| | 구매 이력 | 총 주문 횟수, 총 주문 금액, 마지막 주문일 | Admin | Number, Date | 주문 완료 / 취소 시 실시간 증감 트랜잭션 필요 |
| | 포인트 | 현재 포인트 잔액 | App/Web/Admin | Number | 적립/사용/만료/취소(Rollback)에 따른 원장 로그 기록 병행 |
| **약관/동의** | 약관별 동의 | 서비스이용, 개인정보방침, 제3자제공, 위치정보 | App/Web | Boolean, Date, Version | 약관 개정 시 버저닝(version) 관리 및 재동의 팝업 노출 로직 |
| | 마케팅 수신 | 앱푸시(push), SMS, 이메일 수신 동의 분리 | App/Web | Boolean, Date | 알림 발송 전(푸시/알림톡) 반드시 회원의 개별 수신동의 여부 필터링 |

---

## 2. 매장 / 스토어 (Store)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **계약/정보** | 기본/사업자 | 점주정보(권한연결), 지역, 사업자/원천/계좌 정보 | Admin | `active`(운영), `inactive`(휴업), `pending`(오픈예정), `terminated`(폐점)<br/>계약상태: `active`, `expired`, `pending_renewal` | 점주(Owner/Staff) 계정 매핑 구조. 폐점 시 앱/웹 비노출 연동 로직 |
| **영업 설정** | 앱운영 상태 | 실시간 제어 스위치 (주문 접수 가능/불가능) | Admin/POS | `open`(영업중), `preparing`(준비중), `break_time`(휴식시간), `closed`(종료), `temporarily_closed`(임시휴업) | 점주 앱 또는 포스에서 수동 토글 변경 시, 서버 동기화되어 사용자 앱에 즉각 반영(주문차단) |
| | 정규 영업시간 | 요일별(평일, 주말, 공휴일 단위) 간편 영업 및 개별 영업 설정 (오픈, 마감, 라스트오더, 브레이크타임) | Admin | `monday`~`sunday` (isOpen: Boolean, Time) | 자정(24시)을 넘어가는 새벽 영업 시간(ex: 익일 02:00) 연산 로직 필수 |
| | 휴무 및 편의 | 정기휴무(주간/월N주차/지정일), 임시휴일, 매장시설(주차장,좌석여부) | Admin | `weekly`, `monthly_nth`, `monthly_date` | 주문 가능한 캘린더 일자 픽커에서 휴무일 비활성화 렌더링 |
| **연동/노출** | 채널 및 연동 | 앱/배민/요기요 등 채널 노출 우선순위, POS, PG, SK 연동코드 | Admin/Ext API| `app`, `web`, `baemin`, `yogiyo`<br/>결제: `kakaopay`, `naverpay` 등 다수 | 입점/제휴 채널 스토어코드 및 POS 시리얼 API 연동 (배치/웹훅) |
| **배달 설정** | 배달/포장 | 배달/포장 온/오프, 최소주문, 거리별 배달비, 예약 픽업 여부 | App/Admin | Boolean, Amount, Distance | 예약 주문 활성화 시 (현재시간 + LeadTime 분 후) 부터 선택가능 제어 |

---

## 3. 프로모션 (Coupon & Discount)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **쿠폰 (다운로드형)** | 발급 및 금액 | 적용범위, 할인유형(금액/비율), 최소/최대금액, 비용 정산비율 | App/Admin | `active`(활성), `inactive`(비활성), `expired`(만료), `exhausted`(소진) | 회원별 다운로드 한도 제한, 발급 동시성 문제(Race Condition) 방어 로직 |
| | 사용조건/스케줄 | 장바구니/특정상품/배달비 전용, 요일/시간 매핑 제한, 타 쿠폰 중복여부 | App/Web/POS| `all`, `delivery`, `pickup` (주문유형)<br/>TimeRange[] | 결제요청 직전(장바구니) 스케줄 및 가맹점 제한(Exclude/Include) 재검증 필수 |
| **할인 (주문 자동형)**| 정책/증정 | 자사할인, 특정상품 N+1 증정, 최소주문금액 충족 증정 할인정책 | Admin/POS | `company`(자사할인), `gift`(증정할인)<br/>증정조건: `n_plus_one`, `min_order` | 결제창 진입 시 대상 카테고리/상품 스캔 후 최적할인 자동 적용 (RoundingSetting 적용) |
| | 적용 대상/채널 | 전체상품 vs 특정상품(옵션구분유무), APP/웹 전용, 전체 매장 vs 지정 매장 | App/Web | 대상유형: `all`, `category`, `product`<br/>채널: `all`,`app`,`pc_web`,`mobile_web` | 상품 상세화면 진입 시 해당 상품에 물린 활성(Active) 할인 텍스트 표출 연동 |

---

## 4. 캠페인 및 이벤트 (Campaign & Event)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **혜택 캠페인 (자동화)** | 트리거(조건) | 주문시(N번째), 가입시, 생일, 특정등급달성, 랜점코드(난수) 업로드 | Batch/API | `draft`(초안), `active`(진행중), `paused`(일시정지), `completed`(종료), `cancelled` | 이벤트 훅(Event Hook) 또는 자정 배치를 통해 조건을 감지하는 워커(Worker) 분리 운영 |
| | 혜택(보상) | 특정 쿠폰 발급, 고정 포인트 적립, 비율 포인트 적립 | App/Admin | 지연단위: `none`(즉시), `days`(N일후), `hours`(지정시간) | 발급 대상자 필터 산출 후 대량 큐(Queue) 발송, 실패 건 재처리 로직 필요 |
| **프론트 이벤트 (노출형)** | 전시/링크 노출 | 일반게시, 배너/상세이미지 지정, 앱 딥링크, 타겟 게시예약, 노출 | App/Web | `scheduled`(예약됨), `active`(진행중), `ended`(종료) | 노출 캐싱 정책(Redis), 예약일시 도래 여부 감지를 통한 실시간 리스트 재정렬 |
| | 고객 참여형 | 정보 수집형(이름/번호/주소 동적 폼), 자동수집형, 공유하기 연동, 주문하기 버튼 | App/Web | 수집유형: `auto`, `form_input`<br/>공유채널: `kakao`, `facebook`, `instagram`, `twitter`, `link_copy` | SNS 공유 카카오톡 OG 메타데이터 매핑, 제3자 제공 동의 수집 내역 암호화 조회 처리 | 

---

### 결론 및 비고
위 명세서는 TypeScript 엔티티(`.ts`)를 기반으로 100% 반영되어 있으며, 상태별로 명확한 Enum 코드를 부여하여 프론트엔드와 백엔드 간 무결성을 유지할 수 있도록 설계되었습니다. 
