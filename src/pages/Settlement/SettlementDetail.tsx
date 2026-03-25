import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftOutlined,
    DownloadOutlined,
    ShopOutlined,
    CalendarOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { Card, CardContent, Button, Badge, Spinner } from '@/components/ui';
import { useSettlementDetail } from '@/hooks/useSettlement';
import { format } from 'date-fns';

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    card: '카드',
    cash: '현금',
    kakao_pay: '카카오페이',
    naver_pay: '네이버페이',
    toss_pay: '토스페이',
    mobile_gift_card: '모바일상품권',
    mobile_voucher: '모바일교환권',
    mixed: '복합결제',
};

export function SettlementDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data, isLoading } = useSettlementDetail(id);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-20 text-txt-muted">
                정산 데이터를 찾을 수 없습니다.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" className="p-2" onClick={() => navigate('/settlement')}>
                    <ArrowLeftOutlined style={{ fontSize: 20 }} />
                </Button>
                <h1 className="text-2xl font-bold text-txt-main">정산 상세 내역</h1>
                <div className="ml-auto">
                    <Button variant="outline">
                        <span className="flex items-center gap-2">
                            <DownloadOutlined /> 주문별 내역 엑셀 다운로드
                        </span>
                    </Button>
                </div>
            </div>

            {/* 정산 요약 박스 */}
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-txt-muted mb-1 flex items-center gap-1"><ShopOutlined /> 가맹점 정보</p>
                            <p className="font-bold text-lg">{data.storeName}</p>
                            <p className="text-sm text-txt-muted">{data.storeId}</p>
                        </div>
                        <div>
                            <p className="text-sm text-txt-muted mb-1 flex items-center gap-1"><CalendarOutlined /> 정산 주기</p>
                            <p className="font-bold">{data.period}</p>
                            <p className="text-sm text-txt-muted">생성일: {data.createdAt}</p>
                        </div>
                        <div>
                            <p className="text-sm text-txt-muted mb-1 flex items-center gap-1"><DollarOutlined /> 정산 상태</p>
                            <Badge variant={data.status === 'completed' ? 'success' : 'info'}>
                                {data.status === 'completed' ? '정산 완료' : '정산 대기'}
                            </Badge>
                            {data.paymentDate && <p className="text-sm text-txt-muted mt-1">지급일: {data.paymentDate}</p>}
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg flex flex-col justify-center">
                            <p className="text-sm font-bold text-blue-600 mb-1">최종 지급 금액</p>
                            <p className="text-2xl font-bold tracking-tight text-blue-900">₩{data.netAmount.toLocaleString()}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 결제 및 수수료 상세 */}
                <Card className="lg:col-span-1">
                    <CardContent className="p-0">
                        <div className="bg-bg-hover px-5 py-4 border-b border-border font-bold text-txt-main">
                            정산 금액 산출 내역
                        </div>
                        <div className="p-5 space-y-4 text-sm">
                            <div className="flex justify-between items-center pb-2 border-b border-border">
                                <span className="text-txt-sub">총 주문 건수</span>
                                <span className="font-bold text-txt-main">{data.orderCount}건</span>
                            </div>
                            <div className="flex justify-between items-center text-lg">
                                <span className="font-medium">총 매출액 (A)</span>
                                <span className="font-bold text-txt-main">₩{data.totalSales.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-txt-muted">
                                <span>+ 배달비 고객 부담금 (B)</span>
                                <span>₩{data.deliveryFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500 font-bold border-b border-border pb-1">
                                <span>- 할인 차감액 (C)</span>
                                <span>-₩{data.promotionDiscount.toLocaleString()}</span>
                            </div>
                            <div className="pl-4 space-y-1 text-[11px] text-txt-muted">
                                <div className="flex justify-between">
                                    <span>ㄴ 포인트 사용</span>
                                    <span>₩{data.pointsUsed.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>ㄴ 쿠폰 사용</span>
                                    <span>₩{data.couponsUsed.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-blue-500">
                                <span>+ 본사 지원 할인금 (정산 합산) (D)</span>
                                <span>+₩{data.hqSupport.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                                <span>- 플랫폼 수수료 (E)</span>
                                <span>-₩{data.platformFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-red-500">
                                <span>- PG사 결제 수수료 (F)</span>
                                <span>-₩{data.pgFee.toLocaleString()}</span>
                            </div>
                            <div className="pt-4 mt-2 border-t-2 border-txt-main flex justify-between items-center text-xl font-bold">
                                <span className="text-txt-main">최종 지급액</span>
                                <span className="text-blue-600">₩{data.netAmount.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-txt-muted text-right">수식: A + B - C + D - E - F</p>

                            {/* E쿠폰 (교환권/상품권) — 외부 쿠폰사 정산 */}
                            {data.vouchersUsed > 0 && (
                                <div className="mt-4 pt-4 border-t border-dashed border-border">
                                    <div className="flex justify-between items-center text-sm font-medium text-txt-secondary">
                                        <span>E쿠폰 사용액 (교환권/상품권)</span>
                                        <span>₩{data.vouchersUsed.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[11px] text-txt-muted mt-1">
                                        정산주체: 외부 쿠폰사 · 가맹점 정산에 미포함 · 쿠폰사↔플랫폼 별도 정산
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* 주문별 정산 현황 */}
                <Card className="lg:col-span-2">
                    <CardContent className="p-0">
                        <div className="bg-bg-hover px-5 py-4 border-b border-border font-bold text-txt-main flex justify-between">
                            <span>주문별 교환권/포인트 사용내역 상세</span>
                            <span className="text-sm font-normal text-txt-muted">총 {data.orders.length}개 표기 (Chunk)</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-bg-main border-b border-border text-xs text-txt-muted uppercase">
                                    <tr>
                                        <th className="px-5 py-3 text-left font-medium">주문정보</th>
                                        <th className="px-5 py-3 text-left font-medium">메뉴 및 할인/사용내역</th>
                                        <th className="px-5 py-3 text-right font-medium">결제금액</th>
                                        <th className="px-5 py-3 text-right font-medium">정산금액</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-border">
                                    {data.orders.map((order) => (
                                        <tr key={order.orderId} className="hover:bg-bg-hover">
                                            <td className="px-5 py-4 align-top">
                                                <p className="font-bold text-txt-main">{order.orderNumber}</p>
                                                <p className="text-xs text-txt-muted mt-1">
                                                    {format(new Date(order.orderDate), 'yy.MM.dd HH:mm')}
                                                </p>
                                                <Badge variant="secondary" className="mt-2 text-[10px]">
                                                    {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                                                </Badge>
                                            </td>
                                            <td className="px-5 py-4 align-top max-w-xs">
                                                {order.menus.map((m, idx) => (
                                                    <div key={idx} className="text-xs text-txt-sub truncate mb-1">
                                                        • {m.productName} {m.quantity}개 ({m.totalPrice.toLocaleString()}원)
                                                    </div>
                                                ))}
                                                <div className="mt-2 space-y-1">
                                                    {order.discount.pointUsed > 0 && (
                                                        <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block mr-1">
                                                            포인트 사용: {order.discount.pointUsed.toLocaleString()}P
                                                        </div>
                                                    )}
                                                    {order.discount.couponAmount > 0 && (
                                                        <div className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded inline-block mr-1">
                                                            쿠폰 사용: {order.discount.couponAmount.toLocaleString()}원
                                                        </div>
                                                    )}
                                                    {order.discount.eCoupons && order.discount.eCoupons.map((ec, idx) => (
                                                        <div key={idx} className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded inline-block mr-1">
                                                            {ec.eCouponType === 'exchange' ? '교환권' : '금액권'}: {ec.amount.toLocaleString()}원
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 align-top text-right text-txt-main">
                                                ₩{order.totalAmount.toLocaleString()}
                                            </td>
                                            <td className="px-5 py-4 align-top text-right font-bold text-blue-600">
                                                ₩{order.netAmount.toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
