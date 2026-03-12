/**
 * 배너 관리 페이지
 * 좌측: 배너 목록 / 우측: 배너 상세/등록 폼
 */
import { useState, useMemo } from 'react';
import { useBanners } from '@/hooks/useDesign';
import type { Banner, BannerFormData, BannerStatus, BannerPosition } from '@/types/design';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CopyOutlined,
  PictureOutlined,
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
  Select,
  SearchInput,
  ConfirmDialog,
  ToggleButtonGroup,
  ImageUpload,
} from '@/components/ui';
import { useToast } from '@/hooks';

const DEFAULT_BANNER_FORM: BannerFormData = {
  title: '',
  imageUrl: '',
  linkUrl: '',
  position: 'main_top',
  sortOrder: 0,
  startDate: '',
  endDate: '',
  isAlwaysOn: true,
};

const BANNER_STATUS_LABELS: Record<BannerStatus, string> = {
  active: '게시중',
  inactive: '비활성',
  scheduled: '예약',
};

const BANNER_STATUS_BADGE: Record<BannerStatus, 'success' | 'default' | 'info'> = {
  active: 'success',
  inactive: 'default',
  scheduled: 'info',
};

const BANNER_POSITION_LABELS: Record<BannerPosition, string> = {
  main_top: '메인 상단',
  main_middle: '메인 중단',
  main_bottom: '메인 하단',
  sub_top: '서브 상단',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all' as const, label: '전체' },
  { value: 'active' as const, label: '게시중' },
  { value: 'inactive' as const, label: '비활성' },
  { value: 'scheduled' as const, label: '예약' },
];

