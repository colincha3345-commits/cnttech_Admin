# 메뉴(Menu) 관리 시스템 기획 명세서

## 문서 개요
관리자 대시보드 내 메뉴관리 시스템(카테고리, 메뉴, 옵션 카테고리, 옵션 그룹)의 전사 개발 표준 명세서입니다.

## 주요 섹션
- **페이지 프로세스**: 4개 주요 관리 페이지의 기능 흐름 정의
- **프론트엔드 개발 요건**: 입력 형태, 유효성, UI/UX 상호작용 상세 명세
- **백엔드 개발 요건**: 데이터베이스 스키마, API 설계, 비즈니스 로직 제약사항

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/menu/categories` | 카테고리 관리 (Categories) | menu:read |
| `/menu/products` | 메뉴(상품) 관리 (Products) | menu:read |
| `/menu/options` | 옵션 카테고리 관리 (OptionCategories) | menu:read |
| `/menu/option-groups` | 옵션 그룹 관리 (OptionGroups) | menu:read |


## 핵심 관리 페이지
1. 카테고리 관리 (`/menu/categories`) - 트리 구조 기반 2depth 관리
2. 메뉴(상품) 관리 (`/menu/products`) - 상세 속성 및 일괄변경 지원
3. 옵션 카테고리 관리 (`/menu/options`) - 2컬럼 레이아웃 기반 관리
4. 옵션 그룹 관리 (`/menu/option-groups`) - 옵션/상품 아이템 연결 관리

## 주의사항
- 카테고리 삭제 시 하위 항목 존재 여부 검증 필수
- 상품 일괄변경 API는 최대 100건 제한
- 이미지 파일은 5MB 이하, jpg/png/webp만 허용

## 정책 정의

### P1. 상품 판매상태 정책
| 상태값 | 라벨 | 설명 |
| :--- | :--- | :--- |
| `active` | 판매중 | 메뉴 정상 노출 및 주문 가능 |
| `soldout` | 품절 | 메뉴 노출되나 주문 불가 (품절 표시) |

- 기본적으로 **전체 판매상태(`status`) 필드를 사용하여 일괄 변경** 및 앱 전반의 노출/품절 상태를 다룬다.
- 별도로 **채널별(`channels`)** (주문앱 / POS / 키오스크 / 테이블오더) 판매상태 및 노출 여부 세부 설정을 병행한다.
- 기본값: 전체 상태 `'active'` (판매중), 전 채널 `'active'`.

### P2. 채널별 판매 설정 정책
| 채널 | 키 | 설명 |
| :--- | :--- | :--- |
| 주문앱 | `channels.app` | 고객 모바일 주문앱 노출 여부 + 판매상태 |
| POS | `channels.pos` | 매장 POS 시스템 노출 여부 + 판매상태 |
| 키오스크 | `channels.kiosk` | 매장 키오스크 노출 여부 + 판매상태 |
| 테이블오더 | `channels.tableOrder` | 매장 테이블오더 노출 여부 + 판매상태 |

- 각 채널은 독립적으로 노출 여부와 판매상태를 설정한다.
- 채널 Switch OFF → `false` (비노출), Switch ON → `'active'` (판매중) 또는 `'soldout'` (품절) 선택.
- 전체 노출을 제어하는 별도 `isVisible` 필드는 사용하지 않는다 (채널 설정으로 통합).

### P3. POS 표시명 정책
- POS 표시명(`posDisplayName`)은 메뉴명 하단에 배치한다.
- **미입력 시 메뉴명(`name`)을 자동 사용**한다 (placeholder에 현재 메뉴명 표시).
- 최대 20자 제한.

### P4. 상품코드·포스코드 정책
- **상품코드(`productCode`)**: 서비스 내부 상품 식별 코드. 최대 20자.
- **포스코드(`posCode`)**: POS 시스템 연동 식별 코드. 최대 20자.
- 두 코드 모두 선택 입력사항이며, 등록 폼에서만 입력/관리된다.

### P5. POS 버튼 색상 정책
- POS 버튼 색상(`posColor`)은 가격 하단에 배치한다.
- 12색 프리셋 팔레트에서 선택: `#FF6B35, #FF4D4F, #FA8C16, #FADB14, #52C41A, #13C2C2, #1890FF, #722ED1, #EB2F96, #8C8C8C, #262626, #FFFFFF`.
- 미선택 시 기본색(`#FFFFFF`).
- POS 채널 활성화 여부와 무관하게 항상 노출한다.

