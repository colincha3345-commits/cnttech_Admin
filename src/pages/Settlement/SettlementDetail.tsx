import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeftOutlined,
    DownloadOutlined,
    ShopOutlined,
    CalendarOutlined,
    DollarOutlined,
} from '@ant-design/icons';
import { Card, CardContent, Button, Badge, Spinner } from '@/components/ui';
import { MaskedData } from '@/components/ui/MaskedData';
import { useSettlementDetail } from '@/hooks/useSettlement';
import { ORDER_DELIVERY_TYPE_LABELS } from '@/types';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

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

    const handleExcelDownload = () => {
        if (!data) return;
        const rows = data.orders.map((o) => ({
            '주문번호': o.orderNumber,
            '주문일시': format(new Date(o.orderDate), 'yyyy-MM-dd HH:mm'),
            '주문유형': ORDER_DELIVERY_TYPE_LABELS[o.orderType] || o.orderType,
            '고객명': o.customerName,
            '연락처': o.customerPhone,
            '결제수단': PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod,
            '정상가합계': o.regularPriceTotal,
            '이벤트할인(브랜드)': o.eventDiscountBurden.brand,
            '이벤트할인(가맹점)': o.eventDiscountBurden.franchise,
            '이벤트할인(합계)': o.eventDiscountBurden.total,
            '배달비(브랜드)': o.deliveryFeeBurden.brand,
            '배달비(가맹점)': o.deliveryFeeBurden.franchise,
            '배달비(합계)': o.deliveryFeeBurden.total,
            '쿠폰(브랜드)': o.couponBurden.brand,
            '쿠폰(가맹점)': o.couponBurden.franchise,
            '쿠폰(합계)': o.couponBurden.total,
            '포인트': o.pointUsed,
            '금액권': o.voucherSettlement.giftCard,
            '교환권': o.voucherSettlement.exchange,
            '총결제금액': o.totalPaymentAmount,
            'PG수수료': o.pgFeeDetail.pg,
            '간편결제수수료': o.pgFeeDetail.easyPay,
            'PG수수료(합)': o.pgFeeDetail.pgTotal,
            'PG건수': o.pgFeeDetail.cnt,
            '주문중개(브랜드)': o.orderBrokerFee.brand,
            '주문중개(합)': o.orderBrokerFee.orderTotal,
            '정산금액': o.netAmount,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = Array(27).fill({ wch: 14 });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '정산상세');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `정산상세_${data.storeName}_${data.period.replace(/ /g, '')}.xlsx`);
    };

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
                    <Button variant="outline" onClick={handleExcelDownload}>
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

            {/* 정산 금액 산출 내역 — 상단 고정 */}
            <Card>
                <CardContent className="p-5">
                    <div className="flex justify-between items-center mb-4 border-b border-border pb-4">
                        <h2 className="font-bold text-txt-main">정산 계산 내역</h2>
                        <div className="bg-bg-hover text-txt-muted text-xs px-3 py-1.5 rounded-lg flex gap-2">
                           상세 공식: <strong>매출 + 본사지원금(이벤트/쿠폰/포인트) - 가맹점부담할인 - 배달비 - 수수료</strong>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-sm">
                        <div className="p-3 bg-bg-hover rounded-lg border border-border">
                            <p className="text-xs text-txt-muted">정상가합계</p>
                            <p className="font-bold text-lg mt-1">₩{data.totalSales.toLocaleString()}</p>
                            <p className="text-[10px] text-txt-muted mt-1">{data.orderCount}건</p>
                        </div>
                        
                        {/* 차감 항목 (가맹점 부담) */}
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <p className="text-xs text-orange-600 font-bold">이벤트 할인(가맹점)</p>
                            <p className="font-bold text-orange-700 mt-1">-₩{data.eventDiscountBurden.franchise.toLocaleString()}</p>
                            <p className="text-[10px] text-orange-500 mt-1">이벤트에 의한 가맹점 차감</p>
                        </div>
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                            <p className="text-xs text-orange-600 font-bold">쿠폰 할인(가맹점)</p>
                            <p className="font-bold text-orange-700 mt-1">-₩{data.couponBurden.franchise.toLocaleString()}</p>
                            <p className="text-[10px] text-orange-500 mt-1">쿠폰에 의한 가맹점 차감</p>
                        </div>
                        <div className="p-3 bg-bg-hover rounded-lg border border-border">
                            <p className="text-xs text-txt-muted">배달비(가맹점)</p>
                            <p className="font-medium mt-1">-₩{data.deliveryFeeBurden.franchise.toLocaleString()}</p>
                            <p className="text-[10px] text-txt-muted mt-1">전체: ₩{data.deliveryFee.toLocaleString()}</p>
                        </div>
                        
                        {/* 가산 항목 (본사 지원/쿠폰사) */}
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200 shadow-sm relative overflow-hidden">
                            <div className="absolute -right-2 -top-2 bg-green-200 rounded-full w-10 h-10 flex flex-col justify-end items-start p-2 opacity-50"><span className="text-[10px] font-bold text-green-700">+</span></div>
                            <p className="text-xs text-green-700 font-bold">본사 지원금</p>
                            <p className="font-bold text-green-800 mt-1">(+) ₩{(data.eventDiscountBurden.brand + data.couponBurden.brand + data.pointsUsed).toLocaleString()}</p>
                            <p className="text-[10px] text-green-600 mt-1">이벤트 {data.eventDiscountBurden.brand.toLocaleString()} / 쿠폰 {data.couponBurden.brand.toLocaleString()} / 포인트 {data.pointsUsed.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                            <p className="text-xs text-purple-600 font-bold">교환권 (외부 쿠폰사 정산)</p>
                            <p className="font-bold text-purple-700 mt-1">₩{(data.voucherSettlement.giftCard + data.voucherSettlement.exchange).toLocaleString()}</p>
                            <p className="text-[10px] text-purple-500 mt-1">금액권 ₩{data.voucherSettlement.giftCard.toLocaleString()} / 교환권 ₩{data.voucherSettlement.exchange.toLocaleString()}</p>
                        </div>
                        
                        {/* 결제 관련 수수료 (차감) */}
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs text-red-600 font-bold">PG 수수료</p>
                            <p className="font-bold text-red-700 mt-1">-₩{data.pgFeeDetail.pgTotal.toLocaleString()}</p>
                            <p className="text-[10px] text-red-500 mt-1">PG ₩{data.pgFeeDetail.pg.toLocaleString()} / 간편결제 ₩{data.pgFeeDetail.easyPay.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                            <p className="text-xs text-red-600 font-bold">주문중개수수료</p>
                            <p className="font-bold text-red-700 mt-1">-₩{data.orderBrokerFee.orderTotal.toLocaleString()}</p>
                            <p className="text-[10px] text-red-500 mt-1">전체 주문중계 부과금</p>
                        </div>

                        {/* 합계 */}
                        <div className="p-3 bg-blue-100 rounded-lg flex flex-col justify-center border border-blue-200">
                            <p className="text-xs font-bold text-blue-800 tracking-wide">최종 지급 정산액</p>
                            <p className={`font-black text-xl mt-1 ${data.netAmount < 0 ? 'text-red-600' : 'text-blue-900'}`}>
                                ₩{data.netAmount.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 주문별 상세 내역 — 하단 리스트 */}
            <Card>
                <CardContent className="p-0">
                    <div className="bg-bg-hover px-5 py-4 border-b border-border font-bold text-txt-main flex justify-between">
                        <span>주문별 상세 내역</span>
                        <span className="text-sm font-normal text-txt-muted">총 {data.orders.length}건</span>
                    </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs whitespace-nowrap">
                                <thead className="bg-bg-main border-b border-border text-txt-muted">
                                    <tr className="border-b border-border">
                                        <th rowSpan={2} className="px-3 py-2 text-left font-medium sticky left-0 bg-bg-main z-10">주문정보</th>
                                        <th rowSpan={2} className="px-3 py-2 text-left font-medium">고객</th>
                                        <th rowSpan={2} className="px-3 py-2 text-right font-medium">정상가합계</th>
                                        <th colSpan={3} className="px-3 py-2 text-center font-medium border-l border-border">이벤트 할인</th>
                                        <th colSpan={3} className="px-3 py-2 text-center font-medium border-l border-border">배달비</th>
                                        <th colSpan={3} className="px-3 py-2 text-center font-medium border-l border-border">쿠폰</th>
                                        <th rowSpan={2} className="px-3 py-2 text-right font-medium border-l border-border">포인트</th>
                                        <th colSpan={2} className="px-3 py-2 text-center font-medium border-l border-border">교환권</th>
                                        <th rowSpan={2} className="px-3 py-2 text-right font-medium border-l border-border bg-gray-100">총결제금액</th>
                                        <th colSpan={4} className="px-3 py-2 text-center font-medium border-l border-border">PG수수료</th>
                                        <th colSpan={2} className="px-3 py-2 text-center font-medium border-l border-border">주문중개수수료</th>
                                        <th rowSpan={2} className="px-3 py-2 text-right font-medium border-l border-border bg-blue-50">정산금액</th>
                                    </tr>
                                    <tr>
                                        <th className="px-2 py-1.5 text-right font-normal border-l border-border">브랜드</th>
                                        <th className="px-2 py-1.5 text-right font-normal">가맹점</th>
                                        <th className="px-2 py-1.5 text-right font-normal">합계</th>
                                        <th className="px-2 py-1.5 text-right font-normal border-l border-border">브랜드</th>
                                        <th className="px-2 py-1.5 text-right font-normal">가맹점</th>
                                        <th className="px-2 py-1.5 text-right font-normal">합계</th>
                                        <th className="px-2 py-1.5 text-right font-normal border-l border-border">브랜드</th>
                                        <th className="px-2 py-1.5 text-right font-normal">가맹점</th>
                                        <th className="px-2 py-1.5 text-right font-normal">합계</th>
                                        <th className="px-2 py-1.5 text-right font-normal border-l border-border">금액권</th>
                                        <th className="px-2 py-1.5 text-right font-normal">교환권</th>
                                        <th className="px-2 py-1.5 text-right font-normal border-l border-border">PG</th>
                                        <th className="px-2 py-1.5 text-right font-normal">간편결제</th>
                                        <th className="px-2 py-1.5 text-right font-normal">합계</th>
                                        <th className="px-2 py-1.5 text-right font-normal">CNT</th>
                                        <th className="px-2 py-1.5 text-right font-normal border-l border-border">브랜드</th>
                                        <th className="px-2 py-1.5 text-right font-normal">합계</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.orders.map((o) => (
                                        <tr key={o.orderId} className="hover:bg-bg-hover">
                                            <td className="px-3 py-3 align-top sticky left-0 bg-white z-10">
                                                <p className="font-bold text-txt-main">{o.orderNumber}</p>
                                                <p className="text-[10px] text-txt-muted">{format(new Date(o.orderDate), 'yy.MM.dd HH:mm')}</p>
                                                <div className="flex gap-1 mt-1">
                                                    <Badge variant={o.orderType === 'delivery' ? 'info' : o.orderType === 'pickup' ? 'warning' : 'secondary'} className="text-[9px] px-1">
                                                        {ORDER_DELIVERY_TYPE_LABELS[o.orderType]}
                                                    </Badge>
                                                    <Badge variant="secondary" className="text-[9px] px-1">
                                                        {PAYMENT_METHOD_LABELS[o.paymentMethod] || o.paymentMethod}
                                                    </Badge>
                                                </div>
                                            </td>
                                            <td className="px-3 py-3 align-top">
                                                <p className="font-medium">{o.customerName}</p>
                                                <p className="text-[10px] text-txt-muted"><MaskedData value={o.customerPhone} /></p>
                                            </td>
                                            <td className="px-3 py-3 text-right align-top font-medium">₩{o.regularPriceTotal.toLocaleString()}</td>
                                            {/* 이벤트 할인 */}
                                            <td className="px-2 py-3 text-right align-top border-l border-border">{o.eventDiscountBurden.brand.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top">{o.eventDiscountBurden.franchise.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top font-medium">{o.eventDiscountBurden.total.toLocaleString()}</td>
                                            {/* 배달비 */}
                                            <td className="px-2 py-3 text-right align-top border-l border-border">{o.deliveryFeeBurden.brand.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top">{o.deliveryFeeBurden.franchise.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top font-medium">{o.deliveryFeeBurden.total.toLocaleString()}</td>
                                            {/* 쿠폰 */}
                                            <td className="px-2 py-3 text-right align-top border-l border-border">{o.couponBurden.brand.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top">{o.couponBurden.franchise.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top font-medium">{o.couponBurden.total.toLocaleString()}</td>
                                            {/* 포인트 */}
                                            <td className="px-2 py-3 text-right align-top border-l border-border">{o.pointUsed.toLocaleString()}</td>
                                            {/* 교환권 */}
                                            <td className="px-2 py-3 text-right align-top border-l border-border">{o.voucherSettlement.giftCard.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top">{o.voucherSettlement.exchange.toLocaleString()}</td>
                                            {/* 총결제금액 */}
                                            <td className="px-3 py-3 text-right align-top font-bold border-l border-border bg-gray-50">₩{o.totalPaymentAmount.toLocaleString()}</td>
                                            {/* PG수수료 */}
                                            <td className="px-2 py-3 text-right align-top border-l border-border">{o.pgFeeDetail.pg.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top">{o.pgFeeDetail.easyPay.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top font-medium">{o.pgFeeDetail.pgTotal.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top">{o.pgFeeDetail.cnt}</td>
                                            {/* 주문중개수수료 */}
                                            <td className="px-2 py-3 text-right align-top border-l border-border">{o.orderBrokerFee.brand.toLocaleString()}</td>
                                            <td className="px-2 py-3 text-right align-top">{o.orderBrokerFee.orderTotal.toLocaleString()}</td>
                                            {/* 정산금액 */}
                                            <td className="px-3 py-3 text-right align-top font-bold text-blue-600 border-l border-border bg-blue-50">₩{o.netAmount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-bg-hover border-t-2 border-txt-main font-bold text-xs">
                                    <tr>
                                        <td className="px-3 py-3 sticky left-0 bg-bg-hover z-10">합계</td>
                                        <td></td>
                                        <td className="px-3 py-3 text-right">₩{data.totalSales.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-l border-border">{data.eventDiscountBurden.brand.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.eventDiscountBurden.franchise.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.eventDiscountBurden.total.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-l border-border">{data.deliveryFeeBurden.brand.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.deliveryFeeBurden.franchise.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.deliveryFeeBurden.total.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-l border-border">{data.couponBurden.brand.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.couponBurden.franchise.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.couponBurden.total.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-l border-border">{data.pointsUsed.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-l border-border">{data.voucherSettlement.giftCard.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.voucherSettlement.exchange.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right border-l border-border bg-gray-50">₩{data.totalPaymentAmount.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right border-l border-border">{data.pgFeeDetail.pg.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.pgFeeDetail.easyPay.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.pgFeeDetail.pgTotal.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.pgFeeDetail.cnt}</td>
                                        <td className="px-2 py-3 text-right border-l border-border">{data.orderBrokerFee.brand.toLocaleString()}</td>
                                        <td className="px-2 py-3 text-right">{data.orderBrokerFee.orderTotal.toLocaleString()}</td>
                                        <td className="px-3 py-3 text-right text-blue-600 border-l border-border bg-blue-50">₩{data.netAmount.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </CardContent>
                </Card>
        </div>
    );
}