const SortableBannerItem: React.FC<{
  banner: Banner;
  isSelected: boolean;
  isDraggingMode: boolean;
  onSelect: (banner: Banner) => void;
}> = ({ banner, isSelected, isDraggingMode, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: banner.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => { if (!isDraggingMode) onSelect(banner); }}
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
            <PictureOutlined style={{ fontSize: 18 }} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium text-txt-main truncate">{banner.title}</h4>
              <Badge variant={BANNER_STATUS_BADGE[banner.status]} className="flex-shrink-0">
                {BANNER_STATUS_LABELS[banner.status]}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">{BANNER_POSITION_LABELS[banner.position]}</Badge>
              <span className="text-xs text-txt-muted">순서 {banner.sortOrder}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export function BannerManagement() {
  const toast = useToast();
  const {
    banners,
    loading,
    createBanner,
    updateBanner,
    updateBannersOrders,
    toggleStatus,
    deleteBanner,
  } = useBanners();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BannerStatus | 'all'>('all');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formData, setFormData] = useState<BannerFormData>({ ...DEFAULT_BANNER_FORM });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDraggingMode, setIsDraggingMode] = useState(false);

  const filteredBanners = useMemo(() => {
    const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
    return sorted.filter((b) => {
      const matchesSearch = !searchTerm || b.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [banners, searchTerm, statusFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
    const oldIndex = sorted.findIndex((b) => b.id === active.id);
    const newIndex = sorted.findIndex((b) => b.id === over.id);
    const newBanners = arrayMove(sorted, oldIndex, newIndex);
    const updatedWithOrders = newBanners.map((banner, index) => ({
      ...banner,
      sortOrder: index + 1,
    }));
    await updateBannersOrders(updatedWithOrders);
  };

  const handleNew = () => {
    setSelectedBanner(null);
    setFormData({ ...DEFAULT_BANNER_FORM });
    setIsFormActive(true);
  };

  const handleSelect = (banner: Banner) => {
    setSelectedBanner(banner);
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl,
      position: banner.position,
      sortOrder: banner.sortOrder,
      startDate: banner.startDate,
      endDate: banner.endDate ?? '',
      isAlwaysOn: !banner.endDate,
    });
    setIsFormActive(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('배너 제목을 입력해주세요.');
      return;
    }

    if (selectedBanner) {
      const updated = await updateBanner(selectedBanner.id, formData);
      if (updated) {
        setIsFormActive(false);
        setSelectedBanner(null);
      }
    } else {
      const created = await createBanner({ ...formData, sortOrder: banners.length + 1 });
      if (created) {
        setIsFormActive(false);
        setSelectedBanner(null);
      }
    }
  };

  const handleDuplicate = () => {
    if (!selectedBanner) return;
    setSelectedBanner(null);
    setFormData((prev) => ({ ...prev, title: `${prev.title} (복사)` }));
    toast.info('배너가 복제되었습니다. 수정 후 저장하세요.');
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const isDeleted = await deleteBanner(deleteTarget.id, deleteTarget.title);
    if (isDeleted) {
      setDeleteTarget(null);
      if (selectedBanner?.id === deleteTarget.id) {
        setSelectedBanner(null);
        setIsFormActive(false);
      }
    }
  };

  const handleFormChange = (updates: Partial<BannerFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
      {/* 좌측: 배너 목록 */}
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-txt-main">배너 목록</h2>
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
            onChange={(val) => setStatusFilter(val as BannerStatus | 'all')}
          />
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="배너 검색..." />

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredBanners.length === 0 ? (
              <div className="py-8 text-center text-txt-muted text-sm">
                배너가 없습니다.
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredBanners.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                  {filteredBanners.map((banner) => (
                    <SortableBannerItem
                      key={banner.id}
                      banner={banner}
                      isSelected={selectedBanner?.id === banner.id}
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

      {/* 우측: 배너 폼 */}
      <div className="flex-1 min-w-0">
        {!isFormActive ? (
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-txt-muted">
                <PictureOutlined style={{ fontSize: 48 }} className="mb-4 opacity-30" />
                <p className="text-lg mb-2">배너를 선택하거나 새로 등록하세요</p>
                <p className="text-sm mb-6">왼쪽 목록에서 배너를 선택하면 상세 정보를 확인할 수 있습니다.</p>
                <Button onClick={handleNew}>
                  <PlusOutlined style={{ fontSize: 16, marginRight: 8 }} />
                  새 배너 등록
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-txt-main">
                {selectedBanner ? '배너 수정' : '새 배너 등록'}
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input label="배너 제목 *" value={formData.title} onChange={(e) => handleFormChange({ title: e.target.value })} placeholder="배너 제목을 입력하세요" />
                <div>
                  <label className="block text-sm font-medium text-txt-main mb-1">배너 이미지</label>
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
                <Input label="링크 URL" value={formData.linkUrl} onChange={(e) => handleFormChange({ linkUrl: e.target.value })} placeholder="클릭 시 이동할 경로" />
                <div className="grid grid-cols-2 gap-4">
                  <Select label="배치 위치" value={formData.position} onChange={(e) => handleFormChange({ position: e.target.value as BannerPosition })}>
                    {Object.entries(BANNER_POSITION_LABELS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </Select>
                  <Input label="정렬 순서" type="number" value={formData.sortOrder} onChange={(e) => handleFormChange({ sortOrder: Number(e.target.value) })} min={0} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="게시 시작일" type="date" value={formData.startDate} onChange={(e) => handleFormChange({ startDate: e.target.value })} />
                  <div>
                    <Input label="게시 종료일" type="date" className={formData.isAlwaysOn ? 'opacity-50' : ''} value={formData.endDate} onChange={(e) => handleFormChange({ endDate: e.target.value })} disabled={formData.isAlwaysOn} />
                    <label className="flex items-center gap-1.5 mt-1 text-xs text-txt-muted cursor-pointer">
                      <input type="checkbox" checked={formData.isAlwaysOn} onChange={(e) => handleFormChange({ isAlwaysOn: e.target.checked })} />
                      상시 게시
                    </label>
                  </div>
                </div>

                {/* 상태 토글 (수정 모드) */}
                {selectedBanner && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-bg-hover">
                    <div>
                      <span className="text-sm font-medium text-txt-main">현재 상태: </span>
                      <Badge variant={BANNER_STATUS_BADGE[selectedBanner.status]}>
                        {BANNER_STATUS_LABELS[selectedBanner.status]}
                      </Badge>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(selectedBanner)}>
                      {selectedBanner.status === 'active' ? '비활성 처리' : '사용 처리'}
                    </Button>
                  </div>
                )}

                {/* 액션 버튼 */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <div>
                    {selectedBanner && (
                      <Button variant="outline" onClick={handleDuplicate}>
                        <CopyOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        복제
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {selectedBanner && (
                      <Button variant="danger" onClick={() => setDeleteTarget({ id: selectedBanner.id, title: selectedBanner.title })}>
                        <DeleteOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        삭제
                      </Button>
                    )}
                    <Button onClick={handleSave} disabled={loading}>
                      <SaveOutlined style={{ fontSize: 14, marginRight: 6 }} />
                      {selectedBanner ? '수정' : '등록'}
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
        title="배너 삭제"
        message={`"${deleteTarget?.title}" 배너를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
}
