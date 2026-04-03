# 디자인(Design) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **디자인관리 카테고리**(배너, 팝업, 아이콘뱃지, 메인화면)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/design/banners` | 배너 관리 (BannerManagement) | design:read |
| `/design/popups` | 팝업 관리 (PopupManagement) | design:read |
| `/design/icon-badges` | 아이콘뱃지 관리 (IconBadgeManagement) | design:read |
| `/design/main-screen` | 메인화면 관리 (MainScreenManagement) | design:read |


## 1. 페이지 프로세스 (Page Process)

### 1.1 배너 관리 (`/design/banners`)

1. **배너 목록** — 위치(메인상단/메인중간/메인하단/서브상단)별 탭 또는 필터로 분류하여 노출한다. 상태별 Badge(활성=success, 비활성=secondary, 예약=info)를 표기한다.
2. **배너 등록/수정** — 2컬럼 레이아웃(좌측 목록 + 우측 폼)에서 PC/모바일 배너 이미지와 랜딩 URL을 각각 설정하고, 게시위치, 노출기간, 정렬순서를 입력한다. 각 이미지 업로드 아래에 권장 사이즈 안내를 표시한다.
3. **상시 노출** — '상시 노출' 체크 시 종료일 DatePicker를 비활성화한다.

### 1.2 팝업 관리 (`/design/popups`)

1. **팝업 목록** — 타입(모달/전면/바텀시트)별 필터로 분류한다. 디바이스(PC/모바일), 노출대상(전체/비회원/회원), 노출화면 정보를 컬럼에 표기한다.
2. **팝업 등록/수정** — 팝업 타입, 디바이스, 노출 대상, 노출 화면(복수 선택), 이미지, 웹링크/딥링크, 노출기간, '오늘 하루 안보기' 옵션을 설정한다.
3. **미리보기** — 우측 영역에 모바일 디바이스 프레임 내 실시간 프리뷰를 제공한다.

### 1.3 아이콘뱃지 관리 (`/design/icon-badges`)

1. **뱃지 목록** — 2컬럼 레이아웃(좌측 목록 + 우측 폼)으로 구성한다. 각 뱃지의 미리보기(텍스트형/이미지형)를 인라인으로 표출한다.
2. **뱃지 등록/수정** — 표시 유형(텍스트/이미지) 선택에 따라 텍스트+색상 입력 또는 이미지 업로드 폼을 동적 전환한다.

### 1.4 메인화면 관리 (`/design/main-screen`)

