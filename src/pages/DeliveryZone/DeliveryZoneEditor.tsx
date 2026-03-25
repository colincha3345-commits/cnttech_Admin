/**
 * 상권 생성/수정 전체페이지 에디터
 * 좌측 패널(폼) + 중앙 지도 + 우측 상권 리스트 패널
 */
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  AimOutlined,
  GatewayOutlined,
  SaveOutlined,
  UndoOutlined,
  ClearOutlined,
  EditOutlined,
} from '@ant-design/icons';

import { Button, Input, Switch, Spinner, Badge } from '@/components/ui';
import {
  useDeliveryZone,
  useCreateDeliveryZone,
  useUpdateDeliveryZone,
  useDeliveryZones,
  useCreateSubZonesBatch,
  useToast,
  useStoreSummaries,
} from '@/hooks';
import { MapView } from './components/MapView';
import type { DrawingState, DrawMode, FocusTarget } from './components/MapView';
import type { DeliveryZoneFormData, DeliveryZone, Coordinate, ZoneLevel, SubZoneInterval } from '@/types/delivery-zone';
import { DEFAULT_ZONE_COLORS, ZONE_LEVEL_LABELS } from '@/types/delivery-zone';

export const DeliveryZoneEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const isEdit = !!id;

  // 데이터
  const { data: editingZone, isLoading: isLoadingZone } = useDeliveryZone(id);
  const { data: stores = [] } = useStoreSummaries();

  const createZone = useCreateDeliveryZone();
  const updateZone = useUpdateDeliveryZone();
  const createSubZonesBatch = useCreateSubZonesBatch();

  // 선택된 매장의 상권만 조회 (storeId 필터)
  const [selectedStoreId, setSelectedStoreId] = useState(editingZone?.storeId ?? '');
  const { zones } = useDeliveryZones(
    selectedStoreId ? { storeId: selectedStoreId } : undefined
  );

  // 소상권 자동 생성
  const [useSubZonesChecked, setUseSubZonesChecked] = useState(false);
  const [subZoneIntervalMeters, setSubZoneIntervalMeters] = useState(500);
  const [showSubZoneModal, setShowSubZoneModal] = useState(false);
  const [subZoneIntervals, setSubZoneIntervals] = useState<SubZoneInterval[]>([]);
  // useSubZones는 수정 모드에서 기존 소상권 로드 시 사용 예정

  // 폼 상태
  const [formData, setFormData] = useState<DeliveryZoneFormData>({
    storeId: '',
    name: '',
    zoneLevel: 'main',
    type: 'radius',
    radius: 3,
    deliveryFee: 3000,
    minOrderAmount: 15000,
    isActive: true,
    color: DEFAULT_ZONE_COLORS[0] ?? '#3B82F6',
  });

  // 드로잉
  const [drawing, setDrawing] = useState<DrawingState>({
    mode: 'none',
    color: DEFAULT_ZONE_COLORS[0] ?? '#3B82F6',
  });
  const [drawnCenter, setDrawnCenter] = useState<Coordinate | undefined>();
  const [drawnRadius, setDrawnRadius] = useState<number | undefined>();
  const [drawnPolygon, setDrawnPolygon] = useState<Coordinate[] | undefined>();
  const [focusTarget, setFocusTarget] = useState<FocusTarget | undefined>();

  // 수정 모드: 기존 데이터 로드
  useEffect(() => {
    if (editingZone) {
      setFormData({
        storeId: editingZone.storeId,
        name: editingZone.name,
        zoneLevel: editingZone.zoneLevel,
        parentZoneId: editingZone.parentZoneId,
        type: editingZone.type,
        radius: editingZone.radius,
        deliveryFee: editingZone.deliveryFee,
        minOrderAmount: editingZone.minOrderAmount,
        isActive: editingZone.isActive,
        color: editingZone.color,
      });
      setSelectedStoreId(editingZone.storeId);
      setDrawnCenter(editingZone.center);
      setDrawnRadius(editingZone.radius);
      setDrawnPolygon(editingZone.polygon);
      // 기존 영역을 drawing 상태에 반영하여 지도에 표시
      setDrawing({
        mode: 'none',
        color: editingZone.color,
        center: editingZone.center,
        radius: editingZone.radius,
        polygon: editingZone.polygon,
      });
    }
  }, [editingZone]);

  const storeOptions = useMemo(
    () => stores.map((s) => ({ id: s.id, name: s.name })),
    [stores]
  );

  useEffect(() => {
    if (!isEdit && storeOptions.length > 0 && !formData.storeId) {
      const firstId = storeOptions[0]!.id;
      setFormData((prev) => ({ ...prev, storeId: firstId }));
      setSelectedStoreId(firstId);
    }
  }, [isEdit, storeOptions, formData.storeId]);

  // 배경 존 (편집 중인 것 제외)
  const backgroundZones = useMemo(
    () => (isEdit ? zones.filter((z) => z.id !== id) : zones),
    [zones, id, isEdit]
  );

  // 메인상권 목록 (소상권 부모 선택용) — zones는 이미 storeId 필터됨
  const mainZonesForStore = useMemo(
    () => zones.filter((z) => z.zoneLevel === 'main'),
    [zones]
  );

  // 매장 상권 목록 (우측 패널) — zones 자체가 해당 매장 전용
  const storeZones = zones;

  // 드로잉 모드 변경
  const setDrawMode = useCallback(
    (mode: DrawMode) => {
      setDrawing({
        mode,
        color: formData.color,
        center: undefined,
        radius: undefined,
        polygon: undefined,
      });
      if (mode !== 'none') {
        setDrawnCenter(undefined);
        setDrawnRadius(undefined);
        setDrawnPolygon(undefined);
      }
      // 반경 모드 전환 시 zoneLevel을 main으로 강제 (소상권은 하단 자동 생성으로 대체)
      if (mode === 'radius') {
        setFormData((prev) => ({ ...prev, type: 'radius', zoneLevel: 'main' }));
      } else if (mode === 'polygon') {
        setFormData((prev) => ({ ...prev, type: 'polygon' }));
      }
    },
    [formData.color]
  );

  const handleDrawUpdate = useCallback((state: Partial<DrawingState>) => {
    setDrawing((prev) => ({ ...prev, ...state }));
  }, []);

  const handleDrawComplete = useCallback(
    (state: DrawingState) => {
      if (state.mode === 'radius' && state.center && state.radius) {
        setDrawnCenter(state.center);
        setDrawnRadius(state.radius);
        setFormData((prev) => ({
          ...prev,
          type: 'radius',
          radius: state.radius,
          center: state.center,
        }));
        // 완료 후에도 그려진 영역을 drawing 상태에 유지
        setDrawing({ mode: 'none', color: formData.color, center: state.center, radius: state.radius });
      } else if (state.mode === 'polygon' && state.polygon && state.polygon.length >= 3) {
        setDrawnPolygon(state.polygon);
        const avgLat = state.polygon.reduce((s, c) => s + c.lat, 0) / state.polygon.length;
        const avgLng = state.polygon.reduce((s, c) => s + c.lng, 0) / state.polygon.length;
        setDrawnCenter({ lat: avgLat, lng: avgLng });
        setFormData((prev) => ({
          ...prev,
          type: 'polygon',
          polygon: state.polygon,
          center: { lat: avgLat, lng: avgLng },
        }));
        setDrawing({ mode: 'none', color: formData.color, polygon: state.polygon });
      } else {
        setDrawing({ mode: 'none', color: formData.color });
      }
      toast.success('상권 영역이 설정되었습니다.');
    },
    [formData.color, toast]
  );

  const handleReset = () => {
    setDrawnCenter(undefined);
    setDrawnRadius(undefined);
    setDrawnPolygon(undefined);
    setDrawing({ mode: 'none', color: formData.color });
  };

  // 폴리곤 실행취소 (마지막 꼭짓점 제거)
  const handlePolygonUndo = useCallback(() => {
    if (drawing.mode === 'polygon' && drawing.polygon && drawing.polygon.length > 0) {
      const newPoly = drawing.polygon.slice(0, -1);
      setDrawing((prev) => ({ ...prev, polygon: newPoly }));
    }
  }, [drawing]);

  // 폴리곤 다시 그리기 (모든 꼭짓점 초기화, 드로잉 모드 유지)
  const handlePolygonClear = useCallback(() => {
    setDrawing((prev) => ({ ...prev, polygon: [], center: undefined, radius: undefined }));
  }, []);

  // 상권 레벨 변경
  const handleZoneLevelChange = (level: ZoneLevel) => {
    setFormData((prev) => ({
      ...prev,
      zoneLevel: level,
      parentZoneId: level === 'sub' ? mainZonesForStore[0]?.id : undefined,
      minOrderAmount: level === 'sub' ? undefined : prev.minOrderAmount ?? 15000,
      deliveryFee: level === 'sub' ? 1000 : prev.deliveryFee,
    }));
  };

  // 소상권 구간 기준 반경 (확정된 값만 사용 — 드로잉 중 변동 방지)
  const effectiveRadiusKm = drawnRadius ?? formData.radius ?? 3;

  // 소상권 구간 자동 생성 함수
  const buildSubZoneIntervals = (radiusKm: number, intervalMeters: number): SubZoneInterval[] => {
    if (intervalMeters <= 0 || radiusKm <= 0) return [];
    const intervalKm = intervalMeters / 1000;
    const intervals: SubZoneInterval[] = [];
    let current = 0;
    while (current < radiusKm) {
      const inner = current;
      const outer = Math.min(current + intervalKm, radiusKm);
      const innerM = Math.round(inner * 1000);
      const outerM = Math.round(outer * 1000);
      intervals.push({
        innerRadius: inner,
        outerRadius: outer,
        deliveryFee: Math.round(inner * 1000), // 기본: 거리(m) 기준 증가
        name: `${innerM.toLocaleString()}m ~ ${outerM.toLocaleString()}m`,
      });
      current = outer;
    }
    // 첫 구간은 추가배달비 0원
    if (intervals.length > 0) intervals[0]!.deliveryFee = 0;
    return intervals;
  };

  const handleOpenSubZoneModal = () => {
    const intervals = buildSubZoneIntervals(effectiveRadiusKm, subZoneIntervalMeters);
    setSubZoneIntervals(intervals);
    setShowSubZoneModal(true);
  };

  const handleSaveSubZones = async (mainZoneId: string) => {
    if (subZoneIntervals.length === 0) return;
    try {
      await createSubZonesBatch.mutateAsync({
        mainZoneId,
        intervals: subZoneIntervals,
      });
      toast.success(`소상권 ${subZoneIntervals.length}개가 생성되었습니다.`);
    } catch {
      toast.error('소상권 생성에 실패했습니다.');
    }
  };

  // 미리보기 구간 목록 — 안정적인 값에만 의존 (드로잉 중 연쇄 재계산 방지)
  const previewIntervals = useMemo(() => {
    if (!useSubZonesChecked) return [];
    return buildSubZoneIntervals(effectiveRadiusKm, subZoneIntervalMeters);
  }, [useSubZonesChecked, effectiveRadiusKm, subZoneIntervalMeters]);

  // 저장
  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('상권명을 입력해주세요.');
      return;
    }
    if (!drawnCenter && !drawnRadius && !drawnPolygon) {
      toast.error('지도에서 상권 영역을 그려주세요.');
      return;
    }
    if (formData.zoneLevel === 'sub' && !formData.parentZoneId) {
      toast.error('소상권의 메인상권을 선택해주세요.');
      return;
    }

    const saveData: DeliveryZoneFormData = {
      ...formData,
      center: drawnCenter,
      radius: formData.type === 'radius' ? (drawnRadius ?? formData.radius) : undefined,
      polygon: formData.type === 'polygon' ? drawnPolygon : undefined,
      minOrderAmount: formData.zoneLevel === 'main' ? formData.minOrderAmount : undefined,
    };

    if (isEdit) {
      updateZone.mutate(
        { id: id!, data: saveData },
        {
          onSuccess: () => {
            toast.success('상권이 수정되었습니다.');
            navigate('/delivery-zones');
          },
          onError: () => toast.error('상권 수정에 실패했습니다.'),
        }
      );
    } else {
      createZone.mutate(saveData, {
        onSuccess: async (newZone) => {
          toast.success('상권이 추가되었습니다.');
          // 소상권 자동 생성
          if (useSubZonesChecked && subZoneIntervals.length > 0 && newZone) {
            await handleSaveSubZones(newZone.id);
          }
          navigate('/delivery-zones');
        },
        onError: () => toast.error('상권 추가에 실패했습니다.'),
      });
    }
  };

  const isSaving = createZone.isPending || updateZone.isPending;

  if (isEdit && isLoadingZone) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-white">
      {/* ====== 좌측 패널 ====== */}
      <div className="w-80 border-r border-gray-200 flex flex-col bg-white shadow-lg">
        {/* 헤더 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/delivery-zones')}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeftOutlined />
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {isEdit ? '상권 수정' : '상권 추가'}
            </h2>
          </div>
        </div>

        {/* 드로잉 도구 */}
        <div className="p-4 border-b border-gray-200">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            그리기 도구
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setDrawMode('radius')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                drawing.mode === 'radius'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <AimOutlined />
              반경
            </button>
            <button
              onClick={() => setDrawMode('polygon')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                drawing.mode === 'polygon'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <GatewayOutlined />
              폴리곤
            </button>
          </div>
          {drawing.mode !== 'none' && (
            <p className="mt-2 text-xs text-blue-600">
              {drawing.mode === 'radius'
                ? '클릭하여 중심 → 클릭하여 반경 확정'
                : '클릭하여 꼭짓점 추가 · 첫 점 클릭으로 완성'}
            </p>
          )}
        </div>

        {/* 폼 (스크롤) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 상권 레벨 — 반경: 소상권은 거리별 자동 생성 / 폴리곤: 수동 소상권 그리기 가능 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              상권 구분 <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(['main', 'sub'] as ZoneLevel[]).map((level) => {
                const isSubDisabled = level === 'sub' && formData.type === 'radius';
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => !isSubDisabled && handleZoneLevelChange(level)}
                    disabled={isSubDisabled}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                      isSubDisabled
                        ? 'border-gray-200 text-gray-300 bg-gray-50 cursor-not-allowed'
                        : formData.zoneLevel === level
                          ? level === 'main'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-purple-50 border-purple-500 text-purple-700'
                          : 'border-gray-300 text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {ZONE_LEVEL_LABELS[level]}
                  </button>
                );
              })}
            </div>
            {formData.type === 'radius' && (
              <p className="text-xs text-gray-400 mt-1">반경 모드에서는 하단 "소상권 사용"으로 거리별 소상권을 자동 생성합니다.</p>
            )}
            {formData.type === 'polygon' && formData.zoneLevel === 'sub' && (
              <p className="text-xs text-gray-400 mt-1">폴리곤 모드에서는 소상권을 직접 그려서 생성합니다.</p>
            )}
          </div>

          {/* 소상권: 메인상권 선택 */}
          {formData.zoneLevel === 'sub' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                메인 상권 <span className="text-red-500">*</span>
              </label>
              {mainZonesForStore.length === 0 ? (
                <p className="text-xs text-red-500 bg-red-50 p-2 rounded">
                  선택한 매장에 메인 상권이 없습니다. 먼저 메인 상권을 생성하세요.
                </p>
              ) : (
                <select
                  value={formData.parentZoneId ?? ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, parentZoneId: e.target.value }))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value="">메인 상권 선택</option>
                  {mainZonesForStore.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name} ({z.radius}km)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* 매장 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              매장 <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.storeId}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, storeId: e.target.value, parentZoneId: undefined }));
                setSelectedStoreId(e.target.value);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isEdit}
            >
              <option value="">매장 선택</option>
              {storeOptions.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </div>

          {/* 상권명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상권명 <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder={formData.zoneLevel === 'main' ? '예: 강남 기본 상권' : '예: 강남역 소상권'}
              maxLength={30}
            />
          </div>

          {/* 드로잉 결과 */}
          {(drawnRadius || drawnPolygon) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-green-800">영역 설정됨</span>
                <button
                  onClick={handleReset}
                  className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
                >
                  <UndoOutlined style={{ fontSize: 10 }} />
                  초기화
                </button>
              </div>
              {drawnRadius && (
                <p className="text-xs text-green-700">반경: {drawnRadius}km</p>
              )}
              {drawnPolygon && (
                <p className="text-xs text-green-700">폴리곤: {drawnPolygon.length}개 꼭짓점</p>
              )}
            </div>
          )}

          {/* 배달비 / 추가배달비 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {formData.zoneLevel === 'main' ? '배달비 (원)' : '추가배달비 (원)'}
            </label>
            <Input
              type="number"
              value={formData.deliveryFee}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deliveryFee: Number(e.target.value) || 0,
                }))
              }
              placeholder={formData.zoneLevel === 'main' ? '3000' : '1000'}
              min={0}
              step={500}
            />
            {formData.zoneLevel === 'sub' && (
              <p className="text-xs text-gray-400 mt-1">메인 상권 배달비에 추가됩니다</p>
            )}
          </div>

          {/* 최소주문금액 (메인상권 전용) */}
          {formData.zoneLevel === 'main' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                최소주문금액 (원)
              </label>
              <Input
                type="number"
                value={formData.minOrderAmount ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    minOrderAmount: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                placeholder="15000"
                min={0}
                step={1000}
              />
            </div>
          )}

          {/* 소상권 자동 생성 (거리별 배달비) — 반경 모드 메인상권 전용 */}
          {formData.zoneLevel === 'main' && formData.type === 'radius' && (drawnRadius || formData.radius) && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useSubZonesChecked}
                  onChange={(e) => setUseSubZonesChecked(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">소상권 사용 (거리별 배달비)</span>
              </label>

              {useSubZonesChecked && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">거리 간격 (미터)</label>
                    <Input
                      type="number"
                      value={subZoneIntervalMeters}
                      onChange={(e) => setSubZoneIntervalMeters(Number(e.target.value) || 0)}
                      onBlur={() => setSubZoneIntervalMeters((prev) => Math.max(100, Math.round(prev / 100) * 100))}
                      min={100}
                      max={Math.round((drawnRadius ?? formData.radius ?? 3) * 1000)}
                      step={100}
                      placeholder="500"
                    />
                  </div>

                  {/* 미리보기 */}
                  <div className="text-xs text-gray-500">
                    <p className="font-medium mb-1">미리보기: {((drawnRadius ?? formData.radius ?? 3) * 1000).toLocaleString()}m 기준, {previewIntervals.length}개 구간</p>
                    <div className="max-h-32 overflow-y-auto space-y-0.5">
                      {previewIntervals.map((interval, idx) => (
                        <div key={idx} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DEFAULT_ZONE_COLORS[idx % DEFAULT_ZONE_COLORS.length] }} />
                          <span>{interval.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenSubZoneModal}
                    className="w-full py-2 px-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    거리별 배달비 설정
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 소상권 배달비 설정 모달 */}
          {showSubZoneModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900">거리별 추가 배달비 설정</h3>
                  <p className="text-xs text-gray-500 mt-1">고객 청구 배달비 = 메인 배달비({formData.deliveryFee.toLocaleString()}원) + 해당 구간 추가 배달비</p>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <div className="space-y-3">
                    {subZoneIntervals.map((interval, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: DEFAULT_ZONE_COLORS[idx % DEFAULT_ZONE_COLORS.length] }} />
                        <span className="text-sm text-gray-700 w-36 flex-shrink-0">{interval.name}</span>
                        <Input
                          type="number"
                          value={interval.deliveryFee}
                          onChange={(e) => {
                            const newIntervals = [...subZoneIntervals];
                            newIntervals[idx] = { ...interval, deliveryFee: Number(e.target.value) || 0 };
                            setSubZoneIntervals(newIntervals);
                          }}
                          min={0}
                          step={100}
                          className="w-28"
                        />
                        <span className="text-xs text-gray-400 flex-shrink-0">원</span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          (총 {(formData.deliveryFee + (interval.deliveryFee || 0)).toLocaleString()}원)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowSubZoneModal(false)}>취소</Button>
                  <Button onClick={() => setShowSubZoneModal(false)}>확인</Button>
                </div>
              </div>
            </div>
          )}

          {/* 색상 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
            <div className="flex gap-2 flex-wrap">
              {DEFAULT_ZONE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    formData.color === color
                      ? 'border-gray-800 ring-2 ring-offset-1 ring-gray-400 scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, color }));
                    setDrawing((prev) => ({ ...prev, color }));
                  }}
                />
              ))}
            </div>
          </div>

          {/* 활성여부 */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">활성 여부</label>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isActive: checked }))
              }
            />
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="p-4 border-t border-gray-200 space-y-2">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={isSaving || !formData.name.trim()}
          >
            <SaveOutlined className="mr-1" />
            {isSaving ? '저장 중...' : isEdit ? '수정 완료' : '상권 저장'}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate('/delivery-zones')}
            disabled={isSaving}
          >
            취소
          </Button>
        </div>
      </div>

      {/* ====== 중앙 지도 ====== */}
      <div className="flex-1 relative">
        <MapView
          zones={backgroundZones}
          drawing={drawing}
          onDrawUpdate={handleDrawUpdate}
          onDrawComplete={handleDrawComplete}
          focusTarget={focusTarget}
        />

        {/* 폴리곤 드로잉 중 실행취소/다시그리기 버튼 */}
        {drawing.mode === 'polygon' && (
          <div className="absolute top-4 left-4 z-[500] flex gap-2">
            <button
              onClick={handlePolygonUndo}
              disabled={!drawing.polygon || drawing.polygon.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <UndoOutlined style={{ fontSize: 14 }} />
              실행취소
              {drawing.polygon && drawing.polygon.length > 0 && (
                <span className="text-xs text-gray-400 ml-0.5">
                  ({drawing.polygon.length})
                </span>
              )}
            </button>
            <button
              onClick={handlePolygonClear}
              disabled={!drawing.polygon || drawing.polygon.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-200 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ClearOutlined style={{ fontSize: 14 }} />
              다시 그리기
            </button>
          </div>
        )}

        {/* 반경 드로잉 중 다시그리기 버튼 */}
        {drawing.mode === 'radius' && drawing.center && (
          <div className="absolute top-4 left-4 z-[500]">
            <button
              onClick={handlePolygonClear}
              className="flex items-center gap-1.5 px-3 py-2 bg-white rounded-lg shadow-lg border border-gray-200 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <ClearOutlined style={{ fontSize: 14 }} />
              다시 그리기
            </button>
          </div>
        )}

        {/* 그리기 안내 오버레이 */}
        {drawing.mode === 'none' && !drawnRadius && !drawnPolygon && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg text-center">
              <AimOutlined style={{ fontSize: 32, color: '#9CA3AF' }} />
              <p className="mt-2 text-sm font-medium text-gray-700">
                좌측 패널에서 그리기 도구를 선택하세요
              </p>
              <p className="text-xs text-gray-500 mt-1">
                반경 또는 폴리곤으로 배달 구역을 설정할 수 있습니다
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ====== 우측 상권 리스트 패널 ====== */}
      {storeZones.length > 0 && (
        <ZoneListPanel
          zones={storeZones}
          currentEditId={id}
          onEdit={(zone) => {
            // 지도 포커스 이동
            setFocusTarget({
              center: zone.center,
              radiusKm: zone.type === 'radius' ? zone.radius : undefined,
              _ts: Date.now(),
            });
            // 편집 페이지로 이동
            navigate(`/delivery-zones/${zone.id}/edit`);
          }}
          onMainZoneClick={(zone) => {
            // 이미 메인상권이 그려진 상태에서 메인상권 카드 클릭 시 초기화 여부 확인
            if (drawnCenter || drawnRadius || drawnPolygon) {
              if (window.confirm('현재 그려진 상권 영역이 초기화됩니다. 계속하시겠습니까?')) {
                handleReset();
                setFocusTarget({
                  center: zone.center,
                  radiusKm: zone.type === 'radius' ? zone.radius : undefined,
                  _ts: Date.now(),
                });
                navigate(`/delivery-zones/${zone.id}/edit`);
              }
            } else {
              setFocusTarget({
                center: zone.center,
                radiusKm: zone.type === 'radius' ? zone.radius : undefined,
                _ts: Date.now(),
              });
              navigate(`/delivery-zones/${zone.id}/edit`);
            }
          }}
        />
      )}
    </div>
  );
};

// ============================================
// 우측 상권 리스트 패널
// ============================================

const ZoneListPanel: React.FC<{
  zones: DeliveryZone[];
  currentEditId?: string;
  onEdit: (zone: DeliveryZone) => void;
  onMainZoneClick?: (zone: DeliveryZone) => void;
}> = ({ zones, currentEditId, onEdit, onMainZoneClick }) => {
  const mainZones = zones.filter((z) => z.zoneLevel === 'main');
  const subZones = zones.filter((z) => z.zoneLevel === 'sub');

  return (
    <div className="w-64 border-l border-gray-200 bg-gray-50 flex flex-col">
      <div className="p-3 border-b border-gray-200 bg-white">
        <h3 className="text-sm font-bold text-gray-800">상권 목록</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          {zones[0]?.storeName} · {zones.length}개
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* 메인 상권 */}
        {mainZones.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1">
              메인 상권
            </p>
            {mainZones.map((zone) => (
              <ZoneListCard
                key={zone.id}
                zone={zone}
                isEditing={zone.id === currentEditId}
                onEdit={() => onMainZoneClick ? onMainZoneClick(zone) : onEdit(zone)}
              />
            ))}
          </div>
        )}

        {/* 소상권 */}
        {subZones.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1 mb-1 mt-3">
              소상권
            </p>
            {subZones.map((zone) => (
              <ZoneListCard
                key={zone.id}
                zone={zone}
                isEditing={zone.id === currentEditId}
                onEdit={() => onEdit(zone)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 상권 리스트 카드 (박스 디자인)
// ============================================

const ZoneListCard: React.FC<{
  zone: DeliveryZone;
  isEditing: boolean;
  onEdit: () => void;
}> = ({ zone, isEditing, onEdit }) => (
  <div
    className={`p-2.5 rounded-lg border transition-all ${
      isEditing
        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}
  >
    <div className="flex items-start gap-2">
      <div
        className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5"
        style={{ backgroundColor: zone.color }}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="text-xs font-semibold text-gray-900 truncate">{zone.name}</p>
          {isEditing && (
            <span className="text-[9px] text-blue-600 font-medium bg-blue-100 px-1 rounded">
              편집중
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-500">
          {zone.type === 'radius' && zone.innerRadius != null && zone.outerRadius != null ? (
            <span>{Math.round(zone.innerRadius * 1000)}m~{Math.round(zone.outerRadius * 1000)}m</span>
          ) : zone.type === 'radius' && zone.radius ? (
            <span>{zone.radius}km</span>
          ) : null}
          <span>
            {zone.zoneLevel === 'main' ? '' : '+'}
            {zone.deliveryFee.toLocaleString()}원
          </span>
          <Badge
            variant={zone.isActive ? 'success' : 'default'}
          >
            {zone.isActive ? '활성' : '비활성'}
          </Badge>
        </div>
        {zone.zoneLevel === 'main' && zone.minOrderAmount && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            최소 {zone.minOrderAmount.toLocaleString()}원
          </p>
        )}
      </div>
    </div>
    {!isEditing && (
      <div className="flex justify-end mt-1">
        <button
          onClick={onEdit}
          className="text-[10px] text-gray-400 hover:text-blue-600 flex items-center gap-0.5"
        >
          <EditOutlined style={{ fontSize: 10 }} />
          수정
        </button>
      </div>
    )}
  </div>
);
