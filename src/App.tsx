import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { AdminLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { ToastProvider, useSessionTimeout } from '@/hooks';

// Lazy-loaded pages (route-level code splitting)
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const GA4Statistics = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.GA4Statistics })));
const GA4DeviceDetail = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.GA4DeviceDetail })));
const GA4FunnelDetail = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.GA4FunnelDetail })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));
const PermissionManagement = lazy(() => import('@/pages/Permissions').then(m => ({ default: m.PermissionManagement })));
const LoginPage = lazy(() => import('@/pages/Login').then(m => ({ default: m.LoginPage })));
const Categories = lazy(() => import('@/pages/Menu').then(m => ({ default: m.Categories })));
const Products = lazy(() => import('@/pages/Menu').then(m => ({ default: m.Products })));
const OptionCategories = lazy(() => import('@/pages/Menu').then(m => ({ default: m.OptionCategories })));
const OptionGroups = lazy(() => import('@/pages/Menu').then(m => ({ default: m.OptionGroups })));
const MenuInfoManagement = lazy(() => import('@/pages/Menu').then(m => ({ default: m.MenuInfoManagement })));
const Discounts = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.Discounts })));
const Coupons = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.Coupons })));
const BenefitCampaigns = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.BenefitCampaigns })));
const PointSettings = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.PointSettings })));
const PushList = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.PushList })));
const PushNotificationFormPage = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.PushNotificationFormPage })));
const PushDetail = lazy(() => import('@/pages/Marketing').then(m => ({ default: m.PushDetail })));
const EventManagement = lazy(() => import('@/pages/Events').then(m => ({ default: m.EventManagement })));
const OrderList = lazy(() => import('@/pages/Orders').then(m => ({ default: m.OrderList })));
const OrderDetail = lazy(() => import('@/pages/Orders').then(m => ({ default: m.OrderDetail })));
const AbnormalOrderList = lazy(() => import('@/pages/Orders').then(m => ({ default: m.AbnormalOrderList })));
const AppMemberList = lazy(() => import('@/pages/AppMembers').then(m => ({ default: m.AppMemberList })));
const AppMemberDetail = lazy(() => import('@/pages/AppMembers').then(m => ({ default: m.AppMemberDetail })));
const MemberExtract = lazy(() => import('@/pages/AppMembers').then(m => ({ default: m.MemberExtract })));
const MemberGroups = lazy(() => import('@/pages/AppMembers').then(m => ({ default: m.MemberGroups })));
const MemberGroupDetail = lazy(() => import('@/pages/AppMembers').then(m => ({ default: m.MemberGroupDetail })));
const GradeManagement = lazy(() => import('@/pages/AppMembers').then(m => ({ default: m.GradeManagement })));
const HeadquartersStaff = lazy(() => import('@/pages/Staff').then(m => ({ default: m.HeadquartersStaff })));
const FranchiseStaff = lazy(() => import('@/pages/Staff').then(m => ({ default: m.FranchiseStaff })));
const Teams = lazy(() => import('@/pages/Staff').then(m => ({ default: m.Teams })));
const TeamEditPage = lazy(() => import('@/pages/Staff').then(m => ({ default: m.TeamEditPage })));
const Branches = lazy(() => import('@/pages/Staff').then(m => ({ default: m.Branches })));
const BranchEditPage = lazy(() => import('@/pages/Staff').then(m => ({ default: m.BranchEditPage })));
const BranchStaff = lazy(() => import('@/pages/Staff').then(m => ({ default: m.BranchStaff })));
const StaffApprovals = lazy(() => import('@/pages/Staff').then(m => ({ default: m.StaffApprovals })));
const StaffApprovalDetail = lazy(() => import('@/pages/Staff').then(m => ({ default: m.StaffApprovalDetail })));
const StaffEditPage = lazy(() => import('@/pages/Staff').then(m => ({ default: m.StaffEditPage })));
const StoreList = lazy(() => import('@/pages/Store').then(m => ({ default: m.StoreList })));
const StoreDetail = lazy(() => import('@/pages/Store').then(m => ({ default: m.StoreDetail })));
const StoreForm = lazy(() => import('@/pages/Store').then(m => ({ default: m.StoreForm })));
const OperatingInfoEdit = lazy(() => import('@/pages/Store').then(m => ({ default: m.OperatingInfoEdit })));
const IntegrationCodesEdit = lazy(() => import('@/pages/Store').then(m => ({ default: m.IntegrationCodesEdit })));
const AmenitiesEdit = lazy(() => import('@/pages/Store').then(m => ({ default: m.AmenitiesEdit })));
const ClosedDayEdit = lazy(() => import('@/pages/Store').then(m => ({ default: m.ClosedDayEdit })));
const PaymentMethodsEdit = lazy(() => import('@/pages/Store').then(m => ({ default: m.PaymentMethodsEdit })));
const SettlementList = lazy(() => import('@/pages/Settlement').then(m => ({ default: m.SettlementList })));
const SettlementDetail = lazy(() => import('@/pages/Settlement').then(m => ({ default: m.SettlementDetail })));
const SettlementStats = lazy(() => import('@/pages/Settlement').then(m => ({ default: m.SettlementStats })));
const BannerManagement = lazy(() => import('@/pages/Design').then(m => ({ default: m.BannerManagement })));
const PopupManagement = lazy(() => import('@/pages/Design').then(m => ({ default: m.PopupManagement })));
const IconBadgeManagement = lazy(() => import('@/pages/Design').then(m => ({ default: m.IconBadgeManagement })));
const MainScreenManagement = lazy(() => import('@/pages/Design').then(m => ({ default: m.MainScreenManagement })));
const InquiryList = lazy(() => import('@/pages/Support').then(m => ({ default: m.InquiryList })));
const FaqManagement = lazy(() => import('@/pages/Support').then(m => ({ default: m.FaqManagement })));
const TermsManagement = lazy(() => import('@/pages/Support').then(m => ({ default: m.TermsManagement })));
const AuditLogList = lazy(() => import('@/pages/AuditLogs').then(m => ({ default: m.AuditLogList })));
const DeliveryZoneList = lazy(() => import('@/pages/DeliveryZone/DeliveryZoneList').then(m => ({ default: m.DeliveryZoneList })));
const DeliveryZoneEditor = lazy(() => import('@/pages/DeliveryZone/DeliveryZoneEditor').then(m => ({ default: m.DeliveryZoneEditor })));
const AcceptInvitation = lazy(() => import('@/pages/Invitation').then(m => ({ default: m.AcceptInvitation })));

