import React, { useState } from 'react';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  CheckCircleOutlined,
  MinusCircleOutlined,
  TagsOutlined,
  ShoppingOutlined,
  DollarOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Textarea,
  Label,
  Switch,
  Separator,
  Badge,
  ConfirmDialog,
  SearchInput,
} from '@/components/ui';
import {
  useOptionGroupList,
  useCreateOptionGroup,
  useUpdateOptionGroup,
  useDeleteOptionGroup,
  useAvailableOptions,
  useAvailableProducts,
} from '@/hooks';
import type { OptionGroup, OptionGroupItem, OptionGroupFormData, SelectionType } from '@/types/product';
import { SELECTION_TYPE_LABELS } from '@/types/product';

// 다이얼로그 상태 타입
interface DialogState {
  isOpen: boolean;
  type: 'confirm' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  showCancel?: boolean;
}

// 아이템 추가 모드 타입
type AddItemMode = 'option' | 'product';

export function OptionGroups() {
  // 서버 데이터
  const { data: groupsData, isLoading } = useOptionGroupList();
  const groups = groupsData?.data ?? [];
  const { data: optionsData } = useAvailableOptions();
  const availableOptions = optionsData?.data ?? [];
  const { data: productsData } = useAvailableProducts();
  const availableProducts = productsData?.data ?? [];
  const createMutation = useCreateOptionGroup();
  const updateMutation = useUpdateOptionGroup();
  const deleteMutation = useDeleteOptionGroup();

  // UI 상태
  const [selectedGroup, setSelectedGroup] = useState<OptionGroup | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    selectionType: 'single' as SelectionType,
    isRequired: false,
    minSelection: 0,
    maxSelection: 1,
    displayOrder: 1,
    isVisible: true,
    items: [] as OptionGroupItem[],
    optionIds: [] as string[], // Legacy
  });
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [addItemMode, setAddItemMode] = useState<AddItemMode>('option');
  const [itemSearchQuery, setItemSearchQuery] = useState('');
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showCancel: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<OptionGroup | null>(null);

  // 알림 다이얼로그
  const showAlert = (title: string, message: string) => {
    setDialog({
      isOpen: true,
      type: 'info',
      title,
      message,
      showCancel: false,
    });
  };

  // 성공 다이얼로그
  const showSuccess = (title: string, message: string) => {
    setDialog({
      isOpen: true,
      type: 'success',
      title,
      message,
      showCancel: false,
    });
  };

  // 삭제 확인 다이얼로그
  const showDeleteConfirm = (group: OptionGroup) => {
    setDeleteTarget(group);
    setDialog({
      isOpen: true,
      type: 'warning',
      title: '옵션 그룹 삭제',
      message: `"${group.name}" 옵션 그룹을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
      showCancel: true,
    });
  };

  const closeDialog = () => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
    setDeleteTarget(null);
  };

  const handleDialogConfirm = () => {
    if (deleteTarget) {
      deleteMutation.mutate(deleteTarget.id, {
        onSuccess: () => {
          if (selectedGroup?.id === deleteTarget.id) {
            setSelectedGroup(null);
          }
        },
      });
    }
    closeDialog();
  };

  const filteredGroups = groups.filter((group) =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalGroups = groups.length;
  const requiredGroups = groups.filter((g) => g.isRequired).length;
  const visibleGroups = groups.filter((g) => g.isVisible).length;

  const handleSelectGroup = (group: OptionGroup) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      selectionType: group.selectionType || (group.maxSelection === 1 ? 'single' : 'multi'),
      isRequired: group.isRequired,
      minSelection: group.minSelection,
      maxSelection: group.maxSelection,
      displayOrder: group.displayOrder,
      isVisible: group.isVisible,
      items: group.items || [],
      optionIds: group.optionIds || [],
    });
    setIsEditing(false);
    setShowItemSelector(false);
    setEditingItemId(null);
  };

  const handleNewGroup = () => {
    setSelectedGroup(null);
    setFormData({
      name: '',
      selectionType: 'single',
      isRequired: false,
      minSelection: 0,
      maxSelection: 1,
      displayOrder: groups.length + 1,
      isVisible: true,
      items: [],
      optionIds: [],
    });
    setIsEditing(true);
    setShowItemSelector(false);
    setEditingItemId(null);
  };

  const handleSave = () => {
    const nameText = formData.name.replace(/<br\s*\/?>/g, '').trim();
    if (!nameText) {
      showAlert('입력 오류', '그룹명을 입력해주세요.');
      return;
    }
    if (nameText.length > 50) {
      showAlert('입력 오류', '그룹명은 50자 이내로 입력해주세요.');
      return;
    }

    if (formData.minSelection > formData.maxSelection) {
      showAlert('입력 오류', '최소 선택 수량은 최대 선택 수량보다 클 수 없습니다.');
      return;
    }

    if (formData.isRequired && formData.minSelection < 1) {
      showAlert('입력 오류', '필수 그룹은 최소 선택 수량이 1 이상이어야 합니다.');
      return;
    }

    // 다수 선택 시 개별 옵션 수량이 그룹 최대수량을 초과하는지 검증
    if (formData.selectionType === 'multi') {
      const overItems = formData.items.filter((it) => it.maxQuantity > formData.maxSelection);
      if (overItems.length > 0) {
        showAlert('입력 오류', `개별 옵션의 최대 구매수량은 그룹 최대 선택수량(${formData.maxSelection})을 초과할 수 없습니다.`);
        return;
      }
    }

    const isNewGroup = !selectedGroup;
    const submitData: OptionGroupFormData = {
      name: formData.name,
      selectionType: formData.selectionType,
      isRequired: formData.isRequired,
      minSelection: formData.minSelection,
      maxSelection: formData.maxSelection,
      displayOrder: formData.displayOrder,
      isVisible: formData.isVisible,
      items: formData.items,
      optionIds: formData.items
        .filter((item) => item.type === 'option')
        .map((item) => item.referenceId),
    };

    const onSuccess = () => {
      setIsEditing(false);
      setSelectedGroup(null);
      setShowItemSelector(false);
      setEditingItemId(null);
      showSuccess(
        isNewGroup ? '등록 완료' : '수정 완료',
        isNewGroup
          ? `"${formData.name}" 옵션 그룹이 등록되었습니다.`
          : `"${formData.name}" 옵션 그룹이 수정되었습니다.`
      );
    };

    if (selectedGroup) {
      updateMutation.mutate({ id: selectedGroup.id, data: submitData }, { onSuccess });
    } else {
      createMutation.mutate(submitData, { onSuccess });
    }
  };

  // 아이템 추가 핸들러 (옵션 또는 상품)
  const handleAddItem = (referenceId: string, type: 'option' | 'product') => {
    const isAlreadyAdded = formData.items.some(
      (item) => item.referenceId === referenceId && item.type === type
    );
    if (isAlreadyAdded) return;

    const newItem: OptionGroupItem = {
      id: `item-${Date.now()}`,
      type,
      referenceId,
      priceType: 'override',
      overridePrice: 0,
      maxQuantity: formData.selectionType === 'multi' ? 10 : 1,
      displayOrder: formData.items.length + 1,
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem],
    });

    // 상품 추가 시 가격 설정 패널 자동 열기
    if (type === 'product') {
      setEditingItemId(newItem.id);
    }
  };

  // 아이템 삭제 핸들러
  const handleRemoveItem = (itemId: string) => {
    setFormData({
      ...formData,
      items: formData.items.filter((item) => item.id !== itemId),
    });
    if (editingItemId === itemId) {
      setEditingItemId(null);
    }
  };

  // 아이템 가격 설정 변경
  const handleUpdateItemPrice = (itemId: string, overridePrice: number) => {
    setFormData({
      ...formData,
      items: formData.items.map((item) =>
        item.id === itemId
          ? { ...item, priceType: 'override' as const, overridePrice }
          : item
      ),
    });
  };

  // 옵션 ID로 옵션 정보 찾기
  const getOptionById = (optionId: string) => {
    return availableOptions.find((opt) => opt.id === optionId);
  };

  // 상품 ID로 상품 정보 찾기
  const getProductById = (productId: string) => {
    return availableProducts.find((prod) => prod.id === productId);
  };

  // 아이템의 이름과 가격 정보 가져오기
  const getItemInfo = (item: OptionGroupItem) => {
    if (item.type === 'option') {
      const option = getOptionById(item.referenceId);
      return {
        name: option?.name || '알 수 없음',
        originalPrice: option?.price || 0,
        posCode: option?.posCode || '',
      };
    } else {
      const product = getProductById(item.referenceId);
      return {
        name: product?.name || '알 수 없음',
        originalPrice: product?.price || 0,
        posCode: product?.posCode || '',
      };
    }
  };

  // 계산된 가격 텍스트 가져오기
  const getCalculatedPriceText = (item: OptionGroupItem) => {
    return item.overridePrice > 0 ? `+${formatCurrency(item.overridePrice)}원` : '무료';
  };

  // useMemo로 O(n²) → O(n) 최적화
  const addedItemIds = React.useMemo(() => {
    const optionIds = new Set<string>();
    const productIds = new Set<string>();
    for (const item of formData.items) {
      if (item.type === 'option') optionIds.add(item.referenceId);
      else if (item.type === 'product') productIds.add(item.referenceId);
    }
    return { optionIds, productIds };
  }, [formData.items]);

  const lowerSearchQuery = itemSearchQuery.toLowerCase();

  const selectableOptions = React.useMemo(
    () => availableOptions.filter(
      (opt) => !addedItemIds.optionIds.has(opt.id) && opt.name.toLowerCase().includes(lowerSearchQuery)
    ),
    [availableOptions, addedItemIds.optionIds, lowerSearchQuery]
  );

  const selectableProducts = React.useMemo(
    () => availableProducts.filter(
      (prod) => !addedItemIds.productIds.has(prod.id) && prod.name.toLowerCase().includes(lowerSearchQuery)
    ),
    [availableProducts, addedItemIds.productIds, lowerSearchQuery]
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const handleDelete = (group: OptionGroup) => {
    showDeleteConfirm(group);
  };

  const handleRequiredChange = (isRequired: boolean) => {
    setFormData({
      ...formData,
      isRequired,
      minSelection: isRequired ? Math.max(1, formData.minSelection) : formData.minSelection,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-txt-muted">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">옵션 그룹</h1>
          <p className="text-sm text-txt-muted mt-1">
            옵션 및 상품을 성격에 맞게 묶은 바구니를 관리합니다.
          </p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">전체 그룹</p>
            <p className="text-2xl font-bold text-primary">{totalGroups}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">필수 그룹</p>
            <p className="text-2xl font-bold text-warning">{requiredGroups}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">선택 그룹</p>
            <p className="text-2xl font-bold text-secondary">{totalGroups - requiredGroups}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">노출 중</p>
            <p className="text-2xl font-bold text-success">{visibleGroups}</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 그룹 목록 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-txt-main">그룹 목록</h2>
            <div className="flex gap-2 items-center">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="그룹명 검색"
                className="w-48"
              />
              <Button variant="primary" size="sm" onClick={handleNewGroup}>
                <PlusOutlined />
                그룹 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto px-1 -mx-1">
              {filteredGroups.length > 0 ? (
                filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`group flex items-center gap-4 p-4 rounded-lg hover:bg-bg-hover cursor-pointer transition-colors ${selectedGroup?.id === group.id ? 'bg-bg-hover border-2 border-primary/20' : 'border-2 border-transparent'
                      }`}
                    onClick={() => handleSelectGroup(group)}
                  >
                    {/* 아이콘 */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${group.isRequired ? 'bg-warning-light' : 'bg-secondary-light'
                        }`}
                    >
                      {group.isRequired ? (
                        <CheckCircleOutlined
                          style={{ fontSize: 20 }}
                          className="text-warning"
                        />
                      ) : (
                        <MinusCircleOutlined
                          style={{ fontSize: 20 }}
                          className="text-secondary"
                        />
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-txt-main truncate max-w-[120px]">{group.name}</span>
                        <Badge variant={group.isRequired ? 'warning' : 'secondary'} className="flex-shrink-0">
                          {group.isRequired ? '필수' : '선택'}
                        </Badge>
                        <Badge variant={(group.selectionType || (group.maxSelection === 1 ? 'single' : 'multi')) === 'single' ? 'info' : 'default'} className="flex-shrink-0">
                          {(group.selectionType || (group.maxSelection === 1 ? 'single' : 'multi')) === 'single' ? '단일' : '다수'}
                        </Badge>
                        <Badge variant={group.isVisible ? 'success' : 'secondary'} className="flex-shrink-0">
                          {group.isVisible ? '노출' : '숨김'}
                        </Badge>
                      </div>
                      <div className="text-sm text-txt-muted mt-1 truncate">
                        {(group.selectionType || (group.maxSelection === 1 ? 'single' : 'multi')) === 'single'
                          ? '1개 선택'
                          : `${group.minSelection}~${group.maxSelection}개`
                        } | 아이템{' '}
                        {(group.items?.length || group.optionIds?.length || 0)}개
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(group);
                      }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-critical hover:text-critical hover:bg-critical-light"
                    >
                      <DeleteOutlined style={{ fontSize: 16 }} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-txt-muted">
                  <p>
                    {searchQuery ? '검색 결과가 없습니다.' : '등록된 옵션 그룹이 없습니다.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 그룹 상세/등록 */}
        <Card>
          {!selectedGroup && !isEditing ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-hover">
                  <PlusOutlined className="text-4xl text-txt-muted" />
                </div>
                <h3 className="text-lg font-semibold text-txt-main mb-2">
                  옵션 그룹을 선택하거나 등록하세요
                </h3>
                <p className="text-sm text-txt-muted mb-6">
                  좌측 목록에서 그룹을 선택하거나<br />
                  "그룹 추가" 버튼을 클릭하여 새 옵션 그룹을 추가하세요
                </p>
                <Button variant="primary" onClick={handleNewGroup}>
                  <PlusOutlined />
                  그룹 추가
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <h2 className="text-lg font-semibold text-txt-main">
                  {selectedGroup && !isEditing
                    ? '그룹 상세'
                    : selectedGroup && isEditing
                      ? '그룹 수정'
                      : '그룹 등록'}
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 그룹명 */}
                <div className="space-y-2">
                  <Label required>그룹명</Label>
                  <Textarea
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.replace(/<br\s*\/?>/g, '').length <= 50) {
                        setFormData({ ...formData, name: val });
                      }
                    }}
                    placeholder="예: 도우 변경, 소스 추가 (<br> 태그로 줄바꿈 가능)"
                    rows={2}
                    maxLength={200}
                    disabled={!isEditing && !!selectedGroup}
                  />
                  <p className="text-xs text-txt-muted">
                    {formData.name.replace(/<br\s*\/?>/g, '').length}/50자 · &lt;br&gt; 태그로 줄바꿈 가능
                  </p>
                </div>

                {/* 필수/선택 여부 */}
                <div className="flex items-center gap-3 p-4 bg-bg-hover rounded-lg">
                  <Switch
                    checked={formData.isRequired}
                    onCheckedChange={handleRequiredChange}
                    disabled={!isEditing && !!selectedGroup}
                  />
                  <div className="flex-1">
                    <Label>필수 선택</Label>
                    <p className="text-sm text-txt-muted">
                      {formData.isRequired
                        ? '고객이 반드시 선택해야 합니다'
                        : '고객이 선택하지 않아도 됩니다'}
                    </p>
                  </div>
                  <Badge variant={formData.isRequired ? 'warning' : 'secondary'}>
                    {formData.isRequired ? '필수' : '선택'}
                  </Badge>
                </div>

                {/* 선택 타입 (단일/다수) */}
                <div className="space-y-3">
                  <Label required>선택 방식</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['single', 'multi'] as SelectionType[]).map((type) => {
                      const isSelected = formData.selectionType === type;
                      const isDisabled = !isEditing && !!selectedGroup;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            if (isDisabled) return;
                            const isSingle = type === 'single';
                            const newMaxSelection = isSingle ? 1 : Math.max(formData.maxSelection, 2);
                            // 선택 타입 전환 시 아이템 수량 자동 조정
                            const adjustedItems = formData.items.map((it) => ({
                              ...it,
                              maxQuantity: isSingle ? 1 : Math.min(it.maxQuantity, newMaxSelection),
                            }));
                            setFormData({
                              ...formData,
                              selectionType: type,
                              maxSelection: newMaxSelection,
                              minSelection: formData.isRequired
                                ? 1
                                : isSingle ? 0 : formData.minSelection,
                              items: adjustedItems,
                            });
                          }}
                          className={`relative flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                            isSelected
                              ? type === 'single'
                                ? 'border-primary bg-primary/5'
                                : 'border-warning bg-warning/5'
                              : 'border-border hover:border-border-hover'
                          } ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {/* 라디오 인디케이터 */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? type === 'single' ? 'border-primary' : 'border-warning'
                              : 'border-gray-300'
                          }`}>
                            {isSelected && (
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                type === 'single' ? 'bg-primary' : 'bg-warning'
                              }`} />
                            )}
                          </div>
                          <span className={`text-sm font-medium ${
                            isSelected ? 'text-txt-main' : 'text-txt-muted'
                          }`}>
                            {SELECTION_TYPE_LABELS[type]}
                          </span>
                          <span className="text-xs text-txt-muted text-center">
                            {type === 'single' ? '1개만 선택 (예: 사이즈)' : '여러 개 선택 + 수량 (예: 토핑)'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 다수 선택 시 수량 설정 */}
                {formData.selectionType === 'multi' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label required>최소 선택</Label>
                      <Input
                        type="number"
                        min={formData.isRequired ? 1 : 0}
                        max={99}
                        value={formData.minSelection}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 0 && val <= 99) {
                            setFormData({ ...formData, minSelection: val });
                          }
                        }}
                        disabled={!isEditing && !!selectedGroup}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label required>최대 선택</Label>
                      <Input
                        type="number"
                        min={2}
                        max={99}
                        value={formData.maxSelection}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 2 && val <= 99) {
                            // 그룹 최대수량 변경 시 초과하는 아이템 수량 자동 조정
                            const adjustedItems = formData.items.map((it) =>
                              it.maxQuantity > val ? { ...it, maxQuantity: val } : it
                            );
                            setFormData({ ...formData, maxSelection: val, items: adjustedItems });
                          }
                        }}
                        disabled={!isEditing && !!selectedGroup}
                      />
                    </div>
                  </div>
                )}

                {/* 선택 규칙 미리보기 */}
                <div className="p-3 bg-info-light rounded-lg border border-info/20">
                  <p className="text-sm text-info font-medium">선택 규칙 미리보기</p>
                  <p className="text-sm text-txt-muted mt-1">
                    {formData.isRequired ? '필수 선택 • ' : '선택 사항 • '}
                    {formData.selectionType === 'single'
                      ? '1개만 선택 · 수량 1 고정'
                      : formData.minSelection === formData.maxSelection
                        ? `정확히 ${formData.maxSelection}개 선택 · 개별 최대수량 ≤ ${formData.maxSelection}`
                        : formData.minSelection === 0
                          ? `최대 ${formData.maxSelection}개 선택 가능 · 개별 최대수량 ≤ ${formData.maxSelection}`
                          : `${formData.minSelection}~${formData.maxSelection}개 선택 · 개별 최대수량 ≤ ${formData.maxSelection}`}
                  </p>
                </div>

                {/* 가격 계산 프리뷰 (아이템이 있을 때만) */}
                {formData.items.length > 0 && (
                  <div className="p-3 bg-success-light rounded-lg border border-success/20">
                    <p className="text-sm text-success font-medium mb-2">가격 계산 프리뷰</p>
                    <div className="space-y-1">
                      {formData.items.slice(0, 5).map((item) => {
                        const info = getItemInfo(item);
                        return (
                          <div key={item.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={item.type === 'option' ? 'text-primary' : 'text-warning'}>
                                {item.type === 'option' ? '●' : '■'}
                              </span>
                              <span className="text-txt-muted">{info.name}</span>
                            </div>
                            <span className="font-medium text-txt-main">
                              {getCalculatedPriceText(item)}
                            </span>
                          </div>
                        );
                      })}
                      {formData.items.length > 5 && (
                        <p className="text-xs text-txt-muted text-center mt-2">
                          ...외 {formData.items.length - 5}개 아이템
                        </p>
                      )}
                    </div>
                    {formData.items.some((item) => item.type === 'product') && (
                      <div className="mt-2 pt-2 border-t border-success/20">
                        <p className="text-xs text-txt-muted">
                          상품을 옵션으로 사용 중입니다. POS 연동 시 상품 코드가 전송됩니다.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 연결된 아이템 (옵션/상품) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>연결된 아이템</Label>
                    {(isEditing || !selectedGroup) && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowItemSelector(!showItemSelector)}
                      >
                        <PlusOutlined style={{ fontSize: 14, marginRight: 4 }} />
                        아이템 추가
                      </Button>
                    )}
                  </div>

                  {/* 아이템 선택기 */}
                  {showItemSelector && (isEditing || !selectedGroup) && (
                    <div className="border border-border rounded-lg p-3 bg-bg-hover">
                      {/* 옵션/상품 탭 */}
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => setAddItemMode('option')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${addItemMode === 'option'
                            ? 'bg-primary text-white'
                            : 'bg-bg-main text-txt-muted hover:text-txt-main'
                            }`}
                        >
                          <TagsOutlined style={{ fontSize: 14 }} />
                          옵션
                        </button>
                        <button
                          onClick={() => setAddItemMode('product')}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${addItemMode === 'product'
                            ? 'bg-primary text-white'
                            : 'bg-bg-main text-txt-muted hover:text-txt-main'
                            }`}
                        >
                          <ShoppingOutlined style={{ fontSize: 14 }} />
                          상품
                        </button>
                      </div>

                      {/* 검색 */}
                      <div className="mb-3">
                        <SearchInput
                          value={itemSearchQuery}
                          onChange={setItemSearchQuery}
                          placeholder={addItemMode === 'option' ? '옵션 검색...' : '상품 검색...'}
                          className="w-full"
                        />
                      </div>

                      {/* 옵션 목록 */}
                      {addItemMode === 'option' && (
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {selectableOptions.length > 0 ? (
                            selectableOptions.map((option) => (
                              <button
                                key={option.id}
                                onClick={() => handleAddItem(option.id, 'option')}
                                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-bg-main transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <TagsOutlined style={{ fontSize: 14 }} className="text-txt-muted" />
                                  <span className="text-sm text-txt-main">{option.name}</span>
                                </div>
                                <span className="text-sm text-primary">
                                  {option.price > 0 ? `+${formatCurrency(option.price)}원` : '무료'}
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="text-center text-sm text-txt-muted py-2">
                              {itemSearchQuery ? '검색 결과가 없습니다' : '추가할 수 있는 옵션이 없습니다'}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 상품 목록 */}
                      {addItemMode === 'product' && (
                        <div className="max-h-40 overflow-y-auto space-y-1">
                          {selectableProducts.length > 0 ? (
                            selectableProducts.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => handleAddItem(product.id, 'product')}
                                className="w-full flex items-center justify-between p-2 rounded-md hover:bg-bg-main transition-colors text-left"
                              >
                                <div className="flex items-center gap-2">
                                  <ShoppingOutlined style={{ fontSize: 14 }} className="text-warning" />
                                  <span className="text-sm text-txt-main">{product.name}</span>
                                </div>
                                <span className="text-sm text-txt-muted">
                                  {formatCurrency(product.price)}원
                                </span>
                              </button>
                            ))
                          ) : (
                            <p className="text-center text-sm text-txt-muted py-2">
                              {itemSearchQuery ? '검색 결과가 없습니다' : '추가할 수 있는 상품이 없습니다'}
                            </p>
                          )}
                        </div>
                      )}

                      {/* 상품 사용 안내 */}
                      {addItemMode === 'product' && (
                        <div className="mt-3 p-2 bg-warning-light rounded-md">
                          <p className="text-xs text-warning">
                            상품을 옵션으로 사용 시 추가 금액을 설정할 수 있습니다.
                            추가 후 가격 설정 버튼을 클릭하여 금액을 확인하세요.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 연결된 아이템 목록 */}
                  {formData.items.length > 0 ? (
                    <div className="space-y-2">
                      {formData.items.map((item) => {
                        const info = getItemInfo(item);
                        const isEditingPrice = editingItemId === item.id;

                        return (
                          <div
                            key={item.id}
                            className="p-3 bg-bg-hover rounded-lg"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {item.type === 'option' ? (
                                  <TagsOutlined style={{ fontSize: 16 }} className="text-primary" />
                                ) : (
                                  <ShoppingOutlined style={{ fontSize: 16 }} className="text-warning" />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-medium text-txt-main">{info.name}</p>
                                    <Badge variant={item.type === 'option' ? 'info' : 'warning'} className="text-[10px]">
                                      {item.type === 'option' ? '옵션' : '상품'}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-txt-muted">
                                    POS: {info.posCode} | 원가: {formatCurrency(info.originalPrice)}원
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-primary">
                                  {getCalculatedPriceText(item)}
                                </span>
                                {/* 아이템별 최대 구매수량 */}
                                <div className="flex items-center gap-1 bg-bg-main rounded px-1.5 py-0.5">
                                  <span className="text-[10px] text-txt-muted">최대수량</span>
                                  {formData.selectionType === 'single' ? (
                                    <span className="w-14 h-6 text-xs text-center flex items-center justify-center text-txt-muted">1</span>
                                  ) : (
                                    <Input
                                      type="number"
                                      min={1}
                                      max={formData.maxSelection}
                                      value={item.maxQuantity || 1}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val) && val >= 1 && val <= formData.maxSelection) {
                                          setFormData({
                                            ...formData,
                                            items: formData.items.map((it) =>
                                              it.id === item.id ? { ...it, maxQuantity: val } : it
                                            ),
                                          });
                                        }
                                      }}
                                      className="w-14 h-6 text-xs text-center"
                                      disabled={!isEditing && !!selectedGroup}
                                    />
                                  )}
                                </div>
                                {(isEditing || !selectedGroup) && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingItemId(isEditingPrice ? null : item.id)}
                                      className="hover:bg-bg-main text-txt-muted hover:text-txt-main"
                                      title="가격 설정"
                                    >
                                      <DollarOutlined style={{ fontSize: 14 }} />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveItem(item.id)}
                                      className="hover:bg-critical-light text-critical hover:text-critical"
                                    >
                                      <DeleteOutlined style={{ fontSize: 14 }} />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* 가격 설정 패널 */}
                            {isEditingPrice && (isEditing || !selectedGroup) && (
                              <div className="mt-3 pt-3 border-t border-border space-y-3">
                                <div className="space-y-2">
                                  <Label className="text-xs">추가 금액</Label>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-txt-muted">+</span>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={item.overridePrice}
                                      onChange={(e) =>
                                        handleUpdateItemPrice(item.id, parseInt(e.target.value) || 0)
                                      }
                                      className="h-8 text-sm"
                                    />
                                    <span className="text-sm text-txt-muted">원</span>
                                  </div>
                                  <p className="text-xs text-txt-muted">
                                    0원 입력 시 추가금액 없이 선택 가능
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 border-2 border-dashed border-border rounded-lg text-center">
                      <TagsOutlined style={{ fontSize: 24 }} className="text-txt-muted mb-2" />
                      <p className="text-sm text-txt-muted">연결된 아이템이 없습니다</p>
                      <p className="text-xs text-txt-muted mt-1">
                        위 버튼을 클릭하여 옵션 또는 상품을 추가하세요
                      </p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* 노출 순서 */}
                <div className="space-y-2">
                  <Label>노출 순서</Label>
                  <Input
                    type="number"
                    min={1}
                    max={999}
                    value={formData.displayOrder}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= 999) {
                        setFormData({ ...formData, displayOrder: val });
                      }
                    }}
                    disabled={!isEditing && !!selectedGroup}
                  />
                </div>

                {/* 노출 여부 */}
                <div className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                  <Switch
                    checked={formData.isVisible}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isVisible: checked })
                    }
                    disabled={!isEditing && !!selectedGroup}
                  />
                  <div>
                    <Label>노출 여부</Label>
                    <p className="text-sm text-txt-muted">
                      {formData.isVisible ? '고객에게 노출됩니다' : '고객에게 노출되지 않습니다'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* 버튼 */}
                {isEditing || !selectedGroup ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      className="flex-1"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      <SaveOutlined style={{ fontSize: 16, marginRight: 8 }} />
                      저장
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedGroup(null);
                      }}
                      className="flex-1"
                    >
                      <CloseOutlined style={{ fontSize: 16, marginRight: 8 }} />
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => setIsEditing(true)} className="w-full">
                    <EditOutlined style={{ fontSize: 16, marginRight: 8 }} />
                    수정
                  </Button>
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* 확인/알림 다이얼로그 */}
      <ConfirmDialog
        isOpen={dialog.isOpen}
        onClose={closeDialog}
        onConfirm={handleDialogConfirm}
        title={dialog.title}
        message={dialog.message}
        type={dialog.type}
        showCancel={dialog.showCancel}
        confirmText={deleteTarget ? '삭제' : '확인'}
      />
    </div>
  );
}
