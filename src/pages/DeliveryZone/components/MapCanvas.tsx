/**
 * 캔버스 기반 지도 컴포넌트
 * 상권(반경/폴리곤)을 시각적으로 표시하고 드로잉 기능 제공
 */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { Coordinate, DeliveryZone } from '@/types/delivery-zone';

// ============================================
// 좌표 변환 유틸
// ============================================

// 서울 중심 기준 뷰포트
const DEFAULT_CENTER = { lat: 37.5265, lng: 127.0 };
const KM_PER_LAT = 111.32;
const KM_PER_LNG = 88.8; // 위도 37도 기준

interface ViewState {
  centerLat: number;
  centerLng: number;
  zoom: number; // pixels per km
}

function latLngToPixel(
  coord: Coordinate,
  view: ViewState,
  canvasW: number,
  canvasH: number
): { x: number; y: number } {
  const dLat = coord.lat - view.centerLat;
  const dLng = coord.lng - view.centerLng;
  const kmX = dLng * KM_PER_LNG;
  const kmY = -dLat * KM_PER_LAT; // y축 반전
  return {
    x: canvasW / 2 + kmX * view.zoom,
    y: canvasH / 2 + kmY * view.zoom,
  };
}

function pixelToLatLng(
  px: number,
  py: number,
  view: ViewState,
  canvasW: number,
  canvasH: number
): Coordinate {
  const kmX = (px - canvasW / 2) / view.zoom;
  const kmY = (py - canvasH / 2) / view.zoom;
  return {
    lat: view.centerLat - kmY / KM_PER_LAT,
    lng: view.centerLng + kmX / KM_PER_LNG,
  };
}

