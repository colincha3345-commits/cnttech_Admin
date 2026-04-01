import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Badge,
  Button,
  SearchInput,
  MaskedData,
  Pagination,
  SortableHeader,
} from '@/components/ui';
import { useAppMembers, useAppMemberStats } from '@/hooks';
import { useTableSort } from '@/hooks/useTableSort';
import { useMemberGroups } from '@/hooks/useMemberGroups';
import { GroupFormModal } from '@/pages/AppMembers/components/GroupFormModal';
import type { MemberListFilter } from '@/types/app-member';
import type { Member, MemberGrade, MemberStatus } from '@/types/member';
import {
  MEMBER_GRADE_LABELS,
  MEMBER_STATUS_LABELS,
  MEMBER_SEARCH_TYPE_LABELS,
  MEMBER_LIST_FILTER_LABELS,
} from '@/types';
import { getMemberGradeLabel, getGradeBadgeVariant } from '@/utils/memberGrade';

interface AppMemberListProps {
  filter?: MemberListFilter;
}

// 검색 타입
type SearchType = 'all' | 'name' | 'memberId' | 'phone' | 'email';
type DateType = 'registeredAt' | 'lastLoginAt' | 'lastOrderDate';

const DATE_TYPE_LABELS: Record<DateType, string> = {
  registeredAt: '가입일',
  lastLoginAt: '최근 접속일',
  lastOrderDate: '최근 주문일',
};

