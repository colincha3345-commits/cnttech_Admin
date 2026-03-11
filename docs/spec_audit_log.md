# 감사 로그(Audit Log) 관리 시스템 기획 명세서

본 문서는 관리자 대시보드 내 **감사 로그** 페이지의 프론트엔드 및 백엔드 개발 시 필요한 세부 필수 항목과 페이지 프로세스를 정의한 문서다.

---

## 1. 라우트 구조

| 경로 | 페이지 | 권한 |
| :--- | :--- | :--- |
| `/audit-logs` | 감사 로그 목록 (AuditLogList) | audit-logs:read |

---

## 2. 페이지 프로세스

1. **로그 목록 조회** — 기간, 액션 유형, 심각도(info/warning/critical), 수행자 필터를 적용하여 감사 로그를 조회한다.
2. **액션 유형** — login, logout, create, update, delete, status_change, permission_change, password_reset, export, bulk_update, settings_change, masking_view 등 다양한 관리자 활동을 추적한다.
3. **상세 정보** — 각 로그의 수행자, IP, 대상 엔티티, 변경 전/후 데이터, 수행 일시를 표시한다.

---

## 3. 세부 개발 명세

### 3.1. 프론트엔드

| 기능 / 필드명 | 입력/노출 형태 | 필수 여부 | 비고 |
| :--- | :--- | :---: | :--- |
| **기간 필터** | DateRange | N | 기본 최근 7일이다. |
| **액션 유형 필터** | Multi Select | N | 12가지 액션 유형이다. |
| **심각도 필터** | ToggleButton | N | all/info/warning/critical이다. |
| **수행자 필터** | Search Input | N | 이름/이메일로 검색이다. |
| **심각도 Badge** | Badge | Y | info=info, warning=warning, critical=critical이다. |
| **수행자 (performedBy)** | Text | Y | 관리자명 + 이메일이다. |
| **액션 (action)** | Badge + Text | Y | 액션 유형별 Badge이다. |
| **대상 (target)** | Text | N | 영향 받은 엔티티 이름/ID이다. |
| **변경 내용** | Expandable Row | N | 변경 전/후 diff 표시이다. |
| **IP 주소** | Text | Y | 접속 IP이다. |
| **일시 (createdAt)** | Text | Y | YYYY-MM-DD HH:mm:ss이다. |

### 3.2. 백엔드

#### API 엔드포인트

| Method | Path | 설명 |
| :--- | :--- | :--- |
| GET | `/api/audit-logs` | 로그 목록 조회. 기간, action, severity, performer 필터, Pagination이다. |
| GET | `/api/audit-logs/:id` | 로그 상세(변경 diff 포함)이다. |
| POST | `/api/audit-logs` | 로그 기록 (내부 서비스 간 호출)이다. |

#### DB 스키마 (AuditLog)

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **id (PK)** | UUID | Y | 고유 식별자다. |
| **action** | Enum | Y | login/logout/create/update/delete/status_change/permission_change/password_reset/export/bulk_update/settings_change/masking_view이다. |
| **severity** | Enum | Y | 'info', 'warning', 'critical'이다. |
| **performedBy** | UUID (FK) | Y | 수행자 계정 참조다. |
| **performerName** | String | Y | 역정규화 조회용이다. |
| **performerEmail** | String | Y | 역정규화 조회용이다. |
| **targetEntity** | String | N | 대상 엔티티 타입(store, member, order 등)이다. |
| **targetId** | String | N | 대상 엔티티 ID다. |
| **description** | String | Y | 활동 설명이다. |
| **previousData** | JSON | N | 변경 전 스냅샷이다. |
| **newData** | JSON | N | 변경 후 스냅샷이다. |
| **ipAddress** | String | Y | 접속 IP이다. |
| **userAgent** | String | N | 브라우저 정보다. |
| **createdAt** | Timestamp | Y | 기록 일시다. |

**[비즈니스 로직 제약사항]**
- 감사 로그는 수정/삭제 불가(Append-only)이다.
- 민감 작업(permission_change, password_reset, masking_view, export)은 severity=warning 이상으로 기록한다.
- 로그인 실패도 기록하되, 비밀번호 원문은 절대 기록하지 않는다.

**[⚠️ 트래픽/성능 검토]**
- **INSERT 빈도** — 관리자 활동마다 기록되므로 INSERT 부하가 높을 수 있다. 비동기 큐(Message Queue)를 통한 기록을 권장한다.
- **조회 인덱스** — (createdAt DESC, action, severity) 복합 인덱스 필수. 기간 필터 조회가 가장 빈번하다.
- **데이터 보관** — 로그 데이터가 무한 증가하므로 90일 이상 된 로그는 Cold Storage(S3)로 아카이빙하고 DB에서 삭제하는 정책을 권장한다.
- **알림 설정** — AuditAlarmConfig를 통해 critical 로그 발생 시 Slack/이메일 알림을 발송할 수 있다.
