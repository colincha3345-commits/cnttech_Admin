import { useState, useMemo } from 'react';
import { format, differenceInDays, isBefore, isAfter } from 'date-fns';
import {
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  CopyOutlined,
  DownloadOutlined,
  UploadOutlined,
  CheckOutlined,
  EditOutlined,
  HolderOutlined,
} from '@ant-design/icons';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
  CategoryFilter,
  DraggableProductItem,
  SearchInput,
  ProductImage,
  ConfirmDialog,
} from '@/components/ui';
import { BulkEditModal } from './components/BulkEditModal';
import { ProductForm } from './ProductForm';

import { useProducts, useStores, useOptionGroupList, useToast } from '@/hooks';
import { useIconBadges } from '@/hooks/useDesign';
import type { Product, ProductFormData, BulkEditUpdate, BulkUpdateResult, DisplayOrderUpdate } from '@/types/product';
import { DEFAULT_CHANNELS } from '@/types/product';
import type { ProductChannels } from '@/types/product';
import { multiFieldSearch } from '@/utils/search';
import { useAuthStore } from '@/stores/authStore';
import { usePageViewLog } from '@/hooks/useActivityLog';
import { MOCK_CATEGORIES, PRODUCT_LIST_MAX_HEIGHT } from '@/constants';
import { downloadCsv, downloadCsvTemplate, readCsvFile } from '@/utils/csv';
import { validateCsvFile } from '@/utils/fileValidation';
import { auditService } from '@/services/auditService';

const statusMap = {
  active: { label: '판매중', color: 'success' as const },
  soldout: { label: '품절', color: 'critical' as const },
};

/**
 * 판매기간 배지 정보 계산
 */
const getSalesPeriodBadge = (
  salesStartDate?: Date,
  salesEndDate?: Date
): { label: string; color: 'success' | 'warning' | 'default' } | null => {
  if (!salesStartDate || !salesEndDate) return null;

  const now = new Date();

  // 판매 시작 전
  if (isBefore(now, salesStartDate)) {
    const daysUntilStart = differenceInDays(salesStartDate, now);
    if (daysUntilStart <= 7) {
      return { label: `시작 D-${daysUntilStart}`, color: 'warning' };
    }
    return { label: `~${format(salesStartDate, 'MM/dd')}`, color: 'warning' };
  }

  // 판매 종료 후
  if (isAfter(now, salesEndDate)) {
    return { label: '판매종료', color: 'default' };
  }

  // 판매 중
  const daysUntilEnd = differenceInDays(salesEndDate, now);
  if (daysUntilEnd <= 7) {
    return { label: `종료 D-${daysUntilEnd}`, color: 'warning' };
  }
  return { label: `~${format(salesEndDate, 'MM/dd')}`, color: 'success' };
};

/**
 * 기본 폼 데이터 생성
 * @param displayOrder 표시 순서 (기본값: 1)
 * @returns 초기화된 ProductFormData
 */
const getDefaultFormData = (displayOrder: number = 1): ProductFormData => ({
  name: '',
  price: 0,
  description: '',
  imageUrl: '',
  subImageUrls: [],
  subImageFiles: [],
  categoryPairs: [{ id: `pair-${Date.now()}`, mainCategoryId: '', subCategoryId: '' }],
  mainCategoryId: '1',
  subCategoryIds: [],
  optionGroupIds: [],
  status: 'active',
  applyToAll: true,
  storeIds: [],
  productCode: '',
  posDisplayName: '',
  posColor: '',
  channels: { ...DEFAULT_CHANNELS },
  allowCoupon: true,
  allowVoucher: true,
  allowGiftCard: false,
  allowOwnDiscount: true,
  allowPartnerDiscount: true,
  origin: [],
  nutrition: {
    calories: 0,
    sodium: 0,
    carbs: 0,
    sugar: 0,
    fat: 0,
    protein: 0,
    servingSize: '',
  },
  nutritionBySize: [],
  allergens: [],
  badgeIds: [],
  displayOrder,
});

