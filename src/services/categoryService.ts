import type { Category, CategoryFormData, CategoryProductOrder } from '@/types/category';
import { productService } from './productService';

// 샘플 데이터
const mockCategories: Category[] = [
    {
        id: '1',
        name: '한마리',
        order: 1,
        isVisible: true,
        description: '치킨 한마리 메뉴',
        depth: 1,
        children: [
            { id: '1-1', name: '뿌링클', order: 1, isVisible: true, description: 'BHC 대표 메뉴', parentId: '1', depth: 2 },
            { id: '1-2', name: '맛초킹', order: 2, isVisible: true, description: '매콤한 치킨', parentId: '1', depth: 2 },
        ],
    },
    {
        id: '2',
        name: '콤보',
        order: 2,
        isVisible: true,
        description: '콤보 메뉴들',
        depth: 1,
    },
];

const mockCategoryProductOrders: Record<string, CategoryProductOrder[]> = {
    '1-1': [
        { productId: 'prod-1', sortOrder: 1 }
    ]
};

class CategoryService {
    private categories: Category[] = [...mockCategories];
    private orders: Record<string, CategoryProductOrder[]> = { ...mockCategoryProductOrders };

    // 전체 카테고리 트리 조회
    async getCategories(): Promise<Category[]> {
        await this.delay();
        return [...this.categories];
    }

    // 1depth 카테고리 목록 조회
    async getMainCategories(): Promise<Category[]> {
        await this.delay();
        return this.categories.filter((c) => c.depth === 1);
    }

    // 카테고리 생성
    async createCategory(data: CategoryFormData): Promise<Category> {
        await this.delay();

        const newCategory: Category = {
            id: `new-${Date.now()}`,
            name: data.name,
            order: data.order,
            description: data.description,
            isVisible: data.isVisible,
            depth: data.depth,
            parentId: data.parentId || undefined,
        };

        if (data.depth === 1) {
            this.categories.push(newCategory);
        } else {
            const parent = this.categories.find((c) => c.id === data.parentId);
            if (parent) {
                if (!parent.children) parent.children = [];
                parent.children.push(newCategory);
            } else {
                throw new Error('부모 카테고리를 찾을 수 없습니다.');
            }
        }

        return newCategory;
    }

    // 카테고리 수정
    async updateCategory(id: string, data: CategoryFormData): Promise<Category> {
        await this.delay();

        // 재귀적으로 카테고리 수정
        const updateInTree = (cats: Category[]): boolean => {
            for (let i = 0; i < cats.length; i++) {
                const cat = cats[i];
                if (!cat) continue;

                if (cat.id === id) {
                    cats[i] = { ...cat, ...data };
                    return true;
                }

                if (cat.children && cat.children.length > 0) {
                    if (updateInTree(cat.children)) {
                        return true;
                    }
                }
            }
            return false;
        };

        const isUpdated = updateInTree(this.categories);
        if (!isUpdated) {
            throw new Error('카테고리를 찾을 수 없습니다.');
        }

        // 변경된 항목을 반환하기 위해 다시 찾음
        let updatedCategory: Category | undefined;
        const findInTree = (cats: Category[]): Category | undefined => {
            for (const cat of cats) {
                if (cat.id === id) return cat;
                if (cat.children) {
                    const found = findInTree(cat.children);
                    if (found) return found;
                }
            }
            return undefined;
        };

        updatedCategory = findInTree(this.categories);
        return updatedCategory!;
    }

    // 카테고리 삭제
    async deleteCategory(id: string): Promise<void> {
        await this.delay();

        const deleteFromTree = (cats: Category[]): boolean => {
            for (let i = 0; i < cats.length; i++) {
                const cat = cats[i];
                if (!cat) continue;

                if (cat.id === id) {
                    if (cat.children && cat.children.length > 0) {
                        throw new Error('하위 카테고리가 있는 카테고리는 삭제할 수 없습니다.');
                    }
                    cats.splice(i, 1);
                    return true;
                }

                if (cat.children && cat.children.length > 0) {
                    if (deleteFromTree(cat.children)) {
                        return true;
                    }
                }
            }
            return false;
        };

        const isDeleted = deleteFromTree(this.categories);
        if (!isDeleted) {
            throw new Error('카테고리를 찾을 수 없습니다.');
        }
    }

    // 카테고리별 상품 노출 순서 조회
    async getCategoryProducts(categoryId: string): Promise<CategoryProductOrder[]> {
        await this.delay();
        
        // 1. 해당 카테고리에 속한 모든 상품을 가져옴
        const res = await productService.getProducts({ categoryId, limit: 1000 });
        const products = res.data;

        // 2. 현재 저장된 순서 매핑
        const savedOrders = this.orders[categoryId] || [];
        const savedMap = new Map(savedOrders.map(o => [o.productId, o.sortOrder]));

        // 3. 상품 목록과 합침 (저장된 순서가 없는 상품은 뒤로 밀어냄)
        const combined = products.map((p, idx) => ({
            productId: p.id,
            productName: p.name,
            sortOrder: savedMap.get(p.id) ?? 9999 + idx
        }));

        // 4. 순서대로 정렬
        return combined.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    // 카테고리별 상품 노출 순서 업데이트
    async updateCategoryProductOrders(categoryId: string, productOrders: CategoryProductOrder[]): Promise<void> {
        await this.delay();
        this.orders[categoryId] = [...productOrders];
    }

    // Delay 시뮬레이션
    private delay(ms: number = 300): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const categoryService = new CategoryService();
