import { Card, CardHeader, CardContent, Accordion, type AccordionItemData } from '@/components/ui';

export function Settings() {
  const faqItems: AccordionItemData[] = [
    {
      id: '1',
      title: 'Is it accessible?',
      content: 'Yes. It adheres to the WAI-ARIA design pattern.',
    },
    {
      id: '2',
      title: 'Is it styled?',
      content:
        'Yes. It comes with default styles that matches the other components aesthetic.',
    },
    {
      id: '3',
      title: 'Is it animated?',
      content:
        'Yes. It\'s animated by default, but you can disable it if you prefer.',
    },
    {
      id: '4',
      title: 'Can it be controlled?',
      content: (
        <div>
          <p>Yes. You can control which items are open by default and handle state externally.</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Single item mode (default)</li>
            <li>Multiple items mode</li>
            <li>Controlled state</li>
          </ul>
        </div>
      ),
    },
  ];

  const systemSettingsItems: AccordionItemData[] = [
    {
      id: 'general',
      title: '일반 설정',
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">시스템 이름</label>
            <p className="text-sm text-txt-muted mt-1">CNTTECH Admin Dashboard</p>
          </div>
          <div>
            <label className="text-sm font-medium">타임존</label>
            <p className="text-sm text-txt-muted mt-1">Asia/Seoul (GMT+9)</p>
          </div>
        </div>
      ),
    },
    {
      id: 'security',
      title: '보안 설정',
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">세션 타임아웃</label>
            <p className="text-sm text-txt-muted mt-1">30분</p>
          </div>
          <div>
            <label className="text-sm font-medium">2차 인증</label>
            <p className="text-sm text-txt-muted mt-1">이메일 OTP 활성화됨</p>
          </div>
          <div>
            <label className="text-sm font-medium">비밀번호 정책</label>
            <p className="text-sm text-txt-muted mt-1">
              최소 8자 이상, 대소문자, 숫자, 특수문자 포함 필수
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'notification',
      title: '알림 설정',
      content: (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">이메일 알림</label>
            <p className="text-sm text-txt-muted mt-1">활성화됨</p>
          </div>
          <div>
            <label className="text-sm font-medium">알림 빈도</label>
            <p className="text-sm text-txt-muted mt-1">즉시 전송</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-txt-main">자주 묻는 질문 (FAQ)</h2>
          <p className="text-sm text-txt-muted mt-1">
            아코디언 컴포넌트 사용 예제입니다.
          </p>
        </CardHeader>
        <CardContent>
          <Accordion items={faqItems} defaultOpenId="1" />
        </CardContent>
      </Card>

      {/* System Settings Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-txt-main">시스템 설정</h2>
          <p className="text-sm text-txt-muted mt-1">
            관리자 시스템의 전반적인 설정을 관리합니다.
          </p>
        </CardHeader>
        <CardContent>
          <Accordion items={systemSettingsItems} allowMultiple />
        </CardContent>
      </Card>

      {/* Documentation */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-txt-main">컴포넌트 사용법</h2>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <h3 className="text-base font-semibold text-txt-main mb-2">Props</h3>
            <ul className="space-y-2 text-sm text-txt-muted">
              <li>
                <code className="bg-bg-hover px-1.5 py-0.5 rounded text-txt-main">items</code> -
                아코디언 아이템 배열 (필수)
              </li>
              <li>
                <code className="bg-bg-hover px-1.5 py-0.5 rounded text-txt-main">defaultOpenId</code> -
                기본으로 열려있을 아이템 ID (선택)
              </li>
              <li>
                <code className="bg-bg-hover px-1.5 py-0.5 rounded text-txt-main">allowMultiple</code> -
                여러 아이템을 동시에 열 수 있는지 여부 (선택, 기본값: false)
              </li>
              <li>
                <code className="bg-bg-hover px-1.5 py-0.5 rounded text-txt-main">className</code> -
                커스텀 CSS 클래스 (선택)
              </li>
            </ul>

            <h3 className="text-base font-semibold text-txt-main mt-6 mb-2">접근성</h3>
            <p className="text-sm text-txt-muted">
              WAI-ARIA 디자인 패턴을 준수하며 aria-expanded 속성을 통해 스크린 리더 지원을 제공합니다.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
