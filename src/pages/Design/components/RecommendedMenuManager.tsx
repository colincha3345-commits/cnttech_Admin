import { useState, useEffect } from 'react';
import {
    Modal,
    Input,
    Button,
    Card,
    Badge,
} from '@/components/ui';
import { useRecommendedMenus } from '@/hooks/useDesign';
import { useProducts } from '@/hooks/useProducts';
import type { RecommendedMenu } from '@/types/design';
import type { Product } from '@/types/product';
import { SearchOutlined, CloseOutlined, MenuOutlined } from '@ant-design/icons';
import { useToast } from '@/hooks';

interface RecommendedMenuManagerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RecommendedMenuManager({ isOpen, onClose }: RecommendedMenuManagerProps) {
    const { recommendedMenus, saveRecommendedMenus, loading } = useRecommendedMenus();
    const { searchProducts } = useProducts({ autoLoad: false });
    const [localMenus, setLocalMenus] = useState<RecommendedMenu[]>([]);
    const [productsCache, setProductsCache] = useState<Record<string, Product>>({});

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const toast = useToast();

    // 초기화
    useEffect(() => {
        if (isOpen) {
            setLocalMenus([...recommendedMenus]);
            // 추천 메뉴 상품명 로드 (기존 추천메뉴 ID 기반으로만 검색)
            if (recommendedMenus.length > 0) {
                const loadProductNames = async () => {
                    const products = await searchProducts('', 100);
                    const cache: Record<string, Product> = {};
                    products.forEach((p: Product) => {
                        cache[p.id] = p;
                    });
                    setProductsCache(cache);
                };
                loadProductNames();
            }

            // 검색 초기화
            setSearchQuery('');
            setSearchResults([]);
            setHasSearched(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            const products = await searchProducts(searchQuery, 10);
            setSearchResults(products);
            setHasSearched(true);

            // 캐시 업데이트
            const newCache = { ...productsCache };
            products.forEach((p: Product) => {
                newCache[p.id] = p;
            });
            setProductsCache(newCache);
        } catch {
            toast.error('메뉴 검색에 실패했습니다.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleAdd = (product: Product) => {
        if (localMenus.find(m => m.productId === product.id)) {
            toast.error('이미 추가된 메뉴입니다.');
            return;
        }

        setLocalMenus([...localMenus, { productId: product.id, sortOrder: localMenus.length + 1 }]);
    };

    const handleRemove = (productId: string) => {
        const updated = localMenus.filter(m => m.productId !== productId);
        setLocalMenus(updated.map((m, idx) => ({ ...m, sortOrder: idx + 1 })));
    };

    const moveUp = (index: number) => {
        if (index === 0) return;
        const result = [...localMenus];
        const temp = result[index - 1]!;
        result[index - 1] = result[index]!;
        result[index] = temp;
        setLocalMenus(result.map((m, idx) => ({ ...m, sortOrder: idx + 1 })));
    };

    const moveDown = (index: number) => {
        if (index === localMenus.length - 1) return;
        const result = [...localMenus];
        const temp = result[index + 1]!;
        result[index + 1] = result[index]!;
        result[index] = temp;
        setLocalMenus(result.map((m, idx) => ({ ...m, sortOrder: idx + 1 })));
    };

    const handleSave = async () => {
        const success = await saveRecommendedMenus(localMenus);
        if (success) {
            onClose();
        }
    };

    const addedProductIds = new Set(localMenus.map(m => m.productId));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="추천 메뉴 상세 관리" size="xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                {/* 왼쪽: 검색 영역 */}
                <div className="flex flex-col border-r border-border pr-6 h-full">
                    <h3 className="text-md font-bold text-txt-main mb-3">메뉴 검색 및 추가</h3>
                    <div className="flex gap-2 mb-4">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="메뉴명 검색"
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <Button variant="secondary" onClick={handleSearch} disabled={isSearching}>
                            <SearchOutlined /> 검색
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                        {!hasSearched && searchResults.length === 0 && !isSearching && (
                            <div className="text-center text-txt-muted text-sm py-8">
                                메뉴명을 입력하여 검색하세요.
                            </div>
                        )}
                        {hasSearched && searchResults.length === 0 && !isSearching && (
                            <div className="text-center text-txt-muted text-sm py-8">
                                검색 결과가 없습니다.
                            </div>
                        )}
                        {searchResults.map((product) => {
                            const isAdded = addedProductIds.has(product.id);
                            return (
                                <Card key={product.id} className={`p-3 ${isAdded ? 'opacity-50' : ''}`}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary">{product.mainCategoryName}</Badge>
                                            <span className="font-semibold text-sm">{product.name}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleAdd(product)}
                                            disabled={isAdded}
                                        >
                                            {isAdded ? '추가됨' : '추가'}
                                        </Button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* 오른쪽: 지정된 추천 메뉴 목록 */}
                <div className="flex flex-col h-full pl-2">
                    <div className="flex justify-between items-end mb-3">
                        <h3 className="text-md font-bold text-txt-main">지정된 추천 메뉴 (순서 설정)</h3>
                        <span className="text-xs text-txt-muted">{localMenus.length}개 추가됨</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        {localMenus.length === 0 ? (
                            <div className="text-center text-txt-muted text-sm py-8 border border-dashed border-border rounded-lg">
                                지정된 추천 메뉴가 없습니다.
                            </div>
                        ) : (
                            localMenus.map((menu, index) => {
                                const product = productsCache[menu.productId];
                                return (
                                    <div key={menu.productId} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-bg-card">
                                        <div className="text-txt-muted">
                                            <MenuOutlined />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {product?.name || menu.productId}
                                            </p>
                                            <p className="text-xs text-txt-muted truncate">
                                                순서: {menu.sortOrder}
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
                                                disabled={index === localMenus.length - 1}
                                                className="px-2 py-1 rounded border border-border bg-bg-hover text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                ▼
                                            </button>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemove(menu.productId)}
                                            className="text-critical p-1"
                                        >
                                            <CloseOutlined />
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border">
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
