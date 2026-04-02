import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { Card, Button, Input, Spinner } from '@/components/ui';
import { useStore, useUpdateAmenities, useToast } from '@/hooks';
import type { AmenitiesFormData } from '@/types/store';

const DEFAULT_FORM_DATA: AmenitiesFormData = {
    hasParking: false,
    parkingNote: '',
    hasDineIn: false,
    seatCapacity: undefined,
    hasWifi: false,
    hasDriveThru: false,
    hasRestroom: false,
};

export const AmenitiesEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const { data: store, isLoading } = useStore(id);
    const updateAmenities = useUpdateAmenities();

    const [formData, setFormData] = useState<AmenitiesFormData>(DEFAULT_FORM_DATA);
    const initialDataRef = useRef<string>('');

    useEffect(() => {
        if (store?.amenities) {
            const currentData = store.amenities;
            const data: AmenitiesFormData = {
                hasParking: currentData.hasParking,
                parkingNote: currentData.parkingNote || '',
                hasDineIn: currentData.hasDineIn,
                seatCapacity: currentData.seatCapacity,
                hasWifi: currentData.hasWifi,
                hasDriveThru: currentData.hasDriveThru ?? false,
                hasRestroom: currentData.hasRestroom ?? false,
            };
            setFormData(data);
            initialDataRef.current = JSON.stringify(data);
        } else if (store) {
            setFormData(DEFAULT_FORM_DATA);
            initialDataRef.current = JSON.stringify(DEFAULT_FORM_DATA);
        }
    }, [store]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        if (JSON.stringify(formData) === initialDataRef.current) {
            toast.info('변경사항이 없습니다.');
            navigate(`/staff/stores/${id}`);
            return;
        }

        try {
            await updateAmenities.mutateAsync({
                storeId: id,
                data: formData,
            });
            toast.success('편의시설 정보가 수정되었습니다.');
            navigate(`/staff/stores/${id}`);
        } catch (error) {
            toast.error('편의시설 정보 수정에 실패했습니다.');
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
                    편의시설 수정
                </h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-4 text-txt-muted">
                        매장명: {store?.name}
                    </div>
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
                            <div className="pl-6">
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
                    </div>

                    {/* 드라이브스루 */}
                    <div className="p-4 border border-border rounded-lg space-y-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.hasDriveThru}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        hasDriveThru: e.target.checked,
                                    }))
                                }
                                className="w-4 h-4 rounded border-border"
                            />
                            <span className="font-medium">드라이브스루</span>
                        </label>
                    </div>

                    {/* 화장실 */}
                    <div className="p-4 border border-border rounded-lg space-y-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={formData.hasRestroom}
                                onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, hasRestroom: e.target.checked }))
                                }
                                className="w-4 h-4 rounded border-border"
                            />
                            <span className="font-medium">화장실</span>
                        </label>
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                        <Button type="button" variant="outline" onClick={() => navigate(`/staff/stores/${id}`)}>
                            취소
                        </Button>
                        <Button type="submit" disabled={updateAmenities.isPending}>
                            {updateAmenities.isPending ? <Spinner size="sm" /> : '저장'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default AmenitiesEdit;
