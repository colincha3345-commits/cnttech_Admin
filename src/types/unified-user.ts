/**
 * 통합 유저 타입 정의
 *
 * 백엔드 DB의 단일 유저 테이블에 대응하는 프론트엔드 타입.
 * userType 필드로 고객/가맹점/브랜드관리자/비회원/이벤트참여자를 구분한다.
 */
import type { MemberGrade, MemberStatus, Gender, SnsConnection, TermsAgreement, Member } from './member';
import type { StaffAccount, StaffStatus } from './staff';

// ============================================
// 유저 유형 (Discriminator)
// ============================================

export type UserType = 'customer' | 'franchise' | 'brand_admin' | 'guest' | 'event_participant';

export const USER_TYPE_LABELS: Record<UserType, string> = {
  customer: '앱 고객',
  franchise: '가맹점 직원',
  brand_admin: '브랜드 관리자',
  guest: '비회원',
  event_participant: '이벤트 참여자',
};

// ============================================
// 통합 상태
// ============================================

export type UnifiedUserStatus =
  | 'active'
  | 'inactive'
  | 'dormant'
  | 'withdrawn'
  | 'invited'
  | 'pending_approval'
  | 'rejected'
  | 'locked'
  | 'pending';

export const UNIFIED_USER_STATUS_LABELS: Record<UnifiedUserStatus, string> = {
  active: '활성',
  inactive: '비활성',
  dormant: '장기미접속',
  withdrawn: '탈퇴',
  invited: '초대됨',
  pending_approval: '승인대기',
  rejected: '거절됨',
  locked: '잠금',
  pending: '대기',
};

// ============================================
// 공통 Base 인터페이스
// ============================================

