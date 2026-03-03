import type { AuditLog } from './index';

// 감사 로그 액션 타입
export type AuditAction =
  | 'LOGIN'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'MFA_VERIFIED'
  | 'MFA_FAILED'
  | 'PASSWORD_CHANGED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_STATUS_CHANGE'
  | 'PERMISSION_CHANGED'
  | 'UNMASK_DATA'
  | 'DATA_EXPORT'
  | 'DATA_DOWNLOAD'
  | 'DOWNLOAD_HISTORY_VIEW'
  | 'SESSION_EXPIRED'
  | 'ACCESS_DENIED'
  | 'ACCESS_ATTEMPT'
  | 'SETTINGS_CHANGED';

// 감사 로그 심각도
export type AuditSeverity = 'info' | 'warning' | 'critical';

// 확장된 감사 로그 엔트리
export interface AuditLogEntry extends Omit<AuditLog, 'action'> {
  action: AuditAction;
  userAgent?: string;
  sessionId?: string;
  requestId?: string;
  severity: AuditSeverity;
}

// 감사 로그 필터
export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction[];
  resource?: string;
  severity?: AuditSeverity[];
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
}

// 알람 설정 정보
export interface AuditAlarmConfig {
  id: string; // admin user id
  receiveEmail: boolean;
  receivePush: boolean;
  monitoredActions: AuditAction[]; // 어떤 액션이 발생할 때 알람을 받을 것인지
}


export const ACTION_SEVERITY: Record<AuditAction, AuditSeverity> = {
  LOGIN: 'info',
  LOGIN_FAILED: 'warning',
  LOGOUT: 'info',
  MFA_VERIFIED: 'info',
  MFA_FAILED: 'warning',
  PASSWORD_CHANGED: 'warning',
  USER_CREATED: 'info',
  USER_UPDATED: 'info',
  USER_DELETED: 'critical',
  USER_STATUS_CHANGE: 'warning',
  PERMISSION_CHANGED: 'critical',
  UNMASK_DATA: 'warning',
  DATA_EXPORT: 'warning',
  DATA_DOWNLOAD: 'info',
  DOWNLOAD_HISTORY_VIEW: 'info',
  SETTINGS_CHANGED: 'warning',
  SESSION_EXPIRED: 'info',
  ACCESS_DENIED: 'critical',
  ACCESS_ATTEMPT: 'info',
};

// 액션 표시 이름
export const ACTION_DISPLAY_NAMES: Record<AuditAction, string> = {
  LOGIN: '로그인',
  LOGIN_FAILED: '로그인 실패',
  LOGOUT: '로그아웃',
  MFA_VERIFIED: '2차 인증 성공',
  MFA_FAILED: '2차 인증 실패',
  PASSWORD_CHANGED: '비밀번호 변경',
  USER_CREATED: '사용자 생성',
  USER_UPDATED: '사용자 수정',
  USER_DELETED: '사용자 삭제',
  USER_STATUS_CHANGE: '사용자 상태 변경',
  PERMISSION_CHANGED: '권한 변경',
  UNMASK_DATA: '마스킹 해제',
  DATA_EXPORT: '데이터 내보내기',
  DATA_DOWNLOAD: '데이터 다운로드',
  DOWNLOAD_HISTORY_VIEW: '내 다운로드 내역 조회',
  SETTINGS_CHANGED: '설정 변경',
  SESSION_EXPIRED: '세션 만료',
  ACCESS_DENIED: '접근 거부',
  ACCESS_ATTEMPT: '접근 시도',
};
