import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  SearchOutlined,
  UserOutlined,
  ClockCircleOutlined,
  ShoppingOutlined,
} from '@ant-design/icons';

import {
  Card,
  Badge,
  SearchInput,
  MaskedData,
  Pagination,
} from '@/components/ui';
import { useAppMembers, useAppMemberStats } from '@/hooks';
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

export const AppMemberList: React.FC<AppMemberListProps> = ({ filter = 'all' }) => {
  const navigate = useNavigate();

  // 검색 및 필터 상태
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedGrades, setSelectedGrades] = useState<MemberGrade[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<MemberStatus[]>([]);
  const [page, setPage] = useState(1);
  const limit = 10;

  // 데이터 조회
  const { members, pagination, isLoading } = useAppMembers({
    filter,
    searchType,
    searchKeyword,
    grades: selectedGrades,
    statuses: selectedStatuses,
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
      case 'dormant':
        return 'default';
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

      {/* 검색 및 필터 */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* 검색 */}
          <div className="flex gap-2">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchType)}
              className="h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(MEMBER_SEARCH_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="flex-1">
              <SearchInput
                placeholder="검색어를 입력하세요..."
                value={searchKeyword}
                onChange={handleSearch}
              />
            </div>
          </div>

          {/* 필터 */}
          <div className="flex flex-wrap gap-4">
            {/* 등급 필터 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-txt-muted">등급:</span>
              <div className="flex gap-1">
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

            {/* 상태 필터 */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-txt-muted">상태:</span>
              <div className="flex gap-1">
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
          </div>
        </div>
      </Card>

      {/* 회원 목록 테이블 */}
      <Card>
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="text-txt-muted">로딩 중...</div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="text-txt-muted">
                    <SearchOutlined className="text-3xl mb-2 opacity-50" />
                    <p>조건에 맞는 회원이 없습니다.</p>
                  </div>
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr
                  key={member.id}
                  onClick={() => handleRowClick(member)}
                  className="hover:bg-bg-hover cursor-pointer"
                >
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
          unit="명"
        />
      </Card>
    </div>
  );
};
