/** 콘텐츠 관리 도메인 타입 */

// 공지사항
export type NoticeCategory = 'service' | 'event' | 'update' | 'maintenance' | 'etc';
export type NoticeStatus = 'draft' | 'published' | 'hidden';

export interface Notice {
  id: string;
  category: NoticeCategory;
  title: string;
  content: string;
  isImportant: boolean;
  isPinned: boolean;
  status: NoticeStatus;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface NoticeFormData {
  category: NoticeCategory;
  title: string;
  content: string;
  isImportant: boolean;
  isPinned: boolean;
  status: NoticeStatus;
}

// 브랜드 스토리
export type BrandStoryCategory = 'brand' | 'people' | 'culture' | 'social' | 'news';
export type BrandStoryStatus = 'draft' | 'published' | 'hidden';

export interface BrandStory {
  id: string;
  category: BrandStoryCategory;
  title: string;
  summary: string;
  content: string;
  thumbnailUrl?: string;
  status: BrandStoryStatus;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface BrandStoryFormData {
  category: BrandStoryCategory;
  title: string;
  summary: string;
  content: string;
  thumbnailUrl?: string;
  status: BrandStoryStatus;
}

// 보도자료
export type PressReleaseStatus = 'draft' | 'published' | 'hidden';

export interface PressRelease {
  id: string;
  title: string;
  summary: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  status: PressReleaseStatus;
  viewCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface PressReleaseFormData {
  title: string;
  summary: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  thumbnailUrl?: string;
  status: PressReleaseStatus;
}

// 약관 관리
export type TermsType = 'service' | 'privacy' | 'marketing' | 'location' | 'thirdparty' | 'refund';
export type TermsStatus = 'draft' | 'active' | 'expired';

export interface Terms {
  id: string;
  type: TermsType;
  title: string;
  content: string;
  version: string;
  status: TermsStatus;
  isRequired: boolean;
  effectiveDate: string;
  noticeDate?: string;
  expiredDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface TermsFormData {
  type: TermsType;
  title: string;
  content: string;
  version: string;
  isRequired: boolean;
  effectiveDate: string;
  noticeDate?: string;
  status: TermsStatus;
  attachments?: string[];
}

export interface TermsVersion {
  id: string;
  termsType: TermsType;
  version: string;
  status: TermsStatus;
  effectiveDate: string;
  noticeDate?: string;
  createdAt: string;
}
