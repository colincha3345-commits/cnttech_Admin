# 고객센터(Support) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **고객센터 카테고리**(1:1 문의, 가맹 문의, FAQ, 약관관리)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/support/inquiries` | 1:1 문의 목록 (InquiryList type="customer") | support:read |
| `/support/franchise-inquiries` | 가맹 문의 목록 (InquiryList type="franchise") | support:read |
| `/support/faq` | FAQ 관리 (FaqManagement) | support:read |
| `/support/terms` | 약관 관리 (TermsManagement) | support:read |

---

## 2. 페이지 프로세스 (Page Process)

### 2.1 1:1 문의 / 가맹 문의

1. **문의 목록 조회** — 카테고리(order/payment/delivery/product/account/etc), 상태(pending/resolved) 필터. 미답변 건 상단 우선 노출.
2. **문의 상세/답변** — 행 클릭 시 문의 내용과 답변 입력 폼 노출. 답변 작성 시 status=resolved로 자동 전환.
3. **가맹 문의 차이** — 가맹점명/매장정보 추가 컬럼 노출.

### 2.2 FAQ 관리

1. **FAQ 목록** — 카테고리(general/order/payment/delivery/account/franchise)별 탭 분류. 정렬순서, 공개 여부, 조회수 컬럼.
2. **FAQ 등록/수정** — 2컬럼 레이아웃(좌측 목록 + 우측 폼).
3. **FAQ 삭제** — ConfirmDialog 거쳐 삭제.

### 2.3 약관관리

1. **약관 목록** — 유형(6가지)별, 상태(draft/active/expired)별 필터. 버전 정보 컬럼.
2. **약관 등록/수정** — 유형, 제목, 본문(에디터), 버전, 공고일, 시행일, 필수 여부, 상태, 이미지 첨부.
3. **약관 삭제** — ConfirmDialog 거쳐 삭제.

---

## 3. 세부 개발 명세

### 3.1. 프론트엔드 (Frontend) 개발 요건

#### 1:1 문의 / 가맹 문의

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **검색 키워드** | Input | N | 최대 50자 | 제목, 작성자명으로 검색한다. |
| **카테고리 필터** | Select | N | 6가지 | order/payment/delivery/product/account/etc이다. |
| **상태 필터** | Select | N | 2가지 | pending/resolved이다. |
| **상태 Badge** | Badge | Y | - | pending=warning, resolved=success이다. |
| **답변 (answer)** | Textarea | Y(답변시) | 최대 2,000자 | 미입력 시 저장 버튼 비활성화한다. |
| **매장 정보** | Text (ReadOnly) | C(가맹문의) | - | 가맹 문의에만 매장명/매장ID 노출한다. |

> **주의**: 현재 구현상 InquiryStatus는 `'pending' | 'resolved'` 2가지만 사용한다.

#### FAQ

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 |
| :--- | :--- | :---: | :--- | :--- |
| **카테고리 (category)** | Select | Y | 6가지 | general/order/payment/delivery/account/franchise이다. |
| **질문 (question)** | Input | Y | 5 ~ 200자 | 앱 노출 질문 텍스트다. |
| **답변 (answer)** | Textarea | Y | 10 ~ 5,000자 | 답변 텍스트다. |
| **정렬 순서 (sortOrder)** | Number Input | Y | 1 이상 | 카테고리 내 오름차순이다. |
| **공개 여부 (isPublished)** | Switch | Y | Boolean | 비공개 시 앱에서 숨김이다. |
| **조회수 (viewCount)** | Text (ReadOnly) | Y | - | 앱 조회수 집계 표출이다. |

#### 약관관리

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 |
| :--- | :--- | :---: | :--- | :--- |
| **약관 유형 (type)** | Select | Y | 6가지 | service/privacy/marketing/location/thirdparty/refund이다. |
| **제목 (title)** | Input | Y | 최대 100자 | 약관 제목이다. |
| **본문 (content)** | Textarea (에디터) | Y | 최대 50,000자 | 약관 전문이다. |
| **버전 (version)** | Input | Y | 최대 10자 | "1.0", "2.1" 형식이다. |
| **시행일 (effectiveDate)** | DatePicker | Y | YYYY-MM-DD | 약관 효력 발생일이다. |
| **상태 (status)** | Select | Y | 3가지 | draft=warning, active=success, expired=secondary이다. |
| **필수 여부 (isRequired)** | Switch | Y | Boolean | 필수 약관 여부다. |
| **이미지 첨부** | Multi File Upload | N | 10MB 이하, 최대 5장 | 약관 관련 이미지다. |

---

### 3.2. 백엔드 (Backend) 개발 요건

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/api/inquiries` | 문의 목록 조회. type, category, status 필터, Pagination 필수이다. |
| GET | `/api/inquiries/:id` | 문의 상세 조회이다. |
| PATCH | `/api/inquiries/:id` | 답변 저장. status→resolved 자동 전환, 앱 푸시/알림톡 발송이다. |
| GET | `/api/faq` | FAQ 목록. category 필터이다. |
| POST | `/api/faq` | FAQ 등록이다. |
| PUT | `/api/faq/:id` | FAQ 수정이다. |
| DELETE | `/api/faq/:id` | FAQ 삭제이다. |
| GET | `/api/terms` | 약관 목록. type, status 필터이다. |
| POST | `/api/terms` | 약관 등록이다. |
| PUT | `/api/terms/:id` | 약관 수정이다. |
| DELETE | `/api/terms/:id` | 약관 삭제이다. |
| PATCH | `/api/terms/:id/activate` | 약관 활성화. 기존 active 건 자동 expired 전환이다. |

#### DB 스키마 (Inquiry)

| 필드 | 타입 | 필수 | 제약 | 비고 |
| :--- | :--- | :---: | :--- | :--- |
| **id (PK)** | UUID | Y | 36자 | 고유 식별자다. |
| **type** | Enum | Y | - | 'customer', 'franchise'이다. |
| **category** | Enum | Y | - | 6가지 카테고리다. |
| **title** | String | Y | 최대 200자 | 문의 제목이다. |
| **content** | Text | Y | 최대 5,000자 | 문의 내용이다. |
| **status** | Enum | Y | - | 'pending', 'resolved'이다. |
| **answer** | Text | N | 최대 2,000자 | 관리자 답변이다. |
| **answeredBy** | UUID (FK) | N | - | 답변 작성자다. |

#### DB 스키마 (FAQ / Terms)

FAQ: id, category, question, answer, sortOrder, isPublished, viewCount
Terms: id, type, title, content(50,000자), version(Unique per type), status, isRequired, effectiveDate, noticeDate, attachments(JSON)

**[비즈니스 로직 제약사항]**
- **답변 API** — 답변 저장 시 resolved 전환 + 앱 푸시/알림톡 발송한다.
- **약관 활성화** — 동일 type의 active는 1건만. 트랜잭션 단위로 기존→expired, 신규→active 전환한다.
- **약관 이력** — 회원 동의 기록은 약관 ID+version 참조. 삭제보다 expired 처리를 권장한다.

**[⚠️ 트래픽/성능 검토]**
- **FAQ 조회수** — Redis 카운터 증가 → 주기적 DB Sync 방식 권장. RDB UPDATE +1 직접 호출 시 핫스팟 Row Lock 병목 발생 가능하다.
- **약관 본문** — content 최대 50,000자이므로 목록 API에서 content 제외 반환. 상세 조회 시에만 포함한다.
