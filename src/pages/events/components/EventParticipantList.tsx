/**
 * 이벤트 참여자 목록 컴포넌트
 */
import { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, SearchInput, Badge, Spinner, MaskedData, Pagination } from '@/components/ui';
import { useEventParticipants } from '@/hooks/useEvents';
import { PARTICIPANT_ACTION_LABELS } from '@/types/event';
import type { ParticipantActionType } from '@/types/event';

interface EventParticipantListProps {
  eventId: string;
}

const ACTION_FILTER_OPTIONS: { value: ParticipantActionType | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'page_view', label: '페이지 조회' },
  { value: 'order_click', label: '주문 클릭' },
  { value: 'share', label: '공유' },
];

const ACTION_BADGE_VARIANT: Record<ParticipantActionType, 'info' | 'success' | 'warning'> = {
  page_view: 'info',
  order_click: 'success',
  share: 'warning',
};

// 내보내기 사유 입력 모달
const ExportReasonModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  count: number;
}> = ({ isOpen, onClose, onConfirm, count }) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-main rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4">
          참여자 데이터 내보내기 ({count}명)
        </h3>
        <div>
          <label className="block text-sm font-medium text-txt-main mb-2">
            내보내기 사유 <span className="text-critical">*</span>
          </label>
          <input
            type="text"
            placeholder="예: 이벤트 당첨자 선별"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-txt-muted mt-1">
            개인정보보호법에 따라 다운로드 사유가 감사 로그에 기록됩니다.
          </p>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={!reason.trim()}>
            <DownloadOutlined className="mr-1" />
            내보내기
          </Button>
        </div>
      </div>
    </div>
  );
};

export function EventParticipantList({ eventId }: EventParticipantListProps) {
  const [keyword, setKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState<ParticipantActionType | 'all'>('all');
  const [page, setPage] = useState(1);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [limit, setLimit] = useState(20);

  const { data: participantData, isLoading } = useEventParticipants(eventId, {
    keyword,
    actionType: actionFilter === 'all' ? undefined : actionFilter,
    page,
    limit,
  });

  const participants = participantData?.data ?? [];
  const pagination = participantData?.pagination;
  const total = pagination?.total ?? 0;

  const handleExport = (reason: string) => {
    // 감사 로그: 개인정보 원본 내보내기 사유 기록 (개인정보보호법)
    // eslint-disable-next-line no-console
    console.info('[AUDIT] 이벤트 참여자 데이터 내보내기', {
      eventId,
      reason,
      count: participants.length,
      exportedAt: new Date().toISOString(),
    });

    // CSV 내보내기 - 원본 데이터 (암호화 해제)
    const csvContent = [
      '이름,전화번호,이메일,참여유형,참여일시,동의여부',
      ...participants.map(
        (p) =>
          `${p.memberName},${p.memberPhone},${p.memberEmail},${PARTICIPANT_ACTION_LABELS[p.actionType]},${new Date(p.participatedAt).toLocaleString('ko-KR')},${p.hasConsented ? '동의' : '미동의'}`,
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${eventId}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-3">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          참여자 목록 ({total}명)
        </span>
        <Button variant="outline" size="sm" onClick={() => setIsExportModalOpen(true)} disabled={participants.length === 0}>
          <DownloadOutlined className="mr-1" />
          CSV 내보내기
        </Button>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            value={keyword}
            onChange={(v) => { setKeyword(v); setPage(1); }}
            placeholder="이름, 전화번호, 이메일 검색..."
          />
        </div>
        <div className="flex gap-1">
          {ACTION_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setActionFilter(opt.value); setPage(1); }}
              className={`px-2.5 py-1 text-xs rounded-full transition-colors ${
                actionFilter === opt.value
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      {isLoading ? (
        <Spinner text="로딩 중..." layout="center" />
      ) : participants.length === 0 ? (
        <div className="py-8 text-center text-gray-400 text-sm">참여자가 없습니다.</div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 font-medium text-gray-600">이름</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">전화번호</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">이메일</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">참여 유형</th>
                <th className="text-left px-3 py-2 font-medium text-gray-600">참여일시</th>
                <th className="text-center px-3 py-2 font-medium text-gray-600">동의</th>
              </tr>
            </thead>
            <tbody>
              {participants.map((p) => (
                <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">
                    <MaskedData value={p.memberName} resource="events" aria-label="참여자 이름" />
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    <MaskedData value={p.memberPhone} resource="events" aria-label="참여자 전화번호" />
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    <MaskedData value={p.memberEmail} resource="events" aria-label="참여자 이메일" />
                  </td>
                  <td className="px-3 py-2">
                    <Badge variant={ACTION_BADGE_VARIANT[p.actionType]}>
                      {PARTICIPANT_ACTION_LABELS[p.actionType]}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {new Date(p.participatedAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-3 py-2 text-center">
                    {p.hasConsented ? (
                      <span className="text-green-600 text-xs">동의</span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {pagination && (
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              totalElements={total}
              limit={limit}
              onLimitChange={setLimit}
              unit="명"
            />
          )}
        </div>
      )}

      {/* 내보내기 사유 입력 모달 */}
      <ExportReasonModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExport}
        count={total}
      />
    </div>
  );
}
