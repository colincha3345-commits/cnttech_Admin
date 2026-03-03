/** 고객센터 도메인 타입 */

// 1:1 문의 / 가맹문의 공통
export type InquiryStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';
export type InquiryType = 'customer' | 'franchise';
export type InquiryCategory = 'order' | 'payment' | 'delivery' | 'product' | 'account' | 'etc';

export interface Inquiry {
  id: string;
  type: InquiryType;
  category: InquiryCategory;
  title: string;
  content: string;
  authorName: string;
  authorEmail: string;
  authorPhone?: string;
  storeId?: string;
  storeName?: string;
  status: InquiryStatus;
  answer?: string;
  answeredBy?: string;
  answeredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryFormData {
  category: InquiryCategory;
  answer: string;
  status: InquiryStatus;
}

// FAQ
export type FaqCategory = 'general' | 'order' | 'payment' | 'delivery' | 'account' | 'franchise';

export interface Faq {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface FaqFormData {
  category: FaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
  isPublished: boolean;
}
