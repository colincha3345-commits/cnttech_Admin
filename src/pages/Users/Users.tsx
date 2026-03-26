import {
  FilterOutlined,
  UserAddOutlined,
  TeamOutlined,
  UploadOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { useState, useMemo } from 'react';

import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/Badge';
import { MaskedData } from '@/components/ui/MaskedData';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import { useUsers } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';

import { formatDate } from '@/utils/date';
import type { User } from '@/types';

export function Users() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { users, total, isLoading, unmaskData } = useUsers({
    query: debouncedSearchQuery,
  });

  const handleSingleAdd = () => {
    console.log('단일 사용자 추가');
    // TODO: 단일 사용자 추가 모달 열기
  };

  const handleBulkAdd = () => {
    console.log('일괄 추가');
    // TODO: 일괄 추가 모달 열기
  };

  const handleCSVUpload = () => {
    console.log('CSV 업로드');
    // TODO: CSV 업로드 모달 열기
  };

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: '이름',
        render: (user: User) => (
          <span className="font-medium text-txt-main">{user.name}</span>
        ),
      },
      {
        key: 'email',
        header: '이메일',
        render: (user: User) => (
          <span className="text-txt-muted">{user.email}</span>
        ),
      },
      {
        key: 'phone',
        header: '연락처',
        render: (user: User) => (
          <MaskedData
            value={user.phone}
            onUnmask={async () => {
              await unmaskData({ userId: user.id, field: 'phone' });
            }}
          />
        ),
      },
      {
        key: 'status',
        header: '상태',
        render: (user: User) => <StatusBadge status={user.status} />,
      },
      {
        key: 'lastLoginAt',
        header: '최근 접속',
        render: (user: User) => (
          <span className="text-sm text-txt-muted">
            {user.lastLoginAt ? formatDate(user.lastLoginAt) : '-'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: '',
        render: (_user: User) => (
          <Button variant="ghost" size="sm">
            상세
          </Button>
        ),
      },
    ],
    [unmaskData]
  );

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <div className="flex-1 sm:w-80">
            <SearchInput
              placeholder="이름 또는 이메일로 검색..."
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <Button variant="secondary" className="btn-icon">
            <FilterOutlined style={{ fontSize: 16 }} />
          </Button>
        </div>
        <DropdownMenu
          trigger={
            <Button variant="primary">
              <UserAddOutlined style={{ fontSize: 16, marginRight: 8 }} />
              사용자 추가
              <DownOutlined style={{ fontSize: 12, marginLeft: 8 }} />
            </Button>
          }
        >
          <DropdownMenuLabel>사용자 추가 방식</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleSingleAdd}>
            <UserAddOutlined style={{ fontSize: 16, marginRight: 8 }} />
            단일 사용자 추가
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleBulkAdd}>
            <TeamOutlined style={{ fontSize: 16, marginRight: 8 }} />
            일괄 추가
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCSVUpload}>
            <UploadOutlined style={{ fontSize: 16, marginRight: 8 }} />
            CSV 업로드
          </DropdownMenuItem>
        </DropdownMenu>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-txt-main">
              사용자 목록
            </h2>
            <span className="text-sm text-txt-muted">
              총 {total}명
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable<User>
            columns={columns}
            data={users}
            keyExtractor={(user) => user.id}
            isLoading={isLoading}
            emptyMessage="검색 결과가 없습니다."
          />
        </CardContent>
      </Card>
    </div>
  );
}
