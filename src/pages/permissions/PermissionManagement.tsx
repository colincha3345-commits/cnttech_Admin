/**
 * 권한관리 페이지
 * 좌측: 계정 목록 / 우측: 선택된 계정의 메뉴별 접근 권한 설정
 * - admin만 수정 가능
 * - admin 계정의 권한은 변경 불가 (항상 전체 권한)
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { CSSProperties, ComponentType } from 'react';
import {
  SafetyOutlined,
  SaveOutlined,
  LockOutlined,
  UndoOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  GiftOutlined,
  CalendarOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BankOutlined,
  FileTextOutlined,
  SettingOutlined,
  HighlightOutlined,
  DollarOutlined,
  CustomerServiceOutlined,
  DownOutlined,
  RightOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { clsx } from 'clsx';

import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/Spinner';
import { useAccountPermissions, usePermissionMutations } from '@/hooks/usePermissions';
import { useAuth } from '@/stores/authStore';
import { useToast } from '@/hooks/useToast';
import { auditService } from '@/services/auditService';
import { useDebounce } from '@/hooks/useDebounce';
import { extractErrorMessage } from '@/utils/async';
import { ROLE_DISPLAY_NAMES } from '@/types/rbac';
import type { UserRole, BadgeVariant } from '@/types';
import type { AccountPermission, MenuPermission, AdminMenu, AccessLevel } from '@/types/permission';
import { MENU_PERMISSION_CONFIG } from '@/types/permission';

// 역할별 뱃지 variant 매핑
const ROLE_BADGE_VARIANT: Record<UserRole, BadgeVariant> = {
  admin: 'critical',
  manager: 'info',
  viewer: 'default',
};

// 역할 필터 옵션
type RoleFilter = 'all' | UserRole;
const ROLE_FILTER_OPTIONS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'manager', label: '매니저' },
  { value: 'viewer', label: '뷰어' },
];

// 상태 필터 옵션
type StatusFilter = 'all' | 'active' | 'inactive';
const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'inactive', label: '비활성' },
];

// 메뉴별 아이콘 매핑
const MENU_ICONS: Record<AdminMenu, ComponentType<{ style?: CSSProperties; className?: string }>> = {
  dashboard: DashboardOutlined,
  menu: AppstoreOutlined,
  marketing: GiftOutlined,
  events: CalendarOutlined,
  orders: ShoppingCartOutlined,
  'app-members': TeamOutlined,
  staff: BankOutlined,
  design: HighlightOutlined,
  settlement: DollarOutlined,
  support: CustomerServiceOutlined,
  'audit-logs': FileTextOutlined,
  permissions: SafetyOutlined,
  settings: SettingOutlined,
};

// ============================================
// Indeterminate 지원 체크박스
// ============================================

interface PermCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

function PermCheckbox({ checked, indeterminate, disabled, onChange, label }: PermCheckboxProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate ?? false;
    }
  }, [indeterminate]);

  return (
    <input
      ref={ref}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
      className={clsx(
        'w-5 h-5 shrink-0 rounded',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
      )}
      aria-label={label}
    />
  );
}

// ============================================
// 계정 카드 (좌측 패널)
// ============================================

interface AccountCardProps {
  account: AccountPermission;
  isSelected: boolean;
  hasEdits: boolean;
  onSelect: () => void;
}

function AccountCard({ account, isSelected, hasEdits, onSelect }: AccountCardProps) {
  const statusBadgeVariant: BadgeVariant = account.status === 'active' ? 'success' : 'default';
  const statusLabel = account.status === 'active' ? '활성' : '비활성';

  return (
    <div
      className={clsx(
        'border rounded-lg p-4 cursor-pointer transition-all',
        isSelected
          ? 'border-primary bg-primary/5 shadow-sm'
          : 'border-border hover:border-gray-400 hover:shadow-sm',
      )}
      onClick={onSelect}
    >
      {/* 1행: 번호 + 이름 + 부서 */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-semibold text-txt-main">
          NO. {account.accountNo}
        </span>
        <span className="text-sm font-semibold text-txt-main">
          {account.accountName}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-bg-secondary text-txt-muted">
          {account.department}
        </span>
        {hasEdits && (
          <span className="w-2 h-2 rounded-full bg-warning shrink-0" title="미저장 변경사항" />
        )}
      </div>

      {/* 2행: 이메일 */}
      <div className="text-xs text-txt-muted mb-2">
        {account.accountEmail}
      </div>

      {/* 3행: 뱃지 + 권한설정 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge variant={ROLE_BADGE_VARIANT[account.role]}>
            {ROLE_DISPLAY_NAMES[account.role]}
          </Badge>
          <Badge variant={statusBadgeVariant}>
            {statusLabel}
          </Badge>
        </div>
        <span className={clsx(
          'text-xs font-medium',
          isSelected ? 'text-primary' : 'text-txt-muted',
        )}>
          권한설정
        </span>
      </div>

      {/* 4행: 변경 이력 */}
      <div className="mt-2 text-[11px] text-txt-muted">
        최종 수정: {new Date(account.updatedAt).toLocaleDateString('ko-KR')} ({account.updatedBy})
      </div>
    </div>
  );
}

