import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input } from '@/components/ui';
import { useToast } from '@/hooks';
import { useDebounce } from '@/hooks/useDebounce';
import { useCreatePush, usePushEstimateCount } from '@/hooks/usePush';
import type { PushNotificationForm, PushEstimateParams, PushType, TriggerType } from '@/types/push';

// 회원 세그먼트 옵션
const GRADE_OPTIONS = ['전체', 'VIP', 'GOLD', 'SILVER', 'BRONZE'];
const REGION_OPTIONS = ['전체', '서울', '경기', '강원', '충남', '충북', '전남', '전북', '경남', '경북', '부산', '대구', '인천', '광주', '대전', '울산', '제주'];
const AGE_OPTIONS = ['전체', '10대', '20대', '30대', '40대', '50대', '60대 이상'];
const WEEK_DAYS = ['월', '화', '수', '목', '금', '토', '일'];

export const PushNotificationFormPage = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const createPush = useCreatePush();
    const [formData, setFormData] = useState<PushNotificationForm>({
        type: 'ad',
        title: '',
        body: '',
        deepLink: '',
        isScheduled: false,
        scheduledAt: '',
        triggerType: 'none',
        targetUserIds: [],
        androidExpandedTitle: '',
        androidExpandedBody: '',
        androidSummary: '',
        regularScheduleType: 'daily',
        regularScheduleDays: [],
        timeLimitEventId: '',
    });

    // 세그먼트 선택
    const [selectedGrades, setSelectedGrades] = useState<string[]>(['전체']);
    const [selectedRegions, setSelectedRegions] = useState<string[]>(['전체']);
    const [selectedAges, setSelectedAges] = useState<string[]>(['전체']);

    // Android 이미지 첨부 (아이콘 / 대문 이미지 분리)
    const [androidSmallIcon, setAndroidSmallIcon] = useState<string | null>(null);
    const [androidBigPicture, setAndroidBigPicture] = useState<string | null>(null);
    const smallIconFileInputRef = useRef<HTMLInputElement>(null);
    const bigPictureFileInputRef = useRef<HTMLInputElement>(null);

    // 세그먼트 옵션 토글
    const toggleOption = (
        value: string,
        selected: string[],
        setSelected: (v: string[]) => void
    ) => {
        if (value === '전체') {
            setSelected(['전체']);
            return;
        }
        const next = selected.filter((v) => v !== '전체');
        if (next.includes(value)) {
            const removed = next.filter((v) => v !== value);
            setSelected(removed.length === 0 ? ['전체'] : removed);
        } else {
            setSelected([...next, value]);
        }
    };

    // 예상 발송 대상자 수 (Debounce → API 조회)
    const estimateParams = useMemo<PushEstimateParams>(() => ({
        grades: selectedGrades,
        regions: selectedRegions,
        ages: selectedAges,
        triggerType: formData.triggerType,
    }), [selectedGrades, selectedRegions, selectedAges, formData.triggerType]);
    const debouncedEstimateParams = useDebounce(estimateParams, 500);
    const { estimatedCount, isLoading: isEstimating } = usePushEstimateCount(debouncedEstimateParams);

    // 야간 발송(광고성) 경고
    const [isNightTimeWarning, setIsNightTimeWarning] = useState(false);

    useEffect(() => {
        if (formData.type !== 'ad') {
            setIsNightTimeWarning(false);
            return;
        }

        const checkNightTime = (date: Date) => {
            const hour = date.getHours();
            return hour >= 21 || hour < 8;
        };

        if (formData.isScheduled && formData.scheduledAt) {
            setIsNightTimeWarning(checkNightTime(new Date(formData.scheduledAt)));
        } else if (!formData.isScheduled) {
            setIsNightTimeWarning(checkNightTime(new Date()));
        } else {
            setIsNightTimeWarning(false);
        }
    }, [formData.type, formData.isScheduled, formData.scheduledAt]);

    // 이미지 업로드 핸들러
    const handleSmallIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAndroidSmallIcon(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleBigPictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setAndroidBigPicture(reader.result as string);
        reader.readAsDataURL(file);
    };

    const ChipGroup = ({
        label,
        options,
        selected,
        setSelected,
    }: {
        label: string;
        options: string[];
        selected: string[];
        setSelected: (v: string[]) => void;
    }) => (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">{label}</label>
            <div className="flex flex-wrap gap-2">
                {options.map((opt) => (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => toggleOption(opt, selected, setSelected)}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${selected.includes(opt)
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                            }`}
                    >
                        {opt}
                    </button>
                ))}
            </div>
        </div>
    );

    // 야간 발송 차단 (정보통신망법 제50조 — 광고성 21:00~08:00 발송 금지)
    const isNightTimeSendBlocked = (): boolean => {
        if (formData.type !== 'ad') return false;
        const checkHour = (date: Date) => {
            const h = date.getHours();
            return h >= 21 || h < 8;
        };
        if (formData.isScheduled && formData.scheduledAt) {
            return checkHour(new Date(formData.scheduledAt));
        }
        if (!formData.isScheduled) {
            return checkHour(new Date());
        }
        return false;
    };

    // 전송 핸들러 (백엔드 API 연동 예시)
    const handleSubmit = async () => {
        // 광고성 야간 발송 차단
        if (isNightTimeSendBlocked()) {
            alert('광고성 푸시는 21:00~08:00 사이에 발송할 수 없습니다. (정보통신망법 제50조)');
            return;
        }

        try {
            // 1. 세그먼트 데이터 병합
            const segments = {
                grades: selectedGrades,
                regions: selectedRegions,
                ages: selectedAges,
            };

            // 2. 예약 시간 UTC (또는 ISO) 포맷팅
            let formattedScheduledAt = undefined;
            if (formData.isScheduled && formData.scheduledAt) {
                // 백엔드 요구 사항에 맞춰 ISOString 변환
                formattedScheduledAt = new Date(formData.scheduledAt).toISOString();
            }

            // 3. 실제 전송 로직이 들어갈 부분 (FormData 또는 JSON Payload 구성)
            // 보통 이미지가 있다면 multipart/form-data 방식을 채택합니다.
            const apiPayload = new FormData();

            // 데이터 Append
            apiPayload.append('type', formData.type);
            apiPayload.append('title', formData.title);
            apiPayload.append('body', formData.body);
            if (formData.deepLink) apiPayload.append('deepLink', formData.deepLink);

            apiPayload.append('isScheduled', String(formData.isScheduled));
            if (formattedScheduledAt) apiPayload.append('scheduledAt', formattedScheduledAt);

            apiPayload.append('triggerType', formData.triggerType);
            if (formData.triggerType === 'regular_schedule') {
                apiPayload.append('regularScheduleType', formData.regularScheduleType || 'daily');
                if (formData.regularScheduleType === 'weekly' && formData.regularScheduleDays) {
                    apiPayload.append('regularScheduleDays', JSON.stringify(formData.regularScheduleDays));
                }
            } else if (formData.triggerType === 'time_limit' && formData.timeLimitEventId) {
                apiPayload.append('timeLimitEventId', formData.timeLimitEventId);
            }

            apiPayload.append('segments', JSON.stringify(segments));

            // Android 확장 필드
            if (formData.androidSummary) apiPayload.append('androidSummary', formData.androidSummary);
            if (formData.androidExpandedTitle) apiPayload.append('androidExpandedTitle', formData.androidExpandedTitle);
            if (formData.androidExpandedBody) apiPayload.append('androidExpandedBody', formData.androidExpandedBody);

            // 파일 객체 Append (FileReader로 만든 Base64가 아닌 원본 파일)
            const smallIconFile = smallIconFileInputRef.current?.files?.[0];
            const bigPictureFile = bigPictureFileInputRef.current?.files?.[0];

            if (smallIconFile) apiPayload.append('androidSmallIcon', smallIconFile);
            if (bigPictureFile) apiPayload.append('androidBigPicture', bigPictureFile);

            await createPush.mutateAsync(apiPayload);
            toast.success('푸시 발송(예약)이 접수되었습니다.');
            navigate('/marketing/push');
        } catch {
            toast.error('전송 중 오류가 발생했습니다.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">앱 푸시 발송</h1>
                <div className="gap-2 flex">
                    <Button variant="outline">임시 저장</Button>
                    <Button onClick={handleSubmit}>전송/예약</Button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
                {/* Left: Form */}
                <div className="col-span-2 space-y-4">
                    {/* 기본 설정 */}
                    <Card className="p-4 space-y-4">
                        <h2 className="font-semibold text-lg border-b pb-2">기본 설정</h2>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">푸시 목적</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2">
                                    <input type="radio" value="ad" checked={formData.type === 'ad'} onChange={(e) => setFormData({ ...formData, type: e.target.value as PushType })} />
                                    광고성 (야간 발송 제한)
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" value="info" checked={formData.type === 'info'} onChange={(e) => setFormData({ ...formData, type: e.target.value as PushType })} />
                                    정보성 (주문/배송)
                                </label>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">트리거 설정</label>
                            <select className="border p-2 rounded text-sm" value={formData.triggerType} onChange={(e) => setFormData({ ...formData, triggerType: e.target.value as TriggerType })}>
                                <option value="none">수동 발송 (전체/특정 대상자)</option>
                                <optgroup label="행동 기반 (User Action)">
                                    <option value="cart_abandoned">장바구니 방치 (장바구니에 담고 미결제)</option>
                                    <option value="product_viewed">특정 상품 반복 조회</option>
                                    <option value="app_installed">설치/실행 (첫 실행 시 웰컴 메시지)</option>
                                    <option value="purchase_completed">구매 완료 (관련 추천 상품 제안)</option>
                                </optgroup>
                                <optgroup label="시간/예약 기반 트리거">
                                    <option value="regular_schedule">정기 발송 (매일/매주 정해진 시간)</option>
                                    <option value="time_limit">특정 시간 제한 (타임 세일 종료 임박 등)</option>
                                </optgroup>
                            </select>

                            {formData.triggerType === 'regular_schedule' && (
                                <div className="mt-2 p-3 bg-gray-50 rounded border flex flex-col gap-2">
                                    <label className="text-sm font-semibold">정기 발송 주기</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="radio" value="daily" checked={formData.regularScheduleType === 'daily'}
                                                onChange={() => setFormData({ ...formData, regularScheduleType: 'daily' })} />
                                            매일
                                        </label>
                                        <label className="flex items-center gap-2 text-sm">
                                            <input type="radio" value="weekly" checked={formData.regularScheduleType === 'weekly'}
                                                onChange={() => setFormData({ ...formData, regularScheduleType: 'weekly' })} />
                                            매주
                                        </label>
                                    </div>

                                    {formData.regularScheduleType === 'weekly' && (
                                        <div className="flex flex-wrap gap-3 mt-2 pt-3 border-t">
                                            {WEEK_DAYS.map(day => (
                                                <label key={day} className="flex items-center gap-1.5 text-sm cursor-pointer hover:font-semibold">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.regularScheduleDays?.includes(day)}
                                                        onChange={(e) => {
                                                            const days = formData.regularScheduleDays || [];
                                                            if (e.target.checked) {
                                                                setFormData({ ...formData, regularScheduleDays: [...days, day] });
                                                            } else {
                                                                setFormData({ ...formData, regularScheduleDays: days.filter(d => d !== day) });
                                                            }
                                                        }}
                                                    />
                                                    {day}
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {formData.triggerType === 'time_limit' && (
                                <div className="mt-2 p-3 bg-gray-50 rounded border flex flex-col gap-2">
                                    <label className="text-sm font-semibold">연결할 이벤트 선택</label>
                                    <select
                                        className="border p-2 rounded text-sm bg-white"
                                        value={formData.timeLimitEventId || ''}
                                        onChange={(e) => setFormData({ ...formData, timeLimitEventId: e.target.value })}
                                    >
                                        <option value="">이벤트를 선택하세요 (이벤트 데이터 연동)</option>
                                        <option value="evt_001">여름 시즌 오프 최대 80% 할인</option>
                                        <option value="evt_002">주말 반짝 타임세일</option>
                                        <option value="evt_003">신규 회원 웰컴 쿠폰팩 발급</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">발송 시점</label>
                            <div className="flex gap-4 items-center">
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={!formData.isScheduled} onChange={() => setFormData({ ...formData, isScheduled: false })} /> 즉시 발송
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="radio" checked={formData.isScheduled} onChange={() => setFormData({ ...formData, isScheduled: true })} /> 예약 발송
                                </label>
                            </div>
                            {formData.isScheduled && (
                                <input type="datetime-local" className="border p-2 rounded w-64 mt-1 text-sm"
                                    value={formData.scheduledAt} onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })} />
                            )}
                            {isNightTimeWarning && (
                                <p className="text-red-500 text-xs mt-1 bg-red-50 p-2 rounded">
                                    ※ <strong>야간 발송 제한:</strong> 정보통신망법에 따라 오후 9시부터 익일 오전 8시 사이의 광고성 정보 전송은 <strong>별도의 야간 수신 동의</strong>를 받은 사용자에게만 이루어져야 합니다.
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* 회원 세그먼트 */}
                    <Card className="p-4 space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <h2 className="font-semibold text-lg">회원 세그먼트</h2>
                            <span className="text-sm text-blue-600 font-semibold">예상 대상: {isEstimating ? '계산 중...' : `${estimatedCount.toLocaleString()}명`}</span>
                        </div>
                        <ChipGroup label="등급별" options={GRADE_OPTIONS} selected={selectedGrades} setSelected={setSelectedGrades} />
                        <ChipGroup label="지역 (배달지 기준)" options={REGION_OPTIONS} selected={selectedRegions} setSelected={setSelectedRegions} />
                        <ChipGroup label="연령" options={AGE_OPTIONS} selected={selectedAges} setSelected={setSelectedAges} />
                    </Card>

                    {/* 메시지 작성 */}
                    <Card className="p-4 space-y-4">
                        <h2 className="font-semibold text-lg border-b pb-2">메시지 작성</h2>
                        <Input label="제목 (최대 30자)" maxLength={30} value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="푸시 제목을 입력하세요" />

                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium">내용</label>
                            <textarea className="w-full border p-2 rounded h-24 text-sm"
                                placeholder="내용을 입력하세요."
                                value={formData.body}
                                onChange={(e) => setFormData({ ...formData, body: e.target.value })} />
                        </div>

                        <Input label="딥링크 URL (옵션)" placeholder="yourapp://path/to/page"
                            value={formData.deepLink}
                            onChange={(e) => setFormData({ ...formData, deepLink: e.target.value })} />

                        {/* 안드로이드 펼친 화면 설정 */}
                        <div className="flex flex-col gap-4 border-t pt-4 mt-2">
                            <h3 className="font-semibold text-md">Android 상세/펼친 화면 설정</h3>

                            <Input label="요약 내용 (최대 20자)" maxLength={20} value={formData.androidSummary || ''}
                                onChange={(e) => setFormData({ ...formData, androidSummary: e.target.value })}
                                placeholder="이모지 및 개인화 지원" />

                            <Input label="제목 (펼친 화면, 최대 30자)" maxLength={30} value={formData.androidExpandedTitle || ''}
                                onChange={(e) => setFormData({ ...formData, androidExpandedTitle: e.target.value })}
                                placeholder="이모지 및 개인화 지원" />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium">본문 (펼친 화면, 최대 440자)</label>
                                <textarea className="w-full border p-2 rounded h-24 text-sm"
                                    maxLength={440}
                                    placeholder="이모지 및 개인화 지원"
                                    value={formData.androidExpandedBody || ''}
                                    onChange={(e) => setFormData({ ...formData, androidExpandedBody: e.target.value })} />
                            </div>

                            <div className="bg-gray-50 p-3 rounded space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold">이미지 (기본 화면 - 1:1 비율)</label>
                                    <p className="text-[11px] text-gray-500 leading-tight">256x256 px 권장 / 1MB 이하(Upload), 5MB 이하(URL) / png, jpg, jpeg</p>
                                    <input ref={smallIconFileInputRef} type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleSmallIconUpload} />
                                    {androidSmallIcon ? (
                                        <div className="relative w-24 h-24 border rounded overflow-hidden">
                                            <img src={androidSmallIcon} alt="android icon preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setAndroidSmallIcon(null); if (smallIconFileInputRef.current) smallIconFileInputRef.current.value = ''; }}
                                                className="absolute top-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => smallIconFileInputRef.current?.click()}
                                            className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-white rounded p-3 text-xs w-full max-w-xs text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                        >
                                            📎 기본 이미지 첨부
                                        </button>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 border-t border-gray-200 pt-3">
                                    <label className="text-sm font-semibold">이미지 (펼친 화면 - 2:1 비율)</label>
                                    <p className="text-[11px] text-gray-500 leading-tight">600x300 ~ 1038x519 px 권장 / 1MB 이하(Upload), 5MB 이하(URL) / png, jpg, jpeg</p>
                                    <input ref={bigPictureFileInputRef} type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleBigPictureUpload} />
                                    {androidBigPicture ? (
                                        <div className="relative w-full max-w-sm border rounded overflow-hidden aspect-[2/1]">
                                            <img src={androidBigPicture} alt="android big picture preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setAndroidBigPicture(null); if (bigPictureFileInputRef.current) bigPictureFileInputRef.current.value = ''; }}
                                                className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded"
                                            >
                                                삭제
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => bigPictureFileInputRef.current?.click()}
                                            className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 bg-white rounded p-4 text-xs w-full max-w-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
                                        >
                                            📎 펼친 이미지 첨부
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 테스트 발송 */}
                    <Card className="p-4 space-y-3">
                        <h2 className="font-semibold text-lg border-b pb-2">테스트 발송</h2>
                        <div className="flex gap-2 items-end">
                            <Input label="테스트 발송" placeholder="휴대폰 번호 (- 제외)" className="flex-1" />
                            <Button variant="secondary" className="shrink-0">발송</Button>
                        </div>
                    </Card>
                </div>

                {/* Right: Mockup Preview */}
                <div className="col-span-1">
                    <Card className="p-4 bg-gray-50 space-y-4 sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
                        <h3 className="font-bold text-center text-gray-700">푸시 미리보기</h3>

                        {/* iOS 스타일 */}
                        <div>
                            <p className="text-xs text-gray-400 text-center mb-2">iOS</p>
                            <div className="mx-auto w-[280px] bg-white rounded-2xl shadow-lg p-3 flex gap-3 border border-gray-100 items-start">
                                <div className="w-10 h-10 rounded-xl bg-orange-500 flex-shrink-0 mt-0.5" />
                                <div className="flex flex-col flex-1 overflow-hidden">
                                    <p className="text-[12px] font-bold text-gray-800 truncate">
                                        {formData.type === 'ad' && <span className="text-gray-400 mr-1">(광고)</span>}
                                        {formData.title || '푸시 제목'}
                                    </p>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-tight mt-0.5">
                                        {formData.body || '내용이 여기에 표시됩니다.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Android 스타일 */}
                        <div>
                            <p className="text-xs text-gray-400 text-center mb-2">Android</p>
                            <div className="mx-auto w-[280px] bg-white rounded shadow border border-gray-200 overflow-hidden">
                                <div className="flex gap-3 p-3 items-start pb-2">
                                    {androidSmallIcon ? (
                                        <img src={androidSmallIcon} alt="icon" className="w-8 h-8 rounded-full flex-shrink-0 mt-0.5 object-cover" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-orange-500 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <p className="text-[10px] text-gray-400 truncate mb-0.5">
                                            {formData.androidSummary || '요약 표시 영역 (앱 이름)'}
                                        </p>
                                        <p className="text-[12px] font-bold text-gray-800 break-words line-clamp-2">
                                            {formData.type === 'ad' && <span className="text-gray-400 mr-1">(광고)</span>}
                                            {formData.androidExpandedTitle || formData.title || '푸시 제목'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-1 whitespace-pre-wrap">
                                            {formData.androidExpandedBody || formData.body || '내용이 여기에 표시됩니다.'}
                                        </p>
                                    </div>
                                </div>
                                {/* 안드로이드 확장 대문 이미지 (펼친 화면) */}
                                {androidBigPicture && (
                                    <img src={androidBigPicture} alt="Big picture" className="w-full aspect-[2/1] object-cover border-t border-gray-100" />
                                )}
                            </div>
                        </div>

                        {formData.triggerType !== 'none' && (
                            <p className="text-center text-xs text-orange-600 px-2">
                                * 자동화 캠페인은 조건 달성 시 즉시 발송됩니다.
                            </p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};
