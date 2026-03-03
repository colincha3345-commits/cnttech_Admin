/**
 * 프로모션 코드 생성/파싱/다운로드 유틸리티
 */
import type { PromoCode } from '@/types/benefit-campaign';

// 혼동 문자 제외: 0/O, 1/I/L
const CODE_CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * 단일 랜덤 코드 생성
 */
function generateRandomString(length: number): string {
  let result = '';
  const charsetLength = CODE_CHARSET.length;
  for (let i = 0; i < length; i++) {
    result += CODE_CHARSET.charAt(Math.floor(Math.random() * charsetLength));
  }
  return result;
}

/**
 * 프로모션 코드 일괄 생성
 * @param prefix 코드 접두사 (예: "PROMO")
 * @param length 랜덤 부분 길이
 * @param quantity 생성 수량
 * @throws 중복 제거 후 목표 수량 미달 시 에러
 */
export function generatePromoCodes(
  prefix: string,
  length: number,
  quantity: number,
): PromoCode[] {
  const codeSet = new Set<string>();
  const maxAttempts = quantity * 3;
  let attempts = 0;

  while (codeSet.size < quantity && attempts < maxAttempts) {
    const separator = prefix ? '-' : '';
    const code = `${prefix.toUpperCase()}${separator}${generateRandomString(length)}`;
    codeSet.add(code);
    attempts++;
  }

  if (codeSet.size < quantity) {
    throw new Error(
      `고유한 코드를 충분히 생성할 수 없습니다. 코드 길이를 늘리거나 수량을 줄여주세요. (생성: ${codeSet.size}/${quantity})`,
    );
  }

  const now = new Date().toISOString();
  return Array.from(codeSet).map((code) => ({
    code,
    usedCount: 0,
    isActive: true,
    createdAt: now,
  }));
}

/**
 * CSV/엑셀에서 파싱된 코드 문자열 배열을 PromoCode 배열로 변환 (중복 제거)
 */
export function parseUploadedCodes(codes: string[]): PromoCode[] {
  const now = new Date().toISOString();
  const uniqueCodes = [...new Set(codes.map((c) => c.trim().toUpperCase()).filter(Boolean))];

  return uniqueCodes.map((code) => ({
    code,
    usedCount: 0,
    isActive: true,
    createdAt: now,
  }));
}

/**
 * 프로모션 코드 CSV 다운로드
 */
export function downloadPromoCodesCsv(
  promoCodes: PromoCode[],
  filename: string = 'promo_codes.csv',
): void {
  const bom = '\uFEFF';
  const header = '코드,사용횟수,활성여부,생성일시';
  const rows = promoCodes.map(
    (pc) => `${pc.code},${pc.usedCount},${pc.isActive ? 'Y' : 'N'},${pc.createdAt}`,
  );
  const csvContent = [header, ...rows].join('\n');
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
