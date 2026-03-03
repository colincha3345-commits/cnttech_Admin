/**
 * 회원 데이터 내보내기 관련 타입
 */
import type { MemberSegmentFilter } from './member-segment';

/**
 * 내보내기 포맷
 */
export type ExportFormat = 'xlsx' | 'csv';

export const EXPORT_FORMAT_LABELS: Record<ExportFormat, string> = {
  xlsx: 'Excel (.xlsx)',
  csv: 'CSV (.csv)',
};

/**
 * 내보내기 컬럼 설정
 */
export interface ExportColumn {
  key: string;
  label: string;
  enabled: boolean;
  width?: number;
}

/**
 * 기본 회원 내보내기 컬럼
 */
export const DEFAULT_MEMBER_EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'memberId', label: '회원ID', enabled: true, width: 15 },
  { key: 'name', label: '이름', enabled: true, width: 10 },
  { key: 'phone', label: '전화번호', enabled: true, width: 15 },
  { key: 'email', label: '이메일', enabled: true, width: 25 },
  { key: 'grade', label: '등급', enabled: true, width: 8 },
  { key: 'status', label: '상태', enabled: true, width: 8 },
  { key: 'gender', label: '성별', enabled: true, width: 6 },
  { key: 'birthDate', label: '생년월일', enabled: true, width: 12 },
  { key: 'registeredAt', label: '가입일', enabled: true, width: 12 },
  { key: 'lastLoginAt', label: '최근접속일', enabled: true, width: 12 },
  { key: 'orderCount', label: '주문횟수', enabled: true, width: 10 },
  { key: 'totalOrderAmount', label: '총주문금액', enabled: true, width: 12 },
  { key: 'lastOrderDate', label: '최근주문일', enabled: true, width: 12 },
  { key: 'pointBalance', label: '포인트잔액', enabled: true, width: 10 },
  { key: 'marketingAgreed', label: '마케팅동의', enabled: true, width: 10 },
  { key: 'pushEnabled', label: '푸시동의', enabled: false, width: 10 },
  { key: 'smsEnabled', label: 'SMS동의', enabled: false, width: 10 },
  { key: 'emailEnabled', label: '이메일동의', enabled: false, width: 10 },
];

/**
 * 내보내기 요청
 */
export interface MemberExportRequest {
  format: ExportFormat;
  columns: string[];
  memberIds?: string[];
  filter?: MemberSegmentFilter;
  filename?: string;
}

/**
 * 내보내기 결과
 */
export interface ExportResult {
  success: boolean;
  filename: string;
  rowCount: number;
  exportedAt: Date;
}
