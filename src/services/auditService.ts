import type { ApiResponse } from '@/types';
import type { AuditLogEntry, AuditLogFilter, AuditAlarmConfig } from '@/types/audit';
import { ACTION_SEVERITY as ActionSeverityMap } from '@/types/audit';
import { delay } from '@/utils/async';

// Mock 감사 로그 저장소
const mockAuditLogs: AuditLogEntry[] = [
  {
    id: 'log-1',
    userId: '1',
    userName: 'admin@company.com',
    action: 'LOGIN',
    resource: 'auth',
    pagePath: '/login',
    details: {},
    ipAddress: '192.168.1.100',
    severity: 'info',
    createdAt: new Date('2026-02-02T09:30:00'),
  },
  {
    id: 'log-2',
    userId: '1',
    userName: 'admin@company.com',
    action: 'UNMASK_DATA',
    resource: 'user:2:phone',
    pagePath: '/users/2',
    details: { reason: '본인 확인' },
    ipAddress: '192.168.1.100',
    severity: 'warning',
    createdAt: new Date('2026-02-02T10:30:00'),
  },
  {
    id: 'log-3',
    userId: '2',
    userName: 'manager@company.com',
    action: 'USER_STATUS_CHANGE',
    resource: 'user:4',
    pagePath: '/users/4',
    details: { from: 'active', to: 'locked' },
    changedFields: [{ field: 'status', label: '상태', before: 'active', after: 'locked' }],
    ipAddress: '192.168.1.105',
    severity: 'warning',
    createdAt: new Date('2026-01-25T14:00:00'),
  },
  {
    id: 'log-4',
    userId: '3',
    userName: 'staff@company.com',
    action: 'LOGIN_FAILED',
    resource: 'auth',
    pagePath: '/login',
    details: { reason: 'invalid_password' },
    ipAddress: '192.168.1.110',
    severity: 'warning',
    createdAt: new Date('2026-01-30T11:00:00'),
  },
  {
    id: 'log-5',
    userId: '1',
    userName: 'admin@company.com',
    action: 'DATA_DOWNLOAD',
    resource: 'orders:export',
    pagePath: '/orders',
    details: { format: 'csv', count: 1250 },
    ipAddress: '192.168.1.100',
    severity: 'info',
    createdAt: new Date('2026-02-25T15:20:00'),
  },
  {
    id: 'log-6',
    userId: '1',
    userName: 'admin@company.com',
    action: 'DOWNLOAD_HISTORY_VIEW',
    resource: 'audit:downloads',
    pagePath: '/audit-logs',
    details: { targetUserId: '1' },
    ipAddress: '192.168.1.100',
    severity: 'info',
    createdAt: new Date('2026-02-26T10:15:00'),
  },
  // CRUD 로그 — 모든 어드민 사용 로그
  {
    id: 'log-7',
    userId: '1',
    userName: 'admin@company.com',
    action: 'RECORD_UPDATED',
    resource: 'coupon:cpn-001',
    pagePath: '/marketing/coupons',
    details: { targetName: '신규가입 10% 할인쿠폰' },
    changedFields: [
      { field: 'status', label: '상태', before: 'active', after: 'suspended' },
      { field: 'gracePeriodDays', label: '유예기간', before: '-', after: '7일' },
    ],
    ipAddress: '192.168.1.100',
    severity: 'info',
    createdAt: new Date('2026-03-10T14:20:00'),
  },
  {
    id: 'log-8',
    userId: '2',
    userName: 'manager@company.com',
    action: 'RECORD_CREATED',
    resource: 'product:prod-new',
    pagePath: '/menu/products',
    details: { targetName: '아메리카노 ICE' },
    changedFields: [
      { field: 'name', label: '상품명', after: '아메리카노 ICE' },
      { field: 'price', label: '가격', after: '4,500원' },
      { field: 'category', label: '카테고리', after: '커피' },
    ],
    ipAddress: '192.168.1.105',
    severity: 'info',
    createdAt: new Date('2026-03-11T09:45:00'),
  },
  {
    id: 'log-9',
    userId: '1',
    userName: 'admin@company.com',
    action: 'RECORD_DELETED',
    resource: 'discount:dc-005',
    pagePath: '/marketing/discounts',
    details: { targetName: '주말 할인 이벤트' },
    ipAddress: '192.168.1.100',
    severity: 'warning',
    createdAt: new Date('2026-03-11T11:30:00'),
  },
  {
    id: 'log-10',
    userId: '2',
    userName: 'manager@company.com',
    action: 'RECORD_UPDATED',
    resource: 'store:store-1',
    pagePath: '/staff/stores/store-1/operating',
    details: { targetName: '강남점' },
    changedFields: [
      { field: 'deliveryFee', label: '배달비', before: '3,000원', after: '3,500원' },
      { field: 'isPickupAvailable', label: '포장 가능', before: '가능', after: '불가' },
    ],
    ipAddress: '192.168.1.105',
    severity: 'info',
    createdAt: new Date('2026-03-12T08:15:00'),
  },
  {
    id: 'log-11',
    userId: '1',
    userName: 'admin@company.com',
    action: 'PAGE_VIEW',
    resource: 'orders',
    pagePath: '/orders',
    details: {},
    ipAddress: '192.168.1.100',
    severity: 'info',
    createdAt: new Date('2026-03-12T09:00:00'),
  },
  {
    id: 'log-12',
    userId: '1',
    userName: 'admin@company.com',
    action: 'RECORD_STATUS_CHANGE',
    resource: 'order:ORD-20260312-0042',
    pagePath: '/orders/ORD-20260312-0042',
    details: { targetName: '주문 #0042' },
    changedFields: [
      { field: 'status', label: '주문상태', before: '접수대기', after: '조리중' },
    ],
    ipAddress: '192.168.1.100',
    severity: 'warning',
    createdAt: new Date('2026-03-12T09:10:00'),
  },
];

