/**
 * 메인화면 관리 페이지
 * 추천메뉴 관리 기능 중심, 나머지 섹션은 연동 예정 표시
 */
import { useMainScreens, useRecommendedMenus } from '@/hooks/useDesign';
import { useProducts } from '@/hooks/useProducts';
import type { SectionType, RecommendedMenu } from '@/types/design';
import type { Product } from '@/types/product';
import {
    SaveOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
    MenuOutlined,
    LayoutOutlined,
    SettingOutlined,
    StarOutlined,
    LockOutlined,
    SearchOutlined,
    CloseOutlined,
} from '@ant-design/icons';

import {
    Card,
    CardHeader,
    CardContent,
    Button,
    Badge,
    Input,
} from '@/components/ui';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks';

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
    banner_carousel: '배너 캐러셀',
    quick_menu: '퀵 메뉴',
    recommended: '추천 메뉴',
    new_menu: '신메뉴',
    event_list: '이벤트 목록',
    notice: '공지사항',
};

export function MainScreenManagement() {
    const { sections, loading, toggleVisibility, moveUp, moveDown, saveConfiguration } = useMainScreens();
    const { recommendedMenus, saveRecommendedMenus, loading: recLoading } = useRecommendedMenus();
    const { searchProducts } = useProducts({ autoLoad: false });
    const toast = useToast();

    // 추천메뉴 인라인 관리 상태
    const [localMenus, setLocalMenus] = useState<RecommendedMenu[]>([]);
    const [productsCache, setProductsCache] = useState<Record<string, Product>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // 추천메뉴 데이터 초기화
    useEffect(() => {
        setLocalMenus([...recommendedMenus]);
        if (recommendedMenus.length > 0) {
            const load = async () => {
                const products = await searchProducts('', 100);
                const cache: Record<string, Product> = {};
                products.forEach((p: Product) => { cache[p.id] = p; });
                setProductsCache(cache);
            };
            load();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [recommendedMenus]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) { setSearchResults([]); return; }
        setIsSearching(true);
        try {
            const products = await searchProducts(searchQuery, 10);
            setSearchResults(products);
            setHasSearched(true);
            const newCache = { ...productsCache };
            products.forEach((p: Product) => { newCache[p.id] = p; });
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

    const addedProductIds = new Set(localMenus.map(m => m.productId));

    return (
        <div className="space-y-6">
            {/* 섹션 순서 관리 */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <h2 className="text-lg font-semibold text-txt-main flex items-center gap-2">
                        <LayoutOutlined style={{ fontSize: 18 }} />
                        메인화면 섹션 관리
                    </h2>
                    <Button size="sm" onClick={saveConfiguration} disabled={loading}>
                        <SaveOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        저장
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-txt-muted mb-4">
                        앱 메인화면에 표시되는 섹션의 순서와 노출 여부를 관리합니다.
                    </p>

                    <div className="space-y-2">
                        {sections.map((section, index) => {
                            const isRecommended = section.type === 'recommended';
                            return (
                                <div
                                    key={section.id}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                        isRecommended
                                            ? 'border-primary/30 bg-primary/5'
                                            : section.isVisible
                                                ? 'border-border bg-bg-card'
                                                : 'border-border bg-bg-hover opacity-60'
                                    }`}
                                >
                                    <MenuOutlined className="text-txt-muted cursor-grab" style={{ fontSize: 16 }} />

                                    <span className={`text-sm font-semibold flex-1 ${isRecommended ? 'text-primary' : 'text-txt-main'}`}>
                                        {section.title}
                                    </span>

                                    <Badge variant={isRecommended ? 'info' : 'default'}>
                                        {SECTION_TYPE_LABELS[section.type]}
                                    </Badge>

                                    {!isRecommended && (
                                        <span className="text-[11px] text-txt-muted flex items-center gap-1">
                                            <LockOutlined /> 연동 예정
                                        </span>
                                    )}

                                    <div className="flex gap-1 ml-auto">
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0 || loading}
                                            className="px-2 py-1 rounded border border-border bg-bg-card text-xs hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === sections.length - 1 || loading}
                                            className="px-2 py-1 rounded border border-border bg-bg-card text-xs hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            ▼
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => toggleVisibility(section.id)}
                                        disabled={loading}
                                        className={`px-2 py-1 rounded text-sm cursor-pointer ${
                                            section.isVisible
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-bg-hover text-txt-muted'
                                        }`}
                                        title={section.isVisible ? '숨기기' : '보이기'}
                                    >
                                        {section.isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* 추천메뉴 상세 관리 — 인라인 */}
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
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                        {/* 왼쪽: 검색 영역 (2/5) */}
                        <div className="lg:col-span-2 flex flex-col lg:border-r border-border lg:pr-6">
                            <h3 className="text-sm font-bold text-txt-main mb-3 flex items-center gap-2">
                                <SearchOutlined /> 메뉴 검색 및 추가
                            </h3>
                            <div className="flex gap-2 mb-4">
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="메뉴명 검색"
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                                <Button variant="secondary" onClick={handleSearch} disabled={isSearching}>
                                    검색
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px]">
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
                                        <div key={product.id} className={`flex items-center justify-between p-3 border border-border rounded-lg ${isAdded ? 'opacity-50' : 'bg-bg-card'}`}>
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Badge variant="secondary">{product.mainCategoryName}</Badge>
                                                <span className="font-semibold text-sm truncate">{product.name}</span>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => handleAdd(product)} disabled={isAdded}>
                                                {isAdded ? '추가됨' : '추가'}
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 오른쪽: 지정된 추천 메뉴 목록 (3/5) */}
                        <div className="lg:col-span-3 flex flex-col">
                            <h3 className="text-sm font-bold text-txt-main mb-3 flex items-center gap-2">
                                <SettingOutlined /> 지정된 추천 메뉴 (순서 설정)
                            </h3>

                            <div className="flex-1 overflow-y-auto space-y-2 max-h-[360px]">
                                {localMenus.length === 0 ? (
                                    <div className="text-center text-txt-muted text-sm py-12 border border-dashed border-border rounded-lg">
                                        왼쪽에서 메뉴를 검색하여 추천 메뉴를 추가하세요.
                                    </div>
                                ) : (
                                    localMenus.map((menu, index) => {
                                        const product = productsCache[menu.productId];
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
