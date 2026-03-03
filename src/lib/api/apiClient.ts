/**
 * API 클라이언트 설정
 * 모든 HTTP 요청의 공통 기반이 되는 fetch wrapper
 * 
 * VITE_ENABLE_MOCK=true  → designService 등의 mock 구현 사용
 * VITE_ENABLE_MOCK=false → 이 클라이언트를 통해 실제 백엔드 호출
 */

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';
export const IS_MOCK_MODE = import.meta.env.VITE_ENABLE_MOCK === 'true';

// 프로덕션 환경에서 http:// 사용 시 경고
// HTTPS 강제는 웹서버(Nginx, CloudFront)에서 HSTS 헤더로 처리
if (!import.meta.env.DEV && API_BASE_URL.startsWith('http://')) {
    console.error(
        '[SECURITY] 프로덕션 환경에서 http:// API URL이 감지되었습니다. ' +
        'VITE_API_URL을 https://로 변경하세요.'
    );
}

interface RequestOptions extends RequestInit {
    timeout?: number;
}

export interface ApiResponse<T = unknown> {
    data: T;
    message?: string;
    success: boolean;
}

export interface ApiListResponse<T = unknown> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export class ApiError extends Error {
    statusCode: number;
    code?: string;

    constructor(message: string, statusCode: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.code = code;
    }
}

/**
 * 저장된 인증 토큰 반환
 * authStore와 동일한 sessionStorage 키(auth-storage) 사용
 */
function getAuthToken(): string | null {
    try {
        // authStore는 sessionStorage + 'auth-storage' 키 사용 (localStorage가 아님)
        const raw = sessionStorage.getItem('auth-storage');
        if (!raw) return null;
        const parsed = JSON.parse(raw) as {
            state?: { session?: { accessToken?: string } };
        };
        return parsed?.state?.session?.accessToken ?? null;
    } catch {
        return null;
    }
}

/**
 * 기본 API fetch 함수
 */
async function apiFetch<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { timeout = 15000, ...fetchOptions } = options;

    const token = getAuthToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...fetchOptions.headers,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            headers,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            let errorMessage = `HTTP ${response.status}`;
            try {
                const errorData = await response.json() as { message?: string; code?: string };
                errorMessage = errorData.message ?? errorMessage;
                throw new ApiError(errorMessage, response.status, errorData.code);
            } catch (e) {
                if (e instanceof ApiError) throw e;
                throw new ApiError(errorMessage, response.status);
            }
        }

        // 204 No Content
        if (response.status === 204) {
            return undefined as T;
        }

        return response.json() as Promise<T>;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error instanceof ApiError) throw error;
        if (error instanceof DOMException && error.name === 'AbortError') {
            throw new ApiError('요청 시간이 초과되었습니다.', 408);
        }
        throw new ApiError('네트워크 오류가 발생했습니다.', 0);
    }
}

/**
 * HTTP 메서드별 편의 함수
 */
export const apiClient = {
    get: <T>(endpoint: string, options?: RequestOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'GET' }),

    post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'POST',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),

    put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),

    patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
        apiFetch<T>(endpoint, {
            ...options,
            method: 'PATCH',
            body: body !== undefined ? JSON.stringify(body) : undefined,
        }),

    delete: <T>(endpoint: string, options?: RequestOptions) =>
        apiFetch<T>(endpoint, { ...options, method: 'DELETE' }),
};
