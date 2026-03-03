/**
 * 엑셀 유틸리티
 * xlsx 라이브러리를 사용하여 엑셀 파일 생성 및 다운로드
 */
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { Member } from '@/types/member';
import type { ExportColumn } from '@/types/export';
import type { POSBulkUploadRow, PGBulkUploadRow } from '@/types/store';
import type { Order } from '@/types/order';
import {
  MEMBER_STATUS_LABELS,
  GENDER_LABELS,
  ORDER_DELIVERY_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
} from '@/types';
import { getMemberGradeLabel } from '@/utils/memberGrade';

/**
 * 날짜 포맷팅
 */
function formatDate(date: Date | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * 금액 포맷팅
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

/**
 * Boolean을 O/X로 변환
 */
function formatBoolean(value: boolean): string {
  return value ? 'O' : 'X';
}

/**
 * 회원 필드 값 가져오기
 */
function getMemberFieldValue(member: Member, key: string): string | number {
  switch (key) {
    case 'memberId':
      return member.memberId;
    case 'name':
      return member.name;
    case 'phone':
      return member.phone;
    case 'email':
      return member.email;
    case 'grade':
      return getMemberGradeLabel(member.grade);
    case 'status':
      return MEMBER_STATUS_LABELS[member.status];
    case 'gender':
      return member.gender ? GENDER_LABELS[member.gender] : '';
    case 'birthDate':
      return member.birthDate || '';
    case 'registeredAt':
      return formatDate(member.registeredAt);
    case 'lastLoginAt':
      return formatDate(member.lastLoginAt);
    case 'orderCount':
      return member.orderCount;
    case 'totalOrderAmount':
      return formatCurrency(member.totalOrderAmount);
    case 'lastOrderDate':
      return formatDate(member.lastOrderDate);
    case 'pointBalance':
      return formatCurrency(member.pointBalance);
    case 'marketingAgreed':
      return formatBoolean(member.marketingAgreed);
    case 'pushEnabled':
      return formatBoolean(member.pushEnabled);
    case 'smsEnabled':
      return formatBoolean(member.smsEnabled);
    case 'emailEnabled':
      return formatBoolean(member.emailEnabled);
    default:
      return '';
  }
}

/**
 * 회원 데이터를 엑셀용 행 데이터로 변환
 */
export function memberToExcelRow(
  member: Member,
  columns: ExportColumn[]
): Record<string, string | number> {
  const row: Record<string, string | number> = {};

  columns.forEach((col) => {
    if (col.enabled) {
      row[col.label] = getMemberFieldValue(member, col.key);
    }
  });

  return row;
}

/**
 * 회원 목록을 엑셀용 데이터 배열로 변환
 */
export function membersToExcelData(
  members: Member[],
  columns: ExportColumn[]
): Record<string, string | number>[] {
  const enabledColumns = columns.filter((col) => col.enabled);
  return members.map((member) => memberToExcelRow(member, enabledColumns));
}

/**
 * 엑셀 파일 생성 및 다운로드
 */
export function downloadMembersExcel(
  members: Member[],
  columns: ExportColumn[],
  filename: string = '회원목록'
): void {
  const enabledColumns = columns.filter((col) => col.enabled);

  // 데이터 변환
  const data = membersToExcelData(members, columns);

  // 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 컬럼 너비 설정
  const colWidths = enabledColumns.map((col) => ({
    wch: col.width || 12,
  }));
  worksheet['!cols'] = colWidths;

  // 워크북 생성
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '회원목록');

  // 파일 생성
  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array',
  });

  // Blob 생성 및 다운로드
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // 파일명에 날짜 추가
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}_${timestamp}.xlsx`;

  saveAs(blob, finalFilename);
}

/**
 * 회원 목록을 CSV로 다운로드
 */
export function downloadMembersCsv(
  members: Member[],
  columns: ExportColumn[],
  filename: string = '회원목록'
): void {
  const enabledColumns = columns.filter((col) => col.enabled);

  // 헤더 행
  const headers = enabledColumns.map((col) => col.label);

  // 데이터 행
  const rows = members.map((member) => {
    return enabledColumns.map((col) => {
      const value = getMemberFieldValue(member, col.key);
      // CSV에서 쉼표나 따옴표 처리
      const strValue = String(value);
      if (strValue.includes(',') || strValue.includes('"') || strValue.includes('\n')) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    });
  });

  // CSV 문자열 생성
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // BOM 추가 (한글 깨짐 방지)
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], {
    type: 'text/csv;charset=utf-8',
  });

  // 파일명에 날짜 추가
  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}_${timestamp}.csv`;

  saveAs(blob, finalFilename);
}

/**
 * 내보내기 실행 (포맷에 따라 분기)
 */
