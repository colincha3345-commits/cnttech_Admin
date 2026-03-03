/**
 * 회원 내보내기 서비스
 */
import type { Member } from '@/types/member';
import type { MemberExportRequest, ExportColumn, ExportResult } from '@/types/export';
import { DEFAULT_MEMBER_EXPORT_COLUMNS } from '@/types/export';
import { exportMembers } from '@/utils/excel';
import { appMemberService } from './appMemberService';

class MemberExportService {
  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 컬럼 키 목록으로 ExportColumn 배열 생성
   */
  private getExportColumns(columnKeys: string[]): ExportColumn[] {
    return DEFAULT_MEMBER_EXPORT_COLUMNS.map((col) => ({
      ...col,
      enabled: columnKeys.includes(col.key),
    }));
  }

  /**
   * 회원 데이터 내보내기
   */
  async exportMembers(request: MemberExportRequest): Promise<ExportResult> {
    await this.delay(100);

    let members: Member[];

    // memberIds가 있으면 해당 회원만, 아니면 필터 조건으로 조회
    if (request.memberIds && request.memberIds.length > 0) {
      // 선택된 회원만 내보내기
      const allMembers = await this.getAllMembers();
      members = allMembers.filter((m) => request.memberIds!.includes(m.id));
    } else if (request.filter) {
      // 필터 조건으로 내보내기
      const result = await appMemberService.getMembersBySegment(
        request.filter,
        1,
        10000 // 최대 10000건
      );
      members = result.data;
    } else {
      // 전체 내보내기
      members = await this.getAllMembers();
    }

    // 컬럼 설정
    const columns = this.getExportColumns(request.columns);

    // 파일명 설정
    const filename = request.filename || '회원목록';

    // 내보내기 실행
    exportMembers(members, columns, request.format, filename);

    return {
      success: true,
      filename: `${filename}_${new Date().toISOString().split('T')[0]}.${request.format}`,
      rowCount: members.length,
      exportedAt: new Date(),
    };
  }

  /**
   * 전체 회원 조회 (페이지네이션 없이)
   */
  private async getAllMembers(): Promise<Member[]> {
    const result = await appMemberService.getMembers({
      page: 1,
      limit: 10000,
    });
    return result.data;
  }

  /**
   * 엑셀 내보내기 (바로 다운로드)
   */
  async exportToExcel(
    members: Member[],
    columns?: ExportColumn[],
    filename?: string
  ): Promise<void> {
    const exportColumns = columns || DEFAULT_MEMBER_EXPORT_COLUMNS;
    exportMembers(members, exportColumns, 'xlsx', filename);
  }

  /**
   * CSV 내보내기 (바로 다운로드)
   */
  async exportToCsv(
    members: Member[],
    columns?: ExportColumn[],
    filename?: string
  ): Promise<void> {
    const exportColumns = columns || DEFAULT_MEMBER_EXPORT_COLUMNS;
    exportMembers(members, exportColumns, 'csv', filename);
  }
}

export const memberExportService = new MemberExportService();
