import React, { useState, useMemo } from 'react';
import { CheckOutlined, ShopOutlined } from '@ant-design/icons';
import { SearchInput } from './SearchInput';
import type { Store } from '../../types/product';

interface StoreSelectorProps {
  stores: Store[];
  selectedStores: string[];
  onChange: (storeIds: string[]) => void;
  applyToAll: boolean;
  onApplyToAllChange: (value: boolean) => void;
  disabled?: boolean;
}

export const StoreSelector: React.FC<StoreSelectorProps> = ({
  stores,
  selectedStores,
  onChange,
  applyToAll,
  onApplyToAllChange,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  // 지역 목록 추출
  const regions = useMemo(() => {
    const regionSet = new Set(stores.map((s) => s.region));
    return ['all', ...Array.from(regionSet)];
  }, [stores]);

  // 필터링된 가맹점 목록
  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      const matchesSearch =
        searchTerm === '' ||
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.address.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRegion = selectedRegion === 'all' || store.region === selectedRegion;

      return matchesSearch && matchesRegion;
    });
  }, [stores, searchTerm, selectedRegion]);

  // 지역별 가맹점 그룹화
  const storesByRegion = useMemo(() => {
    const grouped: Record<string, Store[]> = {};
    filteredStores.forEach((store) => {
      if (!grouped[store.region]) {
        grouped[store.region] = [];
      }
      grouped[store.region]?.push(store);
    });
    return grouped;
  }, [filteredStores]);

  const handleStoreToggle = (storeId: string) => {
    if (disabled) return;

    const newSelected = selectedStores.includes(storeId)
      ? selectedStores.filter((id) => id !== storeId)
      : [...selectedStores, storeId];

    onChange(newSelected);
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange(filteredStores.map((s) => s.id));
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  const handleRegionToggle = (region: string) => {
    if (disabled) return;

    const regionStores = stores.filter((s) => s.region === region);
    const regionStoreIds = regionStores.map((s) => s.id);
    const allSelected = regionStoreIds.every((id) => selectedStores.includes(id));

    if (allSelected) {
      // 해당 지역 전체 해제
      onChange(selectedStores.filter((id) => !regionStoreIds.includes(id)));
    } else {
      // 해당 지역 전체 선택
      const newSelected = [...new Set([...selectedStores, ...regionStoreIds])];
      onChange(newSelected);
    }
  };

  return (
    <div className="space-y-6">
      {/* 전체/선택 라디오 */}
      <div>
        <label className="block text-sm font-semibold text-txt-main mb-3">
          가맹점 적용 <span className="text-critical">*</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onApplyToAllChange(true)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded-lg border-2 text-left
              transition-all duration-200
              ${
                applyToAll
                  ? 'border-primary bg-primary/5 text-txt-main'
                  : 'border-border hover:border-primary/50 text-txt-secondary hover:bg-hover'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">전체 가맹점</span>
              {applyToAll && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                  <CheckOutlined className="text-xs text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-txt-muted mt-1">{stores.length}개 가맹점</p>
          </button>

          <button
            type="button"
            onClick={() => onApplyToAllChange(false)}
            disabled={disabled}
            className={`
              px-4 py-3 rounded-lg border-2 text-left
              transition-all duration-200
              ${
                !applyToAll
                  ? 'border-primary bg-primary/5 text-txt-main'
                  : 'border-border hover:border-primary/50 text-txt-secondary hover:bg-hover'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">선택 가맹점</span>
              {!applyToAll && (
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary">
                  <CheckOutlined className="text-xs text-white" />
                </div>
              )}
            </div>
            <p className="text-xs text-txt-muted mt-1">
              {selectedStores.length > 0 ? `${selectedStores.length}개 선택` : '가맹점 선택'}
            </p>
          </button>
        </div>
      </div>

      {/* 선택 가맹점 모드일 때만 표시 */}
      {!applyToAll && (
        <div className="space-y-4">
          {/* 검색 및 필터 */}
          <div className="space-y-3">
            {/* 검색 */}
            <SearchInput
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="가맹점명 또는 주소 검색..."
              disabled={disabled}
            />

            {/* 지역 필터 */}
            <div className="flex gap-2 flex-wrap">
              {regions.map((region) => (
                <button
                  key={region}
                  type="button"
                  onClick={() => setSelectedRegion(region)}
                  disabled={disabled}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium
                    transition-all duration-200
                    ${
                      selectedRegion === region
                        ? 'bg-primary text-white'
                        : 'bg-hover text-txt-secondary hover:bg-border'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {region === 'all' ? '전체' : region}
                </button>
              ))}
            </div>

            {/* 일괄 선택/해제 */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                disabled={disabled || filteredStores.length === 0}
                className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                전체 선택
              </button>
              <span className="text-xs text-border-strong">|</span>
              <button
                type="button"
                onClick={handleDeselectAll}
                disabled={disabled || selectedStores.length === 0}
                className="text-xs text-txt-muted hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                전체 해제
              </button>
            </div>
          </div>

          {/* 가맹점 리스트 */}
          <div className="max-h-96 overflow-y-auto border border-border rounded-lg">
            {filteredStores.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <ShopOutlined className="text-3xl text-txt-muted mb-2" />
                <p className="text-sm text-txt-muted">검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {Object.entries(storesByRegion).map(([region, regionStores]) => {
                  const regionStoreIds = regionStores.map((s) => s.id);
                  const allSelected = regionStoreIds.every((id) => selectedStores.includes(id));
                  const someSelected = regionStoreIds.some((id) => selectedStores.includes(id));

                  return (
                    <div key={region}>
                      {/* 지역 헤더 */}
                      <div className="sticky top-0 bg-bg-main px-4 py-2 border-b border-border">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => handleRegionToggle(region)}
                            disabled={disabled}
                            className="sr-only"
                          />
                          <div
                            className={`
                              flex items-center justify-center w-5 h-5 rounded border-2
                              transition-colors duration-200
                              ${
                                allSelected
                                  ? 'border-primary bg-primary'
                                  : someSelected
                                  ? 'border-primary bg-primary/30'
                                  : 'border-border-strong'
                              }
                            `}
                          >
                            {(allSelected || someSelected) && (
                              <CheckOutlined className="text-xs text-white" />
                            )}
                          </div>
                          <span className="text-sm font-semibold text-txt-main">
                            {region} ({regionStores.length})
                          </span>
                        </label>
                      </div>

                      {/* 가맹점 목록 */}
                      <div>
                        {regionStores.map((store) => (
                          <label
                            key={store.id}
                            className="flex items-start gap-3 px-4 py-3 hover:bg-hover cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedStores.includes(store.id)}
                              onChange={() => handleStoreToggle(store.id)}
                              disabled={disabled}
                              className="sr-only"
                            />
                            <div
                              className={`
                                flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0 mt-0.5
                                transition-colors duration-200
                                ${
                                  selectedStores.includes(store.id)
                                    ? 'border-primary bg-primary'
                                    : 'border-border-strong'
                                }
                              `}
                            >
                              {selectedStores.includes(store.id) && (
                                <CheckOutlined className="text-xs text-white" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-txt-main">{store.name}</p>
                              <p className="text-xs text-txt-muted truncate">{store.address}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 선택 정보 */}
          {selectedStores.length > 0 && (
            <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm text-txt-main">
                <span className="font-semibold text-primary">{selectedStores.length}개</span> 가맹점이
                선택되었습니다
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
