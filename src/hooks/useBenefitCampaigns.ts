/**
 * 혜택 캠페인 관리 Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { benefitCampaignService, type BenefitCampaignListParams } from '@/services/benefitCampaignService';
import type { BenefitCampaignFormData, BenefitCampaignStatus } from '@/types/benefit-campaign';

export function useBenefitCampaignList(params?: BenefitCampaignListParams) {
  return useQuery({
    queryKey: ['benefit-campaigns', 'list', params],
    queryFn: () => benefitCampaignService.getCampaigns(params),
  });
}

export function useBenefitCampaign(id: string | undefined) {
  return useQuery({
    queryKey: ['benefit-campaign', id],
    queryFn: () => benefitCampaignService.getCampaignById(id!),
    enabled: !!id,
  });
}

export function useCreateBenefitCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BenefitCampaignFormData) =>
      benefitCampaignService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-campaigns'] });
    },
  });
}

export function useUpdateBenefitCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
      existingStatus,
      existingUploadedAt,
    }: {
      id: string;
      data: BenefitCampaignFormData;
      existingStatus?: BenefitCampaignStatus;
      existingUploadedAt?: string | null;
    }) => benefitCampaignService.updateCampaign(id, data, existingStatus, existingUploadedAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['benefit-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['benefit-campaign', variables.id] });
    },
  });
}

export function useDeleteBenefitCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => benefitCampaignService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-campaigns'] });
    },
  });
}

export function useDuplicateBenefitCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => benefitCampaignService.duplicateCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['benefit-campaigns'] });
    },
  });
}

export function useAvailableCoupons() {
  return useQuery({
    queryKey: ['available-coupons'],
    queryFn: () => benefitCampaignService.getAvailableCoupons(),
  });
}

export function useBenefitCampaignStats() {
  return useQuery({
    queryKey: ['benefit-campaigns', 'stats'],
    queryFn: () => benefitCampaignService.getStats(),
  });
}
