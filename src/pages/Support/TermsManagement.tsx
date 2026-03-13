import { useState } from 'react';
import {
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    SaveOutlined,
    FileProtectOutlined,
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
    Label,
    Switch,
    Textarea,
    MultiImageUpload,
    RichTextEditor,
} from '@/components/ui';
import { useTerms } from '@/hooks/useContent';
import type { Terms, TermsFormData, TermsType, TermsStatus } from '@/types/content';

const TERMS_TYPE_LABELS: Record<TermsType, string> = {
    service: '이용약관',
    privacy: '개인정보 처리방침',
    marketing: '마케팅 수신 동의',
    location: '위치정보 이용약관',
    thirdparty: '제3자 제공 동의',
    refund: '환불 정책',
};

const TERMS_STATUS_LABELS: Record<TermsStatus, string> = {
    draft: '임시저장',
    active: '시행 중',
    expired: '만료',
};

const STATUS_BADGE_VARIANT: Record<TermsStatus, 'warning' | 'success' | 'secondary'> = {
    draft: 'warning',
    active: 'success',
    expired: 'secondary',
};

const DEFAULT_FORM: TermsFormData = {
    type: 'service',
    title: '',
    content: '',
    version: '1.0',
    isRequired: true,
    effectiveDate: '',
    noticeDate: '',
    status: 'draft',
    attachments: [],
};

