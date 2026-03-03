import { useState, useRef } from 'react';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  PictureOutlined,
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
  useOptionCategoryList,
  useCreateOptionCategory,
  useUpdateOptionCategory,
  useDeleteOptionCategory,
} from '@/hooks';
import type { OptionCategory, OptionCategoryFormData } from '@/types/product';

// 다이얼로그 상태 타입
interface DialogState {
  isOpen: boolean;
  type: 'confirm' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

export function OptionCategories() {
  // 서버 데이터
  const { data: categoriesData, isLoading } = useOptionCategoryList();
  const options = categoriesData?.data ?? [];
  const createMutation = useCreateOptionCategory();
  const updateMutation = useUpdateOptionCategory();
  const deleteMutation = useDeleteOptionCategory();

  // UI 상태
  const [selectedOption, setSelectedOption] = useState<OptionCategory | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    posCode: '',
    price: '' as unknown as number,
    maxQuantity: '' as unknown as number,
    imageUrl: '',
    isVisible: true,
    displayOrder: '' as unknown as number,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialog, setDialog] = useState<DialogState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showCancel: false,
  });
  const [deleteTarget, setDeleteTarget] = useState<OptionCategory | null>(null);

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
  const showDeleteConfirm = (option: OptionCategory) => {
    setDeleteTarget(option);
    setDialog({
      isOpen: true,
      type: 'warning',
      title: '옵션 삭제',
      message: `"${option.name}" 옵션을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`,
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
          if (selectedOption?.id === deleteTarget.id) {
            setSelectedOption(null);
            setImagePreview(null);
          }
        },
      });
    }
    closeDialog();
  };

  const filteredOptions = options.filter(
    (opt) =>
      opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opt.posCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOptions = options.length;
  const visibleOptions = options.filter((opt) => opt.isVisible).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  const handleSelectOption = (option: OptionCategory) => {
    setSelectedOption(option);
    setFormData({
      name: option.name,
      posCode: option.posCode,
      price: option.price,
      maxQuantity: option.maxQuantity,
      imageUrl: option.imageUrl || '',
      isVisible: option.isVisible,
      displayOrder: option.displayOrder,
    });
    setImagePreview(option.imageUrl || null);
    setIsEditing(false);
  };

  const handleNewOption = () => {
    setSelectedOption(null);
    setFormData({
      name: '',
      posCode: '',
      price: '' as unknown as number,
      maxQuantity: '' as unknown as number,
      imageUrl: '',
      isVisible: true,
      displayOrder: '' as unknown as number,
    });
    setImagePreview(null);
    setIsEditing(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, imageUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, imageUrl: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    const nameText = formData.name.replace(/<br\s*\/?>/g, '').trim();
    if (!nameText) {
      showAlert('입력 오류', '옵션명을 입력해주세요.');
      return;
    }
    if (nameText.length > 50) {
      showAlert('입력 오류', '옵션명은 50자 이내로 입력해주세요.');
      return;
    }
    if (!formData.posCode.trim()) {
      showAlert('입력 오류', '포스코드를 입력해주세요.');
      return;
    }
    if (formData.posCode.trim().length > 20) {
      showAlert('입력 오류', '포스코드는 20자 이내로 입력해주세요.');
      return;
    }
    if (formData.price === '' as unknown as number || formData.price < 0 || formData.price > 9999999) {
      showAlert('입력 오류', '가격은 0~9,999,999 범위로 입력해주세요.');
      return;
    }
    if (formData.maxQuantity === '' as unknown as number || formData.maxQuantity < 1 || formData.maxQuantity > 99) {
      showAlert('입력 오류', '최대 선택 수량은 1~99 범위로 입력해주세요.');
      return;
    }
    if (formData.displayOrder === '' as unknown as number || formData.displayOrder < 1 || formData.displayOrder > 999) {
      showAlert('입력 오류', '표시 순서는 1~999 범위로 입력해주세요.');
      return;
    }

    // 포스코드 중복 확인
    const isDuplicate = options.some(
      (opt) => opt.posCode === formData.posCode && opt.id !== selectedOption?.id
    );
    if (isDuplicate) {
      showAlert('중복 오류', '이미 사용 중인 포스코드입니다.');
      return;
    }

    const isNewOption = !selectedOption;
    const submitData: OptionCategoryFormData = {
      name: formData.name,
      posCode: formData.posCode,
      price: formData.price,
      maxQuantity: formData.maxQuantity,
      imageUrl: formData.imageUrl,
      isVisible: formData.isVisible,
      displayOrder: formData.displayOrder,
    };

    const onSuccess = () => {
      setIsEditing(false);
      setSelectedOption(null);
      setImagePreview(null);
      showSuccess(
        isNewOption ? '등록 완료' : '수정 완료',
        isNewOption
          ? `"${formData.name}" 옵션이 등록되었습니다.`
          : `"${formData.name}" 옵션이 수정되었습니다.`
      );
    };

    if (selectedOption) {
      updateMutation.mutate({ id: selectedOption.id, data: submitData }, { onSuccess });
    } else {
      createMutation.mutate(submitData, { onSuccess });
    }
  };

  const handleDelete = (option: OptionCategory) => {
    showDeleteConfirm(option);
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
          <h1 className="text-2xl font-bold text-txt-main">옵션 카테고리</h1>
          <p className="text-sm text-txt-muted mt-1">옵션 메뉴를 관리합니다.</p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">전체 옵션</p>
            <p className="text-2xl font-bold text-primary">{totalOptions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">노출 중</p>
            <p className="text-2xl font-bold text-success">{visibleOptions}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">숨김</p>
            <p className="text-2xl font-bold text-txt-muted">{totalOptions - visibleOptions}</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 옵션 목록 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-txt-main">옵션 목록</h2>
            <div className="flex gap-2 items-center">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="옵션명, 포스코드 검색"
                className="w-48"
              />
              <Button variant="primary" size="sm" onClick={handleNewOption}>
                <PlusOutlined />
                옵션 추가
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[500px] overflow-y-auto px-1 -mx-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.id}
                    className={`group flex items-center gap-4 p-3 rounded-lg hover:bg-bg-hover cursor-pointer transition-colors ${selectedOption?.id === option.id ? 'bg-bg-hover border-2 border-primary/20' : 'border-2 border-transparent'
                      }`}
                    onClick={() => handleSelectOption(option)}
                  >
                    {/* 이미지 */}
                    <div className="w-12 h-12 rounded-lg bg-bg-disabled flex items-center justify-center overflow-hidden flex-shrink-0">
                      {option.imageUrl ? (
                        <img
                          src={option.imageUrl}
                          alt={option.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PictureOutlined style={{ fontSize: 20 }} className="text-txt-muted" />
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-txt-main truncate">{option.name}</span>
                        <Badge variant={option.isVisible ? 'success' : 'secondary'} className="flex-shrink-0">
                          {option.isVisible ? '노출' : '숨김'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-txt-muted mt-1">
                        <span className="truncate">POS: {option.posCode}</span>
                        <span className="flex-shrink-0">|</span>
                        <span className="font-medium text-primary flex-shrink-0">
                          {formatCurrency(option.price)}원
                        </span>
                        <span className="flex-shrink-0">|</span>
                        <span className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded ${option.maxQuantity === 1 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                          {option.maxQuantity === 1 ? '선택형' : `수량 ${option.maxQuantity}개`}
                        </span>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(option);
                      }}
                      className="flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-critical-light transition-opacity text-critical hover:text-critical"
                    >
                      <DeleteOutlined style={{ fontSize: 16 }} />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-txt-muted">
                  <p>
                    {searchQuery ? '검색 결과가 없습니다.' : '등록된 옵션이 없습니다.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 옵션 상세/등록 */}
        <Card>
          {!selectedOption && !isEditing ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-hover">
                  <PlusOutlined className="text-4xl text-txt-muted" />
                </div>
                <h3 className="text-lg font-semibold text-txt-main mb-2">
                  옵션을 선택하거나 등록하세요
                </h3>
                <p className="text-sm text-txt-muted mb-6">
                  좌측 목록에서 옵션을 선택하거나<br />
                  "옵션 등록" 버튼을 클릭하여 새 옵션을 추가하세요
                </p>
                <Button variant="primary" onClick={handleNewOption}>
                  <PlusOutlined />
                  옵션 등록
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <h2 className="text-lg font-semibold text-txt-main">
                  {selectedOption && !isEditing
                    ? '옵션 상세'
                    : selectedOption && isEditing
                      ? '옵션 수정'
                      : '옵션 등록'}
                </h2>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 옵션 이미지 */}
                <div className="space-y-2">
                  <Label>옵션 이미지 (선택)</Label>
                  <div className="flex items-start gap-4">
                    <div className="w-24 h-24 rounded-lg bg-bg-disabled flex items-center justify-center overflow-hidden border-2 border-dashed border-border">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="미리보기"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <PictureOutlined style={{ fontSize: 32 }} className="text-txt-muted" />
                      )}
                    </div>
                    {(isEditing || !selectedOption) && (
                      <div className="flex flex-col gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                          id="option-image"
                        />
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          이미지 선택
                        </Button>
                        {imagePreview && (
                          <Button variant="ghost" size="sm" onClick={handleRemoveImage}>
                            이미지 삭제
                          </Button>
                        )}
                        <p className="text-xs text-txt-muted">
                          권장: 200x200px, 최대 2MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 옵션명 */}
                <div className="space-y-2">
                  <Label required>옵션명</Label>
                  <Textarea
                    value={formData.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.replace(/<br\s*\/?>/g, '').length <= 50) {
                        setFormData({ ...formData, name: val });
                      }
                    }}
                    placeholder="옵션명 (<br> 태그로 줄바꿈 가능)"
                    rows={2}
                    maxLength={200}
                    disabled={!isEditing && !!selectedOption}
                  />
                  <p className="text-xs text-txt-muted">
                    {formData.name.replace(/<br\s*\/?>/g, '').length}/50자 · &lt;br&gt; 태그로 줄바꿈 가능
                  </p>
                </div>

                {/* 포스코드 & 가격 & 최대 선택 수량 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label required>포스코드</Label>
                    <Input
                      value={formData.posCode}
                      onChange={(e) => setFormData({ ...formData, posCode: e.target.value })}
                      placeholder="예: OPT001"
                      disabled={!isEditing && !!selectedOption}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label required>가격</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        value={formData.price}
                        onChange={(e) => {
                          if (e.target.value === '') {
                            setFormData({ ...formData, price: '' as unknown as number });
                            return;
                          }
                          const val = parseInt(e.target.value);
                          if (!isNaN(val) && val >= 0 && val <= 9999999) {
                            setFormData({ ...formData, price: val });
                          }
                        }}
                        min={0}
                        max={9999999}
                        placeholder="0"
                        disabled={!isEditing && !!selectedOption}
                        className="pr-8"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-txt-muted text-sm">
                        원
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label required>최대 선택 수량</Label>
                    <Input
                      type="number"
                      value={formData.maxQuantity}
                      onChange={(e) => {
                        if (e.target.value === '') {
                          setFormData({ ...formData, maxQuantity: '' as unknown as number });
                          return;
                        }
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= 99) {
                          setFormData({ ...formData, maxQuantity: val });
                        }
                      }}
                      min={1}
                      max={99}
                      placeholder="1"
                      disabled={!isEditing && !!selectedOption}
                    />
                    <p className="text-xs text-txt-muted">1~99개</p>
                  </div>
                </div>

                {/* 프론트 UI 타입 안내 */}
                {formData.maxQuantity !== ('' as unknown as number) && <div className={`p-3 rounded-lg border ${formData.maxQuantity === 1 ? 'bg-blue-50 border-blue-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${formData.maxQuantity === 1 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                      {formData.maxQuantity === 1 ? '선택형' : '수량 조절형'}
                    </span>
                    <span className="text-sm font-medium text-txt-main">
                      프론트 UI: {formData.maxQuantity === 1 ? '체크박스 / 라디오' : `수량 조절 (0~${formData.maxQuantity}개)`}
                    </span>
                  </div>
                  <p className="text-xs text-txt-muted">
                    {formData.maxQuantity === 1
                      ? '고객 화면에서 선택/해제만 가능한 단일 선택 UI로 표시됩니다.'
                      : `고객 화면에서 +/- 버튼으로 0~${formData.maxQuantity}개 수량 조절이 가능한 UI로 표시됩니다.`}
                  </p>
                </div>}

                {/* 표시 순서 */}
                <div className="space-y-2">
                  <Label>표시 순서</Label>
                  <Input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => {
                      if (e.target.value === '') {
                        setFormData({ ...formData, displayOrder: '' as unknown as number });
                        return;
                      }
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1 && val <= 999) {
                        setFormData({ ...formData, displayOrder: val });
                      }
                    }}
                    min={1}
                    max={999}
                    placeholder="1"
                    disabled={!isEditing && !!selectedOption}
                  />
                </div>

                {/* 노출 여부 */}
                <div className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                  <Switch
                    checked={formData.isVisible}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                    disabled={!isEditing && !!selectedOption}
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
                {isEditing || !selectedOption ? (
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
                        setSelectedOption(null);
                        setImagePreview(null);
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
