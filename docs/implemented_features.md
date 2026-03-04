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

## 5. 주문 (Order)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **주문 기본** | 주문 식별 | 주문ID(PK), 주문번호(orderNumber, 날짜+시퀀스 채번), 주문유형, 채널 | App/POS/Admin | `pending`(접수대기), `confirmed`(접수), `preparing`(준비중), `ready`(준비완료), `completed`(완료), `cancelled`(취소) | 상태 전이는 순방향만 허용(pending→confirmed→preparing→ready→completed). cancelled는 모든 단계에서 가능. 서버에서 전이 유효성 검증 필수 |
| | 주문 유형/채널 | 배달(delivery), 포장(pickup), 매장식사(dine_in) / 앱(app), 키오스크(kiosk), POS(pos), 웹(web) | App/POS/Admin | `delivery`, `pickup`, `dine_in` / `app`, `kiosk`, `pos`, `web` | 주문 유형에 따라 배달비/배달주소 필드 활성화. 채널별 주문 통계 집계 대상 |
| **결제** | 결제 수단 | 카드/현금/간편결제(카카오페이,네이버페이 등)/포인트/쿠폰/금액권/교환권/복합결제 | App/POS | `card`, `cash`, `kakao_pay`, `naver_pay`, `point`, `coupon`, `voucher`, `gift_card`, `mixed` | 복합결제(mixed) 시 payments 배열에 개별 결제수단별 금액·상태를 기록. 개별 취소 API 분리 운영 |
| | 취소/환불 | 취소사유(고객요청/재료소진/매장마감/기타), 상세사유, 취소자, 취소일시 | Admin/POS | cancelInfo: {reason, reasonDetail, cancelledBy, cancelledAt} | 취소 시 쿠폰/포인트/E쿠폰 원장 자동 환원 트랜잭션 필수. 복합결제 개별취소는 PG사별 부분취소 가능 여부에 따라 전액취소+재결제 플로우 분기 |
| **부가 기능** | 엑셀 내보내기 | 컬럼 선택(주문번호/일시/매장/메뉴/금액/상태 등) 다운로드 | Admin | - | 1만 건 이상 시 비동기 처리 후 다운로드 링크 제공. 백그라운드 완료 시 Toast 알림 |
| | 관리자 메모 | 메모 내용(최대 500자), 작성자, 작성시각 | Admin | - | 삭제 불가 정책. 작성자·시각 함께 기록하여 감사 추적 가능 |

---

## 6. 메뉴 (Menu)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **카테고리** | 트리 구조 | 카테고리ID(PK), 이름(2~30자), 설명, 부모ID(parentId), depth(1/2), 정렬순서, 노출여부 | Admin | isVisible: Boolean, depth: 1 또는 2 | 2depth까지만 허용. 동일 depth+parent 내 이름 중복 불가. 삭제 시 하위 카테고리/연결 상품 존재하면 400 에러 반환 |
| **메뉴(상품)** | 기본 정보 | 상품ID(PK), 메뉴명(2~50자), 가격(0이상 정수), 설명(500자), 대표이미지(5MB/jpg·png·webp), 서브이미지(최대5장), 속성태그, 포스코드(20자) | App/Admin | `active`(판매중), `inactive`(중지), `pending`(대기) | 앱 검색 인덱싱 대상. presigned URL 방식 이미지 업로드. 서버에서 파일 크기/확장자 재검증 |
| | 카테고리·옵션 연결 | 멀티 카테고리 쌍(1차+2차), 옵션그룹 연결(optionGroupIds) | Admin | categoryPairs: [{mainCategoryId, subCategoryId}], 최소 1쌍 | 카테고리 쌍 복수 지정 가능. 옵션 그룹은 UUID 배열로 참조 |
| | 판매 설정 | 판매상태, 노출여부, 게시예약(scheduledAt), 판매기간(DateRange), 가맹점 적용(전체/선택), 쿠폰·교환권·금액권 허용 | Admin | status=pending 시 scheduledAt 필수 | 게시 예약 배치 스케줄러: pending+scheduledAt 도래 상품을 active 자동 전환. 가맹점 '선택' 시 매장 검색 팝업 |
| | 상세 정보 | 원산지(재료명+원산지 동적 리스트), 영양정보(6항목), 사이즈별 영양정보, 알레르기(사전정의 목록), 아이콘뱃지 | Admin | - | 원산지: '+행 추가' 동적 UI. 영양정보: 칼로리/나트륨/탄수화물/당류/지방/단백질 |
| | 일괄변경 | 다중 선택 후 상태/가격/노출 일괄 변경 | Admin | 최대 100건 제한 | PATCH /api/products/bulk — 개별 건 성공/실패 배열 반환. 변경 결과 Toast 안내 |
| **옵션 카테고리** | CRUD | 옵션명(2~30자), 포스코드(20자), 가격(0이상), 최대수량(1~99), 이미지, 노출여부 | Admin | isVisible: Boolean | 2컬럼 레이아웃(좌측 목록+우측 폼). 천 단위 콤마 포맷 |
| **옵션 그룹** | 그룹 관리 | 그룹명(2~30자), 필수여부, 최소선택(0이상), 최대선택(1이상), 아이템(옵션/상품) | Admin | isRequired: Boolean, priceType: `original`/`override`/`differential` | minSelection ≤ maxSelection 검증. isRequired=true 시 min≥1 강제. 이미 추가된 항목은 Disabled 처리 |

