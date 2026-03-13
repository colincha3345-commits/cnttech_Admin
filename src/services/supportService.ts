/**
 * 고객센터 서비스
 */
import { apiClient, IS_MOCK_MODE } from '@/lib/api/apiClient';
import type { Inquiry, InquiryFormData, InquiryType, InquiryStatus, Faq, FaqFormData, FaqCategory } from '@/types/support';

// Mock 데이터
const MOCK_INQUIRIES: Inquiry[] = [
    { id: 'inq-001', type: 'customer', category: 'order', title: '주문 취소 요청', content: '주문번호 ORD-2026-001 취소 부탁드립니다.', authorName: '김고객', authorEmail: 'kim@example.com', authorPhone: '010-1234-5678', status: 'pending', createdAt: '2026-02-25T10:30:00Z', updatedAt: '2026-02-25T10:30:00Z' },
    { id: 'inq-002', type: 'customer', category: 'payment', title: '결제 오류 문의', content: '카드 결제가 두 번 되었습니다.', authorName: '이고객', authorEmail: 'lee@example.com', status: 'pending', answer: '확인 중입니다.', answeredBy: '관리자', answeredAt: '2026-02-25T14:00:00Z', createdAt: '2026-02-24T09:00:00Z', updatedAt: '2026-02-25T14:00:00Z' },
    { id: 'inq-003', type: 'customer', category: 'delivery', title: '배달 지연 문의', content: '1시간째 배달이 안 오고 있습니다.', authorName: '박고객', authorEmail: 'park@example.com', authorPhone: '010-9876-5432', status: 'resolved', answer: '죄송합니다. 배달이 완료되었습니다. 쿠폰을 발급해드렸습니다.', answeredBy: '관리자', answeredAt: '2026-02-23T16:00:00Z', createdAt: '2026-02-23T14:00:00Z', updatedAt: '2026-02-23T16:00:00Z' },
    { id: 'inq-004', type: 'franchise', category: 'account', title: '가맹점 계정 문의', content: 'POS 연동 계정 초기화 부탁드립니다.', authorName: '최사장', authorEmail: 'choi@store.com', storeId: 'store-1', storeName: '강남점', status: 'pending', createdAt: '2026-02-26T08:00:00Z', updatedAt: '2026-02-26T08:00:00Z' },
    { id: 'inq-005', type: 'franchise', category: 'payment', title: '정산 금액 오류', content: '이번 달 정산 금액이 맞지 않습니다.', authorName: '정사장', authorEmail: 'jung@store.com', storeId: 'store-2', storeName: '홍대점', status: 'pending', answer: '확인 후 회신드리겠습니다.', answeredBy: '정산팀', answeredAt: '2026-02-25T11:00:00Z', createdAt: '2026-02-24T10:00:00Z', updatedAt: '2026-02-25T11:00:00Z' },
];

