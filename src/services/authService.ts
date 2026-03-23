import type { ApiResponse, ApiError } from '@/types';
import type {
  LoginCredentials,
  AuthSession,
  AuthUser,
  AuthErrorCode,
  LoginAttempt,
} from '@/types/auth';
import {
  mockAuthUsers,
  mockLoginAttempts,
  mockSessions,
  toAuthUser,
  createSession,
  removeSession,
  getMockTokenFromCookie,
  validateSession,
} from '@/lib/api/mockAuth';
import { delay } from '@/utils/async';

// 로그인 시도 관리
// [2026-03-23] 잠금 정책 변경: 15분 자동해제 → 영구잠금 (관리자 비밀번호 재발급으로만 해제)
const MAX_ATTEMPTS = 5;

function getLoginAttempt(email: string): LoginAttempt {
  const existing = mockLoginAttempts.get(email);
  if (existing) return existing;

  return {
    email,
    attempts: 0,
    lastAttemptAt: new Date(),
    lockedUntil: null,
  };
}

function recordLoginAttempt(email: string, success: boolean): LoginAttempt {
  const attempt = getLoginAttempt(email);

  if (success) {
    mockLoginAttempts.delete(email);
    return { ...attempt, attempts: 0, lockedUntil: null };
  }

  attempt.attempts += 1;
  attempt.lastAttemptAt = new Date();

  // 5회 초과 시 영구 잠금 (관리자 비밀번호 재발급으로만 해제)
  if (attempt.attempts >= MAX_ATTEMPTS) {
    attempt.lockedUntil = new Date(Date.now());
  }

  mockLoginAttempts.set(email, attempt);
  return attempt;
}

function isAccountLocked(email: string): { locked: boolean } {
  const attempt = mockLoginAttempts.get(email);

  if (!attempt || attempt.attempts < MAX_ATTEMPTS) {
    return { locked: false };
  }

  return { locked: true };
}

// 이메일 인증을 위한 임시 저장소
const pendingMfaUsers: Map<string, AuthUser> = new Map();
const emailVerificationCodes: Map<string, { code: string; expiresAt: Date; email: string }> = new Map();

// 6자리 인증 코드 생성
function generateVerificationCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(100000 + ((array[0] ?? 0) % 900000));
}

// 이메일 발송 시뮬레이션
function simulateEmailSend(email: string, code: string): void {
  if (import.meta.env.DEV) {
    console.log(`📧 [이메일 발송 시뮬레이션]`);
    console.log(`   대상: ${email}`);
    console.log(`   코드: ${code}`);
    console.log(`   유효시간: 5분`);
  }
}

// 이메일 마스킹 (hong@example.com → hon***@example.com)
function maskEmail(email: string): string {
  const parts = email.split('@');
  const local = parts[0] || '';
  const domain = parts[1] || '';

  if (local.length <= 3) {
    return `${local.charAt(0)}***@${domain}`;
  }
  return `${local.slice(0, 3)}***@${domain}`;
}

