import { useState } from 'react';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  RightOutlined,
  DownOutlined,
  SaveOutlined,
  CloseOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Label,
  Switch,
  Textarea,
  Select,
  Separator,
  Badge,
} from '@/components/ui';
import { useCategories } from '@/hooks/useCategories';
import type { Category, CategoryFormData } from '@/types/category';

export function Categories() {
  const { categories, loading, createCategory, updateCategory, deleteCategory } = useCategories();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['1', '2']));
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryMode, setCategoryMode] = useState<'1depth' | '2depth'>('1depth');
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    order: 1,
    description: '',
    isVisible: true,
    parentId: '',
    depth: 1,
  });

  const parentCategories = categories.filter((cat) => cat.depth === 1);
  const totalCategories = categories.length;
  const totalSubCategories = categories.reduce((sum, cat) => sum + (cat.children?.length || 0), 0);

  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      order: category.order,
      description: category.description,
      isVisible: category.isVisible,
      parentId: category.parentId || '',
      depth: category.depth,
    });
    setCategoryMode(category.depth === 1 ? '1depth' : '2depth');
    setIsEditing(false);
  };

  const handleNewCategory = (mode: '1depth' | '2depth' = '1depth') => {
    setSelectedCategory(null);
    setCategoryMode(mode);
    setFormData({
      name: '',
      order: mode === '1depth' ? categories.length + 1 : 1,
      description: '',
      isVisible: true,
      parentId: '',
      depth: mode === '1depth' ? 1 : 2,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    const nameText = formData.name.replace(/<br\s*\/?>/g, '').trim();
    if (!nameText) {
      alert('카테고리명을 입력해주세요.');
      return;
    }
    if (nameText.length > 50) {
      alert('카테고리명은 50자 이내로 입력해주세요.');
      return;
    }

    if (selectedCategory) {
      // 수정
      const updated = await updateCategory(selectedCategory.id, formData);
      if (updated) {
        setIsEditing(false);
        setSelectedCategory(null);
      }
    } else {
      // 신규 등록
      const created = await createCategory(formData);
      if (created) {
        setIsEditing(false);
        setSelectedCategory(null);
      }
    }
  };

  const handleDelete = async (category: Category) => {
    if (confirm(`"${category.name}" 카테고리를 삭제하시겠습니까?`)) {
      const isDeleted = await deleteCategory(category.id, category.name);
      if (isDeleted && selectedCategory?.id === category.id) {
        setSelectedCategory(null);
      }
    }
  };

  const renderCategoryTree = (cats: Category[], depth = 0) => {
    return cats.map((category) => (
      <div key={category.id}>
        <div
          className={`group flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-hover cursor-pointer transition-colors ${selectedCategory?.id === category.id ? 'bg-bg-hover ring-2 ring-primary/20' : ''
            }`}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}
          onClick={() => handleSelectCategory(category)}
        >
          {category.children && category.children.length > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(category.id);
              }}
              className="p-1"
            >
              {expandedCategories.has(category.id) ? (
                <DownOutlined style={{ fontSize: 14 }} />
              ) : (
                <RightOutlined style={{ fontSize: 14 }} />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}
          {expandedCategories.has(category.id) ? (
            <FolderOpenOutlined style={{ fontSize: 16 }} className="text-primary" />
          ) : (
            <FolderOutlined style={{ fontSize: 16 }} className="text-primary" />
          )}
          <span className="flex-1 text-sm font-medium">{category.name}</span>
          <Badge variant={category.depth === 1 ? 'default' : 'secondary'}>
            {category.depth === 1 ? '1depth' : '2depth'}
          </Badge>
          <Badge variant={category.isVisible ? 'success' : 'secondary'}>
            {category.isVisible ? '노출' : '숨김'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(category);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-critical hover:text-critical hover:bg-critical-light"
          >
            <DeleteOutlined style={{ fontSize: 14 }} />
          </Button>
        </div>
        {category.children && expandedCategories.has(category.id) && (
          <div>{renderCategoryTree(category.children, depth + 1)}</div>
        )}
      </div>
    ));
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">카테고리 관리</h1>
          <p className="text-sm text-txt-muted mt-1">상품 카테고리를 관리합니다.</p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">전체 카테고리</p>
            <p className="text-2xl font-bold text-primary">{totalCategories}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">하위 카테고리</p>
            <p className="text-2xl font-bold text-primary">{totalSubCategories}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">노출 중</p>
            <p className="text-2xl font-bold text-success">
              {categories.filter((cat) => cat.isVisible).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 카테고리 트리 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-txt-main">카테고리 목록</h2>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => handleNewCategory('2depth')}>
                <PlusOutlined />
                2depth 추가
              </Button>
              <Button variant="primary" size="sm" onClick={() => handleNewCategory('1depth')}>
                <PlusOutlined />
                1depth 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-[600px] overflow-y-auto">
              {categories.length > 0 ? (
                renderCategoryTree(categories)
              ) : (
                <div className="text-center py-12 text-txt-muted">
                  <p>등록된 카테고리가 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 카테고리 상세/등록 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-txt-main">
              {selectedCategory && !isEditing
                ? '카테고리 상세'
                : selectedCategory && isEditing
                  ? '카테고리 수정'
                  : '카테고리 등록'}
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedCategory && !isEditing ? (
              <div className="text-center py-16 text-txt-muted">
                <p>카테고리를 선택하거나 새로 추가해주세요.</p>
              </div>
            ) : (
              <>
                {/* 카테고리 구분 (신규 등록 시) */}
                {!selectedCategory && (
                  <div className="space-y-2">
                    <Label>카테고리 구분</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={categoryMode === '1depth' ? 'primary' : 'secondary'}
                        onClick={() => {
                          setCategoryMode('1depth');
                          setFormData({ ...formData, parentId: '' });
                        }}
                      >
                        1depth
                      </Button>
                      <Button
                        variant={categoryMode === '2depth' ? 'primary' : 'secondary'}
                        onClick={() => setCategoryMode('2depth')}
                      >
                        2depth
                      </Button>
                    </div>
                  </div>
                )}

                {/* 상위 카테고리 선택 (2depth) */}
                {categoryMode === '2depth' && (
                  <div className="space-y-2">
                    <Label required>상위 카테고리</Label>
                    <Select
                      value={formData.parentId}
                      onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                      disabled={!isEditing && !!selectedCategory}
                    >
                      <option value="">선택하세요</option>
                      {parentCategories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label required>카테고리명</Label>
                    <Textarea
                      value={formData.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val.replace(/<br\s*\/?>/g, '').length <= 50) {
                          setFormData({ ...formData, name: val });
                        }
                      }}
                      placeholder="카테고리명 (줄바꿈: <br> 태그 사용 가능)"
                      rows={2}
                      maxLength={200}
                      disabled={!isEditing && !!selectedCategory}
                    />
                    <p className="text-xs text-txt-muted">
                      {formData.name.replace(/<br\s*\/?>/g, '').length}/50자 · &lt;br&gt; 태그로 줄바꿈 가능
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>표시 순서</Label>
                    <Input
                      type="number"
                      value={formData.order}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= 999) {
                          setFormData({ ...formData, order: val });
                        }
                      }}
                      min={1}
                      max={999}
                      disabled={!isEditing && !!selectedCategory}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>카테고리 설명</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="카테고리 설명"
                    rows={3}
                    maxLength={200}
                    disabled={!isEditing && !!selectedCategory}
                  />
                  <p className="text-xs text-txt-muted">{formData.description.length}/200자</p>
                </div>

                <div className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                  <Switch
                    checked={formData.isVisible}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                    disabled={!isEditing && !!selectedCategory}
                  />
                  <div>
                    <Label>노출 여부</Label>
                    <p className="text-sm text-txt-muted">
                      {formData.isVisible ? '고객에게 노출됩니다' : '고객에게 노출되지 않습니다'}
                    </p>
                  </div>
                </div>

                <Separator />

                {isEditing || !selectedCategory ? (
                  <div className="flex gap-3">
                    <Button onClick={handleSave} className="flex-1" disabled={loading}>
                      <SaveOutlined style={{ fontSize: 16, marginRight: 8 }} />
                      저장
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setSelectedCategory(null);
                      }}
                      className="flex-1"
                      disabled={loading}
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
