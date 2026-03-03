/**
 * 팝업 관리 페이지
 * 좌측: 팝업 목록 / 우측: 팝업 상세/등록 폼
 */
import { useState, useMemo } from 'react';
import { usePopups } from '@/hooks/useDesign';
import type { Popup, PopupFormData, PopupStatus, PopupType } from '@/types/design';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CopyOutlined,
  MobileOutlined,
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
  SearchInput,
  ConfirmDialog,
  ToggleButtonGroup,
  ImageUpload,
} from '@/components/ui';
import { useToast } from '@/hooks';

const DEFAULT_POPUP_FORM: PopupFormData = {
  title: '',
  content: '',
  imageUrl: '',
  linkUrl: '',
  popupType: 'center',
  sortOrder: 0,
  startDate: '',
  endDate: '',
  isAlwaysOn: false,
  showOncePerDay: true,
};

const POPUP_STATUS_LABELS: Record<PopupStatus, string> = {
  active: '게시중',
  inactive: '비활성',
  scheduled: '예약',
};

const POPUP_STATUS_BADGE: Record<PopupStatus, 'success' | 'default' | 'info'> = {
  active: 'success',
  inactive: 'default',
  scheduled: 'info',
};

const POPUP_TYPE_LABELS: Record<PopupType, string> = {
  center: '중앙 팝업',
  bottom_sheet: '바텀시트',
  full_screen: '전체화면',
  toast: '토스트',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: '전체' },
  { value: 'active' as const, label: '게시중' },
  { value: 'inactive' as const, label: '비활성' },
  { value: 'scheduled' as const, label: '예약' },
];

