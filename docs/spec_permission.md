# 권한 관리(Permission) 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **권한 관리** 페이지(`/permissions`)의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 0. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/permissions` | 권한 관리 (PermissionManagement) | permissions:read |


## 1. 페이지 프로세스 (Page Process)

1. **계정 목록 조회** — 좌측 패널에 관리자 계정 목록을 표시한다. 검색, 역할별(매니저/뷰어) 필터, 상태별(활성/비활성) 필터를 제공한다.
2. **권한 설정** — 우측 패널에 선택된 계정의 메뉴별 접근 권한을 설정한다. 메뉴 그룹 단위 일괄 설정 및 개별 토글을 지원한다.
3. **저장** — 변경사항 감지 시 저장/초기화 버튼 활성화. 저장 시 감사 로그를 기록한다.
4. **제약** — admin 역할만 수정 가능하며, admin 계정의 권한은 변경 불가(항상 전체 권한)다.

---

## 2. 세부 개발 명세

### 2.1. 프론트엔드 (Frontend) 개발 요건

#### 계정 목록

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **검색** | SearchInput | N | - | 이름/이메일로 검색한다. |
| **역할 필터** | ToggleButton | N | all/manager/viewer | 역할별 필터링이다. admin은 별도 표시다. |
| **상태 필터** | ToggleButton | N | all/active/inactive | 활성/비활성 필터링이다. |
| **계정 카드** | Card | - | - | 이름, 이메일, 부서, 역할 Badge, 상태 표시다. |

#### 권한 설정 (메뉴별)

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 글자수 / 제약조건 | 비고 (UI/UX) |
| :--- | :--- | :---: | :--- | :--- |
| **메뉴 (menu)** | Text (ReadOnly) | Y | 13개 메뉴 | dashboard/menu/marketing/events/orders/app-members/staff/design/settlement/support/audit-logs/permissions/settings 이다. |
| **조회 (view)** | Checkbox | Y | Boolean | 해당 메뉴 접근 가능 여부다. |
| **쓰기 (write)** | Checkbox | Y | Boolean | 생성/수정/삭제 가능 여부다. view 비활성 시 자동 비활성이다. |
| **마스킹 해제 (masking)** | Checkbox | Y | Boolean | 개인정보 원문 조회 가능 여부다. |
| **다운로드 (download)** | Checkbox | Y | Boolean | 데이터 내보내기 가능 여부다. |

---

### 2.2. 백엔드 (Backend) 개발 요건

#### 계정 권한 (AccountPermission)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **accountId (PK)** | UUID | Y | 36자 | 관리자 계정 식별자다. |
| **accountNo** | Integer | Y | - | 계정 번호다. |
| **accountName** | String | Y | - | 계정명이다. |
| **accountEmail** | String | Y | 이메일 형식 | 계정 이메일이다. |
| **department** | String | Y | - | 소속 부서다. |
| **role** | Enum | Y | `admin`/`manager`/`viewer` | 역할이다. |
| **status** | Enum | Y | `active`/`inactive` | 계정 상태다. |
| **permissions** | JSON | Y | MenuPermission[] | 메뉴별 권한 배열이다. |
| **updatedAt** | Timestamp | Y | - | 마지막 수정 일시다. |
| **updatedBy** | String | Y | - | 수정자 ID다. |

#### 메뉴 권한 (MenuPermission)

| 데이터베이스 필드 | 데이터 타입 | 필수 여부 | 글자수 / 제약조건 | 비고 (API 설계) |
| :--- | :--- | :---: | :--- | :--- |
| **menu** | Enum | Y | 13개 메뉴 | 관리 메뉴 식별자다. |
| **view** | Boolean | Y | - | 조회 권한이다. |
| **write** | Boolean | Y | - | 쓰기 권한이다. |
| **masking** | Boolean | Y | - | 마스킹 해제 권한이다. |
| **download** | Boolean | Y | - | 다운로드 권한이다. |

**[API 및 비즈니스 로직 제약사항]**
- `admin` 역할 계정만 권한 수정 API를 호출할 수 있다.
- `admin` 계정의 권한은 항상 전체 true로 강제되며 수정 요청을 거부한다.
- `view=false`일 때 `write`, `masking`, `download`는 자동으로 false 처리한다.
- 권한 변경 시 감사 로그를 기록하며, 변경 전/후 스냅샷을 함께 저장한다.
- 프론트엔드는 로그인 시 해당 계정의 권한 정보를 가져와 메뉴 접근 및 UI 분기에 활용한다.

**[⚠️ 트래픽/성능 검토]**
- **권한 캐시** — 로그인 시 해당 계정의 권한 정보를 JWT 페이로드 또는 Redis에 캐싱한다. 권한 변경 시 해당 계정의 캐시를 즉시 무효화한다.
- **변경 스냅샷** — 권한 변경 시 전/후 스냅샷을 감사 로그에 JSON으로 저장한다. 데이터 크기가 크므로 압축 저장을 권장한다.
