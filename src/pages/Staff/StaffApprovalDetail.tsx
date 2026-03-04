import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

import { Card, Button, Label, Input, Spinner, ConfirmDialog, Modal, Badge } from '@/components/ui';
import { useStaff, useApproveStaff, useRejectStaff, useToast, useTeams, useStores } from '@/hooks';
import { STAFF_TYPE_LABELS } from '@/types/staff';

export const StaffApprovalDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const { data: staff, isLoading } = useStaff(id);
    const { data: teams } = useTeams();
    const { stores } = useStores();

    const approveMutation = useApproveStaff();
    const rejectMutation = useRejectStaff();

    const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    const handleApprove = async () => {
        if (!staff) return;

        try {
            await approveMutation.mutateAsync({
                staffId: staff.id,
                approverId: 'admin',
            });
            toast.success(`${staff.name}님의 계정이 승인되었습니다.`);
            setIsApproveConfirmOpen(false);
            navigate('/staff/approvals');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '승인에 실패했습니다.');
        }
    };

    const handleReject = async () => {
        if (!staff) return;

        try {
            await rejectMutation.mutateAsync({
                staffId: staff.id,
                rejectorId: 'admin',
                reason: rejectReason || undefined,
            });
            toast.success(`${staff.name}님의 계정이 거절되었습니다.`);
            setIsRejectModalOpen(false);
            setRejectReason('');
            navigate('/staff/approvals');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '거절에 실패했습니다.');
        }
    };

    const getTeamName = (teamId?: string) => {
        if (!teamId || !teams) return '-';
        const team = teams.find((t) => t.id === teamId);
        return team?.name || '-';
    };

    const getStoreName = (storeId?: string) => {
        if (!storeId || !stores) return '-';
        const store = stores.find((s) => s.id === storeId);
        return store?.name || '-';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="text-center py-12">
                <p className="text-txt-muted">직원 정보를 찾을 수 없습니다.</p>
                <Button variant="outline" onClick={() => navigate('/staff/approvals')} className="mt-4">
                    목록으로 돌아가기
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/staff/approvals')}
                    className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                >
                    <ArrowLeftOutlined />
                </button>
                <h1 className="text-2xl font-bold text-txt-main">
                    직원 계정 승인 상세
                </h1>
            </div>

            <Card className="p-6">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>유형</Label>
                            <div>
                                <Badge variant={staff.staffType === 'headquarters' ? 'info' : 'secondary'}>
                                    {STAFF_TYPE_LABELS[staff.staffType]}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>소속</Label>
                            <div className="font-medium text-txt-main">
                                {staff.staffType === 'headquarters' ? getTeamName(staff.teamId) : getStoreName(staff.storeId)}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>이름</Label>
                            <div className="font-medium text-txt-main">
                                {staff.name}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>연락처</Label>
                            <div className="font-medium text-txt-main">
                                {staff.phone}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>아이디</Label>
                            <div className="font-medium text-txt-main">
                                {staff.loginId}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>이메일</Label>
                            <div className="font-medium text-txt-main">
                                {staff.email}
                            </div>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <Label>비밀번호 설정일</Label>
                            <div className="font-medium text-txt-main">
                                {staff.passwordSetAt
                                    ? new Date(staff.passwordSetAt).toLocaleString('ko-KR', {
                                        year: 'numeric',
                                        month: '2-digit',
                                        day: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })
                                    : '-'}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectModalOpen(true)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                            <CloseOutlined className="mr-1" />
                            거절
                        </Button>
                        <Button
                            onClick={() => setIsApproveConfirmOpen(true)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                        >
                            <CheckOutlined className="mr-1" />
                            승인
                        </Button>
                    </div>
                </div>
            </Card>

            <ConfirmDialog
                isOpen={isApproveConfirmOpen}
                onClose={() => setIsApproveConfirmOpen(false)}
                onConfirm={handleApprove}
                title="계정 승인"
                message={`'${staff.name}' 직원의 계정을 승인하시겠습니까? 승인 후 해당 직원은 로그인이 가능합니다.`}
                confirmText={approveMutation.isPending ? '승인 중...' : '승인'}
                type="info"
            />

            <Modal
                isOpen={isRejectModalOpen}
                onClose={() => setIsRejectModalOpen(false)}
                title="계정 승인 거절"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-sm text-txt-secondary">
                        '<span className="font-medium text-txt-main">{staff.name}</span>' 직원의 계정 승인을 거절합니다.
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-txt-main mb-2">
                            거절 사유 (선택)
                        </label>
                        <Input
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="거절 사유를 입력하세요"
                        />
                        <p className="text-xs text-txt-muted mt-1">
                            거절 사유는 해당 직원에게 이메일로 전달됩니다.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectModalOpen(false)}
                        >
                            취소
                        </Button>
                        <Button
                            variant="danger"
                            onClick={handleReject}
                            disabled={rejectMutation.isPending}
                        >
                            {rejectMutation.isPending ? '처리 중...' : '거절'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
