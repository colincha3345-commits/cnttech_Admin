import { useState } from 'react';
import {
    MessageOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import {
    Card,
    CardContent,
    Button,
    Badge,
    SearchInput,
    DataTable,
} from '@/components/ui';
import { useInquiries } from '@/hooks/useSupport';
import type { Inquiry, InquiryType, InquiryStatus, InquiryCategory } from '@/types/support';

const STATUS_LABELS: Record<InquiryStatus, string> = {
    pending: '대기',
    in_progress: '처리중',
    resolved: '완료',
    closed: '종료',
};

const STATUS_VARIANTS: Record<InquiryStatus, 'default' | 'warning' | 'info' | 'success' | 'secondary'> = {
    pending: 'warning',
    in_progress: 'info',
    resolved: 'success',
    closed: 'secondary',
};

const CATEGORY_LABELS: Record<InquiryCategory, string> = {
    order: '주문',
    payment: '결제',
    delivery: '배달',
    product: '상품',
    account: '계정',
    etc: '기타',
};

interface InquiryListProps {
    type: InquiryType;
    title: string;
}

export function InquiryList({ type, title }: InquiryListProps) {
    const { inquiries, loading, fetchInquiries, answerInquiry } = useInquiries(type);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('');
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [answer, setAnswer] = useState('');
    const [answerStatus, setAnswerStatus] = useState<InquiryStatus>('resolved');

    const handleSearch = () => {
        fetchInquiries({ keyword, status: statusFilter || undefined });
    };

    const handleSelectInquiry = (item: Inquiry) => {
        setSelectedInquiry(item);
        setAnswer(item.answer || '');
        setAnswerStatus(item.status === 'pending' ? 'resolved' : item.status);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedInquiry || !answer.trim()) return;
        const success = await answerInquiry(selectedInquiry.id, {
            category: selectedInquiry.category,
            answer,
            status: answerStatus,
        });
        if (success) setSelectedInquiry(null);
    };

    const filteredInquiries = inquiries.filter(i => {
        if (statusFilter && i.status !== statusFilter) return false;
        if (keyword) {
            const kw = keyword.toLowerCase();
            return i.title.toLowerCase().includes(kw) || i.authorName.toLowerCase().includes(kw);
        }
        return true;
    });

    if (selectedInquiry) {
        return (
            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(null)}>
                        <ArrowLeftOutlined />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedInquiry.title}</h1>
                    <Badge variant={STATUS_VARIANTS[selectedInquiry.status]}>{STATUS_LABELS[selectedInquiry.status]}</Badge>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-5">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div><span className="text-gray-500">작성자:</span> {selectedInquiry.authorName}</div>
                            <div><span className="text-gray-500">이메일:</span> {selectedInquiry.authorEmail}</div>
                            {selectedInquiry.authorPhone && <div><span className="text-gray-500">연락처:</span> {selectedInquiry.authorPhone}</div>}
                            {selectedInquiry.storeName && <div><span className="text-gray-500">매장:</span> {selectedInquiry.storeName}</div>}
                            <div><span className="text-gray-500">분류:</span> {CATEGORY_LABELS[selectedInquiry.category]}</div>
                            <div><span className="text-gray-500">등록일:</span> {selectedInquiry.createdAt.slice(0, 10)}</div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm font-medium text-gray-500 mb-1">문의 내용</p>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{selectedInquiry.content}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">답변</label>
                            <textarea
                                className="form-input w-full min-h-[200px]"
                                value={answer}
                                onChange={e => setAnswer(e.target.value)}
                                placeholder="답변을 입력하세요..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">처리 상태</label>
                            <select className="form-input w-full md:w-60" value={answerStatus} onChange={e => setAnswerStatus(e.target.value as InquiryStatus)}>
                                <option value="in_progress">처리중</option>
                                <option value="resolved">완료</option>
                                <option value="closed">종료</option>
                            </select>
                        </div>

                        {selectedInquiry.answeredAt && (
                            <p className="text-xs text-gray-400">마지막 답변: {selectedInquiry.answeredBy} ({selectedInquiry.answeredAt.slice(0, 10)})</p>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setSelectedInquiry(null)}>목록으로</Button>
                            <Button onClick={handleSubmitAnswer} disabled={!answer.trim()}>답변 저장</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

            {/* 통계 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['pending', 'in_progress', 'resolved', 'closed'] as InquiryStatus[]).map(s => (
                    <Card key={s} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setStatusFilter(s); handleSearch(); }}>
                        <CardContent className="p-4 flex items-center gap-3">
                            {s === 'pending' && <ExclamationCircleOutlined className="text-yellow-500 text-xl" />}
                            {s === 'in_progress' && <ClockCircleOutlined className="text-blue-500 text-xl" />}
                            {s === 'resolved' && <CheckCircleOutlined className="text-green-500 text-xl" />}
                            {s === 'closed' && <MessageOutlined className="text-gray-400 text-xl" />}
                            <div>
                                <p className="text-xs text-gray-500">{STATUS_LABELS[s]}</p>
                                <p className="text-lg font-bold">{inquiries.filter(i => i.status === s).length}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* 필터 */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <SearchInput placeholder="제목 또는 작성자 검색" value={keyword} onChange={setKeyword} onSearch={handleSearch} />
                    </div>
                    <select className="form-input w-full md:w-40" value={statusFilter} onChange={e => setStatusFilter(e.target.value as InquiryStatus)}>
                        <option value="">전체 상태</option>
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            {/* 목록 */}
            <Card>
                <DataTable<Inquiry>
                    columns={[
                        {
                            key: 'category',
                            header: '분류',
                            render: (item) => (
                                <Badge variant="default">{CATEGORY_LABELS[item.category]}</Badge>
                            ),
                        },
                        {
                            key: 'title',
                            header: '제목',
                            render: (item) => (
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{item.title}</div>
                                    <div className="text-xs text-gray-400 truncate max-w-xs">{item.content}</div>
                                </div>
                            ),
                        },
                        {
                            key: 'author',
                            header: '작성자',
                            render: (item) => (
                                <div>
                                    <div className="text-sm text-gray-900">{item.authorName}</div>
                                    {item.storeName && <div className="text-xs text-gray-400">{item.storeName}</div>}
                                </div>
                            ),
                        },
                        {
                            key: 'status',
                            header: '상태',
                            render: (item) => (
                                <Badge variant={STATUS_VARIANTS[item.status]}>{STATUS_LABELS[item.status]}</Badge>
                            ),
                        },
                        {
                            key: 'createdAt',
                            header: '등록일',
                            render: (item) => (
                                <span className="text-sm text-gray-500 whitespace-nowrap">{item.createdAt.slice(0, 10)}</span>
                            ),
                        },
                        {
                            key: 'action',
                            header: '관리',
                            className: 'text-center',
                            render: (item) => (
                                <Button variant="outline" size="sm" onClick={() => handleSelectInquiry(item)}>
                                    {item.status === 'pending' ? '답변하기' : '상세보기'}
                                </Button>
                            ),
                        },
                    ]}
                    data={filteredInquiries}
                    isLoading={loading}
                    keyExtractor={(item) => item.id}
                />
            </Card>
        </div>
    );
}
