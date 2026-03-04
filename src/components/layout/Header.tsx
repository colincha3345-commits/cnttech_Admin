import { useNavigate } from 'react-router-dom';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui';
import { GlobalSearch } from './GlobalSearch';
import { NotificationPanel } from './NotificationPanel';
import { useAuth } from '@/stores/authStore';
import { USER_ROLE_LABELS } from '@/constants/user';
import { STAFF_TYPE_LABELS } from '@/types/staff';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = '대시보드' }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleMyPage = () => {
    if (!user?.id) return;
    const type = user.staffType === 'franchise' ? 'franchise' : 'headquarters';
    navigate(`/staff/edit/${type}/${user.id}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="admin-header">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          className="btn-icon lg:hidden"
          onClick={onMenuClick}
          aria-label="메뉴 열기"
        >
          <MenuOutlined style={{ fontSize: 20 }} />
        </Button>

        {/* Page Title */}
        <h1 className="text-xl font-semibold text-txt-main hidden sm:block">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Global Search */}
        <div className="hidden md:flex items-center">
          <GlobalSearch />
        </div>

        {/* Notifications */}
        <NotificationPanel />

        {/* User Menu */}
        <div className="pl-2 border-l border-border">
          <DropdownMenu
            align="end"
            trigger={
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-bg-hover transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <UserOutlined className="text-primary" style={{ fontSize: 16 }} />
                </div>
                <span className="hidden sm:block text-sm font-medium text-txt-main">
                  {user?.name ?? '관리자'}
                </span>
              </button>
            }
          >
            {/* 프로필 헤더 */}
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UserOutlined className="text-primary" style={{ fontSize: 20 }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-txt-main truncate">
                    {user?.name ?? '관리자'}
                  </p>
                  <p className="text-xs text-txt-muted truncate">
                    {user?.staffType ? STAFF_TYPE_LABELS[user.staffType] : '본사'}
                    {' | '}
                    {user?.role ? USER_ROLE_LABELS[user.role] : '관리자'}
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleMyPage}>
              마이페이지
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="text-critical">
              <span>logout</span>
              <LogoutOutlined style={{ fontSize: 14 }} />
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
