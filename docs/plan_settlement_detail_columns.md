# 정산 상세 리스트 컬럼 보강 기획서

> 작성일: 2026-04-02
> 상태: 기획 (코드 수정 전)

---

## 1. 현재 상태 vs 요구사항 Gap 분석

### 1-1. 현재 테이블 컬럼 (SettlementDetail.tsx)

| 현재 컬럼 | 데이터 소스 |
|-----------|------------|
| 주문정보 | orderNumber, orderDate, orderType, paymentMethod |
| 고객정보 | customerName, customerPhone, deliveryAddress |
| 메뉴 및 할인내역 | menus[], discount (coupon/point/product/affiliate/eCoupon) |
| 배달비 | deliveryFee |
| 결제금액 | totalAmount |
| 정산금액 | netAmount |

### 1-2. 요구 컬럼 구조 (이미지 기반)

| 그룹 | 서브 컬럼 | 현재 존재 여부 |
|------|-----------|---------------|
| 정상가합계 | (단일) | 없음 - menus[].totalPrice 합산으로 계산 가능하나 별도 필드 없음 |
| 이벤트 할인부담 | 브랜드 부담 | 없음 |
| 이벤트 할인부담 | 가맹점 부담 | 없음 |
| 이벤트 할인부담 | Total | 없음 (discount.discountAmount가 유사하나 부담 주체 구분 없음) |
| E-쿠폰 | E-쿠폰(카카오) | 부분 존재 - eCoupons[].couponCompany로 필터 가능 |
| E-쿠폰 | E-쿠폰(기타) | 부분 존재 - 위와 동일 |
| 총결제금액 | Total | 존재 - totalAmount |
| PG수수료 | PG | 없음 (Settlement 요약에만 pgFee 존재) |
| PG수수료 | 간편결제 | 없음 |
| PG수수료 | PG(합) | 없음 |
| PG수수료 | CNT (건수) | 없음 |
| 할인중개수수료 | 브랜드 할인중개(합) | 없음 |
| 할인중개수수료 | CNT | 없음 |
| 주문중개수수료 | 브랜드 | 없음 |
| 주문중개수수료 | 주문중개(합) | 없음 |

### 1-3. Gap 요약

| 구분 | 내용 |
|------|------|
| 완전 누락 | 정상가합계, 이벤트 할인부담(브랜드/가맹점 분리), PG수수료(상세 분리), 할인중개수수료, 주문중개수수료 |
| 부분 존재 | E-쿠폰 (카카오/기타 분리는 couponCompany로 가능하나 합산 필드 없음) |
| 존재 | 총결제금액(totalAmount) |

---

## 2. SettlementOrderItem 추가 필드 목록

### 2-1. 정상가합계

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `originalPriceTotal` | `number` | 할인 전 정상가 합계 (메뉴 정가 합산) |

### 2-2. 이벤트 할인부담 (신규 인터페이스)

```
EventDiscountBurden {
  brandBurden: number;       // 브랜드(본사)가 부담하는 할인 금액
  storeBurden: number;       // 가맹점이 부담하는 할인 금액
  total: number;             // brandBurden + storeBurden
}
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `eventDiscount` | `EventDiscountBurden` | 이벤트 할인 부담 내역 |

### 2-3. E-쿠폰 합산 (신규 인터페이스)

```
ECouponSummary {
  kakao: number;             // 카카오 E쿠폰 사용 합계
  etc: number;               // 기타 E쿠폰 사용 합계
}
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `eCouponSummary` | `ECouponSummary` | E쿠폰 채널별 합산 (기존 eCoupons[] 상세와 별도) |

### 2-4. PG수수료 (신규 인터페이스)

```
PgFeeDetail {
  pg: number;                // 일반 PG 수수료
  easyPay: number;           // 간편결제 수수료 (카카오페이, 네이버페이, 토스페이 등)
  total: number;             // pg + easyPay
  count: number;             // PG 결제 건수
}
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `pgFeeDetail` | `PgFeeDetail` | PG 수수료 상세 내역 |

### 2-5. 할인중개수수료 (신규 인터페이스)

```
DiscountBrokerageFee {
  brandDiscountBrokerage: number;  // 브랜드 할인에 대한 중개수수료 합계
  count: number;                   // 할인중개 건수
}
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `discountBrokerageFee` | `DiscountBrokerageFee` | 할인중개수수료 내역 |

