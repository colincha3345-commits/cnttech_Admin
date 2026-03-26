import type { User, Permission } from './index';
import type { StaffType } from './staff';

// 로그인 자격 증명
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// 인증된 사용자 정보
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  staffType: StaffType;
  permissions: Permission[];
  lastLoginAt: Date | null;
  mfaEnabled: boolean;
}

// 인증 세션
export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// 로그인 시도 기록
export interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttemptAt: Date;
  lockedUntil: Date | null;
}

// 비밀번호 복잡도 규칙
export interface PasswordValidation {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
}

// 비밀번호 검증 결과
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

// OTP 검증
export interface OTPVerification {
  userId: string;
  code: string;
  expiresAt: Date;
}

// 인증 에러 코드
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_INACTIVE'
  | 'ACCOUNT_PENDING'
  | 'ACCOUNT_INVITED'        // 직원: 비밀번호 미설정 (초대됨)
  | 'ACCOUNT_REJECTED'       // 직원: 승인 거절됨
  | 'MFA_REQUIRED'
  | 'MFA_INVALID'
  | 'MFA_EXPIRED'
  | 'SESSION_EXPIRED'
  | 'TOO_MANY_ATTEMPTS'
  | 'NETWORK_ERROR'
  | 'INVITATION_EXPIRED'     // 초대 만료
  | 'INVITATION_NOT_FOUND';  // 초대 없음

// 인증 에러 메시지 매핑
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: '이메일 또는 비밀번호가 올바르지 않습니다.',
  ACCOUNT_LOCKED: '계정이 잠겼습니다. 관리자에게 문의하세요.',
  ACCOUNT_INACTIVE: '비활성화된 계정입니다.',
  ACCOUNT_PENDING: '승인 대기 중인 계정입니다.',
  ACCOUNT_INVITED: '비밀번호를 먼저 설정해주세요. 이메일을 확인해주세요.',
  ACCOUNT_REJECTED: '계정 승인이 거절되었습니다. 관리자에게 문의하세요.',
  MFA_REQUIRED: '2차 인증이 필요합니다.',
  MFA_INVALID: '인증 코드가 올바르지 않습니다.',
  MFA_EXPIRED: '인증 코드가 만료되었습니다.',
  SESSION_EXPIRED: '세션이 만료되었습니다. 다시 로그인해주세요.',
  TOO_MANY_ATTEMPTS: '로그인 시도 횟수를 초과했습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.',
  INVITATION_EXPIRED: '초대 링크가 만료되었습니다.',
  INVITATION_NOT_FOUND: '유효하지 않은 초대 링크입니다.',
};

// 계정 정책
export interface AccountPolicy {
  maxInactiveDays: number;
  requireUniqueEmail: boolean;
  allowSharedAccounts: boolean;
  sessionConcurrencyLimit: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
}

// 기본 계정 정책
export const DEFAULT_ACCOUNT_POLICY: AccountPolicy = {
  maxInactiveDays: 30,
  requireUniqueEmail: true,
  allowSharedAccounts: false,
  sessionConcurrencyLimit: 1,
  maxLoginAttempts: 5,
  lockoutDurationMinutes: 15,
};

// 인증 상태
export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'mfa_required';

// Mock 사용자 (비밀번호 포함)
export interface MockAuthUser extends User {
  password: string;
  mfaEnabled: boolean;
  mfaSecret?: string;
  staffType?: StaffType;
}
