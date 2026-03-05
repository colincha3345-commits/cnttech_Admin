# 메뉴(Menu) 관리 시스템 기획 명세서

## 문서 개요
관리자 대시보드 내 메뉴관리 시스템(카테고리, 메뉴, 옵션 카테고리, 옵션 그룹)의 전사 개발 표준 명세서입니다.

## 주요 섹션
- **페이지 프로세스**: 4개 주요 관리 페이지의 기능 흐름 정의
- **프론트엔드 개발 요건**: 입력 형태, 유효성, UI/UX 상호작용 상세 명세
- **백엔드 개발 요건**: 데이터베이스 스키마, API 설계, 비즈니스 로직 제약사항

## 핵심 관리 페이지
1. 카테고리 관리 (`/menu/categories`) - 트리 구조 기반 2depth 관리
2. 메뉴(상품) 관리 (`/menu/products`) - 상세 속성 및 일괄변경 지원
3. 옵션 카테고리 관리 (`/menu/options`) - 2컬럼 레이아웃 기반 관리
4. 옵션 그룹 관리 (`/menu/option-groups`) - 옵션/상품 아이템 연결 관리

## 주의사항
- 카테고리 삭제 시 하위 항목 존재 여부 검증 필수
- 상품 일괄변경 API는 최대 100건 제한
- 이미지 파일은 5MB 이하, jpg/png/webp만 허용
- 게시 예약(pending) 상품은 배치 스케줄러로 자동 활성화 처리

본 문서는 관리자 대시보드 내 **메뉴관리 카테고리**(카테고리, 메뉴, 옵션 카테고리, 옵션 그룹)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 페이지 프로세스 (Page Process)

### 1.1 카테고리 관리 (`/menu/categories`)

1. **카테고리 트리 조회** — 좌측에 1depth/2depth 트리 구조를 렌더링한다. 각 노드에는 이름, 노출 여부 아이콘, 표시 순서를 표기한다.
2. **카테고리 등록** — 우측 폼에서 이름, 설명, 노출 여부를 입력한다. 1depth 선택 시 하위 2depth를 추가할 수 있다.
3. **카테고리 수정/삭제** — 트리 노드 클릭 시 우측 폼에 기존 데이터를 바인딩한다. 삭제 시 하위 카테고리 존재 여부를 확인 후 ConfirmDialog를 노출한다.

### 1.2 메뉴(상품) 관리 (`/menu/products`)

1. **메뉴 목록 조회** — 카테고리, 상태, 키워드 필터를 조합하여 목록을 조회한다. 판매 상태별 Badge(판매중=success, 중지=critical, 대기=warning)를 표출한다. 채널 노출 아이콘(앱/POS/키오스크)을 목록 컬럼에 표기한다.
2. **메뉴 등록/수정** — 상세 페이지에서 기본정보(이름, 가격, 설명, 이미지), **채널별 노출 설정**, 카테고리 설정, 옵션 그룹 연결, 판매 설정, 가맹점 적용, 상세 정보(원산지/영양정보/알레르기)를 입력한다.
3. **채널별 노출 설정** — 상품이 노출되는 채널(주문앱/POS/키오스크·테이블오더)을 개별 Switch로 선택한다. 각 채널이 사용하는 필드는 다음과 같다:
   - **주문앱** — 상품명, 가격, 설명, 이미지(대표+서브) 전체를 활용한다.
   - **POS** — POS 표시명(미입력 시 상품명), 가격, 버튼 색상(팔레트 12색)만 사용한다. 이미지·설명은 POS 화면에 노출하지 않는다.
   - **키오스크/테이블오더** — 주문앱과 동일하게 상품명, 가격, 설명, 대표 이미지를 활용한다.
4. **일괄 변경** — 목록에서 다중 선택 후 상태/가격/노출 여부를 일괄 변경한다. 변경 결과(성공/실패 건수)를 Toast로 안내한다.
5. **노출 순서 관리** — 드래그 앤 드롭 또는 순서 입력으로 표시 순서를 조정한다.

### 1.3 옵션 카테고리 관리 (`/menu/options`)

1. **목록 조회** — 2컬럼 레이아웃(좌측 목록 + 우측 등록/수정 폼)으로 구성한다.
2. **등록/수정** — 옵션명, 포스코드, 가격, 최대 수량, 이미지, 노출 여부를 입력한다.

