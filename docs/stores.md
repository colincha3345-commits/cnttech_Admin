# 매장 관리 페이지 기획서

> **경로**: `/staff/stores`, `/staff/stores/new`, `/staff/stores/:id`, `/staff/stores/:id/edit`
> **관련 파일**: `src/pages/Store/StoreList.tsx`, `src/pages/Store/StoreDetail.tsx`, `src/pages/Store/StoreForm.tsx`

---

## 📋 개요

가맹점 매장의 전체 라이프사이클을 관리하는 모듈이다. 매장 목록 조회, 상세 정보 열람, 등록/수정, 삭제, 일괄 업로드 등의 기능을 제공한다. 매장 상세 페이지는 기본 정보, 가맹점주, 사업자 정보, 계약, 계좌, 영업정보, 연동정보, 결제수단, 연결된 직원 등 9개 탭으로 구성된다.

---

## 🎯 주요 기능

### StoreList (목록)
| 기능 | 설명 |
| --- | --- |
| **매장 목록 조회** | 테이블 형태로 매장 목록 표시, 페이지네이션 지원 (10건/페이지) |
| **검색** | 매장명, 점주명, 사업자번호로 키워드 검색 |
| **필터링** | 지역(Region), 상태(StoreStatus), 계약 상태(ContractStatus) 3종 필터 |
| **일괄 업로드** | POS 코드 일괄 업로드, PG MID 일괄 업로드 (드롭다운 메뉴) |
| **매장 추가** | `/staff/stores/new` 로 이동 |
| **상세보기** | 행 클릭 또는 [상세보기] 아이콘으로 상세 페이지 이동 |
| **수정/삭제** | 인라인 액션 버튼 |


### StoreDetail (상세)
| 기능 | 설명 |
| --- | --- |
| **9개 탭** | basic, owner, business, contract, bank, operating, integration, payment, staff |
| **영업정보 관리** | 영업시간, 배달비, 임시휴업, 정기휴무, 편의시설 등 |
| **연동정보 관리** | POS, SK 할인/적립, PG사, 교환권 벤더사 연동 |
| **결제수단 관리** | 카드/현금/포인트 + 간편결제 6종 |
| **직원 연결 관리** | 직원 연결/연결 해제, 역할(가맹점주/직원) 관리 |
| **수정 모달** | OperatingInfoEditModal, IntegrationCodesEditModal, AmenitiesEditModal, ClosedDayEditModal, PaymentMethodsEditModal |


### StoreForm (등록/수정)
| 기능 | 설명 |
| --- | --- |
| **등록/수정 모드** | `mode` prop으로 create/edit 구분 |
| **사업자번호 중복확인** | useCheckBusinessNumber 를 통한 실시간 검증 |
| **폼 유효성 검사** | 필수 필드 검증 (매장명, 주소, 점주, 사업자번호, 계약, 계좌) |
| **기존 데이터 로드** | 수정 모드에서 기존 매장 데이터 자동 로드 |


---

## 🖼️ 화면 구성

### StoreList 화면

#### 1. 헤더 영역
- 페이지 제목: "매장 관리"
- 부제: "가맹점 매장을 관리합니다. (총 N개)"
- [일괄 업로드] 드롭다운 버튼 (UploadOutlined)
  - POS 코드 일괄 업로드 → POSBulkUploadModal
  - PG MID 일괄 업로드 → PGBulkUploadModal
- [매장 추가] 버튼 (PlusOutlined)

#### 2. 필터 영역 (Card)
- **지역**: REGIONS 배열 기반 드롭다운 (17개 지역)
- **상태**: STORE_STATUS_LABELS 기반 드롭다운 (운영중/휴업/오픈예정/폐점)
- **계약**: CONTRACT_STATUS_LABELS 기반 드롭다운 (정상/만료/갱신대기)
- **검색**: 매장명, 점주명, 사업자번호
- [검색] 버튼

#### 3. 테이블 영역 (Card)
| 컬럼 | 설명 |
| --- | --- |
| 매장명 | 매장 이름 (font-medium) |
| 지역 | `store.address.region` |
| 점주명 | `store.owner.name` |
| 사업자번호 | `store.business.businessNumber` (font-mono) |
| 상태 | Badge (active=success, inactive=warning, pending=info, terminated=critical) |
| 계약 상태 | Badge (active=success, expired=critical, pending_renewal=warning) |
| 계약 만료일 | `ko-KR` 날짜 포맷 |
| 액션 | 상세보기(EyeOutlined), 수정(EditOutlined), 삭제(DeleteOutlined) |


