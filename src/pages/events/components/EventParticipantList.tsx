/**
 * 이벤트 참여자 목록 컴포넌트
 */
import { useState } from 'react';
import { DownloadOutlined } from '@ant-design/icons';
import { Button, SearchInput, Badge, Spinner, MaskedData } from '@/components/ui';
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

export function EventParticipantList({ eventId }: EventParticipantListProps) {
  const [keyword, setKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState<ParticipantActionType | 'all'>('all');

  const { data: participantData, isLoading } = useEventParticipants(eventId, {
    keyword,
    actionType: actionFilter === 'all' ? undefined : actionFilter,
  });

  const participants = participantData?.data ?? [];
  const total = participantData?.pagination?.total ?? 0;

  const handleExport = () => {
    // CSV 내보내기 - 개인정보 마스킹 처리
    const maskPhone = (v: string) => v.replace(/^(\d{3})-(\d{4})-(\d{4})$/, '$1-****-$3');
    const maskEmail = (v: string) => {
      const [local, domain] = v.split('@');
      if (!local || !domain) return '****';
      const masked = local.length > 4 ? local.slice(0, 4) + '****' : local.slice(0, 1) + '***';
      return `${masked}@${domain}`;
    };
    const maskName = (v: string) => v.length > 1 ? v[0] + '*'.repeat(v.length - 1) : '***';

    const csvContent = [
      '이름,전화번호,이메일,참여유형,참여일시,동의여부',
      ...participants.map(
        (p) =>
          `${maskName(p.memberName)},${maskPhone(p.memberPhone)},${maskEmail(p.memberEmail)},${PARTICIPANT_ACTION_LABELS[p.actionType]},${new Date(p.participatedAt).toLocaleString('ko-KR')},${p.hasConsented ? '동의' : '미동의'}`,
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
        <Button variant="outline" size="sm" onClick={handleExport} disabled={participants.length === 0}>
          <DownloadOutlined className="mr-1" />
          CSV 내보내기
        </Button>
      </div>

      {/* 필터 */}
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <SearchInput
            value={keyword}
            onChange={setKeyword}
            placeholder="이름, 전화번호, 이메일 검색..."
          />
        </div>
        <div className="flex gap-1">
          {ACTION_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActionFilter(opt.value)}
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
        </div>
      )}
    </div>
  );
}
