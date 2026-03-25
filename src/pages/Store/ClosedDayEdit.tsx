import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';

import { Card, Button, Input, Spinner } from '@/components/ui';
import { useStore, useUpdateOperatingInfo, useToast } from '@/hooks';
import type {
    OperatingInfoFormData,
    RegularClosedDay,
    RegularClosedType,
    IrregularClosedDay,
    WeekDay,
} from '@/types/store';
import {
    WEEK_DAYS,
    WEEK_DAY_LABELS,
    REGULAR_CLOSED_TYPE_LABELS,
} from '@/types/store';

const NTH_WEEK_OPTIONS: { value: number; label: string }[] = [
    { value: 1, label: '첫째 주' },
    { value: 2, label: '둘째 주' },
    { value: 3, label: '셋째 주' },
    { value: 4, label: '넷째 주' },
    { value: 5, label: '마지막 주' },
];

const createDefaultRegular = (): RegularClosedDay => ({
    type: 'weekly',
    dayOfWeek: 'monday',
    description: '',
});

const createDefaultIrregular = (): IrregularClosedDay => ({
    date: '',
    reason: '',
});

export const ClosedDayEdit: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const toast = useToast();

    const { data: store, isLoading } = useStore(id);
    const updateOperatingInfo = useUpdateOperatingInfo();

    const [regularDays, setRegularDays] = useState<RegularClosedDay[]>([]);
    const [irregularDays, setIrregularDays] = useState<IrregularClosedDay[]>([]);
    const initialDataRef = useRef<string>('');

    useEffect(() => {
        if (store?.operatingInfo) {
            const currentRegularClosedDays = store.operatingInfo.regularClosedDays;
            const currentIrregularClosedDays = store.operatingInfo.irregularClosedDays;
            const regular = currentRegularClosedDays?.length
                ? currentRegularClosedDays.map((d) => ({ ...d }))
                : [];
            const irregular = currentIrregularClosedDays?.length
                ? currentIrregularClosedDays.map((d) => ({ ...d }))
                : [];
            setRegularDays(regular);
            setIrregularDays(irregular);
            initialDataRef.current = JSON.stringify({ regular, irregular });
        } else if (store) {
            setRegularDays([]);
            setIrregularDays([]);
            initialDataRef.current = JSON.stringify({ regular: [], irregular: [] });
        }
    }, [store]);

    const handleAddRegular = useCallback(() => {
        setRegularDays((prev) => [...prev, createDefaultRegular()]);
    }, []);

    const handleRemoveRegular = useCallback((index: number) => {
        setRegularDays((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleRegularChange = useCallback(
        (index: number, patch: Partial<RegularClosedDay>) => {
            setRegularDays((prev) =>
                prev.map((item, i) => {
                    if (i !== index) return item;

                    const updated = { ...item, ...patch };

                    if (patch.type && patch.type !== item.type) {
                        if (patch.type === 'weekly') {
                            updated.dayOfWeek = updated.dayOfWeek || 'monday';
                            updated.nthWeek = undefined;
                            updated.dates = undefined;
                        } else if (patch.type === 'monthly_nth') {
                            updated.dayOfWeek = updated.dayOfWeek || 'monday';
                            updated.nthWeek = updated.nthWeek || 1;
                            updated.dates = undefined;
                        } else if (patch.type === 'monthly_date') {
                            updated.dayOfWeek = undefined;
                            updated.nthWeek = undefined;
                            updated.dates = updated.dates || [];
                        }
                    }

                    return updated;
                })
            );
        },
        []
    );

    const handleAddIrregular = useCallback(() => {
        setIrregularDays((prev) => [...prev, createDefaultIrregular()]);
    }, []);

    const handleRemoveIrregular = useCallback((index: number) => {
        setIrregularDays((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleIrregularChange = useCallback(
        (index: number, patch: Partial<IrregularClosedDay>) => {
            setIrregularDays((prev) =>
                prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
            );
        },
        []
    );

    const parseDatesString = (value: string): number[] => {
        return value
            .split(',')
            .map((s) => s.trim())
            .filter((s) => s !== '')
            .map(Number)
            .filter((n) => !isNaN(n) && n >= 1 && n <= 31);
    };

    const formatDates = (dates?: number[]): string => {
        if (!dates || dates.length === 0) return '';
        return dates.join(', ');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id || !store) return;

        if (JSON.stringify({ regular: regularDays, irregular: irregularDays }) === initialDataRef.current) {
            toast.info('변경사항이 없습니다.');
            navigate(`/staff/stores/${id}`);
            return;
        }

        try {
            const currentOperatingInfo = store.operatingInfo;
            const submitData: OperatingInfoFormData = {
                weekdayHours: currentOperatingInfo?.weekdayHours || { isOpen: true, openTime: '09:00', closeTime: '22:00' },
                weekendHours: currentOperatingInfo?.weekendHours || { isOpen: true, openTime: '09:00', closeTime: '22:00' },
                holidayHours: currentOperatingInfo?.holidayHours,
                dailyHours: currentOperatingInfo?.dailyHours,
                isTemporarilyClosed: currentOperatingInfo?.isTemporarilyClosed ?? false,
                temporaryCloseReason: currentOperatingInfo?.temporaryCloseReason,
                temporaryCloseStartDate: currentOperatingInfo?.temporaryCloseStartDate
                    ? new Date(currentOperatingInfo.temporaryCloseStartDate).toISOString().split('T')[0]
                    : undefined,
                temporaryCloseEndDate: currentOperatingInfo?.temporaryCloseEndDate
                    ? new Date(currentOperatingInfo.temporaryCloseEndDate).toISOString().split('T')[0]
                    : undefined,
                isDeliveryAvailable: currentOperatingInfo?.isDeliveryAvailable ?? true,
                isPickupAvailable: currentOperatingInfo?.isPickupAvailable ?? true,
                deliverySettings: currentOperatingInfo?.deliverySettings,
                pickupSettings: currentOperatingInfo?.pickupSettings,
                regularClosedDays: regularDays.length > 0 ? regularDays : undefined,
                irregularClosedDays: irregularDays.length > 0 ? irregularDays : undefined,
            };

            await updateOperatingInfo.mutateAsync({ storeId: id, data: submitData });
            toast.success('휴무일 설정이 수정되었습니다.');
            navigate(`/staff/stores/${id}`);
        } catch {
            toast.error('휴무일 설정 수정에 실패했습니다.');
        }
    };

    const renderRegularDetail = (item: RegularClosedDay, index: number) => {
        switch (item.type) {
            case 'weekly':
                return (
                    <select
                        value={item.dayOfWeek || 'monday'}
                        onChange={(e) =>
                            handleRegularChange(index, { dayOfWeek: e.target.value as WeekDay })
                        }
                        className="px-3 py-2 text-sm border border-border rounded-lg bg-bg-card text-txt-main focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                        {WEEK_DAYS.map((day) => (
                            <option key={day} value={day}>
                                {WEEK_DAY_LABELS[day]}
                            </option>
                        ))}
                    </select>
                );

            case 'monthly_nth':
                return (
                    <div className="flex items-center gap-2">
                        <select
                            value={item.nthWeek || 1}
                            onChange={(e) =>
                                handleRegularChange(index, { nthWeek: Number(e.target.value) })
                            }
                            className="px-3 py-2 text-sm border border-border rounded-lg bg-bg-card text-txt-main focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {NTH_WEEK_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <select
                            value={item.dayOfWeek || 'monday'}
                            onChange={(e) =>
                                handleRegularChange(index, { dayOfWeek: e.target.value as WeekDay })
                            }
                            className="px-3 py-2 text-sm border border-border rounded-lg bg-bg-card text-txt-main focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            {WEEK_DAYS.map((day) => (
                                <option key={day} value={day}>
                                    {WEEK_DAY_LABELS[day]}
                                </option>
                            ))}
                        </select>
                    </div>
                );

            case 'monthly_date':
                return (
                    <Input
                        value={formatDates(item.dates)}
                        onChange={(e) =>
                            handleRegularChange(index, { dates: parseDatesString(e.target.value) })
                        }
                        placeholder="1, 15, 31"
                        className="w-40 text-sm"
                    />
                );

            default:
                return null;
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
                    휴무일 설정
                </h1>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-4 text-txt-muted">
                        매장명: {store?.name}
                    </div>
                    {/* ── 정기 휴무 섹션 ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-txt-main">정기 휴무</h3>
                            <button
                                type="button"
                                onClick={handleAddRegular}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-bg-hover rounded-md transition-colors"
                            >
                                <PlusOutlined />
                                <span>추가</span>
                            </button>
                        </div>

                        {regularDays.length === 0 ? (
                            <p className="text-sm text-txt-muted py-3 text-center border border-dashed border-border rounded-lg">
                                등록된 정기 휴무가 없습니다.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {regularDays.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 flex-wrap p-3 border border-border rounded-lg bg-bg-card"
                                    >
                                        {/* type 셀렉트 */}
                                        <select
                                            value={item.type}
                                            onChange={(e) =>
                                                handleRegularChange(index, {
                                                    type: e.target.value as RegularClosedType,
                                                })
                                            }
                                            className="px-3 py-2 text-sm border border-border rounded-lg bg-bg-card text-txt-main focus:outline-none focus:ring-1 focus:ring-primary"
                                        >
                                            {(
                                                Object.entries(REGULAR_CLOSED_TYPE_LABELS) as [
                                                    RegularClosedType,
                                                    string,
                                                ][]
                                            ).map(([value, label]) => (
                                                <option key={value} value={value}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>

                                        {/* type별 상세 입력 */}
                                        {renderRegularDetail(item, index)}

                                        {/* 설명 */}
                                        <Input
                                            value={item.description || ''}
                                            onChange={(e) =>
                                                handleRegularChange(index, { description: e.target.value })
                                            }
                                            placeholder="설명 (선택)"
                                            className="flex-1 min-w-[120px] text-sm"
                                        />

                                        {/* 삭제 버튼 */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRegular(index)}
                                            className="p-1.5 text-txt-muted hover:text-critical rounded-md transition-colors"
                                            aria-label="삭제"
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── 비정기 휴무 섹션 ── */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-txt-main">비정기 휴무</h3>
                            <button
                                type="button"
                                onClick={handleAddIrregular}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-bg-hover rounded-md transition-colors"
                            >
                                <PlusOutlined />
                                <span>추가</span>
                            </button>
                        </div>

                        {irregularDays.length === 0 ? (
                            <p className="text-sm text-txt-muted py-3 text-center border border-dashed border-border rounded-lg">
                                등록된 비정기 휴무가 없습니다.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {irregularDays.map((item, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 flex-wrap p-3 border border-border rounded-lg bg-bg-card"
                                    >
                                        {/* 날짜 */}
                                        <Input
                                            type="date"
                                            value={item.date}
                                            onChange={(e) =>
                                                handleIrregularChange(index, { date: e.target.value })
                                            }
                                            className="w-40 text-sm"
                                        />

                                        {/* 사유 */}
                                        <Input
                                            value={item.reason || ''}
                                            onChange={(e) =>
                                                handleIrregularChange(index, { reason: e.target.value })
                                            }
                                            placeholder="휴무 사유 (선택)"
                                            className="flex-1 min-w-[150px] text-sm"
                                        />

                                        {/* 삭제 버튼 */}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveIrregular(index)}
                                            className="p-1.5 text-txt-muted hover:text-critical rounded-md transition-colors"
                                            aria-label="삭제"
                                        >
                                            <DeleteOutlined />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── 하단 버튼 ── */}
                    <div className="flex justify-end gap-3 pt-6 border-t border-border mt-6">
                        <Button type="button" variant="outline" onClick={() => navigate(`/staff/stores/${id}`)}>
                            취소
                        </Button>
                        <Button type="submit" disabled={updateOperatingInfo.isPending}>
                            {updateOperatingInfo.isPending ? <Spinner size="sm" /> : '저장'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default ClosedDayEdit;
