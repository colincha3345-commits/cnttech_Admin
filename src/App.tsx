import { Routes, Route, Navigate } from 'react-router-dom';

import { AdminLayout } from '@/components/layout';
import { ProtectedRoute } from '@/components/auth';
import { Dashboard, GA4Statistics, GA4DeviceDetail, GA4FunnelDetail } from '@/pages/Dashboard';
import { Settings } from '@/pages/Settings';
import { PermissionManagement } from '@/pages/permissions';
import { LoginPage } from '@/pages/Login';
import { Categories, Products, OptionCategories, OptionGroups } from '@/pages/Menu';
import { Discounts, Coupons, BenefitCampaigns, PointSettings, PushList, PushNotificationFormPage, PushDetail } from '@/pages/Marketing';
import { EventManagement } from '@/pages/events';
import { OrderList, OrderDetail } from '@/pages/Orders';
import { AppMemberList, AppMemberDetail, MemberExtract, MemberGroups, MemberGroupDetail, GradeManagement } from '@/pages/AppMembers';
import { HeadquartersStaff, FranchiseStaff, Teams, StaffApprovals, StaffEditPage } from '@/pages/Staff';
import { StoreList, StoreDetail, StoreForm, OperatingInfoEdit, IntegrationCodesEdit, AmenitiesEdit, ClosedDayEdit, PaymentMethodsEdit } from '@/pages/Store';
import { SettlementList, SettlementDetail, SettlementStats } from '@/pages/Settlement';
import { BannerManagement, PopupManagement, IconBadgeManagement, MainScreenManagement } from '@/pages/Design';
import { InquiryList, FaqManagement, TermsManagement } from '@/pages/Support';
import { AuditLogList } from '@/pages/AuditLogs';
import { AcceptInvitation } from '@/pages/Invitation';
import { ToastProvider, useSessionTimeout } from '@/hooks';

export default function App() {
  useSessionTimeout();
  return (
    <ToastProvider>
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
          <Route path="staff/teams" element={<ProtectedRoute requiredPermissions={[{ resource: 'staff', action: 'read' }]}><Teams /></ProtectedRoute>} />
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

          {/* 감사로그 / 권한관리 / 설정 */}
          <Route path="audit-logs" element={<ProtectedRoute requiredPermissions={[{ resource: 'audit-logs', action: 'read' }]}><AuditLogList /></ProtectedRoute>} />
          <Route path="permissions" element={<ProtectedRoute requiredPermissions={[{ resource: 'permissions', action: 'read' }]}><PermissionManagement /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute requiredPermissions={[{ resource: 'settings', action: 'read' }]}><Settings /></ProtectedRoute>} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
