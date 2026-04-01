/**
 * Leaflet 기반 지도 컴포넌트
 * OpenStreetMap 타일 + 상권 시각화 + 드로잉
 * 참고: 네이버 지도 상권 관리 UI 벤치마킹
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Circle,
  Polygon as LeafletPolygon,
  Polyline,
  CircleMarker,
  Marker,
  useMapEvents,
  useMap,
  Tooltip,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Coordinate, DeliveryZone } from '@/types/delivery-zone';

// ============================================
// 타입
// ============================================

export type DrawMode = 'none' | 'radius' | 'polygon';

export interface DrawingState {
  mode: DrawMode;
  center?: Coordinate;
  radius?: number;
  polygon?: Coordinate[];
  color: string;
}

export interface FocusTarget {
  center: Coordinate;
  radiusKm?: number; // 반경 상권 시 해당 반경으로 줌 맞춤
  _ts: number;       // 동일 좌표 재이동용 타임스탬프
}

interface MapViewProps {
  zones: DeliveryZone[];
  selectedZoneId?: string;
  onZoneClick?: (zone: DeliveryZone) => void;
  drawing?: DrawingState;
  onDrawUpdate?: (state: Partial<DrawingState>) => void;
  onDrawComplete?: (state: DrawingState) => void;
  focusTarget?: FocusTarget;
  storePin?: Coordinate;
  readOnly?: boolean;
  className?: string;
}

// ============================================
// 유틸
// ============================================

const toLL = (c: Coordinate): [number, number] => [c.lat, c.lng];

function haversineKm(a: Coordinate, b: Coordinate): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function polygonAreaKm2(coords: Coordinate[]): number {
  if (coords.length < 3) return 0;
  const R = 6371;
  let total = 0;
  for (let i = 0; i < coords.length; i++) {
    const j = (i + 1) % coords.length;
    const lat1 = (coords[i]!.lat * Math.PI) / 180;
    const lat2 = (coords[j]!.lat * Math.PI) / 180;
    const dLng = ((coords[j]!.lng - coords[i]!.lng) * Math.PI) / 180;
    total += dLng * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  return Math.abs((total * R * R) / 2);
}

function formatDist(km: number): string {
  return km >= 1 ? `${km.toFixed(1)}km` : `${Math.round(km * 1000)}m`;
}

function formatArea(km2: number): string {
  return km2 >= 0.01 ? `${km2.toFixed(2)}km²` : `${(km2 * 1e6).toFixed(0)}m²`;
}

// ============================================
// 존 오버레이
// ============================================

const ZoneOverlay: React.FC<{
  zone: DeliveryZone;
  isSelected: boolean;
  onClick?: () => void;
}> = ({ zone, isSelected, onClick }) => {
  const fillOpacity = isSelected ? 0.25 : 0.12;
  const opacity = isSelected ? 0.9 : 0.5;
  const weight = isSelected ? 3 : 2;
  const dashArray = zone.isActive ? undefined : '10 6';

  const eventHandlers = onClick
    ? { click: () => onClick() }
    : undefined;

  if (zone.type === 'radius' && zone.radius) {
    return (
      <>
        <Circle
          center={toLL(zone.center)}
          radius={zone.radius * 1000}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity,
            opacity,
            weight,
            dashArray,
          }}
          eventHandlers={eventHandlers}
        >
          <Tooltip
            direction="center"
            permanent={isSelected}
            className="zone-tooltip"
          >
            <div className="text-center">
              <div className="font-semibold text-xs">{zone.name}</div>
              <div className="text-[10px] text-gray-500">{zone.storeName}</div>
            </div>
          </Tooltip>
        </Circle>
        <CircleMarker
          center={toLL(zone.center)}
          radius={isSelected ? 7 : 5}
          pathOptions={{
            color: '#fff',
            fillColor: zone.color,
            fillOpacity: 1,
            weight: 2,
          }}
        />
      </>
    );
  }

  if (zone.type === 'polygon' && zone.polygon && zone.polygon.length >= 3) {
    return (
      <>
        <LeafletPolygon
          positions={zone.polygon.map(toLL)}
          pathOptions={{
            color: zone.color,
            fillColor: zone.color,
            fillOpacity,
            opacity,
            weight,
            dashArray,
          }}
          eventHandlers={eventHandlers}
        >
          <Tooltip
            direction="center"
            permanent={isSelected}
            className="zone-tooltip"
          >
            <div className="text-center">
              <div className="font-semibold text-xs">{zone.name}</div>
              <div className="text-[10px] text-gray-500">{zone.storeName}</div>
            </div>
          </Tooltip>
        </LeafletPolygon>
        {/* 폴리곤 꼭짓점 마커 */}
        {isSelected &&
          zone.polygon.map((coord, i) => (
            <CircleMarker
              key={i}
              center={toLL(coord)}
              radius={4}
              pathOptions={{
                color: zone.color,
                fillColor: '#fff',
                fillOpacity: 1,
                weight: 2,
              }}
            />
          ))}
      </>
    );
  }

  return null;
};