export default function App() {
  useSessionTimeout();
  return (
    <ToastProvider>
      <Suspense fallback={<div className="flex items-center justify-center h-screen text-gray-500">로딩 중...</div>}>
      <Routes>
        {/* 공개 라우트 */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/invitation/accept" element={<AcceptInvitation />} />

        {/* 보호된 라우트 */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<ProtectedRoute requiredPermissions={[{ resource: 'dashboard', action: 'read' }]}><Dashboard /></ProtectedRoute>} />
          <Route path="dashboard/ga4" element={<ProtectedRoute requiredPermissions={[{ resource: 'dashboard', action: 'read' }]}><GA4Statistics /></ProtectedRoute>} />
          <Route path="dashboard/ga4/device" element={<ProtectedRoute requiredPermissions={[{ resource: 'dashboard', action: 'read' }]}><GA4DeviceDetail /></ProtectedRoute>} />
          <Route path="dashboard/ga4/funnel" element={<ProtectedRoute requiredPermissions={[{ resource: 'dashboard', action: 'read' }]}><GA4FunnelDetail /></ProtectedRoute>} />

          {/* 메뉴관리 */}
          <Route path="menu/categories" element={<ProtectedRoute requiredPermissions={[{ resource: 'menu', action: 'read' }]}><Categories /></ProtectedRoute>} />
          <Route path="menu/products" element={<ProtectedRoute requiredPermissions={[{ resource: 'menu', action: 'read' }]}><Products /></ProtectedRoute>} />
          <Route path="menu/options" element={<ProtectedRoute requiredPermissions={[{ resource: 'menu', action: 'read' }]}><OptionCategories /></ProtectedRoute>} />
          <Route path="menu/option-groups" element={<ProtectedRoute requiredPermissions={[{ resource: 'menu', action: 'read' }]}><OptionGroups /></ProtectedRoute>} />
          <Route path="menu/info" element={<ProtectedRoute requiredPermissions={[{ resource: 'menu', action: 'read' }]}><MenuInfoManagement /></ProtectedRoute>} />

          {/* 마케팅관리 */}
          <Route path="marketing/discounts" element={<ProtectedRoute requiredPermissions={[{ resource: 'marketing', action: 'read' }]}><Discounts /></ProtectedRoute>} />
          <Route path="marketing/coupons" element={<ProtectedRoute requiredPermissions={[{ resource: 'marketing', action: 'read' }]}><Coupons /></ProtectedRoute>} />
          <Route path="marketing/campaigns" element={<ProtectedRoute requiredPermissions={[{ resource: 'marketing', action: 'read' }]}><BenefitCampaigns /></ProtectedRoute>} />
          <Route path="marketing/points" element={<ProtectedRoute requiredPermissions={[{ resource: 'marketing', action: 'read' }]}><PointSettings /></ProtectedRoute>} />
          <Route path="marketing/push" element={<ProtectedRoute requiredPermissions={[{ resource: 'marketing', action: 'read' }]}><PushList /></ProtectedRoute>} />
          <Route path="marketing/push/new" element={<ProtectedRoute requiredPermissions={[{ resource: 'marketing', action: 'write' }]}><PushNotificationFormPage /></ProtectedRoute>} />
          <Route path="marketing/push/:id" element={<ProtectedRoute requiredPermissions={[{ resource: 'marketing', action: 'read' }]}><PushDetail /></ProtectedRoute>} />

          {/* 이벤트관리 */}
          <Route path="events" element={<ProtectedRoute requiredPermissions={[{ resource: 'events', action: 'read' }]}><EventManagement /></ProtectedRoute>} />

          {/* 주문관리 */}
          <Route path="orders" element={<ProtectedRoute requiredPermissions={[{ resource: 'orders', action: 'read' }]}><OrderList /></ProtectedRoute>} />
          <Route path="orders/abnormal" element={<ProtectedRoute requiredPermissions={[{ resource: 'orders', action: 'read' }]}><AbnormalOrderList /></ProtectedRoute>} />
          <Route path="orders/:id" element={<ProtectedRoute requiredPermissions={[{ resource: 'orders', action: 'read' }]}><OrderDetail /></ProtectedRoute>} />

          {/* 앱회원관리 */}
          <Route path="app-members" element={<ProtectedRoute requiredPermissions={[{ resource: 'app-members', action: 'read' }]}><AppMemberList filter="all" /></ProtectedRoute>} />
          <Route path="app-members/inactive" element={<ProtectedRoute requiredPermissions={[{ resource: 'app-members', action: 'read' }]}><AppMemberList filter="inactive_90days" /></ProtectedRoute>} />
          <Route path="app-members/no-order" element={<ProtectedRoute requiredPermissions={[{ resource: 'app-members', action: 'read' }]}><AppMemberList filter="no_order" /></ProtectedRoute>} />
          <Route path="app-members/extract" element={<ProtectedRoute requiredPermissions={[{ resource: 'app-members', action: 'read' }]}><MemberExtract /></ProtectedRoute>} />
          <Route path="app-members/groups" element={<ProtectedRoute requiredPermissions={[{ resource: 'app-members', action: 'read' }]}><MemberGroups /></ProtectedRoute>} />
          <Route path="app-members/groups/:id" element={<ProtectedRoute requiredPermissions={[{ resource: 'app-members', action: 'read' }]}><MemberGroupDetail /></ProtectedRoute>} />
          <Route path="app-members/grades" element={<ProtectedRoute requiredPermissions={[{ resource: 'app-members', action: 'read' }]}><GradeManagement /></ProtectedRoute>} />
          <Route path="app-members/:id" element={<ProtectedRoute requiredPermissions={[{ resource: 'app-members', action: 'read' }]}><AppMemberDetail /></ProtectedRoute>} />

          {/* 본사/가맹계정 */}
          <Route path="staff/headquarters" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><HeadquartersStaff /></ProtectedRoute>} />
          <Route path="staff/franchise" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><FranchiseStaff /></ProtectedRoute>} />
          <Route path="staff/edit/:type/:id" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><StaffEditPage /></ProtectedRoute>} />
          <Route path="staff/approvals" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><StaffApprovals /></ProtectedRoute>} />
          <Route path="staff/approvals/:id" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><StaffApprovalDetail /></ProtectedRoute>} />
          <Route path="staff/teams" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><Teams /></ProtectedRoute>} />
          <Route path="staff/teams/:id/edit" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><TeamEditPage /></ProtectedRoute>} />
          <Route path="staff/teams/new" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><TeamEditPage /></ProtectedRoute>} />
          <Route path="staff/branches" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><Branches /></ProtectedRoute>} />
          <Route path="staff/branches/new" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><BranchEditPage /></ProtectedRoute>} />
          <Route path="staff/branches/:id/edit" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><BranchEditPage /></ProtectedRoute>} />
          <Route path="staff/branch" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><BranchStaff /></ProtectedRoute>} />
          <Route path="staff/stores" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><StoreList /></ProtectedRoute>} />
          <Route path="staff/stores/new" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><StoreForm mode="create" /></ProtectedRoute>} />
          <Route path="staff/stores/:id" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><StoreDetail /></ProtectedRoute>} />
          <Route path="staff/stores/:id/edit" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><StoreForm mode="edit" /></ProtectedRoute>} />

          {/* 매장 상세 페이지 - 서브모달에서 페이지로 변경된 라우트 */}
          <Route path="staff/stores/:id/edit/operating" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><OperatingInfoEdit /></ProtectedRoute>} />
          <Route path="staff/stores/:id/edit/integration" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><IntegrationCodesEdit /></ProtectedRoute>} />
          <Route path="staff/stores/:id/edit/amenities" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><AmenitiesEdit /></ProtectedRoute>} />
          <Route path="staff/stores/:id/edit/closed-day" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><ClosedDayEdit /></ProtectedRoute>} />
          <Route path="staff/stores/:id/edit/payment-methods" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><PaymentMethodsEdit /></ProtectedRoute>} />

          {/* 디자인관리 */}
          <Route path="design/banners" element={<ProtectedRoute requiredPermissions={[{ resource: 'design', action: 'read' }]}><BannerManagement /></ProtectedRoute>} />
          <Route path="design/popups" element={<ProtectedRoute requiredPermissions={[{ resource: 'design', action: 'read' }]}><PopupManagement /></ProtectedRoute>} />
          <Route path="design/icon-badges" element={<ProtectedRoute requiredPermissions={[{ resource: 'design', action: 'read' }]}><IconBadgeManagement /></ProtectedRoute>} />
          <Route path="design/main-screen" element={<ProtectedRoute requiredPermissions={[{ resource: 'design', action: 'read' }]}><MainScreenManagement /></ProtectedRoute>} />

          {/* 정산관리 */}
          <Route path="settlement" element={<ProtectedRoute requiredPermissions={[{ resource: 'settlement', action: 'read' }]}><SettlementList /></ProtectedRoute>} />
          <Route path="settlement/stats" element={<ProtectedRoute requiredPermissions={[{ resource: 'settlement', action: 'read' }]}><SettlementStats /></ProtectedRoute>} />
          <Route path="settlement/:id" element={<ProtectedRoute requiredPermissions={[{ resource: 'settlement', action: 'read' }]}><SettlementDetail /></ProtectedRoute>} />

          {/* 고객센터 */}
          <Route path="support/inquiries" element={<ProtectedRoute requiredPermissions={[{ resource: 'support', action: 'read' }]}><InquiryList type="customer" title="1:1 문의" /></ProtectedRoute>} />
          <Route path="support/franchise-inquiries" element={<ProtectedRoute requiredPermissions={[{ resource: 'support', action: 'read' }]}><InquiryList type="franchise" title="가맹 문의" /></ProtectedRoute>} />
          <Route path="support/faq" element={<ProtectedRoute requiredPermissions={[{ resource: 'support', action: 'read' }]}><FaqManagement /></ProtectedRoute>} />
          <Route path="support/terms" element={<ProtectedRoute requiredPermissions={[{ resource: 'support', action: 'read' }]}><TermsManagement /></ProtectedRoute>} />

          {/* 상권 관리 */}
          <Route path="delivery-zones" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><DeliveryZoneList /></ProtectedRoute>} />
          <Route path="delivery-zones/new" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><DeliveryZoneEditor /></ProtectedRoute>} />
          <Route path="delivery-zones/:id/edit" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'write' }]}><DeliveryZoneEditor /></ProtectedRoute>} />

          {/* 감사로그 / 권한관리 / 설정 */}
          <Route path="audit-logs" element={<ProtectedRoute requiredPermissions={[{ resource: 'audit-logs', action: 'read' }]}><AuditLogList /></ProtectedRoute>} />
          <Route path="permissions" element={<ProtectedRoute requiredPermissions={[{ resource: 'permissions', action: 'read' }]}><PermissionManagement /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute requiredPermissions={[{ resource: 'settings', action: 'read' }]}><Settings /></ProtectedRoute>} />
        </Route>
      </Routes>
      </Suspense>
    </ToastProvider>
  );
}
