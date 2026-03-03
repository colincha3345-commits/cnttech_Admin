import type { MockAuthUser, AuthSession, AuthUser, LoginAttempt } from '@/types/auth';
import type { Permission } from '@/types/index';

// Mock 사용자 데이터
export const mockAuthUsers: MockAuthUser[] = [
  {
    id: '1',
    email: 'colin@cntt.co.kr',
    name: '김관리',
    phone: '010-1234-5678',
    password: 'Admin123!',
    role: 'admin',
    staffType: 'headquarters',
    status: 'active',
    mfaEnabled: true,
    mfaSecret: '123456',
    lastLoginAt: new Date('2026-02-02T09:00:00'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: '2',
    email: 'manager@cnttech.co.kr',
    name: '이매니저',
    phone: '010-2345-6789',
    password: 'Manager123!',
    role: 'manager',
    staffType: 'headquarters',
    status: 'active',
    mfaEnabled: false,
    lastLoginAt: new Date('2026-02-01T14:00:00'),
    createdAt: new Date('2025-03-15'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: '3',
    email: 'viewer@cnttech.co.kr',
    name: '박뷰어',
    phone: '010-3456-7890',
    password: 'Viewer123!',
    role: 'viewer',
    staffType: 'franchise',
    status: 'active',
    mfaEnabled: false,
    lastLoginAt: new Date('2026-01-30T10:00:00'),
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-12-15'),
  },
  {
    id: '4',
    email: 'locked@cnttech.co.kr',
    name: '최잠금',
    phone: '010-4567-8901',
    password: 'Locked123!',
    role: 'viewer',
    staffType: 'franchise',
    status: 'locked',
    mfaEnabled: false,
    lastLoginAt: null,
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2026-01-15'),
  },
];

// Mock 권한 데이터
export const mockPermissions: Permission[] = [
  {
    id: 'perm-1',
    userId: '1',
    resource: 'users:personal-info',
    actions: ['read', 'unmask'],
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'perm-2',
    userId: '2',
    resource: 'users:personal-info',
    actions: ['read'],
    createdAt: new Date('2025-03-15'),
  },
];

// 세션 저장소 (메모리)
export const mockSessions: Map<string, AuthSession> = new Map();

// 로그인 시도 기록 (메모리)
export const mockLoginAttempts: Map<string, LoginAttempt> = new Map();

// 토큰 생성 유틸 (암호학적으로 안전)
export function generateToken(): string {
  return crypto.randomUUID();
}

// Mock 사용자를 AuthUser로 변환
export function toAuthUser(mockUser: MockAuthUser): AuthUser {
  const userPermissions = mockPermissions.filter((p) => p.userId === mockUser.id);

  return {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
    role: mockUser.role,
    staffType: mockUser.staffType ?? 'headquarters',
    permissions: userPermissions,
    lastLoginAt: mockUser.lastLoginAt,
    mfaEnabled: mockUser.mfaEnabled,
  };
}

// 세션 생성
export function createSession(user: AuthUser): AuthSession {
  const session: AuthSession = {
    user,
    accessToken: generateToken(),
    refreshToken: generateToken(),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30분
  };

  mockSessions.set(session.accessToken, session);
  return session;
}

// 세션 검증
export function validateSession(token: string): AuthSession | null {
  const session = mockSessions.get(token);

  if (!session) return null;
  if (new Date() > session.expiresAt) {
    mockSessions.delete(token);
    return null;
  }

  return session;
}

// 세션 삭제
export function removeSession(token: string): void {
  mockSessions.delete(token);
}

// 세션 복원 (localStorage에서 로드된 세션을 mockSessions에 추가)
export function restoreSession(session: AuthSession): void {
  // 만료되지 않은 세션만 복원
  if (new Date() <= new Date(session.expiresAt)) {
    mockSessions.set(session.accessToken, {
      ...session,
      expiresAt: new Date(session.expiresAt), // Date 객체로 변환
    });
  }
}
