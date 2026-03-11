import { useState } from 'react';
import {
  PlusOutlined,
  DeleteOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  InfoCircleOutlined,
  CopyOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Badge,
  Label,
  SearchInput,
  ConfirmDialog,
  ToggleButtonGroup,
} from '@/components/ui';
import type {
  BenefitCampaign,
  BenefitCampaignFormData,
  BenefitCampaignTrigger,
  BenefitCampaignStatus,
  CouponBenefitConfig,
  PointBenefitConfig,
} from '@/types/benefit-campaign';
import {
  BENEFIT_CAMPAIGN_TRIGGER_LABELS,
  BENEFIT_CAMPAIGN_TRIGGER_DESCRIPTIONS,
  BENEFIT_CAMPAIGN_STATUS_LABELS,
  BENEFIT_CAMPAIGN_STATUS_BADGE,
  BENEFIT_DELAY_UNIT_LABELS,
  DEFAULT_BENEFIT_CAMPAIGN_FORM,
  validateBenefitCampaignForm,
} from '@/types/benefit-campaign';
import type { BenefitDelayUnit } from '@/types/benefit-campaign';
import type { EarnType } from '@/types/point';
import { EARN_TYPE_LABELS } from '@/types/point';
import { useToast, useBenefitCampaignList, useCreateBenefitCampaign, useUpdateBenefitCampaign, useDeleteBenefitCampaign, useDuplicateBenefitCampaign, useAvailableCoupons, useBenefitCampaignStats } from '@/hooks';
import { TriggerConditionForm } from './TriggerConditionForm';

// 상태 필터 옵션
const STATUS_FILTER_OPTIONS: { value: BenefitCampaignStatus | 'all'; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '진행중' },
  { value: 'draft', label: '초안' },
  { value: 'paused', label: '일시중지' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소됨' },
];

// 트리거 선택 옵션
const TRIGGER_OPTIONS: { value: BenefitCampaignTrigger; label: string; description: string }[] = [
  { value: 'order', label: '주문 시', description: '주문 완료 시 자동 지급' },
  { value: 'signup', label: '회원 가입 시', description: '신규 가입 시 자동 지급' },
  { value: 'membership_upgrade', label: '멤버십 달성 시', description: '등급 달성 시 자동 지급' },
  { value: 'birthday', label: '생일', description: '생일에 자동 지급' },
  { value: 'member_group', label: '회원그룹 발급', description: '회원 그룹 선택 후 일괄 발급' },
  { value: 'referral_code', label: '추천인 코드', description: '코드 입력 시 자동 지급' },
  { value: 'manual_upload', label: '수기 업로드', description: '회원 리스트 업로드 후 지급' },
  { value: 'promo_code', label: '난수 발행쿠폰', description: '랜덤 코드 생성/업로드 후 매칭 시 지급' },
];

const formatCurrency = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

