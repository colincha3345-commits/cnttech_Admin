import React from 'react';
import { CheckOutlined } from '@ant-design/icons';

interface Category {
  id: string;
  name: string;
  depth: number;
  children?: Category[];
}

interface CategorySelectorProps {
  categories: Category[];
  mainCategoryId: string;
  subCategoryIds: string[];
  onMainCategoryChange: (categoryId: string) => void;
  onSubCategoryChange: (categoryIds: string[]) => void;
  disabled?: boolean;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  mainCategoryId,
  subCategoryIds,
  onMainCategoryChange,
  onSubCategoryChange,
  disabled = false,
}) => {
  const handleMainCategoryChange = (categoryId: string) => {
    if (disabled) return;
    onMainCategoryChange(categoryId);

    // 메인 카테고리 변경 시 서브 카테고리 초기화
    onSubCategoryChange([]);
  };

  const handleSubCategoryToggle = (categoryId: string) => {
    if (disabled) return;

    const newSubCategories = subCategoryIds.includes(categoryId)
      ? subCategoryIds.filter((id) => id !== categoryId)
      : [...subCategoryIds, categoryId];

    onSubCategoryChange(newSubCategories);
  };

  const getAllSubCategories = (): Category[] => {
    const allSubs: Category[] = [];
    categories.forEach((category) => {
      if (category.children) {
        allSubs.push(...category.children);
      }
    });
    return allSubs;
  };

  return (
    <div className="space-y-6">
      {/* 메인 카테고리 선택 */}
      <div>
        <label className="block text-sm font-semibold text-txt-main mb-3">
          메인 카테고리 <span className="text-critical">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {categories
            .filter((cat) => cat.depth === 1)
            .map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleMainCategoryChange(category.id)}
                disabled={disabled}
                className={`
                  relative px-4 py-3 rounded-lg border-2 text-left
                  transition-all duration-200
                  ${
                    mainCategoryId === category.id
                      ? 'border-primary bg-primary/5 text-txt-main'
                      : 'border-border hover:border-primary/50 text-txt-secondary hover:bg-hover'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{category.name}</span>
                  {mainCategoryId === category.id && (
                    <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                      <CheckOutlined className="text-xs text-white" />
                    </div>
                  )}
                </div>
                {/* 하위 카테고리 개수 표시 */}
                {category.children && category.children.length > 0 && (
                  <p className="text-xs text-txt-muted mt-1">
                    {category.children.length}개 하위 카테고리
                  </p>
                )}
              </button>
            ))}
        </div>
      </div>

      {/* 서브 카테고리 선택 */}
      <div>
        <label className="block text-sm font-semibold text-txt-main mb-3">
          서브 카테고리 <span className="text-txt-muted font-normal">(선택사항)</span>
        </label>

        {getAllSubCategories().length === 0 ? (
          <div className="px-4 py-8 rounded-lg bg-hover text-center">
            <p className="text-sm text-txt-muted">등록된 서브 카테고리가 없습니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {categories
              .filter((cat) => cat.depth === 1 && cat.children && cat.children.length > 0)
              .map((parentCategory) => (
                <div key={parentCategory.id} className="space-y-2">
                  <p className="text-xs font-semibold text-txt-secondary uppercase tracking-wide">
                    {parentCategory.name}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {parentCategory.children!.map((subCategory) => (
                      <label
                        key={subCategory.id}
                        className={`
                          flex items-center gap-3 px-4 py-2.5 rounded-lg border
                          transition-all duration-200
                          ${
                            subCategoryIds.includes(subCategory.id)
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 hover:bg-hover'
                          }
                          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={subCategoryIds.includes(subCategory.id)}
                          onChange={() => handleSubCategoryToggle(subCategory.id)}
                          disabled={disabled}
                          className="sr-only"
                        />
                        <div
                          className={`
                            flex items-center justify-center w-5 h-5 rounded border-2
                            transition-colors duration-200
                            ${
                              subCategoryIds.includes(subCategory.id)
                                ? 'border-primary bg-primary'
                                : 'border-border-strong'
                            }
                          `}
                        >
                          {subCategoryIds.includes(subCategory.id) && (
                            <CheckOutlined className="text-xs text-white" />
                          )}
                        </div>
                        <span className="text-sm text-txt-main flex-1">
                          {subCategory.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* 선택된 서브 카테고리 수 */}
        {subCategoryIds.length > 0 && (
          <p className="text-xs text-txt-muted mt-3">
            {subCategoryIds.length}개 서브 카테고리 선택됨
          </p>
        )}
      </div>
    </div>
  );
};
