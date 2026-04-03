import React from 'react';
import { Badge } from '@/components/ui';
import { STORE_STATUS_LABELS, type StoreStatus, type Store } from '@/types/store';

interface StoreBasicTabProps {
  store: Store;
  getStatusBadgeVariant: (status: StoreStatus) => "success" | "warning" | "info" | "critical" | "secondary";
  formatDate: (date: Date) => string;
}

export const StoreBasicTab: React.FC<StoreBasicTabProps> = ({
  store,
  getStatusBadgeVariant,
  formatDate,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">기본 정보</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-txt-muted">매장명</label>
          <p className="mt-1 font-medium">{store.name}</p>
        </div>
        <div>
          <label className="text-sm text-txt-muted">매장 코드</label>
          <p className="mt-1 font-mono">{store.code || '-'}</p>
        </div>
        <div>
          <label className="text-sm text-txt-muted">상태</label>
          <div className="mt-1">
            <Badge variant={getStatusBadgeVariant(store.status)}>
              {STORE_STATUS_LABELS[store.status]}
            </Badge>
          </div>
        </div>
        <div>
          <label className="text-sm text-txt-muted">오픈일</label>
          <p className="mt-1">{store.openingDate ? formatDate(store.openingDate) : '-'}</p>
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-txt-muted">주소</label>
          <p className="mt-1">
            ({store.address.zipCode}) {store.address.address} {store.address.addressDetail}
          </p>
        </div>
        <div>
          <label className="text-sm text-txt-muted">지역</label>
          <p className="mt-1">{store.address.region}</p>
        </div>
      </div>
    </div>
  );
};
