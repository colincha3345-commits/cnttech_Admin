/**
 * 메인화면 관리 페이지
 * 추천메뉴 설정 전용
 */
import { useRecommendedMenus } from '@/hooks/useDesign';
import { useProducts } from '@/hooks/useProducts';
import type { RecommendedMenu } from '@/types/design';
import type { Product } from '@/types/product';
import {
    SaveOutlined,
    MenuOutlined,
    SettingOutlined,
    StarOutlined,
    SearchOutlined,
    CloseOutlined,
    RightOutlined,
    DownOutlined,
} from '@ant-design/icons';

import {
    Card,
    CardHeader,
    CardContent,
    Button,
    Badge,
    Input,
} from '@/components/ui';
import { useState, useEffect, useMemo, useDeferredValue } from 'react';
import { useToast } from '@/hooks';

export function MainScreenManagement() {
    const { recommendedMenus, saveRecommendedMenus, loading: recLoading } = useRecommendedMenus();
    const { products } = useProducts({ autoLoad: true });
    const toast = useToast();

    // 추천메뉴 인라인 관리 상태
    const [localMenus, setLocalMenus] = useState<RecommendedMenu[]>([]);
    const [filterText, setFilterText] = useState('');
    const deferredFilter = useDeferredValue(filterText);
    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

    // id → Product (우측 목록 표시용)
    const productsMap = useMemo(() => {
        const map: Record<string, Product> = {};
        products.forEach((p) => { map[p.id] = p; });
        return map;
    }, [products]);

    // 추천메뉴 데이터 초기화
    useEffect(() => {
        setLocalMenus([...recommendedMenus]);
    }, [recommendedMenus]);

    // 카테고리별 상품 그룹핑 + 필터링
    const groupedProducts = useMemo(() => {
        const filtered = products.filter((p) =>
            !deferredFilter || p.name.toLowerCase().includes(deferredFilter.toLowerCase())
        );
        const map = new Map<string, Product[]>();
        filtered.forEach((p) => {
            const cat = p.mainCategoryName || '기타';
            if (!map.has(cat)) map.set(cat, []);
            map.get(cat)!.push(p);
        });
        return map;
    }, [products, deferredFilter]);

    // 필터 입력 시 매칭 카테고리 자동 펼침, 빈 문자열 시 일괄 닫힘
    useEffect(() => {
        if (deferredFilter) {
            setExpandedCategories(new Set(groupedProducts.keys()));
        } else {
            setExpandedCategories(new Set());
        }
    }, [deferredFilter, groupedProducts]);

    const toggleCategory = (cat: string) => {
        setExpandedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    const handleAdd = (product: Product) => {
        if (localMenus.find((m) => m.productId === product.id)) {
            toast.error('이미 추가된 메뉴입니다.');
            return;
        }
        setLocalMenus([...localMenus, { productId: product.id, sortOrder: localMenus.length + 1 }]);
    };

    const handleRemove = (productId: string) => {
        const updated = localMenus.filter((m) => m.productId !== productId);
        setLocalMenus(updated.map((m, idx) => ({ ...m, sortOrder: idx + 1 })));
    };

    const menuMoveUp = (index: number) => {
        if (index === 0) return;
        const result = [...localMenus];
        const temp = result[index - 1]!;
        result[index - 1] = result[index]!;
        result[index] = temp;
        setLocalMenus(result.map((m, idx) => ({ ...m, sortOrder: idx + 1 })));
    };

    const menuMoveDown = (index: number) => {
        if (index === localMenus.length - 1) return;
        const result = [...localMenus];
        const temp = result[index + 1]!;
        result[index + 1] = result[index]!;
        result[index] = temp;
        setLocalMenus(result.map((m, idx) => ({ ...m, sortOrder: idx + 1 })));
    };

    const handleSaveMenus = async () => {
        const success = await saveRecommendedMenus(localMenus);
        if (!success) toast.error('추천메뉴 저장에 실패했습니다.');
    };

    const addedProductIds = new Set(localMenus.map((m) => m.productId));

    return (
        <div className="space-y-6">
            {/* 추천메뉴 관리 */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-lg font-semibold text-txt-main flex items-center gap-2">
                        <StarOutlined style={{ fontSize: 18 }} />
                        추천 메뉴 관리
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-txt-muted">{localMenus.length}개 지정됨</span>
                        <Button size="sm" onClick={handleSaveMenus} disabled={recLoading}>
                            <SaveOutlined style={{ fontSize: 14, marginRight: 6 }} />
                            저장
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* 왼쪽: 카테고리별 메뉴 목록 (2/5) */}
                        <div className="md:col-span-2 flex flex-col md:border-r border-border md:pr-6">
                            <h3 className="text-sm font-bold text-txt-main mb-3 flex items-center gap-2">
                                <SearchOutlined /> 메뉴 선택
                            </h3>
                            <Input
                                className="mb-3"
                                value={filterText}
                                onChange={(e) => setFilterText(e.target.value)}
                                placeholder="메뉴명으로 필터링"
                            />

                            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-1">
                                {groupedProducts.size === 0 && (
                                    <div className="text-center text-txt-muted text-sm py-8">
                                        {filterText ? '검색 결과가 없습니다.' : '등록된 메뉴가 없습니다.'}
                                    </div>
                                )}
                                {Array.from(groupedProducts.entries()).map(([categoryName, categoryProducts]) => {
                                    const isExpanded = expandedCategories.has(categoryName);
                                    return (
                                        <div key={categoryName}>
                                            <button
                                                onClick={() => toggleCategory(categoryName)}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-hover transition-colors text-left"
                                            >
                                                {isExpanded
                                                    ? <DownOutlined style={{ fontSize: 10 }} className="text-txt-muted" />
                                                    : <RightOutlined style={{ fontSize: 10 }} className="text-txt-muted" />
                                                }
                                                <span className="text-sm font-semibold text-txt-main flex-1">{categoryName}</span>
                                                <Badge variant="secondary">{categoryProducts.length}</Badge>
                                            </button>
                                            {isExpanded && (
                                                <div className="ml-5 space-y-1 mb-2">
                                                    {categoryProducts.map((product) => {
                                                        const isAdded = addedProductIds.has(product.id);
                                                        return (
                                                            <div
                                                                key={product.id}
                                                                className={`flex items-center justify-between px-3 py-2 rounded-lg border border-border ${isAdded ? 'opacity-50 bg-bg-hover' : 'bg-bg-card'}`}
                                                            >
                                                                <span className="text-sm truncate flex-1">{product.name}</span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => handleAdd(product)}
                                                                    disabled={isAdded}
                                                                    className="shrink-0 ml-2"
                                                                >
                                                                    {isAdded ? '추가됨' : '추가'}
                                                                </Button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 오른쪽: 지정된 추천 메뉴 목록 (3/5) */}
                        <div className="md:col-span-3 flex flex-col">
                            <h3 className="text-sm font-bold text-txt-main mb-3 flex items-center gap-2">
                                <SettingOutlined /> 지정된 추천 메뉴 (순서 설정)
                            </h3>

                            <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px]">
                                {localMenus.length === 0 ? (
                                    <div className="text-center text-txt-muted text-sm py-12 border border-dashed border-border rounded-lg">
                                        왼쪽에서 메뉴를 선택하여 추천 메뉴를 추가하세요.
                                    </div>
                                ) : (
                                    localMenus.map((menu, index) => {
                                        const product = productsMap[menu.productId];
                                        return (
                                            <div key={menu.productId} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-bg-card">
                                                <span className="text-xs font-mono text-txt-muted w-5 text-center">{menu.sortOrder}</span>
                                                <div className="text-txt-muted">
                                                    <MenuOutlined />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold truncate">
                                                        {product?.name || menu.productId}
                                                    </p>
                                                    {product?.mainCategoryName && (
                                                        <p className="text-xs text-txt-muted">{product.mainCategoryName}</p>
                                                    )}
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => menuMoveUp(index)}
                                                        disabled={index === 0}
                                                        className="px-2 py-1 rounded border border-border bg-bg-hover text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                                                    >
                                                        ▲
                                                    </button>
                                                    <button
                                                        onClick={() => menuMoveDown(index)}
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
                </CardContent>
            </Card>
        </div>
    );
}
