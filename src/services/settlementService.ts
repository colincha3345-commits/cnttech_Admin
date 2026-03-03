import { mockSettlements, mockSettlementDetail } from '@/lib/api/mockSettlementData';
import type { Settlement, SettlementDetailData, SettlementStatus } from '@/types/settlement';

export interface SettlementSearchFilter {
    keyword?: string;
    status?: SettlementStatus | '';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

class SettlementService {
    private settlements: Settlement[] = [...mockSettlements];

    private delay(ms = 300): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /** 정산 목록 조회 */
    async getSettlements(
        params?: SettlementSearchFilter
    ): Promise<{ data: Settlement[]; pagination: Pagination }> {
        await this.delay();
        const { keyword = '', status = '', page = 1, limit = 20 } = params || {};

        let result = [...this.settlements];

        if (status) {
            result = result.filter((s) => s.status === status);
        }

        if (keyword) {
            const lower = keyword.toLowerCase();
            result = result.filter(
                (s) =>
                    s.storeName.toLowerCase().includes(lower) ||
                    s.id.toLowerCase().includes(lower)
            );
        }

        const total = result.length;
        const startIndex = (page - 1) * limit;

        return {
            data: result.slice(startIndex, startIndex + limit),
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }

    /** 정산 상세 조회 */
    async getSettlementById(id: string): Promise<{ data: SettlementDetailData }> {
        await this.delay();
        // 실제로는 filter 등으로 id에 맞는 데이터를 찾거나 API 호출
        const detail = { ...mockSettlementDetail, id };
        return { data: detail };
    }

    /** 정산 실행 (Mock) */
    async runSettlement(): Promise<{ success: boolean; message: string }> {
        await this.delay(1000);
        return { success: true, message: '정산이 완료되었습니다.' };
    }
}

export const settlementService = new SettlementService();