export function BenefitCampaigns() {
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<BenefitCampaignStatus | 'all'>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<BenefitCampaign | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formData, setFormData] = useState<BenefitCampaignFormData>({ ...DEFAULT_BENEFIT_CAMPAIGN_FORM });
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean;
    campaignName: string;
    isNew: boolean;
  }>({ isOpen: false, campaignName: '', isNew: true });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 서버사이드 훅
  const { data: campaignListData } = useBenefitCampaignList({
    keyword: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { data: statsData } = useBenefitCampaignStats();
  const { data: availableCouponsData } = useAvailableCoupons();
  const createCampaign = useCreateBenefitCampaign();
  const updateCampaignMutation = useUpdateBenefitCampaign();
  const deleteCampaignMutation = useDeleteBenefitCampaign();
  const duplicateCampaignMutation = useDuplicateBenefitCampaign();

  const campaigns = campaignListData?.data ?? [];
  const availableCoupons = availableCouponsData?.data ?? [];
  const activeCount = statsData?.data?.active ?? 0;
  const totalIssued = statsData?.data?.totalIssued ?? 0;
  const totalBeneficiaries = statsData?.data?.totalBeneficiaries ?? 0;

  // ── 이벤트 핸들러 ──

  const handleSelectCampaign = (campaign: BenefitCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      description: campaign.description,
      trigger: campaign.trigger,
      orderMinAmount: campaign.orderCondition?.minOrderAmount ?? null,
      orderNthOrder: campaign.orderCondition?.nthOrder ?? null,
      orderIsEveryNth: campaign.orderCondition?.isEveryNthOrder ?? false,
      orderSpecificProductIds: campaign.orderCondition?.specificProductIds ?? [],
      signupDelayMinutes: campaign.signupCondition?.delayMinutes ?? 0,
      membershipTargetGrades: campaign.membershipCondition?.targetGrades ?? [],
      birthdayDaysBefore: campaign.birthdayCondition?.daysBefore ?? 0,
      birthdayDaysAfter: campaign.birthdayCondition?.daysAfter ?? 30,
      birthdayRepeatYearly: campaign.birthdayCondition?.repeatYearly ?? true,
      manualIssueTargetType: campaign.memberGroupCondition?.manualIssueTargetType ?? 'groups',
      manualIssueMemberIds: campaign.memberGroupCondition?.manualIssueMemberIds ?? [],
      manualIssueGroupIds: campaign.memberGroupCondition?.manualIssueGroupIds ?? [],
      manualIssueGradeIds: campaign.memberGroupCondition?.manualIssueGradeIds ?? [],
      referralCodes: campaign.referralCodeCondition?.referralCodes ?? [],
      referralCodeSingleUse: campaign.referralCodeCondition?.singleUsePerCode ?? true,
      uploadFileName: campaign.manualUploadCondition?.uploadedFileName ?? null,
      uploadMemberIds: campaign.manualUploadCondition?.uploadedMemberIds ?? [],
      promoCodeMethod: campaign.promoCodeCondition?.generationMethod ?? 'random',
      promoCodePrefix: campaign.promoCodeCondition?.codePrefix ?? '',
      promoCodeLength: campaign.promoCodeCondition?.codeLength ?? 8,
      promoCodeQuantity: campaign.promoCodeCondition?.codeQuantity ?? 100,
      promoCodes: campaign.promoCodeCondition?.promoCodes ?? [],
      promoCodeUploadFileName: campaign.promoCodeCondition?.uploadedFileName ?? null,
      promoCodeMaxUsesPerCode: campaign.promoCodeCondition?.usageCondition.maxUsesPerCode ?? 1,
      promoCodeMaxUsesPerMember: campaign.promoCodeCondition?.usageCondition.maxUsesPerMember ?? 1,
      promoCodeValidityDays: campaign.promoCodeCondition?.usageCondition.codeValidityDays ?? null,
      couponBenefits: campaign.benefitConfig.couponBenefits.map((c) => ({ ...c })),
      pointBenefits: campaign.benefitConfig.pointBenefits.map((p) => ({ ...p })),
      benefitDelayUnit: campaign.benefitConfig.delay?.unit ?? 'none',
      benefitDelayDays: campaign.benefitConfig.delay?.days ?? 1,
      benefitDelayHour: campaign.benefitConfig.delay?.hour ?? 0,
      benefitDelayMinute: campaign.benefitConfig.delay?.minute ?? 0,
      startDate: campaign.startDate,
      endDate: campaign.endDate ?? '',
    });
    setIsFormActive(true);
  };

  const handleNewCampaign = () => {
    setSelectedCampaign(null);
    setFormData({ ...DEFAULT_BENEFIT_CAMPAIGN_FORM });
    setIsFormActive(true);
  };

  const handleCancel = () => {
    setSelectedCampaign(null);
    setFormData({ ...DEFAULT_BENEFIT_CAMPAIGN_FORM });
    setIsFormActive(false);
  };

  const handleTriggerChange = (trigger: BenefitCampaignTrigger) => {
    setFormData((prev) => ({ ...prev, trigger }));
  };

  const handleFormChange = (updates: Partial<BenefitCampaignFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleDuplicate = () => {
    if (!selectedCampaign) return;
    duplicateCampaignMutation.mutate(selectedCampaign.id, {
      onSuccess: () => {
        handleCancel();
        toast.success('캠페인이 복제되었습니다.');
      },
      onError: () => toast.error('복제에 실패했습니다.'),
    });
  };

  // 혜택 추가/삭제 핸들러
  const handleAddCouponBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      couponBenefits: [...prev.couponBenefits, { couponId: '', couponName: '' }],
    }));
  };

  const handleRemoveCouponBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      couponBenefits: prev.couponBenefits.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateCouponBenefit = (index: number, updates: Partial<CouponBenefitConfig>) => {
    setFormData((prev) => ({
      ...prev,
      couponBenefits: prev.couponBenefits.map((c, i) => i === index ? { ...c, ...updates } : c),
    }));
  };

  const handleAddPointBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      pointBenefits: [...prev.pointBenefits, { earnType: 'fixed' as EarnType, pointAmount: 0, percentageRate: 0, maxEarnPoints: null, pointValidityDays: null, pointDescription: '' }],
    }));
  };

  const handleRemovePointBenefit = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pointBenefits: prev.pointBenefits.filter((_, i) => i !== index),
    }));
  };

  const handleUpdatePointBenefit = (index: number, updates: Partial<PointBenefitConfig>) => {
    setFormData((prev) => ({
      ...prev,
      pointBenefits: prev.pointBenefits.map((p, i) => i === index ? { ...p, ...updates } : p),
    }));
  };

  const handleSave = () => {
    const errors = validateBenefitCampaignForm(formData);
    if (errors.length > 0) {
      toast.error(errors[0]!);
      return;
    }

    const isNew = !selectedCampaign;
    const onSuccess = () => {
      setSuccessDialog({ isOpen: true, campaignName: formData.name, isNew });
    };
    const onError = (error: Error) => toast.error(error.message || (isNew ? '등록에 실패했습니다.' : '수정에 실패했습니다.'));

    if (isNew) {
      createCampaign.mutate(formData, { onSuccess, onError });
    } else {
      updateCampaignMutation.mutate(
        {
          id: selectedCampaign.id,
          data: formData,
          existingStatus: selectedCampaign.status,
          existingUploadedAt: selectedCampaign.manualUploadCondition?.uploadedAt ?? null,
        },
        { onSuccess, onError },
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    deleteCampaignMutation.mutate(targetId, {
      onSuccess: () => {
        if (selectedCampaign?.id === targetId) {
          handleCancel();
        }
        toast.success('캠페인이 삭제되었습니다.');
      },
      onError: () => toast.error('삭제에 실패했습니다.'),
    });
    setDeleteTarget(null);
  };

  const handleCloseSuccessDialog = (addMore: boolean) => {
    setSuccessDialog({ isOpen: false, campaignName: '', isNew: true });
    if (addMore) {
      setFormData({ ...DEFAULT_BENEFIT_CAMPAIGN_FORM });
      setSelectedCampaign(null);
    } else {
      handleCancel();
    }
  };

  // ── JSX 렌더링 ──

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">캠페인 관리</h1>
          <p className="text-sm text-txt-muted mt-1">
            트리거 기반 혜택 자동 지급 캠페인을 관리합니다.
          </p>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-txt-muted">총 캠페인</p>
          <p className="text-2xl font-bold text-txt-main">{statsData?.data?.total ?? 0}</p>
          <p className="text-xs text-txt-muted">등록된 캠페인</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">진행중</p>
          <p className="text-2xl font-bold text-success">{activeCount}</p>
          <p className="text-xs text-txt-muted">활성 캠페인</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">총 혜택 지급</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(totalIssued)}</p>
          <p className="text-xs text-txt-muted">누적 지급 횟수</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">총 수혜자</p>
          <p className="text-2xl font-bold text-warning">{formatCurrency(totalBeneficiaries)}</p>
          <p className="text-xs text-txt-muted">누적 수혜 인원</p>
        </Card>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
        {/* 왼쪽: 캠페인 목록 */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-txt-main">캠페인 목록</h2>
            <Button size="sm" onClick={handleNewCampaign}>
              <PlusOutlined style={{ fontSize: 14, marginRight: 4 }} />
              추가
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 상태 필터 */}
            <div className="flex gap-1 flex-wrap">
              {STATUS_FILTER_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setStatusFilter(option.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${statusFilter === option.value
                      ? 'bg-primary text-white'
                      : 'bg-bg-hover text-txt-muted hover:bg-border'
                    }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* 검색 */}
            <SearchInput
              placeholder="캠페인명 검색..."
              value={searchTerm}
              onChange={setSearchTerm}
            />

            {/* 캠페인 리스트 */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {campaigns.length > 0 ? (
                campaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    onClick={() => handleSelectCampaign(campaign)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedCampaign?.id === campaign.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-bg-hover'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <ThunderboltOutlined style={{ fontSize: 18 }} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-txt-main truncate">{campaign.name}</h3>
                          <Badge
                            variant={BENEFIT_CAMPAIGN_STATUS_BADGE[campaign.status]}
                            className="flex-shrink-0"
                          >
                            {BENEFIT_CAMPAIGN_STATUS_LABELS[campaign.status]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="default" className="text-xs">
                            {BENEFIT_CAMPAIGN_TRIGGER_LABELS[campaign.trigger]}
                          </Badge>
                          {campaign.benefitConfig.couponBenefits.length > 0 && (
                            <Badge variant="info" className="text-xs">
                              쿠폰 {campaign.benefitConfig.couponBenefits.length}건
                            </Badge>
                          )}
                          {campaign.benefitConfig.pointBenefits.length > 0 && (
                            <Badge variant="info" className="text-xs">
                              포인트 {campaign.benefitConfig.pointBenefits.length}건
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-txt-muted mt-1">
                          {`${campaign.startDate} ~ ${campaign.endDate || '미설정'}`}
                          {' · '}
                          지급 {formatCurrency(campaign.totalIssuedCount)}건
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({ id: campaign.id, name: campaign.name });
                        }}
                        className="p-1.5 hover:bg-critical/10 rounded transition-colors"
                      >
                        <DeleteOutlined style={{ fontSize: 14 }} className="text-critical" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-txt-muted">
                  <ThunderboltOutlined style={{ fontSize: 32 }} className="mb-2 opacity-50" />
                  <p>캠페인이 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽: 폼 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-txt-main">
              {!isFormActive
                ? '캠페인 정보'
                : selectedCampaign
                  ? '캠페인 수정'
                  : '새 캠페인 등록'}
            </h2>
          </CardHeader>
          <CardContent>
            {!isFormActive ? (
              <div className="flex flex-col items-center justify-center py-16 text-txt-muted">
                <ThunderboltOutlined style={{ fontSize: 48 }} className="mb-4 opacity-30" />
                <p className="text-lg mb-2">캠페인을 선택하거나 새로 등록하세요</p>
                <p className="text-sm mb-6">왼쪽 목록에서 캠페인을 선택하면 상세 정보를 확인할 수 있습니다.</p>
                <Button onClick={handleNewCampaign}>
                  <PlusOutlined style={{ fontSize: 16, marginRight: 8 }} />
                  새 캠페인 등록
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 수정 모드 통계 */}
                {selectedCampaign && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-bg-hover rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-txt-muted">총 지급 수</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(selectedCampaign.totalIssuedCount)}
                      </p>
                    </div>
                    <div className="text-center border-l border-border">
                      <p className="text-sm text-txt-muted">총 수혜자</p>
                      <p className="text-xl font-bold text-success">
                        {formatCurrency(selectedCampaign.totalBeneficiaryCount)}
                      </p>
                    </div>
                  </div>
                )}

                {/* 기본 정보 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">기본 정보</h3>
                  <div className="space-y-2">
                    <Label required>캠페인명</Label>
                    <Input
                      placeholder="예: 첫 주문 포인트 적립 캠페인"
                      value={formData.name}
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>설명</Label>
                    <Input
                      placeholder="캠페인에 대한 설명을 입력하세요"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                </div>

                {/* 트리거 유형 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">트리거 유형</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {TRIGGER_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${formData.trigger === option.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                          }`}
                      >
                        <input
                          type="radio"
                          name="trigger"
                          value={option.value}
                          checked={formData.trigger === option.value}
                          onChange={() => handleTriggerChange(option.value)}
                          className="sr-only"
                        />
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${formData.trigger === option.value
                              ? 'border-primary bg-primary'
                              : 'border-border-strong'
                            }`}
                        >
                          {formData.trigger === option.value && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-txt-main">{option.label}</p>
                          <p className="text-sm text-txt-muted">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg">
                    <InfoCircleOutlined className="text-info mt-0.5" />
                    <p className="text-sm text-txt-secondary">
                      {BENEFIT_CAMPAIGN_TRIGGER_DESCRIPTIONS[formData.trigger]}
                    </p>
                  </div>
                </div>

                {/* 트리거 조건 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">트리거 조건</h3>
                  <TriggerConditionForm formData={formData} onFormChange={handleFormChange} />
                </div>

                {/* 혜택 설정 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">혜택 설정</h3>
                  <p className="text-xs text-txt-muted">쿠폰과 포인트를 복수로 추가할 수 있습니다. 최소 1개 이상의 혜택을 설정해주세요.</p>

                  {/* 쿠폰 혜택 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>쿠폰 혜택</Label>
                      <Button variant="outline" size="sm" onClick={handleAddCouponBenefit}>
                        <PlusOutlined style={{ fontSize: 12, marginRight: 4 }} />
                        쿠폰 추가
                      </Button>
                    </div>
                    {formData.couponBenefits.length === 0 && (
                      <p className="text-sm text-txt-muted p-3 bg-bg-hover rounded-lg text-center">
                        등록된 쿠폰 혜택이 없습니다.
                      </p>
                    )}
                    {formData.couponBenefits.map((coupon, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 bg-bg-hover rounded-lg">
                        <select
                          value={coupon.couponId}
                          onChange={(e) => {
                            const selected = availableCoupons.find((c) => c.id === e.target.value);
                            handleUpdateCouponBenefit(index, {
                              couponId: e.target.value,
                              couponName: selected?.name ?? '',
                            });
                          }}
                          className="flex-1 h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="">쿠폰을 선택하세요</option>
                          {availableCoupons.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveCouponBenefit(index)}
                          className="p-2 text-txt-muted hover:text-critical transition-colors"
                        >
                          <DeleteOutlined style={{ fontSize: 14 }} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* 포인트 혜택 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>포인트 혜택</Label>
                      <Button variant="outline" size="sm" onClick={handleAddPointBenefit}>
                        <PlusOutlined style={{ fontSize: 12, marginRight: 4 }} />
                        포인트 추가
                      </Button>
                    </div>
                    {formData.pointBenefits.length === 0 && (
                      <p className="text-sm text-txt-muted p-3 bg-bg-hover rounded-lg text-center">
                        등록된 포인트 혜택이 없습니다.
                      </p>
                    )}
                    {formData.pointBenefits.map((point, index) => (
                      <div key={index} className="space-y-3 p-4 bg-bg-hover rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-txt-main">포인트 #{index + 1}</span>
                          <button
                            type="button"
                            onClick={() => handleRemovePointBenefit(index)}
                            className="p-1 text-txt-muted hover:text-critical transition-colors"
                          >
                            <DeleteOutlined style={{ fontSize: 14 }} />
                          </button>
                        </div>
                        <div className="space-y-1">
                          <Label>적립 방식</Label>
                          <ToggleButtonGroup
                            options={[
                              { value: 'fixed' as EarnType, label: EARN_TYPE_LABELS.fixed },
                              { value: 'percentage' as EarnType, label: EARN_TYPE_LABELS.percentage },
                            ]}
                            value={point.earnType}
                            onChange={(v) => handleUpdatePointBenefit(index, { earnType: v })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {point.earnType === 'fixed' ? (
                            <div className="space-y-1">
                              <Label required>적립 포인트</Label>
                              <div className="relative">
                                <Input
                                  type="number"
                                  placeholder="1000"
                                  value={point.pointAmount || ''}
                                  onChange={(e) =>
                                    handleUpdatePointBenefit(index, { pointAmount: Number(e.target.value) })
                                  }
                                  min={1}
                                  max={1000000}
                                  className="pr-12"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">P</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="space-y-1">
                                <Label required>적립 비율</Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder="5"
                                    value={point.percentageRate || ''}
                                    onChange={(e) =>
                                      handleUpdatePointBenefit(index, { percentageRate: Number(e.target.value) })
                                    }
                                    min={0.1}
                                    max={100}
                                    step={0.1}
                                    className="pr-12"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">%</span>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <Label>최대 적립 포인트</Label>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    placeholder="무제한"
                                    value={point.maxEarnPoints ?? ''}
                                    onChange={(e) =>
                                      handleUpdatePointBenefit(index, {
                                        maxEarnPoints: e.target.value ? Number(e.target.value) : null,
                                      })
                                    }
                                    min={1}
                                    className="pr-12"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">P</span>
                                </div>
                              </div>
                            </>
                          )}
                          <div className="space-y-1">
                            <Label>유효 기간</Label>
                            <div className="relative">
                              <Input
                                type="number"
                                placeholder="무제한"
                                value={point.pointValidityDays ?? ''}
                                onChange={(e) =>
                                  handleUpdatePointBenefit(index, {
                                    pointValidityDays: e.target.value ? Number(e.target.value) : null,
                                  })
                                }
                                min={1}
                                max={3650}
                                className="pr-12"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">일</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>적립 내역 설명</Label>
                          <Input
                            placeholder="예: 첫 주문 감사 포인트"
                            value={point.pointDescription}
                            onChange={(e) =>
                              handleUpdatePointBenefit(index, { pointDescription: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 지급 지연 설정 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">지급 조건</h3>
                  <div className="space-y-2">
                    <Label>지급 지연</Label>
                    <ToggleButtonGroup
                      options={Object.entries(BENEFIT_DELAY_UNIT_LABELS).map(([v, l]) => ({
                        value: v as BenefitDelayUnit,
                        label: l,
                      }))}
                      value={formData.benefitDelayUnit}
                      onChange={(v) => setFormData((prev) => ({ ...prev, benefitDelayUnit: v }))}
                    />
                  </div>

                  {formData.benefitDelayUnit === 'days' && (
                    <div className="space-y-2 p-4 bg-bg-hover rounded-lg">
                      <Label required>지연 일수</Label>
                      <div className="relative w-48">
                        <Input
                          type="number"
                          value={formData.benefitDelayDays}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            if (val >= 1 && val <= 365) {
                              setFormData((prev) => ({ ...prev, benefitDelayDays: val }));
                            }
                          }}
                          min={1}
                          max={365}
                          className="pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">일 후</span>
                      </div>
                      <p className="text-xs text-txt-muted">트리거 발동 후 {formData.benefitDelayDays}일 뒤에 혜택이 지급됩니다.</p>
                    </div>
                  )}

                  {formData.benefitDelayUnit === 'hours' && (
                    <div className="space-y-2 p-4 bg-bg-hover rounded-lg">
                      <Label required>지급 시각</Label>
                      <div className="flex items-center gap-2">
                        <select
                          value={formData.benefitDelayHour}
                          onChange={(e) => setFormData((prev) => ({ ...prev, benefitDelayHour: Number(e.target.value) }))}
                          className="h-10 px-3 border border-border rounded-lg text-sm bg-bg-main text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {Array.from({ length: 24 }, (_, i) => (
                            <option key={i} value={i}>{String(i).padStart(2, '0')}시</option>
                          ))}
                        </select>
                        <select
                          value={formData.benefitDelayMinute}
                          onChange={(e) => setFormData((prev) => ({ ...prev, benefitDelayMinute: Number(e.target.value) }))}
                          className="h-10 px-3 border border-border rounded-lg text-sm bg-bg-main text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {[0, 10, 20, 30, 40, 50].map((m) => (
                            <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-txt-muted">
                        트리거 발동 후 다음 {String(formData.benefitDelayHour).padStart(2, '0')}:{String(formData.benefitDelayMinute).padStart(2, '0')}에 혜택이 지급됩니다.
                      </p>
                    </div>
                  )}
                </div>

                {/* 캠페인 기간 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">캠페인 기간</h3>
                  <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                      <Label required>시작일</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label required>종료일</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <div>
                    {selectedCampaign && (
                      <Button variant="outline" onClick={handleDuplicate}>
                        <CopyOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        복제
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleCancel}>
                      취소
                    </Button>
                    <Button onClick={handleSave}>
                      {selectedCampaign ? '수정' : '등록'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 성공 다이얼로그 */}
      {successDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckOutlined style={{ fontSize: 32 }} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-txt-main mb-2">
                {successDialog.isNew ? '캠페인 등록 완료' : '캠페인 수정 완료'}
              </h3>
              <p className="text-txt-muted mb-6">
                &quot;{successDialog.campaignName}&quot; 캠페인이 {successDialog.isNew ? '등록' : '수정'}되었습니다.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => handleCloseSuccessDialog(false)}>
                  목록으로
                </Button>
                {successDialog.isNew && (
                  <Button className="flex-1" onClick={() => handleCloseSuccessDialog(true)}>
                    추가 등록
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        type="warning"
        title="캠페인 삭제"
        message={`"${deleteTarget?.name}" 캠페인을 삭제하시겠습니까?\n삭제된 캠페인은 복구할 수 없습니다.`}
        confirmText="삭제"
        cancelText="취소"
      />
    </div>
  );
}
