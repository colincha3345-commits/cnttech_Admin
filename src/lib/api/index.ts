/**
 * API 어댑터 유틸리티
 * Mock 서비스 클래스를 감싸 IS_MOCK_MODE에 따라
 * "동일 인터페이스"로 동작하거나 실제 API 호출로 전환하는 패턴 지원
 *
 * 사용 예:
 *   IS_MOCK_MODE ? new MockDiscountService() : new RealDiscountService()
 *
 * 공통 delay 헬퍼를 제공합니다.
 */

export { IS_MOCK_MODE, apiClient, ApiError } from './apiClient';
export type { ApiResponse, ApiListResponse } from './apiClient';

/**
 * 인메모리 mock 딜레이 헬퍼 (개발 환경의 네트워크 지연 시뮬레이션)
 */
export function mockDelay(ms: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
