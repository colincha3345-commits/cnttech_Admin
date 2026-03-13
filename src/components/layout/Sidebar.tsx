import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { DownOutlined, RightOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';

import { NAV_ITEMS } from '@/constants';
import type { NavItem } from '@/constants';

/** 현재 경로가 속하는 부모 메뉴 path를 찾는다 */
function findParentPath(pathname: string): string | null {
  for (const item of NAV_ITEMS) {
    if (!item.children) continue;
    if (item.children.some((child) => pathname === child.path || pathname.startsWith(child.path + '/'))) {
      return item.path;
    }
  }
  return null;
}

interface SidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>([]);

  // 현재 경로에 맞는 카테고리 자동 확장
  useEffect(() => {
    const parent = findParentPath(pathname);
    if (parent && !openMenus.includes(parent)) {
      setOpenMenus((prev) => prev.includes(parent) ? prev : [parent]);
    }
  }, [pathname]);

  const toggleMenu = (path: string) => {
    setOpenMenus((prev) =>
      prev.includes(path) ? [] : [path]
    );
  };

  const renderNavItem = (item: NavItem) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus.includes(item.path);

    if (hasChildren) {
      return (
        <div key={item.path}>
          {/* 부모 메뉴 */}
          <button
            onClick={() => toggleMenu(item.path)}
            className="sidebar-nav-item w-full"
          >
            <item.icon style={{ fontSize: 20 }} />
            <span className="flex-1 text-left">{item.label}</span>
            {isOpen ? (
              <DownOutlined style={{ fontSize: 12 }} />
            ) : (
              <RightOutlined style={{ fontSize: 12 }} />
            )}
          </button>

          {/* 하위 메뉴 */}
          {isOpen && item.children && (
            <div className="pl-4">
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  end
                  onClick={onMobileClose}
                  className={({ isActive }) =>
                    clsx('sidebar-nav-item', isActive && 'active')
                  }
                >
                  <child.icon style={{ fontSize: 18 }} />
                  <span>{child.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={item.path}
        onClick={onMobileClose}
        className={({ isActive }) =>
          clsx('sidebar-nav-item', isActive && 'active')
        }
      >
        <item.icon style={{ fontSize: 20 }} />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx('admin-sidebar', isMobileOpen && 'mobile-open')}
      >
        {/* Logo */}
        <div
          className="sidebar-header cursor-pointer transition-opacity hover:opacity-80"
          onClick={() => {
            navigate('/dashboard');
            onMobileClose(); // 모바일 환경에서 닫힘 처리
          }}
        >
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-auto object-contain"
          />
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">{NAV_ITEMS.map(renderNavItem)}</nav>
      </aside>
    </>
  );
}
