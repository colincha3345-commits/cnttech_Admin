/**
 * 아이콘뱃지 관리 페이지
 * 좌측: 뱃지 목록 / 우측: 뱃지 상세/등록 폼
 */
import { useState, useMemo } from 'react';
import { useIconBadges } from '@/hooks/useDesign';
import type { IconBadge, IconBadgeFormData, BadgeStatus } from '@/types/design';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CopyOutlined,
  StarOutlined,
  HolderOutlined,
  CheckOutlined,
  CloseOutlined,
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
  Badge,
  Input,
  SearchInput,
  ConfirmDialog,
  ToggleButtonGroup,
  ImageUpload,
} from '@/components/ui';
import { useToast } from '@/hooks';

const DEFAULT_FORM: IconBadgeFormData = {
  name: '',
  displayType: 'text',
  text: '',
  textColor: '#FFFFFF',
  bgColor: '#E11D48',
  imageUrl: '',
  sortOrder: 0,
};

const BADGE_STATUS_LABELS: Record<BadgeStatus, string> = {
  active: '사용중',
  inactive: '미사용',
};

const BADGE_STATUS_VARIANT: Record<BadgeStatus, 'success' | 'default'> = {
  active: 'success',
  inactive: 'default',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: '전체' },
  { value: 'active' as const, label: '사용중' },
  { value: 'inactive' as const, label: '미사용' },
];