- 행 클릭 시 상세 페이지로 이동 (`cursor-pointer`)
- 액션 버튼은 행 클릭 이벤트 전파 차단 (`e.stopPropagation()`)

### StoreDetail 화면

#### 1. 헤더 영역
- [뒤로가기] 버튼 (ArrowLeftOutlined)
- 매장명 + 상태 Badge
- 주소 텍스트
- [수정] 버튼 → 수정 페이지 이동
- [삭제] 버튼 → ConfirmDialog

#### 2. 탭 영역 (9개 탭)

| 탭 key | 라벨 | 주요 표시 정보 |
| --- | --- | --- |
| `basic` | 기본 정보 | 매장명, 매장코드, 상태, 오픈일, 주소, 지역, 운영시간 |
| `owner` | 가맹점주 | 점주명, 연락처(MaskedData), 이메일 |
| `business` | 사업자 정보 | 사업자번호, 상호명, 대표자명, 업종, 업태 |
| `contract` | 계약 정보 | 계약 상태(Badge), 계약일, 만료일, 비고 |
| `bank` | 계좌 정보 | 은행, 계좌번호(MaskedData), 예금주 |
| `operating` | 영업정보 | 매장 노출, 앱 운영상태, 영업시간, 배달비, 임시휴업, 요일별 영업시간, 배달/포장 설정, 정기/비정기 휴무, 편의시설 |
| `integration` | 연동정보 | POS, SK 할인/적립, PG사, 교환권 벤더사 연동 상태 |
| `payment` | 결제수단 | 카드/현금/포인트 + 간편결제 6종 (카카오페이, 네이버페이, 토스페이, 삼성페이, 페이코, 애플페이) |
| `staff` | 연결된 직원 | 직원 목록 테이블 (이름, 역할, 연락처, 이메일, 상태) + 연결/해제 |


- **staff 탭**: 탭 라벨 옆에 연결 직원 수 뱃지 표시

### StoreForm 화면

#### 1. 헤더
- [뒤로가기] 버튼 (ArrowLeftOutlined)
- 페이지 제목: "매장 등록" / "매장 수정" (mode에 따라)

#### 2. 폼 섹션 (6개 Card)
| 섹션 | 필수 필드 | 선택 필드 |
| --- | --- | --- |
| 기본 정보 | 매장명 | 매장코드, 상태, 오픈일, 운영시간 |
| 주소 정보 | 우편번호, 주소 | 지역(기본: 서울), 상세주소 |
| 가맹점주 정보 | 점주명, 연락처 | 이메일 |
| 사업자 정보 | 사업자등록번호(+중복확인), 상호명, 대표자명 | 업종, 업태 |
| 계약 정보 | 계약일, 만료일 | 계약 상태, 비고 |
| 계좌 정보 | 은행, 계좌번호, 예금주 | - |


#### 3. 하단 버튼
- [취소] 버튼 (variant="outline") → 목록 페이지로 이동
- [등록] / [저장] 버튼 → 폼 제출

---

## 🔄 사용자 플로우

### 매장 등록 플로우
```
[매장 추가] 버튼 클릭
  → /staff/stores/new 이동
  → StoreForm(mode='create') 렌더링
  → 폼 입력
    → 사업자번호 입력 후 [중복확인] 클릭
    → 중복: 에러 토스트 + 에러 메시지 표시
    → 가능: 성공 토스트 + 체크 아이콘 표시
  → [등록] 클릭
    → validateForm() 실행 (필수 필드 검증)
    → createStore.mutateAsync(formData)
  → 성공 토스트: "매장이 등록되었습니다."
  → /staff/stores 이동
```

### 매장 수정 플로우
```
목록 [수정] 아이콘 클릭 또는 상세 [수정] 버튼 클릭
  → /staff/stores/:id/edit 이동
  → StoreForm(mode='edit') 렌더링
  → 기존 데이터 자동 로드 (useStore)
  → 폼 수정
  → [저장] 클릭
    → updateStore.mutateAsync({ id, data: formData })
  → 성공 토스트: "매장 정보가 수정되었습니다."
  → /staff/stores 이동
```

### 매장 삭제 플로우
```
목록 또는 상세에서 [삭제] 클릭
  → ConfirmDialog: "'매장명' 매장을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
  → [삭제] 클릭
  → deleteStore.mutateAsync(id)
  → 성공 토스트: "매장이 삭제되었습니다."
  → (상세에서 삭제 시) /staff/stores 이동
```

