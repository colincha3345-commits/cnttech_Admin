import React from 'react';
import { Badge, Button } from '@/components/ui';
import { EditOutlined } from '@ant-design/icons';
import { POS_VENDORS, PG_VENDORS } from '@/types/store';

interface StoreIntegrationTabProps {
  store: any;
  navigate: (path: string) => void;
  id: string;
}

export const StoreIntegrationTab: React.FC<StoreIntegrationTabProps> = ({ store, navigate, id }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">연동 정보</h2>
        <Button size="sm" variant="outline" onClick={() => navigate(`/staff/stores/${id}/edit/integration`)}>
          <EditOutlined className="mr-1" />
          수정
        </Button>
      </div>

      {store.integrationCodes ? (
        <div className="space-y-6">
          {/* POS 연동 */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium">POS 연동</h3>
              <Badge variant={store.integrationCodes.pos.isConnected ? 'success' : 'secondary'}>
                {store.integrationCodes.pos.isConnected ? '연동됨' : '미연동'}
              </Badge>
            </div>
            {store.integrationCodes.pos.isConnected && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-txt-muted">POS 벤더</label>
                  <p className="mt-1">{POS_VENDORS.find(v => v.code === store.integrationCodes?.pos.posVendor)?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">POS 코드</label>
                  <p className="mt-1 font-mono">{store.integrationCodes.pos.posCode || '-'}</p>
                </div>
              </div>
            )}
          </div>

          {/* SK 할인/적립 */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium">SK 할인/적립 연동</h3>
              <Badge variant={store.integrationCodes.sk.isEnabled ? 'success' : 'secondary'}>
                {store.integrationCodes.sk.isEnabled ? '활성' : '비활성'}
              </Badge>
            </div>
            {store.integrationCodes.sk.isEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-txt-muted">가맹점 코드</label>
                  <p className="mt-1 font-mono">{store.integrationCodes.sk.storeCode || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">전체 코드 (V902+코드)</label>
                  <p className="mt-1 font-mono font-medium text-primary">{store.integrationCodes.sk.fullCode || '-'}</p>
                </div>
              </div>
            )}
          </div>

          {/* PG사 연동 */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium">PG사 연동 (스마트로 등)</h3>
              <div className="flex gap-2">
                {store.integrationCodes.pg.isTestMode && (
                  <Badge variant="warning">테스트</Badge>
                )}
                <Badge variant={store.integrationCodes.pg.isEnabled ? 'success' : 'secondary'}>
                  {store.integrationCodes.pg.isEnabled ? '활성' : '비활성'}
                </Badge>
              </div>
            </div>
            {store.integrationCodes.pg.isEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-txt-muted">PG사</label>
                  <p className="mt-1">{PG_VENDORS.find(v => v.code === store.integrationCodes?.pg.pgVendor)?.name || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">MID (Merchant ID)</label>
                  <p className="mt-1 font-mono">{store.integrationCodes.pg.mid || '-'}</p>
                </div>
              </div>
            )}
          </div>

          {/* 교환권 벤더사 */}
          <div className="p-4 border border-border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium">교환권 벤더사 연동</h3>
              <Badge variant={store.integrationCodes.voucherVendor.isEnabled ? 'success' : 'secondary'}>
                {store.integrationCodes.voucherVendor.isEnabled ? '활성' : '비활성'}
              </Badge>
            </div>
            {store.integrationCodes.voucherVendor.isEnabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-txt-muted">벤더사</label>
                  <p className="mt-1">{store.integrationCodes.voucherVendor.vendorName || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">가맹점 코드</label>
                  <p className="mt-1 font-mono">{store.integrationCodes.voucherVendor.storeCode || '-'}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-txt-muted">연동 정보가 등록되지 않았습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(`/staff/stores/${id}/edit/integration`)}
          >
            <EditOutlined className="mr-1" />
            연동 정보 등록
          </Button>
        </div>
      )}
    </div>
  );
};
