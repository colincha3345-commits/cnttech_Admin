/**
 * 원산지 정보 / 알레르기 유발정보 관리 페이지
 * 각 탭에서 이미지 업로드 또는 표 직접 입력 방식을 선택하여 관리
 */
import { useState } from 'react';

import { Card, CardHeader, CardContent, Button, Input, ImageUpload } from '@/components/ui';
import { SaveOutlined, PlusOutlined, DeleteOutlined, PictureOutlined, TableOutlined } from '@ant-design/icons';
import { useToast } from '@/hooks';

type InfoTab = 'origin' | 'allergy';
type InputMode = 'image' | 'table';

interface OriginRow {
  ingredient: string;
  origin: string;
}

interface AllergyRow {
  menuName: string;
  allergens: string;
}

const TABS: { key: InfoTab; label: string }[] = [
  { key: 'origin', label: '원산지 정보' },
  { key: 'allergy', label: '알레르기 유발정보' },
];

const DESCRIPTION: Record<InfoTab, Record<InputMode, string>> = {
  origin: {
    image: '전 메뉴의 원산지 정보를 이미지로 등록합니다.',
    table: '원재료명과 원산지를 직접 입력합니다.',
  },
  allergy: {
    image: '전 메뉴의 알레르기 유발물질 정보를 이미지로 등록합니다.',
    table: '메뉴명과 알레르기 유발물질을 직접 입력합니다.',
  },
};

// Mock 초기 데이터
const INITIAL_ORIGIN_ROWS: OriginRow[] = [
  { ingredient: '닭고기', origin: '국내산' },
  { ingredient: '쌀(밥)', origin: '국내산' },
  { ingredient: '김치(배추, 고춧가루)', origin: '국내산' },
  { ingredient: '치즈', origin: '미국산, 뉴질랜드산' },
];

const INITIAL_ALLERGY_ROWS: AllergyRow[] = [
  { menuName: '후라이드', allergens: '밀, 대두, 닭고기' },
  { menuName: '양념치킨', allergens: '밀, 대두, 닭고기, 토마토' },
  { menuName: '뿌링클', allergens: '밀, 대두, 닭고기, 우유' },
];

