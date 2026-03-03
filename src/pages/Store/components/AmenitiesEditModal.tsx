/**
 * 편의시설 편집 모달
 */
import React, { useState, useEffect, useRef } from 'react';

import { Modal, Button, Input, Spinner } from '@/components/ui';
import { useUpdateAmenities, useToast } from '@/hooks';
import type { StoreAmenities, AmenitiesFormData } from '@/types/store';

interface AmenitiesEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  currentData?: StoreAmenities;
}

const DEFAULT_FORM_DATA: AmenitiesFormData = {
  hasParking: false,
  parkingCapacity: undefined,
  parkingNote: '',
  hasDineIn: false,
  seatCapacity: undefined,
  hasWifi: false,
  wifiPassword: '',
};

export const AmenitiesEditModal: React.FC<AmenitiesEditModalProps> = ({
  isOpen,
  onClose,
  storeId,
  currentData,
}) => {
  const toast = useToast();
  const updateAmenities = useUpdateAmenities();

  const [formData, setFormData] = useState<AmenitiesFormData>(DEFAULT_FORM_DATA);
  const initialDataRef = useRef<string>('');

  useEffect(() => {
    if (currentData) {
      const data: AmenitiesFormData = {
        hasParking: currentData.hasParking,
        parkingCapacity: currentData.parkingCapacity,
        parkingNote: currentData.parkingNote || '',
        hasDineIn: currentData.hasDineIn,
        seatCapacity: currentData.seatCapacity,
        hasWifi: currentData.hasWifi,
        wifiPassword: currentData.wifiPassword || '',
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
      await updateAmenities.mutateAsync({
        storeId,
        data: formData,
      });
      toast.success('편의시설 정보가 수정되었습니다.');
      onClose();
    } catch (error) {
      toast.error('편의시설 정보 수정에 실패했습니다.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="편의시설 수정" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 주차 */}
        <div className="p-4 border border-border rounded-lg space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasParking}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hasParking: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-border"
            />
            <span className="font-medium">주차 가능</span>
          </label>
          {formData.hasParking && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
              <div>
                <label className="block text-sm text-txt-muted mb-1">
                  주차 가능 대수
                </label>
                <Input
                  type="number"
                  min={0}
                  value={formData.parkingCapacity || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parkingCapacity: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="10"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-txt-muted mb-1">
                  주차 안내
                </label>
                <Input
                  value={formData.parkingNote || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      parkingNote: e.target.value,
                    }))
                  }
                  placeholder="건물 지하주차장 2시간 무료"
                />
              </div>
            </div>
          )}
        </div>

        {/* 매장 내 식사 */}
        <div className="p-4 border border-border rounded-lg space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasDineIn}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hasDineIn: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-border"
            />
            <span className="font-medium">매장 내 식사 가능</span>
          </label>
          {formData.hasDineIn && (
            <div className="pl-6">
              <label className="block text-sm text-txt-muted mb-1">좌석 수</label>
              <Input
                type="number"
                min={0}
                value={formData.seatCapacity || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seatCapacity: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  }))
                }
                placeholder="30"
                className="w-32"
              />
            </div>
          )}
        </div>

        {/* 와이파이 */}
        <div className="p-4 border border-border rounded-lg space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.hasWifi}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  hasWifi: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-border"
            />
            <span className="font-medium">와이파이 제공</span>
          </label>
          {formData.hasWifi && (
            <div className="pl-6">
              <label className="block text-sm text-txt-muted mb-1">
                와이파이 비밀번호 (고객용)
              </label>
              <Input
                value={formData.wifiPassword || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    wifiPassword: e.target.value,
                  }))
                }
                placeholder="wifi1234"
              />
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={updateAmenities.isPending}>
            {updateAmenities.isPending ? <Spinner size="sm" /> : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
