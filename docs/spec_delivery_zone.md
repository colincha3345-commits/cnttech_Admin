# 배달권역(Delivery Zone) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **배달권역 관리** 페이지의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/delivery-zones` | 배달권역 목록 (DeliveryZoneList) | staff:read |
| `/delivery-zones/new` | 배달권역 등록 (DeliveryZoneEditor) | staff:write |
| `/delivery-zones/:id/edit` | 배달권역 수정 (DeliveryZoneEditor) | staff:write |

---

## 2. 페이지 프로세스

1. **권역 목록 조회** (`DeliveryZoneList`) — 매장별 배달 가능 권역을 목록으로 조회한다. 매장 필터, 권역 레벨(메인/서브) 필터를 제공한다.
2. **권역 등록/수정** (`DeliveryZoneEditor`) — 지도(MapView/MapCanvas) 기반으로 배달 가능 영역을 설정한다.
   - **반경형(radius)** — 중심 좌표 + 반경(km)으로 원형 영역을 지정한다.
   - **다각형(polygon)** — 지도에서 꼭짓점을 클릭하여 다각형 영역을 지정한다.
3. **서브 권역** — 메인 권역 내 세부 권역(SubZone)을 추가하여 권역별 배달비/최소주문금액을 차등 설정한다.

---

## 3. 세부 개발 명세

### 3.1. 프론트엔드

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 |
| :--- | :--- | :---: | :--- | :--- |
| **권역명 (name)** | Input | Y | 2 ~ 50자 | 관리용 이름이다. |
| **매장 (storeId)** | Select (Search) | Y | - | 연결 매장 선택이다. |
| **권역 유형 (zoneType)** | ToggleButton | Y | `radius`/`polygon` | 반경형/다각형 전환이다. |
| **권역 레벨 (level)** | Select | Y | `main`/`sub` | 메인/서브 권역이다. |
| **중심 좌표 (center)** | Map Click / Input | C(radius) | lat, lng | 지도 클릭 또는 좌표 직접 입력이다. |
| **반경 (radiusKm)** | Number Input | C(radius) | 0.1 이상 | km 단위이다. |
| **좌표 목록 (coordinates)** | Map Drawing | C(polygon) | 최소 3개 점 | 지도에서 다각형 드로잉이다. |
| **배달비 (deliveryFee)** | Number Input | Y | 0 이상 | 원 단위이다. |
| **최소 주문금액 (minOrderAmount)** | Number Input | N | 0 이상 | 원 단위이다. |
| **예상 배달시간 (estimatedMinutes)** | Number Input | N | 0 이상 | 분 단위이다. |
| **활성 여부 (isActive)** | Switch | Y | Boolean | 비활성 시 배달 불가이다. |

### 3.2. 백엔드

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/api/delivery-zones` | 권역 목록. storeId 필터, Pagination이다. |
| GET | `/api/delivery-zones/:id` | 권역 상세이다. |
| POST | `/api/delivery-zones` | 권역 등록이다. |
| PUT | `/api/delivery-zones/:id` | 권역 수정이다. |
| DELETE | `/api/delivery-zones/:id` | 권역 삭제이다. |
| POST | `/api/delivery-zones/check-overlap` | 권역 중복 체크이다. |

#### DB 스키마 (DeliveryZone)

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **id (PK)** | UUID | Y | 고유 식별자다. |
| **storeId (FK)** | UUID | Y | 매장 참조다. |
| **name** | String | Y | 2~50자이다. |
| **zoneType** | Enum | Y | 'radius', 'polygon'이다. |
| **level** | Enum | Y | 'main', 'sub'이다. |
| **center** | JSON | C(radius) | {lat, lng} 중심 좌표다. |
| **radiusKm** | Decimal | C(radius) | 0.1 이상이다. |
| **coordinates** | JSON | C(polygon) | [{lat, lng}] 꼭짓점 배열이다. |
| **deliveryFee** | Integer | Y | 배달비(원)이다. |
| **minOrderAmount** | Integer | N | 최소 주문금액이다. |
| **estimatedMinutes** | Integer | N | 예상 배달시간이다. |
| **isActive** | Boolean | Y | 활성 여부다. |
| **parentZoneId (FK)** | UUID | N | 서브 권역의 상위 메인 권역이다. |

**[비즈니스 로직 제약사항]**
- 다각형 좌표는 최소 3개, 최대 50개 점으로 제한한다.
- 동일 매장 내 메인 권역 간 중복 영역 검증 API를 제공한다.
- 서브 권역은 반드시 메인 권역 내에 포함되어야 한다(containment check).

**[⚠️ 트래픽/성능 검토]**
- **주문 시 권역 판별** — 고객 주소 좌표가 어느 권역에 포함되는지 판별하는 로직이 주문마다 호출된다. PostGIS의 ST_Contains 또는 Ray Casting 알고리즘을 사용하되, 매장별 권역 데이터를 Redis에 캐싱하여 DB 부하를 줄인다.
- **지도 렌더링** — 다각형 좌표가 많은(50점) 경우 프론트엔드 Canvas 성능에 주의한다. 간소화(Douglas-Peucker) 적용을 권장한다.
