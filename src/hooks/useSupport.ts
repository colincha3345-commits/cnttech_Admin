/**
 * 고객센터 React Query 훅
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportService } from '@/services/supportService';
import type { InquiryFormData, InquiryType, InquiryStatus, FaqFormData, FaqCategory } from '@/types/support';
import { useToast } from '@/hooks/useToast';

const SUPPORT_KEYS = {
    inquiries: (type: InquiryType, params?: Record<string, unknown>) => ['support', 'inquiries', type, params] as const,
    faqs: (params?: Record<string, unknown>) => ['support', 'faqs', params] as const,
};

// ── Inquiries ──

interface InquiryParams {
    status?: InquiryStatus;
    keyword?: string;
    page?: number;
    limit?: number;
}

export function useInquiries(type: InquiryType) {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [params, setParams] = useState<InquiryParams>({});

    const { data, isLoading: loading } = useQuery({
        queryKey: SUPPORT_KEYS.inquiries(type, params as Record<string, unknown>),
        queryFn: () => supportService.getInquiries({ type, ...params }),
    });

    const inquiries = data?.data ?? [];
    const pagination = data?.pagination ?? null;

    const fetchInquiries = (newParams?: InquiryParams) => {
        setParams(newParams ?? {});
    };

    const answerMutation = useMutation({
        mutationFn: ({ id, formData }: { id: string; formData: InquiryFormData }) =>
            supportService.answerInquiry(id, formData),
        onSuccess: (_data, { formData }) => {
            queryClient.invalidateQueries({ queryKey: ['support', 'inquiries'] });
            toast.success(formData.sendEmail ? '답변이 등록되고 메일이 발송되었습니다.' : '답변이 등록되었습니다.');
        },
        onError: () => toast.error('답변 등록에 실패했습니다.'),
    });

    const answerInquiry = async (id: string, data: InquiryFormData) => {
        try { await answerMutation.mutateAsync({ id, formData: data }); return true; } catch { return false; }
    };

    return { inquiries, pagination, loading, fetchInquiries, answerInquiry };
}

// ── FAQs ──

export function useFaqs() {
    const queryClient = useQueryClient();
    const toast = useToast();
    const [params, setParams] = useState<{ category?: FaqCategory; keyword?: string }>({});

    const { data, isLoading: loading } = useQuery({
        queryKey: SUPPORT_KEYS.faqs(params as Record<string, unknown>),
        queryFn: () => supportService.getFaqs(params),
    });

    const faqs = data?.data ?? [];

    const fetchFaqs = (newParams?: { category?: FaqCategory; keyword?: string }) => {
        setParams(newParams ?? {});
    };

    const createMutation = useMutation({
        mutationFn: (data: FaqFormData) => supportService.createFaq(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support', 'faqs'] });
            toast.success('FAQ가 등록되었습니다.');
        },
        onError: () => toast.error('FAQ 등록에 실패했습니다.'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<FaqFormData> }) =>
            supportService.updateFaq(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support', 'faqs'] });
            toast.success('FAQ가 수정되었습니다.');
        },
        onError: () => toast.error('FAQ 수정에 실패했습니다.'),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => supportService.deleteFaq(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['support', 'faqs'] });
            toast.success('FAQ가 삭제되었습니다.');
        },
        onError: () => toast.error('FAQ 삭제에 실패했습니다.'),
    });

    const createFaq = async (data: FaqFormData) => {
        try { await createMutation.mutateAsync(data); return true; } catch { return false; }
    };

    const updateFaq = async (id: string, data: Partial<FaqFormData>) => {
        try { await updateMutation.mutateAsync({ id, data }); return true; } catch { return false; }
    };

    const deleteFaq = async (id: string) => {
        try { await deleteMutation.mutateAsync(id); return true; } catch { return false; }
    };

    return { faqs, loading, fetchFaqs, createFaq, updateFaq, deleteFaq };
}
