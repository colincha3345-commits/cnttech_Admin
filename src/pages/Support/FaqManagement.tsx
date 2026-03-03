import { useState } from 'react';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    SaveOutlined,
    ArrowLeftOutlined,
} from '@ant-design/icons';
import {
    Card,
    CardContent,
    Button,
    Badge,
    SearchInput,
    DataTable,
    ConfirmDialog,
} from '@/components/ui';
import { useFaqs } from '@/hooks/useSupport';
import type { Faq, FaqFormData, FaqCategory } from '@/types/support';

const CATEGORY_LABELS: Record<FaqCategory, string> = {
    general: '일반',
    order: '주문',
    payment: '결제',
    delivery: '배달',
    account: '계정',
    franchise: '가맹',
};

const DEFAULT_FORM: FaqFormData = {
    category: 'general',
    question: '',
    answer: '',
    sortOrder: 0,
    isPublished: true,
};

export function FaqManagement() {
    const { faqs, loading, createFaq, updateFaq, deleteFaq } = useFaqs();
    const [keyword, setKeyword] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<FaqCategory | ''>('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
    const [formData, setFormData] = useState<FaqFormData>(DEFAULT_FORM);
    const [deleteTarget, setDeleteTarget] = useState<Faq | null>(null);

    const handleNew = () => {
        setEditingFaq(null);
        setFormData(DEFAULT_FORM);
        setIsFormOpen(true);
    };

    const handleEdit = (faq: Faq) => {
        setEditingFaq(faq);
        setFormData({
            category: faq.category,
            question: faq.question,
            answer: faq.answer,
            sortOrder: faq.sortOrder,
            isPublished: faq.isPublished,
        });
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        if (!formData.question.trim() || !formData.answer.trim()) return;
        const success = editingFaq
            ? await updateFaq(editingFaq.id, formData)
            : await createFaq(formData);
        if (success) {
            setIsFormOpen(false);
            setEditingFaq(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteFaq(deleteTarget.id);
        setDeleteTarget(null);
    };

    const handleTogglePublish = async (faq: Faq) => {
        await updateFaq(faq.id, { isPublished: !faq.isPublished });
    };

    const filteredFaqs = faqs.filter(f => {
        if (categoryFilter && f.category !== categoryFilter) return false;
        if (keyword) {
            const kw = keyword.toLowerCase();
            return f.question.toLowerCase().includes(kw) || f.answer.toLowerCase().includes(kw);
        }
        return true;
    });

    if (isFormOpen) {
        return (
            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                        <ArrowLeftOutlined />
                    </Button>
                    <h1 className="text-2xl font-bold text-gray-900">
                        {editingFaq ? 'FAQ 수정' : 'FAQ 등록'}
                    </h1>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
                                <select className="form-input w-full" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as FaqCategory })}>
                                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">정렬 순서</label>
                                <input type="number" className="form-input w-full" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: Number(e.target.value) })} min={0} />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">질문 *</label>
                            <input type="text" className="form-input w-full" value={formData.question} onChange={e => setFormData({ ...formData, question: e.target.value })} placeholder="자주 묻는 질문을 입력하세요" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">답변 *</label>
                            <textarea className="form-input w-full min-h-[200px]" value={formData.answer} onChange={e => setFormData({ ...formData, answer: e.target.value })} placeholder="답변을 입력하세요" />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} className="accent-primary" />
                            <span className="text-sm text-gray-700">공개 여부</span>
                        </label>
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>취소</Button>
                            <Button onClick={handleSave} disabled={!formData.question.trim() || !formData.answer.trim()}>
                                <span className="flex items-center gap-2"><SaveOutlined /> 저장</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 py-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">FAQ 관리</h1>
                <Button onClick={handleNew}>
                    <span className="flex items-center gap-2"><PlusOutlined /> FAQ 등록</span>
                </Button>
            </div>

            {/* 필터 */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <SearchInput placeholder="질문 또는 답변 검색" value={keyword} onChange={setKeyword} />
                    </div>
                    <select className="form-input w-full md:w-40" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as FaqCategory)}>
                        <option value="">전체 카테고리</option>
                        {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                        ))}
                    </select>
                </CardContent>
            </Card>

            {/* 목록 */}
            <Card>
                <DataTable<Faq>
                    columns={[
                        {
                            key: 'sortOrder',
                            header: '순서',
                            className: 'text-center w-16',
                            render: (item) => <span className="text-sm text-gray-500">{item.sortOrder}</span>,
                        },
                        {
                            key: 'category',
                            header: '카테고리',
                            render: (item) => <Badge variant="default">{CATEGORY_LABELS[item.category]}</Badge>,
                        },
                        {
                            key: 'question',
                            header: '질문',
                            render: (item) => (
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{item.question}</div>
                                    <div className="text-xs text-gray-400 truncate max-w-md">{item.answer}</div>
                                </div>
                            ),
                        },
                        {
                            key: 'viewCount',
                            header: '조회수',
                            className: 'text-right',
                            render: (item) => <span className="text-sm text-gray-500 font-mono">{item.viewCount.toLocaleString()}</span>,
                        },
                        {
                            key: 'isPublished',
                            header: '공개',
                            className: 'text-center',
                            render: (item) => (
                                <button onClick={() => handleTogglePublish(item)} className="text-lg">
                                    {item.isPublished
                                        ? <EyeOutlined className="text-green-500" />
                                        : <EyeInvisibleOutlined className="text-gray-300" />}
                                </button>
                            ),
                        },
                        {
                            key: 'action',
                            header: '관리',
                            className: 'text-center',
                            render: (item) => (
                                <div className="flex items-center justify-center gap-2">
                                    <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                                        <EditOutlined />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setDeleteTarget(item)}>
                                        <DeleteOutlined className="text-red-500" />
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    data={filteredFaqs}
                    isLoading={loading}
                    keyExtractor={(item) => item.id}
                />
            </Card>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="FAQ 삭제"
                message={`"${deleteTarget?.question}" FAQ를 삭제하시겠습니까?`}
                confirmText="삭제"
                type="warning"
            />
        </div>
    );
}