// 채널별 판매상태 배지 계산
function getChannelBadges(channels?: ProductChannels) {
  if (!channels) return null;
  const active: string[] = [];
  const partial: string[] = [];
  if (channels.app) { channels.app === 'active' ? active.push('앱') : partial.push('앱'); }
  if (channels.pos) { channels.pos === 'active' ? active.push('POS') : partial.push('POS'); }
  if (channels.kiosk) { channels.kiosk === 'active' ? active.push('키오스크') : partial.push('키오스크'); }
  if (channels.tableOrder) { channels.tableOrder === 'active' ? active.push('테이블') : partial.push('테이블'); }
  const total = active.length + partial.length;
  if (total === 4 && partial.length === 0) return null;
  return { active, partial };
}

// 채널 배지 렌더링 컴포넌트
function ChannelBadges({ channels }: { channels?: ProductChannels }) {
  const badges = getChannelBadges(channels);
  if (!badges) return null;
  return (
    <>
      {badges.active.length > 0 && <Badge variant="secondary">{badges.active.join('·')}</Badge>}
      {badges.partial.length > 0 && <Badge variant="warning">{badges.partial.join('·')}</Badge>}
    </>
  );
}

// 판매기간 배지 렌더링 컴포넌트
function SalesPeriodBadgeDisplay({ startDate, endDate }: { startDate?: Date; endDate?: Date }) {
  const badge = getSalesPeriodBadge(startDate, endDate);
  if (!badge) return null;
  return <Badge variant={badge.color}>{badge.label}</Badge>;
}