// ============================================
// 메뉴 권한 아이템 (아코디언)
// ============================================

interface MenuPermissionItemProps {
  config: (typeof MENU_PERMISSION_CONFIG)[number];
  permission: MenuPermission | undefined;
  disabled: boolean;
  expanded: boolean;
  onToggleExpand: () => void;
  onPermissionChange: (level: AccessLevel, value: boolean) => void;
  onToggleAll: (checked: boolean) => void;
}

function MenuPermissionItem({
  config,
  permission,
  disabled,
  expanded,
  onToggleExpand,
  onPermissionChange,
  onToggleAll,
}: MenuPermissionItemProps) {
  const Icon = MENU_ICONS[config.menu];
  const hasSubItems = config.subPermissions.length > 1;

  // 체크 상태 계산
  const checkedCount = config.subPermissions.filter(
    (sub) => permission?.[sub.level] ?? false,
  ).length;
  const allChecked = checkedCount === config.subPermissions.length;
  const someChecked = checkedCount > 0 && !allChecked;

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* 메뉴 헤더 */}
      <div
        className={clsx(
          'flex items-center gap-3 px-4 py-3 transition-colors',
          !disabled && 'hover:bg-bg-secondary/50',
          expanded && hasSubItems && 'border-b border-border bg-bg-secondary/30',
        )}
      >
        <Icon style={{ fontSize: 18 }} className="text-txt-muted shrink-0" />
        <PermCheckbox
          checked={allChecked}
          indeterminate={someChecked}
          disabled={disabled}
          onChange={(checked) => onToggleAll(checked)}
          label={config.label}
        />
        <span
          className="text-sm font-medium text-txt-main flex-1 cursor-pointer select-none"
          onClick={() => hasSubItems && onToggleExpand()}
        >
          {config.label}
        </span>
        {hasSubItems && (
          <button
            onClick={onToggleExpand}
            className="p-1 text-txt-muted hover:text-txt-main transition-colors"
          >
            {expanded ? (
              <DownOutlined style={{ fontSize: 12 }} />
            ) : (
              <RightOutlined style={{ fontSize: 12 }} />
            )}
          </button>
        )}
      </div>

      {/* 하위 권한 (확장 시) */}
      {expanded && hasSubItems && (
        <div className="px-4 py-2 space-y-2 bg-bg-primary">
          {config.subPermissions.map((sub) => (
            <label
              key={sub.level}
              className={clsx(
                'flex items-center gap-3 pl-9 py-1',
                disabled ? 'cursor-not-allowed' : 'cursor-pointer',
              )}
            >
              <PermCheckbox
                checked={permission?.[sub.level] ?? false}
                disabled={disabled}
                onChange={(value) => onPermissionChange(sub.level, value)}
                label={sub.label}
              />
              <span className="text-sm text-txt-main">{sub.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// 메인 페이지 컴포넌트
// ============================================

export function PermissionManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const { data: accounts, isLoading } = useAccountPermissions();
  const { updatePermission, resetPermission } = usePermissionMutations();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [editingMap, setEditingMap] = useState<Record<string, MenuPermission[]>>({});
  const [expandedMenus, setExpandedMenus] = useState<Set<AdminMenu>>(new Set());

  // 검색/필터 상태
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const isCurrentUserAdmin = user?.role === 'admin';
  const selectedAccount = accounts?.find((a) => a.accountId === selectedAccountId) ?? null;
  const isSelectedAdmin = selectedAccount?.role === 'admin';
  const isSelectedInactive = selectedAccount?.status === 'inactive';
  const canEdit = isCurrentUserAdmin && !isSelectedAdmin && !isSelectedInactive;

  // 현재 선택된 계정의 권한 (편집 중이면 편집 상태 우선)
  const currentPermissions = selectedAccountId
    ? editingMap[selectedAccountId] ?? selectedAccount?.permissions ?? []
    : [];

  const hasChanges = Object.keys(editingMap).length > 0;

  // 메뉴 확장/축소 토글
  const handleToggleExpand = useCallback((menu: AdminMenu) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(menu)) {
        next.delete(menu);
      } else {
        next.add(menu);
      }
      return next;
    });
  }, []);

  // 개별 권한 변경
  const handlePermissionChange = useCallback(
    (menu: AdminMenu, level: AccessLevel, value: boolean) => {
      if (!selectedAccountId || !selectedAccount) return;

      setEditingMap((prev) => {
        const current = prev[selectedAccountId] ?? [...selectedAccount.permissions];
        const updated = current.map((p) =>
          p.menu === menu ? { ...p, [level]: value } : p,
        );
        return { ...prev, [selectedAccountId]: updated };
      });
    },
    [selectedAccountId, selectedAccount],
  );

  // 메뉴 전체 토글 (해당 메뉴의 모든 하위 권한 on/off)
  const handleToggleAll = useCallback(
    (menu: AdminMenu, checked: boolean) => {
      if (!selectedAccountId || !selectedAccount) return;

      const config = MENU_PERMISSION_CONFIG.find((c) => c.menu === menu);
      if (!config) return;

      setEditingMap((prev) => {
        const current = prev[selectedAccountId] ?? [...selectedAccount.permissions];
        const updated = current.map((p) => {
          if (p.menu !== menu) return p;
          const newPerm = { ...p };
          config.subPermissions.forEach((sub) => {
            newPerm[sub.level] = checked;
          });
          return newPerm;
        });
        return { ...prev, [selectedAccountId]: updated };
      });
    },
    [selectedAccountId, selectedAccount],
  );

  // 마스터 토글 (전체 메뉴 on/off)
  const handleMasterToggle = useCallback(
    (checked: boolean) => {
      if (!selectedAccountId || !selectedAccount) return;

      setEditingMap((prev) => {
        const current = prev[selectedAccountId] ?? [...selectedAccount.permissions];
        const updated = current.map((p) => {
          const config = MENU_PERMISSION_CONFIG.find((c) => c.menu === p.menu);
          if (!config) return p;
          const newPerm = { ...p };
          config.subPermissions.forEach((sub) => {
            newPerm[sub.level] = checked;
          });
          return newPerm;
        });
        return { ...prev, [selectedAccountId]: updated };
      });
    },
    [selectedAccountId, selectedAccount],
  );

  // 권한 초기화
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = useCallback(async () => {
    if (!user || !selectedAccountId) return;

    try {
      await resetPermission.mutateAsync({
        accountId: selectedAccountId,
        updatedBy: user.name,
      });
      // editingMap에서 해당 계정 제거
      setEditingMap((prev) => {
        const next = { ...prev };
        delete next[selectedAccountId];
        return next;
      });
      toast.success('권한이 기본값으로 초기화되었습니다.');
    } catch (err) {
      const msg = extractErrorMessage(err, '알 수 없는 오류');
      toast.error(`권한 초기화 실패: ${msg}`);
    }
  }, [selectedAccountId, user, resetPermission, toast]);

  // 저장 확인 다이얼로그
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // 저장 (부분 실패 대응)
  const handleSave = useCallback(async () => {
    if (!user) return;

    const changedAccountIds = Object.keys(editingMap);
    if (changedAccountIds.length === 0) return;

    const savedIds: string[] = [];
    const failedIds: string[] = [];

    for (const accountId of changedAccountIds) {
      const permissions = editingMap[accountId];
      if (!permissions) continue;

      try {
        await updatePermission.mutateAsync({
          request: { accountId, permissions },
          updatedBy: user.name,
        });

        auditService.log({
          action: 'PERMISSION_CHANGED',
          resource: 'permissions',
          userId: user.id,
          details: { targetAccountId: accountId },
        });

        savedIds.push(accountId);
      } catch (err) {
        failedIds.push(accountId);
        const msg = extractErrorMessage(err, '알 수 없는 오류');
        toast.error(`${accounts?.find((a) => a.accountId === accountId)?.accountName ?? accountId} 저장 실패: ${msg}`);
      }
    }

    // 성공한 계정은 editingMap에서 제거
    if (savedIds.length > 0) {
      setEditingMap((prev) => {
        const next = { ...prev };
        savedIds.forEach((id) => delete next[id]);
        return next;
      });
    }

    if (failedIds.length === 0) {
      toast.success('권한 설정이 저장되었습니다.');
    } else if (savedIds.length > 0) {
      toast.success(`${savedIds.length}건 저장 완료. ${failedIds.length}건 실패 — 재시도해주세요.`);
    }
  }, [editingMap, user, accounts, updatePermission, toast]);

  // 취소
  const handleCancel = useCallback(() => {
    setEditingMap({});
  }, []);

  // 페이지 이탈 시 미저장 경고
  useEffect(() => {
    if (!hasChanges) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);

  // 마스터 체크 상태 계산
  const masterCheckedCount = currentPermissions.reduce((count, p) => {
    const config = MENU_PERMISSION_CONFIG.find((c) => c.menu === p.menu);
    if (!config) return count;
    return count + config.subPermissions.filter((sub) => p[sub.level]).length;
  }, 0);
  const totalSubPermissions = MENU_PERMISSION_CONFIG.reduce(
    (sum, config) => sum + config.subPermissions.length,
    0,
  );
  const masterAllChecked = selectedAccountId !== null && masterCheckedCount === totalSubPermissions;
  const masterSomeChecked = masterCheckedCount > 0 && !masterAllChecked;

  // admin 제외 + 검색/필터 적용 (Hooks Rules: early return 이전에 호출)
  const filteredAccounts = useMemo(() => {
    if (!accounts) return [];
    const base = accounts.filter((a) => a.role !== 'admin');
    return base.filter((a) => {
      if (roleFilter !== 'all' && a.role !== roleFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase();
        return (
          a.accountName.toLowerCase().includes(q) ||
          a.accountEmail.toLowerCase().includes(q) ||
          a.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [accounts, roleFilter, statusFilter, debouncedSearch]);

  if (isLoading) {
    return <Spinner text="권한 정보를 불러오는 중..." layout="fullHeight" />;
  }

  if (!accounts) {
    return (
      <div className="flex items-center justify-center h-64 text-txt-muted">
        권한 데이터를 불러올 수 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">권한 관리</h1>
          <p className="text-sm text-txt-muted mt-1">
            계정별 메뉴 접근 권한을 설정합니다. 좌측에서 계정을 선택한 후 접근 권한을 체크/해제하세요.
          </p>
        </div>

        {isCurrentUserAdmin && hasChanges && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              취소
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowSaveConfirm(true)}
              disabled={updatePermission.isPending}
            >
              <SaveOutlined style={{ fontSize: 14, marginRight: 4 }} />
              {updatePermission.isPending ? '저장 중...' : '변경사항 저장'}
            </Button>
          </div>
        )}
      </div>

      {/* admin이 아닌 경우 안내 */}
      {!isCurrentUserAdmin && (
        <Card>
          <CardContent>
            <div className="flex items-center gap-3 text-warning">
              <SafetyOutlined style={{ fontSize: 20 }} />
              <p className="text-sm font-medium">
                권한 설정은 관리자만 수정할 수 있습니다. 현재 조회 전용 모드입니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2패널 레이아웃 */}
      <div className="flex gap-6 items-start">
        {/* 좌측: 계정 목록 */}
        <div className="w-[380px] shrink-0">
          {/* 검색 */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="이름, 이메일, 부서 검색..."
            className="mb-3"
          />

          {/* 역할/상태 필터 */}
          <div className="flex items-center gap-2 mb-3">
            <FilterOutlined style={{ fontSize: 14 }} className="text-txt-muted shrink-0" />
            <div className="flex gap-1">
              {ROLE_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRoleFilter(opt.value)}
                  className={clsx(
                    'px-2.5 py-1 text-xs rounded-full border transition-colors',
                    roleFilter === opt.value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border text-txt-muted hover:border-gray-400',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className="text-border">|</span>
            <div className="flex gap-1">
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={clsx(
                    'px-2.5 py-1 text-xs rounded-full border transition-colors',
                    statusFilter === opt.value
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border text-txt-muted hover:border-gray-400',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 계정 카드 목록 */}
          <div className="space-y-3 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {filteredAccounts.length === 0 ? (
              <div className="text-center py-8 text-sm text-txt-muted">
                검색 결과가 없습니다.
              </div>
            ) : (
              filteredAccounts.map((account) => (
                <AccountCard
                  key={account.accountId}
                  account={account}
                  isSelected={selectedAccountId === account.accountId}
                  hasEdits={!!editingMap[account.accountId]}
                  onSelect={() => setSelectedAccountId(account.accountId)}
                />
              ))
            )}
          </div>
        </div>

        {/* 우측: 권한 설정 */}
        <div className="flex-1 min-w-0">
          <Card>
            <CardContent>
              {!selectedAccount ? (
                <div className="flex flex-col items-center justify-center py-20 text-txt-muted">
                  <SafetyOutlined style={{ fontSize: 48 }} className="mb-4 opacity-30" />
                  <p className="text-sm">좌측에서 계정을 선택하여 권한을 설정하세요.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 선택된 계정 정보 */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      {(isSelectedAdmin || isSelectedInactive) && (
                        <LockOutlined style={{ fontSize: 16 }} className="text-txt-muted" />
                      )}
                      <span className="font-semibold text-txt-main">
                        {selectedAccount.accountName}
                      </span>
                      <span className="text-xs text-txt-muted">
                        ({selectedAccount.accountEmail})
                      </span>
                      <Badge variant={ROLE_BADGE_VARIANT[selectedAccount.role]}>
                        {ROLE_DISPLAY_NAMES[selectedAccount.role]}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {isSelectedAdmin && (
                        <span className="text-xs text-txt-muted italic">
                          관리자 권한은 변경할 수 없습니다
                        </span>
                      )}
                      {isSelectedInactive && !isSelectedAdmin && (
                        <span className="text-xs text-warning italic">
                          비활성 계정은 권한을 변경할 수 없습니다
                        </span>
                      )}
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowResetConfirm(true)}
                          disabled={resetPermission.isPending}
                        >
                          <UndoOutlined style={{ fontSize: 12, marginRight: 4 }} />
                          초기화
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* 마스터 토글 */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary/50 rounded-lg">
                    <PermCheckbox
                      checked={masterAllChecked}
                      indeterminate={masterSomeChecked}
                      disabled={!canEdit}
                      onChange={handleMasterToggle}
                      label="전체 권한 설정"
                    />
                    <span className="text-sm font-semibold text-txt-main">권한 설정</span>
                  </div>

                  {/* 메뉴별 권한 목록 */}
                  <div className="space-y-2">
                    {MENU_PERMISSION_CONFIG.map((config) => {
                      const permission = currentPermissions.find(
                        (p) => p.menu === config.menu,
                      );
                      return (
                        <MenuPermissionItem
                          key={config.menu}
                          config={config}
                          permission={permission}
                          disabled={!canEdit}
                          expanded={expandedMenus.has(config.menu)}
                          onToggleExpand={() => handleToggleExpand(config.menu)}
                          onPermissionChange={(level, value) =>
                            handlePermissionChange(config.menu, level, value)
                          }
                          onToggleAll={(checked) => handleToggleAll(config.menu, checked)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 저장 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={() => {
          setShowSaveConfirm(false);
          handleSave();
        }}
        title="권한 변경사항 저장"
        message={`${Object.keys(editingMap).length}개 계정의 권한 변경사항을 저장하시겠습니까?`}
        type="confirm"
        confirmText="저장"
        cancelText="취소"
      />

      {/* 초기화 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={() => {
          setShowResetConfirm(false);
          handleReset();
        }}
        title="권한 초기화"
        message={`${selectedAccount?.accountName ?? ''} 계정의 권한을 역할 기본값으로 초기화하시겠습니까?\n현재 편집 중인 변경사항도 함께 취소됩니다.`}
        type="warning"
        confirmText="초기화"
        cancelText="취소"
      />
    </div>
  );
}
