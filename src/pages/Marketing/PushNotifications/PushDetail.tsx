import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge, Spinner, MaskedData, Pagination } from '@/components/ui';
import { usePushDetail, usePushRecipients } from '@/hooks/usePush';
import type { BadgeVariant } from '@/types';
import type { PushDeliveryStatus } from '@/types/push';

const DELIVERY_STATUS_BADGE: Record<PushDeliveryStatus, { variant: BadgeVariant; label: string }> = {
    opened: { variant: 'success', label: '읽음' },
    delivered: { variant: 'info', label: '전송됨' },
    failed: { variant: 'critical', label: '실패' },
};

export const PushDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [recipientPage, setRecipientPage] = useState(1);
    const [recipientLimit, setRecipientLimit] = useState(20);

    const { detail, isLoading } = usePushDetail(id);
    const { recipients, pagination: recipientPagination, isLoading: isLoadingRecipients } = usePushRecipients(id, {
        page: recipientPage,
        limit: recipientLimit,
    });

    if (isLoading) {
        return <div className="p-8"><Spinner layout="center" /></div>;
    }

    if (!detail) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">푸시 알림을 찾을 수 없습니다.</p>
                <Button variant="secondary" onClick={() => navigate('/marketing/push')}>목록으로</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">앱 푸시 발송 상세</h1>
                <Button variant="secondary" onClick={() => navigate('/marketing/push')}>목록으로</Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-4">
                    <Card className="p-4 space-y-4">
                        <h2 className="font-semibold text-lg border-b pb-2">기본 정보</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                            <div><span className="text-gray-500 block mb-1">유형</span> {detail.type === 'ad' ? '광고성' : '정보성'}</div>
                            <div>
                                <span className="text-gray-500 block mb-1">상태</span>
                                <Badge variant={detail.status === 'completed' ? 'success' : 'info'}>
                                    {detail.status === 'completed' ? '발송 완료' : detail.status}
                                </Badge>
                            </div>
                            <div><span className="text-gray-500 block mb-1">작성일</span> {new Date(detail.createdAt).toLocaleString('ko-KR')}</div>
                            <div><span className="text-gray-500 block mb-1">발송일</span> {detail.sentAt ? new Date(detail.sentAt).toLocaleString('ko-KR') : '-'}</div>
                        </div>
                    </Card>

                    <Card className="p-4 space-y-4">
                        <h2 className="font-semibold text-lg border-b pb-2">메시지 내용</h2>
                        <div className="space-y-2 mt-4 text-sm">
                            <div><span className="font-medium inline-block w-20">제목</span> {detail.title}</div>
                            <div className="flex"><span className="font-medium inline-block w-20 shrink-0">본문</span> <p className="text-gray-700">{detail.body}</p></div>
                        </div>
                    </Card>

                    <Card className="p-0 overflow-hidden">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h2 className="font-semibold text-lg">유저별 전송/오픈 내역</h2>
                        </div>
                        {isLoadingRecipients ? (
                            <div className="p-8"><Spinner layout="center" /></div>
                        ) : (
                            <>
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-500">
                                        <tr>
                                            <th className="p-4 font-medium">회원명</th>
                                            <th className="p-4 font-medium">연락처</th>
                                            <th className="p-4 font-medium">전송상태</th>
                                            <th className="p-4 font-medium">오픈시간</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-gray-700">
                                        {recipients.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center p-8 text-gray-500">수신자가 없습니다.</td>
                                            </tr>
                                        ) : (
                                            recipients.map((r) => (
                                                <tr key={r.id}>
                                                    <td className="p-4">{r.name}</td>
                                                    <td className="p-4"><MaskedData value={r.phone} /></td>
                                                    <td className="p-4">
                                                        <Badge variant={DELIVERY_STATUS_BADGE[r.status].variant}>
                                                            {DELIVERY_STATUS_BADGE[r.status].label}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4">{r.openedAt ?? '-'}</td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>

                                <Pagination
                                    page={recipientPage}
                                    totalPages={recipientPagination.totalPages}
                                    onPageChange={setRecipientPage}
                                    totalElements={recipientPagination.total}
                                    limit={recipientLimit}
                                    onLimitChange={setRecipientLimit}
                                    unit="명"
                                />
                            </>
                        )}
                    </Card>
                </div>

                <div className="col-span-1 space-y-4">
                    <Card className="p-4 space-y-4 sticky top-4">
                        <h2 className="font-semibold text-lg border-b pb-2">지표 (Funnel)</h2>

                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                                <span className="font-medium">총 대상자</span>
                                <span className="font-bold text-lg">{detail.targetCount.toLocaleString()}명</span>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <span className="text-gray-600">성공 (도달)</span>
                                <span className="text-blue-600 font-semibold">
                                    {detail.stats.delivered.toLocaleString()} ({(detail.stats.delivered / detail.targetCount * 100).toFixed(1)}%)
                                </span>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <span className="text-gray-600">실패 (알림거부 등)</span>
                                <span className="text-red-500">
                                    {detail.stats.failed.toLocaleString()} ({(detail.stats.failed / detail.targetCount * 100).toFixed(1)}%)
                                </span>
                            </div>

                            <div className="h-px bg-gray-200 my-2" />

                            <div className="flex justify-between items-center px-2">
                                <span className="font-medium">최종 푸시 클릭(오픈)</span>
                                <span className="text-green-600 font-bold">{detail.stats.opened.toLocaleString()}</span>
                            </div>
                            <div className="bg-gray-100 rounded-full h-2 mt-2">
                                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${detail.stats.openRate}%` }} />
                            </div>
                            <p className="text-xs text-right text-gray-500 mt-1">도달 대비 오픈율: {detail.stats.openRate}%</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
