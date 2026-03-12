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
| **액션 유형 필터** | Multi Select | N | 18가지 액션 유형이다. |
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
| **action** | Enum | Y | LOGIN/LOGIN_FAILED/LOGOUT/MFA_VERIFIED/MFA_FAILED/PASSWORD_CHANGED/USER_CREATED/USER_UPDATED/USER_DELETED/USER_STATUS_CHANGE/PERMISSION_CHANGED/UNMASK_DATA/DATA_EXPORT/DATA_DOWNLOAD/DOWNLOAD_HISTORY_VIEW/SESSION_EXPIRED/ACCESS_DENIED/ACCESS_ATTEMPT/SETTINGS_CHANGED (18가지)이다. |
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
| **sessionId** | String | N | 세션 식별자다. |
| **requestId** | String | N | 요청 추적 ID다. |
| **createdAt** | Timestamp | Y | 기록 일시다. |

#### 알람 설정 (AuditAlarmConfig)

| 필드 | 타입 | 필수 | 비고 |
| :--- | :--- | :---: | :--- |
| **id** | UUID | Y | 관리자 계정 ID다. |
| **receiveEmail** | Boolean | Y | 이메일 알림 수신 여부다. |
| **receivePush** | Boolean | Y | 푸시 알림 수신 여부다. |
| **monitoredActions** | JSON | Y | 알림 대상 액션 배열이다. |

**[비즈니스 로직 제약사항]**
- 감사 로그는 수정/삭제 불가(Append-only)이다.
- 심각도 매핑: LOGIN_FAILED/MFA_FAILED/PASSWORD_CHANGED/USER_STATUS_CHANGE/UNMASK_DATA/DATA_EXPORT/SETTINGS_CHANGED=warning, USER_DELETED/PERMISSION_CHANGED/ACCESS_DENIED=critical, 나머지=info이다.
- 로그인 실패도 기록하되, 비밀번호 원문은 절대 기록하지 않는다.

**[⚠️ 트래픽/성능 검토]**
- **INSERT 빈도** — 관리자 활동마다 기록되므로 INSERT 부하가 높을 수 있다. 비동기 큐(Message Queue)를 통한 기록을 권장한다.
- **조회 인덱스** — (createdAt DESC, action, severity) 복합 인덱스 필수. 기간 필터 조회가 가장 빈번하다.
- **데이터 보관** — 로그 데이터가 무한 증가하므로 90일 이상 된 로그는 Cold Storage(S3)로 아카이빙하고 DB에서 삭제하는 정책을 권장한다.
- **알림 설정** — AuditAlarmConfig를 통해 critical 로그 발생 시 Slack/이메일 알림을 발송할 수 있다.

---

## 4. 정상작동 시나리오

### 시나리오 1: 감사 로그 조회

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 감사 로그 페이지 진입 | 최근 로그 목록 로드 | 최신순 정렬, 페이지네이션 |
| 2 | 필터: 액션="LOGIN_FAILED" + 기간 설정 | 필터 적용 → 목록 갱신 | 복합 필터 AND |
| 3 | 로그 행 클릭 | 상세 모달: IP, User-Agent, 요청 본문 | sessionId, requestId 표시 |

### 시나리오 2: 알림 설정

| 단계 | 사용자 행동 | 시스템 응답 | 검증 포인트 |
| :---: | :--- | :--- | :--- |
| 1 | 알림 설정 탭 진입 | 현재 알림 설정 로드 | AuditAlarmConfig |
| 2 | 모니터링 액션 선택 (ACCESS_DENIED 등) | 체크박스 선택 | monitoredActions 배열 |
| 3 | 알림 채널: 이메일 ON, 푸시 ON | 토글 스위치 | receiveEmail, receivePush |
| 4 | [저장] | 설정 저장 → 해당 액션 발생 시 알림 발송 | 실시간 알림 동작 |

---

## 5. 개발자용 정책 설명

### 5.1. 감사 로그 보존 정책

```
보존 기간: 최소 1년 (법적 요건에 따라 연장 가능)
삭제: 자동 삭제 불가. 관리자도 삭제 권한 없음 (append-only)
아카이브: 6개월 경과 로그는 별도 아카이브 테이블로 이동 가능
```

### 5.2. severity 매핑

```
CRITICAL: LOGIN_FAILED, ACCESS_DENIED, ACCESS_ATTEMPT, MFA_FAILED
HIGH: USER_DELETED, PERMISSION_CHANGED, PASSWORD_CHANGED, UNMASK_DATA
MEDIUM: USER_CREATED, USER_UPDATED, USER_STATUS_CHANGE, DATA_EXPORT, DATA_DOWNLOAD, SETTINGS_CHANGED
LOW: LOGIN, LOGOUT, MFA_VERIFIED, SESSION_EXPIRED, DOWNLOAD_HISTORY_VIEW
```

### 5.3. 알림 트리거 정책

```
monitoredActions에 포함된 액션 발생 시:
  - receiveEmail=true → 이메일 발송 (비동기 큐)
  - receivePush=true → 관리자 앱 푸시 발송
CRITICAL 액션: 알림 설정과 무관하게 항상 발송 (강제)
```

