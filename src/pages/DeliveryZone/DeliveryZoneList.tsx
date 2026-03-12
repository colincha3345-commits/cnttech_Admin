/**
 * 상권 관리 페이지
 * 좌측: 상권 목록 패널 / 우측: MapCanvas 상권 시각화
 */
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

import {
  Card,
  Button,
  Badge,
  Spinner,
  ConfirmDialog,
} from '@/components/ui';
import {
  useDeliveryZones,
  useDeleteDeliveryZone,
  useToast,
  useStoreSummaries,
} from '@/hooks';
import type { DeliveryZone } from '@/types/delivery-zone';
import { ZONE_TYPE_LABELS, ZONE_LEVEL_LABELS } from '@/types/delivery-zone';
import { MapView } from './components/MapView';

// ============================================
// 상권 카드
// ============================================

interface ZoneCardProps {
  zone: DeliveryZone;
  isSelected: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const ZoneCard: React.FC<ZoneCardProps> = ({
  zone,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
}) => (
  <div
    className={`p-3 rounded-lg border cursor-pointer transition-all ${
      isSelected
        ? 'border-blue-500 bg-blue-50 shadow-sm'
        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
    }`}
    onClick={onSelect}
  >
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: zone.color }}
        />
        <div>
          <p className="text-sm font-medium text-gray-900">{zone.name}</p>
          <p className="text-xs text-gray-500">{zone.storeName}</p>
        </div>
      </div>
      <Badge variant={zone.isActive ? 'success' : 'default'}>
        {zone.isActive ? '활성' : '비활성'}
      </Badge>
    </div>

    <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
      <span className={zone.zoneLevel === 'sub' ? 'text-purple-600' : ''}>
        {ZONE_LEVEL_LABELS[zone.zoneLevel]}
      </span>
      <span>{ZONE_TYPE_LABELS[zone.type]}</span>
      {zone.radius && <span>{zone.radius}km</span>}
      <span>
        {zone.zoneLevel === 'sub' ? '+' : ''}
        {zone.deliveryFee.toLocaleString()}원
      </span>
      {zone.zoneLevel === 'main' && zone.minOrderAmount && (
        <span>최소 {zone.minOrderAmount.toLocaleString()}원</span>
      )}
    </div>

    <div className="mt-2 flex justify-end gap-1">
      <button
        className="p-1 text-gray-400 hover:text-blue-600"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="수정"
      >
        <EditOutlined style={{ fontSize: 14 }} />
      </button>
      <button
        className="p-1 text-gray-400 hover:text-red-600"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="삭제"
      >
        <DeleteOutlined style={{ fontSize: 14 }} />
      </button>
    </div>
  </div>
);

// ============================================
// 메인 페이지
// ============================================

