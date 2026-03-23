/**
 * 본사/지사/가맹점 직원 초대/수정 페이지
 * [2026-03-23] 지사(branch) 유형 추가
 */
import React, { useState, useEffect } from 'react';
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

export const StaffEditPage: React.FC = () => {
    const { type, id } = useParams<{ type: string; id: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { user } = useAuth();

    const staffType = (type === 'franchise' ? 'franchise' : type === 'branch' ? 'branch' : 'headquarters') as StaffType;
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
                    onClick={() => navigate(isHeadquarters ? '/staff/headquarters' : '/staff/franchise')}
                    className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                >
                    <ArrowLeftOutlined />
                </button>
                <h1 className="text-2xl font-bold text-txt-main">
                    {isHeadquarters ? '본사' : '가맹점'} 직원 {isEditMode ? '수정' : '초대'}
                </h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
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
                            <select
                                value={formData.teamId}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, teamId: e.target.value }))
                                }
                                className="w-full h-10 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                disabled={isMutating}
                            >
                                <option value="">팀 선택</option>
                                {teams?.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                            </select>
                        ) : isBranch ? (
                            <select
                                value={formData.branchId}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, branchId: e.target.value }))
                                }
                                className="w-full h-10 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                disabled={isMutating}
                            >
                                <option value="">지사 선택</option>
                                {branches?.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name} ({branch.region})
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <select
                                value={formData.storeId}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, storeId: e.target.value }))
                                }
                                className="w-full h-10 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                disabled={isMutating}
                            >
                                <option value="">가맹점 선택</option>
                                {stores?.map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.name} ({store.region})
                                    </option>
                                ))}
                            </select>
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
