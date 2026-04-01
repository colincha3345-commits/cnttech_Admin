/**
 * 매장 목록 페이지
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  DownOutlined,
} from '@ant-design/icons';

import { Card, Button, Badge, ConfirmDialog, SearchInput, DataTable, Pagination } from '@/components/ui';
import { POSBulkUploadModal } from './components/POSBulkUploadModal';
import { PGBulkUploadModal } from './components/PGBulkUploadModal';
import { useStoreList, useDeleteStore, useToast } from '@/hooks';
import {
  STORE_STATUS_LABELS,
  CONTRACT_STATUS_LABELS,
  REGIONS,
  type Store,
  type StoreStatus,
  type ContractStatus,
  type Region,
} from '@/types/store';

export const StoreList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [keyword, setKeyword] = useState('');
  const [regionFilter, setRegionFilter] = useState<Region | ''>('');
  const [statusFilter, setStatusFilter] = useState<StoreStatus | ''>('');
  const [contractFilter, setContractFilter] = useState<ContractStatus | ''>('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);
  const [isBulkMenuOpen, setIsBulkMenuOpen] = useState(false);
  const [isPOSUploadOpen, setIsPOSUploadOpen] = useState(false);
  const [isPGUploadOpen, setIsPGUploadOpen] = useState(false);
  const [limit, setLimit] = useState(10);
  const [sortKey, setSortKey] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (key: string, order: 'asc' | 'desc') => {
    setSortKey(key);
    setSortOrder(order);
    setPage(1);
  };

  const { data, isLoading } = useStoreList({
    region: regionFilter || undefined,
    status: statusFilter || undefined,
    contractStatus: contractFilter || undefined,
    keyword: keyword || undefined,
    page,
    limit,
  });
  const deleteStore = useDeleteStore();

  const stores = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteStore.mutateAsync(deleteTarget.id);
      toast.success('매장이 삭제되었습니다.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    }
  };

  const getStatusBadgeVariant = (status: StoreStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'pending':
        return 'info';
      case 'terminated':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  const getContractBadgeVariant = (status: ContractStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'critical';
      case 'pending_renewal':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">매장 관리</h1>
          <p className="text-sm text-txt-muted mt-1">
            가맹점 매장을 관리합니다. (총 {pagination?.total || 0}개)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* 일괄 업로드 드롭다운 */}
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setIsBulkMenuOpen(!isBulkMenuOpen)}
            >
              <UploadOutlined className="mr-1" />
              일괄 업로드
              <DownOutlined className="ml-1 text-xs" />
            </Button>
            {isBulkMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsBulkMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-44 bg-white border border-border rounded-lg shadow-lg z-20 py-1">
                  <button
                    onClick={() => {
                      setIsPOSUploadOpen(true);
                      setIsBulkMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-bg-hover"
                  >
                    POS 코드 일괄 업로드
                  </button>
                  <button
                    onClick={() => {
                      setIsPGUploadOpen(true);
                      setIsBulkMenuOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-bg-hover"
                  >
                    PG MID 일괄 업로드
                  </button>
                </div>
              </>
            )}
          </div>
          <Button onClick={() => navigate('/staff/stores/new')}>
            <PlusOutlined className="mr-1" />
            매장 추가
          </Button>
        </div>
      </div>

      {/* 필터 */}
      <Card className="p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap items-center gap-4">
          {/* 지역 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">지역:</span>
            <select
              value={regionFilter}
              onChange={(e) => {
                setRegionFilter(e.target.value as Region | '');
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {REGIONS.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          {/* 상태 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">상태:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as StoreStatus | '');
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {Object.entries(STORE_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 계약 상태 필터 */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-txt-muted">계약:</span>
            <select
              value={contractFilter}
              onChange={(e) => {
                setContractFilter(e.target.value as ContractStatus | '');
                setPage(1);
              }}
              className="h-9 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">전체</option>
              {Object.entries(CONTRACT_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* 검색 */}
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              value={keyword}
              onChange={setKeyword}
              placeholder="매장명, 점주명, 사업자번호로 검색"
              className="w-[300px]"
            />
          </div>

          <Button type="submit" variant="outline">
            검색
          </Button>
        </form>
      </Card>

      {/* 테이블 */}
      <Card className="overflow-hidden">
        <DataTable<Store>
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          columns={[
            {
              key: 'name',
              header: '매장명',
              sortable: true,
              className: 'whitespace-nowrap',
              render: (store) => <span className="font-medium text-txt-main">{store.name}</span>,
            },
            {
              key: 'region',
              header: '지역',
              sortable: true,
              className: 'whitespace-nowrap',
              render: (store) => <span className="text-sm text-txt-secondary">{store.address.region}</span>,
            },
            {
              key: 'ownerName',
              header: '점주명',
              sortable: true,
              className: 'whitespace-nowrap',
              render: (store) => <span className="text-sm">{store.owner.name}</span>,
            },
            {
              key: 'businessNumber',
              header: '사업자번호',
              sortable: true,
              className: 'whitespace-nowrap',
              render: (store) => <span className="text-sm text-txt-secondary font-mono">{store.business.businessNumber}</span>,
            },
            {
              key: 'status',
              header: '상태',
              sortable: true,
              className: 'whitespace-nowrap',
              render: (store) => (
                <Badge variant={getStatusBadgeVariant(store.status)}>
                  {STORE_STATUS_LABELS[store.status]}
                </Badge>
              ),
            },
            {
              key: 'contractStatus',
              header: '계약 상태',
              sortable: true,
              className: 'whitespace-nowrap',
              render: (store) => (
                <Badge variant={getContractBadgeVariant(store.contract.contractStatus)}>
                  {CONTRACT_STATUS_LABELS[store.contract.contractStatus]}
                </Badge>
              ),
            },
            {
              key: 'expirationDate',
              header: '계약 만료일',
              sortable: true,
              className: 'whitespace-nowrap',
              render: (store) => (
                <span className="text-sm text-txt-muted whitespace-nowrap">
                  {formatDate(store.contract.expirationDate)}
                </span>
              ),
            },
            {
              key: 'actions',
              header: '',
              className: 'whitespace-nowrap w-28',
              render: (store) => (
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/staff/stores/${store.id}`)}
                    title="상세보기"
                  >
                    <EyeOutlined />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/staff/stores/${store.id}/edit`)}
                    title="수정"
                  >
                    <EditOutlined />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(store)}
                    title="삭제"
                    className="text-critical hover:text-critical"
                  >
                    <DeleteOutlined />
                  </Button>
                </div>
              ),
            },
          ]}
          data={stores}
          isLoading={isLoading}
          keyExtractor={(store) => store.id}
          onRowClick={(store) => navigate(`/staff/stores/${store.id}`)}
          emptyMessage="등록된 매장이 없습니다."
        />


        {/* 페이지네이션 */}
        {pagination && (
          <div className="p-4 bg-white border-t border-border">
            <Pagination
              page={page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
              totalElements={pagination.total}
              limit={limit}
              onLimitChange={setLimit}
              className="mt-0 pt-0 border-t-0"
            />
          </div>
        )}
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="매장 삭제"
        message={`'${deleteTarget?.name}' 매장을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />

      {/* POS 일괄 업로드 모달 */}
      <POSBulkUploadModal
        isOpen={isPOSUploadOpen}
        onClose={() => setIsPOSUploadOpen(false)}
      />

      {/* PG 일괄 업로드 모달 */}
      <PGBulkUploadModal
        isOpen={isPGUploadOpen}
        onClose={() => setIsPGUploadOpen(false)}
      />
    </div>
  );
};