### 직원 연결/해제 플로우 (상세 - staff 탭)
```
[직원 연결] 버튼 클릭
  → StaffLinkModal 오픈 (storeId, storeName 전달)
  → 직원 선택 + 역할 지정
  → 연결 완료

[연결 해제] 아이콘 클릭
  → ConfirmDialog: "'직원명' 직원의 연결을 해제하시겠습니까?"
  → [해제] 클릭
  → unlinkStaff.mutateAsync(linkId)
  → 성공 토스트: "직원 연결이 해제되었습니다."
```

### 일괄 업로드 플로우
```
[일괄 업로드] 드롭다운 클릭
  → POS 코드 일괄 업로드 → POSBulkUploadModal
  → PG MID 일괄 업로드 → PGBulkUploadModal
  → CSV/엑셀 파일 업로드 → 미리보기 → 업로드 실행
```

---

## 📦 데이터 구조

### Store (메인 엔티티)
```typescript
interface Store {
  id: string;
  name: string;
  code?: string;
  status: StoreStatus;                // 'active' | 'inactive' | 'pending' | 'terminated'
  address: AddressInfo;
  owner: OwnerInfo;
  business: BusinessInfo;
  contract: ContractInfo;
  bankAccount: BankAccountInfo;
  openingDate?: Date;
  operatingHours?: string;
  operatingInfo?: OperatingInfo;      // 확장 영업정보
  integrationCodes?: IntegrationCodes; // 연동 코드
  visibilitySettings?: VisibilitySettings;
  amenities?: StoreAmenities;         // 편의시설
  paymentMethods?: PaymentMethods;    // 결제수단
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### 세부 인터페이스

```typescript
// 주소 정보
interface AddressInfo {
  zipCode: string;
  address: string;
  addressDetail: string;
  region: Region;
  latitude?: number;
  longitude?: number;
}

// 가맹점주 정보
interface OwnerInfo {
  name: string;
  phone: string;
  email?: string;
}

// 사업자 정보
interface BusinessInfo {
  businessNumber: string;
  businessName: string;
  representativeName: string;
  businessType?: string;
  businessCategory?: string;
}

// 계약 정보
interface ContractInfo {
  contractDate: Date;
  expirationDate: Date;
  contractStatus: ContractStatus;    // 'active' | 'expired' | 'pending_renewal'
  contractDocumentUrl?: string;
  notes?: string;
}

// 계좌 정보
interface BankAccountInfo {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
}
```

### StoreWithStaff (상세 페이지용)
```typescript
interface StoreWithStaff extends Store {
  staffLinks: Array<StoreStaffLink & {
    staffName: string;
    staffEmail: string;
    staffPhone: string;
    staffStatus: string;
  }>;
}
```

### StoreFormData (등록/수정 폼)
```typescript
interface StoreFormData {
  name: string;
  code?: string;
  status: StoreStatus;
  address: AddressFormData;
  owner: OwnerFormData;
  business: BusinessFormData;
  contract: ContractFormData;       // 날짜 필드는 string (YYYY-MM-DD)
  bankAccount: BankAccountFormData;
  openingDate?: string;
  operatingHours?: string;
}
```

### 영업정보 관련
```typescript
interface OperatingInfo {
  appOperatingStatus?: AppOperatingStatus;
  weekdayHours: DayOperatingHours;
  weekendHours: DayOperatingHours;
  holidayHours?: DayOperatingHours;
  dailyHours?: Record<WeekDay, DayOperatingHours>;
  regularClosedDays?: RegularClosedDay[];
  irregularClosedDays?: IrregularClosedDay[];
  deliveryFee: number;
  freeDeliveryMinAmount?: number;
  isTemporarilyClosed: boolean;
  temporaryCloseReason?: string;
  isDeliveryAvailable: boolean;
  isPickupAvailable: boolean;
  deliverySettings?: DeliverySettings;
  pickupSettings?: PickupSettings;
  isVisible?: boolean;
}
```

### 연동 코드
```typescript
interface IntegrationCodes {
  pos: PosIntegration;               // POS 연동
  sk: SkIntegration;                 // SK 할인/적립
  pg: PgIntegration;                 // PG사 (스마트로 등)
  voucherVendor: VoucherVendorIntegration;  // 교환권 벤더사
}
```

### 결제수단
```typescript
interface PaymentMethods {
  isCardEnabled: boolean;
  isCashEnabled: boolean;
  isPointEnabled: boolean;
  simplePayments: SimplePaymentSetting[];  // 간편결제 6종
}
```

### 일괄 업로드
```typescript
interface POSBulkUploadRow {
  storeName: string;
  businessNumber: string;
  posVendor: string;
  posCode: string;
  posSerialNumber?: string;
}

