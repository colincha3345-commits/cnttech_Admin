import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DownloadOutlined,
    DollarOutlined,
    CalculatorOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
} from '@ant-design/icons';
import {
    Card,
    CardContent,
    Button,
    SearchInput,
    DataTable,
    Pagination,
} from '@/components/ui';
import { useSettlements, useRunSettlement } from '@/hooks/useSettlement';

import type { Settlement, SettlementStatus } from '@/types/settlement';

const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
    pending: '정산전',
    completed: '정산완료',
};

export function SettlementList() {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [status, setStatus] = useState<SettlementStatus | ''>('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(20);
    const [sortKey, setSortKey] = useState<string>('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    const handleSort = (key: string, order: 'asc' | 'desc') => {
        setSortKey(key);
        setSortOrder(order);
        setPage(1);
    };

    const { settlements, pagination, isLoading, fetchSettlements } = useSettlements();
    const runSettlement = useRunSettlement();

    const handleSearch = () => {
        setPage(1);
        fetchSettlements({ keyword, status, page: 1, limit });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchSettlements({ keyword, status, page: newPage, limit });
    };

    const handleStatusChange = (newStatus: SettlementStatus | '') => {
        setStatus(newStatus);
        setPage(1);
        fetchSettlements({ keyword, status: newStatus, page: 1, limit });
    };

    const handleRunSettlement = () => {
        if (!window.confirm('현재 대상에 대한 정산을 실행하시겠습니까?')) return;
        runSettlement.mutate(undefined, {
            onSuccess: () => fetchSettlements({ keyword, status, page, limit }),
        });
    };

    const totalNet = useMemo(() =>
        settlements.reduce((acc, curr) => acc + curr.netAmount, 0),
        [settlements]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-txt-main">가맹점 정산 관리</h1>
                <Button variant="outline">
                    <span className="flex items-center gap-2">
                        <DownloadOutlined /> 내역 다운로드
                    </span>
                </Button>
            </div>

            {/* 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">이번 회차 총 정산액</p>
                                <h3 className="text-2xl font-bold text-blue-900">
                                    ₩{totalNet.toLocaleString()}
                                </h3>
                            </div>
                            <DollarOutlined style={{ fontSize: 32 }} className="text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-txt-muted mb-1">정산 대기건</p>
                                <h3 className="text-2xl font-bold text-txt-main">
                                    {settlements.filter(s => s.status === 'pending').length}건
                                </h3>
                            </div>
                            <ClockCircleOutlined style={{ fontSize: 32 }} className="text-border" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-txt-muted mb-1">정산 완료건 (당월)</p>
                                <h3 className="text-2xl font-bold text-txt-main">
                                    {settlements.filter(s => s.status === 'completed').length}건
                                </h3>
                            </div>
                            <CheckCircleOutlined style={{ fontSize: 32 }} className="text-border" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 필터 섹션 */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <SearchInput
                            placeholder="가맹점명 또는 정산 ID 검색"
                            value={keyword}
                            onChange={(val) => setKeyword(val)}
                            onSearch={handleSearch}
                        />
                    </div>
                    <div className="w-full md:w-48 text-left">
                        <label className="block text-xs font-medium text-txt-muted mb-1">정산 상태</label>
                        <select
                            className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                            value={status}
                            onChange={(e) => handleStatusChange(e.target.value as SettlementStatus | '')}
                        >
                            <option value="">전체 상태</option>
                            {Object.entries(SETTLEMENT_STATUS_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={handleRunSettlement}
                        isLoading={runSettlement.isPending}
                    >
                        <span className="flex items-center gap-2">
                            <CalculatorOutlined /> 정산 실행
                        </span>
                    </Button>
                </CardContent>
            </Card>

            {/* 목록 테이블 */}
            <Card className="overflow-hidden">
                <DataTable<Settlement>
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    columns={[
                        {
                            key: 'createdAt',
                            header: '날짜',
                            sortable: true,
                            render: (item) => (
                                <span className="text-sm text-txt-main whitespace-nowrap">{item.createdAt.slice(0, 10)}</span>
                            ),
                        },
                        {
                            key: 'storeName',
                            header: '가맹점',
                            sortable: true,
                            render: (item) => (
                                <div>
                                    <div className="text-sm font-medium text-txt-main">{item.storeName}</div>
                                    <div className="text-xs text-txt-muted">{item.storeId}</div>
                                </div>
                            ),
                        },
                        {
                            key: 'totalSales',
                            header: '총 매출액',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm font-medium text-txt-main whitespace-nowrap">₩{item.totalSales.toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'deliveryFee',
                            header: '배달비용',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm text-txt-sub whitespace-nowrap">₩{item.deliveryFee.toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'pointsUsed',
                            header: '포인트',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm text-purple-600 whitespace-nowrap">₩{item.pointsUsed.toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'couponsUsed',
                            header: '쿠폰',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm text-purple-600 whitespace-nowrap">₩{item.couponsUsed.toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'vouchersUsed',
                            header: '교환권',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm text-txt-sub whitespace-nowrap">₩{item.vouchersUsed.toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'hqDiscount',
                            header: '할인액(본사)',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm text-red-500 font-bold whitespace-nowrap">₩{item.hqSupport.toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'storeDiscount',
                            header: '할인액(가맹)',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm text-red-500 font-bold whitespace-nowrap">₩{(item.promotionDiscount - item.hqSupport).toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'platformFee',
                            header: '플랫폼 수수료',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm text-txt-muted whitespace-nowrap">-₩{item.platformFee.toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'pgFee',
                            header: 'PG 수수료',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm text-txt-muted whitespace-nowrap">-₩{item.pgFee.toLocaleString()}</span>
                            ),
                        },
                        {
                            key: 'netAmount',
                            header: '정산 대상액',
                            sortable: true,
                            className: 'text-right',
                            render: (item) => (
                                <span className="text-sm font-bold text-blue-600 whitespace-nowrap">₩{item.netAmount.toLocaleString()}</span>
                            ),
                        },
                    ]}
                    data={settlements}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    onRowClick={(item) => navigate(`/settlement/${item.id}`)}
                />
                {pagination && pagination.totalPages > 0 && (
                    <div className="border-t">
                        <Pagination
                            page={page}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            totalElements={pagination.total}
                            limit={limit}
                            onLimitChange={setLimit}
                            unit="건"
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
