import React, { useState } from 'react';
import { CheckOutlined, PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button } from './Button';

interface Category {
  id: string;
  name: string;
  depth: number;
  children?: Category[];
}

export interface CategoryPair {
  id: string; // 고유 ID
  mainCategoryId: string;
  subCategoryIds: string[];
}

interface MultiCategorySelectorProps {
  categories: Category[];
  value: CategoryPair[];
  onChange: (pairs: CategoryPair[]) => void;
  disabled?: boolean;
}

// 중복 에러 메시지 타입
interface DuplicateError {
  pairId: string;
  message: string;
}

export const MultiCategorySelector: React.FC<MultiCategorySelectorProps> = ({
  categories,
  value,
  onChange,
  disabled = false,
}) => {
  const [expandedPairId, setExpandedPairId] = useState<string | null>(
    value.length > 0 ? value[0]?.id ?? null : null
  );
  const [duplicateError, setDuplicateError] = useState<DuplicateError | null>(null);

  // 중복 카테고리 조합 확인
  const checkDuplicate = (
    pairs: CategoryPair[],
    currentPairId: string,
    mainCategoryId: string,
    subCategoryIds: string[]
  ): string | null => {
    for (const pair of pairs) {
      if (pair.id === currentPairId) continue;

      // 같은 메인 카테고리인지 확인
      if (pair.mainCategoryId === mainCategoryId) {
        // 서브 카테고리가 비어있는 경우 (메인만 선택)
        if (subCategoryIds.length === 0 && pair.subCategoryIds.length === 0) {
          return '이미 선택된 카테고리 조합입니다.';
        }

        // 서브 카테고리 중복 확인
        const duplicateSubs = subCategoryIds.filter(subId =>
          pair.subCategoryIds.includes(subId)
        );

        if (duplicateSubs.length > 0) {
          const mainName = categories.find(c => c.id === mainCategoryId)?.name || '';
          const mainCat = categories.find(c => c.id === mainCategoryId);
          const subNames = duplicateSubs.map(subId =>
            mainCat?.children?.find(c => c.id === subId)?.name || ''
          ).filter(Boolean).join(', ');

          return `"${mainName} > ${subNames}" 조합이 이미 선택되어 있습니다.`;
        }
      }
    }
    return null;
  };

  // 에러 메시지 자동 숨김
  const showDuplicateError = (pairId: string, message: string) => {
    setDuplicateError({ pairId, message });
    setTimeout(() => setDuplicateError(null), 3000);
  };

  // 새 카테고리 쌍 추가
  const handleAddPair = () => {
    const newPair: CategoryPair = {
      id: `pair-${Date.now()}`,
      mainCategoryId: '',
      subCategoryIds: [],
    };
    onChange([...value, newPair]);
    setExpandedPairId(newPair.id);
  };

  // 카테고리 쌍 삭제
  const handleRemovePair = (pairId: string) => {
    const newValue = value.filter((pair) => pair.id !== pairId);
    onChange(newValue);

    // 삭제 후 첫 번째 항목 자동 확장
    if (expandedPairId === pairId && newValue.length > 0) {
      setExpandedPairId(newValue[0]?.id ?? null);
    }
  };

  // 메인 카테고리 변경
  const handleMainCategoryChange = (pairId: string, categoryId: string) => {
    // 중복 확인 (서브 카테고리 없이 메인만)
    const duplicateMsg = checkDuplicate(value, pairId, categoryId, []);
    if (duplicateMsg) {
      showDuplicateError(pairId, duplicateMsg);
      return;
    }

    const newValue = value.map((pair) =>
      pair.id === pairId
        ? { ...pair, mainCategoryId: categoryId, subCategoryIds: [] }
        : pair
    );
    onChange(newValue);
    setDuplicateError(null);
  };

  // 서브 카테고리 토글
  const handleSubCategoryToggle = (pairId: string, categoryId: string) => {
    const currentPair = value.find((p) => p.id === pairId);
    if (!currentPair) return;

    const isRemoving = currentPair.subCategoryIds.includes(categoryId);
    const newSubIds = isRemoving
      ? currentPair.subCategoryIds.filter((id) => id !== categoryId)
      : [...currentPair.subCategoryIds, categoryId];

    // 추가하는 경우에만 중복 확인
    if (!isRemoving) {
      const duplicateMsg = checkDuplicate(
        value,
        pairId,
        currentPair.mainCategoryId,
        newSubIds
      );
      if (duplicateMsg) {
        showDuplicateError(pairId, duplicateMsg);
        return;
      }
    }

    const newValue = value.map((pair) => {
      if (pair.id === pairId) {
        return { ...pair, subCategoryIds: newSubIds };
      }
      return pair;
    });
    onChange(newValue);
    setDuplicateError(null);
  };

  // 선택된 메인 카테고리 이름 가져오기
  const getMainCategoryName = (mainCategoryId: string): string => {
    const category = categories.find((cat) => cat.id === mainCategoryId);
    return category?.name || '선택 안됨';
  };

  // 메인 카테고리의 하위 카테고리 가져오기
  const getSubCategories = (mainCategoryId: string): Category[] => {
    const mainCategory = categories.find((cat) => cat.id === mainCategoryId);
    return mainCategory?.children || [];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-txt-main">
          카테고리 선택 <span className="text-critical">*</span>
        </label>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleAddPair}
          disabled={disabled}
        >
          <PlusOutlined />
          카테고리 추가
        </Button>
      </div>

      {value.length === 0 ? (
        <div className="px-4 py-8 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 text-center">
          <p className="text-sm text-gray-500">
            + 버튼을 눌러 카테고리를 추가하세요
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((pair, index) => {
            const isExpanded = expandedPairId === pair.id;
            const mainCategoryName = getMainCategoryName(pair.mainCategoryId);
            const subCategories = getSubCategories(pair.mainCategoryId);

            return (
              <div
                key={pair.id}
                className="border-2 border-gray-200 rounded-xl overflow-hidden transition-all"
              >
                {/* 헤더 */}
                <div
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() =>
                    setExpandedPairId(isExpanded ? null : pair.id)
                  }
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {mainCategoryName}
                      </p>
                      {pair.subCategoryIds.length > 0 && (
                        <p className="text-xs text-gray-500">
                          서브 {pair.subCategoryIds.length}개 선택
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePair(pair.id);
                      }}
                      disabled={disabled}
                      className="p-2 text-critical hover:bg-critical/10 rounded-lg transition-colors"
                      title="삭제"
                    >
                      <DeleteOutlined className="text-sm" />
                    </button>
                    <span
                      className={`text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </div>
                </div>

                {/* 내용 */}
                {isExpanded && (
                  <div className="px-4 py-4 space-y-6 bg-white">
                    {/* 중복 에러 메시지 */}
                    {duplicateError?.pairId === pair.id && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-critical/10 border border-critical/30 rounded-lg animate-fadeIn">
                        <ExclamationCircleOutlined className="text-critical" />
                        <span className="text-sm text-critical font-medium">
                          {duplicateError.message}
                        </span>
                      </div>
                    )}

                    {/* 메인 카테고리 선택 */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        1차 카테고리 (메인)
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {categories
                          .filter((cat) => cat.depth === 1)
                          .map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() =>
                                handleMainCategoryChange(pair.id, category.id)
                              }
                              disabled={disabled}
                              className={`
                                px-3 py-2 rounded-lg border text-left text-sm
                                transition-all duration-200
                                ${
                                  pair.mainCategoryId === category.id
                                    ? 'border-primary bg-primary/10 text-gray-800 font-medium'
                                    : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <span>{category.name}</span>
                                {pair.mainCategoryId === category.id && (
                                  <CheckOutlined className="text-xs text-primary" />
                                )}
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>

                    {/* 서브 카테고리 선택 */}
                    {pair.mainCategoryId && subCategories.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-2">
                          2차 카테고리 (서브) - 선택사항
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {subCategories.map((subCategory) => (
                            <label
                              key={subCategory.id}
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg border text-sm
                                transition-all duration-200
                                ${
                                  pair.subCategoryIds.includes(subCategory.id)
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }
                                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                              `}
                            >
                              <input
                                type="checkbox"
                                checked={pair.subCategoryIds.includes(
                                  subCategory.id
                                )}
                                onChange={() =>
                                  handleSubCategoryToggle(
                                    pair.id,
                                    subCategory.id
                                  )
                                }
                                disabled={disabled}
                                className="sr-only"
                              />
                              <div
                                className={`
                                  flex items-center justify-center w-4 h-4 rounded border
                                  transition-colors duration-200
                                  ${
                                    pair.subCategoryIds.includes(subCategory.id)
                                      ? 'border-primary bg-primary'
                                      : 'border-gray-300'
                                  }
                                `}
                              >
                                {pair.subCategoryIds.includes(subCategory.id) && (
                                  <CheckOutlined className="text-xs text-white" />
                                )}
                              </div>
                              <span className="text-gray-700 flex-1">
                                {subCategory.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {pair.mainCategoryId && subCategories.length === 0 && (
                      <div className="px-3 py-4 bg-gray-50 rounded-lg text-center">
                        <p className="text-xs text-gray-500">
                          이 카테고리에는 서브 카테고리가 없습니다
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 안내 메시지 */}
      {value.length > 0 && (
        <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-700">
            💡 동일한 메인 카테고리에 다른 서브 카테고리를 선택할 수 있습니다. 단, 동일한 조합은 중복 선택할 수 없습니다.
          </p>
        </div>
      )}
    </div>
  );
};
