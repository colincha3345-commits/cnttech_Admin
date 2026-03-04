import { create } from 'zustand';

import type {
  AuthUser,
  AuthSession,
  AuthStatus,
  AuthErrorCode,
  LoginCredentials,
} from '@/types/auth';
import { authService } from '@/services/authService';
import { auditService } from '@/services/auditService';

interface AuthState {
  // 상태
  user: AuthUser | null;
  session: AuthSession | null;
  status: AuthStatus;
  error: AuthErrorCode | null;
  errorMessage: string | null;

  // MFA 관련
  pendingMfaUserId: string | null;

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>;
  verifyMfa: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  (set, get) => ({
    // 초기 상태
    user: null,
    session: null,
    status: 'idle',
    error: null,
    errorMessage: null,
    pendingMfaUserId: null,

    // 로그인
    login: async (credentials: LoginCredentials) => {
      set({ status: 'loading', error: null, errorMessage: null });

      try {
        const result = await authService.login(credentials);

        if ('error' in result && !result.success) {
          const errorCode = result.error.code as AuthErrorCode;
          if (errorCode === 'MFA_REQUIRED') {
            set({
              status: 'mfa_required',
              pendingMfaUserId: result.error.details?.userId as string,
              error: null,
              errorMessage: null,
            });
            return false;
          }

          auditService.log({
            action: 'LOGIN_FAILED',
            resource: 'auth',
            userId: credentials.email,
            details: { reason: errorCode },
          });
          set({
            status: 'unauthenticated',
            error: errorCode,
            errorMessage: result.error.message,
          });
          return false;
        }

        if ('data' in result) {
          const session = result.data;
          auditService.log({
            action: 'LOGIN',
            resource: 'auth',
            userId: session.user.id,
            details: { email: session.user.email },
          });
          set({
            user: session.user,
            session,
            status: 'authenticated',
            error: null,
            errorMessage: null,
            pendingMfaUserId: null,
          });
          return true;
        }

        return false;
      } catch (err) {
        if (import.meta.env.DEV) console.error('[AUTH] 로그인 예외:', err);
        set({
          status: 'unauthenticated',
          error: 'NETWORK_ERROR',
          errorMessage: '네트워크 오류가 발생했습니다.',
        });
        return false;
      }
    },

    // MFA 검증
    verifyMfa: async (code: string) => {
      const { pendingMfaUserId } = get();
      if (!pendingMfaUserId) {
        set({
          status: 'unauthenticated',
          error: 'MFA_EXPIRED',
          errorMessage: '세션이 만료되었습니다.',
        });
        return false;
      }

      set({ status: 'loading', error: null, errorMessage: null });

      try {
        const result = await authService.verifyMfa(pendingMfaUserId, code);

        if ('error' in result && !result.success) {
          set({
            status: 'mfa_required',
            error: result.error.code as AuthErrorCode,
            errorMessage: result.error.message,
          });
          return false;
        }

        if ('data' in result) {
          const session = result.data;
          auditService.log({
            action: 'MFA_VERIFIED',
            resource: 'auth',
            userId: session.user.id,
            details: { email: session.user.email },
          });
          set({
            user: session.user,
            session,
            status: 'authenticated',
            error: null,
            errorMessage: null,
            pendingMfaUserId: null,
          });
          return true;
        }

        return false;
      } catch {
        set({
          status: 'mfa_required',
          error: 'NETWORK_ERROR',
          errorMessage: '네트워크 오류가 발생했습니다.',
        });
        return false;
      }
    },

    // 로그아웃
    logout: async () => {
      const { user } = get();
      await authService.logout();

      if (user) {
        auditService.log({
          action: 'LOGOUT',
          resource: 'auth',
          userId: user.id,
          details: { email: user.email },
        });
      }

      set({
        user: null,
        session: null,
        status: 'unauthenticated',
        error: null,
        errorMessage: null,
        pendingMfaUserId: null,
      });
    },

    checkAuth: async () => {
      set({ status: 'loading' });

      try {
        const result = await authService.getCurrentUser();

        if (result.success && result.data) {
          set({
            user: result.data,
            status: 'authenticated',
          });
        } else {
          set({
            user: null,
            session: null,
            status: 'unauthenticated',
          });
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('[AUTH] checkAuth 예외:', err);
        set({
          user: null,
          session: null,
          status: 'unauthenticated',
        });
      }
    },

    // 에러 초기화
    clearError: () => {
      set({ error: null, errorMessage: null });
    },
  })
);

// 편의 훅
export function useAuth() {
  const store = useAuthStore();

  return {
    user: store.user,
    // Computed values - 직접 계산하여 리액티브하게 동작
    isAuthenticated: store.status === 'authenticated' && store.user !== null,
    isLoading: store.status === 'loading',
    isMfaRequired: store.status === 'mfa_required',
    error: store.error,
    errorMessage: store.errorMessage,
    login: store.login,
    verifyMfa: store.verifyMfa,
    logout: store.logout,
    checkAuth: store.checkAuth,
    clearError: store.clearError,
  };
}
