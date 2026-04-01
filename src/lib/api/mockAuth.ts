import type { MockAuthUser, AuthSession, AuthUser, LoginAttempt } from '@/types/auth';
import type { Permission } from '@/types/index';
import { mockAccountPermissions } from '@/lib/api/mockPermissionData';

// Mock 사용자 데이터
export const mockAuthUsers: MockAuthUser[] = [
  {
    id: '1',
    email: 'colin@cntt.co.kr',
    name: '김관리',
    phone: '010-1234-5678',
    password: 'Admin123!',
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

const MOCK_DB_KEY = 'mock_backend_sessions';

// 세션 저장소 (메모리 + localStorage 동기화로 백엔드 DB 시뮬레이션)
export const mockSessions: Map<string, AuthSession> = new Map();

try {
  const saved = localStorage.getItem(MOCK_DB_KEY);
  if (saved) {
    const parsed = JSON.parse(saved) as Record<string, AuthSession>;
    Object.entries(parsed).forEach(([token, session]) => {
      // 만료되지 않은 세션만 복원
      if (new Date() <= new Date(session.expiresAt)) {
        // 권한 데이터를 mockAccountPermissions에서 재계산 (캐시 불일치 방지)
        const freshUser = mockAuthUsers.find((u) => u.id === session.user.id);
        const refreshedPermissions = freshUser
          ? convertMenuPermissions(freshUser.id)
          : session.user.permissions;

        mockSessions.set(token, {
          ...session,
          user: { ...session.user, permissions: refreshedPermissions },
          expiresAt: new Date(session.expiresAt),
        });
      }
    });
  }
} catch (e) {
  console.error('Mock DB Load Error', e);
}

function syncMockDb() {
  const obj = Object.fromEntries(mockSessions.entries());
  localStorage.setItem(MOCK_DB_KEY, JSON.stringify(obj));
}

// 쿠키 파싱 헬퍼
export function getMockTokenFromCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match && match[2]) return match[2];
  return null;
}

// 로그인 시도 기록 (메모리)
export const mockLoginAttempts: Map<string, LoginAttempt> = new Map();

// 토큰 생성 유틸 (암호학적으로 안전)
export function generateToken(): string {
  return crypto.randomUUID();
}

// MenuPermission[] → Permission[] 변환
function convertMenuPermissions(userId: string): Permission[] {
  const account = mockAccountPermissions.find((a) => a.accountId === userId);
  if (!account) return [];

  return account.permissions
    .filter((mp) => mp.view || mp.write || mp.masking || mp.download)
    .map((mp, idx) => {
      const actions: Permission['actions'] = [];
      if (mp.view) actions.push('read');
      if (mp.write) actions.push('write');
      if (mp.masking) actions.push('unmask');
      // download는 PermissionAction에 없으므로 별도 처리 불필요 (UI에서 MenuPermission 직접 참조)
      return {
        id: `perm-${userId}-${idx}`,
        userId,
        resource: mp.menu,
        actions,
        createdAt: new Date(),
      };
    });
}

// Mock 사용자를 AuthUser로 변환
export function toAuthUser(mockUser: MockAuthUser): AuthUser {
  const userPermissions = convertMenuPermissions(mockUser.id);

  return {
    id: mockUser.id,
    email: mockUser.email,
    name: mockUser.name,
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
  syncMockDb();

  // 브라우저 쿠키에 토큰 저장 (HttpOnly 시뮬레이션)
  document.cookie = `mock_access_token=${session.accessToken}; path=/; max-age=1800; SameSite=Lax`;
  document.cookie = `mock_refresh_token=${session.refreshToken}; path=/; max-age=86400; SameSite=Lax`;

  return session;
}

// 세션 검증
export function validateSession(token: string): AuthSession | null {
  const session = mockSessions.get(token);

  if (!session) return null;
  if (new Date() > session.expiresAt) {
    mockSessions.delete(token);
    syncMockDb();
    return null;
  }

  return session;
}

// 세션 삭제
export function removeSession(): void {
  const token = getMockTokenFromCookie('mock_access_token');
  if (token) {
    mockSessions.delete(token);
    syncMockDb();
  }
  document.cookie = `mock_access_token=; path=/; max-age=0`;
  document.cookie = `mock_refresh_token=; path=/; max-age=0`;
}
