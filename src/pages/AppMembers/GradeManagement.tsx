import React, { useState, useEffect, useMemo } from 'react';
import {
  PlusOutlined,
  TrophyOutlined,
  TeamOutlined,
  CopyOutlined,
  DeleteOutlined,
  HolderOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Label,
  Badge,
  ToggleButtonGroup,
  ConfirmDialog,
} from '@/components/ui';
import {
  useMembershipGrades,
  useMembershipGradeStats,
  useCreateMembershipGrade,
  useUpdateMembershipGrade,
  useDeleteMembershipGrade,
  useDuplicateMembershipGrade,
  useReorderMembershipGrades,
  useBenefitCampaignList,
  useToast,
} from '@/hooks';
import type { MembershipGrade, MembershipGradeFormData } from '@/types/membership-grade';
import {
  DEFAULT_MEMBERSHIP_GRADE_FORM,
  BADGE_VARIANT_OPTIONS,
  CALCULATION_PERIOD_TYPE_LABELS,
  validateMembershipGradeForm,
} from '@/types/membership-grade';
import type { BadgeVariant } from '@/types';
import type { CalculationPeriodType } from '@/types/membership-grade';
import { initGradeCache } from '@/utils/memberGrade';

// ── 드래그 가능한 등급 아이템 ──