### 1.4 옵션 그룹 관리 (`/menu/option-groups`)

1. **그룹 목록** — 그룹명, 필수/선택 여부, 선택 수량, 연결된 아이템 수를 목록에 노출한다.
2. **그룹 등록/수정** — 그룹 기본정보 입력 후, 옵션 또는 상품을 아이템으로 추가한다. 가격 계산 방식(원가/재설정/차액)을 아이템별로 지정한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 카테고리

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **카테고리명 (name)** | Input | Y | 2 ~ 30자 | 트리 노드 라벨과 동기화 렌더링한다. |
| **설명 (description)** | Textarea | N | 최대 200자 | 미입력 시 빈 문자열로 저장한다. |
| **노출 여부 (isVisible)** | Switch | Y | Boolean | 비노출 시 트리 노드에 음영(Dimmed) 처리한다. |
| **표시 순서 (order)** | Number | Y | 1 이상 | 동일 depth 내 오름차순 정렬에 사용한다. |
| **상위 카테고리 (parentId)** | Select | N | - | 2depth 등록 시 필수로 변환된다. |

#### 메뉴(상품)

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **메뉴명 (name)** | Input | Y | 2 ~ 50자 | 주문앱·키오스크·테이블오더 노출 타이틀이다. |
| **가격 (price)** | Number Input | Y | 0 이상, 정수 | 천 단위 콤마 포맷을 적용한다. 전 채널 공통이다. |
| **설명 (description)** | Textarea | N | 최대 500자 | 줄바꿈 허용한다. 주문앱·키오스크에서 사용한다. |
| **대표 이미지** | File Upload | Y | 5MB 이하, jpg/png/webp | 주문앱·키오스크에서 사용한다. 미리보기 썸네일을 제공한다. |
| **서브 이미지** | Multi File Upload | N | 개당 5MB 이하, 최대 5장 | 주문앱 전용이다. 드래그로 순서 변경 가능하다. |
| **속성 태그 (tags)** | Multi Select | N | - | 사전 정의된 태그 풀에서 선택한다. |
| **카테고리 설정** | Multi Pair Select | Y | 최소 1쌍 | 1차+2차 카테고리 쌍을 복수 지정한다. |
| | | | | |
| **[채널별 노출 설정]** | **섹션 구분** | | | **상품 등록/수정 폼 내 별도 섹션이다.** |
| **주문앱 노출 (channels.app)** | Switch | Y | Boolean | 기본 true다. 주문앱에 상품을 노출한다. |
| **POS 노출 (channels.pos)** | Switch | Y | Boolean | 기본 true다. POS에 상품을 노출한다. |
| **키오스크 노출 (channels.kiosk)** | Switch | Y | Boolean | 기본 true다. 키오스크·테이블오더에 상품을 노출한다. |
| | | | | |
| **[POS 전용 설정]** | **섹션 구분** | | | **channels.pos=true 시에만 노출한다.** |
| **POS 표시명 (posDisplayName)** | Input | N | 최대 20자 | POS 버튼에 표시할 이름이다. 미입력 시 메뉴명(name)을 사용한다. |
| **POS 버튼 색상 (posColor)** | Color Palette | N | HEX 7자 | 12색 프리셋 팔레트에서 선택한다. 미선택 시 기본색(#FFFFFF)이다. |
| **포스코드 (posCode)** | Input | N | 최대 20자 | POS 연동 식별 코드다. |
| | | | | |
| **판매 상태 (status)** | Select | Y | `active`/`inactive`/`pending` | 상태별 Badge 색상을 적용한다. |
| **노출 여부 (isVisible)** | Switch | Y | Boolean | 비노출 메뉴는 전 채널에서 숨김 처리한다. |
| **게시 예약 (scheduledAt)** | DateTimePicker | N | YYYY-MM-DD HH:mm | status=pending 시에만 활성화한다. |
| **판매기간** | DateRange | N | 시작일-종료일 | 미설정 시 상시 판매로 처리한다. |
| **가맹점 적용** | Radio + Multi Select | Y | 전체/선택 | '선택' 시 매장 검색 팝업을 노출한다. |
| **쿠폰 허용** | Checkbox | Y | Boolean | 기본 true다. |
| **교환권 허용** | Checkbox | Y | Boolean | 기본 true다. |
| **금액권 허용** | Checkbox | Y | Boolean | 기본 true다. |
| **원산지 정보** | Dynamic List | N | 재료명 30자, 원산지 30자 | '+행 추가' 버튼으로 동적 행을 추가한다. |
| **영양 정보** | Number Inputs | N | 0 이상 | 칼로리/나트륨/탄수화물/당류/지방/단백질 6항목이다. |
| **사이즈별 영양정보** | Dynamic List | N | 사이즈명 20자 | 사이즈별 영양정보 세트를 추가한다. |
| **알레르기 정보** | Multi Checkbox | N | - | 사전 정의 알레르겐 목록에서 선택한다. |
| **아이콘뱃지** | Multi Select | N | - | 등록된 뱃지 중 선택한다. |
| **표시 순서** | Number | Y | 1 이상 | 카테고리 내 정렬 순서다. |

#### 옵션 카테고리

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **옵션명 (name)** | Input | Y | 2 ~ 30자 | 고객 앱 노출명이다. |
| **포스코드 (posCode)** | Input | Y | 최대 20자 | POS 연동 코드다. |
| **가격 (price)** | Number Input | Y | 0 이상 | 천 단위 콤마 포맷을 적용한다. |
| **최대 수량 (maxQuantity)** | Number Input | Y | 1 ~ 99 | 주문 시 개별 옵션 최대 수량 제한이다. |
| **이미지 (imageUrl)** | File Upload | N | 5MB 이하 | 옵션 아이콘/사진이다. |
| **노출 여부 (isVisible)** | Switch | Y | Boolean | 비노출 시 앱에서 숨김 처리한다. |

#### 옵션 그룹

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **그룹명 (name)** | Input | Y | 2 ~ 30자 | 앱 노출 그룹 타이틀이다. |
| **필수 여부 (isRequired)** | Switch | Y | Boolean | true 시 최소 선택 수량 ≥ 1을 강제한다. |
| **최소 선택 (minSelection)** | Number Input | Y | 0 이상 | isRequired=true 시 1 이상 필수다. |
| **최대 선택 (maxSelection)** | Number Input | Y | 1 이상 | minSelection ≤ maxSelection 검증한다. |
| **아이템 추가** | Search + Select | Y | 최소 1개 | 옵션 또는 상품을 검색하여 추가한다. |
| **가격 유형 (priceType)** | Select | Y | `original`/`override`/`differential` | 아이템별로 지정한다. |
| **재설정 가격** | Number Input | C(조건) | 0 이상 | priceType=override 시 노출한다. |

**[UI/UX 상호작용 제약사항]**
- 메뉴 이미지 업로드 시 Drag & Drop과 클릭 업로드를 모두 지원하며, 업로드 진행률 프로그레스 바를 표출한다.
- 옵션 그룹 아이템 추가 시 이미 추가된 항목은 목록에서 비활성(Disabled) 처리한다.
- 일괄변경 모달에서는 선택된 메뉴 수와 변경 내용을 미리보기로 제공한다.
- **채널별 노출 설정**은 상품 등록/수정 폼의 별도 섹션("채널 노출")으로 구성한다. POS 전용 설정(POS 표시명, 버튼 색상)은 POS 노출 Switch가 활성화된 경우에만 노출한다.
- **POS 버튼 색상 팔레트**는 12색 프리셋(#FF6B35, #FF4D4F, #FA8C16, #FADB14, #52C41A, #13C2C2, #1890FF, #722ED1, #EB2F96, #8C8C8C, #262626, #FFFFFF)을 원형 칩으로 제공하며, 선택 시 체크 아이콘을 표시한다.
- 목록 컬럼에 채널 노출 상태를 아이콘(📱앱/🖥️POS/📟키오스크)으로 표기하여 한눈에 확인 가능하도록 한다.

**[채널별 필드 사용 매트릭스]**

| 필드 | 주문앱 | POS | 키오스크/테이블오더 |
| :--- | :---: | :---: | :---: |
| **name (상품명)** | O | O (posDisplayName 우선) | O |
| **price (가격)** | O | O | O |
| **description (설명)** | O | X | O |
| **imageUrl (대표이미지)** | O | X | O |
| **subImageUrls (서브이미지)** | O | X | X |
| **posDisplayName (POS표시명)** | X | O | X |
| **posColor (POS버튼색상)** | X | O | X |
| **posCode (포스코드)** | X | O | X |

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 카테고리

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 시스템 고유 식별자다. |
| **name** | String | Y | 2 ~ 30자 | 동일 depth+parent 내 중복 불가다. |
| **parentId (FK)** | UUID | N | - | Null이면 1depth, 값이 있으면 2depth다. |
| **depth** | Integer | Y | 1 또는 2 | 3depth 이상은 허용하지 않는다. |
| **order** | Integer | Y | 1 이상 | 동일 depth+parent 내 유니크 제약을 권장한다. |
| **isVisible** | Boolean | Y | - | 기본값 true다. |

#### 메뉴(상품)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 시스템 고유 식별자다. |
| **name** | String | Y | 2 ~ 50자 | 주문앱·키오스크 노출명이다. 검색 인덱싱 대상이다. |
| **price** | Integer | Y | 0 이상 | 음수 불가, 단위: 원(KRW)이다. 전 채널 공통이다. |
| **description** | Text | N | 최대 500자 | 주문앱·키오스크 상품 설명이다. |
| **status** | Enum | Y | - | 'active', 'inactive', 'pending' 만 허용한다. |
| **categoryPairs** | JSON | Y | 배열, 최소 1쌍 | [{mainCategoryId, subCategoryId}] 구조다. |
| **imageUrl** | String | Y | URL 형식 | 주문앱·키오스크 대표 이미지다. S3 경로다. |
| **channels** | JSON | Y | {app, pos, kiosk} | 채널별 노출 Boolean 객체다. 기본값 {app:true, pos:true, kiosk:true}이다. |
| **posDisplayName** | String | N | 최대 20자 | POS 전용 표시명이다. null 시 name을 사용한다. |
| **posColor** | String | N | 7자 (HEX) | POS 버튼 색상이다. #RRGGBB 형식이다. |
| **posCode** | String | N | 최대 20자 | POS 시스템 연동 식별자다. |
| **optionGroupIds** | JSON | N | UUID 배열 | 연결된 옵션 그룹 참조다. |
| **displayOrder** | Integer | Y | 1 이상 | 카테고리별 정렬 순서다. |

#### 옵션 카테고리

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **name** | String | Y | 2 ~ 30자 | 옵션 표시명이다. |
| **posCode** | String | Y | 최대 20자 | POS 연동 코드다. |
| **price** | Integer | Y | 0 이상 | 추가 금액이다. |
| **maxQuantity** | Integer | Y | 1 ~ 99 | 개별 옵션 최대 주문 수량이다. |

#### 옵션 그룹

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **name** | String | Y | 2 ~ 30자 | 그룹 표시명이다. |
| **isRequired** | Boolean | Y | - | true 시 minSelection ≥ 1 검증이 필요하다. |
| **minSelection** | Integer | Y | 0 이상 | 최소 선택 수량이다. |
| **maxSelection** | Integer | Y | 1 이상 | minSelection 이상이어야 한다. |
| **items** | JSON | Y | 배열, 최소 1개 | [{type, referenceId, priceType, overridePrice}] 구조다. |

**[API 및 비즈니스 로직 제약사항]**
- **카테고리 삭제 API (`DELETE /api/categories/{id}`)** — 하위 카테고리 또는 연결된 상품이 존재할 경우 삭제를 거부하고 400 에러를 반환한다.
- **상품 일괄변경 API (`PATCH /api/products/bulk`)** — 최대 100건 제한을 두어 대량 요청의 타임아웃을 방지한다. 개별 건의 성공/실패를 배열로 반환한다.
- **게시 예약 스케줄러** — status=pending이고 scheduledAt이 도래한 상품을 배치로 active 전환하는 워커가 필요하다.
- **이미지 업로드 API** — presigned URL 방식을 권장하며, 파일 크기(5MB)와 확장자(jpg/png/webp)를 서버에서 재검증한다.
- **채널별 상품 조회 API** — 주문앱(`GET /api/products?channel=app`), POS(`GET /api/products?channel=pos`), 키오스크(`GET /api/products?channel=kiosk`) 각 채널에 맞는 상품만 필터링하여 반환한다. POS 응답에는 posDisplayName, posColor를 포함하고 description, subImageUrls는 제외한다.
- **채널 필드 기본값** — 상품 생성 시 channels 미전송 시 {app:true, pos:true, kiosk:true}로 기본 설정한다.
