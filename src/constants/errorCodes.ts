/**
 * 표준 에러 코드 정의
 */

/**
 * 에러 코드 타입
 */
export type ErrorCode =
  // Validation Errors (4xx)
  | 'VALIDATION_ERROR'
  | 'REQUIRED_FIELD_MISSING'
  | 'INVALID_FORMAT'
  | 'INVALID_VALUE'
  | 'DUPLICATE_VALUE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_FILE_TYPE'

  // Authentication & Authorization (401, 403)
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'SESSION_EXPIRED'
  | 'INVALID_CREDENTIALS'
  | 'INSUFFICIENT_PERMISSIONS'

  // Resource Errors (404, 409)
  | 'NOT_FOUND'
  | 'RESOURCE_NOT_FOUND'
  | 'CONFLICT'
  | 'ALREADY_EXISTS'

  // Server Errors (5xx)
  | 'INTERNAL_ERROR'
  | 'SERVICE_UNAVAILABLE'
  | 'DATABASE_ERROR'
  | 'EXTERNAL_API_ERROR'

  // Network Errors
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'CONNECTION_ERROR'

  // Promotion / Discount / Coupon / Point Errors
  | 'DISCOUNT_COUPON_CONFLICT'
  | 'DISCOUNT_POINT_CONFLICT'
  | 'DUPLICATE_COUPON'
  | 'MIN_ORDER_AMOUNT_NOT_MET'
  | 'PRODUCT_NOT_APPLICABLE'
  | 'CHANNEL_NOT_APPLICABLE'
  | 'ORDER_TYPE_NOT_APPLICABLE'
  | 'STORE_NOT_APPLICABLE'
  | 'SCHEDULE_NOT_APPLICABLE'
  | 'COUPON_EXHAUSTED'
  | 'COUPON_EXPIRED'
  | 'COUPON_SUSPENDED'
  | 'POINT_INSUFFICIENT'
  | 'POINT_MIN_USE_NOT_MET'
  | 'POINT_MAX_USE_EXCEEDED';

/**
 * 에러 메시지 매핑
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // Validation
  VALIDATION_ERROR: '입력값 검증에 실패했습니다',
  REQUIRED_FIELD_MISSING: '필수 입력 항목이 누락되었습니다',
  INVALID_FORMAT: '올바른 형식이 아닙니다',
  INVALID_VALUE: '유효하지 않은 값입니다',
  DUPLICATE_VALUE: '이미 존재하는 값입니다',
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다',
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다',

  // Auth
  UNAUTHORIZED: '인증이 필요합니다',
  FORBIDDEN: '접근 권한이 없습니다',
  SESSION_EXPIRED: '세션이 만료되었습니다',
  INVALID_CREDENTIALS: '아이디 또는 비밀번호가 올바르지 않습니다',
  INSUFFICIENT_PERMISSIONS: '권한이 부족합니다',

  // Resource
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다',
  RESOURCE_NOT_FOUND: '리소스를 찾을 수 없습니다',
  CONFLICT: '리소스 충돌이 발생했습니다',
  ALREADY_EXISTS: '이미 존재하는 리소스입니다',

  // Server
  INTERNAL_ERROR: '서버 내부 오류가 발생했습니다',
  SERVICE_UNAVAILABLE: '서비스를 일시적으로 사용할 수 없습니다',
  DATABASE_ERROR: '데이터베이스 오류가 발생했습니다',
  EXTERNAL_API_ERROR: '외부 API 오류가 발생했습니다',

  // Network
  NETWORK_ERROR: '네트워크 연결에 실패했습니다',
  TIMEOUT_ERROR: '요청 시간이 초과되었습니다',
  CONNECTION_ERROR: '서버에 연결할 수 없습니다',

  // Promotion
  DISCOUNT_COUPON_CONFLICT: '할인 상품이 포함되어 쿠폰을 사용할 수 없습니다',
  DISCOUNT_POINT_CONFLICT: '할인/쿠폰 적용 중에는 포인트를 사용할 수 없습니다',
  DUPLICATE_COUPON: '쿠폰은 1건만 적용할 수 있습니다',
  MIN_ORDER_AMOUNT_NOT_MET: '최소 주문 금액을 충족하지 않습니다',
  PRODUCT_NOT_APPLICABLE: '해당 상품에 적용할 수 없는 쿠폰입니다',
  CHANNEL_NOT_APPLICABLE: '현재 채널에서 사용할 수 없는 쿠폰입니다',
  ORDER_TYPE_NOT_APPLICABLE: '해당 주문 유형에 사용할 수 없는 쿠폰입니다',
  STORE_NOT_APPLICABLE: '해당 매장에서 사용할 수 없는 쿠폰입니다',
  SCHEDULE_NOT_APPLICABLE: '현재 시간에 사용할 수 없는 쿠폰입니다',
  COUPON_EXHAUSTED: '쿠폰이 모두 소진되었습니다',
  COUPON_EXPIRED: '유효기간이 만료된 쿠폰입니다',
  COUPON_SUSPENDED: '정지된 쿠폰입니다',
  POINT_INSUFFICIENT: '포인트 잔액이 부족합니다',
  POINT_MIN_USE_NOT_MET: '최소 사용 포인트를 충족하지 않습니다',
  POINT_MAX_USE_EXCEEDED: '최대 사용 가능 포인트를 초과했습니다',
};

/**
 * HTTP 상태 코드 매핑
 */