export function Products() {
  usePageViewLog('products');
  const { user } = useAuthStore();
  // 카테고리 필터 상태
  const [selectedMainCategoryId, setSelectedMainCategoryId] = useState<string | null>(null);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState<string | null>(null);

  // Clean Architecture: hooks를 통한 데이터 관리
  const { products, loading: productsLoading, createProduct, updateProduct, deleteProduct, uploadImage, refetch, updateDisplayOrders } = useProducts({
    categoryId: selectedSubCategoryId || selectedMainCategoryId || undefined,
  });
  const { stores, loading: storesLoading } = useStores();
  const { data: optionGroupsData, isLoading: optionGroupsLoading } = useOptionGroupList();
  const optionGroups = optionGroupsData?.data ?? [];
  const { badges: iconBadges } = useIconBadges();
  const activeBadges = iconBadges.filter((b) => b.status === 'active');
  const toast = useToast();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'options' | 'details'>('basic');
  const [isFormActive, setIsFormActive] = useState(false);

  // 일괄변경용 선택된 메뉴 IDs
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  // 드래그앤드랍 모드
  const [isDraggingMode, setIsDraggingMode] = useState(false);

  // 저장 완료 다이얼로그
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean;
    productName: string;
    isNew: boolean;
  }>({ isOpen: false, productName: '', isNew: true });

  const isLoading = productsLoading || storesLoading || optionGroupsLoading;

  // 폼 데이터
  const [formData, setFormData] = useState<ProductFormData>(getDefaultFormData());

  const [imageFile, setImageFile] = useState<File | null>(null);

  // 검색된 메뉴 목록 (다중 필드 검색: 이름, 설명, 포스코드)
  const filteredProducts = useMemo(() =>
    products.filter((product) =>
      multiFieldSearch(product, searchTerm, ['name', 'description', 'productCode', 'posCode'])
    ), [products, searchTerm]);

  // 메뉴 선택
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      subImageUrls: product.subImageUrls || [],
      subImageFiles: [],
      categoryPairs: product.categoryPairs || [
        { id: `pair-${Date.now()}`, mainCategoryId: product.mainCategoryId, subCategoryId: product.subCategoryIds[0] || '' }
      ],
      mainCategoryId: product.mainCategoryId,
      subCategoryIds: product.subCategoryIds,
      optionGroupIds: product.optionGroups.map((og) => og.id),
      status: product.status,
      salesStartDate: product.salesStartDate,
      salesEndDate: product.salesEndDate,
      applyToAll: product.applyToAll,
      storeIds: product.storeIds,
      productCode: product.productCode || '',
      posCode: product.posCode,
      posDisplayName: product.posDisplayName || '',
      posColor: product.posColor || '',
      channels: product.channels || { ...DEFAULT_CHANNELS },
      allowCoupon: product.allowCoupon,
      allowVoucher: product.allowVoucher,
      allowGiftCard: product.allowGiftCard,
      allowOwnDiscount: product.allowOwnDiscount ?? true,
      allowPartnerDiscount: product.allowPartnerDiscount ?? true,
      origin: product.origin,
      nutrition: product.nutrition,
      nutritionBySize: product.nutritionBySize || [],
      allergens: product.allergens.map((a) => a.code),
      badgeIds: product.badgeIds || [],
      displayOrder: product.displayOrder,
    });
    setImageFile(null);
    setActiveTab('basic');
    setIsFormActive(true);
  };

  // 새 메뉴 등록
  const handleNewProduct = () => {
    setSelectedProduct(null);
    setFormData(getDefaultFormData(products.length + 1));
    setImageFile(null);
    setActiveTab('basic');
    setIsFormActive(true);
  };

  // 저장
  const handleSave = async () => {
    // 유효성 검사
    const nameText = formData.name.replace(/<br\s*\/?>/g, '').trim();
    if (!nameText) {
      toast.warning('메뉴명을 입력해주세요');
      return;
    }
    if (nameText.length > 50) {
      toast.warning('메뉴명은 50자 이내로 입력해주세요');
      return;
    }

    const isDuplicate = products.some(p => p.name.trim() === formData.name.trim() && p.id !== selectedProduct?.id);
    if (isDuplicate) {
      toast.warning('이미 사용 중인 메뉴명입니다. 다른 이름을 입력해주세요.');
      return;
    }

    if (formData.price <= 0) {
      toast.warning('가격을 입력해주세요');
      return;
    }

    if (!formData.description.trim()) {
      toast.warning('메뉴 설명을 입력해주세요');
      return;
    }

    if (!formData.applyToAll && formData.storeIds.length === 0) {
      toast.warning('최소 1개 가맹점을 선택해주세요');
      return;
    }

    try {
      // 이미지 업로드 (Clean Architecture: Application 레이어를 통한 접근)
      let imageUrl = formData.imageUrl;
      if (imageFile) {
        const uploadRes = await uploadImage(imageFile);
        imageUrl = uploadRes.imageUrl;
      }

      const dataToSave = {
        ...formData,
        imageUrl,
      };

      const isNew = !selectedProduct;

      if (selectedProduct) {
        // 수정
        await updateProduct(selectedProduct.id, dataToSave);
      } else {
        // 생성
        await createProduct(dataToSave);
      }

      // 성공 다이얼로그 표시
      setSuccessDialog({
        isOpen: true,
        productName: formData.name,
        isNew,
      });
    } catch (error) {
      console.error('저장 실패:', error);
      toast.error('저장에 실패했습니다');
    }
  };

  // 취소
  const handleCancel = () => {
    setSelectedProduct(null);
    setImageFile(null);
    setActiveTab('basic');
    setIsFormActive(false);
  };

  // 저장 완료 후 추가 등록 여부 플래그
  const continueRegistrationRef = { current: false };

  // 저장 완료 후 목록으로 (onClose - 취소 버튼 또는 확인 버튼 후 호출됨)
  const handleSuccessDialogClose = () => {
    setSuccessDialog({ isOpen: false, productName: '', isNew: true });

    if (continueRegistrationRef.current) {
      // 추가 등록 모드 - 폼 초기화 후 등록 모드 유지
      setSelectedProduct(null);
      setFormData(getDefaultFormData(products.length + 1));
      setImageFile(null);
      setActiveTab('basic');
      continueRegistrationRef.current = false;
      // isFormActive는 true 유지
    } else {
      // 목록으로
      handleCancel();
    }
  };

  // 저장 완료 후 추가 등록 (확인 버튼 - onConfirm 후 onClose가 호출됨)
  const handleSuccessDialogConfirm = () => {
    continueRegistrationRef.current = true;
  };

  // 삭제
  const handleDelete = async () => {
    if (!selectedProduct) return;

    if (!confirm(`'${selectedProduct.name}' 메뉴를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteProduct(selectedProduct.id);
      toast.success('메뉴가 삭제되었습니다');
      handleCancel();
    } catch (error) {
      console.error('삭제 실패:', error);
      toast.error('삭제에 실패했습니다');
    }
  };

  // 복제
  const handleDuplicate = (product: Product) => {
    const duplicatedFormData: ProductFormData = {
      name: `${product.name} (복사본)`,
      price: product.price,
      description: product.description,
      imageUrl: product.imageUrl,
      subImageUrls: product.subImageUrls || [],
      subImageFiles: [],
      categoryPairs: product.categoryPairs || [
        { id: `pair-${Date.now()}`, mainCategoryId: product.mainCategoryId, subCategoryId: product.subCategoryIds[0] || '' }
      ],
      mainCategoryId: product.mainCategoryId,
      subCategoryIds: product.subCategoryIds,
      optionGroupIds: product.optionGroups.map((og) => og.id),
      status: 'soldout', // 복사본은 기본적으로 품절
      applyToAll: product.applyToAll,
      storeIds: product.storeIds,
      productCode: undefined, // 상품코드는 중복 방지를 위해 제거
      posCode: undefined, // 포스 코드는 중복 방지를 위해 제거
      allowCoupon: product.allowCoupon,
      allowVoucher: product.allowVoucher,
      allowGiftCard: product.allowGiftCard,
      allowOwnDiscount: product.allowOwnDiscount ?? true,
      allowPartnerDiscount: product.allowPartnerDiscount ?? true,
      origin: product.origin,
      nutrition: product.nutrition,
      nutritionBySize: product.nutritionBySize || [],
      allergens: product.allergens.map((a) => a.code),
      badgeIds: product.badgeIds || [],
      displayOrder: products.length + 1,
    };

    setSelectedProduct(null); // 새 메뉴로 처리
    setFormData(duplicatedFormData);
    setImageFile(null);
    setActiveTab('basic');
    setIsFormActive(true);
    toast.info(`'${product.name}' 메뉴가 복제되었습니다`);
  };

  // CSV 다운로드
  const handleCsvDownload = () => {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      downloadCsv(products, `메뉴목록_${timestamp}.csv`);

      auditService.log({
        action: 'DATA_EXPORT',
        resource: 'menu:products',
        userId: user?.id ?? 'anonymous',
        details: { filename: `메뉴목록_${timestamp}.csv`, count: products.length },
      });

      toast.success('CSV 파일이 다운로드되었습니다');
    } catch (error) {
      console.error('CSV 다운로드 실패:', error);
      toast.error('CSV 다운로드에 실패했습니다');
    }
  };

  // CSV 템플릿 다운로드
  const handleTemplateDownload = () => {
    try {
      downloadCsvTemplate();
      toast.success('CSV 템플릿이 다운로드되었습니다');
    } catch (error) {
      console.error('템플릿 다운로드 실패:', error);
      toast.error('템플릿 다운로드에 실패했습니다');
    }
  };

  // CSV 업로드
  const handleCsvUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // CSV 파일 검증 (MIME + 확장자 + 크기)
    const validation = validateCsvFile(file);
    if (!validation.valid) {
      toast.error(validation.error ?? '잘못된 파일입니다.');
      return;
    }

    try {
      const productsData = await readCsvFile(file);

      // 각 메뉴를 순차적으로 등록
      let successCount = 0;
      let failCount = 0;

      for (const productData of productsData) {
        try {
          await createProduct(productData);
          successCount++;
        } catch (error) {
          console.error('메뉴 등록 실패:', productData.name, error);
          failCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount}개 메뉴가 등록되었습니다${failCount > 0 ? ` (${failCount}개 실패)` : ''}`);
      } else {
        toast.error('메뉴 등록에 실패했습니다');
      }
    } catch (error) {
      console.error('CSV 업로드 실패:', error);
      toast.error(error instanceof Error ? error.message : 'CSV 업로드에 실패했습니다');
    }

    // 파일 입력 초기화
    event.target.value = '';
  };

  // 체크박스 토글
  const handleToggleSelect = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // 전체 선택/해제
  const handleToggleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  // 일괄변경 모드 토글
  const handleToggleBulkEdit = () => {
    setIsBulkEditMode(!isBulkEditMode);
    if (isBulkEditMode) {
      setSelectedProductIds([]); // 모드 종료 시 선택 초기화
    }
  };

  // 일괄변경 실행
  const handleBulkUpdate = async (update: BulkEditUpdate) => {
    if (selectedProductIds.length === 0) {
      toast.warning('변경할 메뉴를 선택해주세요');
      return;
    }

    const result: BulkUpdateResult = {
      success: [],
      failed: [],
      successCount: 0,
      failCount: 0,
    };

    try {
      for (const productId of selectedProductIds) {
        const product = products.find((p) => p.id === productId);
        if (!product) {
          result.failed.push({
            id: productId,
            name: '알 수 없음',
            reason: '메뉴를 찾을 수 없습니다',
          });
          result.failCount++;
          continue;
        }

        try {
          let updateData: Partial<ProductFormData> = {};

          // 타입별 처리
          switch (update.type) {
            case 'status':
              updateData = { status: update.data.status };
              break;

            case 'price':
              const { changeType, value } = update.data;
              let newPrice: number;

              if (changeType === 'fixed') {
                newPrice = value;
              } else {
                // percentage - 음수 가격 방지
                newPrice = Math.max(0, Math.round(product.price * (1 + value / 100)));
              }

              // 가격이 0원 이하인 경우 에러
              if (newPrice <= 0) {
                throw new Error('가격은 0원보다 커야 합니다');
              }

              updateData = { price: newPrice };
              break;

          }

          await updateProduct(productId, updateData);
          result.success.push(productId);
          result.successCount++;
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
          result.failed.push({
            id: productId,
            name: product.name,
            reason: errorMessage,
          });
          result.failCount++;
        }
      }

      // 결과 피드백
      if (result.successCount > 0) {
        const message =
          result.failCount > 0
            ? `${result.successCount}개 메뉴가 변경되었습니다 (${result.failCount}개 실패)`
            : `${result.successCount}개 메뉴가 변경되었습니다`;
        toast.success(message);

        // 실패 항목이 있으면 상세 정보 표시
        if (result.failed.length > 0) {
          console.group('일괄변경 실패 항목');
          result.failed.forEach((item) => {
            console.error(`- ${item.name} (${item.id}): ${item.reason}`);
          });
          console.groupEnd();

          // 사용자에게 실패 항목 알림
          setTimeout(() => {
            const failedNames = result.failed
              .slice(0, 3)
              .map((item) => item.name)
              .join(', ');
            const more = result.failed.length > 3 ? ` 외 ${result.failed.length - 3}개` : '';
            toast.warning(`실패: ${failedNames}${more}`);
          }, 1000);
        }

        setSelectedProductIds([]);
        setIsBulkEditMode(false);
      } else {
        toast.error('모든 메뉴 변경에 실패했습니다');
        console.error('일괄변경 전체 실패:', result.failed);
      }
    } catch (error) {
      console.error('일괄변경 처리 중 오류:', error);
      toast.error('일괄변경 처리 중 오류가 발생했습니다');
    }
  };

  // 드래그앤드랍 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동 후 드래그 시작 (클릭과 구분)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 드래그 종료 핸들러
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = filteredProducts.findIndex((p) => p.id === active.id);
    const newIndex = filteredProducts.findIndex((p) => p.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // 로컬 상태 즉시 업데이트 (낙관적 업데이트)
    const reorderedProducts = arrayMove(filteredProducts, oldIndex, newIndex);

    // displayOrder 재계산
    const updates: DisplayOrderUpdate[] = reorderedProducts.map((product, index) => ({
      productId: product.id,
      displayOrder: index + 1,
    }));

    try {
      // 백엔드에 순서 업데이트 (Clean Architecture: hooks를 통한 접근)
      await updateDisplayOrders(updates);

      // 상품 목록 새로고침
      await refetch();

      toast.success('순서가 변경되었습니다');
    } catch (error) {
      console.error('순서 변경 실패:', error);
      toast.error('순서 변경에 실패했습니다');
      // 실패 시 목록 새로고침으로 원래 순서 복구
      await refetch();
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">메뉴 관리</h1>
          <p className="text-sm text-txt-muted mt-1">가맹점 메뉴를 등록하고 관리합니다</p>
        </div>

        {/* CSV 액션 버튼 */}
        <div className="flex gap-2">
          {/* CSV 템플릿 다운로드 */}
          <Button variant="ghost" size="sm" onClick={handleTemplateDownload}>
            <DownloadOutlined />
            템플릿
          </Button>

          {/* CSV 업로드 */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-button border border-border bg-white text-txt-main hover:bg-hover transition-colors">
              <UploadOutlined />
              CSV 등록
            </span>
          </label>

          {/* CSV 다운로드 */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCsvDownload}
            disabled={products.length === 0}
          >
            <DownloadOutlined />
            CSV 다운로드
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
        {/* 좌측: 메뉴 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-txt-main">메뉴 목록</h2>
                <p className="text-xs text-txt-muted mt-1">
                  총 {products.length}개
                  {isBulkEditMode && selectedProductIds.length > 0 && (
                    <span className="ml-2 text-primary font-medium">
                      ({selectedProductIds.length}개 선택)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                {isBulkEditMode ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleToggleBulkEdit}
                    >
                      <CloseOutlined />
                      취소
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsBulkEditModalOpen(true)}
                      disabled={selectedProductIds.length === 0}
                    >
                      <EditOutlined />
                      일괄변경
                    </Button>
                  </>
                ) : isDraggingMode ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsDraggingMode(false)}
                    >
                      <CloseOutlined />
                      취소
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setIsDraggingMode(false)}
                    >
                      <CheckOutlined />
                      완료
                    </Button>
                  </>
                ) : !isFormActive ? (
                  <>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setIsDraggingMode(true)}
                      disabled={products.length === 0}
                    >
                      <HolderOutlined />
                      순서 변경
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleToggleBulkEdit}
                      disabled={products.length === 0}
                    >
                      <EditOutlined />
                      일괄변경
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleNewProduct}>
                      <PlusOutlined />
                      메뉴 등록
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="secondary" size="sm" onClick={handleCancel}>
                      <CloseOutlined />
                      등록 취소
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave} disabled={isLoading}>
                      <SaveOutlined />
                      저장
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 카테고리 필터 */}
            <div className="mb-4">
              <CategoryFilter
                categories={MOCK_CATEGORIES}
                selectedMainCategoryId={selectedMainCategoryId}
                selectedSubCategoryId={selectedSubCategoryId}
                onMainCategoryChange={setSelectedMainCategoryId}
                onSubCategoryChange={setSelectedSubCategoryId}
              />
            </div>

            {/* 검색 */}
            <div className="mb-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="메뉴명 검색..."
              />
            </div>

            {/* 전체 선택 (일괄변경 모드) */}
            {isBulkEditMode && filteredProducts.length > 0 && (
              <div className="mb-3 pb-3 border-b border-border">
                <label className="flex items-center gap-2 cursor-pointer hover:bg-hover p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={
                      filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length
                    }
                    onChange={handleToggleSelectAll}
                    className="sr-only"
                  />
                  <div
                    className={`
                      flex items-center justify-center w-5 h-5 rounded border-2
                      transition-colors duration-200
                      ${filteredProducts.length > 0 &&
                        selectedProductIds.length === filteredProducts.length
                        ? 'border-primary bg-primary'
                        : 'border-border-strong'
                      }
                    `}
                  >
                    {filteredProducts.length > 0 &&
                      selectedProductIds.length === filteredProducts.length && (
                        <CheckOutlined className="text-xs text-white" />
                      )}
                  </div>
                  <span className="text-sm font-medium text-txt-main">전체 선택</span>
                </label>
              </div>
            )}

            {/* 메뉴 리스트 */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredProducts.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2 overflow-y-auto" style={{ maxHeight: `${PRODUCT_LIST_MAX_HEIGHT}px` }}>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-txt-muted">등록된 메뉴가 없습니다</p>
                    </div>
                  ) : (
                    filteredProducts.map((product) => (
                      <DraggableProductItem
                        key={product.id}
                        product={product}
                        isSelected={selectedProduct?.id === product.id}
                        isBulkEditMode={isBulkEditMode}
                        isDraggingMode={isDraggingMode}
                        onSelect={handleSelectProduct}
                      >
                        <div className="flex gap-3">
                          {/* 체크박스 (일괄변경 모드) */}
                          {isBulkEditMode && (
                            <div className="flex items-start pt-1">
                              <label
                                className="cursor-pointer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedProductIds.includes(product.id)}
                                  onChange={() => handleToggleSelect(product.id)}
                                  className="sr-only"
                                />
                                <div
                                  className={`
                                    flex items-center justify-center w-5 h-5 rounded border-2
                                    transition-colors duration-200
                                    ${selectedProductIds.includes(product.id)
                                      ? 'border-primary bg-primary'
                                      : 'border-border-strong hover:border-primary'
                                    }
                                  `}
                                >
                                  {selectedProductIds.includes(product.id) && (
                                    <CheckOutlined className="text-xs text-white" />
                                  )}
                                </div>
                              </label>
                            </div>
                          )}

                          <button
                            onClick={() => !isBulkEditMode && !isDraggingMode && handleSelectProduct(product)}
                            className="flex-1 flex gap-3 text-left"
                            disabled={isBulkEditMode || isDraggingMode}
                          >
                            {/* 이미지 */}
                            <ProductImage
                              src={product.imageUrl}
                              alt={product.name}
                              size="md"
                            />

                            {/* 정보 */}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-txt-main truncate">{product.name}</p>
                              <p className="text-sm text-txt-secondary">
                                {product.price.toLocaleString()}원
                                {product.productCode && (
                                  <span className="ml-2 text-txt-muted">({product.productCode})</span>
                                )}
                              </p>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                <Badge variant={statusMap[product.status].color}>
                                  {statusMap[product.status].label}
                                </Badge>
                                {/* 채널별 판매상태 표시 */}
                                <ChannelBadges channels={product.channels} />
                                <SalesPeriodBadgeDisplay startDate={product.salesStartDate} endDate={product.salesEndDate} />
                              </div>
                            </div>
                          </button>
                        </div>

                        {/* 복제 버튼 (호버 시 표시, 일괄변경/드래그 모드 아닐 때만) */}
                        {!isBulkEditMode && !isDraggingMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicate(product);
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-bg-main hover:bg-hover border border-border shadow-sm"
                            title="메뉴 복제"
                          >
                            <CopyOutlined className="text-sm text-txt-secondary" />
                          </button>
                        )}
                      </DraggableProductItem>
                    ))
                  )}
                </div>
              </SortableContext>
            </DndContext>
          </CardContent>
        </Card>

        {/* 우측: 메뉴 폼 */}
        <Card>
          {!isFormActive ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-hover">
                  <PlusOutlined className="text-4xl text-txt-muted" />
                </div>
                <h3 className="text-lg font-semibold text-txt-main mb-2">
                  메뉴를 선택하거나 등록하세요
                </h3>
                <p className="text-sm text-txt-muted mb-6">
                  좌측 목록에서 메뉴를 선택하거나<br />
                  "메뉴 등록" 버튼을 클릭하여 새 메뉴를 추가하세요
                </p>
                <Button variant="primary" onClick={handleNewProduct}>
                  <PlusOutlined />
                  메뉴 등록
                </Button>
              </div>
            </CardContent>
          ) : (
            <ProductForm
              formData={formData}
              onFormDataChange={setFormData}
              selectedProduct={selectedProduct}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onImageFileChange={setImageFile}
              onDelete={handleDelete}
              stores={stores}
              optionGroups={optionGroups}
              activeBadges={activeBadges}
            />
          )}
        </Card>
      </div>

      {/* 일괄변경 모달 */}
      <BulkEditModal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        onConfirm={handleBulkUpdate}
        selectedCount={selectedProductIds.length}
      />

      {/* 저장 완료 다이얼로그 */}
      <ConfirmDialog
        isOpen={successDialog.isOpen}
        onClose={handleSuccessDialogClose}
        onConfirm={handleSuccessDialogConfirm}
        title={successDialog.isNew ? '메뉴 등록 완료' : '메뉴 수정 완료'}
        message={`"${successDialog.productName}" 메뉴가 ${successDialog.isNew ? '등록' : '수정'}되었습니다.\n다음 작업을 선택해주세요.`}
        type="success"
        confirmText="추가 등록"
        cancelText="목록으로"
        showCancel={true}
      />
    </div>
  );
}