export const MenuInfoManagement = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<InfoTab>('origin');
  const [inputMode, setInputMode] = useState<InputMode>('table');
  const [isSaving, setIsSaving] = useState(false);

  // 이미지 모드 상태
  const [originImage, setOriginImage] = useState('');
  const [allergyImage, setAllergyImage] = useState('');

  // 표 모드 상태
  const [originRows, setOriginRows] = useState<OriginRow[]>(INITIAL_ORIGIN_ROWS);
  const [allergyRows, setAllergyRows] = useState<AllergyRow[]>(INITIAL_ALLERGY_ROWS);

  const currentImage = activeTab === 'origin' ? originImage : allergyImage;
  const setCurrentImage = activeTab === 'origin' ? setOriginImage : setAllergyImage;

  const handleSave = async () => {
    if (inputMode === 'image' && !currentImage) {
      toast.error('이미지를 등록해주세요.');
      return;
    }
    if (inputMode === 'table') {
      const rows = activeTab === 'origin' ? originRows : allergyRows;
      if (rows.length === 0) {
        toast.error('최소 1개 이상의 항목을 입력해주세요.');
        return;
      }
    }

    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.success(`${TABS.find((t) => t.key === activeTab)!.label}가 저장되었습니다.`);
    } catch {
      toast.error('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 원산지 표 핸들러
  const addOriginRow = () => setOriginRows((prev) => [...prev, { ingredient: '', origin: '' }]);
  const removeOriginRow = (index: number) => setOriginRows((prev) => prev.filter((_, i) => i !== index));
  const updateOriginRow = (index: number, field: keyof OriginRow, value: string) =>
    setOriginRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  // 알레르기 표 핸들러
  const addAllergyRow = () => setAllergyRows((prev) => [...prev, { menuName: '', allergens: '' }]);
  const removeAllergyRow = (index: number) => setAllergyRows((prev) => prev.filter((_, i) => i !== index));
  const updateAllergyRow = (index: number, field: keyof AllergyRow, value: string) =>
    setAllergyRows((prev) => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));

  const renderImageMode = () => (
    <div className="space-y-4">
      <ImageUpload
        value={currentImage}
        onChange={(file) => {
          if (file) {
            setCurrentImage(URL.createObjectURL(file));
          } else {
            setCurrentImage('');
          }
        }}
      />
      <p className="text-xs text-txt-muted">JPG, PNG, WEBP 형식 / 최대 5MB / 권장: 가로 1200px 이상</p>

      {currentImage && (
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <PictureOutlined className="text-txt-muted" />
            <span className="text-sm font-medium text-txt-main">미리보기</span>
          </div>
          <img src={currentImage} alt={activeTab} className="w-full rounded-lg border border-border" />
        </div>
      )}
    </div>
  );

  const renderOriginTable = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-txt-main">원재료 및 원산지 ({originRows.length}건)</span>
        <Button type="button" size="sm" variant="outline" onClick={addOriginRow}>
          <PlusOutlined className="mr-1" /> 행 추가
        </Button>
      </div>
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead className="bg-bg-secondary">
          <tr>
            <th className="text-left p-3 font-medium text-txt-secondary w-[45%]">원재료명</th>
            <th className="text-left p-3 font-medium text-txt-secondary w-[45%]">원산지</th>
            <th className="p-3 w-[10%]" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {originRows.map((row, index) => (
            <tr key={index} className="bg-bg-card">
              <td className="p-2">
                <Input
                  value={row.ingredient}
                  onChange={(e) => updateOriginRow(index, 'ingredient', e.target.value)}
                  placeholder="예: 닭고기"
                  className="text-sm"
                />
              </td>
              <td className="p-2">
                <Input
                  value={row.origin}
                  onChange={(e) => updateOriginRow(index, 'origin', e.target.value)}
                  placeholder="예: 국내산"
                  className="text-sm"
                />
              </td>
              <td className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => removeOriginRow(index)}
                  className="p-1.5 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors"
                >
                  <DeleteOutlined />
                </button>
              </td>
            </tr>
          ))}
          {originRows.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-8 text-txt-muted">
                항목이 없습니다. "행 추가"를 눌러 입력하세요.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const renderAllergyTable = () => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-txt-main">메뉴별 알레르기 유발물질 ({allergyRows.length}건)</span>
        <Button type="button" size="sm" variant="outline" onClick={addAllergyRow}>
          <PlusOutlined className="mr-1" /> 행 추가
        </Button>
      </div>
      <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
        <thead className="bg-bg-secondary">
          <tr>
            <th className="text-left p-3 font-medium text-txt-secondary w-[35%]">메뉴명</th>
            <th className="text-left p-3 font-medium text-txt-secondary w-[55%]">알레르기 유발물질</th>
            <th className="p-3 w-[10%]" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {allergyRows.map((row, index) => (
            <tr key={index} className="bg-bg-card">
              <td className="p-2">
                <Input
                  value={row.menuName}
                  onChange={(e) => updateAllergyRow(index, 'menuName', e.target.value)}
                  placeholder="예: 후라이드"
                  className="text-sm"
                />
              </td>
              <td className="p-2">
                <Input
                  value={row.allergens}
                  onChange={(e) => updateAllergyRow(index, 'allergens', e.target.value)}
                  placeholder="예: 밀, 대두, 닭고기"
                  className="text-sm"
                />
              </td>
              <td className="p-2 text-center">
                <button
                  type="button"
                  onClick={() => removeAllergyRow(index)}
                  className="p-1.5 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors"
                >
                  <DeleteOutlined />
                </button>
              </td>
            </tr>
          ))}
          {allergyRows.length === 0 && (
            <tr>
              <td colSpan={3} className="text-center py-8 text-txt-muted">
                항목이 없습니다. "행 추가"를 눌러 입력하세요.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <p className="text-xs text-txt-muted">알레르기 유발물질을 쉼표(,)로 구분하여 입력하세요.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-txt-main">원산지 / 알레르기 정보</h1>
        <p className="text-sm text-txt-muted mt-1">전 메뉴의 원산지 및 알레르기 유발물질 정보를 관리합니다.</p>
      </div>

      {/* 탭 */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-txt-muted hover:text-txt-main hover:border-border'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{TABS.find((t) => t.key === activeTab)!.label}</h2>
              <p className="text-sm text-txt-muted mt-1">{DESCRIPTION[activeTab][inputMode]}</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving}>
              <SaveOutlined className="mr-1" />
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 입력 방식 선택 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setInputMode('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  inputMode === 'table'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-card text-txt-secondary border-border hover:border-primary/50'
                }`}
              >
                <TableOutlined /> 표 입력
              </button>
              <button
                type="button"
                onClick={() => setInputMode('image')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  inputMode === 'image'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-card text-txt-secondary border-border hover:border-primary/50'
                }`}
              >
                <PictureOutlined /> 이미지 업로드
              </button>
            </div>

            {/* 입력 모드별 콘텐츠 */}
            {inputMode === 'image'
              ? renderImageMode()
              : activeTab === 'origin'
                ? renderOriginTable()
                : renderAllergyTable()
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