interface PGBulkUploadRow {
  storeName: string;
  businessNumber: string;
  pgVendor: string;
  mid: string;
  apiKey?: string;
}

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; storeName: string; businessNumber: string; reason: string }>;
}
```

---

## 🔌 API 엔드포인트

### 매장 CRUD

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `GET` | `/api/stores` | 매장 목록 조회 (필터, 페이지네이션) | `useStoreList` |
| `GET` | `/api/stores/:id` | 매장 상세 조회 | `useStore` |
| `GET` | `/api/stores/:id/with-staff` | 매장 상세 + 연결 직원 조회 | `useStoreWithStaff` |
| `POST` | `/api/stores` | 매장 등록 | `useCreateStore` |
| `PUT` | `/api/stores/:id` | 매장 수정 | `useUpdateStore` |
| `DELETE` | `/api/stores/:id` | 매장 삭제 | `useDeleteStore` |


### 사업자번호 검증

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `POST` | `/api/stores/check-business-number` | 사업자번호 중복 확인 | `useCheckBusinessNumber` |


### 직원 연결

| Method | Endpoint | 설명 | Hook |
| --- | --- | --- | --- |
| `POST` | `/api/stores/:id/staff` | 직원 연결 | StaffLinkModal 내부 |
| `DELETE` | `/api/stores/staff-links/:linkId` | 직원 연결 해제 | `useUnlinkStaffFromStore` |


### 영업정보/연동정보 수정

| Method | Endpoint | 설명 | Modal |
| --- | --- | --- | --- |
| `PUT` | `/api/stores/:id/operating-info` | 영업정보 수정 | `OperatingInfoEditModal` |
| `PUT` | `/api/stores/:id/integration-codes` | 연동정보 수정 | `IntegrationCodesEditModal` |
| `PUT` | `/api/stores/:id/amenities` | 편의시설 수정 | `AmenitiesEditModal` |
| `PUT` | `/api/stores/:id/closed-days` | 휴무일 수정 | `ClosedDayEditModal` |
| `PUT` | `/api/stores/:id/payment-methods` | 결제수단 수정 | `PaymentMethodsEditModal` |


### 일괄 업로드

| Method | Endpoint | 설명 | Modal |
| --- | --- | --- | --- |
| `POST` | `/api/stores/bulk-upload/pos` | POS 코드 일괄 업로드 | `POSBulkUploadModal` |
| `POST` | `/api/stores/bulk-upload/pg` | PG MID 일괄 업로드 | `PGBulkUploadModal` |


### 요청 파라미터 (GET - 목록)
```typescript
interface StoreListParams {
  region?: Region;
  status?: StoreStatus;
  contractStatus?: ContractStatus;
  keyword?: string;
  page?: number;
  limit?: number;
}
```

### 응답 형식 (GET - 목록)
```json
{
  "data": [Store],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## 🔒 보안 고려사항

| 항목 | 설명 |
| --- | --- |
| **개인정보 마스킹** | 점주 연락처, 계좌번호, 와이파이 비밀번호를 MaskedData로 마스킹 |
| **사업자번호 검증** | 등록 시 중복 확인 필수, 서버 측 유효성 검증 |
| **삭제 제한** | 연결된 직원이 있는 매장은 삭제 불가 (`HAS_LINKED_STAFF` 에러) |
| **삭제 확인** | 삭제 전 ConfirmDialog를 통한 이중 확인 |
| **PG API 키** | API 키 마스킹 저장, 전체 값 노출 방지 |
| **인증/인가** | 인증된 관리자만 접근 가능 (Protected Route) |
| **가맹점주 제한** | 매장당 가맹점주는 1명만 등록 가능 (`OWNER_LIMIT_EXCEEDED` 에러) |


---

## 🎨 UI 컴포넌트

### 사용 컴포넌트 (`@/components/ui`)
- `Card`: 필터, 테이블, 폼 섹션 컨테이너
- `Button`: 액션 버튼 (variant: default, outline, danger, ghost)
- `Badge`: 상태 배지 (success, warning, info, critical, secondary)
- `Input`: 텍스트 입력 필드
- `Spinner`: 로딩 상태 표시
- `MaskedData`: 개인정보 마스킹 (연락처, 계좌번호, 와이파이 비밀번호)
- `ConfirmDialog`: 삭제/연결해제 확인 다이얼로그

### 페이지 내부 컴포넌트
| 컴포넌트 | 용도 |
| --- | --- |
| `POSBulkUploadModal` | POS 코드 일괄 업로드 모달 |
| `PGBulkUploadModal` | PG MID 일괄 업로드 모달 |
| `StaffLinkModal` | 직원 연결 모달 |
| `OperatingInfoEditModal` | 영업정보 수정 모달 |
| `IntegrationCodesEditModal` | 연동정보 수정 모달 |
| `AmenitiesEditModal` | 편의시설 수정 모달 |
| `ClosedDayEditModal` | 휴무일 수정 모달 |
| `PaymentMethodsEditModal` | 결제수단 수정 모달 |


### 아이콘 (`@ant-design/icons`)
- `PlusOutlined`: 매장 추가, 직원 연결 버튼
- `SearchOutlined`: 검색 입력 필드 아이콘
- `EditOutlined`: 수정 버튼/아이콘
- `DeleteOutlined`: 삭제 버튼/아이콘
- `EyeOutlined`: 상세보기 아이콘
- `UploadOutlined`: 일괄 업로드 버튼
- `DownOutlined`: 드롭다운 화살표
- `ArrowLeftOutlined`: 뒤로가기 버튼
- `CheckOutlined`: 사업자번호 검증 완료 아이콘

### Hooks
| Hook | 용도 | 사용 페이지 |
| --- | --- | --- |
| `useStoreList` | 매장 목록 조회 | StoreList |
| `useStore` | 매장 단건 조회 | StoreForm(edit) |
| `useStoreWithStaff` | 매장 상세 + 직원 조회 | StoreDetail |
| `useCreateStore` | 매장 등록 mutation | StoreForm(create) |
| `useUpdateStore` | 매장 수정 mutation | StoreForm(edit) |
| `useDeleteStore` | 매장 삭제 mutation | StoreList, StoreDetail |
| `useCheckBusinessNumber` | 사업자번호 중복 확인 | StoreForm |
| `useUnlinkStaffFromStore` | 직원 연결 해제 mutation | StoreDetail |
| `useToast` | 토스트 알림 | 모든 페이지 |


---

## 🧪 테스트 시나리오

### 단위 테스트
- [ ] StoreList: 매장 상태별 배지 색상 매핑 (`getStatusBadgeVariant`) 검증
- [ ] StoreList: 계약 상태별 배지 색상 매핑 (`getContractBadgeVariant`) 검증
- [ ] StoreList: 날짜 포맷 (`formatDate`) 검증
- [ ] StoreDetail: 탭 전환 동작 검증
- [ ] StoreDetail: 직원 역할별 배지 색상 매핑 검증
- [ ] StoreForm: 폼 유효성 검사 (`validateForm`) 검증 - 필수 필드 누락
- [ ] StoreForm: 사업자번호 변경 시 검증 상태 초기화 확인
- [ ] StoreForm: 은행 선택 시 bankName 자동 매핑 확인

### 통합 테스트
- [ ] StoreList: 필터 변경 시 page 리셋 확인
- [ ] StoreList: 키워드 검색 후 결과 갱신 확인
- [ ] StoreList: 삭제 후 목록 갱신 + 토스트 확인
- [ ] StoreDetail: 직원 연결/해제 후 목록 갱신 확인
- [ ] StoreDetail: 각 수정 모달 열기/닫기 동작 확인
- [ ] StoreForm: 등록 후 목록 페이지 이동 확인
- [ ] StoreForm: 수정 모드에서 기존 데이터 로드 확인
- [ ] StoreForm: 사업자번호 중복확인 플로우 검증

### E2E 테스트
- [ ] 매장 전체 CRUD: 등록 → 목록 조회 → 상세 확인 → 수정 → 삭제
- [ ] 직원 연결 플로우: 상세 → staff 탭 → 직원 연결 → 연결 해제
- [ ] 영업정보 수정: 상세 → operating 탭 → 수정 모달 → 저장
- [ ] 일괄 업로드: 목록 → 일괄 업로드 → 파일 업로드 → 결과 확인
- [ ] 3종 필터 + 검색 + 페이지네이션 조합 동작 확인

---

## 📌 TODO

- [ ] 매장 일괄 등록 기능 (CSV/엑셀)
- [ ] 매장 목록 Excel 다운로드 기능
- [ ] 지도 기반 매장 위치 관리 (latitude/longitude 활용)
- [ ] 노출 설정(VisibilitySettings) 관리 탭 구현
- [ ] 계약 만료 임박 알림 기능
- [ ] 매장 이미지/로고 관리 기능
- [ ] 테이블 정렬 기능 (매장명, 계약 만료일 등)
- [ ] 계약서 문서 업로드/다운로드 기능 (`contractDocumentUrl`)
- [ ] 거리별 배달비 정책 UI (`deliveryFeeByDistance`)
- [ ] 매장 통계 대시보드 (매출, 주문 수 등)

---

**작성일**: 2026-02-11
**최종 수정일**: 2026-02-11
**작성자**: Claude Code
