# 고객센터(Support) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **고객센터 카테고리**(1:1 문의, 가맹 문의, FAQ, 약관관리)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 페이지 프로세스 (Page Process)

### 1.1 1:1 문의 (`/support/inquiries`)

1. **문의 목록 조회** — 카테고리(주문/결제/배달/상품/계정/기타), 상태(대기/처리중/완료/종료) 필터를 적용하여 목록을 조회한다. 미답변 건은 상단에 우선 노출한다.
2. **문의 상세/답변** — 목록 행 클릭 시 문의 내용과 답변 입력 폼을 노출한다. 답변 작성 후 상태를 resolved로 전환한다.
3. **상태 관리** — pending → in_progress → resolved → closed 순서로 전이한다.

### 1.2 가맹 문의 (`/support/franchise-inquiries`)

1. **문의 목록** — 1:1 문의와 동일한 구조이되, 가맹점명/매장정보가 추가 컬럼으로 노출된다.
2. **답변/상태 관리** — 1:1 문의와 동일한 프로세스를 따른다.

### 1.3 FAQ 관리 (`/support/faq`)

1. **FAQ 목록** — 카테고리(일반/주문/결제/배달/계정/가맹점)별 탭으로 분류한다. 정렬순서, 공개 여부, 조회수를 컬럼에 노출한다.
2. **FAQ 등록/수정** — 2컬럼 레이아웃(좌측 목록 + 우측 폼)에서 카테고리, 질문, 답변, 정렬순서, 공개 여부를 입력한다.
3. **FAQ 삭제** — ConfirmDialog를 거쳐 삭제 처리한다.

### 1.4 약관관리 (`/support/terms`)

1. **약관 목록** — 약관유형(서비스/개인정보/마케팅/위치/제3자/환불)별 필터, 상태(초안/활성/만료)별 필터로 조회한다. 버전 정보를 컬럼에 노출한다.
2. **약관 등록/수정** — 유형, 제목, 본문(에디터), 버전, 공고일, 시행일, 필수 여부, 상태, 이미지 첨부를 설정한다.
3. **약관 삭제** — ConfirmDialog를 거쳐 삭제 처리한다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 1:1 문의 / 가맹 문의

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **검색 키워드** | Input | N | 최대 50자 | 제목, 작성자명으로 검색한다. |
| **카테고리 필터** | Select | N | 6가지 | order/payment/delivery/product/account/etc 선택이다. |
| **상태 필터** | Select | N | 4가지 | pending/in_progress/resolved/closed 선택이다. |
| **상태 Badge** | Badge | Y | - | pending=warning, in_progress=info, resolved=success, closed=secondary 색상이다. |
| **문의 제목 (title)** | Text (ReadOnly) | Y | - | 작성자가 입력한 제목이다. |
| **문의 내용 (content)** | Text (ReadOnly) | Y | - | 작성자가 입력한 내용이다. |
| **작성자 정보** | Text | Y | - | 이름, 이메일, 연락처(마스킹)를 표출한다. |
| **답변 (answer)** | Textarea | Y(답변시) | 최대 2,000자 | 답변 미입력 시 저장 버튼을 비활성화한다. |
| **매장 정보** | Text (ReadOnly) | C(가맹문의) | - | 가맹 문의에만 매장명/매장ID를 노출한다. |

#### FAQ

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **카테고리 (category)** | Select | Y | 6가지 | general/order/payment/delivery/account/franchise 선택이다. |
| **질문 (question)** | Input | Y | 5 ~ 200자 | 앱에 노출되는 질문 텍스트다. |
| **답변 (answer)** | Textarea | Y | 10 ~ 5,000자 | HTML 태그 허용 여부는 정책에 따른다. |
| **정렬 순서 (sortOrder)** | Number Input | Y | 1 이상 | 카테고리 내 오름차순 정렬한다. |
| **공개 여부 (isPublished)** | Switch | Y | Boolean | 비공개 시 앱에서 숨김 처리한다. |
| **조회수 (viewCount)** | Text (ReadOnly) | Y | - | 앱 사용자 조회 수를 집계하여 표출한다. |