### P6. 폼 필드 배치 정책 (상품 등록/수정)
| 순서 | 필드 | 비고 |
| :---: | :--- | :--- |
| 1 | 대표 이미지 + 서브 이미지 | |
| 2 | 메뉴명 | 필수, 50자, `<br>` 줄바꿈 허용 |
| 3 | POS 표시명 | 선택, 미입력 시 메뉴명 사용 |
| 4 | 상품코드 | 선택 |
| 5 | 포스코드 | 선택 |
| 6 | 가격 | 필수 |
| 7 | POS 버튼 색상 | 선택 |
| 8 | 메뉴 설명 | 필수 |
| 9 | 아이콘뱃지 | 선택 |
| 10 | 카테고리 설정 | 필수, 1차+2차 쌍 |
| 11 | 판매 설정 (채널별) | 채널별 노출+상태 통합 |
| 12 | 판매기간 | 선택 |
| 13 | 가맹점 적용 | 전체/선택 |
| 14 | 결제수단 허용 | 쿠폰/교환권/금액권/할인 등 |
| 15 | 형태/영양 상세정보 | 영양정보/사이즈별 영양정보 |

### P7. 일괄 변경 정책
| 변경 항목 | 설명 |
| :--- | :--- |
| 판매상태 | `active`(판매중) / `soldout`(품절) 선택 |
| 판매가 | 고정 금액 또는 비율(%) 변경 |

- 최대 100건까지 일괄 변경 가능.
- 변경 결과(성공/실패 건수)를 Toast로 안내.
- ~~품절여부(stock) 일괄 변경 탭은 삭제됨~~ → 판매상태로 통합.

### P8. 삭제된 필드 (미사용)
| 필드 | 사유 |
| :--- | :--- |
| `isVisible` (앱 노출) | 별도의 활성화 대신 판매상태(`status`) 및 채널별 설정으로 대체 |
| `scheduledAt` (게시 예약) | `pending` 상태 제거에 따라 삭제 |
| `tags` (속성 태그) | 기능 삭제 |
| 일괄변경 `stock` 탭 | 일괄변경 항목을 판매상태(`status`)로 통합 |

### P9. 옵션 그룹 선택 타입 정책
| 선택 타입 | 라벨 | 설명 |
| :--- | :--- | :--- |
| `single` | 단일선택 | 라디오 버튼 방식, 1개만 선택 가능 (예: 사이즈) |
| `multi` | 다수선택 | 체크박스 방식, 복수 선택 + 수량 지정 가능 (예: 토핑) |

- 단일선택: `minSelection=0`, `maxSelection=1` 고정.
- 다수선택: 최소/최대 선택 수량 별도 입력, 아이템별 `maxQuantity` 지정 가능.

본 문서는 관리자 대시보드 내 **메뉴관리 카테고리**(카테고리, 메뉴, 옵션 카테고리, 옵션 그룹)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 페이지 프로세스 (Page Process)

### 1.1 카테고리 관리 (`/menu/categories`)

