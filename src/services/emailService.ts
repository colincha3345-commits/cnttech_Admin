/**
 * 이메일 Mock 서비스
 * 실제 이메일 발송 대신 콘솔에 시뮬레이션 출력
 */

export interface InvitationEmailParams {
  to: string;
  name: string;
  invitationLink: string;
  expiresAt: Date;
}

export interface ApprovalEmailParams {
  to: string;
  name: string;
}

export interface RejectionEmailParams {
  to: string;
  name: string;
  reason?: string;
}

export interface TwoFactorEmailParams {
  to: string;
  code: string;
  expiresInMinutes?: number;
}

/** e쿠폰 취소 실패 이메일 파라미터 */
export interface ECouponCancelFailEmailParams {
  orderDate: Date;
  couponNumber: string;
  couponCompany: string;
  eCouponName: string;
  eCouponType: 'voucher' | 'exchange';
  orderId: string;
  orderNumber: string;
}

/** 쿠폰사별 이메일 매핑 */
const COUPON_COMPANY_EMAILS: Record<string, string> = {
  '카카오': 'coupon@kakaocorp.com',
  'KT': 'ecoupon@kt.com',
  'SK플래닛': 'coupon@skplanet.com',
  'CJ ONE': 'support@cjone.com',
  '해피콘': 'cs@happycon.co.kr',
  '기프티콘': 'biz@giftishow.com',
  '쿠프마케팅': 'support@coopmkt.com',
  '윈큐브마케팅': 'cs@wincube.co.kr',
};

/** 발송인 / 회신 / CC 이메일 */
const SENDER_EMAIL = 'it1@cntt.co.kr';
const REPLY_TO_EMAIL = 'it1@cntt.co.kr';
const INTERNAL_CC_EMAIL = 'it1@cntt.co.kr';

