import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Badge, SearchInput } from '@/components/ui';
import type { PushNotification, PushStatus, PushType } from '@/types/push';

// Mock Data
const MOCK_PUSH_LIST: PushNotification[] = [
    {
        id: '1',
        type: 'ad',
        title: '[깜짝할인] 저녁 한정 치킨 3,000원 할인!',
        body: '오늘 저녁은 치킨이닭! 매장 방문 시 화면을 보여주세요.',
        status: 'completed',
        targetCount: 15200,
        triggerType: 'none',
        createdAt: new Date('2026-02-20T10:00:00'),
        updatedAt: new Date('2026-02-20T10:00:00'),
        scheduledAt: new Date('2026-02-20T18:00:00'),
    },
    {
        id: '2',
        type: 'info',
        title: '장바구니에 담긴 상품을 확인해보세요',
        body: '회원님이 담아두신 상품이 아직 남아있어요. 지금 결제하시면 내일 바로 픽업 가능합니다!',
        status: 'sending',
        targetCount: 300,
        triggerType: 'cart_abandoned',
        createdAt: new Date('2026-02-25T09:00:00'),
        updatedAt: new Date('2026-02-25T09:00:00'),
    },
    {
        id: '3',
        type: 'ad',
        title: '신메뉴 마라치킨 출시 완료',
        body: '가장 먼저 만나보는 신메뉴 혜택! 지금 바로 앱에서 확인하세요.',
        status: 'scheduled',
        targetCount: 50000,
        triggerType: 'none',
        createdAt: new Date('2026-02-25T09:30:00'),
        updatedAt: new Date('2026-02-25T09:30:00'),
        scheduledAt: new Date('2026-02-28T12:00:00'),
    }
];

export const PushList = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');

    const getStatusBadge = (status: PushStatus) => {
        switch (status) {
            case 'completed': return <Badge variant="success">발송 완료</Badge>;
            case 'scheduled': return <Badge variant="warning">예약됨</Badge>;
            case 'sending': return <Badge variant="info">발송 중 (자동)</Badge>;
            case 'draft': return <Badge variant="default">임시 저장</Badge>;
            case 'failed': return <Badge variant="critical">발송 실패</Badge>;
            default: return null;
        }
    };

    const getPushTypeBadge = (type: PushType) => {
        return type === 'ad' ? <Badge variant="warning">광고성</Badge> : <Badge variant="info">정보성</Badge>;
    };

    const filteredList = MOCK_PUSH_LIST.filter(p => p.title.includes(keyword) || p.body.includes(keyword));

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
                        {filteredList.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/marketing/push/${item.id}`)}>
                                <td className="p-4">{getPushTypeBadge(item.type)}</td>
                                <td className="p-4">
                                    <p className="font-semibold">{item.title}</p>
                                    <p className="text-gray-500 text-xs mt-1 truncate max-w-[250px]">{item.body}</p>
                                </td>
                                <td className="p-4">{getStatusBadge(item.status)}</td>
                                <td className="p-4 text-right font-medium">{item.targetCount.toLocaleString()}명</td>
                                <td className="p-4 text-gray-500">{item.createdAt.toLocaleDateString()}</td>
                                <td className="p-4 text-gray-500">
                                    {item.scheduledAt ? item.scheduledAt.toLocaleString() : '-'}
                                </td>
                            </tr>
                        ))}
                        {filteredList.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center p-8 text-gray-500">
                                    검색된 푸시 알림이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>
        </div>
    );
};