export const ERROR_STATUS_CODES: Record<ErrorCode, number> = {
  // 400 Bad Request
  VALIDATION_ERROR: 400,
  REQUIRED_FIELD_MISSING: 400,
  INVALID_FORMAT: 400,
  INVALID_VALUE: 400,
  DUPLICATE_VALUE: 400,
  FILE_TOO_LARGE: 400,
  INVALID_FILE_TYPE: 400,

  // 401 Unauthorized
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: 401,
  INVALID_CREDENTIALS: 401,

  // 403 Forbidden
  FORBIDDEN: 403,
  INSUFFICIENT_PERMISSIONS: 403,

  // 404 Not Found
  NOT_FOUND: 404,
  RESOURCE_NOT_FOUND: 404,

  // 409 Conflict
  CONFLICT: 409,
  ALREADY_EXISTS: 409,

  // 500 Internal Server Error
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  DATABASE_ERROR: 500,
  EXTERNAL_API_ERROR: 502,

  // Network
  NETWORK_ERROR: 0,
  TIMEOUT_ERROR: 408,
  CONNECTION_ERROR: 0,

  // Promotion (all 409 Conflict)
  DISCOUNT_COUPON_CONFLICT: 409,
  DISCOUNT_POINT_CONFLICT: 409,
  DUPLICATE_COUPON: 409,
  MIN_ORDER_AMOUNT_NOT_MET: 400,
  PRODUCT_NOT_APPLICABLE: 400,
  CHANNEL_NOT_APPLICABLE: 400,
  ORDER_TYPE_NOT_APPLICABLE: 400,
  STORE_NOT_APPLICABLE: 400,
  SCHEDULE_NOT_APPLICABLE: 400,
  COUPON_EXHAUSTED: 409,
  COUPON_EXPIRED: 410,
  COUPON_SUSPENDED: 403,
  POINT_INSUFFICIENT: 400,
  POINT_MIN_USE_NOT_MET: 400,
  POINT_MAX_USE_EXCEEDED: 400,
};

/**
 * 에러 정보 인터페이스
 */
export interface ErrorInfo {
  code: ErrorCode;
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * 에러 정보 가져오기
 */
export const getErrorInfo = (code: ErrorCode, details?: any): ErrorInfo => {
  return {
    code,
    message: ERROR_MESSAGES[code],
    statusCode: ERROR_STATUS_CODES[code],
    details,
  };
};

/**
 * HTTP 상태 코드로 에러 코드 추론
 */
export const getErrorCodeFromStatus = (status: number): ErrorCode => {
  if (status === 401) return 'UNAUTHORIZED';
  if (status === 403) return 'FORBIDDEN';
  if (status === 404) return 'NOT_FOUND';
  if (status === 409) return 'CONFLICT';
  if (status === 503) return 'SERVICE_UNAVAILABLE';
  if (status >= 500) return 'INTERNAL_ERROR';
  if (status >= 400) return 'VALIDATION_ERROR';
  return 'INTERNAL_ERROR';
};