export const emailService = {
  /**
   * 초대 메일 발송 (콘솔 시뮬레이션)
   */
  sendInvitationEmail(params: InvitationEmailParams): void {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [초대 메일 발송]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   받는 사람: ${params.to}`);
    console.log(`   이름: ${params.name}`);
    console.log(`   초대 링크: ${params.invitationLink}`);
    console.log(`   만료 시간: ${params.expiresAt.toLocaleString('ko-KR')}`);
    console.log('');
    console.log('   [메일 내용 미리보기]');
    console.log('   ─────────────────────────────────────────────');
    console.log(`   안녕하세요, ${params.name}님!`);
    console.log('');
    console.log('   계정이 생성되었습니다.');
    console.log('   아래 링크를 클릭하여 비밀번호를 설정해주세요.');
    console.log('');
    console.log(`   👉 ${params.invitationLink}`);
    console.log('');
    console.log(`   ※ 이 링크는 ${params.expiresAt.toLocaleString('ko-KR')}까지 유효합니다.`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  },

  /**
   * 승인 완료 메일 발송
   */
  sendApprovalEmail(params: ApprovalEmailParams): void {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ [승인 완료 메일 발송]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   받는 사람: ${params.to}`);
    console.log(`   이름: ${params.name}`);
    console.log('');
    console.log('   [메일 내용 미리보기]');
    console.log('   ─────────────────────────────────────────────');
    console.log(`   안녕하세요, ${params.name}님!`);
    console.log('');
    console.log('   귀하의 계정이 승인되었습니다.');
    console.log('   이제 로그인하여 서비스를 이용하실 수 있습니다.');
    console.log('');
    console.log('   👉 https://admin.example.com/login');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  },

  /**
   * 거절 알림 메일 발송
   */
  sendRejectionEmail(params: RejectionEmailParams): void {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ [거절 알림 메일 발송]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   받는 사람: ${params.to}`);
    console.log(`   이름: ${params.name}`);
    if (params.reason) {
      console.log(`   거절 사유: ${params.reason}`);
    }
    console.log('');
    console.log('   [메일 내용 미리보기]');
    console.log('   ─────────────────────────────────────────────');
    console.log(`   안녕하세요, ${params.name}님.`);
    console.log('');
    console.log('   안타깝게도 귀하의 계정 신청이 승인되지 않았습니다.');
    if (params.reason) {
      console.log(`   사유: ${params.reason}`);
    }
    console.log('');
    console.log('   문의사항이 있으시면 관리자에게 연락해주세요.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  },

  /**
   * 2FA 인증 코드 발송
   */
  send2FACode(params: TwoFactorEmailParams): void {
    const expiresIn = params.expiresInMinutes || 5;

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 [2차 인증 코드 발송]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   받는 사람: ${params.to}`);
    console.log(`   인증 코드: ${params.code}`);
    console.log(`   유효 시간: ${expiresIn}분`);
    console.log('');
    console.log('   [메일 내용 미리보기]');
    console.log('   ─────────────────────────────────────────────');
    console.log('   로그인 인증 코드입니다.');
    console.log('');
    console.log(`   인증 코드: ${params.code}`);
    console.log('');
    console.log(`   ※ 이 코드는 ${expiresIn}분 동안 유효합니다.`);
    console.log('   ※ 본인이 요청하지 않았다면 이 메일을 무시해주세요.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  },

  /**
   * 초대 재발송 메일
   */
  /**
   * e쿠폰 취소 실패 시 쿠폰사 이메일 자동 발송
   * - 받는 사람: 쿠폰사별 담당 이메일
   * - 수신인(CC): it1@cntt.co.kr
   */
  sendECouponCancelFailEmail(params: ECouponCancelFailEmailParams): { success: boolean; from: string; replyTo: string; to: string; cc: string } {
    const toEmail = COUPON_COMPANY_EMAILS[params.couponCompany];
    if (!toEmail) {
      console.warn(`[Email] 쿠폰사 '${params.couponCompany}'의 이메일이 등록되어 있지 않습니다.`);
      return { success: false, from: SENDER_EMAIL, replyTo: REPLY_TO_EMAIL, to: '', cc: INTERNAL_CC_EMAIL };
    }

    const d = new Date(params.orderDate);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yy}.${mm}.${dd}`;

    const body = `이쿠폰 주문 실패사유 확인 부탁드립니다. 주문일은 ${dateStr}이며 쿠폰번호는 "${params.couponNumber}"입니다.감사합니다.`;

    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [e쿠폰 취소 실패 - 자동 이메일 발송]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   발송인(FROM): ${SENDER_EMAIL}`);
    console.log(`   회신(Reply-To): ${REPLY_TO_EMAIL}`);
    console.log(`   받는 사람(TO): ${toEmail}`);
    console.log(`   수신인(CC): ${INTERNAL_CC_EMAIL}`);
    console.log(`   쿠폰사: ${params.couponCompany}`);
    console.log(`   쿠폰명: ${params.eCouponName}`);
    console.log(`   쿠폰유형: ${params.eCouponType === 'voucher' ? '금액권' : '교환권'}`);
    console.log(`   주문번호: ${params.orderNumber}`);
    console.log('');
    console.log('   [메일 내용]');
    console.log('   ─────────────────────────────────────────────');
    console.log(`   ${body}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');

    return { success: true, from: SENDER_EMAIL, replyTo: REPLY_TO_EMAIL, to: toEmail, cc: INTERNAL_CC_EMAIL };
  },

  /** 쿠폰사 이메일 등록 여부 확인 */
  getCouponCompanyEmail(company: string): string | undefined {
    return COUPON_COMPANY_EMAILS[company];
  },

  resendInvitationEmail(params: InvitationEmailParams): void {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [초대 메일 재발송]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   받는 사람: ${params.to}`);
    console.log(`   이름: ${params.name}`);
    console.log(`   새 초대 링크: ${params.invitationLink}`);
    console.log(`   만료 시간: ${params.expiresAt.toLocaleString('ko-KR')}`);
    console.log('');
    console.log('   [메일 내용 미리보기]');
    console.log('   ─────────────────────────────────────────────');
    console.log(`   안녕하세요, ${params.name}님!`);
    console.log('');
    console.log('   새로운 초대 링크를 발송드립니다.');
    console.log('   아래 링크를 클릭하여 비밀번호를 설정해주세요.');
    console.log('');
    console.log(`   👉 ${params.invitationLink}`);
    console.log('');
    console.log(`   ※ 이 링크는 ${params.expiresAt.toLocaleString('ko-KR')}까지 유효합니다.`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  },

  /**
   * 임시 비밀번호 발송 (콘솔 시뮬레이션)
   * [2026-03-23] 신규 추가: 관리자 비밀번호 재발급 시 이메일 발송
   */
  sendTempPasswordEmail(params: { to: string; name: string; tempPassword: string }): void {
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [임시 비밀번호 발송]');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   받는 사람: ${params.to}`);
    console.log(`   이름: ${params.name}`);
    console.log('');
    console.log('   [메일 내용 미리보기]');
    console.log('   ─────────────────────────────────────────────');
    console.log(`   안녕하세요, ${params.name}님!`);
    console.log('');
    console.log('   비밀번호가 초기화되었습니다.');
    console.log(`   임시 비밀번호: ${params.tempPassword}`);
    console.log('');
    console.log('   ※ 로그인 후 반드시 비밀번호를 변경해주세요.');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
  },
};
