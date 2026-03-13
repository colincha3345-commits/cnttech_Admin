import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, SearchInput, Spinner, Pagination } from '@/components/ui';
import { usePushList } from '@/hooks/usePush';
import type { BadgeVariant } from '@/types';
import type { PushStatus, PushType } from '@/types/push';

const STATUS_BADGE: Record<PushStatus, { variant: BadgeVariant; label: string }> = {
    completed: { variant: 'success', label: '발송 완료' },
    scheduled: { variant: 'warning', label: '예약됨' },
    sending: { variant: 'info', label: '발송 중 (자동)' },
    draft: { variant: 'default', label: '임시 저장' },
    failed: { variant: 'critical', label: '발송 실패' },
    cancelled: { variant: 'secondary', label: '취소됨' },
};

export const PushList = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [page, setPage] = useState(1);
    const limit = 20;

    const { pushList, pagination, isLoading } = usePushList({
        keyword: searchKeyword || undefined,
        page,
        limit,
    });

    const handleSearch = () => {
        setSearchKeyword(keyword);
        setPage(1);
    };

    const getPushTypeBadge = (type: PushType) => {
        return type === 'ad' ? <Badge variant="warning">광고성</Badge> : <Badge variant="info">정보성</Badge>;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">앱 푸시 관리</h1>
                    <p className="text-sm text-gray-500 mt-1">발송된 푸시 알림 내역과 예약 상태를 관리합니다.</p>
                </div>
                <Button onClick={() => navigate('/marketing/push/new')}>+ 새 푸시 작성</Button>
            </div>

            <Card className="p-4">
                <div className="max-w-[400px]">
                    <SearchInput
                        placeholder="캠페인 제목 또는 내용 검색"
                        value={keyword}
                        onChange={setKeyword}
                        onSearch={handleSearch}
                    />
                </div>
            </Card>

            <Card className="p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b text-sm text-gray-500">
                        <tr>
                            <th className="p-4 font-medium">유형</th>
                            <th className="p-4 font-medium">타이틀 / 내용</th>
                            <th className="p-4 font-medium">상태</th>
                            <th className="p-4 font-medium text-right">대상자 수</th>
                            <th className="p-4 font-medium">생성일</th>
                            <th className="p-4 font-medium">예약/발송일시</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-sm">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="text-center py-12">
                                    <Spinner size="sm" />
                                </td>
                            </tr>
                        ) : pushList.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center p-8 text-gray-500">
                                    검색된 푸시 알림이 없습니다.
                                </td>
                            </tr>
                        ) : (
                            pushList.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/marketing/push/${item.id}`)}>
                                    <td className="p-4">{getPushTypeBadge(item.type)}</td>
                                    <td className="p-4">
                                        <p className="font-semibold">{item.title}</p>
                                        <p className="text-gray-500 text-xs mt-1 truncate max-w-[250px]">{item.body}</p>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={STATUS_BADGE[item.status].variant}>
                                            {STATUS_BADGE[item.status].label}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-right font-medium">{item.targetCount.toLocaleString()}명</td>
                                    <td className="p-4 text-gray-500">{new Date(item.createdAt).toLocaleDateString('ko-KR')}</td>
                                    <td className="p-4 text-gray-500">
                                        {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString('ko-KR') : '-'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <Pagination
                    page={page}
                    totalPages={pagination.totalPages}
                    onPageChange={setPage}
                    totalElements={pagination.total}
                    limit={limit}
                    unit="건"
                />
            </Card>
        </div>
    );
};
