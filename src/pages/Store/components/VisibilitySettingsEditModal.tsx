/**
 * 노출설정 편집 모달
 */
import React, { useState, useEffect, useRef } from 'react';

import { Modal, Button, Input, Spinner } from '@/components/ui';
import { useUpdateVisibilitySettings, useToast } from '@/hooks';
import {
  VISIBILITY_CHANNELS,
  type VisibilitySettings,
  type VisibilitySettingsFormData,
  type ChannelVisibility,
} from '@/types/store';

interface VisibilitySettingsEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  currentData?: VisibilitySettings;
}

const formatDateForInput = (date: Date | undefined): string => {
  if (!date) return '';
  const isoString = new Date(date).toISOString();
  return isoString.split('T')[0] ?? isoString.substring(0, 10);
};

export const VisibilitySettingsEditModal: React.FC<VisibilitySettingsEditModalProps> = ({
  isOpen,
  onClose,
  storeId,
  currentData,
}) => {
  const toast = useToast();
  const updateVisibilitySettings = useUpdateVisibilitySettings();

  const getDefaultChannels = (): ChannelVisibility[] => {
    return VISIBILITY_CHANNELS.map((channel) => ({
      channel: channel.code,
      isVisible: true,
    }));
  };

  const [formData, setFormData] = useState<VisibilitySettingsFormData>({
    channels: currentData?.channels || getDefaultChannels(),
    isSearchable: currentData?.isSearchable ?? true,
    showNewBadge: currentData?.showNewBadge ?? false,
    newBadgeEndDate: formatDateForInput(currentData?.newBadgeEndDate),
    showEventBadge: currentData?.showEventBadge ?? false,
    eventBadgeText: currentData?.eventBadgeText || '',
    isRecommended: currentData?.isRecommended ?? false,
    recommendedOrder: currentData?.recommendedOrder,
  });

  const initialDataRef = useRef<string>('');

  useEffect(() => {
    if (currentData) {
      const data: VisibilitySettingsFormData = {
        channels: currentData.channels,
        isSearchable: currentData.isSearchable,
        showNewBadge: currentData.showNewBadge,
        newBadgeEndDate: formatDateForInput(currentData.newBadgeEndDate),
        showEventBadge: currentData.showEventBadge,
        eventBadgeText: currentData.eventBadgeText || '',
        isRecommended: currentData.isRecommended,
        recommendedOrder: currentData.recommendedOrder,
      };
      setFormData(data);
      initialDataRef.current = JSON.stringify(data);
    } else {
      const data: VisibilitySettingsFormData = {
        channels: getDefaultChannels(),
        isSearchable: true,
        showNewBadge: false,
        newBadgeEndDate: '',
        showEventBadge: false,
        eventBadgeText: '',
        isRecommended: false,
        recommendedOrder: undefined,
      };
      setFormData(data);
      initialDataRef.current = JSON.stringify(data);
    }
  }, [currentData]);

  const handleChannelChange = (channelCode: string, isVisible: boolean) => {
    setFormData((prev) => ({
      ...prev,
      channels: prev.channels.map((ch) =>
        ch.channel === channelCode ? { ...ch, isVisible } : ch
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (JSON.stringify(formData) === initialDataRef.current) {
      toast.info('변경사항이 없습니다.');
      onClose();
      return;
    }

    try {
      await updateVisibilitySettings.mutateAsync({
        storeId,
        data: formData,
      });
      toast.success('노출설정이 수정되었습니다.');
      onClose();
    } catch (error) {
      toast.error('노출설정 수정에 실패했습니다.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="노출설정 수정" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 채널별 노출 */}
        <div className="space-y-3">
          <h3 className="text-md font-medium">채널별 노출</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {VISIBILITY_CHANNELS.map((channel) => {
              const setting = formData.channels.find(
                (ch) => ch.channel === channel.code
              );
              return (
                <label
                  key={channel.code}
                  className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-bg-hover"
                >
                  <input
                    type="checkbox"
                    checked={setting?.isVisible ?? true}
                    onChange={(e) =>
                      handleChannelChange(channel.code, e.target.checked)
                    }
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">{channel.name}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 검색 노출 */}
        <div className="space-y-3">
          <h3 className="text-md font-medium">검색 설정</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isSearchable}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isSearchable: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm">앱 검색 결과에 노출</span>
          </label>
        </div>

        {/* 신규 뱃지 */}
        <div className="space-y-3">
          <h3 className="text-md font-medium">신규 뱃지</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.showNewBadge}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  showNewBadge: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm">신규 뱃지 표시</span>
          </label>
          {formData.showNewBadge && (
            <div>
              <label className="block text-sm text-txt-muted mb-1">
                뱃지 표시 종료일
              </label>
              <Input
                type="date"
                value={formData.newBadgeEndDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newBadgeEndDate: e.target.value,
                  }))
                }
                className="w-48"
              />
            </div>
          )}
        </div>

        {/* 이벤트 뱃지 */}
        <div className="space-y-3">
          <h3 className="text-md font-medium">이벤트 뱃지</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.showEventBadge}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  showEventBadge: e.target.checked,
                }))
              }
              className="w-4 h-4 rounded border-border"
            />
            <span className="text-sm">이벤트 뱃지 표시</span>
          </label>
          {formData.showEventBadge && (
            <div>
              <label className="block text-sm text-txt-muted mb-1">
                뱃지 문구
              </label>
              <Input
                value={formData.eventBadgeText || ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    eventBadgeText: e.target.value,
                  }))
                }
                placeholder="오픈 이벤트"
              />
            </div>
          )}
        </div>

        {/* 추천 매장 */}
        <div className="space-y-3">
          <h3 className="text-md font-medium">추천 매장</h3>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isRecommended}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isRecommended: e.target.checked,
                  }))
                }
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">추천 매장으로 표시</span>
            </label>
            {formData.isRecommended && (
              <div className="flex items-center gap-2">
                <label className="text-sm text-txt-muted">노출 순서</label>
                <Input
                  type="number"
                  min={1}
                  value={formData.recommendedOrder || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      recommendedOrder: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-20"
                  placeholder="1"
                />
              </div>
            )}
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={updateVisibilitySettings.isPending}>
            {updateVisibilitySettings.isPending ? <Spinner size="sm" /> : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
