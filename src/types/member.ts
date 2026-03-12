/**
 * 회원 등급 ID (동적 등급 시스템)
 */
export type MemberGrade = string;

/**
 * 회원 등급 라벨 (fallback용)
 * @deprecated getMemberGradeLabel() 사용 권장
 */
export const MEMBER_GRADE_LABELS: Record<string, string> = {
  'grade-vip': 'VIP',
  'grade-gold': '골드',
  'grade-silver': '실버',
  'grade-normal': '일반',
  // 하위 호환
  vip: 'VIP',
  gold: '골드',
  silver: '실버',
  bronze: '브론즈',
  normal: '일반',
};

/**
 * 회원 상태
 */
export type MemberStatus = 'active' | 'inactive' | 'dormant' | 'withdrawn';

/**
 * 회원 상태 라벨
 */
export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: '활성',
  inactive: '휴면',
  dormant: '장기미접속',
  withdrawn: '탈퇴',
};

/**
 * 성별
 */
export type Gender = 'male' | 'female';

export const GENDER_LABELS: Record<Gender, string> = {
  male: '남성',
  female: '여성',
};

/**
 * SNS 연동 타입
 */
export type SnsType = 'kakao' | 'naver' | 'google' | 'apple' | 'facebook';

export const SNS_TYPE_LABELS: Record<SnsType, string> = {
  kakao: '카카오',
  naver: '네이버',
  google: '구글',
  apple: '애플',
  facebook: '페이스북',
};

/**
 * SNS 연동 정보 (키 포함)
 */
export interface SnsConnection {
  snsType: SnsType;       // SNS 종류
  snsKey: string;         // SNS에서 제공하는 고유 키 (카카오 회원번호, 네이버 ID 등)
  connectedAt: Date;      // 연동 일시
}

/**
 * 약관 유형
 */
export type TermsType = 'service' | 'privacy' | 'marketing' | 'location' | 'third_party';

export const TERMS_TYPE_LABELS: Record<TermsType, string> = {
  service: '서비스 이용약관',
  privacy: '개인정보 처리방침',
  marketing: '마케팅 정보 수신',
  location: '위치정보 이용',
  third_party: '제3자 정보 제공',
};

/**
 * 약관 동의 이력
 */
export interface TermsAgreement {
  termsType: TermsType;
  agreedAt: Date;
  version: string;
  revokedAt?: Date | null;       // 동의 철회 시점 (개인정보보호법 준수)
  revokeReason?: string;         // 철회 사유
}

/**
 * 단골매장 정보
 */
export interface FavoriteStore {
  storeId: string;
  storeName: string;
  address: string;
  phone: string;
  registeredAt: Date;
}

/**
 * 배달지 주소
 * 마지막 주문 배달지가 우선 노출, 최대 10개
 */
export interface DeliveryAddress {
  id: string;
  alias: string;              // 별칭 (집, 회사, 기타)
  address: string;            // 도로명 주소
  jibunAddress?: string;      // 지번 주소 (없을 수 있음)
  addressDetail: string;      // 상세 주소
  zipCode: string;            // 우편번호
  lat: number | null;         // 위도
  lng: number | null;         // 경도
  isDefault: boolean;         // 기본 배달지 여부
  lastUsedAt: Date | null;    // 마지막 사용일 (주문 시 갱신)
  createdAt: Date;
}

/**
 * 회원 정보
 */
export interface Member {
  id: string;
  memberId: string;       // 회원 아이디 (로그인 ID)
  name: string;           // 이름
  phone: string;          // 전화번호 (마스킹)
  email: string;          // 이메일
  grade: MemberGrade;     // 회원 등급
  status: MemberStatus;   // 회원 상태

  // 개인 정보
  birthDate: string | null;   // 생년월일 (YYYY-MM-DD)
  gender: Gender | null;      // 성별

  // SNS 연동
  linkedSns: SnsConnection[]; // 연동된 SNS 목록 (키 포함)

  // 약관 동의 이력
  termsAgreements: TermsAgreement[];

  // 주문 관련
  orderCount: number;     // 총 주문 횟수
  totalOrderAmount: number; // 총 주문 금액
  lastOrderDate: Date | null; // 마지막 주문일

  // 가입 정보
  registeredAt: Date;     // 가입일
  lastLoginAt: Date | null; // 마지막 로그인일

  // 마케팅 정보
  marketingAgreed: boolean;     // 마케팅 수신 동의
  marketingAgreedAt: Date | null; // 마케팅 동의 시각
  pushEnabled: boolean;         // 푸시 알림 활성화
  smsEnabled: boolean;          // SMS 수신 동의
  emailEnabled: boolean;        // 이메일 수신 동의

  // 포인트
  pointBalance: number;         // 현재 포인트 잔액

  // 단골매장 (최대 3개)
  favoriteStores: FavoriteStore[];

  // 배달지 주소 (최대 10개, lastUsedAt 내림차순 정렬)
  deliveryAddresses: DeliveryAddress[];
}

/**
 * 회원 검색 필터
 */
export interface MemberSearchFilter {
  // 텍스트 검색
  searchType?: 'all' | 'name' | 'memberId' | 'phone' | 'email';
  searchKeyword?: string;

  // 등급 필터
  grades?: MemberGrade[];

  // 상태 필터
  statuses?: MemberStatus[];

  // 가입일 범위
  registeredFrom?: string; // YYYY-MM-DD
  registeredTo?: string;

  // 주문 횟수 범위
  orderCountMin?: number;
  orderCountMax?: number;

  // 총 주문 금액 범위
  totalAmountMin?: number;
  totalAmountMax?: number;

  // 마케팅 동의
  marketingAgreed?: boolean;
}

/**
 * 회원 검색 타입 라벨
 */
export const MEMBER_SEARCH_TYPE_LABELS: Record<string, string> = {
  all: '전체',
  name: '이름',
  memberId: '아이디',
  phone: '전화번호',
  email: '이메일',
};
