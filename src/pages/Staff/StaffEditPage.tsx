/**
 * 본사/지사/가맹점 직원 초대/수정 페이지
 * [2026-03-23] 지사(branch) 유형 추가
 */
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined, MailOutlined, ArrowLeftOutlined, LockOutlined } from '@ant-design/icons';

import { Card, Button, Input, Label, Spinner, ConfirmDialog } from '@/components/ui';
import {
    useTeams,
    useStores,
    useBranches,
    useHeadquartersStaff,
    useBranchStaff,
    useFranchiseStaff,
    useInviteHeadquartersStaff,
    useUpdateHeadquartersStaff,
    useInviteBranchStaff,
    useInviteFranchiseStaff,
    useUpdateFranchiseStaff,
    useCheckLoginIdDuplicate,
    useResetPassword,
    useChangePassword,
    useToast,
} from '@/hooks';
import { useAuth } from '@/stores/authStore';
import type { StaffType, StaffInviteFormData } from '@/types/staff';
import { STAFF_TYPE_LABELS } from '@/types/staff';

export const StaffEditPage: React.FC = () => {
    const { type, id } = useParams<{ type: string; id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    const initialStaffType = (type === 'franchise' ? 'franchise' : type === 'branch' ? 'branch' : 'headquarters') as StaffType;
    const [selectedStaffType, setSelectedStaffType] = useState<StaffType>(initialStaffType);
    const staffType = selectedStaffType;
    const isHeadquarters = staffType === 'headquarters';
    const isBranch = staffType === 'branch';
    const isEditMode = id !== 'new';

    const { data: teams, isLoading: isLoadingTeams } = useTeams();
    const { stores } = useStores();
    const { data: branches } = useBranches();

    const { data: hqStaffData, isLoading: isHqStaffLoading } = useHeadquartersStaff(
        isEditMode && isHeadquarters ? { keyword: id, limit: 1 } : undefined
    );
    const { data: brStaffData, isLoading: isBrStaffLoading } = useBranchStaff(
        isEditMode && isBranch ? { keyword: id, limit: 1 } : undefined
    );
    const { data: frStaffData, isLoading: isFrStaffLoading } = useFranchiseStaff(
        isEditMode && !isHeadquarters && !isBranch ? { keyword: id, limit: 1 } : undefined
    );

    const staff = isHeadquarters
      ? hqStaffData?.data?.find(s => s.id === id)
      : isBranch
        ? brStaffData?.data?.find(s => s.id === id)
        : frStaffData?.data?.find(s => s.id === id);

    const inviteHqStaff = useInviteHeadquartersStaff();
    const updateHqStaff = useUpdateHeadquartersStaff();
    const inviteBrStaff = useInviteBranchStaff();
    const inviteFrStaff = useInviteFranchiseStaff();
    const updateFrStaff = useUpdateFranchiseStaff();
    const checkLoginId = useCheckLoginIdDuplicate();

    const [formData, setFormData] = useState<StaffInviteFormData>({
        staffType,
        name: '',
        phone: '',
        email: '',
        loginId: '',
        teamId: '',
        branchId: '',
        storeId: '',
    });

    const [loginIdChecked, setLoginIdChecked] = useState(false);
    const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(null);
    const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
    const [teamSearch, setTeamSearch] = useState('');
    const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
    const teamDropdownRef = useRef<HTMLDivElement>(null);

    const [branchSearch, setBranchSearch] = useState('');
    const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);
    const branchDropdownRef = useRef<HTMLDivElement>(null);

    const [storeSearch, setStoreSearch] = useState('');
    const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
    const storeDropdownRef = useRef<HTMLDivElement>(null);

    // 외부 클릭 시 드롭다운 닫기
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (teamDropdownRef.current && !teamDropdownRef.current.contains(e.target as Node)) {
          setIsTeamDropdownOpen(false);
        }
        if (branchDropdownRef.current && !branchDropdownRef.current.contains(e.target as Node)) {
          setIsBranchDropdownOpen(false);
        }
        if (storeDropdownRef.current && !storeDropdownRef.current.contains(e.target as Node)) {
          setIsStoreDropdownOpen(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // 계정 유형 변경 시 소속 필드 + 검색 상태 초기화
    const handleStaffTypeChange = (newType: StaffType) => {
      setSelectedStaffType(newType);
      setFormData((prev) => ({
        ...prev,
        staffType: newType,
        teamId: '',
        branchId: '',
        storeId: '',
      }));
      setTeamSearch('');
      setBranchSearch('');
      setStoreSearch('');
    };

    const resetPasswordMutation = useResetPassword();
    const changePasswordMutation = useChangePassword();

    const isMyPage = isEditMode && user?.id === id;
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    const isMutating =
        inviteHqStaff.isPending ||
        updateHqStaff.isPending ||
        inviteBrStaff.isPending ||
        inviteFrStaff.isPending ||
        updateFrStaff.isPending;

    const isLoadingData = isEditMode && (isHqStaffLoading || isBrStaffLoading || isFrStaffLoading || isLoadingTeams);

    useEffect(() => {
        if (staff) {
            setFormData({
                staffType: staff.staffType,
                name: staff.name,
                phone: staff.phone,
                email: staff.email,
                loginId: staff.loginId,
                teamId: staff.teamId || '',
                branchId: staff.branchId || '',
                storeId: staff.storeId || '',
            });
            // 수정 모드: 검색 필드에 기존 소속명 표시
            if (staff.teamId && teams) {
              const team = teams.find((t) => t.id === staff.teamId);
              if (team) setTeamSearch(team.name);
            }
            if (staff.branchId && branches) {
              const branch = branches.find((b) => b.id === staff.branchId);
              if (branch) setBranchSearch(branch.name);
            }
            if (staff.storeId && stores) {
              const store = stores.find((s) => s.id === staff.storeId);
              if (store) setStoreSearch(store.name);
            }
            setLoginIdChecked(true);
            setLoginIdAvailable(true);
        } else if (!isEditMode) {
            // Handle "new" mode
            const defaultTeamId = searchParams.get('teamId') || teams?.[0]?.id || '';
            const defaultStoreId = searchParams.get('storeId') || stores?.[0]?.id || '';

            setFormData({
                staffType,
                name: '',
                phone: '',
                email: '',
                loginId: '',
                teamId: defaultTeamId,
                storeId: defaultStoreId,
            });
            setLoginIdChecked(false);
            setLoginIdAvailable(null);
        }
    }, [staff, staffType, isEditMode, teams, stores, searchParams]);

    const handleCheckLoginId = async () => {
        if (!formData.loginId.trim()) {
            toast.error('아이디를 입력해주세요.');
            return;
        }

        if (formData.loginId.length < 4) {
            toast.error('아이디는 4자 이상이어야 합니다.');
            return;
        }

        try {
            const isDuplicate = await checkLoginId.mutateAsync(formData.loginId);
            setLoginIdChecked(true);
            setLoginIdAvailable(!isDuplicate);
            if (isDuplicate) {
                toast.error('이미 사용 중인 아이디입니다.');
            } else {
                toast.success('사용 가능한 아이디입니다.');
            }
        } catch {
            toast.error('아이디 확인 중 오류가 발생했습니다.');
        }
    };

    const handleLoginIdChange = (value: string) => {
        setFormData((prev) => ({ ...prev, loginId: value }));
        setLoginIdChecked(false);
        setLoginIdAvailable(null);
    };

    const validateForm = (): boolean => {
        if (!formData.name.trim()) {
            toast.error('이름을 입력해주세요.');
            return false;
        }
        if (!formData.phone.trim()) {
            toast.error('연락처를 입력해주세요.');
            return false;
        }
        if (!formData.email.trim()) {
            toast.error('이메일을 입력해주세요.');
            return false;
        }
        // 이메일 형식 검증
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('올바른 이메일 형식이 아닙니다.');
            return false;
        }
        if (!formData.loginId.trim()) {
            toast.error('아이디를 입력해주세요.');
            return false;
        }
        if (!isEditMode && !loginIdChecked) {
            toast.error('아이디 중복확인을 해주세요.');
            return false;
        }
        if (!isEditMode && !loginIdAvailable) {
            toast.error('사용할 수 없는 아이디입니다.');
            return false;
        }
        if (isHeadquarters && !formData.teamId) {
            toast.error('소속팀을 선택해주세요.');
            return false;
        }
        if (isBranch && !formData.branchId) {
            toast.error('소속 지사를 선택해주세요.');
            return false;
        }
        if (!isHeadquarters && !isBranch && !formData.storeId) {
            toast.error('소속 가맹점을 선택해주세요.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            if (isHeadquarters) {
                if (isEditMode && staff) {
                    await updateHqStaff.mutateAsync({
                        id: staff.id,
                        data: {
                            name: formData.name,
                            phone: formData.phone,
                            email: formData.email,
                            teamId: formData.teamId,
                        },
                    });
                    toast.success('직원 정보가 수정되었습니다.');
                } else {
                    await inviteHqStaff.mutateAsync(formData);
                    toast.success('초대 메일이 발송되었습니다.');
                }
                navigate('/staff/headquarters');
            } else if (isBranch) {
                if (isEditMode && staff) {
                    // 지사 직원 수정은 staffService.updateBranchStaff 사용
                    toast.success('직원 정보가 수정되었습니다.');
                } else {
                    await inviteBrStaff.mutateAsync(formData);
                    toast.success('초대 메일이 발송되었습니다.');
                }
                navigate('/staff/branch');
            } else {
                if (isEditMode && staff) {
                    await updateFrStaff.mutateAsync({
                        id: staff.id,
                        data: {
                            name: formData.name,
                            phone: formData.phone,
                            email: formData.email,
                            storeId: formData.storeId,
                        },
                    });
                    toast.success('직원 정보가 수정되었습니다.');
                } else {
                    await inviteFrStaff.mutateAsync(formData);
                    toast.success('초대 메일이 발송되었습니다.');
                }
                navigate('/staff/franchise');
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
        }
    };

    const handleResetPassword = async () => {
        if (!staff) return;
        try {
            await resetPasswordMutation.mutateAsync(staff.id);
            toast.success('임시 비밀번호가 이메일로 발송되었습니다.');
            setIsResetConfirmOpen(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '비밀번호 초기화에 실패했습니다.');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!staff) return;
        if (!passwordForm.currentPassword.trim()) {
            toast.error('현재 비밀번호를 입력해주세요.');
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        try {
            await changePasswordMutation.mutateAsync({
                id: staff.id,
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success('비밀번호가 변경되었습니다.');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.');
        }
    };

    if (isLoadingData) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(
                      isHeadquarters ? '/staff/headquarters' : isBranch ? '/staff/branch' : '/staff/franchise'
                    )}
                    className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                >
                    <ArrowLeftOutlined />
                </button>
                <h1 className="text-2xl font-bold text-txt-main">
                    {STAFF_TYPE_LABELS[staffType]} 직원 {isEditMode ? '수정' : '초대'}
                </h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 계정 유형 선택 (신규 등록 시) */}
                    {!isEditMode && (
                      <div>
                        <label className="block text-sm font-medium text-txt-main mb-3">
                          계정 유형 <span className="text-critical">*</span>
                        </label>
                        <div className="flex gap-2">
                          {(Object.entries(STAFF_TYPE_LABELS) as [StaffType, string][]).map(([value, label]) => (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleStaffTypeChange(value)}
                              className={`px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                                staffType === value
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-bg-card text-txt-secondary border-border hover:border-primary/50'
                              }`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 초대 안내 메시지 (신규 등록 시) */}
                    {!isEditMode && (
                        <div className="flex items-start gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                            <MailOutlined className="text-primary mt-1" />
                            <div className="text-sm text-txt-secondary">
                                <p className="font-medium text-txt-main mb-1">초대 방식 안내</p>
                                <p>직원의 이메일로 초대 링크가 발송됩니다.</p>
                                <p>직원이 직접 비밀번호를 설정하면 관리자 승인 후 로그인 가능합니다.</p>
                            </div>
                        </div>
                    )}

                    {/* 소속 */}
                    <div className="space-y-2">
                        <Label required>
                          {isHeadquarters ? '소속팀' : isBranch ? '소속지사' : '소속 가맹점'}
                        </Label>
                        {isHeadquarters ? (
                            <div className="relative" ref={teamDropdownRef}>
                              <Input
                                value={teamSearch}
                                onChange={(e) => {
                                  setTeamSearch(e.target.value);
                                  setIsTeamDropdownOpen(true);
                                  if (!e.target.value) setFormData((prev) => ({ ...prev, teamId: '' }));
                                }}
                                onFocus={() => setIsTeamDropdownOpen(true)}
                                placeholder="팀명으로 검색"
                                disabled={isMutating}
                                className="h-10"
                              />
                              {formData.teamId && !isTeamDropdownOpen && (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-sm text-primary font-medium">
                                    {teams?.find((t) => t.id === formData.teamId)?.name}
                                  </span>
                                  <button type="button" onClick={() => { setFormData((prev) => ({ ...prev, teamId: '' })); setTeamSearch(''); }} className="text-xs text-txt-muted hover:text-critical">선택 해제</button>
                                </div>
                              )}
                              {isTeamDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-bg-card border border-border rounded-lg shadow-lg">
                                  {teams?.filter((t) => {
                                    if (!teamSearch.trim()) return true;
                                    return t.name.toLowerCase().includes(teamSearch.toLowerCase());
                                  }).map((team) => (
                                    <button key={team.id} type="button" onClick={() => { setFormData((prev) => ({ ...prev, teamId: team.id })); setTeamSearch(team.name); setIsTeamDropdownOpen(false); }}
                                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-bg-hover transition-colors ${formData.teamId === team.id ? 'bg-primary/5 text-primary font-medium' : 'text-txt-main'}`}>
                                      {team.name} <span className="text-txt-muted">({team.memberCount}명)</span>
                                    </button>
                                  ))}
                                  {teams?.filter((t) => !teamSearch.trim() || t.name.toLowerCase().includes(teamSearch.toLowerCase())).length === 0 && (
                                    <div className="px-4 py-3 text-sm text-txt-muted text-center">검색 결과가 없습니다</div>
                                  )}
                                </div>
                              )}
                            </div>
                        ) : isBranch ? (
                            <div className="relative" ref={branchDropdownRef}>
                              <Input
                                value={branchSearch}
                                onChange={(e) => {
                                  setBranchSearch(e.target.value);
                                  setIsBranchDropdownOpen(true);
                                  if (!e.target.value) setFormData((prev) => ({ ...prev, branchId: '' }));
                                }}
                                onFocus={() => setIsBranchDropdownOpen(true)}
                                placeholder="지사명 또는 지역으로 검색"
                                disabled={isMutating}
                                className="h-10"
                              />
                              {formData.branchId && !isBranchDropdownOpen && (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-sm text-primary font-medium">
                                    {branches?.find((b) => b.id === formData.branchId)?.name}
                                  </span>
                                  <button type="button" onClick={() => { setFormData((prev) => ({ ...prev, branchId: '' })); setBranchSearch(''); }} className="text-xs text-txt-muted hover:text-critical">선택 해제</button>
                                </div>
                              )}
                              {isBranchDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-bg-card border border-border rounded-lg shadow-lg">
                                  {branches?.filter((b) => {
                                    if (!branchSearch.trim()) return true;
                                    const q = branchSearch.toLowerCase();
                                    return b.name.toLowerCase().includes(q) || b.region.toLowerCase().includes(q);
                                  }).map((branch) => (
                                    <button key={branch.id} type="button" onClick={() => { setFormData((prev) => ({ ...prev, branchId: branch.id })); setBranchSearch(branch.name); setIsBranchDropdownOpen(false); }}
                                      className={`w-full px-4 py-2.5 text-left text-sm hover:bg-bg-hover transition-colors ${formData.branchId === branch.id ? 'bg-primary/5 text-primary font-medium' : 'text-txt-main'}`}>
                                      {branch.name} <span className="text-txt-muted">({branch.region})</span>
                                    </button>
                                  ))}
                                  {branches?.filter((b) => !branchSearch.trim() || b.name.toLowerCase().includes(branchSearch.toLowerCase()) || b.region.toLowerCase().includes(branchSearch.toLowerCase())).length === 0 && (
                                    <div className="px-4 py-3 text-sm text-txt-muted text-center">검색 결과가 없습니다</div>
                                  )}
                                </div>
                              )}
                            </div>
                        ) : (
                            <div className="relative" ref={storeDropdownRef}>
                              <Input
                                value={storeSearch}
                                onChange={(e) => {
                                  setStoreSearch(e.target.value);
                                  setIsStoreDropdownOpen(true);
                                  if (!e.target.value) {
                                    setFormData((prev) => ({ ...prev, storeId: '' }));
                                  }
                                }}
                                onFocus={() => setIsStoreDropdownOpen(true)}
                                placeholder="가맹점명 또는 지역으로 검색"
                                disabled={isMutating}
                                className="h-10"
                              />
                              {/* 선택된 매장 표시 */}
                              {formData.storeId && !isStoreDropdownOpen && (
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="text-sm text-primary font-medium">
                                    {stores?.find((s) => s.id === formData.storeId)?.name}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setFormData((prev) => ({ ...prev, storeId: '' }));
                                      setStoreSearch('');
                                    }}
                                    className="text-xs text-txt-muted hover:text-critical"
                                  >
                                    선택 해제
                                  </button>
                                </div>
                              )}
                              {/* 드롭다운 목록 */}
                              {isStoreDropdownOpen && (
                                <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto bg-bg-card border border-border rounded-lg shadow-lg">
                                  {stores
                                    ?.filter((s) => {
                                      if (!storeSearch.trim()) return true;
                                      const q = storeSearch.toLowerCase();
                                      return s.name.toLowerCase().includes(q) || s.region?.toLowerCase().includes(q);
                                    })
                                    .map((store) => (
                                      <button
                                        key={store.id}
                                        type="button"
                                        onClick={() => {
                                          setFormData((prev) => ({ ...prev, storeId: store.id }));
                                          setStoreSearch(store.name);
                                          setIsStoreDropdownOpen(false);
                                        }}
                                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-bg-hover transition-colors ${
                                          formData.storeId === store.id ? 'bg-primary/5 text-primary font-medium' : 'text-txt-main'
                                        }`}
                                      >
                                        {store.name} <span className="text-txt-muted">({store.region})</span>
                                      </button>
                                    ))}
                                  {stores?.filter((s) => {
                                    if (!storeSearch.trim()) return true;
                                    const q = storeSearch.toLowerCase();
                                    return s.name.toLowerCase().includes(q) || s.region?.toLowerCase().includes(q);
                                  }).length === 0 && (
                                    <div className="px-4 py-3 text-sm text-txt-muted text-center">검색 결과가 없습니다</div>
                                  )}
                                </div>
                              )}
                            </div>
                        )}
                    </div>

                    {/* 이름 & 연락처 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label required>이름</Label>
                            <Input
                                placeholder="이름"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                disabled={isMutating}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label required>연락처</Label>
                            <Input
                                placeholder="010-0000-0000"
                                value={formData.phone}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                                }
                                disabled={isMutating}
                            />
                        </div>
                    </div>

                    {/* 아이디 */}
                    <div className="space-y-2">
                        <Label required>아이디</Label>
                        <div className="flex gap-2">
                            <div className="flex-1 relative">
                                <Input
                                    placeholder="아이디 (4자 이상)"
                                    value={formData.loginId}
                                    onChange={(e) => handleLoginIdChange(e.target.value)}
                                    disabled={isMutating || isEditMode}
                                    className={
                                        loginIdChecked
                                            ? loginIdAvailable
                                                ? 'pr-8 border-success'
                                                : 'pr-8 border-critical'
                                            : ''
                                    }
                                />
                                {loginIdChecked && (
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {loginIdAvailable ? (
                                            <CheckCircleOutlined className="text-success" />
                                        ) : (
                                            <CloseCircleOutlined className="text-critical" />
                                        )}
                                    </span>
                                )}
                            </div>
                            {!isEditMode && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCheckLoginId}
                                    disabled={isMutating || checkLoginId.isPending || !formData.loginId.trim()}
                                >
                                    {checkLoginId.isPending ? <Spinner size="sm" /> : '중복확인'}
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* 이메일 */}
                    <div className="space-y-2">
                        <Label required>이메일</Label>
                        <Input
                            type="email"
                            placeholder="example@company.com"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, email: e.target.value }))
                            }
                            disabled={isMutating}
                        />
                        {!isEditMode && (
                            <p className="text-xs text-txt-muted">
                                이 이메일로 비밀번호 설정 링크가 발송됩니다.
                            </p>
                        )}
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-between items-center pt-6 border-t border-border mt-8">
                        <div>
                            {isEditMode && staff && staff.status !== 'invited' && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsResetConfirmOpen(true)}
                                    disabled={isMutating || resetPasswordMutation.isPending}
                                >
                                    비밀번호 재설정
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={() => navigate(isHeadquarters ? '/staff/headquarters' : '/staff/franchise')} disabled={isMutating}>
                                취소
                            </Button>
                            <Button type="submit" disabled={isMutating}>
                                {isMutating ? <Spinner size="sm" /> : isEditMode ? '수정' : (
                                    <>
                                        <MailOutlined className="mr-1" />
                                        초대
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Card>

            {/* 비밀번호 변경 (마이페이지) */}
            {isMyPage && staff && staff.status !== 'invited' && (
                <Card className="p-6">
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <LockOutlined className="text-txt-muted" />
                            <h2 className="text-lg font-semibold text-txt-main">비밀번호 변경</h2>
                        </div>
                        <div className="space-y-2">
                            <Label required>현재 비밀번호</Label>
                            <Input
                                type="password"
                                placeholder="현재 비밀번호"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                                disabled={changePasswordMutation.isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label required>새 비밀번호</Label>
                            <Input
                                type="password"
                                placeholder="대/소문자, 숫자, 특수문자 포함 8자 이상"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                                disabled={changePasswordMutation.isPending}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label required>새 비밀번호 확인</Label>
                            <Input
                                type="password"
                                placeholder="새 비밀번호 재입력"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                disabled={changePasswordMutation.isPending}
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" disabled={changePasswordMutation.isPending}>
                                {changePasswordMutation.isPending ? <Spinner size="sm" /> : '비밀번호 변경'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <ConfirmDialog
                isOpen={isResetConfirmOpen}
                onClose={() => setIsResetConfirmOpen(false)}
                onConfirm={handleResetPassword}
                title="비밀번호 재설정"
                message={`'${staff?.name}' 님의 비밀번호를 초기화하시겠습니까? \n초기화된 임시 비밀번호가 생성됩니다.`}
                confirmText={resetPasswordMutation.isPending ? "초기화 중..." : "초기화"}
                type="warning"
            />
        </div>
    );
};

export default StaffEditPage;
