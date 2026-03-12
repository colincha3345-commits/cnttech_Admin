import { mockOptionCategories } from '@/lib/api/mockOptionCategoryData';
import type { OptionCategory, OptionCategoryFormData } from '@/types/product';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface OptionCategoryListParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface OptionCategoryStats {
  total: number;
  visible: number;
  hidden: number;
}

class OptionCategoryService {
  private categories: OptionCategory[] = [...mockOptionCategories];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getOptionCategories(params?: OptionCategoryListParams): Promise<{ data: OptionCategory[]; pagination: Pagination }> {
    await this.delay();
    const { keyword = '', page = 1, limit = 50 } = params || {};
    let result = [...this.categories];
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(lower) || c.posCode.toLowerCase().includes(lower));
    }
    result.sort((a, b) => a.displayOrder - b.displayOrder);
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getOptionCategoryById(id: string): Promise<{ data: OptionCategory }> {
    await this.delay();
    const category = this.categories.find((c) => c.id === id);
    if (!category) throw new Error('옵션을 찾을 수 없습니다.');
    return { data: category };
  }

  async createOptionCategory(formData: OptionCategoryFormData): Promise<{ data: OptionCategory }> {
    await this.delay();
    const newCategory: OptionCategory = {
      id: `opt-${Date.now()}`,
      name: formData.name,
      posCode: formData.posCode,
      price: formData.price,
      minQuantity: formData.minQuantity,
      maxQuantity: formData.maxQuantity,
      imageUrl: formData.imageUrl || '',
      isVisible: formData.isVisible,
      displayOrder: formData.displayOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories = [...this.categories, newCategory];
    return { data: newCategory };
  }

  async updateOptionCategory(id: string, formData: OptionCategoryFormData): Promise<{ data: OptionCategory }> {
    await this.delay();
    let updated: OptionCategory | null = null;
    this.categories = this.categories.map((c) => {
      if (c.id === id) {
        updated = {
          ...c,
          name: formData.name,
          posCode: formData.posCode,
          price: formData.price,
          minQuantity: formData.minQuantity,
          maxQuantity: formData.maxQuantity,
          imageUrl: formData.imageUrl || c.imageUrl,
          isVisible: formData.isVisible,
          displayOrder: formData.displayOrder,
          updatedAt: new Date(),
        };
        return updated;
      }
      return c;
    });
    if (!updated) throw new Error('옵션을 찾을 수 없습니다.');
    return { data: updated };
  }

  async deleteOptionCategory(id: string): Promise<void> {
    await this.delay();
    this.categories = this.categories.filter((c) => c.id !== id);
  }

  async checkPosCodeDuplicate(posCode: string, excludeId?: string): Promise<{ data: { isDuplicate: boolean } }> {
    await this.delay(100);
    const isDuplicate = this.categories.some((c) => c.posCode === posCode && c.id !== excludeId);
    return { data: { isDuplicate } };
  }

  async getStats(): Promise<{ data: OptionCategoryStats }> {
    await this.delay(100);
    return {
      data: {
        total: this.categories.length,
        visible: this.categories.filter((c) => c.isVisible).length,
        hidden: this.categories.filter((c) => !c.isVisible).length,
      },
    };
  }
}

export const optionCategoryService = new OptionCategoryService();
