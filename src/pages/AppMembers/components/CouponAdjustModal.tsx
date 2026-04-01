import React, { useState } from 'react';
import { CloseOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

import { Button, Label } from '@/components/ui';
import { useToast } from '@/hooks';
import { useAdjustCoupon } from '@/hooks/useAppMembers';

interface CouponAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  onSuccess: () => void;
}

// 임시 쿠폰 목록 (실제로는 쿠폰 서비스에서 가져와야 함)
const AVAILABLE_COUPONS = [
  { id: 'coupon-1', name: '첫 주문 할인 쿠폰', discountType: 'percentage', discountValue: 20 },
  { id: 'coupon-2', name: '생일 축하 쿠폰', discountType: 'fixed', discountValue: 5000 },
  { id: 'coupon-3', name: '감사 쿠폰', discountType: 'fixed', discountValue: 3000 },
  { id: 'coupon-4', name: 'VIP 전용 쿠폰', discountType: 'percentage', discountValue: 30 },
];

export const CouponAdjustModal: React.FC<CouponAdjustModalProps> = ({
  isOpen,
  onClose,
  memberId,
  memberName,
  onSuccess,
}) => {
  const toast = useToast();
  const [adjustType, setAdjustType] = useState<'issue' | 'withdraw'>('issue');
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [reason, setReason] = useState('');

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const adjustCouponMutation = useAdjustCoupon();

  const handleSubmit = async () => {
    if (!selectedCouponId) {
      toast.error('쿠폰을 선택해주세요.');
      return;
    }

    if (!reason.trim()) {
      toast.error('사유를 입력해주세요.');
      return;
    }

    try {
      await adjustCouponMutation.mutateAsync({
        memberId,
        couponId: selectedCouponId,
        type: adjustType,
        reason: reason.trim(),
      });

      const coupon = AVAILABLE_COUPONS.find((c) => c.id === selectedCouponId);
      toast.success(
        adjustType === 'issue'
          ? `"${coupon?.name}" 쿠폰이 지급되었습니다.`
          : `쿠폰이 회수되었습니다.`
      );

      setSelectedCouponId('');
      setReason('');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
    }
  };

  const handleClose = () => {
    if (!adjustCouponMutation.isPending) {
      setSelectedCouponId('');
      setReason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const selectedCoupon = AVAILABLE_COUPONS.find((c) => c.id === selectedCouponId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-card rounded-xl shadow-lg w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-txt-main">쿠폰 수동 조정</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-bg-hover rounded transition-colors"
            disabled={adjustCouponMutation.isPending}
          >
            <CloseOutlined />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-4 space-y-4">
          {/* 회원 정보 */}
          <div className="p-3 bg-bg-hover rounded-lg">
            <p className="text-sm text-txt-muted">회원</p>
            <p className="font-medium text-txt-main">{memberName}</p>
          </div>

          {/* 조정 유형 */}
          <div className="space-y-2">
            <Label required>조정 유형</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('issue')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  adjustType === 'issue'
                    ? 'border-success bg-success/10 text-success'
                    : 'border-border text-txt-muted hover:border-success/50'
                }`}
              >
                <PlusOutlined />
                지급
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('withdraw')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  adjustType === 'withdraw'
                    ? 'border-critical bg-critical/10 text-critical'
                    : 'border-border text-txt-muted hover:border-critical/50'
                }`}
              >
                <MinusOutlined />
                회수
              </button>
            </div>
          </div>

          {/* 쿠폰 선택 */}
          <div className="space-y-2">
            <Label required>
              {adjustType === 'issue' ? '지급할 쿠폰' : '회수할 쿠폰'}
            </Label>
            <select
              value={selectedCouponId}
              onChange={(e) => setSelectedCouponId(e.target.value)}
              className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">쿠폰 선택</option>
              {AVAILABLE_COUPONS.map((coupon) => (
                <option key={coupon.id} value={coupon.id}>
                  {coupon.name} (
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}%`
                    : `${formatCurrency(coupon.discountValue)}원`}
                  )
                </option>
              ))}
            </select>
          </div>

          {/* 선택된 쿠폰 정보 */}
          {selectedCoupon && (
            <div className="p-3 bg-info/10 rounded-lg">
              <p className="text-sm font-medium text-txt-main">{selectedCoupon.name}</p>
              <p className="text-sm text-info mt-1">
                할인:{' '}
                {selectedCoupon.discountType === 'percentage'
                  ? `${selectedCoupon.discountValue}%`
                  : `${formatCurrency(selectedCoupon.discountValue)}원`}
              </p>
            </div>
          )}

          {/* 사유 */}
          <div className="space-y-2">
            <Label required>사유</Label>
            <textarea
              placeholder="조정 사유를 입력하세요"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full min-h-[80px] px-4 py-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-3 p-4 border-t border-border">
          <Button variant="outline" onClick={handleClose} disabled={adjustCouponMutation.isPending}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={adjustCouponMutation.isPending || !selectedCouponId || !reason.trim()}
            variant={adjustType === 'issue' ? 'primary' : 'danger'}
          >
            {adjustCouponMutation.isPending
              ? '처리 중...'
              : adjustType === 'issue'
                ? '지급하기'
                : '회수하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};