export const DeliveryZoneList: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  // 필터 상태
  const [filterStoreId, setFilterStoreId] = useState<string>('');
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null);

  // 삭제 모달
  const [deletingZone, setDeletingZone] = useState<DeliveryZone | null>(null);

  // 데이터
  const { data: stores = [] } = useStoreSummaries();
  const { data: zones = [], isLoading } = useDeliveryZones(
    filterStoreId ? { storeId: filterStoreId } : undefined
  );

  const deleteZone = useDeleteDeliveryZone();

  const storeOptions = useMemo(
    () => stores.map((s) => ({ id: s.id, name: s.name })),
    [stores]
  );

  // 상권 삭제
  const handleDelete = () => {
    if (!deletingZone) return;
    deleteZone.mutate(deletingZone.id, {
      onSuccess: () => {
        toast.success('상권이 삭제되었습니다.');
        setDeletingZone(null);
        if (selectedZone?.id === deletingZone.id) {
          setSelectedZone(null);
        }
      },
      onError: () => toast.error('상권 삭제에 실패했습니다.'),
    });
  };

  // 지도에서 상권 클릭
  const handleZoneClick = (zone: DeliveryZone) => {
    setSelectedZone(zone);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상권 관리</h1>
          <p className="text-sm text-gray-500 mt-1">
            매장별 배달 가능 구역을 설정하고 관리합니다
          </p>
        </div>
        <Button onClick={() => navigate('/delivery-zones/new')}>
          <PlusOutlined className="mr-1" /> 상권 추가
        </Button>
      </div>

      {/* 메인 레이아웃 */}
      <div className="grid grid-cols-12 gap-4" style={{ minHeight: '600px' }}>
        {/* 좌측: 상권 목록 */}
        <div className="col-span-4">
          <Card>
            {/* 매장 필터 */}
            <div className="p-3 border-b">
              <select
                value={filterStoreId}
                onChange={(e) => {
                  setFilterStoreId(e.target.value);
                  setSelectedZone(null);
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">전체 매장</option>
                {storeOptions.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 상권 목록 */}
            <div className="p-3 space-y-2 overflow-y-auto" style={{ maxHeight: '520px' }}>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : zones.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  <EnvironmentOutlined style={{ fontSize: 32, color: '#d1d5db' }} />
                  <p className="mt-2">등록된 상권이 없습니다</p>
                  <p className="text-xs mt-1">상권을 추가하여 배달 구역을 설정하세요</p>
                </div>
              ) : (
                zones.map((zone) => (
                  <ZoneCard
                    key={zone.id}
                    zone={zone}
                    isSelected={selectedZone?.id === zone.id}
                    onSelect={() => setSelectedZone(zone)}
                    onEdit={() => navigate(`/delivery-zones/${zone.id}/edit`)}
                    onDelete={() => setDeletingZone(zone)}
                  />
                ))
              )}
            </div>

            {/* 통계 */}
            {zones.length > 0 && (
              <div className="p-3 border-t text-xs text-gray-500">
                전체 {zones.length}개 | 활성 {zones.filter((z) => z.isActive).length}개
              </div>
            )}
          </Card>
        </div>

        {/* 우측: 지도 영역 (MapCanvas) */}
        <div className="col-span-8">
          <Card className="h-full">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-[400px]">
                <MapView
                  zones={zones}
                  selectedZoneId={selectedZone?.id}
                  onZoneClick={handleZoneClick}
                  readOnly
                />
              </div>

              {/* 선택된 상권 정보 */}
              {selectedZone && (
                <div className="px-4 pb-4">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: selectedZone.color }}
                      />
                      <h3 className="font-medium text-gray-900">
                        {selectedZone.name}
                      </h3>
                      <Badge variant={selectedZone.isActive ? 'success' : 'default'}>
                        {selectedZone.isActive ? '활성' : '비활성'}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">매장</p>
                        <p className="text-sm font-medium">{selectedZone.storeName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">타입</p>
                        <p className="text-sm font-medium">
                          {ZONE_TYPE_LABELS[selectedZone.type]}
                          {selectedZone.radius && ` (${selectedZone.radius}km)`}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">배달비</p>
                        <p className="text-sm font-medium">
                          {selectedZone.deliveryFee.toLocaleString()}원
                        </p>
                      </div>
                      {selectedZone.zoneLevel === 'main' && (
                        <div>
                          <p className="text-xs text-gray-500">최소주문금액</p>
                          <p className="text-sm font-medium">
                            {selectedZone.minOrderAmount
                              ? `${selectedZone.minOrderAmount.toLocaleString()}원`
                              : '-'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-gray-400">
                      중심좌표: {selectedZone.center.lat.toFixed(4)},{' '}
                      {selectedZone.center.lng.toFixed(4)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 삭제 확인 */}
      <ConfirmDialog
        isOpen={!!deletingZone}
        onClose={() => setDeletingZone(null)}
        onConfirm={handleDelete}
        title="상권 삭제"
        message={`"${deletingZone?.name}" 상권을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
};
