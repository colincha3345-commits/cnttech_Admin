/**
 * 콘텐츠 관리 서비스
 */
import { apiClient, IS_MOCK_MODE } from '@/lib/api/apiClient';
import type {
  Notice, NoticeFormData, NoticeCategory, NoticeStatus,
  BrandStory, BrandStoryFormData, BrandStoryCategory, BrandStoryStatus,
  PressRelease, PressReleaseFormData, PressReleaseStatus,
  Terms, TermsFormData, TermsType, TermsStatus, TermsVersion,
} from '@/types/content';

// Mock 데이터 - 공지사항
const MOCK_NOTICES: Notice[] = [
  { id: 'notice-001', category: 'service', title: '서비스 이용약관 변경 안내', content: '2026년 3월 1일부터 서비스 이용약관이 변경됩니다. 주요 변경 사항을 확인해주세요.', isImportant: true, isPinned: true, status: 'published', viewCount: 3420, publishedAt: '2026-02-20T09:00:00Z', createdAt: '2026-02-18T10:00:00Z', updatedAt: '2026-02-20T09:00:00Z', createdBy: '관리자' },
  { id: 'notice-002', category: 'event', title: '봄맞이 할인 이벤트 안내', content: '3월 한 달간 전 매장 10% 할인 이벤트를 진행합니다.', isImportant: false, isPinned: false, status: 'published', viewCount: 1850, publishedAt: '2026-02-22T10:00:00Z', createdAt: '2026-02-21T14:00:00Z', updatedAt: '2026-02-22T10:00:00Z', createdBy: '마케팅팀' },
  { id: 'notice-003', category: 'maintenance', title: '시스템 점검 안내 (2/28)', content: '2026년 2월 28일 02:00~06:00 시스템 점검이 진행됩니다.', isImportant: true, isPinned: false, status: 'published', viewCount: 980, publishedAt: '2026-02-25T09:00:00Z', createdAt: '2026-02-24T16:00:00Z', updatedAt: '2026-02-25T09:00:00Z', createdBy: '개발팀' },
  { id: 'notice-004', category: 'update', title: 'v2.5 업데이트 안내', content: '앱 v2.5 업데이트가 배포되었습니다. 새로운 기능을 확인해보세요.', isImportant: false, isPinned: false, status: 'draft', viewCount: 0, createdAt: '2026-02-26T08:00:00Z', updatedAt: '2026-02-26T08:00:00Z', createdBy: '개발팀' },
  { id: 'notice-005', category: 'etc', title: '고객센터 운영시간 변경', content: '고객센터 운영시간이 09:00~18:00에서 09:00~20:00으로 변경됩니다.', isImportant: false, isPinned: false, status: 'hidden', viewCount: 520, publishedAt: '2026-01-15T09:00:00Z', createdAt: '2026-01-14T10:00:00Z', updatedAt: '2026-02-01T10:00:00Z', createdBy: '관리자' },
];

// Mock 데이터 - 브랜드 스토리
const MOCK_BRAND_STORIES: BrandStory[] = [
  { id: 'brand-001', category: 'brand', title: '우리 브랜드의 시작', summary: '작은 가게에서 시작한 우리의 이야기', content: '2015년 서울 한 골목에서 시작된 우리의 이야기는...', status: 'published', viewCount: 5200, publishedAt: '2026-01-10T09:00:00Z', createdAt: '2026-01-08T10:00:00Z', updatedAt: '2026-01-10T09:00:00Z', createdBy: '마케팅팀' },
  { id: 'brand-002', category: 'people', title: '셰프 인터뷰: 맛의 비밀', summary: '수석 셰프가 전하는 맛의 철학', content: '20년 경력의 수석 셰프 김OO 씨에게 물었습니다...', status: 'published', viewCount: 3100, publishedAt: '2026-02-01T09:00:00Z', createdAt: '2026-01-28T10:00:00Z', updatedAt: '2026-02-01T09:00:00Z', createdBy: '마케팅팀' },
  { id: 'brand-003', category: 'social', title: '지역 농가 상생 프로젝트', summary: '지역 농가와 함께하는 상생의 가치', content: '우리는 지역 농가와의 직거래를 통해...', status: 'draft', viewCount: 0, createdAt: '2026-02-25T10:00:00Z', updatedAt: '2026-02-25T10:00:00Z', createdBy: '마케팅팀' },
];

