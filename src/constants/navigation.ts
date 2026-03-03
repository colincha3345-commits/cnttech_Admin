import type { CSSProperties, ComponentType } from 'react';
import {
  DashboardOutlined,
  UserOutlined,
  FileTextOutlined,
  SafetyOutlined,
  SettingOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  TagsOutlined,
  GroupOutlined,
  GiftOutlined,
  PercentageOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  DownloadOutlined,
  UsergroupAddOutlined,
  BankOutlined,
  ShopOutlined,
  ApartmentOutlined,
  CheckSquareOutlined,
  ThunderboltOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  CalendarOutlined,
  NotificationOutlined,
  BarChartOutlined,
  PictureOutlined,
  MobileOutlined,
  HighlightOutlined,
  StarOutlined,
  CustomerServiceOutlined,
  QuestionCircleOutlined,
  CommentOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';

export interface NavItem {
  path: string;
  icon: ComponentType<{ style?: CSSProperties }>;
  label: string;
  children?: NavItem[];
}

/**
 * 사이드바 네비게이션 항목
 */
export const NAV_ITEMS: NavItem[] = [
  {
    path: '/dashboard',
    icon: DashboardOutlined,
    label: '대시보드',
    children: [
      { path: '/dashboard', icon: BarChartOutlined, label: '통계 요약' },
      { path: '/dashboard/ga4', icon: AppstoreOutlined, label: 'GA4 통계 현황' },
    ],
  },
  {
    path: '/menu',
    icon: AppstoreOutlined,
    label: '메뉴관리',
    children: [
      { path: '/menu/categories', icon: UnorderedListOutlined, label: '카테고리' },
      { path: '/menu/products', icon: FileTextOutlined, label: '메뉴' },
      { path: '/menu/options', icon: TagsOutlined, label: '옵션 카테고리' },
      { path: '/menu/option-groups', icon: GroupOutlined, label: '옵션 그룹' },
    ],
  },
  {
    path: '/marketing',
    icon: GiftOutlined,
    label: '마케팅관리',
    children: [
      { path: '/marketing/discounts', icon: PercentageOutlined, label: '할인' },
      { path: '/marketing/coupons', icon: GiftOutlined, label: '쿠폰' },
      { path: '/marketing/campaigns', icon: ThunderboltOutlined, label: '캠페인' },
      { path: '/marketing/points', icon: DollarOutlined, label: '포인트 설정' },
    ],
  },
  { path: '/events', icon: CalendarOutlined, label: '이벤트관리' },
  { path: '/marketing/push', icon: NotificationOutlined, label: '앱푸시관리' },
  {
    path: '/orders',
    icon: ShoppingCartOutlined,
    label: '주문관리',
    children: [
      { path: '/orders', icon: UnorderedListOutlined, label: '주문 목록' },
    ],
  },
  {
    path: '/app-members',
    icon: TeamOutlined,
    label: '앱회원관리',
    children: [
      { path: '/app-members', icon: UserOutlined, label: '전체회원' },
      { path: '/app-members/inactive', icon: ClockCircleOutlined, label: '3개월이상 미접속' },
      { path: '/app-members/no-order', icon: ShoppingOutlined, label: '미주문회원' },
      { path: '/app-members/extract', icon: DownloadOutlined, label: '회원데이터 추출' },
      { path: '/app-members/groups', icon: UsergroupAddOutlined, label: '회원 그룹 관리' },
      { path: '/app-members/grades', icon: TrophyOutlined, label: '등급 관리' },
    ],
  },
  {
    path: '/staff',
    icon: BankOutlined,
    label: '본사/가맹계정',
    children: [
      { path: '/staff/headquarters', icon: TeamOutlined, label: '본사 직원' },
      { path: '/staff/franchise', icon: ShopOutlined, label: '가맹점 직원' },
      { path: '/staff/approvals', icon: CheckSquareOutlined, label: '승인 관리' },
      { path: '/staff/teams', icon: ApartmentOutlined, label: '팀 관리' },
      { path: '/staff/stores', icon: ShopOutlined, label: '매장 관리' },
    ],
  },
  {
    path: '/design',
    icon: HighlightOutlined,
    label: '디자인관리',
    children: [
      { path: '/design/banners', icon: PictureOutlined, label: '배너관리' },
      { path: '/design/popups', icon: MobileOutlined, label: '팝업관리' },
      { path: '/design/icon-badges', icon: StarOutlined, label: '아이콘뱃지관리' },
      { path: '/design/main-screen', icon: AppstoreOutlined, label: '메인화면관리' },
    ],
  },
  {
    path: '/support',
    icon: CustomerServiceOutlined,
    label: '고객센터',
    children: [
      { path: '/support/inquiries', icon: CommentOutlined, label: '1:1 문의' },
      { path: '/support/franchise-inquiries', icon: ShopOutlined, label: '가맹 문의' },
      { path: '/support/faq', icon: QuestionCircleOutlined, label: 'FAQ 관리' },
      { path: '/support/terms', icon: FileProtectOutlined, label: '약관관리' },
    ],
  },
  { path: '/audit-logs', icon: FileTextOutlined, label: '감사 로그' },
  { path: '/permissions', icon: SafetyOutlined, label: '권한 관리' },
  {
    path: '/settlement',
    icon: DollarOutlined,
    label: '정산관리',
    children: [
      { path: '/settlement', icon: UnorderedListOutlined, label: '정산 내역' },
      { path: '/settlement/stats', icon: BarChartOutlined, label: '통계/조회' },
    ],
  },
  { path: '/settings', icon: SettingOutlined, label: '설정' },
];

/**
 * 페이지 경로별 제목 매핑
 */
export const PAGE_TITLES: Record<string, string> = {
  '/dashboard': '대시보드 (통계 요약)',
  '/dashboard/ga4': 'GA4 통계 현황',
  '/dashboard/ga4/device': '디바이스 상세 분석',
  '/dashboard/ga4/funnel': '퍼널 상세 분석',
  '/menu/categories': '카테고리 관리',
  '/menu/products': '메뉴 관리',
  '/menu/options': '옵션 카테고리',
  '/menu/option-groups': '옵션 그룹',
  '/marketing/discounts': '할인 관리',
  '/marketing/coupons': '쿠폰 관리',
  '/marketing/campaigns': '캠페인 관리',
  '/marketing/points': '포인트 설정',
  '/events': '이벤트 관리',
  '/marketing/push': '앱푸시 관리',
  '/marketing/push/new': '새 푸시 작성',
  '/orders': '주문 목록',
  '/orders/:id': '주문 상세',
  '/app-members': '전체회원',
  '/app-members/inactive': '3개월이상 미접속 회원',
  '/app-members/no-order': '미주문회원',
  '/app-members/extract': '회원데이터 추출',
  '/app-members/groups': '회원 그룹 관리',
  '/app-members/grades': '등급 관리',
  '/staff/headquarters': '본사 직원 관리',
  '/staff/franchise': '가맹점 직원 관리',
  '/staff/approvals': '계정 승인 관리',
  '/staff/teams': '팀 관리',
  '/staff/stores': '매장 관리',
  '/design/banners': '배너 관리',
  '/design/popups': '팝업 관리',
  '/design/icon-badges': '아이콘뱃지 관리',
  '/design/main-screen': '메인화면 관리',
  '/support/inquiries': '1:1 문의',
  '/support/franchise-inquiries': '가맹 문의',
  '/support/faq': 'FAQ 관리',
  '/support/terms': '약관관리',
  '/audit-logs': '감사 로그',
  '/permissions': '권한 관리',
  '/settlement': '정산 내역',
  '/settlement/stats': '통계/조회',
  '/settings': '설정',
};
