import { mockPointSettings, mockPointStats, mockPointHistory } from '@/lib/api/mockPointData';
import type { PointSettingsData, PointSettingsFormData, PointSystemStats, SystemPointHistory, PointHistoryFilterType } from '@/types/point';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface PointHistoryParams {
  filter?: PointHistoryFilterType;
  page?: number;
  limit?: number;
}

class PointService {
  private settings: PointSettingsData = { ...mockPointSettings };
  private history: SystemPointHistory[] = [...mockPointHistory];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getSettings(): Promise<{ data: PointSettingsData }> {
    await this.delay();
    return { data: { ...this.settings } };
  }

  async updateSettings(formData: PointSettingsFormData): Promise<{ data: PointSettingsData }> {
    await this.delay();
    this.settings = {
      ...this.settings,
      earnPolicy: {
        type: formData.earnType,
        fixedUnit: formData.fixedUnit,
        fixedPoints: formData.fixedPoints,
        percentageRate: formData.percentageRate,
        maxEarnPoints: formData.maxEarnPoints,
        minOrderAmount: formData.minOrderAmount,
      },
      usePolicy: {
        minUsePoints: formData.minUsePoints,
        maxUseRate: formData.maxUseRate,
        useUnit: formData.useUnit,
        allowNegativeBalance: true,
        headquartersRatio: formData.headquartersRatio,
        franchiseRatio: formData.franchiseRatio,
      },
      expiryPolicy: {
        defaultValidityDays: formData.defaultValidityDays,
        expiryNotificationDays: formData.expiryNotificationDays,
      },
      updatedAt: new Date(),
      updatedBy: 'admin',
    };
    return { data: { ...this.settings } };
  }

  async getStats(): Promise<{ data: PointSystemStats }> {
    await this.delay(100);
    return { data: { ...mockPointStats } };
  }

  async getHistory(params?: PointHistoryParams): Promise<{ data: SystemPointHistory[]; pagination: Pagination }> {
    await this.delay();
    const { filter = 'all', page = 1, limit = 10 } = params || {};
    let result = [...this.history];
    if (filter === 'earn') {
      result = result.filter((h) => h.type.startsWith('earn_'));
    } else if (filter === 'use') {
      result = result.filter((h) => h.type.startsWith('use_') || h.type.startsWith('withdraw_'));
    } else if (filter === 'expired') {
      result = result.filter((h) => h.type === 'expired');
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }
}

export const pointService = new PointService();