const MOCK_FAQS: Faq[] = [
    { id: 'faq-001', category: 'general', question: '영업시간은 어떻게 되나요?', answer: '각 매장별 영업시간은 매장 상세 페이지에서 확인하실 수 있습니다.', sortOrder: 1, isPublished: true, viewCount: 1520, createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-01-10T10:00:00Z' },
    { id: 'faq-002', category: 'order', question: '주문 취소는 어떻게 하나요?', answer: '주문 후 5분 이내에는 앱에서 직접 취소가 가능하며, 이후에는 고객센터로 문의해주세요.', sortOrder: 2, isPublished: true, viewCount: 3240, createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-01-10T10:00:00Z' },
    { id: 'faq-003', category: 'payment', question: '사용 가능한 결제 수단은?', answer: '신용/체크카드, 카카오페이, 네이버페이, 토스 등을 지원합니다.', sortOrder: 3, isPublished: true, viewCount: 890, createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-01-10T10:00:00Z' },
    { id: 'faq-004', category: 'delivery', question: '배달 소요 시간은?', answer: '평균 30~40분이며, 주문 폭주 시 지연될 수 있습니다.', sortOrder: 4, isPublished: true, viewCount: 2100, createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
    { id: 'faq-005', category: 'franchise', question: '가맹 문의는 어디로 하나요?', answer: '가맹 상담 전화(1588-0000) 또는 홈페이지 가맹문의 페이지를 이용해주세요.', sortOrder: 5, isPublished: true, viewCount: 450, createdAt: '2026-01-15T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z' },
    { id: 'faq-006', category: 'account', question: '비밀번호를 잊었어요', answer: '로그인 화면에서 "비밀번호 찾기"를 클릭하여 재설정할 수 있습니다.', sortOrder: 6, isPublished: false, viewCount: 670, createdAt: '2026-02-01T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z' },
];

let inquiries = [...MOCK_INQUIRIES];
let faqs = [...MOCK_FAQS];

// 문의 서비스
async function getInquiries(params?: { type?: InquiryType; status?: InquiryStatus; keyword?: string; page?: number; limit?: number }) {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 20;

    if (IS_MOCK_MODE) {
        let filtered = [...inquiries];
        if (params?.type) filtered = filtered.filter(i => i.type === params.type);
        if (params?.status) filtered = filtered.filter(i => i.status === params.status);
        if (params?.keyword) {
            const kw = params.keyword.toLowerCase();
            filtered = filtered.filter(i => i.title.toLowerCase().includes(kw) || i.authorName.toLowerCase().includes(kw));
        }
        filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + limit);
        return { data: paged, pagination: { page, limit, total, totalPages } };
    }
    const query = new URLSearchParams();
    if (params?.type) query.set('type', params.type);
    if (params?.status) query.set('status', params.status);
    if (params?.keyword) query.set('keyword', params.keyword);
    query.set('page', String(page));
    query.set('limit', String(limit));
    return apiClient.get<{ data: Inquiry[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/support/inquiries?${query.toString()}`);
}

async function getInquiry(id: string) {
    if (IS_MOCK_MODE) {
        const item = inquiries.find(i => i.id === id);
        return item || null;
    }
    return apiClient.get<Inquiry>(`/support/inquiries/${id}`);
}

async function answerInquiry(id: string, data: InquiryFormData) {
    if (IS_MOCK_MODE) {
        const idx = inquiries.findIndex(i => i.id === id);
        if (idx === -1) return null;
        const updated = { ...inquiries[idx], answer: data.answer, status: data.status, answeredBy: '관리자', answeredAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Inquiry;
        inquiries[idx] = updated;
        return updated;
    }
    return apiClient.patch<Inquiry>(`/support/inquiries/${id}`, data);
}

// FAQ 서비스
async function getFaqs(params?: { category?: FaqCategory; keyword?: string }) {
    if (IS_MOCK_MODE) {
        let filtered = [...faqs];
        if (params?.category) filtered = filtered.filter(f => f.category === params.category);
        if (params?.keyword) {
            const kw = params.keyword.toLowerCase();
            filtered = filtered.filter(f => f.question.toLowerCase().includes(kw) || f.answer.toLowerCase().includes(kw));
        }
        return { data: filtered.sort((a, b) => a.sortOrder - b.sortOrder) };
    }
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.keyword) query.set('keyword', params.keyword);
    return apiClient.get<{ data: Faq[] }>(`/support/faqs?${query.toString()}`);
}

async function createFaq(data: FaqFormData) {
    if (IS_MOCK_MODE) {
        const newFaq: Faq = { id: `faq-${String(faqs.length + 1).padStart(3, '0')}`, ...data, viewCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
        faqs.push(newFaq);
        return newFaq;
    }
    return apiClient.post<Faq>('/support/faqs', data);
}

async function updateFaq(id: string, data: Partial<FaqFormData>) {
    if (IS_MOCK_MODE) {
        const idx = faqs.findIndex(f => f.id === id);
        if (idx === -1) return null;
        const updated = { ...faqs[idx], ...data, updatedAt: new Date().toISOString() } as Faq;
        faqs[idx] = updated;
        return updated;
    }
    return apiClient.patch<Faq>(`/support/faqs/${id}`, data);
}

async function deleteFaq(id: string) {
    if (IS_MOCK_MODE) {
        faqs = faqs.filter(f => f.id !== id);
        return true;
    }
    return apiClient.delete(`/support/faqs/${id}`);
}

export const supportService = {
    getInquiries,
    getInquiry,
    answerInquiry,
    getFaqs,
    createFaq,
    updateFaq,
    deleteFaq,
};
