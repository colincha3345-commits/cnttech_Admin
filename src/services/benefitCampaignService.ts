import { mockBenefitCampaigns, mockAvailableCoupons } from '@/lib/api/mockBenefitCampaignData';
import type { BenefitCampaign, BenefitCampaignFormData, BenefitCampaignStatus } from '@/types/benefit-campaign';
import { BENEFIT_CAMPAIGN_TRIGGER_LABELS } from '@/types/benefit-campaign';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface BenefitCampaignListParams {
  status?: BenefitCampaignStatus | 'all';
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface BenefitCampaignStats {
  total: number;
  active: number;
  totalIssued: number;
  totalBeneficiaries: number;
}

class BenefitCampaignService {
  private campaigns: BenefitCampaign[] = [...mockBenefitCampaigns];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getCampaigns(params?: BenefitCampaignListParams): Promise<{ data: BenefitCampaign[]; pagination: Pagination }> {
    await this.delay();
    const { status, keyword = '', page = 1, limit = 50 } = params || {};
    let result = [...this.campaigns];
    if (status && status !== 'all') {
      result = result.filter((c) => c.status === status);
    }
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(lower));
    }
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getCampaignById(id: string): Promise<{ data: BenefitCampaign }> {
    await this.delay();
    const campaign = this.campaigns.find((c) => c.id === id);
    if (!campaign) throw new Error('캠페인을 찾을 수 없습니다.');
    return { data: campaign };
  }

  async createCampaign(formData: BenefitCampaignFormData, existingCampaignStatus?: BenefitCampaignStatus): Promise<{ data: BenefitCampaign }> {
    await this.delay();
    // 동일 트리거 중복 체크
    const hasDuplicate = this.campaigns.some((c) => c.trigger === formData.trigger);
    if (hasDuplicate) {
      throw new Error(`"${BENEFIT_CAMPAIGN_TRIGGER_LABELS[formData.trigger]}" 트리거는 이미 사용 중입니다. 기존 캠페인에서 혜택을 추가해주세요.`);
    }
    const campaignData = this.formToCampaign(formData, existingCampaignStatus);
    const newCampaign: BenefitCampaign = {
      id: `bc-${Date.now()}`,
      ...campaignData,
      totalIssuedCount: 0,
      totalBeneficiaryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
    };
    this.campaigns = [...this.campaigns, newCampaign];
    return { data: newCampaign };
  }

  async updateCampaign(id: string, formData: BenefitCampaignFormData, existingCampaignStatus?: BenefitCampaignStatus, existingUploadedAt?: string | null): Promise<{ data: BenefitCampaign }> {
    await this.delay();
    // 동일 트리거 중복 체크 (자기 자신 제외)
    const hasDuplicate = this.campaigns.some((c) => c.trigger === formData.trigger && c.id !== id);
    if (hasDuplicate) {
      throw new Error(`"${BENEFIT_CAMPAIGN_TRIGGER_LABELS[formData.trigger]}" 트리거는 이미 사용 중입니다. 기존 캠페인에서 혜택을 추가해주세요.`);
    }
    const campaignData = this.formToCampaign(formData, existingCampaignStatus, existingUploadedAt);
    let updated: BenefitCampaign | null = null;
    this.campaigns = this.campaigns.map((c) => {
      if (c.id === id) {
        updated = { ...c, ...campaignData, updatedAt: new Date() };
        return updated;
      }
      return c;
    });
    if (!updated) throw new Error('캠페인을 찾을 수 없습니다.');
    return { data: updated };
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.delay();
    this.campaigns = this.campaigns.filter((c) => c.id !== id);
  }

  async duplicateCampaign(id: string): Promise<{ data: BenefitCampaign }> {
    await this.delay();
    const original = this.campaigns.find((c) => c.id === id);
    if (!original) throw new Error('캠페인을 찾을 수 없습니다.');
    const duplicate: BenefitCampaign = {
      ...original,
      id: `bc-${Date.now()}`,
      name: `${original.name} (복사본)`,
      status: 'draft',
      totalIssuedCount: 0,
      totalBeneficiaryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.campaigns = [...this.campaigns, duplicate];
    return { data: duplicate };
  }

  async getAvailableCoupons(): Promise<{ data: { id: string; name: string }[] }> {
    await this.delay(100);
    return { data: [...mockAvailableCoupons] };
  }

  async getStats(): Promise<{ data: BenefitCampaignStats }> {
    await this.delay(100);
    return {
      data: {
        total: this.campaigns.length,
        active: this.campaigns.filter((c) => c.status === 'active').length,
        totalIssued: this.campaigns.reduce((sum, c) => sum + c.totalIssuedCount, 0),
        totalBeneficiaries: this.campaigns.reduce((sum, c) => sum + c.totalBeneficiaryCount, 0),
      },
    };
  }

  private formToCampaign(
    formData: BenefitCampaignFormData,
    existingStatus?: BenefitCampaignStatus,
    existingUploadedAt?: string | null,
  ): Omit<BenefitCampaign, 'id' | 'totalIssuedCount' | 'totalBeneficiaryCount' | 'createdAt' | 'updatedAt' | 'createdBy'> {
    return {
      name: formData.name,
      description: formData.description,
      trigger: formData.trigger,
      orderCondition: formData.trigger === 'order' ? {
        minOrderAmount: formData.orderMinAmount,
        nthOrder: formData.orderNthOrder,
        isEveryNthOrder: formData.orderIsEveryNth,
        specificProductIds: formData.orderSpecificProductIds,
      } : undefined,
      signupCondition: formData.trigger === 'signup' ? {
        delayMinutes: formData.signupDelayMinutes,
      } : undefined,
      membershipCondition: formData.trigger === 'membership_upgrade' ? {
        targetGrades: formData.membershipTargetGrades,
      } : undefined,
      birthdayCondition: formData.trigger === 'birthday' ? {
        daysBefore: formData.birthdayDaysBefore,
        daysAfter: formData.birthdayDaysAfter,
        repeatYearly: formData.birthdayRepeatYearly,
      } : undefined,
      referralCondition: formData.trigger === 'referral' ? {
        manualIssueTargetType: formData.manualIssueTargetType,
        manualIssueMemberIds: formData.manualIssueMemberIds,
        manualIssueGroupIds: formData.manualIssueGroupIds,
        manualIssueGradeIds: formData.manualIssueGradeIds,
      } : undefined,
      referralCodeCondition: formData.trigger === 'referral_code' ? {
        referralCodes: formData.referralCodes,
        singleUsePerCode: formData.referralCodeSingleUse,
      } : undefined,
      manualUploadCondition: formData.trigger === 'manual_upload' ? {
        uploadedFileName: formData.uploadFileName,
        uploadedMemberIds: formData.uploadMemberIds,
        uploadedAt: existingUploadedAt ?? new Date().toISOString(),
      } : undefined,
      promoCodeCondition: formData.trigger === 'promo_code' ? {
        generationMethod: formData.promoCodeMethod,
        codePrefix: formData.promoCodePrefix,
        codeLength: formData.promoCodeLength,
        codeQuantity: formData.promoCodeQuantity,
        promoCodes: formData.promoCodes,
        uploadedFileName: formData.promoCodeUploadFileName,
        usageCondition: {
          maxUsesPerCode: formData.promoCodeMaxUsesPerCode,
          maxUsesPerMember: formData.promoCodeMaxUsesPerMember,
          codeValidityDays: formData.promoCodeValidityDays,
        },
      } : undefined,
      benefitConfig: {
        couponBenefits: formData.couponBenefits,
        pointBenefits: formData.pointBenefits,
      },
      isAlwaysOn: formData.isAlwaysOn,
      startDate: formData.startDate,
      endDate: formData.isAlwaysOn ? null : formData.endDate,
      status: existingStatus ?? 'draft',
    };
  }
}

export const benefitCampaignService = new BenefitCampaignService();
