import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MenuOutlined,
  UserOutlined,
  LogoutOutlined,
  LockOutlined,
} from '@ant-design/icons';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  Input,
  Label,
  Spinner,
} from '@/components/ui';
import { GlobalSearch } from './GlobalSearch';
import { NotificationPanel } from './NotificationPanel';
import { useAuth } from '@/stores/authStore';
import { useChangePassword } from '@/hooks';
import { useToast } from '@/hooks/useToast';
import { STAFF_TYPE_LABELS } from '@/types/staff';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export function Header({ onMenuClick, title = '대시보드' }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();
  const changePasswordMutation = useChangePassword();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleMyPage = () => {
    if (!user?.id) return;
    const type = user.staffType === 'franchise' ? 'franchise' : 'headquarters';
    navigate(`/staff/edit/${type}/${user.id}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    if (!passwordForm.currentPassword.trim()) {
      toast.error('현재 비밀번호를 입력해주세요.');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('새 비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      await changePasswordMutation.mutateAsync({
        id: user.id,
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('비밀번호가 변경되었습니다.');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      toast.error('비밀번호 변경에 실패했습니다.');
    }
  };

  return (
    <>
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
                  </p>
                </div>
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleMyPage}>
              마이페이지
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => setShowPasswordModal(true)}>
              <LockOutlined style={{ fontSize: 14 }} />
              <span>비밀번호 변경</span>
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

      {/* 비밀번호 변경 모달 - header 외부에 렌더링 */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40" onClick={() => setShowPasswordModal(false)}>
          <div className="bg-bg-card rounded-xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-txt-main mb-4">비밀번호 변경</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label required>현재 비밀번호</Label>
                <Input
                  type="password"
                  placeholder="현재 비밀번호"
                  value={passwordForm.currentPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))}
                  disabled={changePasswordMutation.isPending}
                />
              </div>
              <div>
                <Label required>새 비밀번호</Label>
                <Input
                  type="password"
                  placeholder="8자 이상"
                  value={passwordForm.newPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))}
                  disabled={changePasswordMutation.isPending}
                />
              </div>
              <div>
                <Label required>새 비밀번호 확인</Label>
                <Input
                  type="password"
                  placeholder="새 비밀번호 재입력"
                  value={passwordForm.confirmPassword}
                  onChange={e => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  disabled={changePasswordMutation.isPending}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowPasswordModal(false)}>취소</Button>
                <Button type="submit" disabled={changePasswordMutation.isPending}>
                  {changePasswordMutation.isPending ? <Spinner size="sm" /> : '변경'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