// ============================================
// 드로잉 핸들러
// ============================================

const DrawingHandler: React.FC<{
  drawing: DrawingState;
  onUpdate: (state: Partial<DrawingState>) => void;
  onComplete: (state: DrawingState) => void;
}> = ({ drawing, onUpdate, onComplete }) => {
  const [mousePos, setMousePos] = useState<Coordinate | null>(null);
  const map = useMap();

  // 커서 & 더블클릭줌 제어
  useEffect(() => {
    const container = map.getContainer();
    container.style.cursor = 'crosshair';
    map.doubleClickZoom.disable();
    return () => {
      container.style.cursor = '';
      map.doubleClickZoom.enable();
    };
  }, [map]);

  // ESC 키로 취소
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onUpdate({ center: undefined, radius: undefined, polygon: [] });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onUpdate]);

  useMapEvents({
    click(e) {
      const coord: Coordinate = { lat: e.latlng.lat, lng: e.latlng.lng };

      if (drawing.mode === 'radius') {
        if (!drawing.center) {
          onUpdate({ center: coord, radius: 0 });
        } else {
          const r = haversineKm(drawing.center, coord);
          if (r > 0.02) {
            onComplete({
              ...drawing,
              radius: Math.round(r * 10) / 10,
            });
          }
        }
      }

      if (drawing.mode === 'polygon') {
        const poly = drawing.polygon || [];
        if (poly.length >= 3) {
          const first = poly[0]!;
          // 화면 픽셀 기준 15px 이내 클릭 시 닫기
          const firstPt = map.latLngToContainerPoint([first.lat, first.lng]);
          const clickPt = map.latLngToContainerPoint(e.latlng);
          const pxDist = firstPt.distanceTo(clickPt);
          if (pxDist < 20) {
            onComplete({ ...drawing, polygon: poly });
            return;
          }
        }
        onUpdate({ polygon: [...poly, coord] });
      }
    },
    mousemove(e) {
      setMousePos({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  // === 반경 미리보기 ===
  if (drawing.mode === 'radius' && drawing.center && mousePos) {
    const r = haversineKm(drawing.center, mousePos);
    return (
      <>
        <Circle
          center={toLL(drawing.center)}
          radius={r * 1000}
          pathOptions={{
            color: drawing.color,
            fillColor: drawing.color,
            fillOpacity: 0.15,
            opacity: 0.7,
            weight: 2,
            dashArray: '8 4',
          }}
        />
        <CircleMarker
          center={toLL(drawing.center)}
          radius={6}
          pathOptions={{
            color: '#fff',
            fillColor: drawing.color,
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Tooltip direction="right" permanent className="measure-tooltip">
            <span className="font-semibold">총반경 {formatDist(r)}</span>
          </Tooltip>
        </CircleMarker>
        {/* 반경선 (중심→마우스) */}
        <Polyline
          positions={[toLL(drawing.center), toLL(mousePos)]}
          pathOptions={{
            color: drawing.color,
            weight: 1.5,
            dashArray: '4 4',
            opacity: 0.6,
          }}
        />
      </>
    );
  }

  // === 폴리곤 미리보기 ===
  if (drawing.mode === 'polygon') {
    const poly = drawing.polygon || [];
    if (poly.length > 0 && mousePos) {
      const allPositions = [...poly.map(toLL), toLL(mousePos)];
      const area = poly.length >= 2 ? polygonAreaKm2([...poly, mousePos]) : 0;

      return (
        <>
          {/* 선 */}
          <Polyline
            positions={allPositions}
            pathOptions={{
              color: drawing.color,
              weight: 2,
              dashArray: '6 4',
              opacity: 0.7,
            }}
          />
          {/* 닫힌 영역 미리보기 */}
          {poly.length >= 2 && (
            <LeafletPolygon
              positions={allPositions}
              pathOptions={{
                color: 'transparent',
                fillColor: drawing.color,
                fillOpacity: 0.1,
                weight: 0,
              }}
            />
          )}
          {/* 꼭짓점 마커 */}
          {poly.map((coord, i) => (
            <CircleMarker
              key={i}
              center={toLL(coord)}
              radius={i === 0 && poly.length >= 3 ? 8 : 5}
              pathOptions={{
                color: drawing.color,
                fillColor: i === 0 && poly.length >= 3 ? drawing.color : '#fff',
                fillOpacity: 1,
                weight: 2,
              }}
            />
          ))}
          {/* 면적 툴팁 */}
          {poly.length >= 2 && area > 0 && (
            <CircleMarker
              center={toLL(poly[0]!)}
              radius={0}
              pathOptions={{ opacity: 0, fillOpacity: 0 }}
            >
              <Tooltip direction="right" permanent offset={[10, 0]} className="measure-tooltip">
                <span className="font-semibold">총면적 {formatArea(area)}</span>
              </Tooltip>
            </CircleMarker>
          )}
        </>
      );
    }
  }

  return null;
};

// ============================================
// 완료된 드로잉 오버레이 (저장 전까지 지도에 표시)
// ============================================

const CompletedDrawingOverlay: React.FC<{ drawing: DrawingState }> = ({ drawing }) => {
  // 반경 완료
  if (drawing.center && drawing.radius && drawing.radius > 0) {
    return (
      <>
        <Circle
          center={toLL(drawing.center)}
          radius={drawing.radius * 1000}
          pathOptions={{
            color: drawing.color,
            fillColor: drawing.color,
            fillOpacity: 0.15,
            opacity: 0.8,
            weight: 2,
          }}
        />
        <CircleMarker
          center={toLL(drawing.center)}
          radius={6}
          pathOptions={{
            color: '#fff',
            fillColor: drawing.color,
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Tooltip direction="right" permanent className="measure-tooltip">
            <span className="font-semibold">반경 {formatDist(drawing.radius)}</span>
          </Tooltip>
        </CircleMarker>
      </>
    );
  }

  // 폴리곤 완료
  if (drawing.polygon && drawing.polygon.length >= 3) {
    const area = polygonAreaKm2(drawing.polygon);
    return (
      <>
        <LeafletPolygon
          positions={drawing.polygon.map(toLL)}
          pathOptions={{
            color: drawing.color,
            fillColor: drawing.color,
            fillOpacity: 0.15,
            opacity: 0.8,
            weight: 2,
          }}
        />
        {drawing.polygon.map((coord, i) => (
          <CircleMarker
            key={i}
            center={toLL(coord)}
            radius={4}
            pathOptions={{
              color: drawing.color,
              fillColor: '#fff',
              fillOpacity: 1,
              weight: 2,
            }}
          />
        ))}
        {area > 0 && (
          <CircleMarker
            center={toLL(drawing.polygon[0]!)}
            radius={0}
            pathOptions={{ opacity: 0, fillOpacity: 0 }}
          >
            <Tooltip direction="right" permanent offset={[10, 0]} className="measure-tooltip">
              <span className="font-semibold">면적 {formatArea(area)}</span>
            </Tooltip>
          </CircleMarker>
        )}
      </>
    );
  }

  return null;
};

// ============================================
// 자동 바운드 맞춤
// ============================================

const FitBounds: React.FC<{ zones: DeliveryZone[] }> = ({ zones }) => {
  const map = useMap();

  useEffect(() => {
    if (zones.length === 0) return;

    const bounds = L.latLngBounds([]);
    for (const zone of zones) {
      if (zone.type === 'radius' && zone.radius) {
        const center = L.latLng(zone.center.lat, zone.center.lng);
        bounds.extend(center.toBounds(zone.radius * 2000));
      } else if (zone.type === 'polygon' && zone.polygon) {
        for (const c of zone.polygon) {
          bounds.extend([c.lat, c.lng]);
        }
      } else {
        bounds.extend([zone.center.lat, zone.center.lng]);
      }
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [zones.length, map]);

  return null;
};

// ============================================
// 포커스 이동 (flyTo)
// ============================================

const FlyToTarget: React.FC<{ target?: FocusTarget }> = ({ target }) => {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    if (target.radiusKm) {
      const center = L.latLng(target.center.lat, target.center.lng);
      map.flyToBounds(center.toBounds(target.radiusKm * 2000), {
        padding: [60, 60],
        maxZoom: 15,
        duration: 0.8,
      });
    } else {
      map.flyTo([target.center.lat, target.center.lng], 14, { duration: 0.8 });
    }
  }, [target?._ts, map]);

  return null;
};

// ============================================
// 메인 컴포넌트
// ============================================

export const MapView: React.FC<MapViewProps> = ({
  zones,
  selectedZoneId,
  onZoneClick,
  drawing,
  onDrawUpdate,
  onDrawComplete,
  focusTarget,
  storePin,
  readOnly = false,
  className = '',
}) => {
  const defaultCenter = useMemo<[number, number]>(() => {
    if (zones.length === 0) return [37.5265, 127.0];
    const lats = zones.map((z) => z.center.lat);
    const lngs = zones.map((z) => z.center.lng);
    return [
      (Math.min(...lats) + Math.max(...lats)) / 2,
      (Math.min(...lngs) + Math.max(...lngs)) / 2,
    ];
  }, [zones]);

  const isDrawing = drawing && drawing.mode !== 'none';

  return (
    <div className={`relative w-full h-full ${className}`} style={{ minHeight: 400 }}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        {/* CartoDB Voyager 타일 (네이버맵 스타일에 가까움) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <FitBounds zones={zones} />
        <FlyToTarget target={focusTarget} />

        {/* 매장 위치 핀 */}
        {storePin && (
          <Marker
            position={toLL(storePin)}
            icon={L.divIcon({
              className: '',
              html: '<div style="width:28px;height:28px;background:#EF4444;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
              iconSize: [28, 28],
              iconAnchor: [14, 14],
            })}
          >
            <Tooltip direction="top" offset={[0, -16]} permanent>
              매장 위치
            </Tooltip>
          </Marker>
        )}

        {/* 존 오버레이 */}
        {zones.map((zone) => (
          <ZoneOverlay
            key={zone.id}
            zone={zone}
            isSelected={zone.id === selectedZoneId}
            onClick={onZoneClick ? () => onZoneClick(zone) : undefined}
          />
        ))}

        {/* 드로잉 핸들러 */}
        {!readOnly && isDrawing && onDrawUpdate && onDrawComplete && (
          <DrawingHandler
            drawing={drawing}
            onUpdate={onDrawUpdate}
            onComplete={onDrawComplete}
          />
        )}

        {/* 완료된 드로잉 영역 유지 표시 */}
        {!readOnly && drawing && drawing.mode === 'none' && (
          <CompletedDrawingOverlay drawing={drawing} />
        )}

        <ZoomControls />
      </MapContainer>

      {/* 드로잉 안내 오버레이 */}
      {isDrawing && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[500]">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border text-sm text-gray-700">
            {drawing.mode === 'radius' && !drawing.center && (
              <span>지도를 <strong>클릭</strong>하여 중심점을 설정하세요</span>
            )}
            {drawing.mode === 'radius' && drawing.center && (
              <span>지도를 <strong>클릭</strong>하여 반경을 확정하세요 · <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">ESC</kbd> 취소</span>
            )}
            {drawing.mode === 'polygon' && (
              <span>
                <strong>클릭</strong>하여 꼭짓점 추가 ·{' '}
                {(drawing.polygon?.length ?? 0) >= 3
                  ? '첫 점 클릭으로 완성'
                  : '최소 3개 필요'}{' '}
                · <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">ESC</kbd> 취소
              </span>
            )}
          </div>
        </div>
      )}

      {/* 측정 정보 패널 (네이버맵 스타일) */}
      {!readOnly && drawing && drawing.mode === 'none' && (
        <MeasurementPanel drawing={drawing} />
      )}
    </div>
  );
};

// ============================================
// 줌 컨트롤 (MapContainer 내부, useMap 사용)
// ============================================

const ZoomControls: React.FC = () => {
  const map = useMap();

  return (
    <div className="leaflet-bottom leaflet-right" style={{ marginBottom: 16, marginRight: 16 }}>
      <div className="leaflet-control flex flex-col gap-1">
        <button
          className="w-8 h-8 bg-white rounded shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-base font-medium"
          onClick={() => map.zoomIn()}
        >
          +
        </button>
        <button
          className="w-8 h-8 bg-white rounded shadow-md border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-base font-medium"
          onClick={() => map.zoomOut()}
        >
          −
        </button>
      </div>
    </div>
  );
};

// ============================================
// 측정 정보 패널
// ============================================

const MeasurementPanel: React.FC<{ drawing: DrawingState }> = ({ drawing }) => {
  // 드로잉 완료 후의 정보만 표시
  if (drawing.mode !== 'none') return null;

  const hasRadius = drawing.center && drawing.radius && drawing.radius > 0;
  const hasPolygon = drawing.polygon && drawing.polygon.length >= 3;

  if (!hasRadius && !hasPolygon) return null;

  return (
    <div className="absolute top-4 right-4 z-[500] bg-white rounded-lg shadow-lg border border-gray-200 p-3 min-w-[160px]">
      {hasRadius && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-xs text-gray-500">총반경</span>
          <span className="text-sm font-bold text-blue-600">
            {formatDist(drawing.radius!)}
          </span>
        </div>
      )}
      {hasPolygon && (
        <>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-gray-500">총면적</span>
            <span className="text-sm font-bold text-blue-600">
              {formatArea(polygonAreaKm2(drawing.polygon!))}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4 mt-1">
            <span className="text-xs text-gray-500">꼭짓점</span>
            <span className="text-sm font-medium text-gray-700">
              {drawing.polygon!.length}개
            </span>
          </div>
        </>
      )}
    </div>
  );
};
