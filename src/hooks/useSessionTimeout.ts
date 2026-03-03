import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { auditService } from '@/services/auditService';

/**
 * 사용자 활동을 감지하여 세션 타임아웃을 처리하는 훅
 */
export function useSessionTimeout() {
    const { user, status, logout } = useAuthStore();
    const timeoutRef = useRef<any>(null);

    // 환경변수에서 타임아웃 시간 가져오기 (기본값 30분)
    const TIMEOUT_MS = Number(import.meta.env.VITE_SESSION_TIMEOUT_MS) || 1800000;

    const resetTimer = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        if (status === 'authenticated') {
            timeoutRef.current = setTimeout(() => {
                handleTimeout();
            }, TIMEOUT_MS);
        }
    };

    const handleTimeout = () => {
        if (user) {
            auditService.log({
                action: 'SESSION_EXPIRED',
                resource: 'auth',
                userId: user.id,
                details: { reason: 'idle_timeout', timeoutMinutes: TIMEOUT_MS / 60000 },
            });
        }
        logout();
        alert('장시간 활동이 없어 자동으로 로그아웃되었습니다.');
    };

    useEffect(() => {
        // 이벤트 리스너 등록
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        const activityHandler = () => {
            resetTimer();
        };

        if (status === 'authenticated') {
            // 초기 타이머 설정
            resetTimer();

            events.forEach(event => {
                window.addEventListener(event, activityHandler);
            });
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            events.forEach(event => {
                window.removeEventListener(event, activityHandler);
            });
        };
    }, [status]); // 상태가 변경될 때마다 (로그인/로그아웃) 다시 설정

    return null;
}
