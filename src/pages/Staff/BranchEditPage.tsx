/**
 * 지사 등록/수정 페이지
 * [2026-03-23] 신규
 */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { Card, Button, Input, Label, Spinner } from '@/components/ui';
import { useCreateBranch, useUpdateBranch, useBranch, useToast } from '@/hooks';
import type { BranchFormData } from '@/types/branch';

export const BranchEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const isEditMode = !!id && id !== 'new';

  const { data: branch, isLoading } = useBranch(isEditMode ? id : '');
  const createBranch = useCreateBranch();
  const updateBranch = useUpdateBranch();

  const [formData, setFormData] = useState<BranchFormData>({
    name: '',
    region: '',
    description: '',
    managerName: '',
  });

  const isMutating = createBranch.isPending || updateBranch.isPending;

  useEffect(() => {
    if (isEditMode && branch) {
      setFormData({
        name: branch.name,
        region: branch.region,
        description: branch.description || '',
        managerName: branch.managerName || '',
      });
    }
  }, [branch, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('지사명을 입력해주세요.');
      return;
    }
    if (!formData.region.trim()) {
      toast.error('담당 지역을 입력해주세요.');
      return;
    }

    try {
      if (isEditMode && branch) {
        await updateBranch.mutateAsync({ id: branch.id, data: formData });
        toast.success('지사 정보가 수정되었습니다.');
      } else {
        await createBranch.mutateAsync(formData);
        toast.success('새 지사가 등록되었습니다.');
      }
      navigate('/staff/branches');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
    }
  };

  if (isEditMode && isLoading) {
    return <Spinner layout="center" />;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/staff/branches')}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <ArrowLeftOutlined />
        </button>
        <h1 className="text-2xl font-bold text-txt-main">
          지사 {isEditMode ? '수정' : '등록'}
        </h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label required>지사명</Label>
              <Input
                placeholder="예: 서울지사"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                disabled={isMutating}
              />
            </div>

            <div className="space-y-2">
              <Label required>담당 지역</Label>
              <Input
                placeholder="예: 서울, 경기/인천"
                value={formData.region}
                onChange={(e) => setFormData((prev) => ({ ...prev, region: e.target.value }))}
                disabled={isMutating}
              />
            </div>

            <div className="space-y-2">
              <Label>지사장명</Label>
              <Input
                placeholder="지사장 이름 (선택)"
                value={formData.managerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, managerName: e.target.value }))}
                disabled={isMutating}
              />
            </div>

            <div className="space-y-2">
              <Label>설명</Label>
              <textarea
                placeholder="지사 설명 (선택)"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                disabled={isMutating}
                className="w-full min-h-[120px] px-4 py-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border mt-8">
            <Button type="button" variant="outline" onClick={() => navigate('/staff/branches')} disabled={isMutating}>
              취소
            </Button>
            <Button type="submit" disabled={isMutating || !formData.name.trim() || !formData.region.trim()}>
              {isMutating ? '처리 중...' : isEditMode ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
