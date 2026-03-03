import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { UserOutlined, TeamOutlined, UsergroupAddOutlined, RiseOutlined } from '@ant-design/icons';

import { StatCard } from '@/components/ui/StatCard';
import { DevGuide, DASHBOARD_DEV_GUIDE } from '@/components/dev';
import { InfoCard } from './InfoCard';
import { Card, CardHeader, CardContent } from '@/components/ui';

export function GA4Statistics() {
    const navigate = useNavigate();
    const now = new Date();

    // Mock data for DAU / MAU
    const usersData = {
        dau: 12450,
        wau: 45200,
        mau: 185000,
        dauMauRatio: '6.7',
    };

    // Mock data for Device Info (formatted for InfoCard)
    const deviceStats = [
        { label: 'Mobile (모바일)', value: '72%' },
        { label: 'Desktop (데스크톱)', value: '24%' },
        { label: 'Tablet (태블릿)', value: '4%' },
    ];

    // Mock data for Customer Journey (Funnel metrics)
    const journeyStats = [
        { label: '방문 → 상품 조회 이탈', value: '35%' },
        { label: '상품 조회 → 장바구니 이탈', value: '61.5%' },
        { label: '장바구니 → 주문서 이탈', value: '60%' },
        { label: '주문서 → 결제 완료 이탈', value: '15%' },
    ];

    const journeyData = [
        { step: '방문 (Visit)', users: 100000, dropRate: '-' },
        { step: '상품 조회 (View Item)', users: 65000, dropRate: '35%' },
        { step: '장바구니 (Add to Cart)', users: 25000, dropRate: '61.5%' },
        { step: '주문서 작성 (Checkout)', users: 10000, dropRate: '60%' },
        { step: '결제 완료 (Purchase)', users: 8500, dropRate: '15%' },
    ];

    return (
        <div className="space-y-6">
            {/* 페이지 헤더 */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-txt-main">GA4 통계 현황</h1>
                    <p className="text-sm text-txt-muted mt-1">
                        {format(now, 'yyyy-MM-dd eeee', { locale: ko })} (최종 업데이트 :{' '}
                        {format(now, 'yyyy년 M월 d일 HH:mm')})
                    </p>
                </div>
                <DevGuide {...DASHBOARD_DEV_GUIDE} />
            </div>

            {/* 상단 4개 요약 통계 카드 */}
            <div className="admin-grid">
                <StatCard
                    title="DAU (일간 활성 사용자)"
                    value={usersData.dau}
                    icon={<UserOutlined />}
                    color="primary"
                    change={2.4}
                />
                <StatCard
                    title="WAU (주간 활성 사용자)"
                    value={usersData.wau}
                    icon={<UsergroupAddOutlined />}
                    color="info"
                    change={5.1}
                />
                <StatCard
                    title="MAU (월간 활성 사용자)"
                    value={usersData.mau}
                    icon={<TeamOutlined />}
                    color="success"
                    change={12.0}
                />
                <StatCard
                    title="고착도 (DAU/MAU 비율)"
                    value={usersData.dauMauRatio}
                    icon={<RiseOutlined />}
                    color="warning"
                    format="percent"
                    change={-0.3}
                />
            </div>

            {/* 중간 인포 카드 영역 (디바이스 / 단계별 이탈률) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoCard
                    title="디바이스 접속 환경"
                    stats={deviceStats}
                    buttonText="상세 환경 분석 가기"
                    onButtonClick={() => navigate('/dashboard/ga4/device')}
                />
                <InfoCard
                    title="고객 여정 요약 (이탈률)"
                    stats={journeyStats}
                    buttonText="퍼널 상세 분석 가기"
                    onButtonClick={() => navigate('/dashboard/ga4/funnel')}
                />
            </div>

            {/* 하단 넓은 차트 영역 (퍼널 분석 시각화 등) */}
            <div className="grid grid-cols-1 gap-6">
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">고객 여정 퍼널 분석</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="relative pt-4">
                            {journeyData.map((step, index) => {
                                const maxUsers = journeyData[0]?.users || 1;
                                const widthPerc = (step.users / maxUsers) * 100;

                                return (
                                    <div key={step.step} className="mb-6 relative z-10">
                                        <div className="flex justify-between items-end mb-1">
                                            <span className="text-sm font-medium text-txt-main">{step.step}</span>
                                            <div className="flex gap-4">
                                                <span className="text-sm font-bold text-primary">{step.users.toLocaleString()}명</span>
                                                {index > 0 && <span className="text-sm text-critical w-16 text-right">이탈 {step.dropRate}</span>}
                                            </div>
                                        </div>
                                        <div className="w-full bg-bg-muted rounded-r-md h-8 relative flex items-center">
                                            <div
                                                className="h-full bg-blue-500 rounded-r-md transition-all flex items-center justify-end pr-2"
                                                style={{ width: `${widthPerc}%`, opacity: 1 - index * 0.15 }}
                                            >
                                            </div>
                                        </div>
                                        {index < journeyData.length - 1 && (
                                            <div className="h-6 w-px bg-border ml-4 my-1"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