1. **카테고리 트리 조회** — 좌측에 1depth/2depth 트리 구조를 렌더링한다. 각 노드에는 이름, 노출 여부 아이콘, 표시 순서를 표기한다.
2. **카테고리 등록** — 우측 폼에서 이름, 설명, 노출 여부를 입력한다. 1depth 선택 시 하위 2depth를 추가할 수 있다.
3. **카테고리 수정/삭제** — 트리 노드 클릭 시 우측 폼에 기존 데이터를 바인딩한다. 삭제 시 하위 카테고리 존재 여부를 확인 후 ConfirmDialog를 노출한다.
4. **연결된 상품 순서 설정** — 1depth/2depth 모두에서 카테고리 선택 시 우측 패널 상단에 `[순서 설정]` 버튼이 노출된다. 모달에서 ▲/▼ 버튼으로 노출 순서를 변경하고 저장한다.
  - **사용 상세**: "순서 설정" 버튼 클릭 → 모달 오픈 → 해당 카테고리 소속 전체 상품이 현재 sortOrder 순으로 나열 → 위/아래 버튼으로 순위 교체 → 저장 버튼으로 API 반영.

### 1.2 메뉴(상품) 관리 (`/menu/products`)

1. **메뉴 목록 조회** — 카테고리, 키워드 필터를 조합하여 목록을 조회한다. 채널별 판매상태(판매중/품절/비노출)를 Badge로 표출한다.
2. **메뉴 등록/수정** — 상세 페이지에서 기본정보(이름, POS표시명, 상품코드, 포스코드, 가격, POS색상, 설명, 이미지), 카테고리 설정, 옵션 그룹 연결, 판매 설정(채널별 관리), 결제 정책(쿠폰/금액권 등), 영양정보를 입력한다.
3. **판매 설정 (채널 통합 관리)** — 전체의 판매/품절 상태(`status`)와 4개 채널(주문앱/POS/키오스크/테이블오더)의 개별 설정(`channels`)을 동시에 관리한다.
4. **일괄 변경** — 목록에서 다중 선택 후 전체 판매상태(`status`) 또는 판매가를 일괄 변경한다. 변경 결과(성공/실패 건수)를 Toast로 안내한다.
5. **노출 순서 관리** — 드래그 앤 드롭 또는 순서 입력으로 표시 순서를 조정한다.

### 1.3 옵션 카테고리 관리 (`/menu/options`)

1. **목록 조회** — 2컬럼 레이아웃(좌측 목록 + 우측 등록/수정 폼)으로 구성한다.
2. **등록/수정** — 옵션명, 포스코드, 가격, 최대 수량, 이미지, 노출 여부를 입력한다.

### 1.4 옵션 그룹 관리 (`/menu/option-groups`)

1. **그룹 목록** — 그룹명, 선택 타입(단일/다수), 필수/선택 여부, 선택 수량, 연결된 아이템 수를 목록에 노출한다.
2. **그룹 등록/수정** — 선택 타입(단일선택/다수선택)을 라디오 버튼으로 지정한 후, 옵션 또는 상품을 아이템으로 추가한다. 다수선택 시 아이템별 최대 수량을 설정할 수 있다. 가격 계산 방식(원가/재설정/차액)을 아이템별로 지정한다.

---

## 1.5 권한별 유즈케이스

