import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Badge } from '@/components/ui';
import type { PushStatus, PushType } from '@/types/push';

// Mock Detail Data
const MOCK_DETAIL = {
    id: '1',
    type: 'ad' as PushType,
    title: '[깜짝할인] 저녁 한정 치킨 3,000원 할인!',
    body: '오늘 저녁은 치킨이닭! 매장 방문 시 화면을 보여주세요.',
    status: 'completed' as PushStatus,
    targetCount: 15200,
    triggerType: 'none',
    createdAt: new Date('2026-02-20T10:00:00'),
    sentAt: new Date('2026-02-20T18:00:00'),
    stats: {
        sent: 15200,
        delivered: 14800,
        failed: 400,
        opened: 8500,
        openRate: 57.4,
    }
};

// Mock History Data
const MOCK_HISTORY = [
    { id: 'h1', userId: 'user_001', name: '김철수', phone: '010-1***-**11', status: 'delivered', openedAt: '2026-02-20 18:05' },
    { id: 'h2', userId: 'user_002', name: '이영희', phone: '010-2***-**22', status: 'opened', openedAt: '2026-02-20 18:30' },
    { id: 'h3', userId: 'user_003', name: '박민준', phone: '010-3***-**33', status: 'failed', openedAt: '-' },
    { id: 'h4', userId: 'user_004', name: '정수아', phone: '010-4***-**44', status: 'delivered', openedAt: '-' },
];

export const PushDetail = () => {
    const { id: _ } = useParams();
    const navigate = useNavigate();
    const detail = MOCK_DETAIL; // id에 맞는 데이터 fetch 가정

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'opened': return <Badge variant="success">읽음</Badge>;
            case 'delivered': return <Badge variant="info">전송됨</Badge>;
            case 'failed': return <Badge variant="critical">실패</Badge>;
            default: return <Badge variant="default">{status}</Badge>;
        }
    };

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
                            <div><span className="text-gray-500 block mb-1">상태</span> <Badge variant="success">발송 완료</Badge></div>
                            <div><span className="text-gray-500 block mb-1">작성일</span> {detail.createdAt.toLocaleString()}</div>
                            <div><span className="text-gray-500 block mb-1">발송일</span> {detail.sentAt.toLocaleString()}</div>
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
                                {MOCK_HISTORY.map((h) => (
                                    <tr key={h.id}>
                                        <td className="p-4">{h.name}</td>
                                        <td className="p-4">{h.phone}</td>
                                        <td className="p-4">{getStatusBadge(h.status)}</td>
                                        <td className="p-4">{h.openedAt}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
                                <span className="text-blue-600 font-semibold">{detail.stats.delivered.toLocaleString()} ({(detail.stats.delivered / detail.targetCount * 100).toFixed(1)}%)</span>
                            </div>

                            <div className="flex justify-between items-center px-2">
                                <span className="text-gray-600">실패 (알림거부 등)</span>
                                <span className="text-red-500">{detail.stats.failed.toLocaleString()} ({(detail.stats.failed / detail.targetCount * 100).toFixed(1)}%)</span>
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
