import { useState } from 'react';
import {
  CheckOutlined,
  InfoCircleOutlined,
  UploadOutlined,
  DownloadOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import {
  Button,
  Input,
  Label,
  ProductSelector,
  ToggleButtonGroup,
} from '@/components/ui';
import type { BenefitCampaignFormData, PromoCodeGenerationMethod } from '@/types/benefit-campaign';
import type { MemberGrade } from '@/types/member';
import { getMemberGradeLabel } from '@/utils/memberGrade';
import { generatePromoCodes, parseUploadedCodes, downloadPromoCodesCsv } from '@/utils/promoCode';
import { useToast, useMemberGroups } from '@/hooks';

const MAX_CSV_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_UPLOAD_MEMBERS = 50000;
const MAX_PROMO_CODE_QUANTITY = 100000;
const REFERRAL_CODE_PATTERN = /^[A-Z0-9]{3,20}$/;
const UPGRADE_GRADES: MemberGrade[] = ['grade-vip', 'grade-gold', 'grade-silver', 'grade-normal'];

interface TriggerConditionFormProps {
  formData: BenefitCampaignFormData;
  onFormChange: (updates: Partial<BenefitCampaignFormData>) => void;
}

export function TriggerConditionForm({ formData, onFormChange }: TriggerConditionFormProps) {
  const toast = useToast();
  const [newReferralCode, setNewReferralCode] = useState('');

  const handleAddReferralCode = () => {
    const code = newReferralCode.trim().toUpperCase();
    if (!code) return;
    if (!REFERRAL_CODE_PATTERN.test(code)) {
      toast.warning('코드는 영문 대문자와 숫자 3~20자로 입력해주세요.');
      return;
    }
    if (formData.referralCodes.includes(code)) {
      toast.warning('이미 등록된 코드입니다.');
      return;
    }
    onFormChange({ referralCodes: [...formData.referralCodes, code] });
    setNewReferralCode('');
  };

  const handleRemoveReferralCode = (code: string) => {
    onFormChange({ referralCodes: formData.referralCodes.filter((c) => c !== code) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_CSV_FILE_SIZE) {
      toast.error('파일 크기는 5MB 이하만 허용됩니다.');
      e.target.value = '';
      return;
    }

    if (file.type && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      toast.error('CSV 파일만 업로드 가능합니다.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = typeof event.target?.result === 'string' ? event.target.result : '';
      const lines = text.split('\n').filter((line) => line.trim());
      const memberIds = lines
        .slice(1)
        .map((line) => line.split(',')[0]?.trim().replace(/[<>"'&]/g, ''))
        .filter((id): id is string => !!id && id.length <= 50);

      if (memberIds.length > MAX_UPLOAD_MEMBERS) {
        toast.error(`회원 수는 최대 ${MAX_UPLOAD_MEMBERS.toLocaleString()}명까지 허용됩니다.`);
        return;
      }

      onFormChange({ uploadFileName: file.name, uploadMemberIds: memberIds });
      toast.success(`${memberIds.length}명의 회원이 로드되었습니다.`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  switch (formData.trigger) {
    case 'order':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>최소 주문 금액</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="제한 없음"
                  value={formData.orderMinAmount ?? ''}
                  onChange={(e) =>
                    onFormChange({ orderMinAmount: e.target.value ? Number(e.target.value) : null })
                  }
                  min={0}
                  max={100000000}
                  className="pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">원</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>N번째 주문</Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="매 주문"
                  value={formData.orderNthOrder ?? ''}
                  onChange={(e) =>
                    onFormChange({ orderNthOrder: e.target.value ? Number(e.target.value) : null })
                  }
                  min={1}
                  max={1000}
                  className="pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">번째</span>
              </div>
            </div>
          </div>

          {formData.orderNthOrder && formData.orderNthOrder > 0 && (
            <div className="space-y-2">
              <Label>반복 여부</Label>
              <ToggleButtonGroup
                options={[
                  { value: 'false', label: '해당 주문만 (1회)' },
                  { value: 'true', label: `매 ${formData.orderNthOrder}번째마다 반복` },
                ]}
                value={String(formData.orderIsEveryNth)}
                onChange={(v) => onFormChange({ orderIsEveryNth: v === 'true' })}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>특정 상품 포함 조건</Label>
            <ProductSelector
              selectedProductIds={formData.orderSpecificProductIds}
              onChange={(productIds) => onFormChange({ orderSpecificProductIds: productIds })}
              title="조건 상품 선택"
              description="특정 상품이 포함된 주문에만 혜택을 지급합니다. 선택하지 않으면 모든 주문에 적용됩니다."
            />
          </div>
        </div>
      );

    case 'signup':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>지급 시점</Label>
            <ToggleButtonGroup
              options={[
                { value: 'immediate', label: '즉시 지급' },
                { value: 'delayed', label: '지연 지급' },
              ]}
              value={formData.signupDelayMinutes === 0 ? 'immediate' : 'delayed'}
              onChange={(v) =>
                onFormChange({ signupDelayMinutes: v === 'immediate' ? 0 : (formData.signupDelayMinutes || 30) })
              }
            />
          </div>

          {formData.signupDelayMinutes > 0 && (
            <div className="space-y-2">
              <Label>지연 시간</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.signupDelayMinutes}
                  onChange={(e) => onFormChange({ signupDelayMinutes: Number(e.target.value) })}
                  min={1}
                  max={10080}
                  className="pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">분 후</span>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 p-3 bg-warning/10 rounded-lg">
            <InfoCircleOutlined className="text-warning mt-0.5" />
            <div className="text-sm text-txt-secondary">
              <p className="font-medium">신규/기존 회원 구분 안내</p>
              <p className="mt-1">가입 트리거는 가입 시점에 발동되므로 모든 가입자에게 혜택이 지급됩니다.
                탈퇴 후 재가입 시 CI값이 삭제되어 기존 회원 여부를 확인할 수 없습니다.</p>
            </div>
          </div>
        </div>
      );

    case 'membership_upgrade':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label required>대상 등급</Label>
            <p className="text-xs text-txt-muted">해당 등급에 도달하면 혜택이 자동 지급됩니다.</p>
            <ToggleButtonGroup
              multiple
              variant="filled"
              options={UPGRADE_GRADES.map((g) => ({ value: g, label: getMemberGradeLabel(g) }))}
              value={formData.membershipTargetGrades}
              onChange={(grades) => onFormChange({ membershipTargetGrades: grades })}
            />
          </div>
        </div>
      );

    case 'birthday':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>지급 시점</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.birthdayDaysBefore}
                  onChange={(e) => onFormChange({ birthdayDaysBefore: Number(e.target.value) })}
                  min={0}
                  max={90}
                  className="pr-16"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">일 전</span>
              </div>
              <p className="text-xs text-txt-muted">0 = 생일 당일</p>
            </div>
            <div className="space-y-2">
              <Label>사용 가능 기간</Label>
              <div className="relative">
                <Input
                  type="number"
                  value={formData.birthdayDaysAfter}
                  onChange={(e) => onFormChange({ birthdayDaysAfter: Number(e.target.value) })}
                  min={1}
                  max={365}
                  className="pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">일간</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>반복 설정</Label>
            <ToggleButtonGroup
              options={[
                { value: 'true', label: '매년 반복' },
                { value: 'false', label: '1회만' },
              ]}
              value={String(formData.birthdayRepeatYearly)}
              onChange={(v) => onFormChange({ birthdayRepeatYearly: v === 'true' })}
            />
          </div>
        </div>
      );

    case 'member_group':
      return <MemberGroupSelectForm formData={formData} onFormChange={onFormChange} />;

    case 'referral_code':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label required>추천인 코드</Label>
            <div className="flex gap-2">
              <Input
                placeholder="코드 입력 (영문 대문자 + 숫자)"
                value={newReferralCode}
                onChange={(e) => setNewReferralCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddReferralCode();
                  }
                }}
                className="font-mono"
              />
              <Button variant="outline" onClick={handleAddReferralCode}>
                추가
              </Button>
            </div>
            {formData.referralCodes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.referralCodes.map((code) => (
                  <span
                    key={code}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-mono"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => handleRemoveReferralCode(code)}
                      className="hover:text-critical transition-colors"
                    >
                      <CloseOutlined style={{ fontSize: 10 }} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>사용 제한</Label>
            <ToggleButtonGroup
              options={[
                { value: 'true', label: '코드당 1회 사용' },
                { value: 'false', label: '다회 사용' },
              ]}
              value={String(formData.referralCodeSingleUse)}
              onChange={(v) => onFormChange({ referralCodeSingleUse: v === 'true' })}
            />
          </div>
        </div>
      );

    case 'manual_upload':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label required>회원 리스트 업로드</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <UploadOutlined style={{ fontSize: 32 }} className="text-txt-muted mb-2" />
              <p className="text-sm text-txt-muted mb-3">
                CSV 파일로 회원 ID 목록을 업로드하세요 (최대 5MB)
              </p>
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="pointer-events-none">
                  파일 선택
                </Button>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="sr-only"
                />
              </label>
            </div>
            {formData.uploadFileName && (
              <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                <CheckOutlined className="text-success" />
                <div>
                  <p className="text-sm font-medium text-txt-main">{formData.uploadFileName}</p>
                  <p className="text-xs text-txt-muted">{formData.uploadMemberIds.length}명 로드됨</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg">
            <InfoCircleOutlined className="text-info mt-0.5" />
            <div className="text-sm text-txt-secondary">
              <p>파일 형식: 첫 번째 열에 회원 ID를 포함하는 CSV 파일</p>
              <p className="mt-1">예시: member_id, name 형태의 헤더 포함</p>
            </div>
          </div>
        </div>
      );

    case 'promo_code': {
      const handleGeneratePromoCodes = () => {
        try {
          const codes = generatePromoCodes(
            formData.promoCodePrefix,
            formData.promoCodeLength,
            formData.promoCodeQuantity,
          );
          onFormChange({ promoCodes: codes, promoCodeUploadFileName: null });
          toast.success(`${codes.length.toLocaleString()}개의 프로모션 코드가 생성되었습니다.`);
        } catch (error) {
          toast.error(error instanceof Error ? error.message : '코드 생성에 실패했습니다.');
        }
      };

      const handlePromoCodeFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_CSV_FILE_SIZE) {
          toast.error('파일 크기는 5MB 이하만 허용됩니다.');
          e.target.value = '';
          return;
        }

        const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
        const isCsv = file.name.endsWith('.csv');

        if (!isExcel && !isCsv) {
          toast.error('CSV 또는 Excel 파일만 업로드 가능합니다.');
          e.target.value = '';
          return;
        }

        const processUploadedCodes = (rawCodes: string[], fileName: string) => {
          if (rawCodes.length === 0) {
            toast.error('유효한 코드가 없습니다.');
            return;
          }
          if (rawCodes.length > MAX_PROMO_CODE_QUANTITY) {
            toast.error(`코드 수는 최대 ${MAX_PROMO_CODE_QUANTITY.toLocaleString()}개까지 허용됩니다.`);
            return;
          }
          const promoCodes = parseUploadedCodes(rawCodes);
          onFormChange({ promoCodes, promoCodeUploadFileName: fileName });
          toast.success(`${promoCodes.length.toLocaleString()}개의 프로모션 코드가 로드되었습니다.`);
        };

        const reader = new FileReader();
        reader.onload = (event) => {
          const text = typeof event.target?.result === 'string' ? event.target.result : '';
          const lines = text.split('\n').filter((line) => line.trim());
          const rawCodes = lines
            .slice(1)
            .map((line) => line.split(',')[0]?.trim().replace(/[<>"'&]/g, ''))
            .filter((code): code is string => !!code && code.length <= 50);
          processUploadedCodes(rawCodes, file.name);
        };
        reader.readAsText(file);
        e.target.value = '';
      };

      return (
        <div className="space-y-4">
          {/* 코드 생성 방식 선택 */}
          <div className="space-y-2">
            <Label required>코드 생성 방식</Label>
            <ToggleButtonGroup
              options={[
                { value: 'random' as PromoCodeGenerationMethod, label: '임의 생성' },
                { value: 'upload' as PromoCodeGenerationMethod, label: '파일 업로드' },
              ]}
              value={formData.promoCodeMethod}
              onChange={(v) => onFormChange({ promoCodeMethod: v as PromoCodeGenerationMethod })}
            />
          </div>

          {/* 임의 생성 모드 */}
          {formData.promoCodeMethod === 'random' && (
            <div className="space-y-4 p-4 bg-bg-hover rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>코드 접두사</Label>
                  <Input
                    placeholder="PROMO"
                    value={formData.promoCodePrefix}
                    onChange={(e) => onFormChange({ promoCodePrefix: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                    className="font-mono"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label>코드 길이</Label>
                  <Input
                    type="number"
                    value={formData.promoCodeLength}
                    onChange={(e) => onFormChange({ promoCodeLength: Number(e.target.value) })}
                    min={4}
                    max={20}
                  />
                  <p className="text-xs text-txt-muted">랜덤 부분 (4~20자)</p>
                </div>
                <div className="space-y-2">
                  <Label>생성 수량</Label>
                  <Input
                    type="number"
                    value={formData.promoCodeQuantity}
                    onChange={(e) => onFormChange({ promoCodeQuantity: Number(e.target.value) })}
                    min={1}
                    max={100000}
                  />
                </div>
              </div>
              <p className="text-xs text-txt-muted font-mono">
                미리보기: {formData.promoCodePrefix || 'PROMO'}{formData.promoCodePrefix ? '-' : ''}{'X'.repeat(Math.min(formData.promoCodeLength, 12))}
              </p>
              <Button variant="outline" onClick={handleGeneratePromoCodes}>
                코드 생성 ({formData.promoCodeQuantity.toLocaleString()}개)
              </Button>
            </div>
          )}

          {/* 파일 업로드 모드 */}
          {formData.promoCodeMethod === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <UploadOutlined style={{ fontSize: 32 }} className="text-txt-muted mb-2" />
                <p className="text-sm text-txt-muted mb-3">
                  CSV 또는 Excel 파일로 코드 목록을 업로드하세요 (최대 5MB)
                </p>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" className="pointer-events-none">
                    파일 선택
                  </Button>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handlePromoCodeFileUpload}
                    className="sr-only"
                  />
                </label>
              </div>
              <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg">
                <InfoCircleOutlined className="text-info mt-0.5" />
                <p className="text-sm text-txt-secondary">
                  파일 형식: 첫 번째 열에 코드를 포함하는 CSV/Excel 파일 (첫 행은 헤더)
                </p>
              </div>
            </div>
          )}

          {/* 생성된 코드 목록 요약 */}
          {formData.promoCodes.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckOutlined className="text-success" />
                <span className="text-sm font-medium text-txt-main">
                  {formData.promoCodes.length.toLocaleString()}개 코드 {formData.promoCodeMethod === 'random' ? '생성' : '로드'}됨
                </span>
                {formData.promoCodeUploadFileName && (
                  <span className="text-xs text-txt-muted">({formData.promoCodeUploadFileName})</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => downloadPromoCodesCsv(formData.promoCodes)}>
                  <DownloadOutlined style={{ fontSize: 12, marginRight: 4 }} />
                  CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => onFormChange({ promoCodes: [], promoCodeUploadFileName: null })}>
                  초기화
                </Button>
              </div>
            </div>
          )}

          {/* 코드 사용 조건 */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-txt-main">코드 사용 조건</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>코드당 최대 사용</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.promoCodeMaxUsesPerCode}
                    onChange={(e) => onFormChange({ promoCodeMaxUsesPerCode: Number(e.target.value) })}
                    min={1}
                    max={100000}
                    className="pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">회</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>회원당 최대 사용</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.promoCodeMaxUsesPerMember}
                    onChange={(e) => onFormChange({ promoCodeMaxUsesPerMember: Number(e.target.value) })}
                    min={1}
                    max={100}
                    className="pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">회</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label>코드 유효기간</Label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="캠페인 기간"
                    value={formData.promoCodeValidityDays ?? ''}
                    onChange={(e) => onFormChange({
                      promoCodeValidityDays: e.target.value ? Number(e.target.value) : null,
                    })}
                    min={1}
                    max={3650}
                    className="pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">일</span>
                </div>
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="flex items-start gap-2 p-3 bg-info/10 rounded-lg">
            <InfoCircleOutlined className="text-info mt-0.5" />
            <div className="text-sm text-txt-secondary">
              <p>코드가 매칭(사용)되면 위의 &apos;혜택 설정&apos;에서 설정한 쿠폰 또는 포인트가 자동 지급됩니다.</p>
              <p className="mt-1">코드는 영문 대문자 + 숫자 조합이며, 혼동 가능 문자(0/O, 1/I/L)는 제외됩니다.</p>
            </div>
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

// =============================================================
// 회원그룹 발급 대상 선택 컴포넌트
// =============================================================

interface MemberGroupSelectFormProps {
  formData: BenefitCampaignFormData;
  onFormChange: (updates: Partial<BenefitCampaignFormData>) => void;
}

function MemberGroupSelectForm({ formData, onFormChange }: MemberGroupSelectFormProps) {
  const { groups = [], isLoading: groupsLoading } = useMemberGroups({ limit: 100 });

  const handleToggleGroup = (groupId: string) => {
    const current = formData.manualIssueGroupIds;
    const next = current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId];
    onFormChange({ manualIssueGroupIds: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 bg-primary/10 rounded-lg">
        <InfoCircleOutlined className="text-primary mt-0.5" />
        <p className="text-sm text-txt-secondary">
          발급할 회원 그룹을 선택하면 해당 그룹의 전체 회원에게 즉시 혜택을 일괄 발급합니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label required>발급 대상 그룹</Label>
        {groupsLoading ? (
          <p className="text-sm text-txt-muted p-4 text-center">그룹 목록 로딩 중...</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-txt-muted p-4 text-center">
            등록된 그룹이 없습니다. 회원관리 &gt; 그룹 관리에서 그룹을 먼저 생성해주세요.
          </p>
        ) : (
          <div className="border border-border rounded-lg divide-y divide-border max-h-72 overflow-y-auto">
            {groups.map((group) => {
              const isSelected = formData.manualIssueGroupIds.includes(group.id);
              return (
                <label
                  key={group.id}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-bg-hover'}`}
                >
                  <div
                    className={`flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-border-strong'}`}
                    onClick={() => handleToggleGroup(group.id)}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0" onClick={() => handleToggleGroup(group.id)}>
                    <p className="text-sm font-medium text-txt-main">{group.name}</p>
                    {group.description && (
                      <p className="text-xs text-txt-muted truncate">{group.description}</p>
                    )}
                  </div>
                  <span className="text-sm text-txt-muted flex-shrink-0">
                    {(group.memberCount ?? 0).toLocaleString()}명
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {formData.manualIssueGroupIds.length > 0 && (
        <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
          <CheckOutlined className="text-success" />
          <span className="text-sm text-txt-main">
            <strong>{formData.manualIssueGroupIds.length}개 그룹</strong> 회원 전체에게 발급
          </span>
        </div>
      )}
    </div>
  );
}
