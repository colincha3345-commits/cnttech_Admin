import { Select } from '@/components/ui';
import type { Category } from '@/constants/categories';

interface CategoryFilterProps {
  categories: Category[];
  selectedMainCategoryId: string | null;
  selectedSubCategoryId: string | null;
  onMainCategoryChange: (categoryId: string | null) => void;
  onSubCategoryChange: (categoryId: string | null) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedMainCategoryId,
  selectedSubCategoryId,
  onMainCategoryChange,
  onSubCategoryChange,
}) => {
  // 메인 카테고리 변경 시 서브 카테고리 초기화
  const handleMainCategoryChange = (categoryId: string) => {
    const value = categoryId === 'all' ? null : categoryId;
    onMainCategoryChange(value);
    onSubCategoryChange(null); // 서브 카테고리 초기화
  };

  const handleSubCategoryChange = (categoryId: string) => {
    const value = categoryId === 'all' ? null : categoryId;
    onSubCategoryChange(value);
  };

  // 선택된 메인 카테고리의 서브 카테고리 목록
  const subCategories = selectedMainCategoryId
    ? categories.find((cat) => cat.id === selectedMainCategoryId)?.children || []
    : [];

  return (
    <div className="flex gap-3">
      {/* 메인 카테고리 드롭다운 */}
      <div className="flex-1">
        <Select
          value={selectedMainCategoryId || 'all'}
          onChange={(e) => handleMainCategoryChange(e.target.value)}
        >
          <option value="all">전체 카테고리</option>
          {categories
            .filter((cat) => cat.depth === 1)
            .map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
        </Select>
      </div>

      {/* 서브 카테고리 드롭다운 (메인 카테고리 선택 시만 표시) */}
      {selectedMainCategoryId && subCategories.length > 0 && (
        <div className="flex-1">
          <Select
            value={selectedSubCategoryId || 'all'}
            onChange={(e) => handleSubCategoryChange(e.target.value)}
          >
            <option value="all">전체 서브 카테고리</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </Select>
        </div>
      )}
    </div>
  );
};
