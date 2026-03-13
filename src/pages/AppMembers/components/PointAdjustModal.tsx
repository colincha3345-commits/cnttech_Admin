import React, { useState } from 'react';
import { CloseOutlined, PlusOutlined, MinusOutlined } from '@ant-design/icons';

import { Button, Input, Label } from '@/components/ui';
import { appMemberService } from '@/services/appMemberService';
import { useToast } from '@/hooks';

interface PointAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  currentBalance: number;
  onSuccess: () => void;
}

export const PointAdjustModal: React.FC<PointAdjustModalProps> = ({
  isOpen,
  onClose,
  memberId,
  memberName,
  currentBalance,
  onSuccess,
}) => {
  const toast = useToast();
  const [adjustType, setAdjustType] = useState<'earn_manual' | 'withdraw_manual'>('earn_manual');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const handleSubmit = async () => {
    const numAmount = parseInt(amount, 10);

    if (!numAmount || numAmount <= 0) {
      toast.error('유효한 금액을 입력해주세요.');
      return;
    }

    if (!reason.trim()) {
      toast.error('사유를 입력해주세요.');
      return;
    }

    // 마이너스 잔고 정책(방안 A): 회수 시 잔액 초과 허용, 확인 경고만 표시
    if (adjustType === 'withdraw_manual' && numAmount > currentBalance) {
      const confirmNegative = window.confirm(
        `회수 금액(${formatCurrency(numAmount)}P)이 현재 잔액(${formatCurrency(currentBalance)}P)을 초과합니다.\n` +
        `조정 후 잔액이 ${formatCurrency(currentBalance - numAmount)}P(마이너스)가 됩니다.\n` +
        `마이너스 잔고 상태에서는 포인트 사용이 차단됩니다.\n계속하시겠습니까?`
      );
      if (!confirmNegative) return;
    }

    setIsLoading(true);
    try {
      await appMemberService.adjustPoint({
        memberId,
        type: adjustType,
        amount: numAmount,
        reason: reason.trim(),
      });

      toast.success(
        adjustType === 'earn_manual'
          ? `${formatCurrency(numAmount)}P가 지급되었습니다.`
          : `${formatCurrency(numAmount)}P가 회수되었습니다.`
      );

      setAmount('');
      setReason('');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '처리 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setAmount('');
      setReason('');
      onClose();
    }
  };

  if (!isOpen) return null;

  const parsedAmount = parseInt(amount, 10) || 0;
  const showExpectedBalance = parsedAmount > 0;
  const expectedBalance = adjustType === 'earn_manual'
    ? currentBalance + parsedAmount
    : currentBalance - parsedAmount;
  const isNegativeBalance = expectedBalance < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-card rounded-xl shadow-lg w-full max-w-md mx-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-txt-main">포인트 수동 조정</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-bg-hover rounded transition-colors"
            disabled={isLoading}
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
            <p className="text-sm text-txt-muted mt-1">
              현재 잔액: <span className="text-primary font-medium">{formatCurrency(currentBalance)}P</span>
            </p>
          </div>

          {/* 조정 유형 */}
          <div className="space-y-2">
            <Label required>조정 유형</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAdjustType('earn_manual')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  adjustType === 'earn_manual'
                    ? 'border-success bg-success/10 text-success'
                    : 'border-border text-txt-muted hover:border-success/50'
                }`}
              >
                <PlusOutlined />
                지급
              </button>
              <button
                type="button"
                onClick={() => setAdjustType('withdraw_manual')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 flex items-center justify-center gap-2 transition-all ${
                  adjustType === 'withdraw_manual'
                    ? 'border-critical bg-critical/10 text-critical'
                    : 'border-border text-txt-muted hover:border-critical/50'
                }`}
              >
                <MinusOutlined />
                회수
              </button>
            </div>
          </div>

          {/* 금액 */}
          <div className="space-y-2">
            <Label required>{adjustType === 'earn_manual' ? '지급 금액' : '회수 금액'}</Label>
            <div className="relative">
              <Input
                type="number"
                placeholder="금액 입력"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-8"
                min={1}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted">P</span>
            </div>
            {adjustType === 'withdraw_manual' && (
              <p className="text-xs text-txt-muted">
                현재 잔액: {formatCurrency(currentBalance)}P
                {currentBalance < 0 && <span className="text-critical font-medium"> (마이너스 상태)</span>}
              </p>
            )}
          </div>

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

          {/* 예상 잔액 */}
          {showExpectedBalance && (
            <div className={`p-3 rounded-lg ${isNegativeBalance ? 'bg-critical/10' : 'bg-info/10'}`}>
              <p className="text-sm text-txt-muted">조정 후 예상 잔액</p>
              <p className={`text-lg font-bold ${isNegativeBalance ? 'text-critical' : 'text-info'}`}>
                {formatCurrency(expectedBalance)}P
              </p>
              {isNegativeBalance && (
                <p className="text-xs text-critical mt-1">
                  마이너스 잔고 — 포인트 사용이 차단되며 이후 적립 시 자동 복구됩니다.
                </p>
              )}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex justify-end gap-3 p-4 border-t border-border">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            취소
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !amount || !reason.trim()}
            variant={adjustType === 'earn_manual' ? 'primary' : 'danger'}
          >
            {isLoading
              ? '처리 중...'
              : adjustType === 'earn_manual'
                ? '지급하기'
                : '회수하기'}
          </Button>
        </div>
      </div>
    </div>
  );
};
