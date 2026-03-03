import { useState, useCallback, useEffect } from 'react';
import { supportService } from '@/services/supportService';
import type { Inquiry, InquiryFormData, InquiryType, InquiryStatus, Faq, FaqFormData, FaqCategory } from '@/types/support';
import { useToast } from '@/hooks/useToast';

export function useInquiries(type: InquiryType) {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchInquiries = useCallback(async (params?: { status?: InquiryStatus; keyword?: string }) => {
        setLoading(true);
        try {
            const res = await supportService.getInquiries({ type, ...params });
            setInquiries(res.data);
        } catch {
            toast.error('문의 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [type, toast]);

    useEffect(() => {
        fetchInquiries();
    }, [fetchInquiries]);

    const answerInquiry = async (id: string, data: InquiryFormData) => {
        try {
            await supportService.answerInquiry(id, data);
            await fetchInquiries();
            toast.success('답변이 등록되었습니다.');
            return true;
        } catch {
            toast.error('답변 등록에 실패했습니다.');
            return false;
        }
    };

    return { inquiries, loading, fetchInquiries, answerInquiry };
}

export function useFaqs() {
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchFaqs = useCallback(async (params?: { category?: FaqCategory; keyword?: string }) => {
        setLoading(true);
        try {
            const res = await supportService.getFaqs(params);
            setFaqs(res.data);
        } catch {
            toast.error('FAQ 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchFaqs();
    }, [fetchFaqs]);

    const createFaq = async (data: FaqFormData) => {
        try {
            await supportService.createFaq(data);
            await fetchFaqs();
            toast.success('FAQ가 등록되었습니다.');
            return true;
        } catch {
            toast.error('FAQ 등록에 실패했습니다.');
            return false;
        }
    };

    const updateFaq = async (id: string, data: Partial<FaqFormData>) => {
        try {
            await supportService.updateFaq(id, data);
            await fetchFaqs();
            toast.success('FAQ가 수정되었습니다.');
            return true;
        } catch {
            toast.error('FAQ 수정에 실패했습니다.');
            return false;
        }
    };

    const deleteFaq = async (id: string) => {
        try {
            await supportService.deleteFaq(id);
            await fetchFaqs();
            toast.success('FAQ가 삭제되었습니다.');
            return true;
        } catch {
            toast.error('FAQ 삭제에 실패했습니다.');
            return false;
        }
    };

    return { faqs, loading, fetchFaqs, createFaq, updateFaq, deleteFaq };
}
