/**
 * 개인정보 마스킹 유틸리티
 */

/** 이름 마스킹: 김민수 → 김*수, 이영 → 이*, 남궁민수 → 남**수 */
export function maskName(name: string): string {
  if (!name) return '';
  if (name.length <= 1) return name;
  if (name.length === 2) return name[0] + '*';
  return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
}

/** 전화번호 마스킹: 010-1234-5678 → 010-****-5678 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 7) return phone;
  if (digits.length <= 10) {
    return digits.slice(0, 3) + '-****-' + digits.slice(-4);
  }
  return digits.slice(0, 3) + '-****-' + digits.slice(-4);
}

/** 주소 마스킹: 상세주소 부분 마스킹 (동/호수 이후) */
export function maskAddress(address: string): string {
  if (!address) return '-';
  // "동 숫자호" 패턴 이후를 마스킹
  const match = address.match(/^(.+?동\s*\S+)\s/);
  if (match) {
    return match[1] + ' ***';
  }
  // 패턴 미매칭 시 뒤 1/3을 마스킹
  const visibleLen = Math.ceil(address.length * 0.6);
  return address.slice(0, visibleLen) + ' ***';
}
