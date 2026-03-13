import { useState, useEffect } from 'react';
import {
    Modal,
    Button,
} from '@/components/ui';
import { useCategories } from '@/hooks/useCategories';
import type { CategoryProductOrder } from '@/types/category';
import { MenuOutlined } from '@ant-design/icons';

interface CategoryProductOrderManagerProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string;
    categoryName: string;
}

export function CategoryProductOrderManager({ isOpen, onClose, categoryId, categoryName }: CategoryProductOrderManagerProps) {
    const { getCategoryProducts, updateCategoryProductOrders, loading } = useCategories();
    const [orders, setOrders] = useState<CategoryProductOrder[]>([]);
    
    useEffect(() => {
        if (isOpen && categoryId) {
            loadProducts();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, categoryId]);

    const loadProducts = async () => {
        const data = await getCategoryProducts(categoryId);
        setOrders(data);
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const result = [...orders];
        const temp = result[index - 1]!;
        result[index - 1] = result[index]!;
        result[index] = temp;
        setOrders(result.map((m, idx) => ({ ...m, sortOrder: idx + 1 })));
    };

    const moveDown = (index: number) => {
        if (index === orders.length - 1) return;
        const result = [...orders];
        const temp = result[index + 1]!;
        result[index + 1] = result[index]!;
        result[index] = temp;
        setOrders(result.map((m, idx) => ({ ...m, sortOrder: idx + 1 })));
    };

    const handleSave = async () => {
        const success = await updateCategoryProductOrders(categoryId, orders);
        if (success) {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`[${categoryName}] 상품 순서 설정`} size="md">
            <div className="text-sm text-txt-muted mb-4">
                해당 카테고리에 속한 상품의 노출 순서를 변경할 수 있습니다. 위로 이동할수록 사용자 앱에서 먼저 보여집니다.
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px] mb-4">
                {orders.length === 0 ? (
                    <div className="text-center text-txt-muted text-sm py-8 border border-dashed border-border rounded-lg">
                        이 카테고리에 속한 상품이 없습니다.
                    </div>
                ) : (
                    orders.map((menu, index) => {
                        return (
                            <div key={menu.productId} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-bg-card">
                                <div className="text-txt-muted">
                                    <MenuOutlined />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">
                                        {menu.productName || menu.productId}
                                    </p>
                                    <p className="text-xs text-txt-muted">
                                        우선순위: {menu.sortOrder}
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => moveUp(index)}
                                        disabled={index === 0}
                                        className="px-2 py-1 rounded border border-border bg-bg-hover text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        ▲
                                    </button>
                                    <button
                                        onClick={() => moveDown(index)}
                                        disabled={index === orders.length - 1}
                                        className="px-2 py-1 rounded border border-border bg-bg-hover text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        ▼
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-border">
                <Button variant="outline" onClick={onClose} disabled={loading}>
                    취소
                </Button>
                <Button variant="primary" onClick={handleSave} disabled={loading}>
                    저장
                </Button>
            </div>
        </Modal>
    );
}