---

## 7. 직원 (Staff)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **직원 계정** | 기본 정보 | 직원ID(PK), 이름(2~20자), 연락처(11자리), 이메일, 로그인ID(4~20자 영문+숫자), 직원유형 | Admin | staffType: `headquarters`(본사), `franchise`(가맹점)<br/>status: `invited`(초대됨), `pending_approval`(승인대기), `active`(활성), `inactive`(비활성), `rejected`(거절) | 로그인ID는 Unique 제약. 수정 모드 ReadOnly. 중복확인 버튼으로 사전 체크. 연락처 자동 하이픈 포맷 |
| | 초대/인증 | 초대토큰(UUID), 만료시간(48시간), 비밀번호 해시(bcrypt) | Admin | invitationToken, invitationExpiresAt | 초대 시 토큰 생성+이메일 발송. 수락 시 비밀번호 설정 → pending_approval 전환. 만료 후 재초대 필요 |
| | 비밀번호 관리 | 현재/새/확인 비밀번호(8자 이상, 대/소/숫/특수), 비밀번호 초기화 | Admin | - | 초기화: 임시 비밀번호(8자 랜덤) 생성+감사로그 기록. 변경: 현재 비밀번호 검증 후 갱신. 복잡도 서버 재검증 |
| | 소속 | 본사→팀(teamId), 가맹점→매장(storeId) | Admin | - | 본사 직원은 팀 필수 선택, 가맹점 직원은 매장 필수 선택 |
| **승인 관리** | 승인/반려 | 직원유형 탭(본사/가맹점), 승인 버튼, 반려 사유(최대 200자) | Admin | pending_approval → active(승인) / rejected(반려) | 승인 즉시 active 전환+Toast. 반려 시 사유 필수 입력. 빈 사유 불허 |
| **팀 관리** | CRUD | 팀ID(PK), 팀명(2~30자, Unique), 설명(200자), 팀원 수(집계) | Admin | - | 카드 그리드 레이아웃. 팀원 존재 시 삭제 차단(409 Conflict). memberCount는 가상 컬럼 또는 집계 쿼리 |

---

## 8. 정산 (Settlement)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **정산 내역** | 정산 식별 | 정산ID(PK), 매장ID(FK), 정산기간(period), 주문건수 | Admin | `pending`(정산대기), `calculated`(산출완료), `completed`(지급완료), `on_hold`(보류) | 상태 전이: pending→calculated(배치 산출)→completed(지급). on_hold는 어느 단계든 전환 가능(사유 기록 필수) |
| | 금액 구성 | 총매출, 배달비, 할인합계, 본사지원금(hqSupport), 포인트사용, 쿠폰사용, 교환권사용, 플랫폼수수료, 실정산액(netAmount) | Admin | 모든 금액필드: Integer, 0이상. netAmount는 음수 가능 | netAmount = totalSales + deliveryFee + hqSupport - promotionDiscount - platformFee. 포인트/쿠폰/교환권은 정산 정책에 따라 본사/가맹점 부담 분리 |
| | 주문별 상세 | 정산에 포함된 개별 주문(주문번호, 일시, 메뉴, 금액, 결제수단, 실정산액) | Admin | - | 하단 테이블에 나열. 주문번호 클릭 시 주문 상세로 이동 가능 |
| **통계/조회** | 기간별 통계 | 월별/주별/일별 총매출·총정산·수수료 추이 | Admin | 집계단위: daily/weekly/monthly | Bar/Line 차트+테이블 이중 노출. 복수 매장 비교 랭킹 테이블 |
| | 엑셀 내보내기 | 조회 결과 다운로드 | Admin | - | 현재 필터 기준 데이터 엑셀 변환 |
| **배치 처리** | 정산 산출 | 반월/월 단위 자동 집계 → Settlement 레코드 생성 | Batch | - | 배치 실행 중 주문 변경(취소 등)은 스냅샷 시점 기준 산출. 이후 변경분은 다음 정산 반영. 동시성 제어 필수 |

---

