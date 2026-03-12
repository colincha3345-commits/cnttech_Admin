/**
 * 이벤트 관리 페이지
 * 좌측: 이벤트 목록 / 우측: 이벤트 폼 (3탭)
 */
import { useState, useMemo } from 'react';
import {
  PlusOutlined,
  CalendarOutlined,
  CheckOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  SearchInput,
  ConfirmDialog,
  ToggleButtonGroup,
  Spinner,
} from '@/components/ui';
import type { Event, EventFormData, EventStatus, EventType } from '@/types/event';
import {
  EVENT_STATUS_LABELS,
  EVENT_STATUS_BADGE,
  EVENT_TYPE_LABELS,
  DEFAULT_EVENT_FORM,
  validateEventForm,
} from '@/types/event';
import { EVENT_STATUS_FILTER_OPTIONS, EVENT_TYPE_FILTER_OPTIONS } from '@/constants/event';
import { useToast } from '@/hooks';
import {
  useEventList,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useDuplicateEvent,
} from '@/hooks/useEvents';
import { EventForm } from './components/EventForm';

export function EventManagement() {
  const toast = useToast();

  // 리스트 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<EventType | 'all'>('all');

  // 폼 상태
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({ ...DEFAULT_EVENT_FORM });

  // 다이얼로그
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean;
    eventName: string;
    isNew: boolean;
  }>({ isOpen: false, eventName: '', isNew: true });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // React Query 훅
  const { data: eventListData, isLoading } = useEventList({
    keyword: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
    eventType: typeFilter === 'all' ? undefined : typeFilter,
  });
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();
  const duplicateEventMutation = useDuplicateEvent();

  const events = useMemo(() => eventListData?.data ?? [], [eventListData]);

  // ── 핸들러 ──

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setFormData(eventToFormData(event));
    setIsFormActive(true);
  };

  const handleNewEvent = () => {
    setSelectedEvent(null);
    setFormData({ ...DEFAULT_EVENT_FORM });
    setIsFormActive(true);
  };

  const handleCancel = () => {
    setSelectedEvent(null);
    setFormData({ ...DEFAULT_EVENT_FORM });
    setIsFormActive(false);
  };

  const handleFormChange = (updates: Partial<EventFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    const errors = validateEventForm(formData);
    if (errors.length > 0) {
      toast.error(errors[0]!);
      return;
    }

    const isDuplicate = events.some(e => e.title.trim() === formData.title.trim() && e.id !== selectedEvent?.id);
    if (isDuplicate) {
      toast.warning('이미 사용 중인 이벤트 이름입니다. 다른 이름을 입력해주세요.');
      return;
    }

    if (selectedEvent) {
      // 수정
      updateEvent.mutate(
        { id: selectedEvent.id, data: formData, existingStatus: selectedEvent.status },
        {
          onSuccess: () => {
            setSuccessDialog({ isOpen: true, eventName: formData.title, isNew: false });
          },
          onError: () => toast.error('이벤트 수정에 실패했습니다.'),
        },
      );
    } else {
      // 신규
      createEvent.mutate(formData, {
        onSuccess: () => {
          setSuccessDialog({ isOpen: true, eventName: formData.title, isNew: true });
        },
        onError: () => toast.error('이벤트 등록에 실패했습니다.'),
      });
    }
  };

  const handleDelete = () => {
    if (!selectedEvent) return;
    setDeleteTarget({ id: selectedEvent.id, name: selectedEvent.title });
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteEventMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        handleCancel();
        toast.success('이벤트가 삭제되었습니다.');
      },
      onError: () => toast.error('삭제에 실패했습니다.'),
    });
    setDeleteTarget(null);
  };

  const handleDuplicate = () => {
    if (!selectedEvent) return;
    duplicateEventMutation.mutate(selectedEvent.id, {
      onSuccess: () => {
        handleCancel();
        toast.success('이벤트가 복제되었습니다.');
      },
      onError: () => toast.error('복제에 실패했습니다.'),
    });
  };

  const handleCloseSuccessDialog = (addMore: boolean) => {
    setSuccessDialog({ isOpen: false, eventName: '', isNew: true });
    if (addMore) {
      handleNewEvent();
    } else {
      handleCancel();
    }
  };

  // ── 렌더링 ──

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
      {/* 좌측: 이벤트 목록 */}
      <Card className="h-fit">
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-txt-main">이벤트 목록</h2>
          <Button size="sm" onClick={handleNewEvent}>
            <PlusOutlined style={{ fontSize: 14, marginRight: 4 }} />
            추가
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 필터 */}
          <ToggleButtonGroup
            value={typeFilter}
            onChange={(val) => setTypeFilter(val as EventType | 'all')}
            options={EVENT_TYPE_FILTER_OPTIONS}
          />
          <ToggleButtonGroup
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as EventStatus | 'all')}
            options={EVENT_STATUS_FILTER_OPTIONS}
          />

          {/* 검색 */}
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="이벤트 검색..."
          />

          {/* 이벤트 목록 */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <Spinner text="로딩 중..." layout="center" />
            ) : events.length === 0 ? (
              <div className="py-8 text-center text-txt-muted text-sm">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? '검색 결과가 없습니다.'
                  : '등록된 이벤트가 없습니다.'}
              </div>
            ) : (
              events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isSelected={selectedEvent?.id === event.id}
                  onClick={() => handleSelectEvent(event)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 우측: 이벤트 폼 */}
      <div className="flex-1 min-w-0">
        {!isFormActive ? (
          <Card>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-16 text-txt-muted">
                <CalendarOutlined style={{ fontSize: 48 }} className="mb-4 opacity-30" />
                <p className="text-lg mb-2">이벤트를 선택하거나 새로 등록하세요</p>
                <p className="text-sm mb-6">왼쪽 목록에서 이벤트를 선택하면 상세 정보를 확인할 수 있습니다.</p>
                <Button onClick={handleNewEvent}>
                  <PlusOutlined style={{ fontSize: 16, marginRight: 8 }} />
                  새 이벤트 등록
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-txt-main">
                {selectedEvent ? '이벤트 수정' : '새 이벤트 등록'}
              </h2>
            </CardHeader>
            <CardContent>
              <EventForm
                formData={formData}
                onFormChange={handleFormChange}
                disabled={false}
                eventId={selectedEvent?.id}
                stats={selectedEvent?.stats}
                onSave={handleSave}
                onCancel={handleCancel}
                onDelete={selectedEvent ? handleDelete : undefined}
                onDuplicate={selectedEvent ? handleDuplicate : undefined}
                isEditMode={!!selectedEvent}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {/* 성공 다이얼로그 */}
      {successDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckOutlined style={{ fontSize: 32 }} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-txt-main mb-2">
                {successDialog.isNew ? '이벤트 등록 완료' : '이벤트 수정 완료'}
              </h3>
              <p className="text-txt-muted mb-6">
                &quot;{successDialog.eventName}&quot; 이벤트가 {successDialog.isNew ? '등록' : '수정'}되었습니다.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => handleCloseSuccessDialog(false)}>
                  목록으로
                </Button>
                {successDialog.isNew && (
                  <Button className="flex-1" onClick={() => handleCloseSuccessDialog(true)}>
                    추가 등록
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="이벤트 삭제"
        message={`"${deleteTarget?.name}" 이벤트를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
}

// ============================================
// 이벤트 카드 (목록 아이템)
// ============================================
function EventCard({
  event,
  isSelected,
  onClick,
}: {
  event: Event;
  isSelected: boolean;
  onClick: () => void;
}) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border cursor-pointer transition-all ${isSelected
        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
        : 'border-border hover:border-primary/50 hover:bg-bg-hover'
        }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <CalendarOutlined style={{ fontSize: 18 }} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-txt-main truncate">{event.title}</h4>
            <Badge variant={EVENT_STATUS_BADGE[event.status]} className="flex-shrink-0">
              {EVENT_STATUS_LABELS[event.status]}
            </Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={event.eventType === 'participation' ? 'info' : 'default'}>
              {EVENT_TYPE_LABELS[event.eventType]}
            </Badge>
            <span className="text-xs text-txt-muted">
              {formatDate(event.eventStartDate)} ~ {formatDate(event.eventEndDate)}
            </span>
          </div>
          {event.description && (
            <p className="text-xs text-txt-secondary line-clamp-1 mt-1">{event.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Entity → FormData 변환
// ============================================
function eventToFormData(event: Event): EventFormData {
  return {
    eventType: event.eventType,

    title: event.title,
    description: event.description,
    content: event.content,
    bannerImageUrl: event.bannerImageUrl,
    detailImageUrl: event.detailImageUrl,

    eventStartDate: event.eventStartDate,
    eventEndDate: event.eventEndDate,
    usePublishSchedule: !!event.publishDate,
    publishDate: event.publishDate ?? '',

    deepLink: event.deepLink,

    orderButtonEnabled: event.orderButtonEnabled,
    orderButtonLabel: event.orderButtonLabel,
    orderButtonLink: event.orderButtonLink,
    shareButtonEnabled: event.shareButtonEnabled,

    shareChannels: [...event.shareChannels],
    shareTitle: event.shareTitle,
    shareDescription: event.shareDescription,
    shareImageUrl: event.shareImageUrl,

    pushTitle: '',
    pushBody: '',

    collectionMode: event.collectionMode,
    formFields: [...event.formFields],
    consentRequired: event.consentRequired,
    thirdPartyConsentRequired: event.thirdPartyConsentRequired,
    consentText: event.consentText,
    thirdPartyConsentText: event.thirdPartyConsentText,
  };
}
