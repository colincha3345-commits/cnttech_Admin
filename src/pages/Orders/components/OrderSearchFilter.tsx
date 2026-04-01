import React, { useRef } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  SearchInput,
} from '@/components/ui';
import { SearchOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  ORDER_DELIVERY_TYPE_LABELS,
  ORDER_STATUS_LABELS,
} from '@/types';
import type { OrderDeliveryType } from '@/types/order';
import type { OrderStatus } from '@/types/app-member';

const STORE_OPTIONS = [
  { value: '', label: '전체 가맹점' },
  { value: 'store-1', label: '강남점' },
  { value: 'store-2', label: '홍대점' },
  { value: 'store-3', label: '잠실점' },
  { value: 'store-4', label: '신촌점' },
  { value: 'store-5', label: '건대점' },
];

interface OrderSearchFilterProps {
  keyword: string;
  setKeyword: (v: string) => void;
  orderType: OrderDeliveryType | '';
  setOrderType: (v: OrderDeliveryType | '') => void;
  status: OrderStatus | '';
  setStatus: (v: OrderStatus | '') => void;
  storeId: string;
  setStoreId: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  onSearch: () => void;
  onReset: () => void;
  onExcelDownload: () => void;
}

export function OrderSearchFilter({
  keyword, setKeyword,
  orderType, setOrderType,
  status, setStatus,
  storeId, setStoreId,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  onSearch, onReset, onExcelDownload,
}: OrderSearchFilterProps) {
  const dateFromRef = useRef<HTMLInputElement>(null);
  const dateToRef = useRef<HTMLInputElement>(null);

  const openPicker = (ref: React.RefObject<HTMLInputElement | null>) => {
    try { ref.current?.showPicker(); } catch { ref.current?.focus(); }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-txt-main flex items-center gap-2">
            <SearchOutlined />
            주문 검색
          </h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onReset}>
              초기화
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onExcelDownload}
            >
              <DownloadOutlined className="mr-1" />
              엑셀 다운로드
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 기간 */}
          <div>
            <label className="block text-xs font-medium text-txt-muted mb-1">시작일</label>
            <div
              className="relative cursor-pointer"
              onClick={() => openPicker(dateFromRef)}
            >
              <input
                ref={dateFromRef}
                type="date"
                value={dateFrom}
                onChange={(e) => { setDateFrom(e.target.value); onSearch(); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-txt-muted mb-1">종료일</label>
            <div
              className="relative cursor-pointer"
              onClick={() => openPicker(dateToRef)}
            >
              <input
                ref={dateToRef}
                type="date"
                value={dateTo}
                onChange={(e) => { setDateTo(e.target.value); onSearch(); }}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
              />
            </div>
          </div>

          {/* 주문유형 */}
          <div>
            <label className="block text-xs font-medium text-txt-muted mb-1">주문유형</label>
            <select
              value={orderType}
              onChange={(e) => { setOrderType(e.target.value as OrderDeliveryType | ''); onSearch(); }}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">전체</option>
              {Object.entries(ORDER_DELIVERY_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-xs font-medium text-txt-muted mb-1">상태</label>
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value as OrderStatus | ''); onSearch(); }}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">전체</option>
              {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* 가맹점 */}
          <div>
            <label className="block text-xs font-medium text-txt-muted mb-1">가맹점</label>
            <select
              value={storeId}
              onChange={(e) => { setStoreId(e.target.value); onSearch(); }}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-white text-txt-main focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {STORE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* 키워드 */}
          <div>
            <label className="block text-xs font-medium text-txt-muted mb-1">검색</label>
            <SearchInput
              value={keyword}
              onChange={setKeyword}
              placeholder="주문번호, 이름, 연락처, 주소, 매장명, 메뉴명"
              onSearch={onSearch}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