// Mock 데이터 - 보도자료
const MOCK_PRESS_RELEASES: PressRelease[] = [
  { id: 'press-001', title: '2025년 매출 200% 성장', summary: '전년 대비 매출 200% 성장 달성', content: '당사는 2025년 연간 매출이 전년 대비 200% 성장했다고 발표했다...', source: '한국경제', sourceUrl: 'https://example.com/news/1', status: 'published', viewCount: 4500, publishedAt: '2026-01-15T09:00:00Z', createdAt: '2026-01-14T10:00:00Z', updatedAt: '2026-01-15T09:00:00Z', createdBy: 'PR팀' },
  { id: 'press-002', title: '신규 100호점 오픈 기념', summary: '전국 100호점 오픈 달성', content: '당사가 전국 100번째 매장을 오픈하며 성장세를 이어가고 있다...', source: '매일경제', sourceUrl: 'https://example.com/news/2', status: 'published', viewCount: 2800, publishedAt: '2026-02-10T09:00:00Z', createdAt: '2026-02-08T10:00:00Z', updatedAt: '2026-02-10T09:00:00Z', createdBy: 'PR팀' },
  { id: 'press-003', title: 'ESG 경영 우수기업 선정', summary: '환경부 ESG 우수기업 인증 획득', content: '당사가 환경부 주관 ESG 경영 우수기업으로 선정되었다...', status: 'draft', viewCount: 0, createdAt: '2026-02-26T08:00:00Z', updatedAt: '2026-02-26T08:00:00Z', createdBy: 'PR팀' },
];

// Mock 데이터 - 약관
const MOCK_TERMS: Terms[] = [
  { id: 'terms-001', type: 'service', title: '서비스 이용약관', content: '제1조 (목적) 이 약관은 주식회사 OOO(이하 "회사")가 제공하는 서비스...', version: '3.0', status: 'active', isRequired: true, effectiveDate: '2026-01-01', noticeDate: '2025-12-15', attachments: [], createdAt: '2025-12-10T10:00:00Z', updatedAt: '2025-12-15T10:00:00Z', createdBy: '법무팀' },
  { id: 'terms-002', type: 'privacy', title: '개인정보 처리방침', content: '1. 개인정보의 수집 항목 및 수집 방법...', version: '4.1', status: 'active', isRequired: true, effectiveDate: '2026-02-01', noticeDate: '2026-01-15', attachments: [], createdAt: '2026-01-10T10:00:00Z', updatedAt: '2026-01-15T10:00:00Z', createdBy: '법무팀' },
  { id: 'terms-003', type: 'marketing', title: '마케팅 정보 수신 동의', content: '마케팅 정보 수신에 동의하시면 할인 쿠폰, 이벤트 정보...', version: '2.0', status: 'active', isRequired: false, effectiveDate: '2025-06-01', noticeDate: '2025-05-15', attachments: [], createdAt: '2025-05-10T10:00:00Z', updatedAt: '2025-05-15T10:00:00Z', createdBy: '법무팀' },
  { id: 'terms-004', type: 'location', title: '위치정보 이용약관', content: '제1조 (목적) 이 약관은 위치정보의 보호 및 이용 등에 관한 법률에 따라...', version: '1.0', status: 'active', isRequired: false, effectiveDate: '2025-01-01', attachments: [], createdAt: '2024-12-15T10:00:00Z', updatedAt: '2024-12-15T10:00:00Z', createdBy: '법무팀' },
  { id: 'terms-005', type: 'service', title: '서비스 이용약관', content: '(구) 서비스 이용약관 v2.0 내용...', version: '2.0', status: 'expired', isRequired: true, effectiveDate: '2025-01-01', noticeDate: '2024-12-15', expiredDate: '2025-12-31', attachments: [], createdAt: '2024-12-10T10:00:00Z', updatedAt: '2025-12-31T10:00:00Z', createdBy: '법무팀' },
  { id: 'terms-006', type: 'refund', title: '환불 정책', content: '1. 환불 기준: 주문 후 5분 이내 전액 환불 가능...', version: '1.2', status: 'active', isRequired: true, effectiveDate: '2026-01-01', noticeDate: '2025-12-20', attachments: [], createdAt: '2025-12-15T10:00:00Z', updatedAt: '2025-12-20T10:00:00Z', createdBy: '법무팀' },
  { id: 'terms-007', type: 'privacy', title: '개인정보 처리방침', content: '(구) 개인정보 처리방침 v3.0 내용...', version: '3.0', status: 'expired', isRequired: true, effectiveDate: '2025-06-01', noticeDate: '2025-05-15', expiredDate: '2026-01-31', attachments: [], createdAt: '2025-05-10T10:00:00Z', updatedAt: '2026-01-31T10:00:00Z', createdBy: '법무팀' },
];

