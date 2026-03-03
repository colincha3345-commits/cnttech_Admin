/**
 * 캠페인 서비스
 */
import {
  mockCampaigns,
  mockCampaignParticipations,
  getCampaignParticipantIds,
  getMemberCampaignIds,
} from '@/lib/api/mockCampaignData';
import type {
  Campaign,
  CampaignParticipation,
  CampaignStatus,
  CampaignSummary,
} from '@/types/campaign';

class CampaignService {
  private campaigns: Campaign[] = [...mockCampaigns];
  private participations: CampaignParticipation[] = [...mockCampaignParticipations];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================
  // 캠페인 조회
  // ============================================

  /**
   * 캠페인 목록 조회 (세그먼트 필터용)
   */
  async getCampaigns(status?: CampaignStatus): Promise<Campaign[]> {
    await this.delay();

    let result = [...this.campaigns];

    if (status) {
      result = result.filter((c) => c.status === status);
    }

    // 최신순 정렬
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return result;
  }

  /**
   * 캠페인 요약 목록 (드롭다운용)
   */
  async getCampaignSummaries(status?: CampaignStatus): Promise<CampaignSummary[]> {
    await this.delay();

    let result = [...this.campaigns];

    if (status) {
      result = result.filter((c) => c.status === status);
    }

    return result.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      participantCount: c.participantCount,
    }));
  }

  /**
   * 캠페인 상세 조회
   */
  async getCampaign(id: string): Promise<Campaign | null> {
    await this.delay();
    return this.campaigns.find((c) => c.id === id) || null;
  }

  // ============================================
  // 캠페인 참여자 조회
  // ============================================

  /**
   * 캠페인 참여자 ID 목록 조회
   */
  async getCampaignParticipants(campaignId: string): Promise<string[]> {
    await this.delay();
    return getCampaignParticipantIds(campaignId);
  }

  /**
   * 여러 캠페인 참여자 ID 목록 조회 (Union)
   */
  async getCampaignsParticipants(campaignIds: string[]): Promise<string[]> {
    await this.delay();
    const memberIds = new Set<string>();
    campaignIds.forEach((campaignId) => {
      getCampaignParticipantIds(campaignId).forEach((id) => memberIds.add(id));
    });
    return Array.from(memberIds);
  }

  /**
   * 회원별 참여 캠페인 조회
   */
  async getMemberParticipations(memberId: string): Promise<CampaignParticipation[]> {
    await this.delay();
    return this.participations.filter((p) => p.memberId === memberId);
  }

  /**
   * 회원이 참여한 캠페인 ID 목록 조회
   */
  getMemberCampaignIds(memberId: string): string[] {
    return getMemberCampaignIds(memberId);
  }

  /**
   * 특정 캠페인에 참여한 회원인지 확인
   */
  hasMemberParticipated(memberId: string, campaignIds: string[]): boolean {
    const memberCampaignIds = getMemberCampaignIds(memberId);
    return campaignIds.some((cId) => memberCampaignIds.includes(cId));
  }
}

export const campaignService = new CampaignService();