export function exportMembers(
  members: Member[],
  columns: ExportColumn[],
  format: 'xlsx' | 'csv',
  filename?: string
): void {
  if (format === 'xlsx') {
    downloadMembersExcel(members, columns, filename);
  } else {
    downloadMembersCsv(members, columns, filename);
  }
}

// ============================================
// 주문 엑셀 다운로드
// ============================================

/**
 * 주문 데이터를 엑셀로 다운로드
 */
export function downloadOrdersExcel(
  orders: Order[],
  filename: string = '주문목록'
): void {
  const data = orders.map((order) => {
    const vouchers = order.discount.eCoupons?.filter((ec) => ec.eCouponType === 'voucher') ?? [];
    const exchanges = order.discount.eCoupons?.filter((ec) => ec.eCouponType === 'exchange') ?? [];

    return {
      '주문번호': order.orderNumber,
      '주문일시': new Date(order.orderDate).toLocaleString('ko-KR'),
      '주문유형': ORDER_DELIVERY_TYPE_LABELS[order.orderType],
      '주문자': order.memberName,
      '전화번호': order.memberPhone,
      '가맹점': order.storeName,
      '메뉴': order.items.map((item) => `${item.productName}(${item.quantity})`).join(', '),
      '결제수단': PAYMENT_METHOD_LABELS[order.paymentMethod],
      '상품합계': formatCurrency(order.subtotalAmount),
      '할인금액': formatCurrency(order.discount.discountAmount),
      '쿠폰': order.discount.couponName || '-',
      '포인트사용': formatCurrency(order.discount.pointUsed),
      'E쿠폰 금액권': vouchers.length > 0
        ? vouchers.map((v) => `${v.eCouponName}(${formatCurrency(v.amount)})`).join(', ')
        : '-',
      'E쿠폰 교환권': exchanges.length > 0
        ? exchanges.map((v) => `${v.eCouponName}→${v.productName ?? ''}(${formatCurrency(v.amount)})`).join(', ')
        : '-',
      '배달비': formatCurrency(order.deliveryFee),
      '결제금액': formatCurrency(order.totalAmount),
      '상태': ORDER_STATUS_LABELS[order.status],
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 20 }, // 주문번호
    { wch: 20 }, // 주문일시
    { wch: 10 }, // 주문유형
    { wch: 10 }, // 주문자
    { wch: 15 }, // 전화번호
    { wch: 10 }, // 가맹점
    { wch: 40 }, // 메뉴
    { wch: 12 }, // 결제수단
    { wch: 12 }, // 상품합계
    { wch: 12 }, // 할인금액
    { wch: 20 }, // 쿠폰
    { wch: 12 }, // 포인트사용
    { wch: 25 }, // E쿠폰 금액권
    { wch: 30 }, // E쿠폰 교환권
    { wch: 10 }, // 배달비
    { wch: 12 }, // 결제금액
    { wch: 10 }, // 상태
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, '주문목록');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const timestamp = new Date().toISOString().split('T')[0];
  const finalFilename = `${filename}_${timestamp}.xlsx`;

  saveAs(blob, finalFilename);
}

// ============================================
// 대시보드 엑셀 다운로드
// ============================================

import type { DashboardExportData } from '@/types';

/**
 * 대시보드 통계 데이터를 엑셀로 다운로드 (3시트)
 */
export function downloadDashboardExcel(
  exportData: DashboardExportData,
  filename: string = '대시보드_통계'
): void {
  const workbook = XLSX.utils.book_new();

  // 시트 1: 매출 현황
  const salesData = exportData.dailySales.map((d) => ({
    '날짜': d.date,
    '매출': formatCurrency(d.revenue),
    '주문수': d.orders,
    '평균 주문금액': formatCurrency(d.avgOrderAmount),
  }));
  const salesSheet = XLSX.utils.json_to_sheet(salesData);
  salesSheet['!cols'] = [{ wch: 12 }, { wch: 14 }, { wch: 8 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, salesSheet, '매출현황');

  // 시트 2: 운영 요약
  const summaryData = [{
    '전체 주문 수': exportData.stats.todayOrders,
    '전체 주문 금액': formatCurrency(exportData.stats.todayRevenue),
    '전일 주문 수': exportData.stats.yesterdayOrders,
    '전일 주문 금액': formatCurrency(exportData.stats.yesterdayRevenue),
    '주문수 변화율(%)': exportData.stats.ordersChange,
    '매출 변화율(%)': exportData.stats.revenueChange,
  }];
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, '운영요약');

  // 시트 3: 마케팅 성과
  const marketingData = exportData.marketing.map((m) => ({
    '항목명': m.name,
    '유형': m.type === 'banner' ? '배너' : m.type === 'event' ? '이벤트' : '상세페이지',
    '노출수': m.impressions.toLocaleString(),
    '클릭수': m.clicks.toLocaleString(),
    '클릭율(%)': m.ctr,
    '전환수': m.conversions.toLocaleString(),
    '전환율(%)': m.conversionRate,
    '유입경로': m.trafficSource,
    '평균체류시간(초)': m.avgDwellTime,
  }));
  const marketingSheet = XLSX.utils.json_to_sheet(marketingData);
  marketingSheet['!cols'] = [
    { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
    { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 16 },
  ];
  XLSX.utils.book_append_sheet(workbook, marketingSheet, '마케팅성과');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const timestamp = new Date().toISOString().split('T')[0];
  saveAs(blob, `${filename}_${timestamp}.xlsx`);
}

// ============================================
// 엑셀 파일 파싱 (일괄 업로드용)
// ============================================

/**
 * 엑셀 파일을 JSON으로 파싱
 */
export async function parseExcelFile<T>(
  file: File,
  columnMapping: Record<string, keyof T>
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // 첫 번째 시트 가져오기
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error('엑셀 파일에 시트가 없습니다.'));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        if (!worksheet) {
          reject(new Error('시트를 읽을 수 없습니다.'));
          return;
        }

        // JSON으로 변환 (헤더 포함)
        const jsonData = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet);

        // 컬럼 매핑 적용
        const mappedData = jsonData.map((row) => {
          const mappedRow: Partial<T> = {};
          Object.entries(columnMapping).forEach(([excelCol, targetKey]) => {
            const value = row[excelCol];
            if (value !== undefined && value !== null) {
              (mappedRow as Record<string, unknown>)[targetKey as string] = String(value).trim();
            }
          });
          return mappedRow as T;
        });

        resolve(mappedData);
      } catch (error) {
        reject(new Error('엑셀 파일 파싱에 실패했습니다.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('파일을 읽을 수 없습니다.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * POS 일괄 업로드용 엑셀 파싱
 */
export async function parsePOSBulkUploadExcel(file: File): Promise<POSBulkUploadRow[]> {
  const columnMapping: Record<string, keyof POSBulkUploadRow> = {
    '매장명': 'storeName',
    '사업자번호': 'businessNumber',
    'POS벤더': 'posVendor',
    'POS코드': 'posCode',
    '시리얼번호': 'posSerialNumber',
  };

  return parseExcelFile<POSBulkUploadRow>(file, columnMapping);
}

/**
 * PG 일괄 업로드용 엑셀 파싱
 */
export async function parsePGBulkUploadExcel(file: File): Promise<PGBulkUploadRow[]> {
  const columnMapping: Record<string, keyof PGBulkUploadRow> = {
    '매장명': 'storeName',
    '사업자번호': 'businessNumber',
    'PG사': 'pgVendor',
    'MID': 'mid',
    'API키': 'apiKey',
  };

  return parseExcelFile<PGBulkUploadRow>(file, columnMapping);
}

/**
 * POS 일괄 업로드 템플릿 다운로드
 */
export function downloadPOSBulkUploadTemplate(): void {
  const templateData = [
    {
      '매장명': '강남점',
      '사업자번호': '123-45-67890',
      'POS벤더': 'okpos',
      'POS코드': 'GN001-POS',
      '시리얼번호': 'SN-2023-001234',
    },
    {
      '매장명': '홍대점',
      '사업자번호': '234-56-78901',
      'POS벤더': 'unionpos',
      'POS코드': 'HD001-POS',
      '시리얼번호': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // 컬럼 너비 설정
  worksheet['!cols'] = [
    { wch: 15 }, // 매장명
    { wch: 15 }, // 사업자번호
    { wch: 12 }, // POS벤더
    { wch: 15 }, // POS코드
    { wch: 18 }, // 시리얼번호
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'POS업로드');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, 'POS_일괄업로드_템플릿.xlsx');
}

/**
 * PG 일괄 업로드 템플릿 다운로드
 */
export function downloadPGBulkUploadTemplate(): void {
  const templateData = [
    {
      '매장명': '강남점',
      '사업자번호': '123-45-67890',
      'PG사': 'smartro',
      'MID': 'MID_GN001_2026',
      'API키': '',
    },
    {
      '매장명': '홍대점',
      '사업자번호': '234-56-78901',
      'PG사': 'kcp',
      'MID': 'MID_HD001_2026',
      'API키': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // 컬럼 너비 설정
  worksheet['!cols'] = [
    { wch: 15 }, // 매장명
    { wch: 15 }, // 사업자번호
    { wch: 12 }, // PG사
    { wch: 18 }, // MID
    { wch: 20 }, // API키
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'PG업로드');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  saveAs(blob, 'PG_일괄업로드_템플릿.xlsx');
}