export function TermsManagement() {
    const { termsList, loading, fetchTerms, createTerms, updateTerms, deleteTerms } = useTerms();
    const [keyword, setKeyword] = useState('');
    const [typeFilter, setTypeFilter] = useState<TermsType | ''>('');
    const [statusFilter, setStatusFilter] = useState<TermsStatus | ''>('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTerms, setEditingTerms] = useState<Terms | null>(null);
    const [formData, setFormData] = useState<TermsFormData>(DEFAULT_FORM);
    const [deleteTarget, setDeleteTarget] = useState<Terms | null>(null);
    const [_attachmentFiles, setAttachmentFiles] = useState<File[]>([]);

    const handleNew = () => {
        setEditingTerms(null);
        setFormData(DEFAULT_FORM);
        setAttachmentFiles([]);
        setIsFormOpen(true);
    };

    const handleEdit = (terms: Terms) => {
        setEditingTerms(terms);
        setFormData({
            type: terms.type,
            title: terms.title,
            content: terms.content,
            version: terms.version,
            isRequired: terms.isRequired,
            effectiveDate: terms.effectiveDate,
            noticeDate: terms.noticeDate || '',
            status: terms.status,
            attachments: terms.attachments || [],
        });
        setAttachmentFiles([]);
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        const titleText = formData.title.replace(/<br\s*\/?>/g, '').trim();
        if (!titleText) return;
        if (titleText.length > 100) return;
        if (!formData.content.trim()) return;
        if (!formData.version.trim()) return;
        if (!formData.effectiveDate) return;

        const success = editingTerms
            ? await updateTerms(editingTerms.id, formData)
            : await createTerms(formData);
        if (success) {
            setIsFormOpen(false);
            setEditingTerms(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        await deleteTerms(deleteTarget.id);
        setDeleteTarget(null);
    };

    const handleSearch = () => {
        fetchTerms({
            type: typeFilter || undefined,
            status: statusFilter || undefined,
            keyword: keyword || undefined,
        });
    };

    const filteredTerms = termsList.filter((t) => {
        if (typeFilter && t.type !== typeFilter) return false;
        if (statusFilter && t.status !== statusFilter) return false;
        return true;
    });

    if (isFormOpen) {
        return (
            <div className="space-y-6 px-4 py-6">
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
                        <ArrowLeftOutlined />
                    </Button>
                    <h1 className="text-2xl font-bold text-txt-main">
                        {editingTerms ? '약관 수정' : '약관 등록'}
                    </h1>
                </div>

                <Card>
                    <CardContent className="p-6 space-y-5">
                        {/* 약관 유형 + 상태 */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label required>약관 유형</Label>
                                <select
                                    className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as TermsType })}
                                >
                                    {Object.entries(TERMS_TYPE_LABELS).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <Label>상태</Label>
                                <select
                                    className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as TermsStatus })}
                                >
                                    {Object.entries(TERMS_STATUS_LABELS).map(([v, l]) => (
                                        <option key={v} value={v}>{l}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* 제목 (BR 태그 지원) */}
                        <div className="space-y-1">
                            <Label required>제목</Label>
                            <Textarea
                                value={formData.title}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val.replace(/<br\s*\/?>/g, '').length <= 100) {
                                        setFormData({ ...formData, title: val });
                                    }
                                }}
                                placeholder="약관 제목 (줄바꿈: <br> 태그 사용 가능)"
                                rows={2}
                                maxLength={300}
                            />
                            <p className="text-xs text-txt-muted">
                                {formData.title.replace(/<br\s*\/?>/g, '').length}/100자 · &lt;br&gt; 태그로 줄바꿈 가능
                            </p>
                        </div>

                        {/* 본문 (에디터) */}
                        <div className="space-y-1">
                            <Label required>본문</Label>
                            <RichTextEditor
                                value={formData.content}
                                onChange={(html) => {
                                    if (html.length <= 50000) {
                                        setFormData({ ...formData, content: html });
                                    }
                                }}
                                placeholder="약관 본문을 입력하세요"
                            />
                            <p className="text-xs text-txt-muted">{formData.content.length.toLocaleString()}/50,000자</p>
                        </div>

                        {/* 버전 + 날짜 */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <Label required>버전</Label>
                                <input
                                    type="text"
                                    className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                                    value={formData.version}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 10) {
                                            setFormData({ ...formData, version: e.target.value });
                                        }
                                    }}
                                    placeholder="1.0"
                                    maxLength={10}
                                />
                                <p className="text-xs text-txt-muted">{formData.version.length}/10자</p>
                            </div>
                            <div className="space-y-1">
                                <Label>공고일</Label>
                                <input
                                    type="date"
                                    className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                                    value={formData.noticeDate || ''}
                                    onChange={(e) => setFormData({ ...formData, noticeDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label required>시행일</Label>
                                <input
                                    type="date"
                                    className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                                    value={formData.effectiveDate}
                                    onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* 필수 여부 */}
                        <div className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                            <Switch
                                checked={formData.isRequired}
                                onCheckedChange={(checked) => setFormData({ ...formData, isRequired: checked })}
                            />
                            <div>
                                <Label>필수 약관 여부</Label>
                                <p className="text-sm text-txt-muted">
                                    {formData.isRequired ? '사용자 동의가 필수입니다' : '선택 동의 약관입니다'}
                                </p>
                            </div>
                        </div>

                        {/* 이미지 첨부 */}
                        <div className="space-y-1">
                            <Label>이미지 첨부</Label>
                            <MultiImageUpload
                                value={formData.attachments || []}
                                onChange={(files) => setAttachmentFiles(files)}
                                maxFiles={5}
                                maxSize={10 * 1024 * 1024}
                            />
                            <p className="text-xs text-txt-muted">JPG, PNG, WEBP (개당 최대 10MB, 최대 5장)</p>
                        </div>

                        {/* 버튼 */}
                        <div className="flex justify-end gap-3 pt-4 border-t border-border">
                            <Button variant="outline" onClick={() => setIsFormOpen(false)}>취소</Button>
                            <Button
                                onClick={handleSave}
                                disabled={
                                    !formData.title.replace(/<br\s*\/?>/g, '').trim() ||
                                    !formData.content.trim() ||
                                    !formData.version.trim() ||
                                    !formData.effectiveDate
                                }
                            >
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
                <h1 className="text-2xl font-bold text-txt-main">약관관리</h1>
                <Button onClick={handleNew}>
                    <span className="flex items-center gap-2"><PlusOutlined /> 약관 등록</span>
                </Button>
            </div>

            {/* 필터 */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <SearchInput placeholder="제목 또는 내용 검색" value={keyword} onChange={setKeyword} onSearch={handleSearch} />
                    </div>
                    <div className="w-full md:w-40">
                        <label className="block text-xs font-medium text-txt-muted mb-1">약관 유형</label>
                        <select
                            className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                            value={typeFilter}
                            onChange={(e) => { setTypeFilter(e.target.value as TermsType | ''); fetchTerms({ type: (e.target.value as TermsType) || undefined, status: statusFilter || undefined, keyword: keyword || undefined }); }}
                        >
                            <option value="">전체</option>
                            {Object.entries(TERMS_TYPE_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-32">
                        <label className="block text-xs font-medium text-txt-muted mb-1">상태</label>
                        <select
                            className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value as TermsStatus | ''); fetchTerms({ type: typeFilter || undefined, status: (e.target.value as TermsStatus) || undefined, keyword: keyword || undefined }); }}
                        >
                            <option value="">전체</option>
                            {Object.entries(TERMS_STATUS_LABELS).map(([v, l]) => (
                                <option key={v} value={v}>{l}</option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* 목록 */}
            <Card>
                <DataTable<Terms>
                    columns={[
                        {
                            key: 'type',
                            header: '유형',
                            render: (item) => (
                                <Badge variant="default">
                                    <span className="flex items-center gap-1">
                                        <FileProtectOutlined style={{ fontSize: 12 }} />
                                        {TERMS_TYPE_LABELS[item.type]}
                                    </span>
                                </Badge>
                            ),
                        },
                        {
                            key: 'title',
                            header: '제목',
                            render: (item) => (
                                <div>
                                    <div className="text-sm font-medium text-txt-main">{item.title}</div>
                                    <div className="text-xs text-txt-muted mt-0.5">v{item.version} · {item.isRequired ? '필수' : '선택'}</div>
                                </div>
                            ),
                        },
                        {
                            key: 'status',
                            header: '상태',
                            className: 'text-center',
                            render: (item) => (
                                <Badge variant={STATUS_BADGE_VARIANT[item.status]}>
                                    {TERMS_STATUS_LABELS[item.status]}
                                </Badge>
                            ),
                        },
                        {
                            key: 'noticeDate',
                            header: '공고일',
                            render: (item) => (
                                <span className="text-sm text-txt-muted font-mono">{item.noticeDate || '-'}</span>
                            ),
                        },
                        {
                            key: 'effectiveDate',
                            header: '시행일',
                            render: (item) => (
                                <span className="text-sm text-txt-main font-mono">{item.effectiveDate}</span>
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
                    data={filteredTerms}
                    isLoading={loading}
                    keyExtractor={(item) => item.id}
                />
            </Card>

            <ConfirmDialog
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
                title="약관 삭제"
                message={`"${deleteTarget?.title}" 약관을 삭제하시겠습니까?`}
                confirmText="삭제"
                type="warning"
            />
        </div>
    );
}