let notices = [...MOCK_NOTICES];
let brandStories = [...MOCK_BRAND_STORIES];
let pressReleases = [...MOCK_PRESS_RELEASES];
let terms = [...MOCK_TERMS];

// 공지사항 서비스
async function getNotices(params?: { category?: NoticeCategory; status?: NoticeStatus; keyword?: string }) {
  if (IS_MOCK_MODE) {
    let filtered = [...notices];
    if (params?.category) filtered = filtered.filter(n => n.category === params.category);
    if (params?.status) filtered = filtered.filter(n => n.status === params.status);
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(kw) || n.content.toLowerCase().includes(kw));
    }
    return { data: filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
  }
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  if (params?.keyword) query.set('keyword', params.keyword);
  return apiClient.get<{ data: Notice[] }>(`/content/notices?${query.toString()}`);
}

async function createNotice(data: NoticeFormData) {
  if (IS_MOCK_MODE) {
    const item: Notice = { id: `notice-${String(notices.length + 1).padStart(3, '0')}`, ...data, viewCount: 0, publishedAt: data.status === 'published' ? new Date().toISOString() : undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: '관리자' };
    notices.push(item);
    return item;
  }
  return apiClient.post<Notice>('/content/notices', data);
}

async function updateNotice(id: string, data: Partial<NoticeFormData>) {
  if (IS_MOCK_MODE) {
    const idx = notices.findIndex(n => n.id === id);
    if (idx === -1) return null;
    const updated = { ...notices[idx], ...data, updatedAt: new Date().toISOString() } as Notice;
    if (data.status === 'published' && !notices[idx]?.publishedAt) updated.publishedAt = new Date().toISOString();
    notices[idx] = updated;
    return updated;
  }
  return apiClient.patch<Notice>(`/content/notices/${id}`, data);
}

async function deleteNotice(id: string) {
  if (IS_MOCK_MODE) {
    notices = notices.filter(n => n.id !== id);
    return true;
  }
  return apiClient.delete(`/content/notices/${id}`);
}

// 브랜드 스토리 서비스
async function getBrandStories(params?: { category?: BrandStoryCategory; status?: BrandStoryStatus; keyword?: string }) {
  if (IS_MOCK_MODE) {
    let filtered = [...brandStories];
    if (params?.category) filtered = filtered.filter(b => b.category === params.category);
    if (params?.status) filtered = filtered.filter(b => b.status === params.status);
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(b => b.title.toLowerCase().includes(kw) || b.summary.toLowerCase().includes(kw));
    }
    return { data: filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
  }
  const query = new URLSearchParams();
  if (params?.category) query.set('category', params.category);
  if (params?.status) query.set('status', params.status);
  if (params?.keyword) query.set('keyword', params.keyword);
  return apiClient.get<{ data: BrandStory[] }>(`/content/brand-stories?${query.toString()}`);
}

async function createBrandStory(data: BrandStoryFormData) {
  if (IS_MOCK_MODE) {
    const item: BrandStory = { id: `brand-${String(brandStories.length + 1).padStart(3, '0')}`, ...data, viewCount: 0, publishedAt: data.status === 'published' ? new Date().toISOString() : undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: '관리자' };
    brandStories.push(item);
    return item;
  }
  return apiClient.post<BrandStory>('/content/brand-stories', data);
}

async function updateBrandStory(id: string, data: Partial<BrandStoryFormData>) {
  if (IS_MOCK_MODE) {
    const idx = brandStories.findIndex(b => b.id === id);
    if (idx === -1) return null;
    const updated = { ...brandStories[idx], ...data, updatedAt: new Date().toISOString() } as BrandStory;
    if (data.status === 'published' && !brandStories[idx]?.publishedAt) updated.publishedAt = new Date().toISOString();
    brandStories[idx] = updated;
    return updated;
  }
  return apiClient.patch<BrandStory>(`/content/brand-stories/${id}`, data);
}

async function deleteBrandStory(id: string) {
  if (IS_MOCK_MODE) {
    brandStories = brandStories.filter(b => b.id !== id);
    return true;
  }
  return apiClient.delete(`/content/brand-stories/${id}`);
}

