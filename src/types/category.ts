export interface Category {
    id: string;
    name: string;
    order: number;
    isVisible: boolean;
    description: string;
    children?: Category[];
    parentId?: string;
    depth: number;
}

export interface CategoryFormData {
    name: string;
    order: number;
    description: string;
    isVisible: boolean;
    parentId?: string;
    depth: number;
}

export interface CategoryProductOrder {
    productId: string;
    productName?: string;
    sortOrder: number;
}
