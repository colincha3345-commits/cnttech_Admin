/**
 * 콘텐츠 관리 React Query 훅
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contentService } from '@/services/contentService';
import type {
  NoticeFormData, NoticeCategory, NoticeStatus,
  BrandStoryFormData, BrandStoryCategory, BrandStoryStatus,
  PressReleaseFormData, PressReleaseStatus,
  TermsFormData, TermsType, TermsStatus,
} from '@/types/content';
import { useToast } from '@/hooks/useToast';

const CONTENT_KEYS = {
  notices: (params?: Record<string, unknown>) => ['content', 'notices', params] as const,
  brandStories: (params?: Record<string, unknown>) => ['content', 'brandStories', params] as const,
  pressReleases: (params?: Record<string, unknown>) => ['content', 'pressReleases', params] as const,
  terms: (params?: Record<string, unknown>) => ['content', 'terms', params] as const,
  termsVersions: (type: TermsType) => ['content', 'termsVersions', type] as const,
};

// ── Notices ──

export function useNotices() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [params, setParams] = useState<{ category?: NoticeCategory; status?: NoticeStatus; keyword?: string }>({});

  const { data, isLoading: loading } = useQuery({
    queryKey: CONTENT_KEYS.notices(params as Record<string, unknown>),
    queryFn: () => contentService.getNotices(params),
  });

  const notices = data?.data ?? [];

  const fetchNotices = (newParams?: { category?: NoticeCategory; status?: NoticeStatus; keyword?: string }) => {
    setParams(newParams ?? {});
  };

  const createMutation = useMutation({
    mutationFn: (data: NoticeFormData) => contentService.createNotice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'notices'] });
      toast.success('공지사항이 등록되었습니다.');
    },
    onError: () => toast.error('공지사항 등록에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NoticeFormData> }) =>
      contentService.updateNotice(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'notices'] });
      toast.success('공지사항이 수정되었습니다.');
    },
    onError: () => toast.error('공지사항 수정에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteNotice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'notices'] });
      toast.success('공지사항이 삭제되었습니다.');
    },
    onError: () => toast.error('공지사항 삭제에 실패했습니다.'),
  });

  const createNotice = async (data: NoticeFormData) => {
    try { await createMutation.mutateAsync(data); return true; } catch { return false; }
  };

  const updateNotice = async (id: string, data: Partial<NoticeFormData>) => {
    try { await updateMutation.mutateAsync({ id, data }); return true; } catch { return false; }
  };

  const deleteNotice = async (id: string) => {
    try { await deleteMutation.mutateAsync(id); return true; } catch { return false; }
  };

  return { notices, loading, fetchNotices, createNotice, updateNotice, deleteNotice };
}

// ── Brand Stories ──

export function useBrandStories() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [params, setParams] = useState<{ category?: BrandStoryCategory; status?: BrandStoryStatus; keyword?: string }>({});

  const { data, isLoading: loading } = useQuery({
    queryKey: CONTENT_KEYS.brandStories(params as Record<string, unknown>),
    queryFn: () => contentService.getBrandStories(params),
  });

  const brandStories = data?.data ?? [];

  const fetchBrandStories = (newParams?: { category?: BrandStoryCategory; status?: BrandStoryStatus; keyword?: string }) => {
    setParams(newParams ?? {});
  };

  const createMutation = useMutation({
    mutationFn: (data: BrandStoryFormData) => contentService.createBrandStory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'brandStories'] });
      toast.success('브랜드 스토리가 등록되었습니다.');
    },
    onError: () => toast.error('브랜드 스토리 등록에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BrandStoryFormData> }) =>
      contentService.updateBrandStory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'brandStories'] });
      toast.success('브랜드 스토리가 수정되었습니다.');
    },
    onError: () => toast.error('브랜드 스토리 수정에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteBrandStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'brandStories'] });
      toast.success('브랜드 스토리가 삭제되었습니다.');
    },
    onError: () => toast.error('브랜드 스토리 삭제에 실패했습니다.'),
  });

  const createBrandStory = async (data: BrandStoryFormData) => {
    try { await createMutation.mutateAsync(data); return true; } catch { return false; }
  };

  const updateBrandStory = async (id: string, data: Partial<BrandStoryFormData>) => {
    try { await updateMutation.mutateAsync({ id, data }); return true; } catch { return false; }
  };

  const deleteBrandStory = async (id: string) => {
    try { await deleteMutation.mutateAsync(id); return true; } catch { return false; }
  };

  return { brandStories, loading, fetchBrandStories, createBrandStory, updateBrandStory, deleteBrandStory };
}

// ── Press Releases ──

export function usePressReleases() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [params, setParams] = useState<{ status?: PressReleaseStatus; keyword?: string }>({});

  const { data, isLoading: loading } = useQuery({
    queryKey: CONTENT_KEYS.pressReleases(params as Record<string, unknown>),
    queryFn: () => contentService.getPressReleases(params),
  });

  const pressReleases = data?.data ?? [];

  const fetchPressReleases = (newParams?: { status?: PressReleaseStatus; keyword?: string }) => {
    setParams(newParams ?? {});
  };

  const createMutation = useMutation({
    mutationFn: (data: PressReleaseFormData) => contentService.createPressRelease(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'pressReleases'] });
      toast.success('보도자료가 등록되었습니다.');
    },
    onError: () => toast.error('보도자료 등록에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PressReleaseFormData> }) =>
      contentService.updatePressRelease(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'pressReleases'] });
      toast.success('보도자료가 수정되었습니다.');
    },
    onError: () => toast.error('보도자료 수정에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deletePressRelease(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'pressReleases'] });
      toast.success('보도자료가 삭제되었습니다.');
    },
    onError: () => toast.error('보도자료 삭제에 실패했습니다.'),
  });

  const createPressRelease = async (data: PressReleaseFormData) => {
    try { await createMutation.mutateAsync(data); return true; } catch { return false; }
  };

  const updatePressRelease = async (id: string, data: Partial<PressReleaseFormData>) => {
    try { await updateMutation.mutateAsync({ id, data }); return true; } catch { return false; }
  };

  const deletePressRelease = async (id: string) => {
    try { await deleteMutation.mutateAsync(id); return true; } catch { return false; }
  };

  return { pressReleases, loading, fetchPressReleases, createPressRelease, updatePressRelease, deletePressRelease };
}

// ── Terms ──

export function useTerms() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const [params, setParams] = useState<{ type?: TermsType; status?: TermsStatus; keyword?: string }>({});

  const { data, isLoading: loading } = useQuery({
    queryKey: CONTENT_KEYS.terms(params as Record<string, unknown>),
    queryFn: () => contentService.getTermsList(params),
  });

  const termsList = data?.data ?? [];

  const fetchTerms = (newParams?: { type?: TermsType; status?: TermsStatus; keyword?: string }) => {
    setParams(newParams ?? {});
  };

  const fetchVersions = async (type: TermsType) => {
    try {
      const res = await contentService.getTermsVersions(type);
      return res.data;
    } catch {
      toast.error('버전 목록을 불러오는데 실패했습니다.');
      return [];
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: TermsFormData) => contentService.createTerms(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'terms'] });
      toast.success('약관이 등록되었습니다.');
    },
    onError: () => toast.error('약관 등록에 실패했습니다.'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TermsFormData> }) =>
      contentService.updateTerms(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'terms'] });
      toast.success('약관이 수정되었습니다.');
    },
    onError: () => toast.error('약관 수정에 실패했습니다.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => contentService.deleteTerms(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content', 'terms'] });
      toast.success('약관이 삭제되었습니다.');
    },
    onError: () => toast.error('약관 삭제에 실패했습니다.'),
  });

  const createTerms = async (data: TermsFormData) => {
    try { await createMutation.mutateAsync(data); return true; } catch { return false; }
  };

  const updateTerms = async (id: string, data: Partial<TermsFormData>) => {
    try { await updateMutation.mutateAsync({ id, data }); return true; } catch { return false; }
  };

  const deleteTerms = async (id: string) => {
    try { await deleteMutation.mutateAsync(id); return true; } catch { return false; }
  };

  return { termsList, loading, fetchTerms, fetchVersions, createTerms, updateTerms, deleteTerms };
}
