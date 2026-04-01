import React, { useState, useMemo } from 'react';
import {
  DownloadOutlined,
  FilterOutlined,
  SaveOutlined,
  ReloadOutlined,
} from '@ant-design/icons';

import { Card, Button, Badge, Spinner } from '@/components/ui';
import { useMemberSegment, useCampaignSummaries, useDirectExport } from '@/hooks/useMemberExtract';
import { useMemberGroups, useCreateGroup, useAddMembersToGroup } from '@/hooks/useMemberGroups';
import type { MemberSegmentFilter, SegmentFilterTab } from '@/types/member-segment';
import type { Member, MemberGrade, MemberStatus, Gender } from '@/types/member';
import type { ExportColumn } from '@/types/export';
import {
  DEFAULT_MEMBER_EXPORT_COLUMNS,
  MEMBER_STATUS_LABELS,
  GENDER_LABELS,
  SEGMENT_FILTER_TAB_LABELS,
} from '@/types';
import { getMemberGradeLabel, getGradeBadgeVariant } from '@/utils/memberGrade';

// 필터 탭 컴포넌트
const FilterTabs: React.FC<{
  activeTab: SegmentFilterTab;
  onTabChange: (tab: SegmentFilterTab) => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs: SegmentFilterTab[] = ['basic', 'order', 'marketing', 'advanced'];

  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === tab
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-muted hover:text-txt-main'
          }`}
        >
          {SEGMENT_FILTER_TAB_LABELS[tab]}
        </button>
      ))}
    </div>
  );
};

// 기본 정보 필터
const BasicFilter: React.FC<{
  filter: MemberSegmentFilter;
  onChange: (filter: Partial<MemberSegmentFilter>) => void;
}> = ({ filter, onChange }) => {
  const grades: MemberGrade[] = ['vip', 'gold', 'silver', 'bronze', 'normal'];
  const statuses: MemberStatus[] = ['active', 'inactive', 'withdrawn'];
  const genders: (Gender | 'all')[] = ['all', 'male', 'female'];

  const toggleGrade = (grade: MemberGrade) => {
    const current = filter.grades || [];
    const updated = current.includes(grade)
      ? current.filter((g) => g !== grade)
      : [...current, grade];
    onChange({ grades: updated.length > 0 ? updated : undefined });
  };

  const toggleStatus = (status: MemberStatus) => {
    const current = filter.statuses || [];
    const updated = current.includes(status)
      ? current.filter((s) => s !== status)
      : [...current, status];
    onChange({ statuses: updated.length > 0 ? updated : undefined });
  };

  return (
    <div className="space-y-4">
      {/* 등급 필터 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">회원 등급</label>
        <div className="flex flex-wrap gap-2">
          {grades.map((grade) => (
            <button
              key={grade}
              onClick={() => toggleGrade(grade)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                filter.grades?.includes(grade)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-txt-muted hover:border-primary'
              }`}
            >
              {getMemberGradeLabel(grade)}
            </button>
          ))}
        </div>
      </div>

      {/* 상태 필터 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">회원 상태</label>
        <div className="flex flex-wrap gap-2">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => toggleStatus(status)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                filter.statuses?.includes(status)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-txt-muted hover:border-primary'
              }`}
            >
              {MEMBER_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      {/* 성별 필터 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">성별</label>
        <div className="flex gap-2">
          {genders.map((gender) => (
            <button
              key={gender}
              onClick={() => onChange({ gender: gender === 'all' ? undefined : gender })}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                (gender === 'all' && !filter.gender) || filter.gender === gender
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-txt-muted hover:border-primary'
              }`}
            >
              {gender === 'all' ? '전체' : GENDER_LABELS[gender]}
            </button>
          ))}
        </div>
      </div>

      {/* 연령대 필터 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">연령대</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="최소"
            min={0}
            max={100}
            value={filter.ageRange?.minAge || ''}
            onChange={(e) =>
              onChange({
                ageRange: {
                  ...filter.ageRange,
                  minAge: e.target.value ? parseInt(e.target.value) : undefined,
                },
              })
            }
            className="w-20 px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-txt-muted">~</span>
          <input
            type="number"
            placeholder="최대"
            min={0}
            max={100}
            value={filter.ageRange?.maxAge || ''}
            onChange={(e) =>
              onChange({
                ageRange: {
                  ...filter.ageRange,
                  maxAge: e.target.value ? parseInt(e.target.value) : undefined,
                },
              })
            }
            className="w-20 px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-txt-muted">세</span>
        </div>
      </div>

      {/* 가입일 범위 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">가입일 범위</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={filter.registeredDateRange?.from || ''}
            onChange={(e) =>
              onChange({
                registeredDateRange: {
                  ...filter.registeredDateRange,
                  from: e.target.value || undefined,
                },
              })
            }
            className="px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-txt-muted">~</span>
          <input
            type="date"
            value={filter.registeredDateRange?.to || ''}
            onChange={(e) =>
              onChange({
                registeredDateRange: {
                  ...filter.registeredDateRange,
                  to: e.target.value || undefined,
                },
              })
            }
            className="px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>
      </div>
    </div>
  );
};

// 주문 조건 필터
const OrderFilter: React.FC<{
  filter: MemberSegmentFilter;
  onChange: (filter: Partial<MemberSegmentFilter>) => void;
}> = ({ filter, onChange }) => {
  return (
    <div className="space-y-4">
      {/* 주문 횟수 범위 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">주문 횟수</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="최소"
            min={0}
            value={filter.orderCountRange?.min ?? ''}
            onChange={(e) =>
              onChange({
                orderCountRange: {
                  ...filter.orderCountRange,
                  min: e.target.value ? parseInt(e.target.value) : undefined,
                },
              })
            }
            className="w-24 px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-txt-muted">~</span>
          <input
            type="number"
            placeholder="최대"
            min={0}
            value={filter.orderCountRange?.max ?? ''}
            onChange={(e) =>
              onChange({
                orderCountRange: {
                  ...filter.orderCountRange,
                  max: e.target.value ? parseInt(e.target.value) : undefined,
                },
              })
            }
            className="w-24 px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-txt-muted">회</span>
        </div>
      </div>

      {/* 총 주문 금액 범위 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">총 주문 금액</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="최소"
            min={0}
            step={10000}
            value={filter.orderAmountRange?.min ?? ''}
            onChange={(e) =>
              onChange({
                orderAmountRange: {
                  ...filter.orderAmountRange,
                  min: e.target.value ? parseInt(e.target.value) : undefined,
                },
              })
            }
            className="w-32 px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-txt-muted">~</span>
          <input
            type="number"
            placeholder="최대"
            min={0}
            step={10000}
            value={filter.orderAmountRange?.max ?? ''}
            onChange={(e) =>
              onChange({
                orderAmountRange: {
                  ...filter.orderAmountRange,
                  max: e.target.value ? parseInt(e.target.value) : undefined,
                },
              })
            }
            className="w-32 px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-txt-muted">원</span>
        </div>
      </div>

      {/* 미주문 기간 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">미주문 기간</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="일수"
            min={0}
            value={filter.noOrderDays ?? ''}
            onChange={(e) =>
              onChange({
                noOrderDays: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            className="w-24 px-3 py-1.5 text-sm border border-border rounded-lg focus:outline-none focus:border-primary"
          />
          <span className="text-txt-muted">일 이상 미주문</span>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onChange({ noOrderDays: 30 })}
            className={`px-3 py-1 text-xs rounded-full border ${
              filter.noOrderDays === 30 ? 'border-primary bg-primary text-white' : 'border-border text-txt-muted'
            }`}
          >
            1개월
          </button>
          <button
            onClick={() => onChange({ noOrderDays: 90 })}
            className={`px-3 py-1 text-xs rounded-full border ${
              filter.noOrderDays === 90 ? 'border-primary bg-primary text-white' : 'border-border text-txt-muted'
            }`}
          >
            3개월
          </button>
          <button
            onClick={() => onChange({ noOrderDays: 180 })}
            className={`px-3 py-1 text-xs rounded-full border ${
              filter.noOrderDays === 180 ? 'border-primary bg-primary text-white' : 'border-border text-txt-muted'
            }`}
          >
            6개월
          </button>
        </div>
      </div>
    </div>
  );
};

// 마케팅 필터
const MarketingFilter: React.FC<{
  filter: MemberSegmentFilter;
  onChange: (filter: Partial<MemberSegmentFilter>) => void;
}> = ({ filter, onChange }) => {
  const consentTypes = [
    { type: 'marketing' as const, label: '마케팅 수신' },
    { type: 'push' as const, label: '푸시 알림' },
    { type: 'sms' as const, label: 'SMS' },
    { type: 'email' as const, label: '이메일' },
  ];

  const toggleConsent = (type: 'marketing' | 'push' | 'sms' | 'email', agreed: boolean) => {
    const current = filter.consentFilters || [];
    const existing = current.find((c) => c.type === type);

    if (existing && existing.agreed === agreed) {
      // 이미 같은 값이면 제거
      onChange({
        consentFilters: current.filter((c) => c.type !== type),
      });
    } else {
      // 새로 설정
      onChange({
        consentFilters: [
          ...current.filter((c) => c.type !== type),
          { type, agreed },
        ],
      });
    }
  };

  const getConsentValue = (type: string): boolean | null => {
    const found = filter.consentFilters?.find((c) => c.type === type);
    return found ? found.agreed : null;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-txt-muted">수신 동의 여부로 회원을 필터링합니다.</p>

      {consentTypes.map((consent) => (
        <div key={consent.type} className="flex items-center gap-4">
          <span className="w-24 text-sm text-txt-main">{consent.label}</span>
          <div className="flex gap-2">
            <button
              onClick={() => toggleConsent(consent.type, true)}
              className={`px-3 py-1 text-sm rounded-full border ${
                getConsentValue(consent.type) === true
                  ? 'border-success bg-success/10 text-success'
                  : 'border-border text-txt-muted'
              }`}
            >
              동의
            </button>
            <button
              onClick={() => toggleConsent(consent.type, false)}
              className={`px-3 py-1 text-sm rounded-full border ${
                getConsentValue(consent.type) === false
                  ? 'border-critical bg-critical/10 text-critical'
                  : 'border-border text-txt-muted'
              }`}
            >
              미동의
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

// 고급 필터
const AdvancedFilter: React.FC<{
  filter: MemberSegmentFilter;
  onChange: (filter: Partial<MemberSegmentFilter>) => void;
}> = ({ filter, onChange }) => {
  const { campaigns } = useCampaignSummaries();
  const { groups } = useMemberGroups();

  const toggleCampaign = (campaignId: string) => {
    const current = filter.campaignFilter?.campaignIds || [];
    const updated = current.includes(campaignId)
      ? current.filter((id) => id !== campaignId)
      : [...current, campaignId];

    onChange({
      campaignFilter: updated.length > 0
        ? { ...filter.campaignFilter, campaignIds: updated, participated: true }
        : undefined,
    });
  };

  const toggleGroup = (groupId: string) => {
    const current = filter.groupIds || [];
    const updated = current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId];

    onChange({
      groupIds: updated.length > 0 ? updated : undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* 캠페인 참여 필터 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">캠페인 참여 회원</label>
        <div className="flex flex-wrap gap-2">
          {campaigns.map((campaign) => (
            <button
              key={campaign.id}
              onClick={() => toggleCampaign(campaign.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                filter.campaignFilter?.campaignIds?.includes(campaign.id)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-txt-muted hover:border-primary'
              }`}
            >
              {campaign.name}
            </button>
          ))}
        </div>
        {campaigns.length === 0 && (
          <p className="text-sm text-txt-muted">캠페인이 없습니다.</p>
        )}
      </div>

      {/* 그룹 필터 */}
      <div>
        <label className="block text-sm font-medium text-txt-main mb-2">회원 그룹</label>
        <div className="flex flex-wrap gap-2">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => toggleGroup(group.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                filter.groupIds?.includes(group.id)
                  ? 'border-primary bg-primary text-white'
                  : 'border-border text-txt-muted hover:border-primary'
              }`}
            >
              {group.name} ({group.memberCount}명)
            </button>
          ))}
        </div>
        {groups.length === 0 && (
          <p className="text-sm text-txt-muted">그룹이 없습니다.</p>
        )}
      </div>
    </div>
  );
};

// 결과 테이블
const ResultTable: React.FC<{
  members: Member[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
}> = ({ members, selectedIds, onToggleSelect, onToggleAll }) => {
  const allSelected = members.length > 0 && members.every((m) => selectedIds.has(m.id));

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const getStatusBadgeVariant = (status: MemberStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'withdrawn': return 'critical';
      default: return 'secondary';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="data-table">
        <thead>
          <tr>
            <th className="w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="rounded"
              />
            </th>
            <th>이름</th>
            <th>등급</th>
            <th>상태</th>
            <th>가입일</th>
            <th>최근접속</th>
            <th>주문수</th>
            <th>총주문금액</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(member.id)}
                  onChange={() => onToggleSelect(member.id)}
                  className="rounded"
                />
              </td>
              <td className="font-medium">{member.name}</td>
              <td>
                <Badge variant={getGradeBadgeVariant(member.grade)}>
                  {getMemberGradeLabel(member.grade)}
                </Badge>
              </td>
              <td>
                <Badge variant={getStatusBadgeVariant(member.status)}>
                  {MEMBER_STATUS_LABELS[member.status]}
                </Badge>
              </td>
              <td className="text-sm text-txt-secondary">{formatDate(member.registeredAt)}</td>
              <td className="text-sm text-txt-secondary">{formatDate(member.lastLoginAt)}</td>
              <td>{member.orderCount}건</td>
              <td>{formatCurrency(member.totalOrderAmount)}원</td>
            </tr>
          ))}
          {members.length === 0 && (
            <tr>
              <td colSpan={8} className="text-center text-txt-muted py-8">
                조건에 맞는 회원이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// 그룹 저장 모달
const SaveGroupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  memberIds: string[];
}> = ({ isOpen, onClose, memberIds }) => {
  const [mode, setMode] = useState<'new' | 'existing'>('new');
  const [groupName, setGroupName] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');

  const { groups } = useMemberGroups();
  const { createGroupAsync, isCreating } = useCreateGroup();
  const { addMembersAsync, isAdding } = useAddMembersToGroup();

  const handleSave = async () => {
    if (mode === 'new') {
      if (!groupName.trim()) return;
      const newGroup = await createGroupAsync({ name: groupName.trim() });
      await addMembersAsync({ groupId: newGroup.id, memberIds });
    } else {
      if (!selectedGroupId) return;
      await addMembersAsync({ groupId: selectedGroupId, memberIds });
    }
    onClose();
    setGroupName('');
    setSelectedGroupId('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-main rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4">
          그룹으로 저장 ({memberIds.length}명)
        </h3>

        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setMode('new')}
            className={`flex-1 py-2 text-sm rounded-lg border ${
              mode === 'new' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-txt-muted'
            }`}
          >
            새 그룹 생성
          </button>
          <button
            onClick={() => setMode('existing')}
            className={`flex-1 py-2 text-sm rounded-lg border ${
              mode === 'existing' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-txt-muted'
            }`}
          >
            기존 그룹에 추가
          </button>
        </div>

        {mode === 'new' ? (
          <input
            type="text"
            placeholder="그룹 이름"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        ) : (
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:border-primary"
          >
            <option value="">그룹 선택</option>
            {groups.map((group) => (
              <option key={group.id} value={group.id}>
                {group.name} ({group.memberCount}명)
              </option>
            ))}
          </select>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={isCreating || isAdding || (mode === 'new' ? !groupName.trim() : !selectedGroupId)}
          >
            {isCreating || isAdding ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// 내보내기 컬럼 선택 모달
const ExportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onExport: (columns: ExportColumn[], format: 'xlsx' | 'csv', reason: string) => void;
}> = ({ isOpen, onClose, onExport }) => {
  const [columns, setColumns] = useState<ExportColumn[]>(DEFAULT_MEMBER_EXPORT_COLUMNS);
  const [format, setFormat] = useState<'xlsx' | 'csv'>('xlsx');
  const [reason, setReason] = useState('');

  const toggleColumn = (key: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key ? { ...col, enabled: !col.enabled } : col
      )
    );
  };

  const handleExport = () => {
    if (!reason.trim()) return;
    onExport(columns, format, reason.trim());
    setReason('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-main rounded-lg shadow-xl w-full max-w-lg p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4">내보내기 설정</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-txt-main mb-2">파일 형식</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={format === 'xlsx'}
                onChange={() => setFormat('xlsx')}
                className="text-primary"
              />
              <span className="text-sm">Excel (.xlsx)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={format === 'csv'}
                onChange={() => setFormat('csv')}
                className="text-primary"
              />
              <span className="text-sm">CSV (.csv)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-txt-main mb-2">내보내기 항목</label>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {columns.map((col) => (
              <label key={col.key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={col.enabled}
                  onChange={() => toggleColumn(col.key)}
                  className="rounded text-primary"
                />
                <span className="text-sm">{col.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 내보내기 사유 (개인정보보호법 준수) */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-txt-main mb-2">
            내보내기 사유 <span className="text-danger">*</span>
          </label>
          <input
            type="text"
            placeholder="예: 마케팅 캠페인 대상자 추출"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <p className="text-xs text-txt-muted mt-1">개인정보보호법에 따라 다운로드 사유가 기록됩니다.</p>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleExport} disabled={!reason.trim()}>
            <DownloadOutlined className="mr-1" />
            내보내기
          </Button>
        </div>
      </div>
    </div>
  );
};

// 메인 컴포넌트
export const MemberExtract: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SegmentFilterTab>('basic');
  const [filter, setFilter] = useState<MemberSegmentFilter>({});
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const hasFilter = useMemo(() => {
    return Object.keys(filter).some((key) => {
      const value = filter[key as keyof MemberSegmentFilter];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some((v) => v !== undefined);
      }
      return value !== undefined;
    });
  }, [filter]);

  const { members, pagination, totalCount, isLoading } = useMemberSegment(
    hasFilter ? filter : { statuses: ['active'] }, // 기본값: 활성 회원
    page,
    10
  );

  const { exportToExcel, exportToCsv } = useDirectExport();

  const handleFilterChange = (updates: Partial<MemberSegmentFilter>) => {
    setFilter((prev) => {
      const newFilter = { ...prev };
      Object.entries(updates).forEach(([key, value]) => {
        if (value === undefined || (Array.isArray(value) && value.length === 0)) {
          delete newFilter[key as keyof MemberSegmentFilter];
        } else {
          (newFilter as Record<string, unknown>)[key] = value;
        }
      });
      return newFilter;
    });
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleReset = () => {
    setFilter({});
    setPage(1);
    setSelectedIds(new Set());
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleAll = () => {
    if (members.every((m) => selectedIds.has(m.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)));
    }
  };

  const handleExport = (columns: ExportColumn[], format: 'xlsx' | 'csv', reason: string) => {
    const targetMembers = selectedIds.size > 0
      ? members.filter((m) => selectedIds.has(m.id))
      : members;

    // 감사 로그: 내보내기 사유 기록 (개인정보보호법)
    // eslint-disable-next-line no-console
    console.info('[AUDIT] 회원 데이터 내보내기', {
      format,
      reason,
      count: targetMembers.length,
      columns: columns.filter((c) => c.enabled).map((c) => c.key),
      exportedAt: new Date().toISOString(),
    });

    if (format === 'xlsx') {
      exportToExcel(targetMembers, columns, '회원목록');
    } else {
      exportToCsv(targetMembers, columns, '회원목록');
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">회원데이터 추출</h1>
          <p className="text-sm text-txt-muted mt-1">
            세그먼트 조건으로 회원을 필터링하고 엑셀로 내보낼 수 있습니다.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowExportModal(true)}
            disabled={members.length === 0}
          >
            <DownloadOutlined className="mr-1" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

      {/* 필터 카드 */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FilterOutlined className="text-primary" />
            <span className="font-medium text-txt-main">세그먼트 조건</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <ReloadOutlined className="mr-1" />
            초기화
          </Button>
        </div>

        <FilterTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="p-4">
          {activeTab === 'basic' && <BasicFilter filter={filter} onChange={handleFilterChange} />}
          {activeTab === 'order' && <OrderFilter filter={filter} onChange={handleFilterChange} />}
          {activeTab === 'marketing' && <MarketingFilter filter={filter} onChange={handleFilterChange} />}
          {activeTab === 'advanced' && <AdvancedFilter filter={filter} onChange={handleFilterChange} />}
        </div>
      </Card>

      {/* 결과 카드 */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-medium text-txt-main">
              조회 결과: <span className="text-primary">{totalCount}명</span>
            </span>
            {selectedIds.size > 0 && (
              <span className="text-sm text-txt-muted">
                ({selectedIds.size}명 선택)
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGroupModal(true)}
            disabled={selectedIds.size === 0}
          >
            <SaveOutlined className="mr-1" />
            그룹으로 저장
          </Button>
        </div>

        {isLoading ? (
          <div className="p-8">
            <Spinner layout="center" />
          </div>
        ) : (
          <ResultTable
            members={members}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleAll={handleToggleAll}
          />
        )}

        {/* 페이지네이션 */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              이전
            </Button>
            <span className="px-4 py-2 text-sm text-txt-muted">
              {page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page === pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              다음
            </Button>
          </div>
        )}
      </Card>

      {/* 모달 */}
      <SaveGroupModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        memberIds={Array.from(selectedIds)}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
};
