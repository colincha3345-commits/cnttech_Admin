import { useState, useCallback, useEffect } from 'react';
import { categoryService } from '@/services/categoryService';
import type { Category, CategoryFormData, CategoryProductOrder } from '@/types/category';
import { useToast } from '@/hooks/useToast';

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            toast.error('카테고리 목록을 불러오는데 실패했습니다.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const createCategory = async (data: CategoryFormData): Promise<Category | null> => {
        setLoading(true);
        try {
            const newCategory = await categoryService.createCategory(data);
            await fetchCategories();
            toast.success('카테고리가 등록되었습니다.');
            return newCategory;
        } catch (error) {
            toast.error('카테고리 등록에 실패했습니다.');
            console.error(error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateCategory = async (id: string, data: CategoryFormData): Promise<Category | null> => {
        setLoading(true);
        try {
            const updatedCategory = await categoryService.updateCategory(id, data);
            await fetchCategories();
            toast.success('카테고리가 수정되었습니다.');
            return updatedCategory;
        } catch (error) {
            toast.error('카테고리 수정에 실패했습니다.');
            console.error(error);
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteCategory = async (id: string, name: string): Promise<boolean> => {
        setLoading(true);
        try {
            await categoryService.deleteCategory(id);
            await fetchCategories();
            toast.success(`"${name}" 카테고리가 삭제되었습니다.`);
            return true;
        } catch (error: any) {
            toast.error(error.message || '카테고리 삭제에 실패했습니다.');
            console.error(error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const getCategoryProducts = async (categoryId: string): Promise<CategoryProductOrder[]> => {
        setLoading(true);
        try {
            return await categoryService.getCategoryProducts(categoryId);
        } catch (error) {
            toast.error('카테고리 상품 순서를 불러오는데 실패했습니다.');
            return [];
        } finally {
            setLoading(false);
        }
    };

    const updateCategoryProductOrders = async (categoryId: string, orders: CategoryProductOrder[]): Promise<boolean> => {
        setLoading(true);
        try {
            await categoryService.updateCategoryProductOrders(categoryId, orders);
            toast.success('상품 순서가 저장되었습니다.');
            return true;
        } catch (error) {
            toast.error('상품 순서 저장에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        categories,
        loading,
        createCategory,
        updateCategory,
        deleteCategory,
        getCategoryProducts,
        updateCategoryProductOrders,
        refetch: fetchCategories,
    };
}