### 2-6. 주문중개수수료 (신규 인터페이스)

```
OrderBrokerageFee {
  brand: number;              // 브랜드 주문중개수수료
  total: number;              // 주문중개수수료 합계
}
```

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `orderBrokerageFee` | `OrderBrokerageFee` | 주문중개수수료 내역 |

### 2-7. 전체 추가 필드 요약

| 필드명 | 타입 | 필수 여부 |
|--------|------|-----------|
| `originalPriceTotal` | `number` | 필수 |
| `eventDiscount` | `EventDiscountBurden` | 필수 |
| `eCouponSummary` | `ECouponSummary` | 선택 (E쿠폰 사용 시) |
| `pgFeeDetail` | `PgFeeDetail` | 필수 |
| `discountBrokerageFee` | `DiscountBrokerageFee` | 필수 |
| `orderBrokerageFee` | `OrderBrokerageFee` | 필수 |

---

## 3. Settlement 요약에 추가해야 할 필드 목록

현재 Settlement 인터페이스는 단순 합산 기반이므로, 상세 컬럼과 정합성을 맞추기 위해 다음 필드 추가가 필요합니다.

| 필드명 | 타입 | 설명 | 현재 상태 |
|--------|------|------|-----------|
| `originalPriceTotal` | `number` | 정상가 합계 (전체) | 없음 |
| `eventDiscountBrand` | `number` | 이벤트 할인 - 브랜드 부담 합계 | 없음 (promotionDiscount에 통합) |
| `eventDiscountStore` | `number` | 이벤트 할인 - 가맹점 부담 합계 | 없음 |
| `eventDiscountTotal` | `number` | 이벤트 할인 합계 | 없음 |
| `eCouponKakao` | `number` | E쿠폰(카카오) 합계 | 없음 (vouchersUsed에 통합) |
| `eCouponEtc` | `number` | E쿠폰(기타) 합계 | 없음 |
| `pgFeeNormal` | `number` | 일반 PG 수수료 | 없음 (pgFee에 통합) |
| `pgFeeEasyPay` | `number` | 간편결제 수수료 | 없음 |
| `pgFeeTotal` | `number` | PG 수수료 합계 | 존재 (pgFee) - 이름 변경 검토 |
| `pgFeeCount` | `number` | PG 결제 건수 | 없음 |
| `discountBrokerageTotal` | `number` | 할인중개수수료 합계 | 없음 |
| `discountBrokerageCount` | `number` | 할인중개 건수 | 없음 |
| `orderBrokerageBrand` | `number` | 주문중개 - 브랜드 수수료 | 없음 |
| `orderBrokerageTotal` | `number` | 주문중개수수료 합계 | 없음 (platformFee가 유사하나 명확히 다름) |

### 기존 필드 재검토

| 기존 필드 | 처리 방안 |
|-----------|-----------|
| `promotionDiscount` | 이벤트 할인 상세(브랜드/가맹점)로 대체 검토. 하위호환 유지 시 deprecated 처리 |
| `vouchersUsed` | E쿠폰 카카오/기타로 분리. 하위호환 유지 시 deprecated 처리 |
| `pgFee` | pgFeeTotal로 의미 명확화 또는 기존 유지 후 상세 필드 추가 |
| `platformFee` | 주문중개수수료와의 관계 정리 필요 (동일 개념인지 별도 개념인지 확인 필요) |

---

## 4. Mock 데이터 구조 설계

### 4-1. SettlementOrderItem Mock 예시

