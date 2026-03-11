/**
 * 메뉴 일괄변경 모달 컴포넌트
 * Apple 스타일 디자인 시스템 적용
 */

import React, { useState } from 'react';
import { CloseOutlined } from '@ant-design/icons';
import type { ProductStatus, BulkEditType, BulkEditUpdate } from '@/types/product';
import { Button } from './Button';

export interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (update: BulkEditUpdate) => void;
  selectedCount: number;
}

export const BulkEditModal: React.FC<BulkEditModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
}) => {
  const [editType, setEditType] = useState<BulkEditType>('status');
  const [status, setStatus] = useState<ProductStatus>('active');
  const [priceChangeType, setPriceChangeType] = useState<'fixed' | 'percentage'>('fixed');
  const [priceValue, setPriceValue] = useState<string>('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    let update: BulkEditUpdate | null = null;

    switch (editType) {
      case 'status':
        update = {
          type: 'status',
          data: { status },
        };
        break;
      case 'price':
        const value = parseFloat(priceValue);
        if (!isNaN(value)) {
          update = {
            type: 'price',
            data: {
              changeType: priceChangeType,
              value,
            },
          };
        }
        break;
    }

    if (update) {
      onConfirm(update);
      handleClose();
    }
  };

  const handleClose = () => {
    setEditType('status');
    setStatus('active');
    setPriceChangeType('fixed');
    setPriceValue('');
    onClose();
  };

  const isValid = () => {
    if (editType === 'price') {
      const value = parseFloat(priceValue);
      return !isNaN(value) && value > 0;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fadeIn">
      <div className="w-full max-w-md rounded-card bg-white p-6 shadow-card-hover animate-slideUp">
        {/* 헤더 */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-txt-main tracking-tight">일괄 변경</h2>
          <button
            onClick={handleClose}
            className="p-1.5 text-txt-muted hover:text-txt-main hover:bg-hover rounded-lg transition-colors"
            aria-label="닫기"
          >
            <CloseOutlined className="text-base" />
          </button>
        </div>

        {/* 선택된 메뉴 수 */}
        <div className="mb-6 rounded-xl bg-silver px-4 py-3 text-sm text-txt-main">
          <span className="font-semibold">{selectedCount}개</span>의 메뉴가 선택되었습니다
        </div>

        {/* 변경 타입 선택 */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-txt-main">
            변경할 항목
          </label>
          <div className="flex gap-2">
            {(['status', 'price'] as BulkEditType[]).map((type) => {
              const labels = { status: '판매상태', price: '판매가' };
              return (
                <button
                  key={type}
                  onClick={() => setEditType(type)}
                  className={`flex-1 rounded-button px-4 py-2.5 text-sm font-medium transition-all ${
                    editType === type
                      ? 'bg-primary text-white shadow-button'
                      : 'bg-silver text-txt-main hover:bg-light-gray-1'
                  }`}
                >
                  {labels[type]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 변경 내용 입력 */}
        <div className="mb-6">
          {editType === 'status' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-txt-main">
                판매 상태
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="w-full rounded-input border border-border bg-white px-4 py-2.5 text-sm text-txt-main focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
              >
                <option value="active">판매중</option>
                <option value="soldout">품절</option>
              </select>
            </div>
          )}

          {editType === 'price' && (
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-txt-main">
                  변경 방식
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPriceChangeType('fixed')}
                    className={`flex-1 rounded-button px-4 py-2.5 text-sm font-medium transition-all ${
                      priceChangeType === 'fixed'
                        ? 'bg-primary/10 text-primary ring-1 ring-primary'
                        : 'bg-silver text-txt-main hover:bg-light-gray-1'
                    }`}
                  >
                    고정 금액
                  </button>
                  <button
                    onClick={() => setPriceChangeType('percentage')}
                    className={`flex-1 rounded-button px-4 py-2.5 text-sm font-medium transition-all ${
                      priceChangeType === 'percentage'
                        ? 'bg-primary/10 text-primary ring-1 ring-primary'
                        : 'bg-silver text-txt-main hover:bg-light-gray-1'
                    }`}
                  >
                    비율(%)
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-txt-main">
                  {priceChangeType === 'fixed'
                    ? '변경할 금액 (원)'
                    : '변경 비율 (%)'}
                </label>
                <input
                  type="number"
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  placeholder={
                    priceChangeType === 'fixed'
                      ? '예: 1000 (1000원으로 변경)'
                      : '예: 10 (10% 인상/인하)'
                  }
                  className="w-full rounded-input border border-border bg-white px-4 py-2.5 text-sm text-txt-main placeholder:text-txt-disabled focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                />
                {priceChangeType === 'percentage' && (
                  <p className="mt-2 text-xs text-txt-muted">
                    팁: 양수는 인상, 음수는 인하입니다 (예: 10 = 10% 인상, -10 = 10% 인하)
                  </p>
                )}
              </div>
            </div>
          )}

        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleClose}
            fullWidth
          >
            취소
          </Button>
          <Button
            variant="fill"
            onClick={handleConfirm}
            disabled={!isValid()}
            fullWidth
          >
            적용
          </Button>
        </div>
      </div>
    </div>
  );
};