## 9. 고객센터 (Support)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1:1 문의** | 문의 접수 | 문의ID(PK), 유형(customer/franchise), 카테고리(주문/결제/배달/상품/계정/기타), 제목(200자), 내용(5,000자) | App/Admin | `pending`(대기), `in_progress`(처리중), `resolved`(완료), `closed`(종료) | 미답변 건 상단 우선 노출. 상태 전이: pending→in_progress→resolved→closed. 작성자 정보(이름/이메일/연락처 마스킹) 표출 |
| | 답변 처리 | 답변(최대 2,000자), 답변자ID(FK) | Admin | 답변 저장 시 자동 resolved 전환 | 답변 미입력 시 저장 버튼 비활성화. 답변 등록 시 앱 사용자에게 푸시/알림톡 발송 |
| **가맹 문의** | 추가 정보 | 매장명/매장ID 추가 노출 | Admin | 1:1 문의와 동일 상태 | 1:1 문의와 동일 프로세스. 매장 정보 컬럼 추가 |
| **FAQ** | CRUD | FAQ ID(PK), 카테고리(일반/주문/결제/배달/계정/가맹점), 질문(5~200자), 답변(10~5,000자), 정렬순서, 공개여부, 조회수 | App/Admin | isPublished: Boolean | 카테고리별 탭 분류. 2컬럼 레이아웃. 조회수는 Redis 카운터→주기적 DB 동기화 |
| **약관관리** | 약관 CRUD | 약관ID(PK), 유형(서비스/개인정보/마케팅/위치/제3자/환불), 제목(100자), 본문(50,000자), 버전(10자), 상태, 시행일, 공고일, 필수여부, 이미지첨부(최대5장/10MB) | App/Admin | `draft`(초안), `active`(활성), `expired`(만료) | 동일 type의 active 약관은 1건만 유지. 새 active 전환 시 기존 건 expired 자동 전환(트랜잭션). 회원 동의 기록은 약관ID+version 참조 보관 |

---

## 10. 디자인 (Design)

| 대분류 | 중분류 | 세부 속성 (Properties) | 기기/플랫폼 | 상태값 (Status Data) | 기능 플로우 및 필수 작동 요소 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **배너** | 배너 관리 | 배너ID(PK), 배너명(2~50자), 이미지(5MB/jpg·png·webp), 링크URL, 게시위치, 정렬순서, 시작일/종료일, 상시노출 | App/Admin | position: `main_top`/`main_middle`/`main_bottom`/`sub_top`<br/>status: `active`(활성), `inactive`(비활성), `scheduled`(예약) | 위치별 탭/필터 분류. 상시 노출 체크 시 endDate null 저장+DatePicker 비활성화. presigned URL 이미지 업로드 |
| **팝업** | 팝업 관리 | 팝업ID(PK), 팝업명(2~50자), 내용(500자), 이미지, 팝업타입, 디바이스, 노출대상, 노출화면(복수선택), 웹링크/딥링크, 오늘하루안보기, 노출기간 | App/Admin | popupType: `modal`/`screen`/`bottom_sheet`<br/>deviceType: `pc`/`mobile`<br/>exposureTarget: `all`/`guest`/`member` | 타입 변경 시 프리뷰 레이아웃 즉시 전환. 모바일 디바이스 프레임 내 실시간 프리뷰 제공. 노출화면 최소 1개 선택 필수 |
| **아이콘뱃지** | 뱃지 관리 | 뱃지ID(PK), 뱃지명(2~20자), 표시유형(text/image), 텍스트(10자)/색상(HEX)/배경색(HEX), 이미지(2MB) | Admin | displayType: `text`/`image` | 2컬럼 레이아웃. displayType 전환 시 이전 입력값 숨김 처리(삭제X)→재전환 시 복원. 인라인 미리보기 제공 |
| **메인화면** | 섹션 관리 | 사전정의 섹션(배너캐러셀/빠른메뉴/추천메뉴/신메뉴/이벤트목록/공지사항), 노출여부, 정렬순서 | App/Admin | isVisible: Boolean | 드래그 앤 드롭 순서 변경. 앱 메인 API는 isVisible=true만 sortOrder순 반환. Redis 캐싱 권장 |
| **배치 처리** | 상태 자동전환 | 배너/팝업의 startDate/endDate 기반 status 전환 | Batch | scheduled↔active↔inactive | 매 분 또는 매 시간 스케줄러로 감지. 노출 기간 도래/만료 시 자동 전환 |

---

### 결론 및 비고
위 명세서는 TypeScript 엔티티(`.ts`)를 기반으로 100% 반영되어 있으며, 상태별로 명확한 Enum 코드를 부여하여 프론트엔드와 백엔드 간 무결성을 유지할 수 있도록 설계되었습니다.
