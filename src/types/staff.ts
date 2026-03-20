/**
 * 본사 및 가맹점 직원 계정 관련 타입 정의
 */

// 직원 유형
export type StaffType = 'headquarters' | 'franchise';

// 직원 상태 (초대 기반 워크플로우)
export type StaffStatus =
  | 'invited'           // 초대됨 (비밀번호 미설정)
  | 'pending_approval'  // 비밀번호 설정 완료, 승인 대기
  | 'active'            // 승인됨, 활성
  | 'inactive'          // 비활성화됨
  | 'rejected';         // 거절됨

// 직원 계정
export interface StaffAccount {
  id: string;
  staffType: StaffType;

  // 기본 정보
  name: string;
  phone: string;
  email: string;
  loginId: string;

  // 소속 정보
  teamId?: string;       // 본사 직원인 경우
  storeId?: string;      // 가맹점 직원인 경우 (1:1 매칭 - 1개 가맹점에만 소속 가능)

  // 상태 정보
  status: StaffStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;

  // 초대 관련
  invitationToken?: string;        // 초대 토큰 (UUID)
  invitationExpiresAt?: Date;      // 초대 만료 시간 (48시간)
  invitedAt?: Date;                // 초대 일시

  // 비밀번호 설정 관련
  passwordSetAt?: Date;            // 비밀번호 설정 일시

  // 승인/거절 관련
  approvedAt?: Date;               // 승인 일시
  approvedBy?: string;             // 승인자 ID
  rejectedAt?: Date;               // 거절 일시
  rejectedBy?: string;             // 거절자 ID
  rejectionReason?: string;        // 거절 사유

  // 2FA 관련 (Staff는 기본 true)
  mfaEnabled: boolean;
}

// 본사 팀
export interface Team {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// 직원 초대 폼 (비밀번호 제외 - 사용자가 직접 설정)
export interface StaffInviteFormData {
  staffType: StaffType;
  name: string;
  phone: string;
  email: string;
  loginId: string;
  teamId?: string;
  storeId?: string;
}

// 직원 수정 폼 (비밀번호 선택적)
export interface StaffAccountUpdateData {
  name?: string;
  phone?: string;
  email?: string;
  teamId?: string;
  storeId?: string;
  status?: StaffStatus;
}

// 비밀번호 설정 폼 (초대 수락 시)
export interface PasswordSetupData {
  token: string;
  password: string;
  confirmPassword: string;
}

// 초대 토큰 검증 결과
export interface InvitationValidation {
  isValid: boolean;
  staff?: StaffAccount;
  error?: 'EXPIRED' | 'ALREADY_SET' | 'NOT_FOUND';
}

// 승인/거절 요청 데이터
export interface ApprovalData {
  staffId: string;
  action: 'approve' | 'reject';
  reason?: string; // 거절 시 사유
}

// 승인 대기 건수
export interface PendingApprovalCount {
  headquarters: number;
  franchise: number;
  total: number;
}

// 팀 생성/수정 폼
export interface TeamFormData {
  name: string;
  description?: string;
}

// 직원 유형 라벨
export const STAFF_TYPE_LABELS: Record<StaffType, string> = {
  headquarters: '본사',
  franchise: '가맹점',
};

// 직원 상태 라벨
export const STAFF_STATUS_LABELS: Record<StaffStatus, string> = {
  invited: '초대됨',
  pending_approval: '승인대기',
  active: '활성',
  inactive: '비활성',
  rejected: '거절됨',
};

// 초대 에러 타입
export type InvitationErrorType = 'EXPIRED' | 'ALREADY_SET' | 'NOT_FOUND';

// 초대 에러 메시지
export const INVITATION_ERROR_MESSAGES: Record<InvitationErrorType, string> = {
  EXPIRED: '초대 링크가 만료되었습니다. 관리자에게 재발송을 요청해주세요.',
  ALREADY_SET: '이미 비밀번호가 설정된 계정입니다.',
  NOT_FOUND: '유효하지 않은 초대 링크입니다.',
};