export const AppMemberList: React.FC<AppMemberListProps> = ({ filter = 'all' }) => {
  const navigate = useNavigate();

  // 검색 및 필터 상태
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<MemberGrade[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<MemberStatus[]>([]);
  const [dateType, setDateType] = useState<DateType>('registeredAt');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // 체크박스 선택
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 그룹 생성 모달
  const [showGroupModal, setShowGroupModal] = useState(false);
  const { groups } = useMemberGroups();

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleToggleAll = () => {
    if (members.length > 0 && members.every((m) => selectedIds.has(m.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map((m) => m.id)));
    }
  };

  const handleGroupCreateSuccess = () => {
    setShowGroupModal(false);
    setSelectedIds(new Set());
  };

  // 소팅
  const { sortKey, sortOrder, handleSort, sortData } = useTableSort<Member>();

  // 데이터 조회
  const { members, pagination, isLoading } = useAppMembers({
    filter,
    searchType,
    searchKeyword,
    grades: selectedGrades,
    statuses: selectedStatuses,
    dateType: dateFrom || dateTo ? dateType : undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    page,
    limit,
  });

  const { stats } = useAppMemberStats();

  // 날짜 포맷
  const formatDate = (date: Date | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR');
  };

  // 금액 포맷
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 상태별 Badge 색상
  const getStatusBadgeVariant = (status: MemberStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'withdrawn':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  // 회원 상세 페이지로 이동
  const handleRowClick = (member: Member) => {
    navigate(`/app-members/${member.id}`);
  };

  // 검색 핸들러
  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    setPage(1);
  };

  // 등급 필터 토글
  const toggleGradeFilter = (grade: MemberGrade) => {
    setSelectedGrades((prev) =>
      prev.includes(grade) ? prev.filter((g) => g !== grade) : [...prev, grade]
    );
    setPage(1);
  };

  // 상태 필터 토글
  const toggleStatusFilter = (status: MemberStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
    setPage(1);
  };

  // 테이블 컬럼 정의
  const columns = [
    {
      key: 'name',
      header: '이름',
      render: (member: Member) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <UserOutlined className="text-primary text-sm" />
          </div>
          <div>
            <p className="font-medium text-txt-main">{member.name}</p>
            <p className="text-xs text-txt-muted">{member.memberId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grade',
      header: '등급',
      render: (member: Member) => (
        <Badge variant={getGradeBadgeVariant(member.grade)}>
          {getMemberGradeLabel(member.grade)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: '상태',
      render: (member: Member) => (
        <Badge variant={getStatusBadgeVariant(member.status)}>
          {MEMBER_STATUS_LABELS[member.status]}
        </Badge>
      ),
    },
    {
      key: 'phone',
      header: '연락처',
      render: (member: Member) => (
        <MaskedData value={member.phone} />
      ),
    },
    {
      key: 'registeredAt',
      header: '가입일',
      render: (member: Member) => formatDate(member.registeredAt),
    },
    {
      key: 'lastLoginAt',
      header: '최근 접속',
      render: (member: Member) => formatDate(member.lastLoginAt),
    },
    {
      key: 'orderCount',
      header: '주문 수',
      render: (member: Member) => `${member.orderCount}건`,
    },
    {
      key: 'totalOrderAmount',
      header: '총 주문금액',
      render: (member: Member) => `${formatCurrency(member.totalOrderAmount)}원`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-txt-main">
          {MEMBER_LIST_FILTER_LABELS[filter]}
        </h1>
        <p className="text-sm text-txt-muted mt-1">
          앱 회원을 조회하고 관리합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className={`p-4 cursor-pointer transition-all hover:border-primary ${
            filter === 'all' ? 'border-primary bg-primary/5' : ''
          }`}
          onClick={() => navigate('/app-members')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserOutlined className="text-primary text-lg" />
            </div>
            <div>
              <p className="text-sm text-txt-muted">전체회원</p>
              <p className="text-2xl font-bold text-txt-main">
                {formatCurrency(stats.total)}
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all hover:border-warning ${
            filter === 'inactive_90days' ? 'border-warning bg-warning/5' : ''
          }`}
          onClick={() => navigate('/app-members/inactive')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ClockCircleOutlined className="text-warning text-lg" />
            </div>
            <div>
              <p className="text-sm text-txt-muted">3개월이상 미접속</p>
              <p className="text-2xl font-bold text-warning">
                {formatCurrency(stats.inactive90Days)}
              </p>
            </div>
          </div>
        </Card>

        <Card
          className={`p-4 cursor-pointer transition-all hover:border-critical ${
            filter === 'no_order' ? 'border-critical bg-critical/5' : ''
          }`}
          onClick={() => navigate('/app-members/no-order')}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-critical/10 flex items-center justify-center">
              <ShoppingOutlined className="text-critical text-lg" />
            </div>
            <div>
              <p className="text-sm text-txt-muted">미주문회원</p>
              <p className="text-2xl font-bold text-critical">
                {formatCurrency(stats.noOrder)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 검색 필터 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-txt-main flex items-center gap-2">
              <SearchOutlined />
              회원 검색
            </h3>
            <Button variant="ghost" size="sm" onClick={() => {
              setSearchType('all');
              setSearchKeyword('');
              setSelectedGrades([]);
              setSelectedStatuses([]);
              setDateType('registeredAt');
              setDateFrom('');
              setDateTo('');
              setPage(1);
            }}>
              초기화
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 검색 유형 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">검색 유형</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as SearchType)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {Object.entries(MEMBER_SEARCH_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 등급 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">등급</label>
              <div className="flex flex-wrap gap-1 min-h-[38px] items-center">
                {(Object.entries(MEMBER_GRADE_LABELS) as [MemberGrade, string][]).map(
                  ([grade, label]) => (
                    <button
                      key={grade}
                      onClick={() => toggleGradeFilter(grade)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        selectedGrades.includes(grade)
                          ? 'border-primary bg-primary text-white'
                          : 'border-border text-txt-muted hover:border-primary'
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">상태</label>
              <div className="flex flex-wrap gap-1 min-h-[38px] items-center">
                {(Object.entries(MEMBER_STATUS_LABELS) as [MemberStatus, string][]).map(
                  ([status, label]) => (
                    <button
                      key={status}
                      onClick={() => toggleStatusFilter(status)}
                      className={`px-3 py-1 text-xs rounded-full border transition-all ${
                        selectedStatuses.includes(status)
                          ? 'border-primary bg-primary text-white'
                          : 'border-border text-txt-muted hover:border-primary'
                      }`}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* 날짜 유형 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">날짜 유형</label>
              <select
                value={dateType}
                onChange={(e) => { setDateType(e.target.value as DateType); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {Object.entries(DATE_TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            {/* 시작일 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">시작일</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* 종료일 */}
            <div>
              <label className="block text-xs font-medium text-txt-muted mb-1">종료일</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* 검색어 */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-txt-muted mb-1">검색</label>
              <SearchInput
                placeholder="이름, 회원ID, 연락처, 이메일로 검색"
                value={searchKeyword}
                onChange={handleSearch}
                onSearch={() => setPage(1)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 선택 액션 바 */}
      {selectedIds.size > 0 && (
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-txt-main">
              {selectedIds.size}명 선택됨
            </span>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={() => setShowGroupModal(true)}>
                <TeamOutlined className="mr-1" />
                그룹 생성
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
                선택 해제
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 회원 목록 테이블 */}
      <Card>
        <table className="data-table">
          <thead>
            <tr>
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={members.length > 0 && members.every((m) => selectedIds.has(m.id))}
                  onChange={handleToggleAll}
                  className="rounded border-border"
                />
              </th>
              {columns.map((column) => (
                <SortableHeader
                  key={column.key}
                  label={column.header}
                  sortKey={column.key}
                  currentSortKey={sortKey}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-12">
                  <div className="text-txt-muted">로딩 중...</div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-12">
                  <div className="text-txt-muted">
                    <SearchOutlined className="text-3xl mb-2 opacity-50" />
                    <p>조건에 맞는 회원이 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortData(members).map((member) => (
                <tr
                  key={member.id}
                  onClick={() => handleRowClick(member)}
                  className="hover:bg-bg-hover cursor-pointer"
                >
                  <td onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(member.id)}
                      onChange={() => handleToggleSelect(member.id)}
                      className="rounded border-border"
                    />
                  </td>
                  {columns.map((column) => (
                    <td key={column.key} data-label={column.header}>
                      {column.render(member)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 페이지네이션 */}
        <Pagination
          page={page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
          totalElements={pagination.total}
          limit={limit}
          onLimitChange={setLimit}
          unit="명"
        />
      </Card>

      {/* 그룹 생성 모달 */}
      <GroupFormModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
        groups={groups}
        onSuccess={handleGroupCreateSuccess}
        initialMemberIds={Array.from(selectedIds)}
      />
    </div>
  );
};