| 권한 | 역할 및 수행 가능 작업 |
| :--- | :--- |
| **최고 관리자** | 브랜드 전체 메뉴, 카테고리 기획 및 일괄 변경 / 메뉴 정책 수립 |
| **운영 관리자** | 신메뉴 등록, 가격 변경 (새로고침/페이지 전환 시 반영), 일괄 판매 상태/가격 변경 |
| **가맹점주** | (본사 허가가 있는 경우) 매장 내 일부 메뉴 노출/품절 제어 |

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
| **메뉴명 (name)** | Textarea | Y | 2 ~ 50자 | 주문앱·키오스크·테이블오더 노출 타이틀이다. `<br>` 태그로 줄바꿈 가능하다. |
| **POS 표시명 (posDisplayName)** | Input | N | 최대 20자 | POS 버튼에 표시할 이름이다. 미입력 시 메뉴명(name)을 자동 사용한다. |
| **상품코드 (productCode)** | Input | N | 최대 20자 | 서비스 내 상품 식별 코드다. |
| **포스코드 (posCode)** | Input | N | 최대 20자 | POS 시스템 연동 식별 코드다. |
| **가격 (price)** | Number Input | Y | 0 이상, 정수 | 천 단위 콤마 포맷을 적용한다. 전 채널 공통이다. |
| **POS 버튼 색상 (posColor)** | Color Palette | N | HEX 7자 | 12색 프리셋 팔레트에서 선택한다. 미선택 시 기본색(#FFFFFF)이다. |
| **설명 (description)** | Textarea | Y | 최대 500자 | 줄바꿈 허용한다. 주문앱·키오스크에서 사용한다. |
| **대표 이미지** | File Upload | Y | 5MB 이하, jpg/png/webp | 주문앱·키오스크에서 사용한다. 미리보기 썸네일을 제공한다. |
| **서브 이미지** | Multi File Upload | N | 개당 5MB 이하, 최대 5장 | 주문앱 전용이다. 드래그로 순서 변경 가능하다. |
| **아이콘뱃지 (badgeIds)** | Multi Select | N | - | 등록된 뱃지 중 선택한다. |
| **카테고리 설정** | Multi Pair Select | Y | 최소 1쌍 | 1차+2차 카테고리 쌍을 복수 지정한다. |
| | | | | |
| **[판매 설정 (채널별 통합)]** | **섹션 구분** | | | **채널별 노출 여부 + 판매상태를 하나의 섹션에서 관리한다.** |
| **주문앱 (channels.app)** | Switch + Select | Y | `false`/`active`/`soldout` | Switch OFF=비노출, ON=판매중 or 품절 선택. |
| **POS (channels.pos)** | Switch + Select | Y | `false`/`active`/`soldout` | Switch OFF=비노출, ON=판매중 or 품절 선택. |
| **키오스크 (channels.kiosk)** | Switch + Select | Y | `false`/`active`/`soldout` | Switch OFF=비노출, ON=판매중 or 품절 선택. |
| **테이블오더 (channels.tableOrder)** | Switch + Select | Y | `false`/`active`/`soldout` | Switch OFF=비노출, ON=판매중 or 품절 선택. |
| | | | | |
| **판매기간** | DateRange | N | 시작일-종료일 | 미설정 시 상시 판매로 처리한다. |
| **가맹점 적용** | Radio + Multi Select | Y | 전체/선택 | '선택' 시 매장 검색 팝업을 노출한다. |
| **쿠폰 허용** | Checkbox | Y | Boolean | 기본 true다. |
| **교환권 허용** | Checkbox | Y | Boolean | 기본 true다. |
| **금액권 허용** | Checkbox | Y | Boolean | 기본 true다. |
| **영양 정보** | Number Inputs | N | 0 이상 | 칼로리/나트륨/탄수화물/당류/지방/단백질 6항목이다. |
| **사이즈별 영양정보** | Dynamic List | N | 사이즈명 20자 | 사이즈별 영양정보 세트를 추가한다. |
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
| **선택 타입 (selectionType)** | Radio | Y | `single`/`multi` | 단일선택(라디오) 또는 다수선택(체크박스+수량)이다. |
| **필수 여부 (isRequired)** | Switch | Y | Boolean | true 시 최소 선택 수량 ≥ 1을 강제한다. |
| **최소 선택 (minSelection)** | Number Input | Y(multi) | 0 이상 | 다수선택 시에만 노출한다. isRequired=true 시 1 이상 필수다. |
| **최대 선택 (maxSelection)** | Number Input | Y(multi) | 1 이상 | 다수선택 시에만 노출한다. minSelection ≤ maxSelection 검증한다. |
| **아이템별 최대 수량 (maxQuantity)** | Number Input | N | 1 이상 | 다수선택 시 아이템별 주문 수량 상한이다. |
| **아이템 추가** | Search + Select | Y | 최소 1개 | 옵션 또는 상품을 검색하여 추가한다. |
| **가격 유형 (priceType)** | Select | Y | `original`/`override`/`differential` | 아이템별로 지정한다. |
| **재설정 가격** | Number Input | C(조건) | 0 이상 | priceType=override 시 노출한다. |

**[UI/UX 상호작용 제약사항]**
- 메뉴 이미지 업로드 시 Drag & Drop과 클릭 업로드를 모두 지원하며, 업로드 진행률 프로그레스 바를 표출한다.
- 옵션 그룹 아이템 추가 시 이미 추가된 항목은 목록에서 비활성(Disabled) 처리한다.
- 일괄변경 모달에서는 선택된 메뉴 수와 변경 내용(판매상태/가격)을 미리보기로 제공한다.
- **판매 설정**은 채널별 노출+판매상태를 하나의 섹션("판매 설정")으로 통합 관리한다. 각 채널마다 Switch(노출 여부) + Select(판매중/품절)를 조합한다.
- **POS 표시명**은 메뉴명 바로 아래에 배치하며, placeholder에 현재 메뉴명을 표시하여 미입력 시 메뉴명 사용을 안내한다.
- **상품코드·포스코드**는 가격 상단에, **POS 버튼 색상**은 가격 하단에 배치한다.
- **POS 버튼 색상 팔레트**는 12색 프리셋(#FF6B35, #FF4D4F, #FA8C16, #FADB14, #52C41A, #13C2C2, #1890FF, #722ED1, #EB2F96, #8C8C8C, #262626, #FFFFFF)을 원형 칩으로 제공하며, 선택 시 체크 아이콘을 표시한다.
- 목록 카드에 채널별 판매상태를 Badge로 표기하여 한눈에 확인 가능하도록 한다.

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
| **categoryPairs** | JSON | Y | 배열, 최소 1쌍 | [{mainCategoryId, subCategoryId}] 구조다. |
| **imageUrl** | String | Y | URL 형식 | 주문앱·키오스크 대표 이미지다. S3 경로다. |
| **channels** | JSON | Y | {app, pos, kiosk, tableOrder} | 채널별 판매상태 객체다. 값: `false`(비노출) / `'active'`(판매중) / `'soldout'`(품절). 기본값 전체 `'active'`이다. |
| **posDisplayName** | String | N | 최대 20자 | POS 전용 표시명이다. null 시 name을 사용한다. |
| **posColor** | String | N | 7자 (HEX) | POS 버튼 색상이다. #RRGGBB 형식이다. |
| **productCode** | String | N | 최대 20자 | 서비스 내 상품 식별 코드다. |
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
| **selectionType** | Enum | Y | `single`/`multi` | 단일선택 또는 다수선택이다. |
| **isRequired** | Boolean | Y | - | true 시 minSelection ≥ 1 검증이 필요하다. |
| **minSelection** | Integer | Y | 0 이상 | 최소 선택 수량이다. single 시 0 고정이다. |
| **maxSelection** | Integer | Y | 1 이상 | minSelection 이상이어야 한다. single 시 1 고정이다. |
| **items** | JSON | Y | 배열, 최소 1개 | [{type, referenceId, priceType, overridePrice, maxQuantity}] 구조다. maxQuantity는 multi 시 아이템별 수량 상한이다. |

**[API 및 비즈니스 로직 제약사항]**
- **상품 및 카테고리 업데이트 프론트엔드 반영 시점** — 실시간 웹소켓(WebSocket) 동기화는 서버 부하 및 클라이언트 불필요 렌더링 방지를 위해 지양합니다. **데이터 수정 후 프론트엔드 반영은 "새로고침(Refresh) 및 페이지 전환 시" 수행**됩니다 (예: 변경 API 내부에서 글로벌 캐시 버전을 관리하여, 클라이언트 진입 시 최신 버전을 패치하는 방식 적용).
- **카테고리 삭제 API (`DELETE /api/categories/{id}`)** — 하위 카테고리 또는 연결된 상품이 존재할 경우 삭제를 거부하고 400 에러를 반환한다.
- **상품 일괄변경 API (`PATCH /api/products/bulk`)** — 최대 100건 제한을 두어 대량 요청의 타임아웃을 방지한다. 개별 건의 성공/실패를 배열로 반환한다.
- **판매기간 자동 처리** — 판매 종료일이 도래한 상품은 해당 채널의 판매상태를 `soldout`으로 자동 전환한다.
- **이미지 업로드 API** — presigned URL 방식을 권장하며, 파일 크기(5MB)와 확장자(jpg/png/webp)를 서버에서 재검증한다.
- **채널별 상품 조회 API** — 주문앱(`GET /api/products?channel=app`), POS(`GET /api/products?channel=pos`), 키오스크(`GET /api/products?channel=kiosk`), 테이블오더(`GET /api/products?channel=tableOrder`) 각 채널에 맞는 상품만 필터링하여 반환한다. 채널 값이 `false`인 상품은 제외한다. POS 응답에는 posDisplayName, posColor를 포함하고 description, subImageUrls는 제외한다.
- **채널 필드 기본값** — 상품 생성 시 channels 미전송 시 `{app:'active', pos:'active', kiosk:'active', tableOrder:'active'}`로 기본 설정한다.

**[⚠️ 트래픽/성능 검토]**
- **채널별 상품 조회** — 주문앱/POS/키오스크 각 채널에서 빈번하게 호출된다. 채널별 응답 필드를 분리하고 Redis 캐싱(TTL 5분)을 적용한다. 상품 변경 시 관련 캐시를 무효화한다.
- **상품 일괄변경** — 최대 100건 제한. 개별 건의 성공/실패를 배열로 반환한다. 전체 트랜잭션이 아닌 건별 처리로 부분 실패를 허용한다.
- **이미지 업로드** — presigned URL 방식 S3 직접 업로드. 파일 크기(5MB)와 확장자(jpg/png/webp) 서버 재검증한다.
- **판매기간 배치** — 매 분 판매 종료일이 도래한 상품의 채널 판매상태를 `soldout`으로 자동 전환한다.

---

## 3. 정상작동 시나리오

### 시나리오 1: 카테고리 → 메뉴 → 옵션 등록

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 메뉴관리 진입 → 카테고리 목록 | 카테고리 트리 렌더링 | 드래그 순서 변경 |
| 2 | [카테고리 추가] → 카테고리명 입력 | 생성 후 트리에 추가 | 2~30자 |
| 3 | 카테고리 선택 → [메뉴 등록] | 메뉴 등록 폼 렌더링 | 이름/가격/설명/이미지 |
| 4 | 메뉴 정보 입력 + 이미지 업로드 | 이미지 미리보기 + 유효성 검증 | 가격 > 0 |
| 5 | 채널별 노출 설정 (주문앱/POS/키오스크) | 채널별 토글 스위치 | 최소 1개 채널 ON |
| 6 | [저장] → 메뉴 목록에 추가 | `POST /api/menus` → 목록 갱신 | 카테고리 하위에 표시 |
| 7 | 메뉴 선택 → [옵션 그룹 추가] | 옵션 그룹 폼 (이름/필수여부/최소-최대 선택) | 옵션 항목 추가 |
| 8 | 옵션 항목 추가 (이름/추가금액) | 항목별 입력 | 추가금액 ≥ 0 |
| 9 | [저장] | 메뉴 상세에 옵션 그룹 표시 | 고객앱 주문 시 옵션 선택 가능 |

---

## 4. 개발자용 정책 설명

### 4.1. 메뉴 상태 관리 정책

```
active: 정상 판매 중
soldout: 품절 (고객앱에서 "품절" 라벨, 주문 불가)
hidden: 숨김 (고객앱에서 비노출, 관리자만 확인)

상태 변경 시 연동:
  - soldout 전환 → 해당 메뉴를 포함하는 쿠폰 적용 대상 체크 (쿠폰 정책 연동)
  - hidden 전환 → 진행 중인 이벤트/프로모션 대상에서 제외
```

### 4.2. 채널별 노출 정책

```
channels: { orderApp: boolean, pos: boolean, kiosk: boolean }
전체 false 허용하지 않음 → 최소 1개 채널 ON 필수
POS 전용 필드: posDisplayName(POS 표시명), posColor(12색 팔레트)
```

### 4.3. 옵션 그룹 정책

```
isRequired=true: 고객이 반드시 선택해야 주문 가능
minSelect ~ maxSelect: 선택 가능 범위 (minSelect ≤ maxSelect)
maxSelect=1: 라디오 버튼, maxSelect>1: 체크박스
옵션 추가금액: 메뉴 기본가격 + Σ(선택 옵션 추가금액) = 최종 가격
```



### 공통 규칙 (Common Rules)
- Base URL: `{VITE_API_URL}`
- 인증: HttpOnly 쿠키 기반 세션 인증
- 공통 응답: `{ "data": ... }` 또는 `{ "data": [...], "pagination": {...} }`
- 에러 응답: `{ "error": { "code": "...", "message": "..." } }`


---

## 상품 (Product) API

### 1-1. 상품 목록 조회

```
GET /products
```

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| categoryId | string | N | 1차 카테고리 ID |
| status | string | N | `active` \| `soldout` |
| search | string | N | 상품명/설명 검색 |
| page | number | N | 페이지 (기본값: 1) |
| limit | number | N | 페이지당 건수 (기본값: 20) |

**Response** `200 OK`
```json
{
  "data": [Product],
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

### 1-2. 상품 상세 조회

```
GET /products/:id
```

**Response** `200 OK`
```json
{
  "data": Product
}
```

**Product 스키마**
```typescript
interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  subImageUrls?: string[];

  // 카테고리
  categoryPairs?: CategoryPair[];
  mainCategoryId: string;
  mainCategoryName?: string;
  subCategoryIds: string[];
  subCategoryNames?: string[];

  // 옵션
  optionGroups: ProductOptionGroup[];

  // 판매 설정
  status: 'active' | 'soldout';
  salesStartDate?: DateString;
  salesEndDate?: DateString;

  // 가맹점
  applyToAll: boolean;
  storeIds: string[];

  // 코드
  productCode?: string;
  posCode?: string;
  posDisplayName?: string;
  posColor?: string;

  // 채널별 노출
  channels?: ProductChannels;

  // 결제 정책
  allowCoupon: boolean;
  allowVoucher: boolean;
  allowGiftCard: boolean;
  allowOwnDiscount: boolean;
  allowPartnerDiscount: boolean;

  // 상세 정보
  origin: OriginInfo[];
  nutrition: NutritionInfo;
  nutritionBySize?: NutritionBySize[];
  allergens: Allergen[];

  // 뱃지
  badgeIds: string[];
  displayOrder: number;

  // 메타
  createdAt: DateString;
  updatedAt: DateString;
  createdBy: string;
}

interface CategoryPair {
  id: string;
  mainCategoryId: string;
  subCategoryId: string;
}

interface ProductChannels {
  app: 'active' | 'soldout' | false;
  pos: 'active' | 'soldout' | false;
  kiosk: 'active' | 'soldout' | false;
  tableOrder: 'active' | 'soldout' | false;
}

interface ProductOptionGroup {
  id: string;
  name: string;
  isRequired: boolean;
  isApplied: boolean;
  options: ProductOption[];
}

interface ProductOption {
  id: string;
  name: string;
  price: number;
}

interface OriginInfo {
  ingredient: string;
  origin: string;
}

interface NutritionInfo {
  calories: number;
  sodium: number;
  carbs: number;
  sugar: number;
  fat: number;
  protein: number;
  servingSize: string;
  sizeName?: string;
}

interface NutritionBySize {
  id: string;
  sizeName: string;
  nutrition: NutritionInfo;
}

interface Allergen {
  code: string;
  name: string;
}
```

### 1-3. 상품 생성

```
POST /products
```

**Request Body**
```typescript
interface CreateProductRequest {
  name: string;
  price: number;
  description: string;
  imageUrl?: string;
  subImageUrls?: string[];

  categoryPairs: CategoryPair[];
  mainCategoryId: string;
  subCategoryIds: string[];

  optionGroupIds: string[];

  status: 'active' | 'soldout';
  salesStartDate?: DateString;
  salesEndDate?: DateString;

  applyToAll: boolean;
  storeIds: string[];

  productCode?: string;
  posCode?: string;
  posDisplayName?: string;
  posColor?: string;
  channels?: ProductChannels;

  allowCoupon: boolean;
  allowVoucher: boolean;
  allowGiftCard: boolean;
  allowOwnDiscount: boolean;
  allowPartnerDiscount: boolean;

  origin: OriginInfo[];
  nutrition: NutritionInfo;
  nutritionBySize?: NutritionBySize[];
  allergens: string[]; // 알레르겐 코드 배열

  badgeIds: string[];
  displayOrder: number;
}
```

**Response** `201 Created`
```json
{
  "data": Product
}
```

### 1-4. 상품 수정

```
PUT /products/:id
```

**Request Body**: `Partial<CreateProductRequest>` (변경 필드만 전송)

**Response** `200 OK`
```json
{
  "data": Product,
  "message": "상품 정보가 업데이트되었습니다. 클라이언트는 새로고침/페이지 전환 시 변경사항을 최신화합니다."
}
```

### 1-5. 상품 삭제

```
DELETE /products/:id
```

**Response** `200 OK`
```json
{
  "data": {
    "message": "메뉴가 삭제되었습니다",
    "meta": { "affectedStores": 5 }
  }
}
```

### 1-6. 이미지 업로드

```
POST /products/upload-image
Content-Type: multipart/form-data
```

**Request Body**

| 필드 | 타입 | 설명 |
|------|------|------|
| file | File | 이미지 파일 |

**Response** `200 OK`
```json
{
  "data": { "imageUrl": "https://cdn.example.com/products/xxx.jpg" }
}
```

### 1-7. POS 코드 중복 검증

```
POST /products/validate-pos-code
```

**Request Body**
```json
{
  "posCode": "M001",
  "productId": "prod-1"  // 수정 시 자기 자신 제외용 (선택)
}
```

**Response** `200 OK`
```json
{
  "data": { "isValid": true }
}
```

### 1-8. 일괄 노출순서 변경

```
PATCH /products/display-orders
```

**Request Body**
```json
{
  "updates": [
    { "productId": "prod-1", "displayOrder": 1 },
    { "productId": "prod-2", "displayOrder": 2 }
  ]
}
```

**Response** `204 No Content`

---


---

## 카테고리 및 옵션 (Category & Option) API

### 7-1. 카테고리 트리 전체 조회
```
GET /categories/tree
```
**Response** `200 OK`
```json
{
  "data": [
    {
      "id": "cat-main-1",
      "name": "치킨",
      "displayOrder": 1,
      "subCategories": [
        {
          "id": "cat-sub-1",
          "name": "후라이드",
          "displayOrder": 1
        }
      ]
    }
  ]
}
```

### 7-2. 옵션 그룹 목록 조회
```
GET /options/groups
```
**Query Parameters**: `search`, `page`, `limit`
**Response** `200 OK`

### 7-3. 옵션 그룹 생성
```
POST /options/groups
```
**Request Body**
```json
{
  "name": "소스 추가",
  "isRequired": false,
  "maxSelect": 3,
  "options": [
    { "name": "양념 소스", "price": 500 },
    { "name": "머스타드", "price": 500 }
  ]
}
```
**Response** `201 Created`

### 7-4. 카테고리별 상품 노출 순서 조회
```http
GET /categories/:id/products/orders
```
**Response** `200 OK`
```json
{
  "data": [
    { "productId": "prod-1", "productName": "뿌링클", "sortOrder": 1 },
    { "productId": "prod-2", "productName": "맛초킹", "sortOrder": 2 }
  ]
}
```

### 7-5. 카테고리별 상품 노출 순서 업데이트
```http
PUT /categories/:id/products/orders
```
**Request Body**
```json
{
  "orders": [
    { "productId": "prod-1", "sortOrder": 1 },
    { "productId": "prod-2", "sortOrder": 2 }
  ]
}
```
**Response** `200 OK`

---
