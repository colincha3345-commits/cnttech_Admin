/**
 * 연동정보 편집 모달
 */
import React, { useState, useEffect, useRef } from 'react';

import { Modal, Button, Input, Spinner } from '@/components/ui';
import { useUpdateIntegrationCodes, useToast } from '@/hooks';
import { POS_VENDORS, PG_VENDORS, type IntegrationCodes, type IntegrationCodesFormData } from '@/types/store';

interface IntegrationCodesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  currentData?: IntegrationCodes;
}

const DEFAULT_FORM_DATA: IntegrationCodesFormData = {
  pos: {
    posVendor: '',
    posCode: '',
    posSerialNumber: '',
    isConnected: false,
  },
  sk: {
    storeCode: '',
    isEnabled: false,
  },
  pg: {
    pgVendor: '',
    mid: '',
    apiKey: '',
    isTestMode: true,
    isEnabled: false,
  },
  voucherVendor: {
    vendorName: '',
    storeCode: '',
    isEnabled: false,
  },
};

export const IntegrationCodesEditModal: React.FC<IntegrationCodesEditModalProps> = ({
  isOpen,
  onClose,
  storeId,
  currentData,
}) => {
  const toast = useToast();
  const updateIntegrationCodes = useUpdateIntegrationCodes();

  const [formData, setFormData] = useState<IntegrationCodesFormData>(DEFAULT_FORM_DATA);
  const initialDataRef = useRef<string>('');

  useEffect(() => {
    if (currentData) {
      const data: IntegrationCodesFormData = {
        pos: {
          posVendor: currentData.pos.posVendor || '',
          posCode: currentData.pos.posCode || '',
          posSerialNumber: currentData.pos.posSerialNumber || '',
          isConnected: currentData.pos.isConnected || false,
        },
        sk: {
          storeCode: currentData.sk.storeCode || '',
          isEnabled: currentData.sk.isEnabled || false,
        },
        pg: {
          pgVendor: currentData.pg.pgVendor || '',
          mid: currentData.pg.mid || '',
          apiKey: currentData.pg.apiKey || '',
          isTestMode: currentData.pg.isTestMode ?? true,
          isEnabled: currentData.pg.isEnabled || false,
        },
        voucherVendor: {
          vendorName: currentData.voucherVendor.vendorName || '',
          storeCode: currentData.voucherVendor.storeCode || '',
          isEnabled: currentData.voucherVendor.isEnabled || false,
        },
      };
      setFormData(data);
      initialDataRef.current = JSON.stringify(data);
    } else {
      setFormData(DEFAULT_FORM_DATA);
      initialDataRef.current = JSON.stringify(DEFAULT_FORM_DATA);
    }
  }, [currentData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (JSON.stringify(formData) === initialDataRef.current) {
      toast.info('변경사항이 없습니다.');
      onClose();
      return;
    }

    try {
      await updateIntegrationCodes.mutateAsync({
        storeId,
        data: formData,
      });
      toast.success('연동정보가 수정되었습니다.');
      onClose();
    } catch (error) {
      toast.error('연동정보 수정에 실패했습니다.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="연동정보 수정" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* POS 연동 */}
        <div className="p-4 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">POS 연동</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.pos.isConnected}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pos: { ...prev.pos, isConnected: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">연동 활성화</span>
            </label>
          </div>
          {formData.pos.isConnected && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-txt-muted mb-1">POS 벤더</label>
                <select
                  value={formData.pos.posVendor}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pos: { ...prev.pos, posVendor: e.target.value },
                    }))
                  }
                  className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">선택</option>
                  {POS_VENDORS.map((vendor) => (
                    <option key={vendor.code} value={vendor.code}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-txt-muted mb-1">POS 코드</label>
                <Input
                  value={formData.pos.posCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pos: { ...prev.pos, posCode: e.target.value },
                    }))
                  }
                  placeholder="GN001-POS"
                />
              </div>
              <div>
                <label className="block text-sm text-txt-muted mb-1">시리얼 번호</label>
                <Input
                  value={formData.pos.posSerialNumber}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pos: { ...prev.pos, posSerialNumber: e.target.value },
                    }))
                  }
                  placeholder="SN-2023-001234"
                />
              </div>
            </div>
          )}
        </div>

        {/* SK 할인/적립 */}
        <div className="p-4 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">SK 할인/적립 연동</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.sk.isEnabled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    sk: { ...prev.sk, isEnabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">연동 활성화</span>
            </label>
          </div>
          {formData.sk.isEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-txt-muted mb-1">가맹점 코드</label>
                <Input
                  value={formData.sk.storeCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sk: { ...prev.sk, storeCode: e.target.value },
                    }))
                  }
                  placeholder="12345"
                />
              </div>
              <div>
                <label className="block text-sm text-txt-muted mb-1">전체 코드</label>
                <Input
                  value={formData.sk.storeCode ? `V902${formData.sk.storeCode}` : ''}
                  disabled
                  className="bg-bg-hover"
                />
              </div>
            </div>
          )}
        </div>

        {/* PG사 연동 */}
        <div className="p-4 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">PG사 연동</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.pg.isEnabled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    pg: { ...prev.pg, isEnabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">연동 활성화</span>
            </label>
          </div>
          {formData.pg.isEnabled && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-txt-muted mb-1">PG사</label>
                  <select
                    value={formData.pg.pgVendor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pg: { ...prev.pg, pgVendor: e.target.value },
                      }))
                    }
                    className="w-full h-10 px-3 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">선택</option>
                    {PG_VENDORS.map((vendor) => (
                      <option key={vendor.code} value={vendor.code}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-txt-muted mb-1">MID</label>
                  <Input
                    value={formData.pg.mid}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pg: { ...prev.pg, mid: e.target.value },
                      }))
                    }
                    placeholder="MID_GN001_2026"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.pg.isTestMode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pg: { ...prev.pg, isTestMode: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-warning">테스트 모드</span>
              </label>
            </div>
          )}
        </div>

        {/* 교환권 벤더사 */}
        <div className="p-4 border border-border rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium">교환권 벤더사 연동</h3>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.voucherVendor.isEnabled}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    voucherVendor: { ...prev.voucherVendor, isEnabled: e.target.checked },
                  }))
                }
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">연동 활성화</span>
            </label>
          </div>
          {formData.voucherVendor.isEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-txt-muted mb-1">벤더사명</label>
                <Input
                  value={formData.voucherVendor.vendorName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      voucherVendor: { ...prev.voucherVendor, vendorName: e.target.value },
                    }))
                  }
                  placeholder="카카오선물하기"
                />
              </div>
              <div>
                <label className="block text-sm text-txt-muted mb-1">가맹점 코드</label>
                <Input
                  value={formData.voucherVendor.storeCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      voucherVendor: { ...prev.voucherVendor, storeCode: e.target.value },
                    }))
                  }
                  placeholder="VOUCHER-GN001"
                />
              </div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={updateIntegrationCodes.isPending}>
            {updateIntegrationCodes.isPending ? <Spinner size="sm" /> : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
