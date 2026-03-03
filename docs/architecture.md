# Architecture

## 기술 스택
- React 18 + TypeScript + Vite
- Tailwind CSS + Ant Design Icons
- Zustand (상태관리)
- React Router v6

## 폴더 구조 (Clean Architecture)

```
src/
├── components/        # Presentation (공통 UI)
│   ├── auth/          # 인증 관련 컴포넌트
│   ├── dev/           # 개발용 컴포넌트
│   ├── layout/        # 레이아웃 (Sidebar, Header 등)
│   └── ui/            # 공통 UI (Badge, Card, ImageUpload 등)
├── hooks/             # Presentation (상태 + 데이터 페칭)
├── services/          # Application (비즈니스 로직 + API 호출)
├── types/             # Domain (타입 정의)
├── lib/
│   ├── api/           # Infrastructure (API 클라이언트)
│   └── utils/         # 유틸리티 함수
└── pages/             # Presentation (페이지 컴포넌트)
```

## 페이지 카테고리

| 카테고리 | 폴더 | 주요 페이지 |
| --- | --- | --- |
| 대시보드 | `Dashboard/` | Dashboard |
| 메뉴관리 | `Menu/` | Products, Categories, OptionGroups, OptionCategories |
| 주문관리 | `Orders/` | OrderList, OrderDetail |
| 회원관리 | `AppMembers/` | AppMemberList, GradeManagement, MemberGroups, MemberExtract |
| 마케팅 | `Marketing/` | Coupons, Discounts, PointSettings, BenefitCampaigns, PushNotifications |
| 이벤트 | `events/` | Events |
| 디자인관리 | `Design/` | BannerManagement, PopupManagement, IconBadgeManagement, MainScreenManagement |
| 정산 | `Settlement/` | SettlementList, SettlementDetail, SettlementStats |
| 매장관리 | `Store/` | StoreDetail, StoreForm |
| 직원관리 | `Staff/` | HeadquartersStaff, FranchiseStaff, Teams, StaffApprovals |
| 권한관리 | `permissions/` | PermissionManagement |
| 설정 | `Settings/` | Settings |
| 감사로그 | `AuditLogs/` | AuditLogList |
| 로그인 | `Login/` | LoginPage |
| 초대 | `Invitation/` | AcceptInvitation |


## 호출 규칙

```
Pages(UI) → hooks → services → lib/api
```

- 컴포넌트에서 직접 fetch 금지
- services에서 비즈니스 로직 처리
- types에서 Domain 타입 정의 (외부 의존성 없음)