const SortableBadgeItem: React.FC<{
  badge: IconBadge;
  isSelected: boolean;
  isDraggingMode: boolean;
  onSelect: (badge: IconBadge) => void;
}> = ({ badge, isSelected, isDraggingMode, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: badge.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => { if (!isDraggingMode) onSelect(badge); }}
      className={`p-4 rounded-lg border transition-all flex items-start gap-2 ${isDraggingMode ? 'cursor-default' : 'cursor-pointer'
        } ${isSelected && !isDraggingMode
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'border-border hover:border-primary/50 hover:bg-bg-hover'
        } ${isDragging ? 'shadow-lg z-50' : ''}`}
    >
      {isDraggingMode && (
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="flex-shrink-0 p-1 mt-1 cursor-grab active:cursor-grabbing text-txt-muted hover:bg-hover rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <HolderOutlined />
        </button>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center">
            {badge.displayType === 'text' ? (
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ color: badge.textColor, backgroundColor: badge.bgColor }}
              >
                {badge.text}
              </span>
            ) : badge.imageUrl ? (
              <img src={badge.imageUrl} alt={badge.name} className="w-10 h-10 rounded-lg object-cover" />
            ) : (
              <StarOutlined style={{ fontSize: 18 }} className="text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-txt-main truncate">{badge.name}</h4>
              <Badge variant={BADGE_STATUS_VARIANT[badge.status]} className="flex-shrink-0">
                {BADGE_STATUS_LABELS[badge.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">{badge.displayType === 'text' ? '텍스트' : '이미지'}</Badge>
              <span className="text-xs text-txt-muted">순서 {badge.sortOrder}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function IconBadgeManagement() {
  const toast = useToast();
  const {
    badges,
    loading,
    createIconBadge,
    updateIconBadge,
    updateIconBadgesOrders,
    toggleStatus,
    deleteIconBadge
  } = useIconBadges();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BadgeStatus | 'all'>('all');
  const [selectedBadge, setSelectedBadge] = useState<IconBadge | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formData, setFormData] = useState<IconBadgeFormData>({ ...DEFAULT_FORM });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDraggingMode, setIsDraggingMode] = useState(false);

  const filteredBadges = useMemo(() => {
    const sorted = [...badges].sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted.filter((b) => {
      const matchesSearch = !searchTerm || b.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [badges, searchTerm, statusFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...badges].sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = sorted.findIndex((b) => b.id === active.id);
    const newIndex = sorted.findIndex((b) => b.id === over.id);
    const newBadges = arrayMove(sorted, oldIndex, newIndex);
    const updatedWithOrders = newBadges.map((badge, index) => ({
      ...badge,
      sortOrder: index + 1
    }));

    await updateIconBadgesOrders(updatedWithOrders);
  };

  const handleNew = () => {
    setSelectedBadge(null);
    setFormData({ ...DEFAULT_FORM });
    setIsFormActive(true);
  };

  const handleSelect = (badge: IconBadge) => {
    setSelectedBadge(badge);
    setFormData({
      name: badge.name,
      displayType: badge.displayType,
      text: badge.text,
      textColor: badge.textColor,
      bgColor: badge.bgColor,
      imageUrl: badge.imageUrl,
      sortOrder: badge.sortOrder,
    });
    setIsFormActive(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('뱃지 이름을 입력해주세요.');
      return;
    }
    if (formData.displayType === 'text' && !formData.text.trim()) {
      toast.error('뱃지 텍스트를 입력해주세요.');
      return;
    }
    if (formData.displayType === 'image' && !formData.imageUrl) {
      toast.error('뱃지 이미지를 업로드해주세요.');
      return;
    }

    if (selectedBadge) {
      const updated = await updateIconBadge(selectedBadge.id, formData);
      if (updated) {
        setIsFormActive(false);
        setSelectedBadge(null);
      }
    } else {
      const created = await createIconBadge({ ...formData, sortOrder: badges.length + 1 });
      if (created) {
        setIsFormActive(false);
        setSelectedBadge(null);
      }
    }
  };

  const handleDuplicate = () => {
    if (!selectedBadge) return;
    setSelectedBadge(null);
    setFormData((prev) => ({ ...prev, name: `${prev.name} (복사)` }));
    toast.info('뱃지가 복제되었습니다. 수정 후 저장하세요.');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const isDeleted = await deleteIconBadge(deleteTarget.id, deleteTarget.name);
    if (isDeleted) {
      setDeleteTarget(null);
      if (selectedBadge?.id === deleteTarget.id) {
        setSelectedBadge(null);
        setIsFormActive(false);
      }
    }
  };

  const handleToggleStatus = async (badge: IconBadge) => {
    await toggleStatus(badge);
    if (selectedBadge?.id === badge.id) {
      setSelectedBadge({ ...badge, status: badge.status === 'active' ? 'inactive' : 'active' });
    }
  };

  const handleFormChange = (updates: Partial<IconBadgeFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
      {/* 좌측: 뱃지 목록 */}
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-txt-main">아이콘뱃지 목록</h2>
          <div className="flex gap-2">
            {isDraggingMode ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setIsDraggingMode(false)}>
                  <CloseOutlined style={{ fontSize: 14, marginRight: 4 }} />
                  취소
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsDraggingMode(false)}>
                  <CheckOutlined style={{ fontSize: 14, marginRight: 4 }} />
                  완료
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" size="sm" onClick={() => setIsDraggingMode(true)}>
                  <HolderOutlined style={{ fontSize: 14, marginRight: 4 }} />
                  순서 변경
                </Button>
                <Button variant="primary" size="sm" onClick={handleNew}>
                  <PlusOutlined style={{ fontSize: 14, marginRight: 4 }} />
                  추가
                </Button>
              </>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleButtonGroup
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as BadgeStatus | 'all')}
          />
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="뱃지 검색..." />

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredBadges.length === 0 ? (
              <div className="py-8 text-center text-txt-muted text-sm">
                뱃지가 없습니다.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredBadges.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {filteredBadges.map((badge) => (
                    <SortableBadgeItem
                      key={badge.id}
                      badge={badge}
                      isSelected={selectedBadge?.id === badge.id}
                      isDraggingMode={isDraggingMode}
                      onSelect={handleSelect}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 우측: 뱃지 폼 */}
      <div className="flex-1 min-w-0">
        {!isFormActive ? (
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-txt-muted">
                <StarOutlined style={{ fontSize: 48 }} className="mb-4 opacity-30" />
                <p className="text-lg mb-2">뱃지를 선택하거나 새로 등록하세요</p>
                <p className="text-sm mb-6">왼쪽 목록에서 뱃지를 선택하면 상세 정보를 확인할 수 있습니다.</p>
                <Button onClick={handleNew}>
                  <PlusOutlined style={{ fontSize: 16, marginRight: 8 }} />
                  새 뱃지 등록
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-txt-main">
                {selectedBadge ? '뱃지 수정' : '새 뱃지 등록'}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input label="뱃지 이름 *" value={formData.name} onChange={(e) => handleFormChange({ name: e.target.value })} placeholder="뱃지 이름 (관리용)" />
                <div>
                  <label className="block text-sm font-medium text-txt-main mb-2">표시 유형 *</label>
                  <div className="flex gap-3">
                    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${formData.displayType === 'text' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
                      <input type="radio" name="displayType" value="text" checked={formData.displayType === 'text'} onChange={() => handleFormChange({ displayType: 'text' })} className="accent-primary" />
                      <span className="text-sm font-medium text-txt-main">텍스트 아이콘</span>
                    </label>
                    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border cursor-pointer transition-all ${formData.displayType === 'image' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
                      <input type="radio" name="displayType" value="image" checked={formData.displayType === 'image'} onChange={() => handleFormChange({ displayType: 'image' })} className="accent-primary" />
                      <span className="text-sm font-medium text-txt-main">이미지 아이콘</span>
                    </label>
                  </div>
                </div>
                <Input label="정렬 순서" type="number" value={formData.sortOrder} onChange={(e) => handleFormChange({ sortOrder: Number(e.target.value) })} min={0} />

                {formData.displayType === 'text' ? (
                  <>
                    <Input label="뱃지 텍스트 *" value={formData.text} onChange={(e) => handleFormChange({ text: e.target.value })} placeholder="NEW, HOT, BEST 등" maxLength={10} />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label mb-2 block">글자 색상</label>
                        <div className="flex items-center gap-2">
                          <input type="color" className="w-10 h-10 rounded border border-border cursor-pointer" value={formData.textColor} onChange={(e) => handleFormChange({ textColor: e.target.value })} />
                          <Input value={formData.textColor} onChange={(e) => handleFormChange({ textColor: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <label className="form-label mb-2 block">배경 색상</label>
                        <div className="flex items-center gap-2">
                          <input type="color" className="w-10 h-10 rounded border border-border cursor-pointer" value={formData.bgColor} onChange={(e) => handleFormChange({ bgColor: e.target.value })} />
                          <Input value={formData.bgColor} onChange={(e) => handleFormChange({ bgColor: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    {/* 미리보기 */}
                    <div>
                      <label className="block text-sm font-medium text-txt-main mb-1">미리보기</label>
                      <div className="p-4 rounded-lg border border-border bg-bg-hover flex items-center gap-3">
                        <span
                          className="text-xs font-bold px-2 py-1 rounded"
                          style={{ color: formData.textColor, backgroundColor: formData.bgColor }}
                        >
                          {formData.text || 'BADGE'}
                        </span>
                        <span className="text-sm text-txt-muted">상품명 옆에 표시됩니다</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-txt-main mb-1">뱃지 이미지 *</label>
                    <p className="text-xs text-txt-muted mb-2">권장 크기: 64x64px / 최대 5MB</p>
                    <ImageUpload
                      value={formData.imageUrl}
                      maxSize={5 * 1024 * 1024}
                      onChange={(file) => {
                        if (file) {
                          handleFormChange({ imageUrl: URL.createObjectURL(file) });
                        } else {
                          handleFormChange({ imageUrl: '' });
                        }
                      }}
                    />
                  </div>
                )}

                {/* 상태 토글 (수정 모드) */}
                {selectedBadge && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg-hover">
                    <div>
                      <span className="text-sm font-medium text-txt-main">현재 상태: </span>
                      <Badge variant={BADGE_STATUS_VARIANT[selectedBadge.status]}>
                        {BADGE_STATUS_LABELS[selectedBadge.status]}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedBadge)}>
                      {selectedBadge.status === 'active' ? '미사용 처리' : '사용 처리'}
                    </Button>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <div>
                    {selectedBadge && (
                      <Button variant="outline" onClick={handleDuplicate}>
                        <CopyOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        복제
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {selectedBadge && (
                      <Button variant="danger" onClick={() => setDeleteTarget({ id: selectedBadge.id, name: selectedBadge.name })}>
                        <DeleteOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        삭제
                      </Button>
                    )}
                    <Button onClick={handleSave} disabled={loading}>
                      <SaveOutlined style={{ fontSize: 14, marginRight: 6 }} />
                      {selectedBadge ? '수정' : '등록'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="뱃지 삭제"
        message={`"${deleteTarget?.name}" 뱃지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
}