function distanceKm(a: Coordinate, b: Coordinate): number {
  const dLat = (b.lat - a.lat) * KM_PER_LAT;
  const dLng = (b.lng - a.lng) * KM_PER_LNG;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

// ============================================
// Props
// ============================================

export type DrawMode = 'none' | 'radius' | 'polygon';

export interface DrawingState {
  mode: DrawMode;
  center?: Coordinate;
  radius?: number;
  polygon?: Coordinate[];
  color: string;
}

interface MapCanvasProps {
  zones: DeliveryZone[];
  selectedZoneId?: string;
  onZoneClick?: (zone: DeliveryZone) => void;
  // 드로잉
  drawing?: DrawingState;
  onDrawUpdate?: (state: Partial<DrawingState>) => void;
  onDrawComplete?: (state: DrawingState) => void;
  // 읽기전용 모드 (리스트 페이지)
  readOnly?: boolean;
  className?: string;
}

// ============================================
// 컴포넌트
// ============================================

export const MapCanvas: React.FC<MapCanvasProps> = ({
  zones,
  selectedZoneId,
  onZoneClick,
  drawing,
  onDrawUpdate,
  onDrawComplete,
  readOnly = false,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 800, h: 600 });
  const [view, setView] = useState<ViewState>({
    centerLat: DEFAULT_CENTER.lat,
    centerLng: DEFAULT_CENTER.lng,
    zoom: 40, // 40px = 1km
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawCenter, setDrawCenter] = useState<{ x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // 캔버스 크기 맞추기
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const obs = new ResizeObserver((entries) => {
      const { width, height } = entries[0]!.contentRect;
      setSize({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(container);
    return () => obs.disconnect();
  }, []);

  // 존재하는 매장 중심으로 뷰 맞추기
  useEffect(() => {
    if (zones.length === 0) return;
    const lats = zones.map((z) => z.center.lat);
    const lngs = zones.map((z) => z.center.lng);
    const cLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const cLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    setView((v) => ({ ...v, centerLat: cLat, centerLng: cLng }));
  }, [zones.length]);

  // ============================================
  // 렌더링
  // ============================================

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = size;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // 배경
    ctx.fillStyle = '#F0F4F3';
    ctx.fillRect(0, 0, w, h);

    // 그리드
    drawGrid(ctx, w, h, view);

    // 기존 상권 그리기
    for (const zone of zones) {
      const isSelected = zone.id === selectedZoneId;
      const isHovered = zone.id === hoveredZone;
      drawZone(ctx, zone, view, w, h, isSelected, isHovered);
    }

    // 현재 드로잉 미리보기
    if (drawing && drawing.mode !== 'none') {
      drawPreview(ctx, drawing, drawCenter, mousePos, view, w, h);
    }
  }, [size, view, zones, selectedZoneId, hoveredZone, drawing, drawCenter, mousePos]);

  useEffect(() => {
    requestAnimationFrame(render);
  }, [render]);

  // ============================================
  // 이벤트 핸들러
  // ============================================

  const getCanvasPos = (e: React.MouseEvent): { x: number; y: number } => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);

    // 드로잉 모드
    if (drawing && drawing.mode !== 'none' && !readOnly) {
      if (drawing.mode === 'radius') {
        setIsDrawing(true);
        setDrawCenter(pos);
        const coord = pixelToLatLng(pos.x, pos.y, view, size.w, size.h);
        onDrawUpdate?.({ center: coord, radius: 0 });
      }
      if (drawing.mode === 'polygon') {
        const coord = pixelToLatLng(pos.x, pos.y, view, size.w, size.h);
        const currentPolygon = drawing.polygon || [];
        // 더블클릭으로 완성 체크 (첫 점 근처)
        if (currentPolygon.length >= 3) {
          const firstPx = latLngToPixel(currentPolygon[0]!, view, size.w, size.h);
          const dist = Math.sqrt((pos.x - firstPx.x) ** 2 + (pos.y - firstPx.y) ** 2);
          if (dist < 15) {
            onDrawComplete?.({ ...drawing, polygon: currentPolygon });
            return;
          }
        }
        onDrawUpdate?.({ polygon: [...currentPolygon, coord] });
      }
      return;
    }

    // 존 클릭 체크
    if (onZoneClick) {
      for (const zone of [...zones].reverse()) {
        if (isPointInZone(pos.x, pos.y, zone, view, size.w, size.h)) {
          onZoneClick(zone);
          return;
        }
      }
    }

    // 패닝
    setIsPanning(true);
    setPanStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getCanvasPos(e);
    setMousePos(pos);

    if (isPanning) {
      const dx = e.clientX - panStart.x;
      const dy = e.clientY - panStart.y;
      setView((v) => ({
        ...v,
        centerLng: v.centerLng - dx / v.zoom / KM_PER_LNG,
        centerLat: v.centerLat + dy / v.zoom / KM_PER_LAT,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }

    // 드로잉 중 (반경)
    if (isDrawing && drawing?.mode === 'radius' && drawCenter) {
      const centerCoord = pixelToLatLng(drawCenter.x, drawCenter.y, view, size.w, size.h);
      const currentCoord = pixelToLatLng(pos.x, pos.y, view, size.w, size.h);
      const r = distanceKm(centerCoord, currentCoord);
      onDrawUpdate?.({ radius: Math.round(r * 10) / 10 });
    }

    // 호버 체크
    if (!isDrawing && !isPanning && onZoneClick) {
      let found = false;
      for (const zone of [...zones].reverse()) {
        if (isPointInZone(pos.x, pos.y, zone, view, size.w, size.h)) {
          setHoveredZone(zone.id);
          found = true;
          break;
        }
      }
      if (!found) setHoveredZone(null);
    }
  };

  const handleMouseUp = () => {
    if (isDrawing && drawing?.mode === 'radius' && drawing.center && drawing.radius) {
      if (drawing.radius > 0.1) {
        onDrawComplete?.({ ...drawing });
      }
    }
    setIsPanning(false);
    setIsDrawing(false);
    setDrawCenter(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setView((v) => ({
      ...v,
      zoom: Math.max(5, Math.min(200, v.zoom * delta)),
    }));
  };

  // 커서 스타일
  const getCursor = () => {
    if (drawing && drawing.mode !== 'none') return 'crosshair';
    if (isPanning) return 'grabbing';
    if (hoveredZone) return 'pointer';
    return 'grab';
  };

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: size.w, height: size.h, cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      {/* 줌 컨트롤 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button
          className="w-8 h-8 bg-white rounded shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          onClick={() => setView((v) => ({ ...v, zoom: Math.min(200, v.zoom * 1.3) }))}
        >
          +
        </button>
        <button
          className="w-8 h-8 bg-white rounded shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50"
          onClick={() => setView((v) => ({ ...v, zoom: Math.max(5, v.zoom * 0.7) }))}
        >
          −
        </button>
      </div>
      {/* 스케일 바 */}
      <div className="absolute bottom-4 left-4 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 border">
        {view.zoom >= 20 ? '1km' : `${Math.round(20 / view.zoom)}km`}
        <div
          className="h-0.5 bg-gray-800 mt-0.5"
          style={{ width: Math.max(20, view.zoom * (view.zoom >= 20 ? 1 : 20 / view.zoom)) }}
        />
      </div>
      {/* 마우스 좌표 */}
      {mousePos && (
        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-500 font-mono border">
          {(() => {
            const coord = pixelToLatLng(mousePos.x, mousePos.y, view, size.w, size.h);
            return `${coord.lat.toFixed(4)}, ${coord.lng.toFixed(4)}`;
          })()}
        </div>
      )}
    </div>
  );
};

// ============================================
// 그리기 함수들
// ============================================

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number, view: ViewState) {
  const gridKm = view.zoom > 60 ? 0.5 : view.zoom > 20 ? 1 : view.zoom > 8 ? 5 : 10;
  const gridPx = gridKm * view.zoom;

  ctx.strokeStyle = '#D4DCD9';
  ctx.lineWidth = 0.5;

  const offsetX = (w / 2) % gridPx;
  const offsetY = (h / 2) % gridPx;

  for (let x = offsetX; x < w; x += gridPx) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = offsetY; y < h; y += gridPx) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // 도로 흉내 (굵은 선)
  ctx.strokeStyle = '#C8D4D0';
  ctx.lineWidth = 1;
  const majorGrid = gridPx * 5;
  const mOffX = (w / 2) % majorGrid;
  const mOffY = (h / 2) % majorGrid;

  for (let x = mOffX; x < w; x += majorGrid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = mOffY; y < h; y += majorGrid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
}

function drawZone(
  ctx: CanvasRenderingContext2D,
  zone: DeliveryZone,
  view: ViewState,
  w: number,
  h: number,
  isSelected: boolean,
  isHovered: boolean
) {
  const centerPx = latLngToPixel(zone.center, view, w, h);

  if (zone.type === 'radius' && zone.radius) {
    const radiusPx = zone.radius * view.zoom;
    // 채우기
    ctx.beginPath();
    ctx.arc(centerPx.x, centerPx.y, radiusPx, 0, Math.PI * 2);
    ctx.fillStyle = hexToRgba(zone.color, isSelected ? 0.25 : isHovered ? 0.2 : 0.12);
    ctx.fill();
    // 테두리
    ctx.strokeStyle = hexToRgba(zone.color, isSelected ? 0.9 : 0.6);
    ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1.5;
    if (!zone.isActive) {
      ctx.setLineDash([6, 4]);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  if (zone.type === 'polygon' && zone.polygon && zone.polygon.length >= 3) {
    ctx.beginPath();
    const firstPx = latLngToPixel(zone.polygon[0]!, view, w, h);
    ctx.moveTo(firstPx.x, firstPx.y);
    for (let i = 1; i < zone.polygon.length; i++) {
      const px = latLngToPixel(zone.polygon[i]!, view, w, h);
      ctx.lineTo(px.x, px.y);
    }
    ctx.closePath();
    ctx.fillStyle = hexToRgba(zone.color, isSelected ? 0.25 : isHovered ? 0.2 : 0.12);
    ctx.fill();
    ctx.strokeStyle = hexToRgba(zone.color, isSelected ? 0.9 : 0.6);
    ctx.lineWidth = isSelected ? 2.5 : isHovered ? 2 : 1.5;
    if (!zone.isActive) ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // 매장 마커
  drawStoreMarker(ctx, centerPx.x, centerPx.y, zone.color, isSelected);

  // 라벨
  ctx.font = `${isSelected ? 'bold ' : ''}11px Inter, sans-serif`;
  ctx.fillStyle = '#374151';
  ctx.textAlign = 'center';
  ctx.fillText(zone.name, centerPx.x, centerPx.y - 16);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#6B7280';
  ctx.fillText(zone.storeName, centerPx.x, centerPx.y - 5);
}

function drawStoreMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  isSelected: boolean
) {
  const r = isSelected ? 7 : 5;
  // 그림자
  ctx.beginPath();
  ctx.arc(x, y + 1, r + 1, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0.15)';
  ctx.fill();
  // 외곽
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x, y, r - 2, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawPreview(
  ctx: CanvasRenderingContext2D,
  drawing: DrawingState,
  _drawCenter: { x: number; y: number } | null,
  mousePos: { x: number; y: number } | null,
  view: ViewState,
  w: number,
  h: number
) {
  if (drawing.mode === 'radius') {
    if (drawing.center) {
      const centerPx = latLngToPixel(drawing.center, view, w, h);
      const radiusPx = (drawing.radius || 0) * view.zoom;

      if (radiusPx > 0) {
        ctx.beginPath();
        ctx.arc(centerPx.x, centerPx.y, radiusPx, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(drawing.color, 0.15);
        ctx.fill();
        ctx.strokeStyle = hexToRgba(drawing.color, 0.7);
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 반경 라벨
        ctx.font = 'bold 12px Inter, sans-serif';
        ctx.fillStyle = drawing.color;
        ctx.textAlign = 'center';
        ctx.fillText(`${drawing.radius}km`, centerPx.x, centerPx.y + radiusPx + 16);
      }

      // 중심점
      drawStoreMarker(ctx, centerPx.x, centerPx.y, drawing.color, true);
    }
    // 드래그 안내 (아직 센터 안 잡았을 때)
    if (!drawing.center && mousePos) {
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.textAlign = 'center';
      ctx.fillText('클릭하여 중심점 설정 → 드래그로 반경 지정', w / 2, h - 30);
    }
  }

  if (drawing.mode === 'polygon') {
    const poly = drawing.polygon || [];
    if (poly.length > 0) {
      ctx.beginPath();
      const firstPx = latLngToPixel(poly[0]!, view, w, h);
      ctx.moveTo(firstPx.x, firstPx.y);

      for (let i = 1; i < poly.length; i++) {
        const px = latLngToPixel(poly[i]!, view, w, h);
        ctx.lineTo(px.x, px.y);
      }

      // 마우스 위치까지 선 연결
      if (mousePos) {
        ctx.lineTo(mousePos.x, mousePos.y);
      }

      if (poly.length >= 3) {
        ctx.closePath();
        ctx.fillStyle = hexToRgba(drawing.color, 0.1);
        ctx.fill();
      }

      ctx.strokeStyle = hexToRgba(drawing.color, 0.7);
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // 정점 그리기
      for (const coord of poly) {
        const px = latLngToPixel(coord, view, w, h);
        ctx.beginPath();
        ctx.arc(px.x, px.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = drawing.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 첫 점 강조 (닫기 가능 안내)
      if (poly.length >= 3) {
        ctx.beginPath();
        ctx.arc(firstPx.x, firstPx.y, 8, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(drawing.color, 0.5);
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    if (poly.length === 0 && mousePos) {
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#6B7280';
      ctx.textAlign = 'center';
      ctx.fillText('클릭하여 꼭짓점 추가 · 첫 점 클릭으로 완성', w / 2, h - 30);
    }
  }
}

function isPointInZone(
  px: number,
  py: number,
  zone: DeliveryZone,
  view: ViewState,
  w: number,
  h: number
): boolean {
  const centerPx = latLngToPixel(zone.center, view, w, h);

  if (zone.type === 'radius' && zone.radius) {
    const radiusPx = zone.radius * view.zoom;
    const dist = Math.sqrt((px - centerPx.x) ** 2 + (py - centerPx.y) ** 2);
    return dist <= radiusPx;
  }

  if (zone.type === 'polygon' && zone.polygon && zone.polygon.length >= 3) {
    const points = zone.polygon.map((c) => latLngToPixel(c, view, w, h));
    return isPointInPolygon(px, py, points);
  }

  return false;
}

function isPointInPolygon(px: number, py: number, points: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i]!.x, yi = points[i]!.y;
    const xj = points[j]!.x, yj = points[j]!.y;
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
