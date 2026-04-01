import { Card, CardHeader, CardContent, Badge, Spinner } from '@/components/ui';
import { useMemberAnalytics } from '@/hooks/useDashboard';

const GRADE_COLORS: Record<string, string> = {
  VIP: 'bg-amber-500',
  '골드': 'bg-yellow-400',
  '실버': 'bg-gray-400',
  '브론즈': 'bg-orange-400',
};

export function MemberAnalytics() {
    const { memberAnalytics, isLoading } = useMemberAnalytics();

    if (isLoading || !memberAnalytics) return <Spinner layout="center" />;

    const { summary: MEMBER_SUMMARY, gender: GENDER_DATA, age: AGE_DATA, membership: MEMBERSHIP_DATA, growth: GROWTH_DATA, topCustomers: TOP_CUSTOMERS, orderFrequency: ORDER_STATUS } = memberAnalytics;
    const maxAge = Math.max(...AGE_DATA.map(a => a.percentage));

    return (
        <div className="space-y-6">
            {/* 회원 상태 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                    { label: '전체 회원', value: MEMBER_SUMMARY.total, color: 'text-txt-main' },
                    { label: '활성 회원', value: MEMBER_SUMMARY.active, color: 'text-success' },
                    { label: '비활성 회원', value: MEMBER_SUMMARY.inactive, color: 'text-warning' },
                    { label: '오늘 가입', value: MEMBER_SUMMARY.newSignup, color: 'text-primary' },
                    { label: '오늘 탈퇴', value: MEMBER_SUMMARY.withdrawal, color: 'text-critical' },
                ].map((item) => (
                    <Card key={item.label} hover>
                        <CardContent className="text-center py-4">
                            <p className="text-sm text-txt-muted">{item.label}</p>
                            <p className={`text-2xl font-bold mt-1 ${item.color}`}>
                                {item.value.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 성별 분포 */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">성별 분포</h2>
                    </CardHeader>
                    <CardContent>
                        {/* 도넛 차트 대체 - 수평 바 */}
                        <div className="flex h-8 rounded-full overflow-hidden mb-4">
                            <div className="bg-pink-400 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${GENDER_DATA[0]?.value ?? 0}%` }}>
                                {GENDER_DATA[0]?.value}%
                            </div>
                            <div className="bg-blue-400 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${GENDER_DATA[1]?.value ?? 0}%` }}>
                                {GENDER_DATA[1]?.value}%
                            </div>
                            <div className="bg-gray-300 flex items-center justify-center text-xs text-white font-medium" style={{ width: `${GENDER_DATA[2]?.value ?? 0}%` }}>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {GENDER_DATA.map((g, i) => (
                                <div key={g.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-pink-400' : i === 1 ? 'bg-blue-400' : 'bg-gray-300'}`} />
                                        <span className="text-sm">{g.label}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-mono">{g.count.toLocaleString()}명</span>
                                        <span className="text-sm font-bold w-14 text-right">{g.value}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 연령대 분포 */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">연령대 분포</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {AGE_DATA.map((age) => (
                                <div key={age.range} className="flex items-center gap-3">
                                    <span className="text-sm w-12 text-right text-txt-muted">{age.range}</span>
                                    <div className="flex-1 h-7 bg-bg-muted rounded overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded flex items-center pl-2 transition-all"
                                            style={{ width: `${(age.percentage / maxAge) * 100}%` }}
                                        >
                                            {age.percentage > 10 && (
                                                <span className="text-xs text-white font-medium">{age.percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-sm font-mono w-20 text-right">{age.count.toLocaleString()}명</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 멤버십 분포 */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">멤버십 등급 분포</h2>
                    </CardHeader>
                    <CardContent>
                        {/* 스택 바 */}
                        <div className="flex h-10 rounded-lg overflow-hidden mb-4">
                            {MEMBERSHIP_DATA.map((m) => (
                                <div
                                    key={m.grade}
                                    className={`${GRADE_COLORS[m.grade] || 'bg-gray-300'} flex items-center justify-center text-xs text-white font-medium`}
                                    style={{ width: `${m.percentage}%` }}
                                >
                                    {m.percentage >= 10 && m.grade}
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {MEMBERSHIP_DATA.map((m) => (
                                <div key={m.grade} className="flex items-center justify-between p-3 bg-bg-hover rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${GRADE_COLORS[m.grade] || 'bg-gray-300'}`} />
                                        <span className="text-sm font-medium">{m.grade}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold">{m.count.toLocaleString()}</span>
                                        <span className="text-xs text-txt-muted ml-1">({m.percentage}%)</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 신규 vs 기존 고객 증가율 */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">신규 vs 기존 고객</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                                <p className="text-sm text-txt-muted">신규 고객 비율</p>
                                <p className="text-3xl font-bold text-primary mt-1">{GROWTH_DATA.newCustomerRate}%</p>
                                <p className={`text-xs mt-1 ${GROWTH_DATA.newCustomerChange > 0 ? 'text-success' : 'text-critical'}`}>
                                    {GROWTH_DATA.newCustomerChange > 0 ? '▲' : '▼'} {Math.abs(GROWTH_DATA.newCustomerChange)}% 전월 대비
                                </p>
                            </div>
                            <div className="p-4 bg-success/5 border border-success/20 rounded-lg text-center">
                                <p className="text-sm text-txt-muted">기존 고객 비율</p>
                                <p className="text-3xl font-bold text-success mt-1">{GROWTH_DATA.existingCustomerRate}%</p>
                                <p className={`text-xs mt-1 ${GROWTH_DATA.existingRetentionChange > 0 ? 'text-success' : 'text-critical'}`}>
                                    {GROWTH_DATA.existingRetentionChange > 0 ? '▲' : '▼'} {Math.abs(GROWTH_DATA.existingRetentionChange)}% 전월 대비
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-3 bg-bg-hover rounded-lg">
                                <span className="text-sm text-txt-muted">월평균 신규가입</span>
                                <span className="text-sm font-bold">{GROWTH_DATA.monthlyNewAvg.toLocaleString()}명</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-bg-hover rounded-lg">
                                <span className="text-sm text-txt-muted">월평균 이탈</span>
                                <span className="text-sm font-bold text-critical">{GROWTH_DATA.monthlyChurnAvg.toLocaleString()}명</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 주문 빈도 분포 */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">주문 빈도 분포</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {ORDER_STATUS.map((os) => (
                                <div key={os.label}>
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm text-txt-main">{os.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-mono">{os.count.toLocaleString()}명</span>
                                            <span className="text-sm font-bold w-14 text-right">{os.percentage}%</span>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-bg-muted rounded-full overflow-hidden">
                                        <div className="h-full bg-info rounded-full transition-all" style={{ width: `${os.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* 월별 구매 상위 고객 */}
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">월별 구매 상위 고객 TOP 5</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th className="w-10">#</th>
                                        <th>고객</th>
                                        <th className="text-right">주문수</th>
                                        <th className="text-right">총 금액</th>
                                        <th>등급</th>
                                        <th>최근 주문</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {TOP_CUSTOMERS.map((c) => (
                                        <tr key={c.rank}>
                                            <td className="text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                    c.rank === 1 ? 'bg-amber-100 text-amber-700' :
                                                    c.rank === 2 ? 'bg-gray-100 text-gray-600' :
                                                    c.rank === 3 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-bg-muted text-txt-muted'
                                                }`}>
                                                    {c.rank}
                                                </span>
                                            </td>
                                            <td className="font-medium">{c.name}</td>
                                            <td className="text-right font-mono">{c.totalOrders}건</td>
                                            <td className="text-right font-mono font-medium">
                                                {(c.totalAmount / 10000).toFixed(0)}만원
                                            </td>
                                            <td>
                                                <Badge variant={c.grade === 'VIP' ? 'warning' : 'info'}>
                                                    {c.grade}
                                                </Badge>
                                            </td>
                                            <td className="text-sm text-txt-muted">{c.lastOrder}</td>
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
