import React, { useState, useMemo } from 'react';
import { ShoppingOutlined, CloseOutlined, SearchOutlined, StopOutlined } from '@ant-design/icons';
import { Skeleton } from './skeleton';

export interface ProductForSelect {
  id: string;
  name: string;
  price: number;
  categoryName?: string;
  imageUrl?: string;
}

// 제외된 상품 정보 (다른 할인/쿠폰에서 사용 중)
export interface ExcludedProduct {
  productId: string;
  reason: string;  // 예: "첫 주문 쿠폰에서 사용 중"
}

// Mock 상품 데이터
const mockProducts: ProductForSelect[] = [
  { id: 'prod-1', name: '뿌링클', price: 15000, categoryName: '한마리', imageUrl: 'https://via.placeholder.com/80?text=뿌링클' },
  { id: 'prod-2', name: '맛초킹', price: 15000, categoryName: '한마리', imageUrl: 'https://via.placeholder.com/80?text=맛초킹' },
  { id: 'prod-3', name: '후라이드', price: 13000, categoryName: '한마리', imageUrl: 'https://via.placeholder.com/80?text=후라이드' },
  { id: 'prod-4', name: '양념치킨', price: 14000, categoryName: '한마리', imageUrl: 'https://via.placeholder.com/80?text=양념' },
  { id: 'prod-5', name: '콜라', price: 2000, categoryName: '음료', imageUrl: 'https://via.placeholder.com/80?text=콜라' },
  { id: 'prod-6', name: '사이다', price: 2000, categoryName: '음료', imageUrl: 'https://via.placeholder.com/80?text=사이다' },
  { id: 'prod-7', name: '감자튀김', price: 3000, categoryName: '사이드', imageUrl: 'https://via.placeholder.com/80?text=감튀' },
  { id: 'prod-8', name: '치즈볼', price: 4000, categoryName: '사이드', imageUrl: 'https://via.placeholder.com/80?text=치즈볼' },
  { id: 'prod-9', name: '치킨무', price: 500, categoryName: '사이드', imageUrl: 'https://via.placeholder.com/80?text=치킨무' },
  { id: 'prod-10', name: '소스 추가', price: 500, categoryName: '추가옵션', imageUrl: 'https://via.placeholder.com/80?text=소스' },
];

interface ProductSelectorProps {
  selectedProductIds: string[];
  onChange: (productIds: string[]) => void;
  disabled?: boolean;
  maxSelect?: number;
  title?: string;
  description?: string;
  excludedProducts?: ExcludedProduct[];  // 다른 할인/쿠폰에서 사용 중인 상품
}

