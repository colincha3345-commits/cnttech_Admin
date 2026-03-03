/**
 * 초대 수락 및 비밀번호 설정 페이지
 * 공개 라우트 - 인증 없이 접근 가능
 */
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircleOutlined, CloseCircleOutlined, LockOutlined } from '@ant-design/icons';

import { Button, Input, Spinner } from '@/components/ui';
import { useValidateInvitation, useSetPassword, useToast } from '@/hooks';
import { INVITATION_ERROR_MESSAGES } from '@/types/staff';

export const AcceptInvitation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 토큰 검증
  const {
    data: validation,
    isLoading: isValidating,
  } = useValidateInvitation(token);

  const setPasswordMutation = useSetPassword();

  // 비밀번호 강도 계산
  const getPasswordStrength = (pwd: string): { label: string; color: string } => {
    if (pwd.length === 0) return { label: '', color: '' };
    if (pwd.length < 6) return { label: '약함', color: 'text-critical' };
    if (pwd.length < 8) return { label: '보통', color: 'text-warning' };
    if (pwd.length >= 8 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { label: '강함', color: 'text-success' };
    }
    return { label: '보통', color: 'text-warning' };
  };

  const passwordStrength = getPasswordStrength(password);

  // 비밀번호 유효성 검사
  useEffect(() => {
    if (password && password.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
    } else if (confirmPassword && password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
    } else {
      setPasswordError(null);
    }
  }, [password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;
    if (password.length < 6) {
      setPasswordError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      await setPasswordMutation.mutateAsync({
        token,
        password,
        confirmPassword,
      });
      setIsSubmitted(true);
      toast.success('비밀번호가 설정되었습니다. 관리자 승인 후 로그인할 수 있습니다.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '비밀번호 설정에 실패했습니다.');
    }
  };

  // 로딩 중
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-txt-muted">초대 링크를 확인하고 있습니다...</p>
        </div>
      </div>
    );
  }

  // 토큰 없음
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CloseCircleOutlined className="text-5xl text-critical mb-4" />
          <h1 className="text-xl font-bold text-txt-main mb-2">잘못된 접근입니다</h1>
          <p className="text-txt-muted mb-6">
            초대 링크가 올바르지 않습니다.
          </p>
          <Link to="/login">
            <Button variant="outline">로그인 페이지로 이동</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 검증 실패
  if (validation && !validation.isValid) {
    const errorMessage = validation.error
      ? INVITATION_ERROR_MESSAGES[validation.error]
      : '알 수 없는 오류가 발생했습니다.';

    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CloseCircleOutlined className="text-5xl text-critical mb-4" />
          <h1 className="text-xl font-bold text-txt-main mb-2">
            {validation.error === 'EXPIRED' ? '초대가 만료되었습니다' :
             validation.error === 'ALREADY_SET' ? '이미 설정된 계정입니다' :
             '유효하지 않은 초대'}
          </h1>
          <p className="text-txt-muted mb-6">{errorMessage}</p>
          {validation.error === 'ALREADY_SET' ? (
            <Link to="/login">
              <Button>로그인하기</Button>
            </Link>
          ) : (
            <p className="text-sm text-txt-muted">
              관리자에게 초대 재발송을 요청해주세요.
            </p>
          )}
        </div>
      </div>
    );
  }

  // 설정 완료
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <CheckCircleOutlined className="text-5xl text-success mb-4" />
          <h1 className="text-xl font-bold text-txt-main mb-2">설정이 완료되었습니다</h1>
          <p className="text-txt-muted mb-6">
            관리자 승인 후 로그인할 수 있습니다.<br />
            승인이 완료되면 이메일로 안내해 드립니다.
          </p>
          <Link to="/login">
            <Button variant="outline">로그인 페이지로 이동</Button>
          </Link>
        </div>
      </div>
    );
  }

  // 비밀번호 설정 폼
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <LockOutlined className="text-2xl text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-txt-main mb-2">환영합니다!</h1>
          {validation?.staff && (
            <p className="text-txt-muted">
              <span className="font-semibold text-txt-main">{validation.staff.name}</span>님,<br />
              비밀번호를 설정해주세요.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-txt-main mb-2">
              새 비밀번호 *
            </label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
            {password && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-txt-muted">비밀번호 강도</span>
                <span className={`text-xs font-medium ${passwordStrength.color}`}>
                  {passwordStrength.label}
                </span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-main mb-2">
              비밀번호 확인 *
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>

          {passwordError && (
            <p className="text-sm text-critical">{passwordError}</p>
          )}

          <div className="text-xs text-txt-muted">
            <p>* 비밀번호는 6자 이상이어야 합니다.</p>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={setPasswordMutation.isPending || !!passwordError}
          >
            {setPasswordMutation.isPending ? '설정 중...' : '비밀번호 설정 완료'}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-txt-muted text-center">
            비밀번호 설정 후 관리자 승인이 필요합니다.<br />
            승인이 완료되면 로그인할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
