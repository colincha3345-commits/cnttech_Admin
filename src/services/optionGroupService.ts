import { mockOptionGroups, mockOptionProducts } from '@/lib/api/mockOptionGroupData';
import { mockOptionCategories } from '@/lib/api/mockOptionCategoryData';
import type { OptionGroup, OptionGroupFormData, OptionCategory } from '@/types/product';

interface Pagination { page: number; limit: number; total: number; totalPages: number; }

export interface OptionGroupListParams {
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface OptionGroupStats {
  total: number;
  visible: number;
  required: number;
}

export interface OptionProduct {
  id: string;
  name: string;
  price: number;
  posCode: string;
  imageUrl: string;
}

class OptionGroupService {
  private groups: OptionGroup[] = [...mockOptionGroups];

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getOptionGroups(params?: OptionGroupListParams): Promise<{ data: OptionGroup[]; pagination: Pagination }> {
    await this.delay();
    const { keyword = '', page = 1, limit = 50 } = params || {};
    let result = [...this.groups];
    if (keyword) {
      const lower = keyword.toLowerCase();
      result = result.filter((g) => g.name.toLowerCase().includes(lower));
    }
    result.sort((a, b) => a.displayOrder - b.displayOrder);
    const total = result.length;
    const startIndex = (page - 1) * limit;
    return { data: result.slice(startIndex, startIndex + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getOptionGroupById(id: string): Promise<{ data: OptionGroup }> {
    await this.delay();
    const group = this.groups.find((g) => g.id === id);
    if (!group) throw new Error('옵션 그룹을 찾을 수 없습니다.');
    return { data: group };
  }

  async createOptionGroup(formData: OptionGroupFormData): Promise<{ data: OptionGroup }> {
    await this.delay();
    const newGroup: OptionGroup = {
      id: `grp-${Date.now()}`,
      name: formData.name,
      selectionType: formData.selectionType,
      isRequired: formData.isRequired,
      minSelection: formData.minSelection,
      maxSelection: formData.maxSelection,
      displayOrder: formData.displayOrder,
      isVisible: formData.isVisible,
      items: formData.items,
      optionIds: formData.optionIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.groups = [...this.groups, newGroup];
    return { data: newGroup };
  }

  async updateOptionGroup(id: string, formData: OptionGroupFormData): Promise<{ data: OptionGroup }> {
    await this.delay();
    let updated: OptionGroup | null = null;
    this.groups = this.groups.map((g) => {
      if (g.id === id) {
        updated = {
          ...g,
          name: formData.name,
          selectionType: formData.selectionType,
          isRequired: formData.isRequired,
          minSelection: formData.minSelection,
          maxSelection: formData.maxSelection,
          displayOrder: formData.displayOrder,
          isVisible: formData.isVisible,
          items: formData.items,
          optionIds: formData.optionIds,
          updatedAt: new Date(),
        };
        return updated;
      }
      return g;
    });
    if (!updated) throw new Error('옵션 그룹을 찾을 수 없습니다.');
    return { data: updated };
  }

  async deleteOptionGroup(id: string): Promise<void> {
    await this.delay();
    this.groups = this.groups.filter((g) => g.id !== id);
  }

  async duplicateOptionGroup(id: string): Promise<{ data: OptionGroup }> {
    await this.delay();
    const original = this.groups.find((g) => g.id === id);
    if (!original) throw new Error('옵션 그룹을 찾을 수 없습니다.');
    const duplicate: OptionGroup = {
      ...original,
      id: `grp-${Date.now()}`,
      name: `${original.name} (복사본)`,
      items: original.items.map((item) => ({ ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` })),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.groups = [...this.groups, duplicate];
    return { data: duplicate };
  }

  /** 옵션 그룹에 추가 가능한 옵션 카테고리 목록 */
  async getAvailableOptions(): Promise<{ data: OptionCategory[] }> {
    await this.delay(100);
    return { data: [...mockOptionCategories] };
  }

  /** 옵션 그룹에 추가 가능한 상품 목록 */
  async getAvailableProducts(): Promise<{ data: OptionProduct[] }> {
    await this.delay(100);
    return { data: [...mockOptionProducts] };
  }

  async getStats(): Promise<{ data: OptionGroupStats }> {
    await this.delay(100);
    return {
      data: {
        total: this.groups.length,
        visible: this.groups.filter((g) => g.isVisible).length,
        required: this.groups.filter((g) => g.isRequired).length,
      },
    };
  }
}

export const optionGroupService = new OptionGroupService();