// Mock 알람 설정 정보
let mockAlarmConfig: AuditAlarmConfig = {
  id: 'admin-1', // 임의의 현재 로그인 관리자
  receiveEmail: true,
  receivePush: false,
  monitoredActions: [
    'USER_UPDATED',
    'USER_DELETED',
    'PERMISSION_CHANGED',
    'SETTINGS_CHANGED',
    'UNMASK_DATA',
    'DATA_DOWNLOAD',
    'DOWNLOAD_HISTORY_VIEW',
  ] as any[], // type cast to avoid any potential strict match errors if not needed, but they are valid AuditActions
};

// ID 생성
function generateId(): string {
  return `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// 클라이언트 IP 조회 (Mock)
async function getClientIP(): Promise<string> {
  // 실제 구현에서는 서버에서 IP를 확인
  return '192.168.1.100';
}

export const auditService = {
  /**
   * 감사 로그 기록
   */
  async log(
    entry: Omit<AuditLogEntry, 'id' | 'createdAt' | 'severity' | 'ipAddress'> & {
      ipAddress?: string;
    }
  ): Promise<void> {
    const ipAddress = entry.ipAddress || (await getClientIP());
    const severity = ActionSeverityMap[entry.action];

    const logEntry: AuditLogEntry = {
      ...entry,
      id: generateId(),
      ipAddress,
      severity,
      createdAt: new Date(),
    };

    mockAuditLogs.unshift(logEntry);

    // 개발 환경에서 콘솔 출력
    if (import.meta.env.DEV) {
      console.log('[AUDIT]', {
        action: entry.action,
        resource: entry.resource,
        userId: entry.userId,
        details: entry.details,
        severity,
        timestamp: logEntry.createdAt.toISOString(),
      });
    }
  },

  /**
   * 감사 로그 조회
   */
  async getLogs(filter?: AuditLogFilter): Promise<ApiResponse<AuditLogEntry[]>> {
    await delay(300);

    let logs = [...mockAuditLogs];

    if (filter) {
      if (filter.userId) {
        logs = logs.filter((log) => log.userId === filter.userId);
      }

      if (filter.action && filter.action.length > 0) {
        logs = logs.filter((log) => filter.action!.includes(log.action));
      }

      if (filter.resource) {
        logs = logs.filter((log) => log.resource.includes(filter.resource!));
      }

      if (filter.severity && filter.severity.length > 0) {
        logs = logs.filter((log) => filter.severity!.includes(log.severity));
      }

      if (filter.startDate) {
        logs = logs.filter((log) => log.createdAt >= filter.startDate!);
      }

      if (filter.endDate) {
        logs = logs.filter((log) => log.createdAt <= filter.endDate!);
      }

      if (filter.ipAddress) {
        logs = logs.filter((log) => log.ipAddress === filter.ipAddress);
      }
    }

    return {
      success: true,
      data: logs,
      meta: {
        page: 1,
        limit: 100,
        total: logs.length,
      },
    };
  },

  /**
   * 사용자별 활동 이력 조회
   */
  async getUserActivityHistory(userId: string): Promise<ApiResponse<AuditLogEntry[]>> {
    return this.getLogs({ userId });
  },

  /**
   * 보안 알림 조회 (warning, critical 심각도)
   */
  async getSecurityAlerts(): Promise<ApiResponse<AuditLogEntry[]>> {
    return this.getLogs({ severity: ['warning', 'critical'] });
  },

  /**
   * 최근 로그인 기록 조회
   */
  async getRecentLogins(limit: number = 10): Promise<ApiResponse<AuditLogEntry[]>> {
    const result = await this.getLogs({ action: ['LOGIN', 'LOGIN_FAILED'] });

    return {
      ...result,
      data: result.data.slice(0, limit),
    };
  },

  /**
   * 알람 설정 조회
   */
  async getAlarmConfig(userId: string): Promise<ApiResponse<AuditAlarmConfig>> {
    await delay(300);
    return {
      success: true,
      data: { ...mockAlarmConfig, id: userId },
    };
  },

  /**
   * 알람 설정 업데이트
   */
  async updateAlarmConfig(userId: string, config: Partial<AuditAlarmConfig>): Promise<ApiResponse<AuditAlarmConfig>> {
    await delay(400);
    mockAlarmConfig = { ...mockAlarmConfig, ...config, id: userId };
    return {
      success: true,
      data: mockAlarmConfig,
    };
  }
};