const SortablePopupItem: React.FC<{
  popup: Popup;
  isSelected: boolean;
  isDraggingMode: boolean;
  onSelect: (popup: Popup) => void;
}> = ({ popup, isSelected, isDraggingMode, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: popup.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => { if (!isDraggingMode) onSelect(popup); }}
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
          <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <MobileOutlined style={{ fontSize: 18 }} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-txt-main truncate">{popup.title}</h4>
              <Badge variant={POPUP_STATUS_BADGE[popup.status]} className="flex-shrink-0">
                {POPUP_STATUS_LABELS[popup.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">{POPUP_TYPE_LABELS[popup.popupType]}</Badge>
              <span className="text-xs text-txt-muted">순서 {popup.sortOrder}</span>
              <span className="text-xs text-txt-muted border-l border-border pl-2">{popup.showOncePerDay ? '1일 1회' : '매번 노출'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function PopupManagement() {
  const toast = useToast();
  const {
    popups,
    loading,
    createPopup,
    updatePopup,
    updatePopupsOrders,
    toggleStatus,
    deletePopup
  } = usePopups();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PopupStatus | 'all'>('all');
  const [selectedPopup, setSelectedPopup] = useState<Popup | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formData, setFormData] = useState<PopupFormData>({ ...DEFAULT_POPUP_FORM });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDraggingMode, setIsDraggingMode] = useState(false);

  const filteredPopups = useMemo(() => {
    const sorted = [...popups].sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted.filter((p) => {
      const matchesSearch = !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [popups, searchTerm, statusFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...popups].sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = sorted.findIndex((p) => p.id === active.id);
    const newIndex = sorted.findIndex((p) => p.id === over.id);
    const newPopups = arrayMove(sorted, oldIndex, newIndex);
    const updatedWithOrders = newPopups.map((popup, index) => ({
      ...popup,
      sortOrder: index + 1
    }));

    await updatePopupsOrders(updatedWithOrders);
  };

  const handleNew = () => {
    setSelectedPopup(null);
    setFormData({ ...DEFAULT_POPUP_FORM });
    setIsFormActive(true);
  };

  const handleSelect = (popup: Popup) => {
    setSelectedPopup(popup);
    setFormData({
      title: popup.title,
      content: popup.content,
      imageUrl: popup.imageUrl,
      linkUrl: popup.linkUrl,
      popupType: popup.popupType,
      sortOrder: popup.sortOrder,
      startDate: popup.startDate,
      endDate: popup.endDate ?? '',
      isAlwaysOn: !popup.endDate,
      showOncePerDay: popup.showOncePerDay,
    });
    setIsFormActive(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('팝업 제목을 입력해주세요.');
      return;
    }

    if (selectedPopup) {
      const updated = await updatePopup(selectedPopup.id, formData);
      if (updated) {
        setIsFormActive(false);
        setSelectedPopup(null);
      }
    } else {
      const created = await createPopup({ ...formData, sortOrder: popups.length + 1 });
      if (created) {
        setIsFormActive(false);
        setSelectedPopup(null);
      }
    }
  };

  const handleDuplicate = () => {
    if (!selectedPopup) return;
    setSelectedPopup(null);
    setFormData((prev) => ({ ...prev, title: `${prev.title} (복사)` }));
    toast.info('팝업이 복제되었습니다. 수정 후 저장하세요.');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const isDeleted = await deletePopup(deleteTarget.id, deleteTarget.title);
    if (isDeleted) {
      setDeleteTarget(null);
      if (selectedPopup?.id === deleteTarget.id) {
        setSelectedPopup(null);
        setIsFormActive(false);
      }
    }
  };

  const handleToggleStatus = async (popup: Popup) => {
    await toggleStatus(popup);
    if (selectedPopup?.id === popup.id) {
      setSelectedPopup({ ...popup, status: popup.status === 'active' ? 'inactive' : 'active' });
    }
  };

  const handleFormChange = (updates: Partial<PopupFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
      {/* 좌측: 팝업 목록 */}
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-txt-main">팝업 목록</h2>
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
            onChange={(val) => setStatusFilter(val as PopupStatus | 'all')}
          />
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="팝업 검색..." />

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredPopups.length === 0 ? (
              <div className="py-8 text-center text-txt-muted text-sm">
                팝업이 없습니다.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredPopups.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                  {filteredPopups.map((popup) => (
                    <SortablePopupItem
                      key={popup.id}
                      popup={popup}
                      isSelected={selectedPopup?.id === popup.id}
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

      {/* 우측: 팝업 폼 */}
      <div className="flex-1 min-w-0">
        {!isFormActive ? (
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-txt-muted">
                <MobileOutlined style={{ fontSize: 48 }} className="mb-4 opacity-30" />
                <p className="text-lg mb-2">팝업을 선택하거나 새로 등록하세요</p>
                <p className="text-sm mb-6">왼쪽 목록에서 팝업을 선택하면 상세 정보를 확인할 수 있습니다.</p>
                <Button onClick={handleNew}>
                  <PlusOutlined style={{ fontSize: 16, marginRight: 8 }} />
                  새 팝업 등록
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-txt-main">
                {selectedPopup ? '팝업 수정' : '새 팝업 등록'}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-txt-main mb-1">팝업 제목 *</label>
                  <input type="text" className="form-input w-full" value={formData.title} onChange={(e) => handleFormChange({ title: e.target.value })} placeholder="팝업 제목을 입력하세요" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-main mb-1">내용</label>
                  <textarea className="form-input w-full resize-y" value={formData.content} onChange={(e) => handleFormChange({ content: e.target.value })} placeholder="팝업 내용을 입력하세요" rows={3} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-main mb-1">팝업 이미지</label>
                  <ImageUpload
                    value={formData.imageUrl}
                    onChange={(file) => {
                      if (file) {
                        handleFormChange({ imageUrl: URL.createObjectURL(file) });
                      } else {
                        handleFormChange({ imageUrl: '' });
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-txt-main mb-1">링크 URL</label>
                  <input type="text" className="form-input w-full" value={formData.linkUrl} onChange={(e) => handleFormChange({ linkUrl: e.target.value })} placeholder="클릭 시 이동 경로 (선택)" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-txt-main mb-1">팝업 유형</label>
                    <select className="form-input w-full" value={formData.popupType} onChange={(e) => handleFormChange({ popupType: e.target.value as PopupType })}>
                      {Object.entries(POPUP_TYPE_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-txt-main mb-1">정렬 순서</label>
                    <input type="number" className="form-input w-full" value={formData.sortOrder} onChange={(e) => handleFormChange({ sortOrder: Number(e.target.value) })} min={0} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-txt-main mb-1">시작일</label>
                    <input type="date" className="form-input w-full" value={formData.startDate} onChange={(e) => handleFormChange({ startDate: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-txt-main mb-1">종료일</label>
                    <input type="date" className={`form-input w-full ${formData.isAlwaysOn ? 'opacity-50' : ''}`} value={formData.endDate} onChange={(e) => handleFormChange({ endDate: e.target.value })} disabled={formData.isAlwaysOn} />
                    <label className="flex items-center gap-1.5 mt-1 text-xs text-txt-muted cursor-pointer">
                      <input type="checkbox" checked={formData.isAlwaysOn} onChange={(e) => handleFormChange({ isAlwaysOn: e.target.checked })} />
                      상시 노출
                    </label>
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={formData.showOncePerDay} onChange={(e) => handleFormChange({ showOncePerDay: e.target.checked })} />
                    <span className="font-medium">오늘 하루 안 보기</span>
                    <span className="text-xs text-txt-muted">사용자가 닫으면 24시간 숨김</span>
                  </label>
                </div>

                {/* 상태 토글 (수정 모드) */}
                {selectedPopup && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg-hover">
                    <div>
                      <span className="text-sm font-medium text-txt-main">현재 상태: </span>
                      <Badge variant={POPUP_STATUS_BADGE[selectedPopup.status]}>
                        {POPUP_STATUS_LABELS[selectedPopup.status]}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleToggleStatus(selectedPopup)}>
                      {selectedPopup.status === 'active' ? '비활성 처리' : '사용 처리'}
                    </Button>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <div>
                    {selectedPopup && (
                      <Button variant="outline" onClick={handleDuplicate}>
                        <CopyOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        복제
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {selectedPopup && (
                      <Button variant="danger" onClick={() => setDeleteTarget({ id: selectedPopup.id, title: selectedPopup.title })}>
                        <DeleteOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        삭제
                      </Button>
                    )}
                    <Button onClick={handleSave} disabled={loading}>
                      <SaveOutlined style={{ fontSize: 14, marginRight: 6 }} />
                      {selectedPopup ? '수정' : '등록'}
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
        title="팝업 삭제"
        message={`"${deleteTarget?.title}" 팝업을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
}