// 보도자료 서비스
async function getPressReleases(params?: { status?: PressReleaseStatus; keyword?: string }) {
  if (IS_MOCK_MODE) {
    let filtered = [...pressReleases];
    if (params?.status) filtered = filtered.filter(p => p.status === params.status);
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(kw) || p.summary.toLowerCase().includes(kw));
    }
    return { data: filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
  }
  const query = new URLSearchParams();
  if (params?.status) query.set('status', params.status);
  if (params?.keyword) query.set('keyword', params.keyword);
  return apiClient.get<{ data: PressRelease[] }>(`/content/press-releases?${query.toString()}`);
}

async function createPressRelease(data: PressReleaseFormData) {
  if (IS_MOCK_MODE) {
    const item: PressRelease = { id: `press-${String(pressReleases.length + 1).padStart(3, '0')}`, ...data, viewCount: 0, publishedAt: data.status === 'published' ? new Date().toISOString() : undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: 'PR팀' };
    pressReleases.push(item);
    return item;
  }
  return apiClient.post<PressRelease>('/content/press-releases', data);
}

async function updatePressRelease(id: string, data: Partial<PressReleaseFormData>) {
  if (IS_MOCK_MODE) {
    const idx = pressReleases.findIndex(p => p.id === id);
    if (idx === -1) return null;
    const updated = { ...pressReleases[idx], ...data, updatedAt: new Date().toISOString() } as PressRelease;
    if (data.status === 'published' && !pressReleases[idx]?.publishedAt) updated.publishedAt = new Date().toISOString();
    pressReleases[idx] = updated;
    return updated;
  }
  return apiClient.patch<PressRelease>(`/content/press-releases/${id}`, data);
}

async function deletePressRelease(id: string) {
  if (IS_MOCK_MODE) {
    pressReleases = pressReleases.filter(p => p.id !== id);
    return true;
  }
  return apiClient.delete(`/content/press-releases/${id}`);
}

// 약관 서비스
async function getTermsList(params?: { type?: TermsType; status?: TermsStatus; keyword?: string }) {
  if (IS_MOCK_MODE) {
    let filtered = [...terms];
    if (params?.type) filtered = filtered.filter(t => t.type === params.type);
    if (params?.status) filtered = filtered.filter(t => t.status === params.status);
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(t => t.title.toLowerCase().includes(kw) || t.content.toLowerCase().includes(kw));
    }
    return { data: filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)) };
  }
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.status) query.set('status', params.status);
  if (params?.keyword) query.set('keyword', params.keyword);
  return apiClient.get<{ data: Terms[] }>(`/content/terms?${query.toString()}`);
}

async function getTermsVersions(type: TermsType) {
  if (IS_MOCK_MODE) {
    const filtered = terms
      .filter(t => t.type === type)
      .map(t => ({ id: t.id, termsType: t.type, version: t.version, status: t.status, effectiveDate: t.effectiveDate, noticeDate: t.noticeDate, createdAt: t.createdAt }))
      .sort((a, b) => b.version.localeCompare(a.version));
    return { data: filtered as TermsVersion[] };
  }
  return apiClient.get<{ data: TermsVersion[] }>(`/content/terms/versions?type=${type}`);
}

async function createTerms(data: TermsFormData) {
  if (IS_MOCK_MODE) {
    const item: Terms = { id: `terms-${String(terms.length + 1).padStart(3, '0')}`, ...data, expiredDate: undefined, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), createdBy: '법무팀' };
    terms.push(item);
    return item;
  }
  return apiClient.post<Terms>('/content/terms', data);
}

async function updateTerms(id: string, data: Partial<TermsFormData>) {
  if (IS_MOCK_MODE) {
    const idx = terms.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const updated = { ...terms[idx], ...data, updatedAt: new Date().toISOString() } as Terms;
    terms[idx] = updated;
    return updated;
  }
  return apiClient.patch<Terms>(`/content/terms/${id}`, data);
}

async function deleteTerms(id: string) {
  if (IS_MOCK_MODE) {
    terms = terms.filter(t => t.id !== id);
    return true;
  }
  return apiClient.delete(`/content/terms/${id}`);
}

export const contentService = {
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getBrandStories,
  createBrandStory,
  updateBrandStory,
  deleteBrandStory,
  getPressReleases,
  createPressRelease,
  updatePressRelease,
  deletePressRelease,
  getTermsList,
  getTermsVersions,
  createTerms,
  updateTerms,
  deleteTerms,
};
