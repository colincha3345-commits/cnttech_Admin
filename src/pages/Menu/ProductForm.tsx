import {
  CardHeader,
  CardContent,
  Button,
  Input,
  Label,
  Switch,
  Textarea,
  Select,
  ImageUpload,
  MultiImageUpload,
  StoreSelector,
  OptionGroupSelector,
  SalesPeriodPicker,
} from '@/components/ui';
import {
  DeleteOutlined,
  CheckOutlined,
} from '@ant-design/icons';
import { PlusOutlined as PlusIcon, MinusOutlined } from '@ant-design/icons';

import type { Product, ProductFormData, ProductStatus, CategoryPair, NutritionBySize, NutritionInfo } from '@/types/product';
import { POS_COLOR_PALETTE, CHANNEL_LABELS, CHANNEL_STATUS_LABELS, DEFAULT_CHANNELS } from '@/types/product';
import type { ProductChannels } from '@/types/product';
import type { StoreSummary } from '@/types/store';
import type { OptionGroup } from '@/types/product';
import type { IconBadge } from '@/types/design';
import { MOCK_CATEGORIES } from '@/constants';

interface ProductFormProps {
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
  selectedProduct: Product | null;
  activeTab: 'basic' | 'options' | 'details';
  onTabChange: (tab: 'basic' | 'options' | 'details') => void;
  onImageFileChange: (file: File | null) => void;
  onDelete: () => void;
  stores: StoreSummary[];
  optionGroups: OptionGroup[];
  activeBadges: IconBadge[];
}

const getDefaultNutrition = (): NutritionInfo => ({
  calories: 0,
  sodium: 0,
  carbs: 0,
  sugar: 0,
  fat: 0,
  protein: 0,
  servingSize: '',
});