#### 약관관리

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **약관 유형 (type)** | Select | Y | 6가지 | service/privacy/marketing/location/thirdparty/refund 선택이다. |
| **제목 (title)** | Input | Y | 최대 100자 | BR태그 포함 가능하다. |
| **본문 (content)** | Textarea (에디터) | Y | 최대 50,000자 | 약관 전문을 입력한다. |
| **버전 (version)** | Input | Y | 최대 10자 | "1.0", "2.1" 형식이다. |
| **공고일 (noticeDate)** | DatePicker | N | YYYY-MM-DD | 약관 고지 일자다. |
| **시행일 (effectiveDate)** | DatePicker | Y | YYYY-MM-DD | 약관 효력 발생 일자다. |
| **필수 여부 (isRequired)** | Switch | Y | Boolean | 필수 약관은 동의 거부 시 서비스 이용 불가다. |
| **상태 (status)** | Select | Y | `draft`/`active`/`expired` | draft=warning, active=success, expired=secondary 색상이다. |
| **이미지 첨부** | Multi File Upload | N | 개당 10MB 이하, 최대 5장 | 약관 관련 이미지를 첨부한다. |

**[UI/UX 상호작용 제약사항]**
- 문의 답변 완료 시 상태가 자동으로 resolved로 전환되며, Toast로 "답변이 등록되었습니다"를 노출한다.
- 약관의 active 상태는 동일 유형(type)당 1건만 허용한다. 새 버전을 active로 변경 시 기존 active 건은 expired로 자동 전환한다.

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 문의

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **type** | Enum | Y | - | 'customer', 'franchise' 만 허용한다. |
| **category** | Enum | Y | - | 'order', 'payment', 'delivery', 'product', 'account', 'etc' 6가지다. |
| **title** | String | Y | 최대 200자 | 문의 제목이다. |
| **content** | Text | Y | 최대 5,000자 | 문의 내용이다. |
| **status** | Enum | Y | - | 'pending', 'in_progress', 'resolved', 'closed' 4가지 상태다. |
| **answer** | Text | N | 최대 2,000자 | 관리자 답변이다. |
| **answeredBy** | UUID (FK) | N | - | 답변 작성자 참조다. |

#### FAQ

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **category** | Enum | Y | - | 6가지 카테고리다. |
| **question** | String | Y | 5 ~ 200자 | 질문 텍스트다. |
| **answer** | Text | Y | 10 ~ 5,000자 | 답변 텍스트다. |
| **sortOrder** | Integer | Y | 1 이상 | 카테고리별 정렬 순서다. |
| **isPublished** | Boolean | Y | - | 공개 여부다. 기본값 false다. |
| **viewCount** | Integer | Y | 0 이상 | 앱 조회수 집계다. |

#### 약관

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **type** | Enum | Y | - | 'service', 'privacy', 'marketing', 'location', 'thirdparty', 'refund' 6가지다. |
| **title** | String | Y | 최대 100자 | 약관 제목이다. |
| **content** | Text | Y | 최대 50,000자 | 약관 본문이다. |
| **version** | String | Y | 최대 10자 | 버전 문자열이다. 동일 type 내 유니크를 권장한다. |
| **status** | Enum | Y | - | 'draft', 'active', 'expired' 3가지다. |
| **isRequired** | Boolean | Y | - | 필수 동의 여부다. |
| **effectiveDate** | Date | Y | - | 시행일이다. |
| **noticeDate** | Date | N | - | 공고일이다. |
| **attachments** | JSON | N | URL 배열, 최대 5개 | 첨부 이미지 URL 배열이다. |

**[API 및 비즈니스 로직 제약사항]**
- **문의 답변 API (`PATCH /api/inquiries/{id}`)** — 답변 저장 시 status를 resolved로 전환하고, 앱 사용자에게 답변 알림(푸시/알림톡)을 발송한다.
- **약관 활성화 로직** — 동일 type의 active 약관은 1건만 유지한다. 새 약관을 active로 변경하는 API 호출 시, 기존 active 건을 expired로 트랜잭션 단위로 전환한다.
- **약관 버전 이력** — 회원의 동의 기록은 약관 ID + version을 참조하여 보관하므로, 삭제보다 expired 처리를 권장한다.
- **FAQ 조회수 증가** — 앱에서 FAQ 상세를 조회할 때 카운터를 증가한다. Redis 카운터 → 주기적 DB 동기화 방식을 권장한다.