const SortableGradeItem: React.FC<{
  grade: MembershipGrade;
  isSelected: boolean;
  onSelect: (grade: MembershipGrade) => void;
  onDelete: (grade: MembershipGrade) => void;
}> = ({ grade, isSelected, onSelect, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: grade.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-hover'}
        ${isDragging ? 'shadow-lg z-50' : ''}
      `}
      onClick={() => onSelect(grade)}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing text-txt-muted hover:bg-hover rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <HolderOutlined />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Badge variant={grade.badgeVariant}>{grade.name}</Badge>
          {grade.isDefault && <span className="text-[10px] text-txt-muted bg-bg-subtle px-1.5 py-0.5 rounded">기본</span>}
          {!grade.isActive && <span className="text-[10px] text-txt-muted">비활성</span>}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-txt-muted">
          <span>{grade.memberCount.toLocaleString()}명</span>
        </div>
      </div>

      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onDelete(grade); }}
        className="flex-shrink-0 p-1 text-txt-muted hover:text-critical rounded hover:bg-critical/10 transition-colors"
        title="등급 삭제"
      >
        <DeleteOutlined className="text-xs" />
      </button>
    </div>
  );
};

// ── 메인 페이지 ──

export const GradeManagement: React.FC = () => {
  const toast = useToast();
  const [deleteTarget, setDeleteTarget] = useState<MembershipGrade | null>(null);
  const [dialog, setDialog] = useState<{ isOpen: boolean; title: string; message: string }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [selectedGrade, setSelectedGrade] = useState<MembershipGrade | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formData, setFormData] = useState<MembershipGradeFormData>({ ...DEFAULT_MEMBERSHIP_GRADE_FORM });

  // 데이터 조회
  const { data: gradeListData } = useMembershipGrades();
  const { data: statsData } = useMembershipGradeStats();
  const { data: campaignListData } = useBenefitCampaignList({ limit: 200 });
  const createGrade = useCreateMembershipGrade();
  const updateGradeMutation = useUpdateMembershipGrade();
  const deleteGradeMutation = useDeleteMembershipGrade();
  const duplicateGradeMutation = useDuplicateMembershipGrade();
  const reorderGradesMutation = useReorderMembershipGrades();

  const grades = gradeListData?.data ?? [];
  const allCampaigns = campaignListData?.data ?? [];
  const totalGrades = statsData?.data?.total ?? 0;
  const activeGrades = statsData?.data?.active ?? 0;
  const totalMembers = statsData?.data?.totalMembers ?? 0;

  // 등급 캐시 초기화
  useEffect(() => {
    if (grades.length > 0) {
      initGradeCache(grades);
    }
  }, [grades]);

  // 드래그 센서
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // ── 핸들러 ──

  const handleSelectGrade = (grade: MembershipGrade) => {
    setSelectedGrade(grade);
    setFormData({
      name: grade.name,
      description: grade.description,
      badgeVariant: grade.badgeVariant,
      minTotalOrderAmount: grade.achievementCondition.minTotalOrderAmount,
      minOrderCount: grade.achievementCondition.minOrderCount,
      calculationPeriodType: grade.achievementCondition.calculationPeriod.type,
      calculationPeriodMonths: grade.achievementCondition.calculationPeriod.months,
      retentionMonths: grade.achievementCondition.retentionMonths,
      isActive: grade.isActive,
    });
    setIsFormActive(true);
  };

  const handleNewGrade = () => {
    setSelectedGrade(null);
    setFormData({ ...DEFAULT_MEMBERSHIP_GRADE_FORM });
    setIsFormActive(true);
  };

  const handleCancel = () => {
    if (selectedGrade) {
      // 수정 모드 → 원본 데이터로 롤백
      handleSelectGrade(selectedGrade);
    } else {
      // 신규 등록 모드 → 폼 닫기
      setFormData({ ...DEFAULT_MEMBERSHIP_GRADE_FORM });
      setIsFormActive(false);
    }
  };

  const handleSave = () => {
    const errors = validateMembershipGradeForm(formData);
    if (errors.length > 0) {
      toast.error(errors[0]!);
      return;
    }

    const isNew = !selectedGrade;
    const onSuccess = () => {
      toast.success(isNew ? '등급이 등록되었습니다.' : '등급이 수정되었습니다.');
      handleCancel();
    };
    const onError = (error: Error) => toast.error(error.message || (isNew ? '등록에 실패했습니다.' : '수정에 실패했습니다.'));

    if (isNew) {
      createGrade.mutate(formData, { onSuccess, onError });
    } else {
      updateGradeMutation.mutate({ id: selectedGrade.id, data: formData }, { onSuccess, onError });
    }
  };

  const handleDelete = (grade: MembershipGrade) => {
    setDeleteTarget(grade);
    setDialog({
      isOpen: true,
      title: '등급 삭제',
      message: `"${grade.name}" 등급을 삭제하시겠습니까?`,
    });
  };

  const handleDialogConfirm = () => {
    if (!deleteTarget) return;
    deleteGradeMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        if (selectedGrade?.id === deleteTarget.id) handleCancel();
        toast.success('등급이 삭제되었습니다.');
      },
      onError: (error) => toast.error(error.message),
    });
    setDialog((prev) => ({ ...prev, isOpen: false }));
    setDeleteTarget(null);
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    setDeleteTarget(null);
  };

  const handleDuplicate = () => {
    if (!selectedGrade) return;
    duplicateGradeMutation.mutate(selectedGrade.id, {
      onSuccess: () => {
        handleCancel();
        toast.success('등급이 복제되었습니다.');
      },
      onError: () => toast.error('복제에 실패했습니다.'),
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const gradeIds = grades.map((g) => g.id);
    const oldIndex = gradeIds.indexOf(String(active.id));
    const newIndex = gradeIds.indexOf(String(over.id));
    const newOrder = arrayMove(gradeIds, oldIndex, newIndex);
    reorderGradesMutation.mutate(newOrder);
  };

  const handleFormChange = (updates: Partial<MembershipGradeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // 현재 등급에 연결된 혜택 캠페인 혜택 조회 (ID 기반 매칭)
  const gradeId = selectedGrade?.id ?? null;
  const linkedBenefits = useMemo(() => {
    if (!gradeId) return { couponNames: [] as string[], pointDescriptions: [] as string[] };
    const matched = allCampaigns.filter(
      (c) => c.trigger === 'membership_upgrade' && c.membershipCondition?.targetGrades.includes(gradeId),
    );
    return {
      couponNames: matched.flatMap((c) => c.benefitConfig.couponBenefits.map((b) => b.couponName)),
      pointDescriptions: matched.flatMap((c) => c.benefitConfig.pointBenefits.map((b) => b.pointDescription)),
    };
  }, [gradeId, allCampaigns]);

  // ── 렌더링 ──

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-txt-main">등급 관리</h1>
        <p className="text-sm text-txt-muted mt-1">멤버십 등급을 생성하고 달성 조건과 혜택을 설정합니다</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg"><TrophyOutlined className="text-lg text-primary" /></div>
            <div>
              <p className="text-xs text-txt-muted">전체 등급</p>
              <p className="text-xl font-bold text-txt-main">{totalGrades}개</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg"><TrophyOutlined className="text-lg text-success" /></div>
            <div>
              <p className="text-xs text-txt-muted">활성 등급</p>
              <p className="text-xl font-bold text-txt-main">{activeGrades}개</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info/10 rounded-lg"><TeamOutlined className="text-lg text-info" /></div>
            <div>
              <p className="text-xs text-txt-muted">전체 회원</p>
              <p className="text-xl font-bold text-txt-main">{totalMembers.toLocaleString()}명</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-[360px,1fr] gap-6">
        {/* 왼쪽: 등급 목록 */}
        <Card className="h-fit">
          <CardHeader className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-txt-main">등급 목록</h2>
            <Button size="sm" variant="primary" onClick={handleNewGrade}>
              <PlusOutlined className="mr-1" />등급 추가
            </Button>
          </CardHeader>
          <CardContent>
            {grades.length === 0 ? (
              <div className="text-center py-8">
                <TrophyOutlined className="text-3xl text-txt-muted mb-2" />
                <p className="text-sm text-txt-muted">등록된 등급이 없습니다</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={grades.map((g) => g.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {grades.map((grade) => (
                      <SortableGradeItem
                        key={grade.id}
                        grade={grade}
                        isSelected={selectedGrade?.id === grade.id}
                        onSelect={handleSelectGrade}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
            <p className="text-xs text-txt-muted mt-3">
              <InfoCircleOutlined className="mr-1" />드래그하여 등급 순서를 변경하세요 (위일수록 높은 등급)
            </p>
          </CardContent>
        </Card>

        {/* 오른쪽: 폼 */}
        <Card>
          <CardHeader>
            <h2 className="text-base font-semibold text-txt-main">
              {!isFormActive ? '등급 정보' : selectedGrade ? '등급 수정' : '새 등급 등록'}
            </h2>
          </CardHeader>
          <CardContent>
            {!isFormActive ? (
              <div className="flex flex-col items-center justify-center py-16 text-txt-muted">
                <TrophyOutlined className="text-4xl mb-3" />
                <p className="text-sm">등급을 선택하거나 새로 등록하세요</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* 기본 정보 */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-txt-main border-b border-border pb-2">기본 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label required>등급명</Label>
                      <Input
                        value={formData.name}
                        onChange={(e) => handleFormChange({ name: e.target.value })}
                        placeholder="예: VIP"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Badge 색상</Label>
                      <div className="flex gap-2 flex-wrap">
                        {BADGE_VARIANT_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleFormChange({ badgeVariant: opt.value as BadgeVariant })}
                            className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                              formData.badgeVariant === opt.value
                                ? 'border-primary bg-primary/5 text-primary font-medium'
                                : 'border-border text-txt-muted hover:border-primary/50'
                            }`}
                          >
                            <Badge variant={opt.value as BadgeVariant}>{opt.label}</Badge>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label>설명</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => handleFormChange({ description: e.target.value })}
                      placeholder="등급에 대한 간단한 설명"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleFormChange({ isActive: e.target.checked })}
                      className="rounded border-border"
                    />
                    <label htmlFor="isActive" className="text-sm text-txt-sub cursor-pointer">활성 상태</label>
                  </div>
                </section>

                {/* 달성 조건 */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-txt-main border-b border-border pb-2">달성 조건</h3>
                  <p className="text-xs text-txt-muted">설정된 조건을 모두(AND) 충족해야 등급이 부여됩니다. 조건을 설정하지 않으면 기본 등급(신규 가입 시 자동 부여)으로 간주됩니다.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>최소 주문 금액</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.minTotalOrderAmount ?? ''}
                          onChange={(e) => handleFormChange({ minTotalOrderAmount: e.target.value ? Number(e.target.value) : null })}
                          placeholder="미설정"
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-txt-muted">원</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>최소 주문 횟수</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.minOrderCount ?? ''}
                          onChange={(e) => handleFormChange({ minOrderCount: e.target.value ? Number(e.target.value) : null })}
                          placeholder="미설정"
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-txt-muted">회</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>산정 기간</Label>
                      <ToggleButtonGroup
                        options={Object.entries(CALCULATION_PERIOD_TYPE_LABELS).map(([value, label]) => ({ value, label }))}
                        value={formData.calculationPeriodType}
                        onChange={(v) => handleFormChange({ calculationPeriodType: v as CalculationPeriodType })}
                      />
                      {formData.calculationPeriodType === 'recent_months' && (
                        <div className="relative mt-2">
                          <Input
                            type="number"
                            value={formData.calculationPeriodMonths ?? ''}
                            onChange={(e) => handleFormChange({ calculationPeriodMonths: e.target.value ? Number(e.target.value) : null })}
                            placeholder="개월 수"
                            className="pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-txt-muted">개월</span>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>유지 기간</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          value={formData.retentionMonths ?? ''}
                          onChange={(e) => handleFormChange({ retentionMonths: e.target.value ? Number(e.target.value) : null })}
                          placeholder="영구 유지"
                          className="pr-12"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-txt-muted">개월</span>
                      </div>
                      <p className="text-xs text-txt-muted">미입력 시 영구 유지</p>
                    </div>
                  </div>
                </section>

                {/* 혜택 (혜택 캠페인 연동) */}
                <section className="space-y-4">
                  <h3 className="text-sm font-semibold text-txt-main border-b border-border pb-2">혜택 (혜택 캠페인 연동)</h3>

                  {linkedBenefits.couponNames.length > 0 || linkedBenefits.pointDescriptions.length > 0 ? (
                    <div className="space-y-2">
                      {linkedBenefits.couponNames.length > 0 && (
                        <div className="flex gap-2 flex-wrap items-center">
                          <span className="text-xs text-txt-muted w-12">쿠폰</span>
                          {linkedBenefits.couponNames.map((name, idx) => (
                            <Badge key={`c-${idx}`} variant="info">{name}</Badge>
                          ))}
                        </div>
                      )}
                      {linkedBenefits.pointDescriptions.length > 0 && (
                        <div className="flex gap-2 flex-wrap items-center">
                          <span className="text-xs text-txt-muted w-12">포인트</span>
                          {linkedBenefits.pointDescriptions.map((desc, idx) => (
                            <Badge key={`p-${idx}`} variant="success">{desc}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-txt-muted py-2">
                      {selectedGrade ? '연결된 혜택이 없습니다.' : '등급을 저장한 후 혜택 캠페인을 연결할 수 있습니다.'}
                    </p>
                  )}

                  <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg">
                    <InfoCircleOutlined className="text-info mt-0.5" />
                    <p className="text-xs text-txt-secondary">
                      포인트·쿠폰 혜택은 <strong>마케팅 &gt; 혜택 캠페인</strong>에서 &quot;멤버십 달성 시&quot; 트리거로 관리합니다.
                    </p>
                  </div>
                </section>

                {/* 액션 버튼 */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    {selectedGrade && (
                      <Button variant="outline" size="sm" onClick={handleDuplicate}>
                        <CopyOutlined className="mr-1" />복제
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCancel}>취소</Button>
                    <Button variant="primary" onClick={handleSave}>
                      {selectedGrade ? '수정' : '등록'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        onConfirm={handleDialogConfirm}
        title={dialog.title}
        message={dialog.message}
        type="warning"
        confirmText="삭제"
      />
    </div>
  );
};
