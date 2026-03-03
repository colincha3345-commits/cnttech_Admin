/**
 * 직원 초대/수정 모달
 * 신규 등록 시: 초대 메일 발송 (비밀번호는 사용자가 직접 설정)
 * 수정 시: 기본 정보만 수정 가능
 */
import React, { useState, useEffect } from 'react';
import { CloseOutlined, CheckCircleOutlined, CloseCircleOutlined, MailOutlined } from '@ant-design/icons';

import { Button, Input, Label } from '@/components/ui';
import {
  useTeams,
  useStores,
  useInviteHeadquartersStaff,
  useUpdateHeadquartersStaff,
  useInviteFranchiseStaff,
  useUpdateFranchiseStaff,
  useCheckLoginIdDuplicate,
  useToast,
} from '@/hooks';
import type { StaffAccount, StaffType, StaffInviteFormData } from '@/types/staff';

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff?: StaffAccount | null;
  staffType: StaffType;
}

export const StaffFormModal: React.FC<StaffFormModalProps> = ({
  isOpen,
  onClose,
  staff,
  staffType,
}) => {
  const toast = useToast();
  const { data: teams } = useTeams();
  const { stores } = useStores();

  const inviteHqStaff = useInviteHeadquartersStaff();
  const updateHqStaff = useUpdateHeadquartersStaff();
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
    storeId: '',
  });
  const [loginIdChecked, setLoginIdChecked] = useState(false);
  const [loginIdAvailable, setLoginIdAvailable] = useState<boolean | null>(null);

  const isEditMode = !!staff;
  const isLoading =
    inviteHqStaff.isPending ||
    updateHqStaff.isPending ||
    inviteFrStaff.isPending ||
    updateFrStaff.isPending;
  const isHeadquarters = staffType === 'headquarters';

  useEffect(() => {
    if (staff) {
      setFormData({
        staffType: staff.staffType,
        name: staff.name,
        phone: staff.phone,
        email: staff.email,
        loginId: staff.loginId,
        teamId: staff.teamId || '',
        storeId: staff.storeId || '',
      });
      setLoginIdChecked(true);
      setLoginIdAvailable(true);
    } else {
      setFormData({
        staffType,
        name: '',
        phone: '',
        email: '',
        loginId: '',
        teamId: teams?.[0]?.id || '',
        storeId: stores?.[0]?.id || '',
      });
      setLoginIdChecked(false);
      setLoginIdAvailable(null);
    }
  }, [staff, staffType, isOpen, teams, stores]);

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
    if (!isHeadquarters && !formData.storeId) {
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
      }

      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-card rounded-xl shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-bg-card">
          <h3 className="text-lg font-semibold text-txt-main">
            {isHeadquarters ? '본사' : '가맹점'} 직원 {isEditMode ? '수정' : '초대'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-bg-hover rounded transition-colors"
            disabled={isLoading}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit}>
          <div className="p-4 space-y-4">
            {/* 초대 안내 메시지 (신규 등록 시) */}
            {!isEditMode && (
              <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <MailOutlined className="text-primary mt-0.5" />
                <div className="text-sm text-txt-secondary">
                  <p className="font-medium text-txt-main mb-1">초대 방식 안내</p>
                  <p>직원의 이메일로 초대 링크가 발송됩니다.</p>
                  <p>직원이 직접 비밀번호를 설정하면 관리자 승인 후 로그인 가능합니다.</p>
                </div>
              </div>
            )}

            {/* 소속 */}
            <div className="space-y-2">
              <Label required>{isHeadquarters ? '소속팀' : '소속 가맹점'}</Label>
              {isHeadquarters ? (
                <select
                  value={formData.teamId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, teamId: e.target.value }))
                  }
                  className="w-full h-10 px-4 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  disabled={isLoading}
                >
                  <option value="">팀 선택</option>
                  {teams?.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                  disabled={isLoading}
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
                    disabled={isLoading || isEditMode}
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
                    disabled={isLoading || checkLoginId.isPending || !formData.loginId.trim()}
                  >
                    {checkLoginId.isPending ? '확인 중...' : '중복확인'}
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
                disabled={isLoading}
              />
              {!isEditMode && (
                <p className="text-xs text-txt-muted">
                  이 이메일로 비밀번호 설정 링크가 발송됩니다.
                </p>
              )}
            </div>
          </div>

          {/* 푸터 */}
          <div className="flex justify-end gap-3 p-4 border-t border-border sticky bottom-0 bg-bg-card">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '처리 중...' : isEditMode ? '수정' : (
                <>
                  <MailOutlined className="mr-1" />
                  초대
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
