import { useState, useCallback, useEffect } from 'react';
import { contentService } from '@/services/contentService';
import type {
  Notice, NoticeFormData, NoticeCategory, NoticeStatus,
  BrandStory, BrandStoryFormData, BrandStoryCategory, BrandStoryStatus,
  PressRelease, PressReleaseFormData, PressReleaseStatus,
  Terms, TermsFormData, TermsType, TermsStatus,
} from '@/types/content';
import { useToast } from '@/hooks/useToast';

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchNotices = useCallback(async (params?: { category?: NoticeCategory; status?: NoticeStatus; keyword?: string }) => {
    setLoading(true);
    try {
      const res = await contentService.getNotices(params);
      setNotices(res.data);
    } catch {
      toast.error('공지사항 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchNotices(); }, [fetchNotices]);

  const createNotice = async (data: NoticeFormData) => {
    try {
      await contentService.createNotice(data);
      await fetchNotices();
      toast.success('공지사항이 등록되었습니다.');
      return true;
    } catch {
      toast.error('공지사항 등록에 실패했습니다.');
      return false;
    }
  };

  const updateNotice = async (id: string, data: Partial<NoticeFormData>) => {
    try {
      await contentService.updateNotice(id, data);
      await fetchNotices();
      toast.success('공지사항이 수정되었습니다.');
      return true;
    } catch {
      toast.error('공지사항 수정에 실패했습니다.');
      return false;
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      await contentService.deleteNotice(id);
      await fetchNotices();
      toast.success('공지사항이 삭제되었습니다.');
      return true;
    } catch {
      toast.error('공지사항 삭제에 실패했습니다.');
      return false;
    }
  };

  return { notices, loading, fetchNotices, createNotice, updateNotice, deleteNotice };
}

export function useBrandStories() {
  const [brandStories, setBrandStories] = useState<BrandStory[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchBrandStories = useCallback(async (params?: { category?: BrandStoryCategory; status?: BrandStoryStatus; keyword?: string }) => {
    setLoading(true);
    try {
      const res = await contentService.getBrandStories(params);
      setBrandStories(res.data);
    } catch {
      toast.error('브랜드 스토리 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchBrandStories(); }, [fetchBrandStories]);

  const createBrandStory = async (data: BrandStoryFormData) => {
    try {
      await contentService.createBrandStory(data);
      await fetchBrandStories();
      toast.success('브랜드 스토리가 등록되었습니다.');
      return true;
    } catch {
      toast.error('브랜드 스토리 등록에 실패했습니다.');
      return false;
    }
  };

  const updateBrandStory = async (id: string, data: Partial<BrandStoryFormData>) => {
    try {
      await contentService.updateBrandStory(id, data);
      await fetchBrandStories();
      toast.success('브랜드 스토리가 수정되었습니다.');
      return true;
    } catch {
      toast.error('브랜드 스토리 수정에 실패했습니다.');
      return false;
    }
  };

  const deleteBrandStory = async (id: string) => {
    try {
      await contentService.deleteBrandStory(id);
      await fetchBrandStories();
      toast.success('브랜드 스토리가 삭제되었습니다.');
      return true;
    } catch {
      toast.error('브랜드 스토리 삭제에 실패했습니다.');
      return false;
    }
  };

  return { brandStories, loading, fetchBrandStories, createBrandStory, updateBrandStory, deleteBrandStory };
}

export function usePressReleases() {
  const [pressReleases, setPressReleases] = useState<PressRelease[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchPressReleases = useCallback(async (params?: { status?: PressReleaseStatus; keyword?: string }) => {
    setLoading(true);
    try {
      const res = await contentService.getPressReleases(params);
      setPressReleases(res.data);
    } catch {
      toast.error('보도자료 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchPressReleases(); }, [fetchPressReleases]);

  const createPressRelease = async (data: PressReleaseFormData) => {
    try {
      await contentService.createPressRelease(data);
      await fetchPressReleases();
      toast.success('보도자료가 등록되었습니다.');
      return true;
    } catch {
      toast.error('보도자료 등록에 실패했습니다.');
      return false;
    }
  };

  const updatePressRelease = async (id: string, data: Partial<PressReleaseFormData>) => {
    try {
      await contentService.updatePressRelease(id, data);
      await fetchPressReleases();
      toast.success('보도자료가 수정되었습니다.');
      return true;
    } catch {
      toast.error('보도자료 수정에 실패했습니다.');
      return false;
    }
  };

  const deletePressRelease = async (id: string) => {
    try {
      await contentService.deletePressRelease(id);
      await fetchPressReleases();
      toast.success('보도자료가 삭제되었습니다.');
      return true;
    } catch {
      toast.error('보도자료 삭제에 실패했습니다.');
      return false;
    }
  };

  return { pressReleases, loading, fetchPressReleases, createPressRelease, updatePressRelease, deletePressRelease };
}

export function useTerms() {
  const [termsList, setTermsList] = useState<Terms[]>([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fetchTerms = useCallback(async (params?: { type?: TermsType; status?: TermsStatus; keyword?: string }) => {
    setLoading(true);
    try {
      const res = await contentService.getTermsList(params);
      setTermsList(res.data);
    } catch {
      toast.error('약관 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchTerms(); }, [fetchTerms]);

  const fetchVersions = async (type: TermsType) => {
    try {
      const res = await contentService.getTermsVersions(type);
      return res.data;
    } catch {
      toast.error('버전 목록을 불러오는데 실패했습니다.');
      return [];
    }
  };

  const createTerms = async (data: TermsFormData) => {
    try {
      await contentService.createTerms(data);
      await fetchTerms();
      toast.success('약관이 등록되었습니다.');
      return true;
    } catch {
      toast.error('약관 등록에 실패했습니다.');
      return false;
    }
  };

  const updateTerms = async (id: string, data: Partial<TermsFormData>) => {
    try {
      await contentService.updateTerms(id, data);
      await fetchTerms();
      toast.success('약관이 수정되었습니다.');
      return true;
    } catch {
      toast.error('약관 수정에 실패했습니다.');
      return false;
    }
  };

  const deleteTerms = async (id: string) => {
    try {
      await contentService.deleteTerms(id);
      await fetchTerms();
      toast.success('약관이 삭제되었습니다.');
      return true;
    } catch {
      toast.error('약관 삭제에 실패했습니다.');
      return false;
    }
  };

  return { termsList, loading, fetchTerms, fetchVersions, createTerms, updateTerms, deleteTerms };
}