```typescript
{
  orderId: 'ORD-1001',
  orderNumber: 'A1001',
  orderDate: '2024-02-01T12:30:00Z',
  menus: [
    {
      productId: 'P01',
      productName: '아메리카노',
      categoryName: '커피',
      quantity: 2,
      unitPrice: 4500,
      totalPrice: 9000,
      options: [],
    },
    {
      productId: 'P02',
      productName: '카페라떼',
      categoryName: '커피',
      quantity: 1,
      unitPrice: 5000,
      totalPrice: 5500,
      options: [{ name: '샷추가', price: 500 }],
    },
  ],

  // === 신규 필드 ===
  originalPriceTotal: 14500,              // 9000 + 5500

  eventDiscount: {
    brandBurden: 2000,                    // 브랜드가 부담
    storeBurden: 1000,                    // 가맹점이 부담
    total: 3000,                          // 합계
  },

  eCouponSummary: {
    kakao: 5000,                          // 카카오 E쿠폰
    etc: 0,                               // 기타 E쿠폰
  },

  totalAmount: 9500,                      // 정상가 - 할인 + 배달비 등

  pgFeeDetail: {
    pg: 190,                              // 일반 PG 수수료 (2%)
    easyPay: 0,                           // 간편결제 수수료
    total: 190,                           // 합계
    count: 1,                             // 결제 건수
  },

  discountBrokerageFee: {
    brandDiscountBrokerage: 60,           // 브랜드 할인 중개수수료 (할인액의 3%)
    count: 1,
  },

  orderBrokerageFee: {
    brand: 285,                           // 브랜드 주문중개수수료 (결제액의 3%)
    total: 285,
  },

  // === 기존 필드 유지 ===
  discount: { couponAmount: 0, pointUsed: 0, discountAmount: 3000 },
  paymentMethod: 'card',
  netAmount: 8965,
  customerName: '김민수',
  customerPhone: '010-****-1234',
  orderType: 'delivery',
  deliveryFee: 3000,
  deliveryAddress: '서울시 강남구 테헤란로 123',
}
```

### 4-2. Settlement 요약 Mock 예시 (추가 필드)

```typescript
{
  // 기존 필드 유지
  id: 'SET-20240225-001',
  storeId: 'store-1',
  storeName: '강남점',
  period: '2024-02-01 ~ 2024-02-15',
  totalSales: 15450000,
  // ...

  // === 신규 필드 ===
  originalPriceTotal: 18500000,
  eventDiscountBrand: 1200000,
  eventDiscountStore: 800000,
  eventDiscountTotal: 2000000,
  eCouponKakao: 150000,
  eCouponEtc: 50000,
  pgFeeNormal: 280000,
  pgFeeEasyPay: 106250,
  pgFeeTotal: 386250,                    // 기존 pgFee와 동일 값
  pgFeeCount: 124,
  discountBrokerageTotal: 36000,
  discountBrokerageCount: 40,
  orderBrokerageBrand: 463500,
  orderBrokerageTotal: 463500,
}
```

---

## 5. 확인 필요 사항

구현 전 아래 사항에 대해 확인이 필요합니다.

| 번호 | 확인 사항 | 이유 |
|------|-----------|------|
| Q1 | `platformFee`와 `주문중개수수료`는 동일 개념인가? | 현재 Settlement에 platformFee가 있는데 주문중개수수료와 겹칠 가능성 |
| Q2 | 이벤트 할인 부담 비율 기준은? | 브랜드/가맹점 부담 비율을 어디서 결정하는지 (고정 비율? 이벤트별?) |
| Q3 | PG수수료 간편결제 구분 기준은? | PaymentMethod 중 kakao_pay, naver_pay, toss_pay만 간편결제인지 |
| Q4 | 할인중개수수료 산정 기준은? | 할인액 대비 몇 %? 브랜드 할인에만 적용? |
| Q5 | 기존 필드(promotionDiscount, vouchersUsed 등)를 deprecated 처리할지, 병행 유지할지 | 하위호환성 vs 데이터 정합성 |
| Q6 | 테이블 UI에서 기존 컬럼(고객정보, 메뉴 및 할인내역)은 유지하는지, 새 컬럼으로 완전 교체하는지 | 현재 6컬럼 → 요구사항 7그룹(18+ 서브컬럼)으로 대폭 변경 |

---

## 6. 테이블 컬럼 헤더 구조 (구현 시 참고)

2단 헤더(그룹 + 서브 컬럼) 구조 필요:

```
| 정상가합계 | 이벤트 할인부담          | E-쿠폰              | 총결제금액 | PG수수료                    | 할인중개수수료           | 주문중개수수료        |
|           | 브랜드 | 가맹점 | Total | 카카오 | 기타        | Total     | PG | 간편결제 | PG(합) | CNT | 브랜드할인중개(합) | CNT | 브랜드 | 주문중개(합)  |
```

- `<colgroup>` + `<thead>` 2행 구조 또는 antd/custom 테이블 컴포넌트의 그룹 헤더 기능 활용 필요