1. **섹션 목록** — 앱 메인화면의 섹션(배너캐러셀, 빠른메뉴, 추천메뉴, 신메뉴, 이벤트목록, 공지사항)을 정렬 순서대로 나열한다.
2. **순서 변경** — 드래그 앤 드롭으로 섹션 순서를 변경한다.
3. **노출 토글** — 각 섹션의 노출/비노출 Switch를 제공한다.
4. **추천메뉴 설정** — "추천 메뉴" 섹션의 상세 관리(`[상세 관리]` 버튼)를 통해 전체 메뉴에서 메인에 노출할 상품에 대해 검색하여 추가하고, 직접 노출 순서(▲/▼ 방향 아이콘)를 배정 및 저장한다.
   - **사용 상세**: 메인화면 섹션 관리 목록에서 "추천 메뉴" 섹션 항목에만 노출되는 상세 버튼 클릭 시 `RecommendedMenuManager` 모달이 오픈. 좌측에는 전체 상품을 이름 검색으로 찾아 "추천 메뉴" 목록으로 추가할 수 있고, 우측에서는 등록된 추천 상품들의 위/아래 순위를 교체하며 지정한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 배너

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **배너명 (title)** | Input | Y | 2 ~ 50자 | 관리용 타이틀이다. 앱에는 노출하지 않는다. |
| **PC 배너 이미지 (pcImageUrl)** | File Upload | Y(최소 1개) | 5MB 이하, jpg/png/webp | 권장 사이즈: 1200 × 586px. PC 웹에서 노출되는 배너 이미지다. |
| **모바일 배너 이미지 (mobileImageUrl)** | File Upload | Y(최소 1개) | 5MB 이하, jpg/png/webp | 권장 사이즈: 331 × 196px. 모바일 앱에서 노출되는 배너 이미지다. |
| **PC 랜딩 URL (pcLinkUrl)** | Input | N | URL 형식 | PC에서 클릭 시 이동할 웹 경로다. |
| **모바일 랜딩 URL (mobileLinkUrl)** | Input | N | URL/딥링크 형식 | 모바일에서 클릭 시 이동할 경로다. (예: myapp://events) |
| **게시 위치 (position)** | Select | Y | 4가지 | main_top/main_middle/main_bottom/sub_top 선택이다. |
| **정렬 순서 (sortOrder)** | Number Input | Y | 1 이상 | 동일 위치 내 오름차순 정렬한다. |
| **시작일 (startDate)** | DatePicker | Y | YYYY-MM-DD | 노출 시작일이다. |
| **종료일 (endDate)** | DatePicker | C(상시 미체크시) | YYYY-MM-DD | 상시 노출 체크 시 비활성화한다. |
| **상시 노출 (isAlwaysOn)** | Checkbox | N | Boolean | 체크 시 endDate를 null로 저장한다. |

#### 팝업

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **팝업명 (title)** | Input | Y | 2 ~ 50자 | 관리용 타이틀이다. |
| **내용 (content)** | Textarea | N | 최대 500자 | 팝업 본문 텍스트다. |
| **이미지 (imageUrl)** | File Upload | Y | 5MB 이하 | 팝업 메인 이미지다. |
| **팝업 타입 (popupType)** | Select | Y | `modal`/`screen`/`bottom_sheet` | 타입별 프리뷰 레이아웃이 변경된다. |
| **디바이스 (deviceType)** | Select | Y | `pc`/`mobile` | PC/모바일 분기 노출이다. |
| **노출 대상 (exposureTarget)** | Select | Y | `all`/`guest`/`member` | 전체/비회원/회원 선택이다. |
| **노출 화면 (exposureScreen)** | Multi Checkbox | Y | 최소 1개 | main/menu/event 중 복수 선택이다. |
| **웹 링크 (webLinkUrl)** | Input | N | URL 형식 | 웹 브라우저 이동 링크다. |
| **딥링크 (deepLinkUrl)** | Input | N | scheme 형식 | 앱 내 이동 딥링크다. |
| **오늘 하루 안보기** | Checkbox | N | Boolean | 사용자 재노출 방지 옵션이다. |
| **시작일/종료일** | DateRange | Y | YYYY-MM-DD | 상시 노출 옵션 제공한다. |

#### 아이콘뱃지

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **뱃지명 (name)** | Input | Y | 2 ~ 20자 | 관리용 식별명이다. |
| **표시 유형 (displayType)** | Radio | Y | `text`/`image` | 선택에 따라 하단 폼이 전환된다. |
| **텍스트 (text)** | Input | C(text 타입) | 최대 10자 | 뱃지에 표시할 텍스트다. |
| **텍스트 색상 (textColor)** | ColorPicker | C(text 타입) | HEX 형식 | 기본값 #FFFFFF이다. |
| **배경 색상 (bgColor)** | ColorPicker | C(text 타입) | HEX 형식 | 기본값 #FF4D4F이다. |
| **이미지 (imageUrl)** | File Upload | C(image 타입) | 2MB 이하 | 뱃지 이미지 파일이다. |

#### 메인화면

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **섹션 타이틀 (title)** | Text (ReadOnly) | Y | - | 사전 정의된 섹션 타이틀이다. |
| **노출 여부 (isVisible)** | Switch | Y | Boolean | 비노출 시 앱 메인에서 숨김 처리한다. |
| **정렬 순서 (sortOrder)** | Drag & Drop | Y | 1 이상 | 드래그로 순서를 변경한다. |

**[UI/UX 상호작용 제약사항]**
- 팝업 프리뷰는 popupType 변경 시 즉시 레이아웃이 전환되어야 하며, 이미지/텍스트 입력 시 실시간으로 반영한다.
- 아이콘뱃지 displayType 전환 시 이전 타입의 입력값은 초기화하지 않고 숨김 처리하여, 재전환 시 복원한다.

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 배너

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **title** | String | Y | 2 ~ 50자 | 배너 관리명이다. |
| **pcImageUrl** | String | Y(최소 1개) | URL 형식 | PC 배너 이미지 경로다. 권장 1200×586px. |
| **mobileImageUrl** | String | Y(최소 1개) | URL 형식 | 모바일 배너 이미지 경로다. 권장 331×196px. |
| **pcLinkUrl** | String | N | URL 형식 | PC 클릭 시 이동 경로다. |
| **mobileLinkUrl** | String | N | URL/딥링크 형식 | 모바일 클릭 시 이동 경로다. |
| **position** | Enum | Y | 4가지 | 'main_top', 'main_middle', 'main_bottom', 'sub_top' 만 허용한다. |
| **status** | Enum | Y | - | 'active', 'inactive', 'scheduled'이다. startDate/endDate 기반으로 배치 전환한다. |
| **sortOrder** | Integer | Y | 1 이상 | 동일 position 내 정렬 순서다. |

#### 팝업

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **popupType** | Enum | Y | - | 'modal', 'screen', 'bottom_sheet' 만 허용한다. |
| **deviceType** | Enum | Y | - | 'pc', 'mobile' 만 허용한다. |
| **exposureTarget** | Enum | Y | - | 'all', 'guest', 'member' 만 허용한다. |
| **exposureScreen** | JSON | Y | 배열, 최소 1개 | ['main', 'menu', 'event'] 중 복수 선택이다. |
| **showOncePerDay** | Boolean | Y | - | '오늘 하루 안보기' 옵션이다. |

#### 아이콘뱃지

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **displayType** | Enum | Y | - | 'text', 'image' 만 허용한다. |
| **text** | String | C(text시) | 최대 10자 | displayType=text 시 필수다. |
| **textColor** | String | C(text시) | 7자 (HEX) | #RRGGBB 형식이다. |
| **bgColor** | String | C(text시) | 7자 (HEX) | #RRGGBB 형식이다. |
| **imageUrl** | String | C(image시) | URL 형식 | displayType=image 시 필수다. |

#### 추천 메뉴 (Recommended Menu)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | String | Y | - | 고유 식별자 또는 복합키 기반 식별자다. |
| **productId** | String | Y | - | 연결된 상품(Product) ID다. |
| **productName** | String | Y | - | 프론트 노출을 위한 상품(역정규화)명 정보. |
| **sortOrder** | Integer | Y | 1 이상 | 메인화면 "추천 메뉴" 섹션 내에서의 노출 순서다. |

**[API 및 비즈니스 로직 제약사항]**
- **배너/팝업 상태 배치** — 매 분 또는 매 시간 단위로 startDate/endDate를 검사하여 status를 active/scheduled/inactive로 자동 전환하는 스케줄러가 필요하다.
- **앱 메인화면 API** — 사용자 앱에서 메인화면을 요청할 때, 각 섹션의 isVisible=true인 항목만 sortOrder 순으로 반환한다. Redis 캐싱을 권장한다.
- **이미지 업로드** — presigned URL 방식으로 클라이언트에서 S3에 직접 업로드한다. 서버는 URL만 저장한다.

**[⚠️ 트래픽/성능 검토]**
- **배너/팝업 상태 배치** — 매 분 또는 매 시간 startDate/endDate를 검사하여 status를 자동 전환한다. 대상 건수가 적으므로 크론잡으로 충분하다.
- **앱 메인화면 API** — 사용자 앱에서 가장 빈번하게 호출되는 API이다. Redis 캐싱(TTL 1분) 필수. 관리자가 설정 변경 시 캐시 무효화한다.
- **이미지 업로드** — presigned URL 방식으로 S3 직접 업로드. 서버는 URL만 저장한다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 배너 등록

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 배너 관리 → [배너 등록] | 생성 폼 렌더링 | 이미지/링크/전시기간/순서 |
| 2 | 이미지 업로드 + 링크 URL 입력 | 이미지 미리보기 표시 | 권장 사이즈 안내 |
| 3 | 전시기간 설정 + 순서 지정 | DatePicker + Number Input | 순서 중복 허용(동순위) |
| 4 | [저장] → 목록 이동 | 배너 목록에 추가 | 전시기간 내 고객앱 노출 |

### 시나리오 2: 메인화면 섹션 구성

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 메인화면 관리 진입 | 현재 섹션 목록 렌더링 | 드래그 앤 드롭 순서 변경 |
| 2 | 섹션 추가/편집 | 섹션 유형(배너/상품/이벤트) 선택 | 유형별 설정 폼 |
| 3 | 순서 변경 후 [저장] | `PUT /api/design/main-sections` | 고객앱 메인 즉시 반영 |



### 공통 규칙 (Common Rules)
- Base URL: `{VITE_API_URL}`
- 인증: HttpOnly 쿠키 기반 세션 인증
- 공통 응답: `{ "data": ... }` 또는 `{ "data": [...], "pagination": {...} }`
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`


---

## 디자인 및 콘텐츠 (Design & Content) API

### 11-1. 앱 팝업 배너 목록 조회
```
GET /content/popups
```
**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "popup-1",
      "title": "봄 맞이 신메뉴 출시",
      "imageUrl": "https://...",
      "linkUrl": "/products/123",
      "startDate": "2026-03-01T00:00:00Z",
      "endDate": "2026-03-31T23:59:59Z",
      "isActive": true
    }
  ]
}
```

### 11-2. 앱 홈 탭 순서 설정
```
PUT /content/home-tabs
```
**Request Body**
```json
{
  "tabs": ["delivery", "pickup", "event", "brand"]
}
```
**Response** `200 OK`

### 11-3. 메인 추천메뉴 전체 조회
```http
GET /content/main-sections/recommended-menus
```
**Response** `200 OK`
```json
{
  "data": [
    { "productId": "prod-1", "sortOrder": 1 },
    { "productId": "prod-2", "sortOrder": 2 }
  ]
}
```

### 11-4. 메인 추천메뉴 순서 및 목록 갱신
```http
PUT /content/main-sections/recommended-menus
```
**Request Body**
```json
{
  "recommendedMenus": [
    { "productId": "prod-1", "sortOrder": 1 },
    { "productId": "prod-2", "sortOrder": 2 }
  ]
}
```
**Response** `200 OK`

---