export interface UnifiedUserBase {
  id: string;
  userType: UserType;
  name: string;
  phone: string;
  email: string | null;
  status: UnifiedUserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

// ============================================
// Customer (기존 Member 확장)
// ============================================

export interface CustomerUser extends UnifiedUserBase {
  userType: 'customer';
  memberId: string;
  grade: MemberGrade;
  birthDate: string | null;
  gender: Gender | null;
  linkedSns: SnsConnection[];
  termsAgreements: TermsAgreement[];
  orderCount: number;
  totalOrderAmount: number;
  lastOrderDate: Date | null;
  registeredAt: Date;
  marketingAgreed: boolean;
  marketingAgreedAt: Date | null;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailEnabled: boolean;
  pointBalance: number;
}

// ============================================
// Staff 공통 필드
// ============================================

interface StaffFields {
  loginId: string;
  mfaEnabled: boolean;
  createdBy: string;
  invitationToken?: string;
  invitationExpiresAt?: Date;
  invitedAt?: Date;
  passwordSetAt?: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
}

// ============================================
// FranchiseUser (가맹점 직원)
// ============================================

export interface FranchiseUser extends UnifiedUserBase, StaffFields {
  userType: 'franchise';
  storeId: string;
}

// ============================================
// BrandAdminUser (브랜드 관리자 / 본사 직원)
// ============================================

export interface BrandAdminUser extends UnifiedUserBase, StaffFields {
  userType: 'brand_admin';
  teamId?: string;
}

// ============================================
// GuestUser (비회원)
// ============================================

export interface GuestUser extends UnifiedUserBase {
  userType: 'guest';
  source?: string;
  relatedOrderIds?: string[];
}

// ============================================
// EventParticipantUser (이벤트 참여자)
// ============================================

export interface EventParticipantUser extends UnifiedUserBase {
  userType: 'event_participant';
  eventId: string;
  participatedAt: Date;
  hasConsented: boolean;
  hasThirdPartyConsented: boolean;
  collectionMode: 'auto' | 'form_input';
  address?: string;
  linkedMemberId?: string;
}

// ============================================
// Discriminated Union
// ============================================

export type UnifiedUser =
  | CustomerUser
  | FranchiseUser
  | BrandAdminUser
  | GuestUser
  | EventParticipantUser;

// ============================================
// 타입 가드
// ============================================

export function isCustomerUser(user: UnifiedUser): user is CustomerUser {
  return user.userType === 'customer';
}

export function isFranchiseUser(user: UnifiedUser): user is FranchiseUser {
  return user.userType === 'franchise';
}

export function isBrandAdminUser(user: UnifiedUser): user is BrandAdminUser {
  return user.userType === 'brand_admin';
}

export function isGuestUser(user: UnifiedUser): user is GuestUser {
  return user.userType === 'guest';
}

export function isEventParticipantUser(user: UnifiedUser): user is EventParticipantUser {
  return user.userType === 'event_participant';
}

export function isStaffUser(user: UnifiedUser): user is FranchiseUser | BrandAdminUser {
  return user.userType === 'franchise' || user.userType === 'brand_admin';
}

// ============================================
// 변환 함수: 기존 타입 → UnifiedUser
// ============================================

export function memberToUnifiedUser(member: Member): CustomerUser {
  return {
    id: member.id,
    userType: 'customer',
    name: member.name,
    phone: member.phone,
    email: member.email,
    status: member.status as UnifiedUserStatus,
    createdAt: member.registeredAt,
    updatedAt: member.registeredAt,
    lastLoginAt: member.lastLoginAt,
    memberId: member.memberId,
    grade: member.grade,
    birthDate: member.birthDate,
    gender: member.gender,
    linkedSns: member.linkedSns,
    termsAgreements: member.termsAgreements,
    orderCount: member.orderCount,
    totalOrderAmount: member.totalOrderAmount,
    lastOrderDate: member.lastOrderDate,
    registeredAt: member.registeredAt,
    marketingAgreed: member.marketingAgreed,
    marketingAgreedAt: member.marketingAgreedAt,
    pushEnabled: member.pushEnabled,
    smsEnabled: member.smsEnabled,
    emailEnabled: member.emailEnabled,
    pointBalance: member.pointBalance,
  };
}

const STAFF_STATUS_TO_UNIFIED: Record<StaffStatus, UnifiedUserStatus> = {
  invited: 'invited',
  pending_approval: 'pending_approval',
  active: 'active',
  inactive: 'inactive',
  rejected: 'rejected',
};

export function staffToUnifiedUser(staff: StaffAccount): FranchiseUser | BrandAdminUser {
  const base = {
    id: staff.id,
    name: staff.name,
    phone: staff.phone,
    email: staff.email,
    status: STAFF_STATUS_TO_UNIFIED[staff.status],
    createdAt: staff.createdAt,
    updatedAt: staff.updatedAt,
    lastLoginAt: staff.lastLoginAt,
    loginId: staff.loginId,
    mfaEnabled: staff.mfaEnabled,
    createdBy: staff.createdBy,
    invitationToken: staff.invitationToken,
    invitationExpiresAt: staff.invitationExpiresAt,
    invitedAt: staff.invitedAt,
    passwordSetAt: staff.passwordSetAt,
    approvedAt: staff.approvedAt,
    approvedBy: staff.approvedBy,
    rejectedAt: staff.rejectedAt,
    rejectedBy: staff.rejectedBy,
    rejectionReason: staff.rejectionReason,
  };

  if (staff.staffType === 'franchise') {
    return {
      ...base,
      userType: 'franchise' as const,
      storeId: staff.storeId ?? '',
    };
  }

  return {
    ...base,
    userType: 'brand_admin' as const,
    teamId: staff.teamId,
  };
}

// ============================================
// 역변환 함수: UnifiedUser → 기존 타입
// ============================================

const MEMBER_STATUS_MAP: Record<string, MemberStatus> = {
  active: 'active',
  inactive: 'inactive',
  dormant: 'dormant',
  withdrawn: 'withdrawn',
};

export function unifiedUserToMember(user: CustomerUser): Member {
  return {
    id: user.id,
    memberId: user.memberId,
    name: user.name,
    phone: user.phone,
    email: user.email ?? '',
    grade: user.grade,
    status: MEMBER_STATUS_MAP[user.status] ?? 'active',
    birthDate: user.birthDate,
    gender: user.gender,
    linkedSns: user.linkedSns,
    termsAgreements: user.termsAgreements,
    orderCount: user.orderCount,
    totalOrderAmount: user.totalOrderAmount,
    lastOrderDate: user.lastOrderDate,
    registeredAt: user.registeredAt,
    lastLoginAt: user.lastLoginAt,
    marketingAgreed: user.marketingAgreed,
    marketingAgreedAt: user.marketingAgreedAt,
    pushEnabled: user.pushEnabled,
    smsEnabled: user.smsEnabled,
    emailEnabled: user.emailEnabled,
    pointBalance: user.pointBalance,
    favoriteStores: [],
    deliveryAddresses: [],
  };
}

const STAFF_STATUS_MAP: Record<string, StaffStatus> = {
  invited: 'invited',
  pending_approval: 'pending_approval',
  active: 'active',
  inactive: 'inactive',
  rejected: 'rejected',
};

export function unifiedUserToStaff(user: FranchiseUser | BrandAdminUser): StaffAccount {
  return {
    id: user.id,
    staffType: user.userType === 'franchise' ? 'franchise' : 'headquarters',
    name: user.name,
    phone: user.phone,
    email: user.email ?? '',
    loginId: user.loginId,
    teamId: user.userType === 'brand_admin' ? (user as BrandAdminUser).teamId : undefined,
    storeId: user.userType === 'franchise' ? (user as FranchiseUser).storeId : undefined,
    status: STAFF_STATUS_MAP[user.status] ?? 'active',
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    createdBy: user.createdBy,
    invitationToken: user.invitationToken,
    invitationExpiresAt: user.invitationExpiresAt,
    invitedAt: user.invitedAt,
    passwordSetAt: user.passwordSetAt,
    approvedAt: user.approvedAt,
    approvedBy: user.approvedBy,
    rejectedAt: user.rejectedAt,
    rejectedBy: user.rejectedBy,
    rejectionReason: user.rejectionReason,
    mfaEnabled: user.mfaEnabled,
  };
}

// ============================================
// 검색 필터
// ============================================

export interface UnifiedUserSearchFilter {
  keyword?: string;
  userTypes?: UserType[];
  statuses?: UnifiedUserStatus[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
