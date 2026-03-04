/**
 * 팝업 관리 페이지
 * 좌측: 팝업 목록 / 우측: 팝업 상세/등록 폼
 */
import { useState, useMemo } from 'react';
import { usePopups } from '@/hooks/useDesign';
import type { Popup, PopupFormData, PopupStatus, PopupType, DeviceType, ExposureTarget, ExposureScreen } from '@/types/design';
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
  webLinkUrl: '',
  deepLinkUrl: '',
  deviceType: 'pc',
  popupType: 'modal',
  exposureTarget: 'all',
  exposureScreen: [],
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
  modal: '모달 팝업',
  screen: '스크린 팝업',
  bottom_sheet: '바텀시트 (모바일 전용)',
};

const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  pc: 'PC',
  mobile: '모바일',
};

const EXPOSURE_TARGET_LABELS: Record<ExposureTarget, string> = {
  all: '전체 (비회원+회원)',
  guest: '비회원 (로그인 전)',
  member: '회원 (로그인 후)',
};

const EXPOSURE_SCREEN_OPTIONS: { value: ExposureScreen; label: string }[] = [
  { value: 'main', label: '메인(홈)' },
  { value: 'menu', label: '메뉴 목록' },
  { value: 'event', label: '이벤트 목록' },
];

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
              <Badge variant="default">{DEVICE_TYPE_LABELS[popup.deviceType]}</Badge>
              <Badge variant="secondary">{POPUP_TYPE_LABELS[popup.popupType]}</Badge>
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
      webLinkUrl: popup.webLinkUrl,
      deepLinkUrl: popup.deepLinkUrl,
      deviceType: popup.deviceType,
      popupType: popup.popupType,
      exposureTarget: popup.exposureTarget,
      exposureScreen: [...popup.exposureScreen],
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
    setFormData((prev) => {
      const next = { ...prev, ...updates };
      // 바텀시트는 모바일 전용이므로 디바이스 강제 지정
      if (next.popupType === 'bottom_sheet') {
        next.deviceType = 'mobile';
      }
      return next;
    });
  };

  const handleExposureScreenToggle = (screenValue: ExposureScreen) => {
    setFormData((prev) => {
      const screens = prev.exposureScreen.includes(screenValue)
        ? prev.exposureScreen.filter(s => s !== screenValue)
        : [...prev.exposureScreen, screenValue];
      return { ...prev, exposureScreen: screens };
    });
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

                {/* 팝업 전시 설정 - 최상단 배치 */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-txt-main mb-3">팝업 전시 설정</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-txt-main mb-1">노출 기기 (Device)</label>
                      <select className="form-input w-full" value={formData.deviceType} onChange={(e) => handleFormChange({ deviceType: e.target.value as DeviceType })} disabled={formData.popupType === 'bottom_sheet'}>
                        {Object.entries(DEVICE_TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                      {formData.popupType === 'bottom_sheet' && (
                        <p className="text-xs text-info mt-1">※ 바텀시트는 모바일에서만 지원됩니다.</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-txt-main mb-1">팝업 유형</label>
                      <select className="form-input w-full" value={formData.popupType} onChange={(e) => handleFormChange({ popupType: e.target.value as PopupType })}>
                        {Object.entries(POPUP_TYPE_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-txt-main mb-1">노출 대상 (회원/비회원)</label>
                      <select className="form-input w-full" value={formData.exposureTarget} onChange={(e) => handleFormChange({ exposureTarget: e.target.value as ExposureTarget })}>
                        {Object.entries(EXPOSURE_TARGET_LABELS).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-txt-main mb-1">노출 화면</label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {EXPOSURE_SCREEN_OPTIONS.map((opt) => (
                          <label key={opt.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.exposureScreen.includes(opt.value)}
                              onChange={() => handleExposureScreenToggle(opt.value)}
                            />
                            {opt.label}
                          </label>
                        ))}
                      </div>
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

                  <div className="mt-3">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={formData.showOncePerDay} onChange={(e) => handleFormChange({ showOncePerDay: e.target.checked })} />
                      <span className="font-medium">오늘 하루 안 보기</span>
                      <span className="text-xs text-txt-muted">사용자가 닫으면 24시간 숨김</span>
                    </label>
                  </div>
                </div>

                {/* 팝업 콘텐츠 */}
                <div className="border-t border-border pt-4">
                  <h3 className="text-sm font-semibold text-txt-main mb-3">팝업 콘텐츠</h3>
                  <div className="space-y-4">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-txt-main mb-1">웹 링크 URL (PC/Web)</label>
                        <input type="text" className="form-input w-full" value={formData.webLinkUrl} onChange={(e) => handleFormChange({ webLinkUrl: e.target.value })} placeholder="클릭 시 이동할 웹 주소 (선택)" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-txt-main mb-1">앱 딥링크 URL (Mobile)</label>
                        <input type="text" className="form-input w-full" value={formData.deepLinkUrl} onChange={(e) => handleFormChange({ deepLinkUrl: e.target.value })} placeholder="클릭 시 이동할 앱 딥링크 (선택)" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 상태 토글 (수정 모드) */}
                {selectedPopup && (
                  <div className="flex items-center justify-between p-3 py-2 mt-4 rounded-lg border border-border bg-bg-hover">
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
                <div className="flex justify-between pt-6 border-t border-border">
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsPreviewOpen(true)}>
                      <MobileOutlined style={{ fontSize: 14, marginRight: 6 }} />
                      미리보기
                    </Button>
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

      {/* 미리보기 모달 */}
      <PopupPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        popupData={formData}
      />
    </div>
  );
}

const PopupPreviewModal: React.FC<{ isOpen: boolean; onClose: () => void; popupData: PopupFormData }> = ({ isOpen, onClose, popupData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div
        className={`relative bg-white shadow-2xl rounded-2xl overflow-hidden
        ${popupData.deviceType === 'mobile' ? 'w-[375px] h-[667px]' : 'w-[800px] h-[600px]'}
        ${popupData.popupType === 'bottom_sheet' ? 'flex flex-col justify-end bg-transparent shadow-none' : ''}
        ${popupData.popupType === 'screen' ? 'w-full h-full rounded-none' : ''}`}
      >
        {popupData.popupType === 'bottom_sheet' ? (
          <div className="bg-white rounded-t-2xl w-full h-[60%] overflow-auto shadow-[0_-4px_20px_rgba(0,0,0,0.1)] pb-8 animate-slide-up relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <CloseOutlined className="text-xl" />
            </button>
            <div className="p-4 border-b border-gray-100 flex justify-center">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
            </div>
            {popupData.imageUrl && (
              <img src={popupData.imageUrl} alt="preview" className="w-full h-auto" />
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold mb-2">{popupData.title || '제목 없음'}</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{popupData.content}</p>
            </div>
            {popupData.showOncePerDay && (
              <div className="px-6 py-4 flex justify-between text-sm text-txt-muted border-t border-gray-100 bg-gray-50 absolute bottom-0 w-full">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" />
                  <span>오늘 하루 열지 않음</span>
                </label>
                <button onClick={onClose}>닫기</button>
              </div>
            )}
          </div>
        ) : popupData.popupType === 'screen' ? (
          <div className="w-full h-full bg-white flex flex-col items-center justify-center relative">
            <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-black text-2xl z-20">
              <CloseOutlined />
            </button>
            {popupData.imageUrl && (
              <div className="w-full max-w-2xl px-4 flex-1 flex items-center justify-center">
                <img src={popupData.imageUrl} alt="preview" className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg" />
              </div>
            )}
            <div className="p-8 text-center max-w-2xl bg-white relative z-10 rounded-xl">
              <h3 className="text-3xl font-bold mb-4">{popupData.title || '제목 없음'}</h3>
              <p className="text-lg text-gray-600 whitespace-pre-wrap leading-relaxed">{popupData.content}</p>
            </div>
            {popupData.showOncePerDay && (
              <div className="absolute bottom-0 w-full p-6 flex justify-between text-white bg-black/30 backdrop-blur-sm z-20">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" />
                  <span>오늘 하루 보지 않기</span>
                </label>
                <button onClick={onClose}>닫기</button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col h-full bg-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-black bg-white/80 p-1 rounded-full z-10">
              <CloseOutlined className="text-xl" />
            </button>
            <div className="flex-1 overflow-auto">
              {popupData.imageUrl && (
                <img src={popupData.imageUrl} alt="preview" className="w-full h-auto" />
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2 text-txt-main">{popupData.title || '제목 없음'}</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{popupData.content}</p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 shrink-0">
              {popupData.showOncePerDay ? (
                <label className="flex items-center gap-2 text-sm text-txt-muted cursor-pointer">
                  <input type="checkbox" />
                  <span>오늘 하루 안 보기</span>
                </label>
              ) : <div />}
              <button onClick={onClose} className="text-sm font-medium hover:text-black text-txt-muted px-2 py-1">닫기</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
