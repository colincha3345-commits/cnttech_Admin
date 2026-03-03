/**
 * 결제 수단 편집 모달
 * - 기본 결제 수단 (카드/현금/포인트) 토글
 * - 간편 결제 6종 (카카오페이, 네이버페이, 토스페이, 삼성페이, 페이코, 애플페이) 토글
 */
import React, { useState, useEffect, useRef } from 'react';

import { Modal, Button, Switch, Spinner } from '@/components/ui';
import { useUpdatePaymentMethods, useToast } from '@/hooks';
import {
  SIMPLE_PAYMENT_LABELS,
  DEFAULT_PAYMENT_METHODS,
  type PaymentMethods,
  type PaymentMethodsFormData,
  type SimplePaymentType,
} from '@/types/store';

interface PaymentMethodsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  currentData?: PaymentMethods;
}

/** currentData를 PaymentMethodsFormData로 변환 */
const toFormData = (data: PaymentMethods): PaymentMethodsFormData => ({
  isCardEnabled: data.isCardEnabled,
  isCashEnabled: data.isCashEnabled,
  isPointEnabled: data.isPointEnabled,
  simplePayments: data.simplePayments.map((sp) => ({ ...sp })),
});

export const PaymentMethodsEditModal: React.FC<PaymentMethodsEditModalProps> = ({
  isOpen,
  onClose,
  storeId,
  currentData,
}) => {
  const toast = useToast();
  const updatePaymentMethods = useUpdatePaymentMethods();

  const [formData, setFormData] = useState<PaymentMethodsFormData>(
    toFormData(DEFAULT_PAYMENT_METHODS),
  );
  const initialDataRef = useRef<string>('');

  // currentData가 변경되면 폼 데이터 동기화
  useEffect(() => {
    if (currentData) {
      const data = toFormData(currentData);
      setFormData(data);
      initialDataRef.current = JSON.stringify(data);
    } else {
      const data = toFormData(DEFAULT_PAYMENT_METHODS);
      setFormData(data);
      initialDataRef.current = JSON.stringify(data);
    }
  }, [currentData]);

  /** 기본 결제 수단 토글 핸들러 */
  const handleBasicToggle = (
    field: 'isCardEnabled' | 'isCashEnabled' | 'isPointEnabled',
    checked: boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: checked }));
  };

  /** 간편 결제 토글 핸들러 */
  const handleSimplePaymentToggle = (type: SimplePaymentType, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      simplePayments: prev.simplePayments.map((sp) =>
        sp.type === type ? { ...sp, isEnabled: checked } : sp,
      ),
    }));
  };

  /** 저장 */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (JSON.stringify(formData) === initialDataRef.current) {
      toast.info('변경사항이 없습니다.');
      onClose();
      return;
    }

    try {
      await updatePaymentMethods.mutateAsync({
        storeId,
        data: formData,
      });
      toast.success('결제 수단이 수정되었습니다.');
      onClose();
    } catch (error) {
      toast.error('결제 수단 수정에 실패했습니다.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="결제 수단 수정" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 결제 수단 */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-txt-main">기본 결제 수단</h3>
          <div className="space-y-3 p-4 border border-border rounded-lg">
            {/* 카드 결제 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-txt-main">카드 결제</span>
              <Switch
                checked={formData.isCardEnabled}
                onCheckedChange={(checked) => handleBasicToggle('isCardEnabled', checked)}
              />
            </div>

            {/* 현금 결제 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-txt-main">현금 결제</span>
              <Switch
                checked={formData.isCashEnabled}
                onCheckedChange={(checked) => handleBasicToggle('isCashEnabled', checked)}
              />
            </div>

            {/* 포인트 결제 */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-txt-main">포인트 결제</span>
              <Switch
                checked={formData.isPointEnabled}
                onCheckedChange={(checked) => handleBasicToggle('isPointEnabled', checked)}
              />
            </div>
          </div>
        </div>

        {/* 간편 결제 */}
        <div className="space-y-3">
          <h3 className="text-md font-medium text-txt-main">간편 결제</h3>
          <div className="space-y-3 p-4 border border-border rounded-lg">
            {formData.simplePayments.map((sp) => (
              <div key={sp.type} className="flex items-center justify-between">
                <span className="text-sm text-txt-main">
                  {SIMPLE_PAYMENT_LABELS[sp.type]}
                </span>
                <Switch
                  checked={sp.isEnabled}
                  onCheckedChange={(checked) =>
                    handleSimplePaymentToggle(sp.type, checked)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={updatePaymentMethods.isPending}>
            {updatePaymentMethods.isPending ? <Spinner size="sm" /> : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
