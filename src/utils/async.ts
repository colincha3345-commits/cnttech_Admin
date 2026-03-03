/**
 * 공통 비동기 유틸리티
 */

/** API 지연 시뮬레이션 (Mock 서비스용) */
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 에러 메시지 추출 헬퍼 */
export const extractErrorMessage = (err: unknown, fallback: string): string => {
  return err instanceof Error ? err.message : fallback;
};
