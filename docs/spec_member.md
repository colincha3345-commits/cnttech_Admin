# 회원(Member) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **회원(Member) 관리 카테고리**의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서입니다. 모든 명세는 개발 시 예외 처리 및 데이터 정합성을 보장하기 위해 작성되었습니다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/app-members` | 전체 회원 목록 (AppMemberList) | app-members:read |
| `/app-members/inactive` | 90일 미접속 회원 (AppMemberList filter=inactive_90days) | app-members:read |
| `/app-members/no-order` | 미주문 회원 (AppMemberList filter=no_order) | app-members:read |
| `/app-members/:id` | 회원 상세 (AppMemberDetail) | app-members:read |

> **구현 특이사항**: 회원 상세 탭: MemberInfoTab(기본정보/단골매장/배달지), OrderHistoryTab, PointHistoryTab, CouponHistoryTab, VoucherHistoryTab(교환권). PointAdjustModal/CouponAdjustModal로 수동 지급.


## 1. 페이지 프로세스 (Page Process)

1. **회원 목록 조회 (List View)**
   - 관리자가 회원 메뉴에 진입하면 기본적으로 최신 가입일순으로 정렬된 회원 리스트를 노출합니다.
   - 상단 검색 영역에서 텍스트(이름, 연락처 등), 등급, 상태, 가입일 범위, 마케팅 동의 여부 필터를 적용하여 조회할 수 있도록 합니다.
   - 리스트 항목 클릭 시 **회원 상세 페이지**로 이동합니다.

2. **회원 상세 조회 (Detail View)**
   - 선택한 회원의 기본 신상 정보, 소셜 연결 상태, 약관 동의 이력, 구매 내역 및 포인트 잔액을 한 화면에 탭 또는 카드 형태로 분리하여 제공합니다.
   - 상태 변경(장기미접속 해제, 강제 탈퇴 등) 및 수동 관리 기능(포인트 수기 지급 등)이 필요한 경우 모달을 통해 별도 프로세스를 거치도록 합니다.

3. **기능 제어 및 보상 (Action & Reward)**
   - 회원 목록에서 대상자를 다중 선택하여 일괄 혜택(포인트/쿠폰)을 지급하거나 엑셀로 내보내는 기능을 우측 상단 액션 바에 배치합니다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **검색 키워드** | Input (텍스트) | N | 최대 50자 | 엔터 키 또는 [검색] 버튼 클릭 시 상태 업데이트 하도록 합니다. |
| **회원명 (name)** | Text | Y | 2자 ~ 20자 이내 | 리스트 및 상세 화면 최상단 렌더링. 빈 값 비허용 처리합니다. |
| **연락처 (phone)** | Text | Y | 11자리 고정 (숫자) | `010-****-1234` 형식으로 자동 하이픈 및 부분 마스킹 렌더링을 적용합니다. |
| **이메일 (email)** | Text | Y | 이메일 정규식 준수 | 유효성 검증 포맷 실패 시 빨간색 Error Text 노출합니다. |
| **성별 (gender)** | Select / Text | N | `male`, `female` | 미입력 시 '선택 안함' 또는 '-' 로 표기합니다. |
| **상태 배지** | Badge | Y | - | 상태(`active`, `inactive`, `dormant`, `withdrawn`)별로 서로 다른 색상의 UI 배지를 적용합니다. |
| **소셜 연동 마크** | Icon | N | - | 카카오, 네이버, 애플 등 연동된 SNS가 있을 시 각 브랜드 아이콘을 표출합니다. |
| **약관/마케팅 동의**| Checkbox (Readonly) | Y | Boolean | 회원 수정 시 임의 변경 불가(Read-only) 정책을 따릅니다. |

**[UI/UX 상호작용 제약사항]**
- 테이블 데이터 로드 시 Skeleton UI 또는 Spinner를 사용하여 로딩 상태를 명확히 인지시킵니다.
- 엑셀 다운로드 클릭 시 즉시 다운로드가 아닌 백그라운드 다운로드 알림(Toast)을 띄우고 완료 시 파일 저장이 이루어지도록 합니다.

