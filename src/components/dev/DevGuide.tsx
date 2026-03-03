import { InfoCircleOutlined } from '@ant-design/icons';
import { Tooltip } from '@/components/ui/Tooltip';

interface DevGuideSection {
  title: string;
  items: string[];
}

interface DevGuideProps {
  title: string;
  description?: string;
  backend: DevGuideSection;
  frontend: DevGuideSection;
}

/**
 * 개발 설명서 Tooltip 컴포넌트
 * 페이지별 백엔드 연동 정보와 프론트엔드 주요 기능을 표시
 */
export function DevGuide({ title, description, backend, frontend }: DevGuideProps) {
  // 프로덕션 빌드에서는 렌더링하지 않음 (API 구조, 엔드포인트 노출 방지)
  if (!import.meta.env.DEV) return null;

  const content = (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      {/* 헤더 */}
      <div className="border-b border-white/20 pb-3">
        <h3 className="font-bold text-base text-white">{title}</h3>
        {description && (
          <p className="text-xs text-white/70 mt-1">{description}</p>
        )}
      </div>

      {/* 백엔드 연동 */}
      <div>
        <h4 className="text-xs font-semibold text-primary-light uppercase tracking-wide mb-2">
          {backend.title}
        </h4>
        <ul className="space-y-1.5">
          {backend.items.map((item, index) => (
            <li key={index} className="text-xs text-white/90 flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span className="font-mono">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 프론트엔드 주요 기능 */}
      <div>
        <h4 className="text-xs font-semibold text-success-light uppercase tracking-wide mb-2">
          {frontend.title}
        </h4>
        <ul className="space-y-1.5">
          {frontend.items.map((item, index) => (
            <li key={index} className="text-xs text-white/90 flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 푸터 */}
      <div className="border-t border-white/20 pt-2 mt-3">
        <p className="text-[10px] text-white/50 text-center">
          클릭하여 고정 / 다시 클릭하여 닫기
        </p>
      </div>
    </div>
  );

  return (
    <Tooltip content={content} position="bottom" maxWidth={450}>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
        <InfoCircleOutlined style={{ fontSize: 14 }} />
        <span>개발 가이드</span>
      </div>
    </Tooltip>
  );
}

// 로그인 페이지 개발 가이드
export const LOGIN_DEV_GUIDE: DevGuideProps = {
  title: '로그인 페이지 개발 가이드',
  description: '인증 및 2차 인증(이메일) 처리',
  backend: {
    title: 'Backend API 연동',
    items: [
      'POST /api/auth/login - 로그인 요청',
      '  → Request: { email, password }',
      '  → Response: { accessToken, refreshToken } 또는 { mfaRequired: true, userId }',
      'POST /api/auth/verify-mfa - 이메일 인증 코드 검증',
      '  → Request: { userId, code }',
      '  → Response: { accessToken, refreshToken }',
      'POST /api/auth/resend-code - 인증 코드 재발송',
      '  → Request: { userId }',
      'POST /api/auth/logout - 로그아웃',
      'GET /api/auth/me - 현재 사용자 정보',
    ],
  },
  frontend: {
    title: 'Frontend 주요 기능',
    items: [
      '비밀번호 복잡도 검증 (8자 이상, 대소문자, 숫자, 특수문자)',
      '로그인 시도 제한 (5회 실패 시 15분 잠금)',
      '이메일 2차 인증 (MFA) 지원',
      '인증 코드 재발송 (60초 쿨다운)',
      '세션 상태 유지 (Zustand + sessionStorage)',
      '보호된 라우트 자동 리다이렉트',
      'JWT 토큰 자동 갱신 (refreshToken)',
    ],
  },
};

// 대시보드 페이지 개발 가이드
export const DASHBOARD_DEV_GUIDE: DevGuideProps = {
  title: '대시보드 페이지 개발 가이드',
  description: '실시간 통계 및 KPI 모니터링',
  backend: {
    title: 'Backend API 연동',
    items: [
      'GET /api/dashboard/stats - 대시보드 통계',
      '  → Response: {',
      '       totalProducts,    // 등록상품 수',
      '       todayOrders,      // 금일 주문 수',
      '       todayRevenue,     // 금일 주문금액',
      '       totalStores,      // 등록 가맹점 수',
      '       yesterdayOrders,  // 전일 주문 수',
      '       yesterdayRevenue  // 전일 주문금액',
      '     }',
      'GET /api/dashboard/recent-activity - 최근 활동 내역',
      'GET /api/dashboard/alerts - 알림 목록',
      'WebSocket /ws/dashboard - 실시간 업데이트 (선택)',
    ],
  },
  frontend: {
    title: 'Frontend 주요 기능',
    items: [
      '통계 카드 (StatCard) - 숫자/금액/변화율 표시',
      '금액 자동 포맷 (만원/억원 단위 변환)',
      '전일 대비 변화율 표시 (TrendingUp/Down 아이콘)',
      'React Query 캐싱 (5분 staleTime)',
      '자동 새로고침 (refetchInterval 옵션)',
      '로딩 스피너 & 에러 핸들링',
      '반응형 그리드 레이아웃',
    ],
  },
};
