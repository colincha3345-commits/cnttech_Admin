import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { PAGE_TITLES } from '@/constants';

export function AdminLayout() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = PAGE_TITLES[location.pathname] || '관리자';

  return (
    <div className="admin-container">
      <Sidebar
        isMobileOpen={isMobileOpen}
        onMobileClose={() => setIsMobileOpen(false)}
      />

      <div className="admin-content">
        <Header
          onMenuClick={() => setIsMobileOpen(true)}
          title={pageTitle}
        />

        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