---

### 2.2. 백엔드 (Backend) 개발 요건

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 시스템 고유 식별자. 외부에 노출 시 사용 권장합니다. |
| **memberId** | String | Y | 5 ~ 20자 | 로그인에 사용되는 고유 아이디. 중복 불가 처리되어야 합니다. (Unique) |
| **name** | String | Y | 2 ~ 20자 | 암호화 대상 제외. |
| **phone** | String | Y | 11자 (숫자만) | DB 저장 시 하이픈(-) 제거 및 단방향/양방향 암호화 처리를 권장합니다. |
| **email** | String | Y | 최대 100자 | 이메일 유효성 검증. |
| **grade** | String | Y | Enum Value 매핑 | `grade-vip` 등 동적 등급 테이블의 외래키(FK) 형태로 관리합니다. |
| **status** | Enum | Y | - | 'active', 'inactive', 'dormant', 'withdrawn' 4가지 상태만 허용합니다. |
| **pointBalance** | Integer | Y | 0 이상 | 음수(-) 가 될 수 없으며 동시성 제어가 필요한 트랜잭션 컬럼입니다. |
| **birthDate** | String | N | YYYY-MM-DD | 생년월일이다. |
| **gender** | Enum | N | - | 'male', 'female' 만 허용한다. |
| **linkedSns** | JSON | N | 배열 | [{snsType(kakao/naver/google/apple/facebook), snsKey(SNS 고유키), connectedAt}] SNS 연동 목록이다. |
| **termsAgreements** | JSON | N | 배열 | [{termsType(service/privacy/marketing/location/third_party), agreedAt, version}] 약관 동의 이력이다. |
| **favoriteStores** | JSON | N | 배열, 최대 3개 | [{storeId, storeName, address, phone, registeredAt}] 단골매장이다. |
| **deliveryAddresses** | JSON | N | 배열, 최대 10개 | [{id, alias, address, jibunAddress, addressDetail, zipCode, lat, lng, isDefault, lastUsedAt, createdAt}] 배달지 목록이다. |
| **marketingAgreed** | Boolean | Y | - | 마케팅 수신 동의 여부다. |
| **pushEnabled** | Boolean | Y | - | 푸시 알림 활성화 여부다. |
| **smsEnabled** | Boolean | Y | - | SMS 수신 동의 여부다. |
| **emailEnabled** | Boolean | Y | - | 이메일 수신 동의 여부다. |

**[API 및 비즈니스 로직 제약사항]**
- **조회 API (`GET /api/members`)**
  - 회원 목록 조회 시 민감 정보(연락처 전체 등)는 마스킹 처리하여 반환(Response)해야 합니다.
  - Pagination(page, limit 파라미터)은 필수로 적용되어야 합니다.
- **휴면 전환 배치 (Batch)**
  - 매일 자정, `lastLoginAt` 기준 1년 이상 미접속 계정을 `dormant` 상태로 일괄 전환하는 스케줄러가 필수적으로 구동되어야 합니다.
- **포인트 수정 API (`POST /api/members/{id}/points`)**
  - 관리자의 수기 포인트 조작 시 반드시 해당 사유(reason) 필드를 필수 파라미터로 받아 로그(Audit)에 남기도록 합니다.

**[⚠️ 트래픽/성능 검토]**
- **휴면 전환 배치** — 매일 자정 대량 UPDATE가 발생한다. 청크(1,000건) 단위 처리 + 인덱스(lastLoginAt) 필수이다.
- **포인트 동시성** — pointBalance 갱신 시 SELECT FOR UPDATE 또는 optimistic lock을 적용한다. 동시 결제 시 음수 전환 방지 필수이다.
- **민감정보 마스킹** — 목록 API는 기본 마스킹 반환. unmask 권한이 있는 경우에만 원문 조회 API를 별도 제공한다. 원문 조회 시 감사 로그 기록한다.
- **엑셀 다운로드** — 1만 건 이상 시 비동기 처리 + 다운로드 링크 반환이다.