export const ProductSelector: React.FC<ProductSelectorProps> = ({
  selectedProductIds,
  onChange,
  disabled = false,
  maxSelect,
  title = '상품 선택',
  description,
  excludedProducts = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  // 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return mockProducts;
    const search = searchTerm.toLowerCase();
    return mockProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.categoryName?.toLowerCase().includes(search)
    );
  }, [searchTerm]);

  // 상품 ID로 상품 정보 찾기
  const getProductById = (id: string): ProductForSelect | undefined => {
    return mockProducts.find((p) => p.id === id);
  };

  // 상품 토글
  const handleToggleProduct = (productId: string) => {
    if (disabled) return;

    if (selectedProductIds.includes(productId)) {
      onChange(selectedProductIds.filter((id) => id !== productId));
    } else {
      if (maxSelect && selectedProductIds.length >= maxSelect) {
        return;
      }
      onChange([...selectedProductIds, productId]);
    }
  };

  // 상품 제거
  const handleRemoveProduct = (productId: string) => {
    if (disabled) return;
    onChange(selectedProductIds.filter((id) => id !== productId));
  };

  // 금액 포맷
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const canSelectMore = !maxSelect || selectedProductIds.length < maxSelect;

  // 제외된 상품 ID 목록과 이유 맵
  const excludedProductMap = useMemo(() => {
    const map = new Map<string, string>();
    excludedProducts.forEach((ep) => map.set(ep.productId, ep.reason));
    return map;
  }, [excludedProducts]);

  // 상품이 제외되었는지 확인
  const isProductExcluded = (productId: string): boolean => {
    return excludedProductMap.has(productId);
  };

  // 제외 이유 가져오기
  const getExclusionReason = (productId: string): string | undefined => {
    return excludedProductMap.get(productId);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-txt-main">{title}</p>
          {description && (
            <p className="text-xs text-txt-muted mt-0.5">{description}</p>
          )}
        </div>
        {maxSelect && (
          <span className={`text-sm ${selectedProductIds.length >= maxSelect ? 'text-warning font-medium' : 'text-txt-muted'}`}>
            {selectedProductIds.length} / {maxSelect}개
          </span>
        )}
      </div>

      {/* 선택된 상품 목록 */}
      {selectedProductIds.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedProductIds.map((productId) => {
            const product = getProductById(productId);
            return (
              <div
                key={productId}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full"
              >
                <ShoppingOutlined className="text-primary" style={{ fontSize: 12 }} />
                <span className="text-sm text-txt-main">
                  {product?.name || productId}
                </span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(productId)}
                    className="p-0.5 hover:bg-primary/20 rounded-full transition-colors"
                  >
                    <CloseOutlined style={{ fontSize: 10 }} className="text-primary" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 상품 선택 영역 */}
      <div className="border border-border rounded-lg overflow-hidden">
        {/* 검색 및 토글 */}
        <div
          className="flex items-center gap-3 px-4 py-3 bg-bg-hover cursor-pointer"
          onClick={() => !disabled && setIsExpanded(!isExpanded)}
        >
          <SearchOutlined className="text-txt-muted" style={{ fontSize: 16 }} />
          <input
            type="text"
            placeholder="상품명 또는 카테고리 검색..."
            value={searchTerm}
            onChange={(e) => {
              e.stopPropagation();
              setSearchTerm(e.target.value);
              if (!isExpanded) setIsExpanded(true);
            }}
            onClick={(e) => e.stopPropagation()}
            disabled={disabled}
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-txt-muted disabled:cursor-not-allowed"
          />
          <span className="text-xs text-txt-muted">
            {isExpanded ? '접기' : '펼치기'}
          </span>
        </div>

        {/* 상품 목록 */}
        {isExpanded && (
          <div className="max-h-64 overflow-y-auto divide-y divide-border">
            {filteredProducts.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <ShoppingOutlined style={{ fontSize: 24 }} className="text-txt-muted mb-2" />
                <p className="text-sm text-txt-muted">검색 결과가 없습니다</p>
              </div>
            ) : (
              filteredProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                const isExcluded = isProductExcluded(product.id);
                const exclusionReason = getExclusionReason(product.id);
                const cannotSelect = (!canSelectMore && !isSelected) || isExcluded;

                return (
                  <label
                    key={product.id}
                    className={`
                      flex items-center gap-3 px-4 py-3 transition-colors
                      ${isSelected ? 'bg-primary/5' : isExcluded ? 'bg-warning/5' : 'hover:bg-hover'}
                      ${disabled || cannotSelect ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                    title={isExcluded ? exclusionReason : undefined}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleProduct(product.id)}
                      disabled={disabled || cannotSelect}
                      className="sr-only"
                    />
                    <div
                      className={`
                        flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0
                        transition-colors duration-200
                        ${isSelected ? 'border-primary bg-primary' : isExcluded ? 'border-warning bg-warning/20' : 'border-border-strong'}
                      `}
                    >
                      {isSelected && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 12 12">
                          <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                        </svg>
                      )}
                      {isExcluded && !isSelected && (
                        <StopOutlined style={{ fontSize: 10 }} className="text-warning" />
                      )}
                    </div>

                    {/* 상품 이미지 */}
                    <div className="w-10 h-10 rounded-lg bg-bg-hover flex-shrink-0 overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className={`w-full h-full object-cover ${isExcluded ? 'grayscale' : ''}`}
                        />
                      ) : (
                        <Skeleton className="w-full h-full" />
                      )}
                    </div>

                    {/* 상품 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${isExcluded ? 'text-txt-muted' : 'text-txt-main'}`}>
                        {product.name}
                      </p>
                      {isExcluded && exclusionReason ? (
                        <p className="text-xs text-warning">{exclusionReason}</p>
                      ) : product.categoryName ? (
                        <p className="text-xs text-txt-muted">{product.categoryName}</p>
                      ) : null}
                    </div>

                    {/* 가격 */}
                    <span className={`text-sm ${isExcluded ? 'text-txt-muted' : 'text-txt-secondary'}`}>
                      {formatPrice(product.price)}원
                    </span>
                  </label>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* 빈 상태 안내 */}
      {selectedProductIds.length === 0 && !isExpanded && (
        <div className="text-center py-2">
          <p className="text-xs text-txt-muted">
            위 영역을 클릭하여 상품을 선택하세요
            {maxSelect && ` (최대 ${maxSelect}개)`}
          </p>
        </div>
      )}
    </div>
  );
};
