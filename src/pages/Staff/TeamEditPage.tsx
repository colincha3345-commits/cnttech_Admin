import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { Card, Button, Input, Label, Spinner } from '@/components/ui';
import { useCreateTeam, useUpdateTeam, useTeam, useToast } from '@/hooks';
import type { TeamFormData } from '@/types/staff';

export const TeamEditPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const isEditMode = id !== 'new';

    const { data: team, isLoading: isTeamLoading } = useTeam(isEditMode ? id : undefined);

    const createTeam = useCreateTeam();
    const updateTeam = useUpdateTeam();

    const [formData, setFormData] = useState<TeamFormData>({
        name: '',
        description: '',
    });

    const isMutating = createTeam.isPending || updateTeam.isPending;

    useEffect(() => {
        if (isEditMode && team) {
            setFormData({
                name: team.name,
                description: team.description || '',
            });
        }
    }, [team, isEditMode]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('팀 이름을 입력해주세요.');
            return;
        }

        try {
            if (isEditMode && team) {
                await updateTeam.mutateAsync({
                    id: team.id,
                    data: formData,
                });
                toast.success('팀 정보가 수정되었습니다.');
            } else {
                await createTeam.mutateAsync(formData);
                toast.success('새 팀이 생성되었습니다.');
            }
            navigate('/staff/teams');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
        }
    };

    if (isEditMode && isTeamLoading) {
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
                    onClick={() => navigate('/staff/teams')}
                    className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                >
                    <ArrowLeftOutlined />
                </button>
                <h1 className="text-2xl font-bold text-txt-main">
                    팀 {isEditMode ? '수정' : '추가'}
                </h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* 팀 이름 */}
                        <div className="space-y-2">
                            <Label required>팀 이름</Label>
                            <Input
                                placeholder="팀 이름을 입력하세요"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                                }
                                disabled={isMutating}
                            />
                        </div>

                        {/* 설명 */}
                        <div className="space-y-2">
                            <Label>설명</Label>
                            <textarea
                                placeholder="팀 설명을 입력하세요 (선택)"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                                }
                                disabled={isMutating}
                                className="w-full min-h-[120px] px-4 py-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            />
                        </div>
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
                        <Button type="button" variant="outline" onClick={() => navigate('/staff/teams')} disabled={isMutating}>
                            취소
                        </Button>
                        <Button type="submit" disabled={isMutating || !formData.name.trim()}>
                            {isMutating ? '처리 중...' : isEditMode ? '수정' : '생성'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};