export const authService = {
  /**
   * 로그인
   */
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<AuthSession> | ApiError> {
    await delay(500);

    const { email, password } = credentials;

    // 계정 잠금 확인 (영구 잠금 — 관리자 비밀번호 재발급으로만 해제)
    const lockStatus = isAccountLocked(email);
    if (lockStatus.locked) {
      return {
        success: false,
        error: {
          code: 'TOO_MANY_ATTEMPTS' as AuthErrorCode,
          message: '로그인 시도 횟수를 초과하여 계정이 잠겼습니다. 관리자에게 비밀번호 재발급을 요청하세요.',
        },
      };
    }

    // 사용자 찾기
    const mockUser = mockAuthUsers.find((u) => u.email === email);

    if (!mockUser || mockUser.password !== password) {
      const attempt = recordLoginAttempt(email, false);
      const remaining = MAX_ATTEMPTS - attempt.attempts;

      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS' as AuthErrorCode,
          message:
            remaining > 0
              ? `이메일 또는 비밀번호가 올바르지 않습니다. (${remaining}회 남음)`
              : '로그인 시도 횟수를 초과했습니다.',
          details: { remainingAttempts: remaining },
        },
      };
    }

    // 계정 상태 확인
    if (mockUser.status === 'locked') {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_LOCKED' as AuthErrorCode,
          message: '계정이 잠겼습니다. 관리자에게 문의하세요.',
        },
      };
    }

    if (mockUser.status === 'inactive') {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_INACTIVE' as AuthErrorCode,
          message: '비활성화된 계정입니다.',
        },
      };
    }

    if (mockUser.status === 'pending') {
      return {
        success: false,
        error: {
          code: 'ACCOUNT_PENDING' as AuthErrorCode,
          message: '승인 대기 중인 계정입니다.',
        },
      };
    }

    // 로그인 성공 - 시도 횟수 초기화
    recordLoginAttempt(email, true);

    const authUser = toAuthUser(mockUser);

    // 2차 인증 기능 전체 비활성화
    /*
    if (mockUser.mfaEnabled) {
      pendingMfaUsers.set(mockUser.id, authUser);

      // 인증 코드 생성 및 이메일 발송
      const verificationCode = generateVerificationCode();
      emailVerificationCodes.set(mockUser.id, {
        code: verificationCode,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5분 후 만료
        email: mockUser.email,
      });

      // 이메일 발송 시뮬레이션 (실제로는 이메일 서비스 호출)
      simulateEmailSend(mockUser.email, verificationCode);

      return {
        success: false,
        error: {
          code: 'MFA_REQUIRED' as AuthErrorCode,
          message: '이메일로 인증 코드가 발송되었습니다.',
          details: { userId: mockUser.id, email: maskEmail(mockUser.email) },
        },
      };
    }
    */

    // 세션 생성
    const session = createSession(authUser);

    return {
      success: true,
      data: session,
    };
  },

  /**
   * 이메일 인증 코드 검증
   */
  async verifyMfa(
    userId: string,
    code: string
  ): Promise<ApiResponse<AuthSession> | ApiError> {
    await delay(300);

    const pendingUser = pendingMfaUsers.get(userId);
    if (!pendingUser) {
      return {
        success: false,
        error: {
          code: 'MFA_EXPIRED' as AuthErrorCode,
          message: '인증 세션이 만료되었습니다. 다시 로그인해주세요.',
        },
      };
    }

    // 이메일 인증 코드 검증
    const verification = emailVerificationCodes.get(userId);
    if (!verification) {
      return {
        success: false,
        error: {
          code: 'MFA_EXPIRED' as AuthErrorCode,
          message: '인증 코드가 만료되었습니다. 다시 로그인해주세요.',
        },
      };
    }

    // 만료 시간 확인
    if (new Date() > verification.expiresAt) {
      emailVerificationCodes.delete(userId);
      pendingMfaUsers.delete(userId);
      return {
        success: false,
        error: {
          code: 'MFA_EXPIRED' as AuthErrorCode,
          message: '인증 코드가 만료되었습니다. 다시 로그인해주세요.',
        },
      };
    }

    // 코드 검증
    if (code !== verification.code) {
      return {
        success: false,
        error: {
          code: 'MFA_INVALID' as AuthErrorCode,
          message: '인증 코드가 올바르지 않습니다.',
        },
      };
    }

    // 인증 성공 - 정리
    emailVerificationCodes.delete(userId);
    pendingMfaUsers.delete(userId);
    const session = createSession(pendingUser);

    return {
      success: true,
      data: session,
    };
  },

  /**
   * 인증 코드 재발송
   */
  async resendVerificationCode(userId: string): Promise<ApiResponse<{ email: string }> | ApiError> {
    await delay(500);

    const pendingUser = pendingMfaUsers.get(userId);
    if (!pendingUser) {
      return {
        success: false,
        error: {
          code: 'MFA_EXPIRED' as AuthErrorCode,
          message: '인증 세션이 만료되었습니다. 다시 로그인해주세요.',
        },
      };
    }

    const mockUser = mockAuthUsers.find((u) => u.id === userId);
    if (!mockUser) {
      return {
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS' as AuthErrorCode,
          message: '사용자를 찾을 수 없습니다.',
        },
      };
    }

    // 새 인증 코드 생성
    const verificationCode = generateVerificationCode();
    emailVerificationCodes.set(userId, {
      code: verificationCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      email: mockUser.email,
    });

    simulateEmailSend(mockUser.email, verificationCode);

    return {
      success: true,
      data: { email: maskEmail(mockUser.email) },
    };
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    await delay(100);
    removeSession();
  },

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    await delay(100);

    const token = getMockTokenFromCookie('mock_access_token');

    if (!token) {
      return {
        success: true,
        data: null,
      };
    }

    const session = validateSession(token);
    if (!session) {
      return {
        success: true,
        data: null,
      };
    }

    return {
      success: true,
      data: session.user,
    };
  },

  /**
   * 토큰 갱신
   */
  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<AuthSession> | ApiError> {
    await delay(200);

    // Mock: refreshToken으로 세션 찾기
    for (const [, session] of Array.from(mockSessions)) {
      if (session.refreshToken === refreshToken) {
        mockSessions.delete(session.accessToken);
        const newSession = createSession(session.user);
        return {
          success: true,
          data: newSession,
        };
      }
    }

    return {
      success: false,
      error: {
        code: 'SESSION_EXPIRED' as AuthErrorCode,
        message: '세션이 만료되었습니다. 다시 로그인해주세요.',
      },
    };
  },

  /**
   * 로그인 시도 정보 조회
   */
  getLoginAttemptInfo(email: string): {
    attempts: number;
    remainingAttempts: number;
    isLocked: boolean;
  } {
    const attempt = getLoginAttempt(email);
    const lockStatus = isAccountLocked(email);

    return {
      attempts: attempt.attempts,
      remainingAttempts: Math.max(0, MAX_ATTEMPTS - attempt.attempts),
      isLocked: lockStatus.locked,
    };
  },

  /**
   * 계정 잠금 해제 (관리자 비밀번호 재발급 시 호출)
   */
  unlockAccount(email: string): void {
    mockLoginAttempts.delete(email);
  },
};
