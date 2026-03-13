import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { useBrandConfig } from '@/hooks/useSettings';
import { SETTINGS_ORDER_TYPE_LABELS, INTEGRATION_TYPE_LABELS, MENU_CONTROL_TYPE_LABELS } from '@/types/settings';
import type { SettingsOrderType } from '@/types/settings';

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start py-3 border-b border-border last:border-b-0">
      <span className="w-40 shrink-0 text-sm font-medium text-txt-muted">{label}</span>
      <span className="text-sm text-txt-main">{value}</span>
    </div>
  );
}

function formatCurrency(amount: number) {
  return `${amount.toLocaleString()}원`;
}

export function Settings() {
  const { data: config, isLoading, error } = useBrandConfig();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-txt-muted">설정 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">설정 정보를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const isStoreAutonomy = config.menuControl.type === 'STORE';

  return (
    <div className="space-y-6">
      {/* 브랜드 정보 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-txt-main">브랜드 정보</h2>
          <p className="text-sm text-txt-muted mt-1">슈퍼어드민에서 설정한 브랜드 기본 정보입니다.</p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <img
              src={config.brandInfo.logoUrl}
              alt={`${config.brandInfo.name} 로고`}
              className="h-10 object-contain rounded border border-border p-1"
            />
            <span className="text-lg font-semibold text-txt-main">{config.brandInfo.name}</span>
          </div>
        </CardContent>
      </Card>

      {/* 운영 유형 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-txt-main">운영 유형</h2>
          <p className="text-sm text-txt-muted mt-1">브랜드의 주문 유형 및 초기 운영 설정입니다.</p>
        </CardHeader>
        <CardContent>
          <InfoRow
            label="주문 유형"
            value={
              <div className="flex flex-wrap gap-2">
                {config.orderTypes.map((type: SettingsOrderType) => (
                  <Badge key={type} variant="info">{SETTINGS_ORDER_TYPE_LABELS[type]}</Badge>
                ))}
              </div>
            }
          />
          <InfoRow label="운영 시간" value={config.initialSettings.operatingHours} />
          <InfoRow label="기본 배달비" value={formatCurrency(config.initialSettings.deliveryFee)} />
          <InfoRow
            label="최소 주문금액"
            value={
              <div className="space-y-1">
                <div>배달: {formatCurrency(config.initialSettings.minOrderAmount.delivery)}</div>
                {config.initialSettings.minOrderAmount.pickup > 0 && (
                  <div>포장: {formatCurrency(config.initialSettings.minOrderAmount.pickup)}</div>
                )}
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* 메뉴 설정 권한 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-txt-main">메뉴 설정 권한</h2>
          <p className="text-sm text-txt-muted mt-1">메뉴(상품) 관리 권한이 본사에 있는지, 가맹점에 위임되어 있는지 확인합니다.</p>
        </CardHeader>
        <CardContent>
          <InfoRow
            label="설정 주체"
            value={
              <Badge variant={isStoreAutonomy ? 'info' : 'success'}>
                {MENU_CONTROL_TYPE_LABELS[config.menuControl.type]}
              </Badge>
            }
          />
          {isStoreAutonomy && (
            <>
              <InfoRow
                label="본사 기본 메뉴 동기화"
                value={config.menuControl.syncBaseMenu ? '사용' : '미사용'}
              />
              <InfoRow
                label="가격 변경 허용"
                value={config.menuControl.allowPriceChange ? '허용' : '불가'}
              />
              <InfoRow
                label="신규 메뉴 추가 허용"
                value={config.menuControl.allowAddMenu ? '허용' : '불가'}
              />
              <InfoRow
                label="메뉴 삭제 허용"
                value={config.menuControl.allowDeleteMenu ? '허용' : '불가'}
              />
            </>
          )}
          {!isStoreAutonomy && (
            <div className="mt-3 p-3 bg-bg-hover rounded-lg text-sm text-txt-secondary">
              본사에서 메뉴를 통합 관리합니다. 가맹점에서는 메뉴를 수정할 수 없습니다.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 연동 및 계약 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-txt-main">연동 및 계약 정보</h2>
          <p className="text-sm text-txt-muted mt-1">PG사, POS 연동 상태와 계약 정보입니다.</p>
        </CardHeader>
        <CardContent>
          <InfoRow
            label="계약 PG사"
            value={
              <span className="flex items-center gap-2">
                {config.integration.pg.provider}
                <Badge variant="success">{INTEGRATION_TYPE_LABELS[config.integration.pg.type]}</Badge>
              </span>
            }
          />
          <InfoRow
            label="연동 POS"
            value={
              <span className="flex items-center gap-2">
                {config.integration.pos.provider}
                <Badge variant="success">{INTEGRATION_TYPE_LABELS[config.integration.pos.type]}</Badge>
              </span>
            }
          />
          <InfoRow
            label="계약 기간"
            value={`${config.contract.period.start} ~ ${config.contract.period.end}`}
          />
          <InfoRow label="운영 수수료" value={`${config.contract.commissionRate}%`} />
          <InfoRow label="운영 요금제" value={config.contract.plan} />
          <InfoRow label="담당자 연락처" value={config.contract.managerContact} />
        </CardContent>
      </Card>

      {/* 지원 채널 */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-txt-main">가이드 및 고객 지원</h2>
          <p className="text-sm text-txt-muted mt-1">사이트 이용 방법 안내와 본사 문의 채널입니다.</p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <a
              href={config.supportLinks.guideUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-txt-main hover:bg-bg-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              기능 사용 가이드
            </a>
            <a
              href={config.supportLinks.inquiryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-5 py-3 text-sm font-medium text-txt-main hover:bg-bg-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              본사 문의
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
