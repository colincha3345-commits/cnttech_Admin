import React, { useState } from 'react';
import {
  UserOutlined,
  CloseOutlined,
  SearchOutlined,
  FilterOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';

import { Badge } from './Badge';
import { useMemberSelector } from './useMemberSelector';
import type {
  MemberGrade,
  MemberSearchFilter,
} from '@/types/member';
import {
  MEMBER_GRADE_LABELS,
  MEMBER_STATUS_LABELS,
  MEMBER_SEARCH_TYPE_LABELS,
} from '@/types/member';
import { getMemberGradeLabel, getGradeBadgeVariant } from '@/utils/memberGrade';

interface MemberSelectorProps {
  selectedMemberIds: string[];
  onChange: (memberIds: string[]) => void;
  disabled?: boolean;
  maxSelect?: number;
  title?: string;
  description?: string;
}

// 등급별 색상
const GRADE_COLORS: Record<MemberGrade, string> = {
  vip: 'text-amber-500',
  gold: 'text-yellow-600',
  silver: 'text-gray-400',
  bronze: 'text-orange-700',
  normal: 'text-txt-muted',
};


export const MemberSelector: React.FC<MemberSelectorProps> = ({
  selectedMemberIds,
  onChange,
  disabled = false,
  maxSelect,
  title = '회원 선택',
  description,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const { filter, setFilter, filteredMembers, getMemberById } = useMemberSelector();

  // 회원 토글
  const handleToggleMember = (memberId: string) => {
    if (disabled) return;

    if (selectedMemberIds.includes(memberId)) {
      onChange(selectedMemberIds.filter((id) => id !== memberId));
    } else {
      if (maxSelect && selectedMemberIds.length >= maxSelect) {
        return;
      }
      onChange([...selectedMemberIds, memberId]);
    }
  };

  // 회원 제거
  const handleRemoveMember = (memberId: string) => {
    if (disabled) return;
    onChange(selectedMemberIds.filter((id) => id !== memberId));
  };

  // 전체 선택/해제
  const handleSelectAll = () => {
    if (disabled) return;
    const allFilteredIds = filteredMembers.map((m) => m.id);
    const newSelected = [...new Set([...selectedMemberIds, ...allFilteredIds])];
    if (maxSelect && newSelected.length > maxSelect) {
      onChange(newSelected.slice(0, maxSelect));
    } else {
      onChange(newSelected);
    }
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    const filteredIds = new Set(filteredMembers.map((m) => m.id));
    onChange(selectedMemberIds.filter((id) => !filteredIds.has(id)));
  };

  // 금액 포맷
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  const canSelectMore = !maxSelect || selectedMemberIds.length < maxSelect;

  // 등급 토글
  const toggleGrade = (grade: MemberGrade) => {
    const currentGrades = filter.grades || [];
    if (currentGrades.includes(grade)) {
      setFilter({ ...filter, grades: currentGrades.filter((g) => g !== grade) });
    } else {
      setFilter({ ...filter, grades: [...currentGrades, grade] });
    }
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilter({
      searchType: 'all',
      searchKeyword: '',
      grades: [],
      statuses: ['active'],
      orderCountMin: undefined,
      orderCountMax: undefined,
    });
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-txt-main">{title}</p>
          {description && (
            <p className="text-xs text-txt-muted mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {maxSelect && (
            <span className={`text-sm ${selectedMemberIds.length >= maxSelect ? 'text-warning font-medium' : 'text-txt-muted'}`}>
              {selectedMemberIds.length} / {maxSelect}명
            </span>
          )}
          {!maxSelect && selectedMemberIds.length > 0 && (
            <span className="text-sm text-txt-muted">
              {selectedMemberIds.length}명 선택
            </span>
          )}
        </div>
      </div>

      {/* 선택된 회원 목록 */}
      {selectedMemberIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMemberIds.slice(0, 10).map((memberId) => {
            const member = getMemberById(memberId);
            return (
              <div
                key={memberId}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full"
              >
                <CrownOutlined className={GRADE_COLORS[member?.grade || 'normal']} style={{ fontSize: 12 }} />
                <span className="text-sm text-txt-main">
                  {member?.name || memberId}
                </span>
                <span className="text-xs text-txt-muted">
                  ({member?.memberId})
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(memberId)}
                    className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                  >
                    <CloseOutlined style={{ fontSize: 10 }} className="text-primary" />
                  </button>
                )}
              </div>
            );
          })}
          {selectedMemberIds.length > 10 && (
            <span className="text-sm text-txt-muted px-2 py-1">
              +{selectedMemberIds.length - 10}명 더
            </span>
          )}
        </div>
      )}

      {/* 회원 선택 영역 */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* 검색 헤더 */}
        <div className="px-4 py-3 bg-bg-hover border-b border-border">
          <div className="flex items-center gap-3">
            {/* 검색 타입 선택 */}
            <select
              value={filter.searchType}
              onChange={(e) => setFilter({ ...filter, searchType: e.target.value as MemberSearchFilter['searchType'] })}
              disabled={disabled}
              className="text-sm border border-border rounded px-2 py-1.5 bg-bg-main"
            >
              {Object.entries(MEMBER_SEARCH_TYPE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            {/* 검색 입력 */}
            <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-bg-main border border-border rounded">
              <SearchOutlined className="text-txt-muted" style={{ fontSize: 14 }} />
              <input
                type="text"
                placeholder={filter.searchType === 'all' ? '이름, 아이디, 전화번호, 이메일로 검색...' : `${MEMBER_SEARCH_TYPE_LABELS[filter.searchType || 'all']}으로 검색...`}
                value={filter.searchKeyword || ''}
                onChange={(e) => {
                  setFilter({ ...filter, searchKeyword: e.target.value });
                  if (!isExpanded) setIsExpanded(true);
                }}
                disabled={disabled}
                className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-txt-muted disabled:cursor-not-allowed"
              />
            </div>

            {/* 필터 토글 */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded transition-colors ${showFilters ? 'bg-primary/10 text-primary' : 'hover:bg-hover text-txt-muted'}`}
            >
              <FilterOutlined style={{ fontSize: 16 }} />
            </button>

            {/* 펼치기/접기 */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-txt-muted hover:text-txt-main"
            >
              {isExpanded ? '접기' : '펼치기'}
            </button>
          </div>

          {/* 필터 패널 */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-border space-y-3">
              {/* 등급 필터 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-txt-muted w-16">등급:</span>
                <div className="flex flex-wrap gap-1">
                  {(Object.entries(MEMBER_GRADE_LABELS) as [MemberGrade, string][]).map(([grade, label]) => (
                    <button
                      key={grade}
                      type="button"
                      onClick={() => toggleGrade(grade)}
                      className={`px-2 py-0.5 text-xs rounded-full transition-colors ${
                        filter.grades?.includes(grade)
                          ? 'bg-primary text-white'
                          : 'bg-bg-main border border-border hover:border-primary'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 가입일 범위 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-txt-muted w-16">가입일:</span>
                <input
                  type="date"
                  value={filter.registeredFrom || ''}
                  onChange={(e) => setFilter({ ...filter, registeredFrom: e.target.value })}
                  className="text-xs border border-border rounded px-2 py-1 bg-bg-main"
                />
                <span className="text-xs text-txt-muted">~</span>
                <input
                  type="date"
                  value={filter.registeredTo || ''}
                  onChange={(e) => setFilter({ ...filter, registeredTo: e.target.value })}
                  className="text-xs border border-border rounded px-2 py-1 bg-bg-main"
                />
              </div>

              {/* 주문 횟수 범위 */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-txt-muted w-16">주문횟수:</span>
                <input
                  type="number"
                  placeholder="최소"
                  value={filter.orderCountMin ?? ''}
                  onChange={(e) => setFilter({ ...filter, orderCountMin: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-20 text-xs border border-border rounded px-2 py-1 bg-bg-main"
                />
                <span className="text-xs text-txt-muted">~</span>
                <input
                  type="number"
                  placeholder="최대"
                  value={filter.orderCountMax ?? ''}
                  onChange={(e) => setFilter({ ...filter, orderCountMax: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-20 text-xs border border-border rounded px-2 py-1 bg-bg-main"
                />
                <span className="text-xs text-txt-muted">회</span>
              </div>

              {/* 필터 초기화 */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-txt-muted hover:text-txt-main"
                >
                  필터 초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 회원 목록 */}
        {isExpanded && (
          <>
            {/* 일괄 선택 */}
            <div className="flex items-center justify-between px-4 py-2 bg-bg-main border-b border-border">
              <span className="text-xs text-txt-muted">
                검색 결과: {filteredMembers.length}명
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  disabled={disabled || !canSelectMore}
                  className="text-xs text-primary hover:underline disabled:opacity-50"
                >
                  전체 선택
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  disabled={disabled}
                  className="text-xs text-txt-muted hover:underline disabled:opacity-50"
                >
                  전체 해제
                </button>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-border">
              {filteredMembers.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <UserOutlined style={{ fontSize: 24 }} className="text-txt-muted mb-2" />
                  <p className="text-sm text-txt-muted">검색 결과가 없습니다</p>
                </div>
              ) : (
                filteredMembers.map((member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  const cannotSelect = !canSelectMore && !isSelected;

                  return (
                    <label
                      key={member.id}
                      className={`
                        flex items-center gap-3 px-4 py-3 transition-colors
                        ${isSelected ? 'bg-primary/5' : 'hover:bg-hover'}
                        ${disabled || cannotSelect ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleMember(member.id)}
                        disabled={disabled || cannotSelect}
                        className="sr-only"
                      />
                      <div
                        className={`
                          flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0
                          transition-colors duration-200
                          ${isSelected ? 'border-primary bg-primary' : 'border-border-strong'}
                        `}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                            <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                          </svg>
                        )}
                      </div>

                      {/* 회원 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <CrownOutlined className={GRADE_COLORS[member.grade]} style={{ fontSize: 12 }} />
                          <span className="text-sm font-medium text-txt-main">{member.name}</span>
                          <Badge variant={getGradeBadgeVariant(member.grade)}>
                            {getMemberGradeLabel(member.grade)}
                          </Badge>
                          {member.status !== 'active' && (
                            <Badge variant="secondary">
                              {MEMBER_STATUS_LABELS[member.status]}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-txt-muted">
                          <span>@{member.memberId}</span>
                          <span>·</span>
                          <span>주문 {member.orderCount}회</span>
                          <span>·</span>
                          <span>가입 {format(member.registeredAt, 'yyyy.MM.dd')}</span>
                        </div>
                      </div>

                      {/* 주문 금액 */}
                      <div className="text-right">
                        <p className="text-sm text-txt-main font-medium">
                          {formatAmount(member.totalOrderAmount)}원
                        </p>
                        <p className="text-xs text-txt-muted">누적 주문</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* 빈 상태 안내 */}
      {selectedMemberIds.length === 0 && !isExpanded && (
        <div className="text-center py-2">
          <p className="text-xs text-txt-muted">
            위 영역을 클릭하여 회원을 검색하고 선택하세요
            {maxSelect && ` (최대 ${maxSelect}명)`}
          </p>
        </div>
      )}
    </div>
  );
};
