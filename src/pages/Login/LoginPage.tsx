import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button, Input, Label } from '@/components/ui';
import { OTPInput } from '@/components/auth';
import { DevGuide, LOGIN_DEV_GUIDE } from '@/components/dev';
import { useAuth } from '@/stores/authStore';
import { useAuthStore } from '@/stores/authStore';
import { authService } from '@/services/authService';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isAuthenticated,
    isMfaRequired,
    isLoading,
    errorMessage,
    login,
    verifyMfa,
    clearError,
  } = useAuth();

  const pendingMfaUserId = useAuthStore((state) => state.pendingMfaUserId);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // 로그인 시도 정보
  const [attemptInfo, setAttemptInfo] = useState<{
    remainingAttempts: number;
    isLocked: boolean;
  } | null>(null);

  // 이미 인증된 경우 리다이렉트
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // 재발송 쿨다운
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // 이메일 변경 시 시도 정보 업데이트
  useEffect(() => {
    if (email) {
      const info = authService.getLoginAttemptInfo(email);
      setAttemptInfo(info);
    }
  }, [email]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await login({ email, password });

    if (!success) {
      // 시도 정보 갱신
      const info = authService.getLoginAttemptInfo(email);
      setAttemptInfo(info);
    }
  };

  const handleOtpComplete = async (code: string) => {
    setOtpError(false);

    const success = await verifyMfa(code);

    if (!success) {
      setOtpError(true);
    }
  };

  const handleResendCode = async () => {
    if (!pendingMfaUserId || isResending || resendCooldown > 0) return;

    setIsResending(true);
    clearError();

    try {
      const result = await authService.resendVerificationCode(pendingMfaUserId);
      if ('data' in result && result.success) {
        setMaskedEmail(result.data.email);
        setResendCooldown(60); // 60초 쿨다운
      }
    } finally {
      setIsResending(false);
    }
  };

  // 이메일 인증 화면
  if (isMfaRequired) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-logo">
            <img src="/logo.png" alt="CNTTECH Logo" />
          </div>

          <div className="login-header">
            <h1>이메일 인증</h1>
            <p>
              이메일로 발송된 6자리 인증 코드를 입력하세요
              {maskedEmail && (
                <span className="block mt-1 text-txt-main font-medium">
                  {maskedEmail}
                </span>
              )}
            </p>
          </div>

          {errorMessage && (
            <div className="login-error" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="py-6">
            <OTPInput
              length={6}
              onComplete={handleOtpComplete}
              disabled={isLoading}
              error={otpError}
            />
          </div>

          {/* 인증 코드 재발송 */}
          <div className="text-center mb-4">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={isResending || resendCooldown > 0}
              className={`text-sm ${resendCooldown > 0 ? 'text-txt-disabled' : 'text-primary hover:underline'
                }`}
            >
              {isResending
                ? '발송 중...'
                : resendCooldown > 0
                  ? `${resendCooldown}초 후 재발송 가능`
                  : '인증 코드 재발송'}
            </button>
          </div>

          <p className="text-center text-xs text-txt-muted">
            인증 코드는 콘솔(개발자 도구)에서 확인할 수 있습니다
          </p>

          <div className="login-footer">
            <button
              type="button"
              onClick={() => {
                clearError();
                window.location.reload();
              }}
              className="login-link"
            >
              다른 계정으로 로그인
            </button>
          </div>
        </div>

        <p className="login-copyright">© 2026 CNTTECH. All rights reserved.</p>
      </div>
    );
  }

  // 로그인 폼
  return (
    <div className="login-container">
      {/* 개발 가이드 */}
      <div className="fixed top-4 right-4 z-50">
        <DevGuide {...LOGIN_DEV_GUIDE} />
      </div>

      <div className="login-card">
        {/* 로고 */}
        <div className="login-logo">
          <img src="/logo.png" alt="CNTTECH Logo" />
        </div>

        {/* 환영 메시지 */}
        <div className="login-header">
          <h1>관리자 로그인</h1>
          <p>계정 정보를 입력해주세요</p>
        </div>

        {/* 계정 잠금 경고 */}
        {attemptInfo?.isLocked && (
          <div className="login-error" role="alert">
            <div className="flex items-center gap-2">
              <span className="text-lg">🔒</span>
              <div>
                <p className="font-medium">계정이 잠겼습니다</p>
                <p className="text-xs mt-1">
                  관리자에게 비밀번호 재발급을 요청하세요.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {errorMessage && !attemptInfo?.isLocked && (
          <div className="login-error" role="alert">
            {errorMessage}
          </div>
        )}

        {/* 로그인 폼 */}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="space-y-2">
            <Label htmlFor="email" required>이메일/아이디</Label>
            <Input
              id="email"
              type="text"
              placeholder="colin@cntt.co.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-12"
            />
          </div>

          <Input
            type="password"
            label="비밀번호"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value.slice(0, 128))}
            required
            maxLength={128}
            autoComplete="current-password"
            disabled={attemptInfo?.isLocked}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            disabled={attemptInfo?.isLocked}
          >
            로그인
          </Button>
        </form>

        {/* 테스트 계정 안내 — DEV 환경에서만 노출 */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-bg-hover rounded-lg">
            <p className="text-xs text-txt-muted mb-2 font-medium">테스트 계정</p>
            <div className="space-y-1 text-xs text-txt-muted">
              <p>
                <span className="text-txt-main">colin@cntt.co.kr</span> / Admin123! (이메일 인증)
              </p>
              <p>
                <span className="text-txt-main">manager@cnttech.co.kr</span> / Manager123!
              </p>
              <p>
                <span className="text-txt-main">viewer@cnttech.co.kr</span> / Viewer123!
              </p>
            </div>
          </div>
        )}

        {/* 푸터 링크 */}
        <div className="login-footer">
          <a 
            href="#" 
            className="login-link"
            onClick={(e) => {
              e.preventDefault();
              window.alert('비밀번호 문의는 it1@cntt.co.kr로 문의해주세요.');
            }}
          >
            비밀번호를 잊으셨나요?
          </a>
        </div>
      </div>

      {/* 저작권 */}
      <p className="login-copyright">© 2026 CNTTECH. All rights reserved.</p>
    </div>
  );
}
