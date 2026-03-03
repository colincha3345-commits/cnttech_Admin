/**
 * 회원 데이터 추출 관련 Hook
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appMemberService } from '@/services/appMemberService';
import { campaignService } from '@/services/campaignService';
import { memberExportService } from '@/services/memberExportService';
import type { MemberSegmentFilter } from '@/types/member-segment';
import type { CampaignStatus } from '@/types/campaign';
import type { MemberExportRequest, ExportColumn } from '@/types/export';
import type { Member } from '@/types/member';

/**
 * 세그먼트 필터링으로 회원 조회
 */
export function useMemberSegment(
  filter: MemberSegmentFilter,
  page: number = 1,
  limit: number = 10,
  options?: { enabled?: boolean }
) {
  const hasFilter = Object.keys(filter).length > 0;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['member-segment', filter, page, limit],
    queryFn: () => appMemberService.getMembersBySegment(filter, page, limit),
    enabled: options?.enabled !== false && hasFilter,
  });

  return {
    members: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
    refetch,
  };
}

/**
 * 세그먼트 필터링 결과 미리보기 (카운트만)
 */
export function useMemberSegmentPreview(filter: MemberSegmentFilter) {
  const hasFilter = Object.keys(filter).length > 0;

  const { data, isLoading, error } = useQuery({
    queryKey: ['member-segment-preview', filter],
    queryFn: () => appMemberService.getMembersBySegment(filter, 1, 1),
    enabled: hasFilter,
  });

  return {
    totalCount: data?.totalCount || 0,
    isLoading,
    error,
  };
}

/**
 * 캠페인 목록 조회 (필터 드롭다운용)
 */
export function useCampaigns(status?: CampaignStatus) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['campaigns', status],
    queryFn: () => campaignService.getCampaigns(status),
  });

  return {
    campaigns: data || [],
    isLoading,
    error,
  };
}

/**
 * 캠페인 요약 목록 (드롭다운용)
 */
export function useCampaignSummaries(status?: CampaignStatus) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['campaign-summaries', status],
    queryFn: () => campaignService.getCampaignSummaries(status),
  });

  return {
    campaigns: data || [],
    isLoading,
    error,
  };
}

/**
 * 회원 데이터 내보내기 mutation
 */
export function useMemberExport() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (request: MemberExportRequest) =>
      memberExportService.exportMembers(request),
    onSuccess: () => {
      // 내보내기 성공 후 필요한 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['member-export-history'] });
    },
  });

  return {
    exportMembers: mutation.mutate,
    exportMembersAsync: mutation.mutateAsync,
    isExporting: mutation.isPending,
    error: mutation.error,
    result: mutation.data,
  };
}

/**
 * 직접 엑셀/CSV 다운로드 (mutation 없이)
 */
export function useDirectExport() {
  const exportToExcel = async (
    members: Member[],
    columns?: ExportColumn[],
    filename?: string
  ) => {
    await memberExportService.exportToExcel(members, columns, filename);
  };

  const exportToCsv = async (
    members: Member[],
    columns?: ExportColumn[],
    filename?: string
  ) => {
    await memberExportService.exportToCsv(members, columns, filename);
  };

  return {
    exportToExcel,
    exportToCsv,
  };
}
