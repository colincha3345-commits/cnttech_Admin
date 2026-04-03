import React from 'react';
import { Badge, Button } from '@/components/ui';
import { EditOutlined } from '@ant-design/icons';
import { SIMPLE_PAYMENT_LABELS, type Store } from '@/types/store';

interface StorePaymentTabProps {
  store: Store;
  navigate: (path: string) => void;
  id: string;
}

export const StorePaymentTab: React.FC<StorePaymentTabProps> = ({ store, navigate, id }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">결제 수단</h2>
        <Button size="sm" variant="outline" onClick={() => navigate(`/staff/stores/${id}/edit/payment-methods`)}>
          <EditOutlined className="mr-1" />
          수정
        </Button>
      </div>

      {store.paymentMethods ? (
        <div className="space-y-6">
          {/* 기본 결제 수단 */}
          <div className="space-y-4">
            <h3 className="text-md font-medium border-b border-border pb-2">기본 결제 수단</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <span className="font-medium">카드 결제</span>
                <Badge variant={store.paymentMethods.isCardEnabled ? 'success' : 'secondary'}>
                  {store.paymentMethods.isCardEnabled ? '사용' : '미사용'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <span className="font-medium">현금 결제</span>
                <Badge variant={store.paymentMethods.isCashEnabled ? 'success' : 'secondary'}>
                  {store.paymentMethods.isCashEnabled ? '사용' : '미사용'}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                <span className="font-medium">포인트 결제</span>
                <Badge variant={store.paymentMethods.isPointEnabled ? 'success' : 'secondary'}>
                  {store.paymentMethods.isPointEnabled ? '사용' : '미사용'}
                </Badge>
              </div>
            </div>
          </div>

          {/* 간편 결제 */}
          <div className="space-y-4">
            <h3 className="text-md font-medium border-b border-border pb-2">간편 결제</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {store.paymentMethods.simplePayments.map((sp) => (
                <div
                  key={sp.type}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <span className="font-medium">{SIMPLE_PAYMENT_LABELS[sp.type]}</span>
                  <Badge variant={sp.isEnabled ? 'success' : 'secondary'}>
                    {sp.isEnabled ? '사용' : '미사용'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-txt-muted">결제 수단이 등록되지 않았습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(`/staff/stores/${id}/edit/payment-methods`)}
          >
            <EditOutlined className="mr-1" />
            결제 수단 등록
          </Button>
        </div>
      )}
    </div>
  );
};
