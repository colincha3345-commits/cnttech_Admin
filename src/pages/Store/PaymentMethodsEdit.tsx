import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { Card, Button, Switch, Spinner } from '@/components/ui';
import { useStore, useUpdatePaymentMethods, useToast } from '@/hooks';
import {
    SIMPLE_PAYMENT_LABELS,
    DEFAULT_PAYMENT_METHODS,
    type PaymentMethods,
    type PaymentMethodsFormData,
    type SimplePaymentType,
} from '@/types/store';

const toFormData = (data: PaymentMethods): PaymentMethodsFormData => ({
    isCardEnabled: data.isCardEnabled,
    isCashEnabled: data.isCashEnabled,
    isPointEnabled: data.isPointEnabled,
    simplePayments: data.simplePayments.map((sp) => ({ ...sp })),
});

export const PaymentMethodsEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const { data: store, isLoading } = useStore(id);
    const updatePaymentMethods = useUpdatePaymentMethods();

    const [formData, setFormData] = useState<PaymentMethodsFormData>(
        toFormData(DEFAULT_PAYMENT_METHODS),
    );
    const initialDataRef = useRef<string>('');

    useEffect(() => {
        if (store?.paymentMethods) {
            const data = toFormData(store.paymentMethods);
            setFormData(data);
            initialDataRef.current = JSON.stringify(data);
        } else if (store) {
            const data = toFormData(DEFAULT_PAYMENT_METHODS);
            setFormData(data);
            initialDataRef.current = JSON.stringify(data);
        }
    }, [store]);

    const handleBasicToggle = (
        field: 'isCardEnabled' | 'isCashEnabled' | 'isPointEnabled',
        checked: boolean,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: checked }));
    };

    const handleSimplePaymentToggle = (type: SimplePaymentType, checked: boolean) => {
        setFormData((prev) => ({
            ...prev,
            simplePayments: prev.simplePayments.map((sp) =>
                sp.type === type ? { ...sp, isEnabled: checked } : sp,
            ),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (JSON.stringify(formData) === initialDataRef.current) {
            toast.info('변경사항이 없습니다.');
            navigate(`/staff/stores/${id}`);
            return;
        }

        try {
            await updatePaymentMethods.mutateAsync({
                storeId: id,
                data: formData,
            });
            toast.success('결제 수단이 수정되었습니다.');
            navigate(`/staff/stores/${id}`);
        } catch (error) {
            toast.error('결제 수단 수정에 실패했습니다.');
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate(`/staff/stores/${id}`)}
                    className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                >
                    <ArrowLeftOutlined />
                </button>
                <h1 className="text-2xl font-bold text-txt-main">
                    결제 수단 수정
                </h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-4 text-txt-muted">
                        매장명: {store?.name}
                    </div>
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
                    <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                        <Button type="button" variant="outline" onClick={() => navigate(`/staff/stores/${id}`)}>
                            취소
                        </Button>
                        <Button type="submit" disabled={updatePaymentMethods.isPending}>
                            {updatePaymentMethods.isPending ? <Spinner size="sm" /> : '저장'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default PaymentMethodsEdit;
