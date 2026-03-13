import { useState, useEffect } from 'react';
import {
  DollarOutlined,
  SaveOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
  WalletOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Badge,
  Label,
  DataTable,
  ToggleButtonGroup,
} from '@/components/ui';
import type {
  PointSettingsFormData,
  SystemPointHistory,
  PointHistoryFilterType,
  EarnType,
  UseUnit,
} from '@/types/point';
import {
  EARN_TYPE_LABELS,
  EARN_TYPE_DESCRIPTIONS,
  USE_UNIT_OPTIONS,
  POINT_TYPE_BADGE,
  POINT_HISTORY_FILTER_OPTIONS,
  DEFAULT_POINT_SETTINGS_FORM,
  validatePointSettings,
} from '@/types/point';
import { POINT_TYPE_LABELS } from '@/types/app-member';
import { useToast, usePointSettings, useUpdatePointSettings, usePointStats, useSystemPointHistory } from '@/hooks';
import { auditService } from '@/services/auditService';
import { useAuthStore } from '@/stores/authStore';

const formatCurrency = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

const formatDateTime = (date: Date) =>
  new Date(date).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

// ============================================
// 컴포넌트
// ============================================

export function PointSettings() {
  const toast = useToast();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState<PointSettingsFormData>({ ...DEFAULT_POINT_SETTINGS_FORM });
  const [savedFormData, setSavedFormData] = useState<PointSettingsFormData>({ ...DEFAULT_POINT_SETTINGS_FORM });
  const [historyFilter, setHistoryFilter] = useState<PointHistoryFilterType>('all');
  const [historyPage, setHistoryPage] = useState(1);
  const historyLimit = 10;

  // 서버사이드 훅
  const { data: settingsData } = usePointSettings();
  const { data: statsData } = usePointStats();
  const { data: historyData } = useSystemPointHistory({ filter: historyFilter, page: historyPage, limit: historyLimit });
  const updateSettings = useUpdatePointSettings();

  // 설정 데이터 로드 시 폼 초기화
  useEffect(() => {
    if (settingsData?.data) {
      const s = settingsData.data;
      const loaded: PointSettingsFormData = {
        earnType: s.earnPolicy.type,
        fixedUnit: s.earnPolicy.fixedUnit,
        fixedPoints: s.earnPolicy.fixedPoints,
        percentageRate: s.earnPolicy.percentageRate,
        maxEarnPoints: s.earnPolicy.maxEarnPoints,
        minOrderAmount: s.earnPolicy.minOrderAmount,
        minUsePoints: s.usePolicy.minUsePoints,
        maxUseRate: s.usePolicy.maxUseRate,
        useUnit: s.usePolicy.useUnit,
        allowNegativeBalance: s.usePolicy.allowNegativeBalance,
        defaultValidityDays: s.expiryPolicy.defaultValidityDays,
        expiryNotificationDays: s.expiryPolicy.expiryNotificationDays,
      };
      setFormData(loaded);
      setSavedFormData(loaded);
    }
  }, [settingsData]);

  // 변경 감지
  const hasChanges = JSON.stringify(formData) !== JSON.stringify(savedFormData);

  const pointHistory = historyData?.data ?? [];
  const totalPages = historyData?.pagination ? Math.ceil(historyData.pagination.total / historyLimit) : 1;
  const systemStats = statsData?.data;

  // ── 이벤트 핸들러 ──

  const handleFormChange = (updates: Partial<PointSettingsFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    const errors = validatePointSettings(formData);
    if (errors.length > 0) {
      toast.error(errors[0]!);
      return;
    }

    updateSettings.mutate(formData, {
      onSuccess: () => {
        setSavedFormData({ ...formData });
        toast.success('포인트 설정이 저장되었습니다.');

        auditService.log({
          action: 'SETTINGS_CHANGED',
          resource: 'point-settings',
          userId: user?.id ?? 'anonymous',
          details: { updatedSettings: formData },
        });
      },
      onError: () => toast.error('설정 저장에 실패했습니다.'),
    });
  };

  const handleReset = () => {
    setFormData({ ...savedFormData });
    toast.info('변경사항이 초기화되었습니다.');
  };

  // 금액 색상
  const getAmountColor = (amount: number) => {
    if (amount > 0) return 'text-success';
    if (amount < 0) return 'text-critical';
    return 'text-txt-muted';
  };

  // DataTable 컬럼
  const historyColumns = [
    {
      key: 'createdAt' as const,
      header: '일시',
      render: (item: SystemPointHistory) => (
        <span className="text-sm text-txt-muted whitespace-nowrap">{formatDateTime(item.createdAt)}</span>
      ),
    },
    {
      key: 'memberName' as const,
      header: '회원',
      render: (item: SystemPointHistory) => (
        <span className="text-sm font-medium text-txt-main">{item.memberName}</span>
      ),
    },
    {
      key: 'type' as const,
      header: '유형',
      render: (item: SystemPointHistory) => (
        <Badge variant={POINT_TYPE_BADGE[item.type]}>{POINT_TYPE_LABELS[item.type]}</Badge>
      ),
    },
    {
      key: 'amount' as const,
      header: '금액',
      render: (item: SystemPointHistory) => (
        <span className={`text-sm font-semibold ${getAmountColor(item.amount)}`}>
          {item.amount > 0 ? '+' : ''}{formatCurrency(item.amount)}P
        </span>
      ),
    },
    {
      key: 'balance' as const,
      header: '잔액',
      render: (item: SystemPointHistory) => (
        <span className="text-sm text-txt-main">{formatCurrency(item.balance)}P</span>
      ),
    },
    {
      key: 'description' as const,
      header: '사유',
      render: (item: SystemPointHistory) => (
        <span className="text-sm text-txt-muted max-w-[200px] truncate block">{item.description}</span>
      ),
    },
    {
      key: 'expiresAt' as const,
      header: '만료일',
      render: (item: SystemPointHistory) => (
        <span className="text-sm text-txt-muted">
          {item.expiresAt ? formatDate(item.expiresAt) : '-'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl font-bold text-txt-main">포인트 설정</h1>
        <p className="text-txt-muted mt-1">주문 시 포인트 적립/사용 정책과 유효기간을 설정합니다.</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-txt-muted">전체 적립</p>
          <p className="text-2xl font-bold text-success mt-1">{formatCurrency(systemStats?.totalEarned ?? 0)}P</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">전체 사용</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(systemStats?.totalUsed ?? 0)}P</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">전체 소멸</p>
          <p className="text-2xl font-bold text-warning mt-1">{formatCurrency(systemStats?.totalExpired ?? 0)}P</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">시스템 총 잔액</p>
          <p className="text-2xl font-bold text-txt-main mt-1">{formatCurrency(systemStats?.currentBalance ?? 0)}P</p>
        </Card>
      </div>

      {/* 설정 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 적립 정책 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ShoppingCartOutlined className="text-success" />
              <h3 className="font-semibold text-txt-main">적립 정책</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>적립 방식</Label>
                <ToggleButtonGroup
                  options={[
                    { value: 'fixed' as EarnType, label: EARN_TYPE_LABELS.fixed },
                    { value: 'percentage' as EarnType, label: EARN_TYPE_LABELS.percentage },
                  ]}
                  value={formData.earnType}
                  onChange={(v) => handleFormChange({ earnType: v })}
                />
                <p className="text-xs text-txt-muted">
                  <InfoCircleOutlined className="mr-1" />
                  {EARN_TYPE_DESCRIPTIONS[formData.earnType]}
                </p>
              </div>

              {formData.earnType === 'fixed' ? (
                <>
                  <div className="space-y-2">
                    <Label required>기준 금액</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.fixedUnit || ''}
                        onChange={(e) => handleFormChange({ fixedUnit: Number(e.target.value) })}
                        min={100}
                        className="pr-16"
                        placeholder="1000"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">원당</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label required>적립 포인트</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.fixedPoints || ''}
                        onChange={(e) => handleFormChange({ fixedPoints: Number(e.target.value) })}
                        min={1}
                        className="pr-12"
                        placeholder="10"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">P</span>
                    </div>
                  </div>
                  <div className="p-3 bg-bg-hover rounded-lg text-sm text-txt-secondary">
                    예시: {formatCurrency(10000)}원 주문 시 <span className="font-semibold text-success">
                      {formatCurrency(Math.floor(10000 / (formData.fixedUnit || 1)) * formData.fixedPoints)}P
                    </span> 적립
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label required>적립 비율</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.percentageRate || ''}
                        onChange={(e) => handleFormChange({ percentageRate: Number(e.target.value) })}
                        min={0.1}
                        max={100}
                        step={0.1}
                        className="pr-12"
                        placeholder="1"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>최대 적립 포인트</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.maxEarnPoints ?? ''}
                        onChange={(e) => handleFormChange({
                          maxEarnPoints: e.target.value ? Number(e.target.value) : null,
                        })}
                        min={1}
                        className="pr-12"
                        placeholder="무제한"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">P</span>
                    </div>
                  </div>
                  <div className="p-3 bg-bg-hover rounded-lg text-sm text-txt-secondary">
                    예시: {formatCurrency(10000)}원 주문 시 <span className="font-semibold text-success">
                      {formatCurrency(Math.floor(10000 * formData.percentageRate / 100))}P
                    </span> 적립
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label>최소 주문금액</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.minOrderAmount || ''}
                    onChange={(e) => handleFormChange({ minOrderAmount: Number(e.target.value) })}
                    min={0}
                    className="pr-12"
                    placeholder="0"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">원</span>
                </div>
                <p className="text-xs text-txt-muted">0원이면 모든 주문에 적립됩니다.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 사용 정책 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <WalletOutlined className="text-primary" />
              <h3 className="font-semibold text-txt-main">사용 정책</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label required>최소 사용 포인트</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.minUsePoints || ''}
                    onChange={(e) => handleFormChange({ minUsePoints: Number(e.target.value) })}
                    min={1}
                    className="pr-12"
                    placeholder="100"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">P</span>
                </div>
                <p className="text-xs text-txt-muted">{formatCurrency(formData.minUsePoints)}P 이상부터 사용 가능합니다.</p>
              </div>

              <div className="space-y-2">
                <Label required>최대 사용 비율</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.maxUseRate || ''}
                    onChange={(e) => handleFormChange({ maxUseRate: Number(e.target.value) })}
                    min={1}
                    max={100}
                    className="pr-12"
                    placeholder="50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">%</span>
                </div>
                <p className="text-xs text-txt-muted">결제금액의 최대 {formData.maxUseRate}%까지 포인트로 결제 가능합니다.</p>
              </div>

              <div className="space-y-2">
                <Label>사용 단위</Label>
                <select
                  value={formData.useUnit}
                  onChange={(e) => handleFormChange({ useUnit: Number(e.target.value) as UseUnit })}
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {USE_UNIT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-xs text-txt-muted">{formatCurrency(formData.useUnit)}P 단위로 사용할 수 있습니다.</p>
              </div>

              <div className="p-3 bg-bg-hover rounded-lg text-sm text-txt-secondary">
                예시: {formatCurrency(20000)}원 주문 시 최대 <span className="font-semibold text-primary">
                  {formatCurrency(Math.floor(20000 * formData.maxUseRate / 100 / formData.useUnit) * formData.useUnit)}P
                </span> 사용 가능
              </div>

              {/* 마이너스 잔고 정책 */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>주문취소 시 마이너스 잔고 허용</Label>
                    <p className="text-xs text-txt-muted mt-1">
                      주문 취소 시 적립 포인트를 강제 회수하여 잔액이 마이너스가 될 수 있습니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFormChange({ allowNegativeBalance: !formData.allowNegativeBalance })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                      formData.allowNegativeBalance ? 'bg-primary' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform ${
                        formData.allowNegativeBalance ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
                {formData.allowNegativeBalance && (
                  <div className="p-3 bg-warning/10 rounded-lg text-xs text-warning">
                    마이너스 잔고 상태의 고객은 포인트 사용이 차단되며, 이후 적립 시 자동으로 복구됩니다.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 유효기간 */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <ClockCircleOutlined className="text-warning" />
              <h3 className="font-semibold text-txt-main">유효기간</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label required>기본 유효기간</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.defaultValidityDays || ''}
                    onChange={(e) => handleFormChange({ defaultValidityDays: Number(e.target.value) })}
                    min={1}
                    max={3650}
                    className="pr-12"
                    placeholder="365"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">일</span>
                </div>
                <p className="text-xs text-txt-muted">
                  적립일로부터 {formData.defaultValidityDays}일 후 자동 소멸됩니다.
                  {formData.defaultValidityDays >= 365 && ` (약 ${Math.floor(formData.defaultValidityDays / 365)}년)`}
                </p>
              </div>

              <div className="space-y-2">
                <Label required>만료 알림</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.expiryNotificationDays || ''}
                    onChange={(e) => handleFormChange({ expiryNotificationDays: Number(e.target.value) })}
                    min={1}
                    max={365}
                    className="pr-16"
                    placeholder="30"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">일 전</span>
                </div>
                <p className="text-xs text-txt-muted">만료 {formData.expiryNotificationDays}일 전 알림을 발송합니다.</p>
              </div>

              <div className="p-3 bg-warning/10 rounded-lg">
                <div className="flex items-start gap-2">
                  <InfoCircleOutlined className="text-warning mt-0.5" />
                  <div className="text-sm text-txt-secondary">
                    <p className="font-medium">유효기간 변경 안내</p>
                    <p className="mt-1">유효기간 변경 시 변경 이후 적립되는 포인트부터 적용됩니다. 기존 적립 포인트의 유효기간은 변경되지 않습니다.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 저장 버튼 */}
      <div className="flex justify-end gap-3">
        {hasChanges && (
          <Button variant="outline" onClick={handleReset}>
            변경 취소
          </Button>
        )}
        <Button onClick={handleSave} disabled={!hasChanges}>
          <SaveOutlined style={{ fontSize: 14, marginRight: 6 }} />
          설정 저장
        </Button>
      </div>

      {/* 포인트 이력 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarOutlined className="text-txt-muted" />
              <h3 className="font-semibold text-txt-main">포인트 이력</h3>
              <span className="text-sm text-txt-muted">({formatCurrency(historyData?.pagination?.total ?? 0)}건)</span>
            </div>
            <div className="flex gap-1">
              {POINT_HISTORY_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setHistoryFilter(opt.value); setHistoryPage(1); }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${historyFilter === opt.value
                      ? 'bg-primary text-white'
                      : 'bg-bg-hover text-txt-muted hover:bg-border'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={historyColumns}
            data={pointHistory}
            keyExtractor={(item) => item.id}
            emptyMessage="포인트 이력이 없습니다."
          />

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                disabled={historyPage === 1}
              >
                이전
              </Button>
              <span className="text-sm text-txt-muted">
                {historyPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryPage((p) => Math.min(totalPages, p + 1))}
                disabled={historyPage === totalPages}
              >
                다음
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