export function ProductForm({
  formData,
  onFormDataChange,
  selectedProduct,
  activeTab,
  onTabChange,
  onImageFileChange,
  onDelete,
  stores,
  optionGroups,
  activeBadges,
}: ProductFormProps) {
  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-txt-main">
            {selectedProduct ? '메뉴 수정' : '메뉴 등록'}
          </h2>
          {selectedProduct && (
            <Button variant="danger" size="sm" onClick={onDelete}>
              <DeleteOutlined />
              삭제
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* 탭 메뉴 */}
        <div className="flex gap-2 mb-6 border-b border-border">
          {[
            { key: 'basic' as const, label: '기본 정보' },
            { key: 'options' as const, label: '옵션 설정' },
            { key: 'details' as const, label: '상세 정보' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => onTabChange(tab.key)}
              className={`
                    px-4 py-2 text-sm font-medium transition-colors
                    border-b-2 -mb-px
                    ${activeTab === tab.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-txt-muted hover:text-txt-main'
                    }
                  `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="space-y-6">
          {activeTab === 'basic' && (
            <BasicTab
              formData={formData}
              onFormDataChange={onFormDataChange}
              onImageFileChange={onImageFileChange}
              stores={stores}
              activeBadges={activeBadges}
            />
          )}

          {activeTab === 'options' && (
            <OptionGroupSelector
              optionGroups={optionGroups}
              selectedGroupIds={formData.optionGroupIds}
              onChange={(groupIds) => onFormDataChange({ ...formData, optionGroupIds: groupIds })}
            />
          )}

          {activeTab === 'details' && (
            <DetailsTab formData={formData} onFormDataChange={onFormDataChange} />
          )}
        </div>
      </CardContent>
    </>
  );
}

// 기본 정보 탭
function BasicTab({
  formData,
  onFormDataChange,
  onImageFileChange,
  stores,
  activeBadges,
}: {
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
  onImageFileChange: (file: File | null) => void;
  stores: StoreSummary[];
  activeBadges: IconBadge[];
}) {
  return (
    <>
      {/* 이미지 섹션 */}
      <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-txt-main">이미지</h3>

        {/* 대표 이미지 */}
        <div>
          <Label required>대표 이미지</Label>
          <ImageUpload
            value={formData.imageUrl}
            onChange={(file) => onImageFileChange(file)}
          />
        </div>

        {/* 서브 이미지 */}
        <div>
          <Label>서브 이미지 (최대 5개)</Label>
          <MultiImageUpload
            value={formData.subImageUrls || []}
            onChange={(files) => onFormDataChange({ ...formData, subImageFiles: files })}
            maxFiles={5}
          />
        </div>
      </div>

      {/* 메뉴명 */}
      <div className="space-y-2">
        <Label htmlFor="name" required>메뉴명</Label>
        <Textarea
          id="name"
          value={formData.name}
          onChange={(e) => {
            const val = e.target.value;
            if (val.replace(/<br\s*\/?>/g, '').length <= 50) {
              onFormDataChange({ ...formData, name: val });
            }
          }}
          placeholder="예: 뿌링클 (<br> 태그로 줄바꿈 가능)"
          rows={2}
          maxLength={200}
        />
        <p className="text-xs text-txt-muted">
          {formData.name.replace(/<br\s*\/?>/g, '').length}/50자 · &lt;br&gt; 태그로 줄바꿈 가능
        </p>
      </div>

      {/* POS 표시명 */}
      <div className="space-y-2">
        <Label htmlFor="posDisplayName">POS 표시명</Label>
        <Input
          id="posDisplayName"
          value={formData.posDisplayName || ''}
          onChange={(e) => onFormDataChange({ ...formData, posDisplayName: e.target.value })}
          placeholder={formData.name ? `미입력 시 "${formData.name.replace(/<br\s*\/?>/g, ' ')}" 사용` : '미입력 시 메뉴명 사용'}
          maxLength={20}
        />
        <p className="text-xs text-txt-muted">POS 버튼에 표시할 이름 (최대 20자) · 미입력 시 메뉴명 사용</p>
      </div>

      {/* 상품코드 */}
      <div className="space-y-2">
        <Label htmlFor="productCode">상품코드</Label>
        <Input
          id="productCode"
          value={formData.productCode || ''}
          onChange={(e) => onFormDataChange({ ...formData, productCode: e.target.value })}
          placeholder="예: PRD-001"
          maxLength={20}
        />
        <p className="text-xs text-txt-muted">서비스 내 상품 식별 코드 (최대 20자)</p>
      </div>

      {/* 포스 코드 */}
      <div className="space-y-2">
        <Label htmlFor="posCode">포스 코드</Label>
        <Input
          id="posCode"
          value={formData.posCode || ''}
          onChange={(e) => onFormDataChange({ ...formData, posCode: e.target.value })}
          placeholder="예: M001"
          maxLength={20}
        />
        <p className="text-xs text-txt-muted">POS 시스템 연동 식별 코드 (최대 20자)</p>
      </div>

      {/* 가격 */}
      <div className="space-y-2">
        <Label htmlFor="price" required>가격</Label>
        <Input
          id="price"
          type="number"
          value={formData.price}
          onChange={(e) => {
            const val = Number(e.target.value);
            if (val >= 0 && val <= 9999999) {
              onFormDataChange({ ...formData, price: val });
            }
          }}
          min={0}
          max={9999999}
          placeholder="15000"
        />
      </div>

      {/* POS 버튼 색상 */}
      <div className="space-y-2">
        <Label>POS 버튼 색상</Label>
        <div className="flex flex-wrap gap-2">
          {POS_COLOR_PALETTE.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onFormDataChange({ ...formData, posColor: formData.posColor === color ? '' : color })}
              className={`
                                w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                                ${formData.posColor === color
                  ? 'border-primary ring-2 ring-primary/30 scale-110'
                  : 'border-border hover:border-primary/50'
                }
                                ${color === '#FFFFFF' ? 'bg-white' : ''}
                              `}
              style={{ backgroundColor: color }}
            >
              {formData.posColor === color && (
                <CheckOutlined className={`text-xs ${color === '#FFFFFF' || color === '#FADB14' ? 'text-gray-800' : 'text-white'}`} />
              )}
            </button>
          ))}
        </div>
        {formData.posColor && (
          <p className="text-xs text-txt-muted">선택: {formData.posColor}</p>
        )}
      </div>

      {/* 메뉴 설명 */}
      <div className="space-y-2">
        <Label htmlFor="description" required>메뉴 설명</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
          placeholder="메뉴에 대한 설명을 입력하세요"
          rows={3}
          maxLength={500}
        />
        <p className="text-xs text-txt-muted">{formData.description.length}/500자</p>
      </div>

      {/* 아이콘뱃지 설정 */}
      <div className="space-y-2">
        <Label>아이콘뱃지</Label>
        {activeBadges.length === 0 ? (
          <p className="text-xs text-txt-muted">등록된 뱃지가 없습니다. 디자인관리 &gt; 아이콘뱃지관리에서 추가하세요.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {activeBadges.map((badge) => {
              const isSelected = formData.badgeIds.includes(badge.id);
              return (
                <button
                  key={badge.id}
                  type="button"
                  onClick={() => {
                    onFormDataChange({
                      ...formData,
                      badgeIds: isSelected
                        ? formData.badgeIds.filter((id) => id !== badge.id)
                        : [...formData.badgeIds, badge.id],
                    });
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-all ${isSelected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-bg-card text-txt-muted hover:border-primary/50'
                    }`}
                >
                  {badge.displayType === 'text' ? (
                    <span
                      className="text-[10px] font-bold px-1 py-0.5 rounded"
                      style={{ color: badge.textColor, backgroundColor: badge.bgColor }}
                    >
                      {badge.text}
                    </span>
                  ) : (
                    <img src={badge.imageUrl} alt={badge.name} className="w-4 h-4 object-contain" />
                  )}
                  <span>{badge.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 카테고리 설정 */}
      <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-txt-main">카테고리 설정</h3>

        {formData.categoryPairs.map((pair, index) => {
          const subCategories = MOCK_CATEGORIES.find(
            (cat) => cat.id === pair.mainCategoryId
          )?.children || [];

          return (
            <div key={pair.id} className="flex gap-3 items-end">
              {/* 1차 카테고리 */}
              <div className="flex-1">
                {index === 0 && (
                  <Label className="text-xs text-txt-muted mb-1">1차 카테고리</Label>
                )}
                <Select
                  value={pair.mainCategoryId}
                  onChange={(e) => {
                    const newPairs = formData.categoryPairs.map((p) =>
                      p.id === pair.id
                        ? { ...p, mainCategoryId: e.target.value, subCategoryId: '' }
                        : p
                    );
                    onFormDataChange({
                      ...formData,
                      categoryPairs: newPairs,
                      mainCategoryId: newPairs[0]?.mainCategoryId || '',
                    });
                  }}
                >
                  <option value="">1차 카테고리 선택</option>
                  {MOCK_CATEGORIES
                    .filter((cat) => cat.depth === 1)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </Select>
              </div>

              {/* 2차 카테고리 */}
              <div className="flex-1">
                {index === 0 && (
                  <Label className="text-xs text-txt-muted mb-1">2차 카테고리</Label>
                )}
                <Select
                  value={pair.subCategoryId}
                  onChange={(e) => {
                    const newPairs = formData.categoryPairs.map((p) =>
                      p.id === pair.id
                        ? { ...p, subCategoryId: e.target.value }
                        : p
                    );
                    onFormDataChange({
                      ...formData,
                      categoryPairs: newPairs,
                      subCategoryIds: newPairs.map((p) => p.subCategoryId).filter(Boolean),
                    });
                  }}
                  disabled={!pair.mainCategoryId || subCategories.length === 0}
                >
                  <option value="">2차 카테고리 선택</option>
                  {subCategories.map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* 삭제/추가 버튼 */}
              <div className="flex gap-1">
                {formData.categoryPairs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newPairs = formData.categoryPairs.filter((p) => p.id !== pair.id);
                      onFormDataChange({ ...formData, categoryPairs: newPairs });
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded border border-border hover:bg-critical/10 hover:border-critical transition-colors"
                    title="삭제"
                  >
                    <MinusOutlined className="text-xs text-txt-muted" />
                  </button>
                )}
                {index === formData.categoryPairs.length - 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      const newPair: CategoryPair = {
                        id: `pair-${Date.now()}`,
                        mainCategoryId: '',
                        subCategoryId: '',
                      };
                      onFormDataChange({
                        ...formData,
                        categoryPairs: [...formData.categoryPairs, newPair],
                      });
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded border border-border hover:bg-primary/10 hover:border-primary transition-colors"
                    title="추가"
                  >
                    <PlusIcon className="text-xs text-txt-muted" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 판매 설정 */}
      <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-txt-main">판매 설정</h3>
        <p className="text-xs text-txt-muted">채널별로 노출 여부와 판매상태를 설정합니다</p>

        {(Object.keys(CHANNEL_LABELS) as (keyof ProductChannels)[]).map((key) => {
          const ch = formData.channels || DEFAULT_CHANNELS;
          const value = ch[key];
          const isEnabled = value !== false;
          return (
            <div key={key} className="flex items-center gap-3">
              <Switch
                checked={isEnabled}
                onCheckedChange={(checked) => onFormDataChange({
                  ...formData,
                  channels: { ...ch, [key]: checked ? 'active' : false },
                })}
              />
              <Label className="w-20 flex-shrink-0">{CHANNEL_LABELS[key]}</Label>
              {isEnabled && (
                <Select
                  value={value as string}
                  onChange={(e) => onFormDataChange({
                    ...formData,
                    channels: { ...ch, [key]: e.target.value as ProductStatus },
                  })}
                  className="flex-1"
                >
                  {(Object.entries(CHANNEL_STATUS_LABELS) as [ProductStatus, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </Select>
              )}
              {!isEnabled && (
                <span className="text-xs text-txt-muted">비노출</span>
              )}
            </div>
          );
        })}
      </div>

      {/* 판매기간 */}
      <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-txt-main">판매기간 (선택사항)</h3>
        <p className="text-xs text-txt-muted">
          판매 시작일과 종료일을 설정하면 해당 기간 동안만 판매됩니다
        </p>
        <SalesPeriodPicker
          value={{
            startDate: formData.salesStartDate,
            endDate: formData.salesEndDate,
          }}
          onChange={(period) =>
            onFormDataChange({
              ...formData,
              salesStartDate: period.startDate,
              salesEndDate: period.endDate,
            })
          }
        />
      </div>

      {/* 가맹점 적용 */}
      <StoreSelector
        stores={stores}
        selectedStores={formData.storeIds}
        onChange={(ids) => onFormDataChange({ ...formData, storeIds: ids })}
        applyToAll={formData.applyToAll}
        onApplyToAllChange={(value) =>
          onFormDataChange({ ...formData, applyToAll: value })
        }
      />
    </>
  );
}

// 상세 정보 탭
function DetailsTab({
  formData,
  onFormDataChange,
}: {
  formData: ProductFormData;
  onFormDataChange: (data: ProductFormData) => void;
}) {
  return (
    <div className="space-y-6">
      {/* 결제 정책 */}
      <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
        <h3 className="text-sm font-semibold text-txt-main">결제 정책</h3>

        <div className="flex items-center justify-between">
          <Label>쿠폰 사용 허용</Label>
          <Switch
            checked={formData.allowCoupon}
            onCheckedChange={(checked) => onFormDataChange({ ...formData, allowCoupon: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>교환권 사용 허용</Label>
          <Switch
            checked={formData.allowVoucher}
            onCheckedChange={(checked) => onFormDataChange({ ...formData, allowVoucher: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>금액권 사용 허용</Label>
          <Switch
            checked={formData.allowGiftCard}
            onCheckedChange={(checked) =>
              onFormDataChange({ ...formData, allowGiftCard: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>자사할인 허용</Label>
          <Switch
            checked={formData.allowOwnDiscount}
            onCheckedChange={(checked) =>
              onFormDataChange({ ...formData, allowOwnDiscount: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>제휴할인 허용</Label>
          <Switch
            checked={formData.allowPartnerDiscount}
            onCheckedChange={(checked) =>
              onFormDataChange({ ...formData, allowPartnerDiscount: checked })
            }
          />
        </div>
      </div>

      {/* 영양 정보 */}
      <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-txt-main">영양 정보</h3>
          <button
            type="button"
            onClick={() => {
              const newSize: NutritionBySize = {
                id: `nutrition-${Date.now()}`,
                sizeName: '',
                nutrition: getDefaultNutrition(),
              };
              onFormDataChange({
                ...formData,
                nutritionBySize: [...(formData.nutritionBySize || []), newSize],
              });
            }}
            className="text-xs text-primary hover:underline"
          >
            + 사이즈별 영양정보 추가
          </button>
        </div>

        {/* 기본 영양정보 */}
        <NutritionFields
          nutrition={formData.nutrition}
          sizeName={formData.nutrition.sizeName || ''}
          sizeNamePlaceholder="사이즈명 (예: 레귤러)"
          sizeLabel="기본 영양정보"
          onNutritionChange={(nutrition) => onFormDataChange({ ...formData, nutrition })}
          onSizeNameChange={(name) => onFormDataChange({
            ...formData,
            nutrition: { ...formData.nutrition, sizeName: name },
          })}
        />

        {/* 사이즈별 영양정보 */}
        {(formData.nutritionBySize || []).map((sizeNutrition, index) => (
          <div key={sizeNutrition.id} className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Input
                value={sizeNutrition.sizeName}
                onChange={(e) => {
                  const value = e.target.value;
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).map((item, i) =>
                      i === index ? { ...item, sizeName: value } : item
                    ),
                  });
                }}
                placeholder="사이즈명 (예: 라지)"
                className="w-40"
              />
              <span className="text-xs text-txt-muted flex-1">영양정보</span>
              <button
                type="button"
                onClick={() => {
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).filter((_, i) => i !== index),
                  });
                }}
                className="text-xs text-critical hover:underline"
              >
                삭제
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <NutritionInputField
                label="칼로리 (kcal)"
                type="number"
                value={sizeNutrition.nutrition.calories}
                onChange={(val) => {
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).map((item, i) =>
                      i === index ? { ...item, nutrition: { ...item.nutrition, calories: Number(val) } } : item
                    ),
                  });
                }}
              />
              <NutritionInputField
                label="제공량"
                value={sizeNutrition.nutrition.servingSize}
                onChange={(val) => {
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).map((item, i) =>
                      i === index ? { ...item, nutrition: { ...item.nutrition, servingSize: String(val) } } : item
                    ),
                  });
                }}
                placeholder="예: 1.5마리"
              />
              <NutritionInputField label="나트륨 (mg)" type="number" value={sizeNutrition.nutrition.sodium}
                onChange={(val) => {
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).map((item, i) =>
                      i === index ? { ...item, nutrition: { ...item.nutrition, sodium: Number(val) } } : item
                    ),
                  });
                }}
              />
              <NutritionInputField label="탄수화물 (g)" type="number" value={sizeNutrition.nutrition.carbs}
                onChange={(val) => {
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).map((item, i) =>
                      i === index ? { ...item, nutrition: { ...item.nutrition, carbs: Number(val) } } : item
                    ),
                  });
                }}
              />
              <NutritionInputField label="당류 (g)" type="number" value={sizeNutrition.nutrition.sugar}
                onChange={(val) => {
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).map((item, i) =>
                      i === index ? { ...item, nutrition: { ...item.nutrition, sugar: Number(val) } } : item
                    ),
                  });
                }}
              />
              <NutritionInputField label="지방 (g)" type="number" value={sizeNutrition.nutrition.fat}
                onChange={(val) => {
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).map((item, i) =>
                      i === index ? { ...item, nutrition: { ...item.nutrition, fat: Number(val) } } : item
                    ),
                  });
                }}
              />
              <NutritionInputField label="단백질 (g)" type="number" value={sizeNutrition.nutrition.protein}
                onChange={(val) => {
                  onFormDataChange({
                    ...formData,
                    nutritionBySize: (formData.nutritionBySize || []).map((item, i) =>
                      i === index ? { ...item, nutrition: { ...item.nutrition, protein: Number(val) } } : item
                    ),
                  });
                }}
              />
            </div>
          </div>
        ))}

        {/* 안내 메시지 */}
        {(formData.nutritionBySize?.length || 0) > 0 && (
          <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-700">
              사이즈별로 다른 영양정보가 있는 경우 각 사이즈명과 영양정보를 입력하세요
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// 영양정보 입력 필드 (반복 제거)
function NutritionInputField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type?: 'text' | 'number';
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

// 기본 영양정보 필드 세트
function NutritionFields({
  nutrition,
  sizeName,
  sizeNamePlaceholder,
  sizeLabel,
  onNutritionChange,
  onSizeNameChange,
}: {
  nutrition: NutritionInfo;
  sizeName: string;
  sizeNamePlaceholder: string;
  sizeLabel: string;
  onNutritionChange: (nutrition: NutritionInfo) => void;
  onSizeNameChange: (name: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Input
          value={sizeName}
          onChange={(e) => onSizeNameChange(e.target.value)}
          placeholder={sizeNamePlaceholder}
          className="w-40"
        />
        <span className="text-xs text-txt-muted flex-1">{sizeLabel}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <NutritionInputField label="칼로리 (kcal)" type="number" value={nutrition.calories}
          onChange={(val) => onNutritionChange({ ...nutrition, calories: Number(val) })} />
        <NutritionInputField label="제공량" value={nutrition.servingSize}
          onChange={(val) => onNutritionChange({ ...nutrition, servingSize: String(val) })} placeholder="예: 1마리" />
        <NutritionInputField label="나트륨 (mg)" type="number" value={nutrition.sodium}
          onChange={(val) => onNutritionChange({ ...nutrition, sodium: Number(val) })} />
        <NutritionInputField label="탄수화물 (g)" type="number" value={nutrition.carbs}
          onChange={(val) => onNutritionChange({ ...nutrition, carbs: Number(val) })} />
        <NutritionInputField label="당류 (g)" type="number" value={nutrition.sugar}
          onChange={(val) => onNutritionChange({ ...nutrition, sugar: Number(val) })} />
        <NutritionInputField label="지방 (g)" type="number" value={nutrition.fat}
          onChange={(val) => onNutritionChange({ ...nutrition, fat: Number(val) })} />
        <NutritionInputField label="단백질 (g)" type="number" value={nutrition.protein}
          onChange={(val) => onNutritionChange({ ...nutrition, protein: Number(val) })} />
      </div>
    </div>
  );
}
