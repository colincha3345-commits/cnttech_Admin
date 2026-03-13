import { useState, useEffect, useCallback, useRef } from 'react';
import { productService } from '@/services/productService';
import { extractErrorMessage } from '@/utils/async';
import type { Product, ProductFormData, ProductStatus, DisplayOrderUpdate } from '@/types/product';

interface UseProductsOptions {
  categoryId?: string;
  status?: string;
  autoLoad?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProduct: (data: ProductFormData) => Promise<Product>;
  updateProduct: (id: string, data: Partial<ProductFormData>) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<{ imageUrl: string }>;
  updateDisplayOrders: (updates: DisplayOrderUpdate[]) => Promise<void>;
  searchProducts: (search: string, limit?: number) => Promise<Product[]>;
}

/**
 * 판매기간에 따른 자동 상태 체크
 * @returns 변경이 필요한 경우 새로운 상태, 아니면 null
 */
const checkSalesPeriodStatus = (product: Product): ProductStatus | null => {
  const now = new Date();

  // 판매 종료 시간 체크 (active → soldout)
  if (
    product.salesEndDate &&
    product.status === 'active' &&
    now >= product.salesEndDate
  ) {
    return 'soldout';
  }

  return null;
};

/**
 * 메뉴 관리 훅
 * Clean Architecture: Presentation ↔ Application 레이어 연결
 */
export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const { categoryId, status, autoLoad = true } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 공통 비동기 래퍼: try-catch-finally 중복 제거
  const withAsync = useCallback(
    async <T>(fn: () => Promise<T>, errorMsg: string): Promise<T> => {
      setLoading(true);
      setError(null);
      try {
        return await fn();
      } catch (err) {
        setError(extractErrorMessage(err, errorMsg));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await productService.getProducts({ categoryId, status });
      setProducts(response.data);
    } catch (err) {
      setError(extractErrorMessage(err, '메뉴 목록을 불러오는데 실패했습니다'));
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [categoryId, status]);

  const createProduct = useCallback(
    (data: ProductFormData): Promise<Product> =>
      withAsync(async () => {
        const newProduct = await productService.createProduct(data);
        setProducts((prev) => [...prev, newProduct]);
        return newProduct;
      }, '메뉴 생성에 실패했습니다'),
    [withAsync]
  );

  const updateProduct = useCallback(
    (id: string, data: Partial<ProductFormData>): Promise<Product> =>
      withAsync(async () => {
        const updatedProduct = await productService.updateProduct(id, data);
        setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
        return updatedProduct;
      }, '메뉴 수정에 실패했습니다'),
    [withAsync]
  );

  const deleteProduct = useCallback(
    (id: string): Promise<void> =>
      withAsync(async () => {
        await productService.deleteProduct(id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }, '메뉴 삭제에 실패했습니다'),
    [withAsync]
  );

  const uploadImage = useCallback(
    (file: File): Promise<{ imageUrl: string }> =>
      withAsync(() => productService.uploadImage(file), '이미지 업로드에 실패했습니다'),
    [withAsync]
  );

  const updateDisplayOrders = useCallback(
    (updates: DisplayOrderUpdate[]): Promise<void> =>
      withAsync(() => productService.updateDisplayOrders(updates), '순서 변경에 실패했습니다'),
    [withAsync]
  );

  // 판매기간 자동 관리 로직 - useRef로 클로저 버그 수정
  const productsRef = useRef(products);
  productsRef.current = products;

  useEffect(() => {
    const checkAndUpdateProducts = () => {
      setProducts((prevProducts) => {
        let hasChanges = false;
        const updatedProducts = prevProducts.map((product) => {
          const newStatus = checkSalesPeriodStatus(product);
          if (newStatus && newStatus !== product.status) {
            hasChanges = true;
            console.log(
              `[판매기간 자동 관리] ${product.name}: ${product.status} → ${newStatus}`
            );
            productService
              .updateProduct(product.id, { status: newStatus })
              .catch((err) => {
                console.error('판매기간 자동 상태 변경 실패:', err);
              });
            return { ...product, status: newStatus };
          }
          return product;
        });

        return hasChanges ? updatedProducts : prevProducts;
      });
    };

    checkAndUpdateProducts();
    const intervalId = setInterval(checkAndUpdateProducts, 60000);
    return () => clearInterval(intervalId);
  }, [products.length]);

  // 자동 로드
  useEffect(() => {
    if (autoLoad) {
      fetchProducts();
    }
  }, [autoLoad, fetchProducts]);

  const searchProducts = useCallback(
    (search: string, limit = 10) =>
      productService.getProducts({ search, limit }).then((res) => res.data),
    []
  );

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    updateDisplayOrders,
    searchProducts,
  };
};
