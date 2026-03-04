/**
 * 이벤트 폼 컴포넌트 (3탭 구조)
 * 기본정보 / 버튼&공유 / 참여자&통계
 */
import { useState } from 'react';
import { EyeOutlined, BarChartOutlined, TeamOutlined, FormOutlined } from '@ant-design/icons';

import { Input, Label, Switch, Textarea } from '@/components/ui';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { RichTextEditor } from '@/components/ui/RichTextEditor';
import type {
  EventFormData,
  EventStats,
  EventType,
  ParticipantCollectionMode,
  ParticipantFormField,
  ShareChannel,
} from '@/types/event';
import {
  EVENT_TYPE_LABELS,
  COLLECTION_MODE_LABELS,
  PARTICIPANT_FORM_FIELD_LABELS,
  SHARE_CHANNEL_LABELS,
} from '@/types/event';
import type { EventFormTab } from '@/constants/event';
import { EVENT_FORM_TABS, PROMO_LINK_BASE } from '@/constants/event';
import { EventParticipantList } from './EventParticipantList';

interface EventFormProps {
  formData: EventFormData;
  onFormChange: (updates: Partial<EventFormData>) => void;
  disabled: boolean;
  eventId?: string;
  stats?: EventStats;
}

const formatNumber = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

const ALL_EVENT_TYPES: EventType[] = ['general', 'participation'];
const ALL_COLLECTION_MODES: ParticipantCollectionMode[] = ['auto', 'form_input'];
const ALL_FORM_FIELDS: ParticipantFormField[] = ['name', 'phone', 'email', 'address'];
const ALL_SHARE_CHANNELS: ShareChannel[] = ['kakao', 'facebook', 'instagram', 'twitter', 'link_copy'];

export function EventForm({ formData, onFormChange, disabled, eventId, stats }: EventFormProps) {
  const [activeTab, setActiveTab] = useState<EventFormTab>('basic');

  const handleImageChange = (field: keyof EventFormData) => (file: File | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      onFormChange({ [field]: url });
    } else {
      onFormChange({ [field]: '' });
    }
  };

  const handleDateChange = (field: keyof EventFormData) => (date: Date | undefined) => {
    onFormChange({ [field]: date ? date.toISOString().slice(0, 16) : '' });
  };

  const parseDate = (value: string): Date | undefined => {
    return value ? new Date(value) : undefined;
  };

  const toggleShareChannel = (channel: ShareChannel) => {
    const channels = formData.shareChannels.includes(channel)
      ? formData.shareChannels.filter((c) => c !== channel)
      : [...formData.shareChannels, channel];
    onFormChange({ shareChannels: channels });
  };

  // 참여이벤트일 때만 참여자 탭 표시
  const visibleTabs = formData.eventType === 'participation'
    ? EVENT_FORM_TABS
    : EVENT_FORM_TABS.filter((t) => t.value !== 'participant');

  return (
    <div className="space-y-4">
      {/* 탭 헤더 */}
      <div className="flex border-b border-border">
        {visibleTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.value
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-muted hover:text-txt-main'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div className="space-y-4">
        {activeTab === 'basic' && (
          <BasicInfoTab
            formData={formData}
            onFormChange={onFormChange}
            disabled={disabled}
            handleImageChange={handleImageChange}
            handleDateChange={handleDateChange}
            parseDate={parseDate}
            eventId={eventId}
          />
        )}
        {activeTab === 'share' && (
          <ButtonShareTab
            formData={formData}
            onFormChange={onFormChange}
            disabled={disabled}
            toggleShareChannel={toggleShareChannel}
            handleImageChange={handleImageChange}
          />
        )}
        {activeTab === 'participant' && formData.eventType === 'participation' && (
          <ParticipantStatsTab
            formData={formData}
            onFormChange={onFormChange}
            disabled={disabled}
            eventId={eventId}
            stats={stats}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// 탭 1: 기본 정보
// ============================================
function BasicInfoTab({
  formData,
  onFormChange,
  disabled,
  handleImageChange,
  handleDateChange,
  parseDate,
  eventId,
}: {
  formData: EventFormData;
  onFormChange: (updates: Partial<EventFormData>) => void;
  disabled: boolean;
  handleImageChange: (field: keyof EventFormData) => (file: File | null) => void;
  handleDateChange: (field: keyof EventFormData) => (date: Date | undefined) => void;
  parseDate: (value: string) => Date | undefined;
  eventId?: string;
}) {
  return (
    <div className="space-y-4">
      {/* 이벤트 유형 선택 */}
      <div>
        <Label required>이벤트 유형</Label>
        <div className="flex gap-2 mt-1">
          {ALL_EVENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onFormChange({ eventType: type })}
              disabled={disabled}
              className={`flex-1 px-4 py-2.5 text-sm rounded-lg border-2 transition-colors ${formData.eventType === type
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-border bg-bg-card text-txt-secondary hover:border-primary/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {type === 'participation' ? <TeamOutlined /> : <FormOutlined />}
                {EVENT_TYPE_LABELS[type]}
              </div>
              <p className="text-xs text-txt-muted mt-0.5">
                {type === 'general' ? '정보 제공 목적' : '참여자 정보 수집'}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div>
        <Label required>이벤트 제목</Label>
        <Input
          value={formData.title}
          onChange={(e) => onFormChange({ title: e.target.value })}
          placeholder="이벤트 제목을 입력하세요"
          disabled={disabled}
        />
      </div>

      <div>
        <Label>간단 설명</Label>
        <Input
          value={formData.description}
          onChange={(e) => onFormChange({ description: e.target.value })}
          placeholder="목록에 표시될 간단 설명"
          disabled={disabled}
        />
      </div>

      <div>
        <Label required>배너 이미지</Label>
        <ImageUpload
          value={formData.bannerImageUrl}
          onChange={handleImageChange('bannerImageUrl')}
          disabled={disabled}
        />
      </div>

      <div>
        <Label>상세 이미지</Label>
        <ImageUpload
          value={formData.detailImageUrl}
          onChange={handleImageChange('detailImageUrl')}
          disabled={disabled}
        />
      </div>

      <div>
        <Label>본문 내용</Label>
        <RichTextEditor
          value={formData.content}
          onChange={(html) => onFormChange({ content: html })}
          disabled={disabled}
          placeholder="이벤트 본문을 작성하세요..."
        />
      </div>

      {/* 이벤트 기간 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>시작일</Label>
          <DateTimePicker
            value={parseDate(formData.eventStartDate)}
            onChange={handleDateChange('eventStartDate')}
            disabled={disabled}
          />
        </div>
        <div>
          <Label required>종료일</Label>
          <DateTimePicker
            value={parseDate(formData.eventEndDate)}
            onChange={handleDateChange('eventEndDate')}
            disabled={disabled}
            minDate={parseDate(formData.eventStartDate)}
          />
        </div>
      </div>

      {/* 게시 예약 */}
      <div className="p-4 bg-bg-hover rounded-lg border border-border space-y-3">
        <div className="flex items-center justify-between">
          <Label>게시 예약</Label>
          <Switch
            checked={formData.usePublishSchedule}
            onCheckedChange={(checked) => onFormChange({ usePublishSchedule: checked })}
            disabled={disabled}
          />
        </div>
        {formData.usePublishSchedule && (
          <div>
            <Label>예약 일시</Label>
            <DateTimePicker
              value={parseDate(formData.publishDate)}
              onChange={handleDateChange('publishDate')}
              disabled={disabled}
            />
          </div>
        )}
      </div>

      {/* 딥링크 */}
      <div>
        <Label>딥링크 URL</Label>
        <Input
          value={formData.deepLink}
          onChange={(e) => onFormChange({ deepLink: e.target.value })}
          placeholder="myapp://events/..."
          disabled={disabled}
        />
        <p className="mt-1 text-xs text-txt-muted">비워두면 자동 생성됩니다.</p>
      </div>

      {/* 프로모션 링크 (수정 모드에서만 표시) */}
      {eventId && (
        <div>
          <Label>프로모션 링크</Label>
          <Input
            value={`${PROMO_LINK_BASE}${eventId}`}
            readOnly
            disabled
          />
          <p className="mt-1 text-xs text-txt-muted">자동 생성된 웹 프로모션 링크입니다.</p>
        </div>
      )}
    </div>
  );
}

// ============================================
// 탭 2: 버튼 & 공유
// ============================================
function ButtonShareTab({
  formData,
  onFormChange,
  disabled,
  toggleShareChannel,
  handleImageChange,
}: {
  formData: EventFormData;
  onFormChange: (updates: Partial<EventFormData>) => void;
  disabled: boolean;
  toggleShareChannel: (channel: ShareChannel) => void;
  handleImageChange: (field: keyof EventFormData) => (file: File | null) => void;
}) {
  const allChannels = ALL_SHARE_CHANNELS;
  const [previewChannel, setPreviewChannel] = useState<ShareChannel>('kakao');

  return (
    <div className="space-y-4">
      {/* 주문 버튼 */}
      <div className="p-4 bg-bg-hover rounded-lg border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-txt-main">주문하러 가기 버튼</span>
          <Switch
            checked={formData.orderButtonEnabled}
            onCheckedChange={(checked) => onFormChange({ orderButtonEnabled: checked })}
            disabled={disabled}
          />
        </div>
        {formData.orderButtonEnabled && (
          <>
            <div>
              <Label required>버튼 텍스트</Label>
              <Input
                value={formData.orderButtonLabel}
                onChange={(e) => onFormChange({ orderButtonLabel: e.target.value })}
                placeholder="주문하러 가기"
                disabled={disabled}
              />
            </div>
            <div>
              <Label required>버튼 링크</Label>
              <Input
                value={formData.orderButtonLink}
                onChange={(e) => onFormChange({ orderButtonLink: e.target.value })}
                placeholder="myapp://menu 또는 https://..."
                disabled={disabled}
              />
            </div>
          </>
        )}
      </div>

      {/* 공유 설정 */}
      <div className="p-4 bg-bg-hover rounded-lg border border-border space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-txt-main">공유하기 버튼</span>
          <Switch
            checked={formData.shareButtonEnabled}
            onCheckedChange={(checked) => onFormChange({ shareButtonEnabled: checked })}
            disabled={disabled}
          />
        </div>
        {formData.shareButtonEnabled && (
          <>
            <div>
              <Label>공유 채널</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {allChannels.map((channel) => (
                  <button
                    key={channel}
                    onClick={() => toggleShareChannel(channel)}
                    disabled={disabled}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${formData.shareChannels.includes(channel)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-bg-card border-border text-txt-muted hover:border-primary/50'
                      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    {SHARE_CHANNEL_LABELS[channel]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>공유 제목</Label>
              <Input
                value={formData.shareTitle}
                onChange={(e) => onFormChange({ shareTitle: e.target.value })}
                placeholder="공유 시 표시될 제목"
                disabled={disabled}
              />
            </div>
            <div>
              <Label>공유 설명</Label>
              <Input
                value={formData.shareDescription}
                onChange={(e) => onFormChange({ shareDescription: e.target.value })}
                placeholder="공유 시 표시될 설명"
                disabled={disabled}
              />
            </div>
            <div>
              <Label>공유 썸네일</Label>
              <ImageUpload
                value={formData.shareImageUrl}
                onChange={handleImageChange('shareImageUrl')}
                disabled={disabled}
              />
            </div>
          </>
        )}
      </div>



      {/* 미리보기 패널 */}
      <div className="rounded-xl border border-border overflow-hidden">
        {/* 미리보기 탭 */}
        <div className="flex border-b border-border bg-bg-hover">
          {[
            { id: 'kakao' as const, label: '카카오', color: '#FEE500', emoji: '💬' },
            { id: 'facebook' as const, label: '페이스북', color: '#1877F2', emoji: '📘' },
            { id: 'instagram' as const, label: '인스타그램', color: '#E1306C', emoji: '📸' },
            { id: 'twitter' as const, label: 'X', color: '#000000', emoji: '✕' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPreviewChannel(tab.id)}
              className={`flex-1 py-2.5 text-xs font-medium transition-all border-b-2 ${previewChannel === tab.id
                ? 'border-primary text-primary bg-white'
                : 'border-transparent text-txt-muted hover:text-txt-main'
                }`}
            >
              <span className="block text-base leading-none mb-0.5">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 미리보기 콘텐츠 */}
        <div className="p-6 bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center min-h-[320px]">
          <SharePreview
            channel={previewChannel}
            title={formData.shareTitle || formData.title || '이벤트 제목'}
            description={formData.shareDescription || formData.description || '이벤트 내용을 입력하세요'}
            imageUrl={formData.shareImageUrl || formData.bannerImageUrl}
          />
        </div>

        <div className="px-4 py-2 bg-bg-hover border-t border-border text-xs text-txt-muted text-center">
          ※ 실제 공유 화면과 다를 수 있습니다. 입력한 제목/설명/이미지가 반영됩니다.
        </div>
      </div>
    </div>
  );
}

// ============================================
// 공유 미리보기 컴포넌트
// ============================================
function SharePreview({
  channel,
  title,
  description,
  imageUrl,
}: {
  channel: ShareChannel;
  title: string;
  description: string;
  imageUrl: string;
}) {
  const truncate = (str: string, n: number) => str.length > n ? str.slice(0, n) + '…' : str;

  if (channel === 'kakao') {
    return (
      <div className="w-72 bg-[#212121] rounded-2xl overflow-hidden shadow-2xl">
        {/* 카카오 채팅 헤더 */}
        <div className="bg-[#FEE500] px-4 py-3 flex items-center gap-2">
          <div className="w-6 h-6 bg-[#3C1E1E] rounded-full flex items-center justify-center text-[#FEE500] text-xs font-black">K</div>
          <span className="text-[#3C1E1E] text-sm font-semibold">카카오톡</span>
        </div>
        {/* 메시지 버블 */}
        <div className="p-4 space-y-1">
          <div className="text-xs text-gray-400 text-center mb-3">오늘 오후 2:15</div>
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-[#FEE500] flex-shrink-0 flex items-center justify-center text-[#3C1E1E] text-xs font-bold">앱</div>
            <div className="flex-1">
              {/* 카카오 링크 카드 */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                {imageUrl ? (
                  <img src={imageUrl} alt="preview" className="w-full h-32 object-cover" />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center text-4xl">🎉</div>
                )}
                <div className="p-3">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{truncate(title, 28)}</p>
                  <p className="text-xs text-gray-500 mt-1 leading-tight">{truncate(description, 46)}</p>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <button className="w-full text-xs text-[#3C1E1E] font-medium py-1">자세히 보기</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (channel === 'facebook') {
    return (
      <div className="w-80 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Facebook 헤더 */}
        <div className="bg-[#1877F2] px-4 py-2 flex items-center gap-2">
          <span className="text-white font-black text-xl">f</span>
          <span className="text-white text-sm font-semibold">Facebook</span>
        </div>
        {/* 포스트 */}
        <div className="p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">A</div>
            <div>
              <p className="text-sm font-semibold text-gray-900">앱 공식 페이지</p>
              <p className="text-xs text-gray-500">방금 전 · 🌐</p>
            </div>
          </div>
          <p className="text-sm text-gray-800 mb-3">{truncate(description, 80)}</p>
        </div>
        {/* OG 카드 */}
        <div className="border-t border-gray-200">
          {imageUrl ? (
            <img src={imageUrl} alt="preview" className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-5xl">📱</div>
          )}
          <div className="px-3 py-2 bg-gray-50">
            <p className="text-xs text-gray-500 uppercase tracking-wide">EVENT.APP.COM</p>
            <p className="text-sm font-bold text-gray-900 leading-tight mt-0.5">{truncate(title, 50)}</p>
            <p className="text-xs text-gray-500 mt-0.5">{truncate(description, 60)}</p>
          </div>
        </div>
        {/* 액션 버튼 */}
        <div className="flex border-t border-gray-200 divide-x divide-gray-200">
          {['👍 좋아요', '💬 댓글', '↗ 공유'].map((btn) => (
            <button key={btn} className="flex-1 py-2 text-xs text-gray-600 font-medium hover:bg-gray-50">{btn}</button>
          ))}
        </div>
      </div>
    );
  }

  if (channel === 'instagram') {
    return (
      <div className="w-72 bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Instagram 헤더 */}
        <div className="bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F56040] px-4 py-2.5 flex items-center gap-2">
          <span className="text-white font-bold text-sm italic">Instagram</span>
        </div>
        {/* 프로필 */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FCAF45] via-[#E1306C] to-[#833AB4] p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700">앱</div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-gray-900">app_official</p>
          </div>
          <span className="text-xs text-blue-500 font-medium">팔로우</span>
        </div>
        {/* 이미지 */}
        {imageUrl ? (
          <img src={imageUrl} alt="preview" className="w-full aspect-square object-cover" />
        ) : (
          <div className="w-full aspect-square bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 flex items-center justify-center text-6xl">📸</div>
        )}
        {/* 액션 */}
        <div className="px-3 py-2">
          <div className="flex gap-3 mb-2 text-lg">
            <span>🤍</span><span>💬</span><span>↗</span>
          </div>
          <p className="text-xs leading-relaxed">
            <span className="font-bold">app_official</span>{' '}
            <span className="text-gray-800">{truncate(description, 60)}</span>
          </p>
          <p className="text-xs text-[#E1306C] mt-1">{truncate(title, 30)}</p>
        </div>
      </div>
    );
  }

  if (channel === 'twitter') {
    return (
      <div className="w-80 bg-black rounded-2xl shadow-2xl overflow-hidden">
        {/* X 헤더 */}
        <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-800">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-black"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.273 5.648 5.89-5.648Zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </div>
          <span className="text-white text-sm font-bold">X(트위터)</span>
        </div>
        {/* 트윗 */}
        <div className="p-4">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">A</div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-bold">앱 공식</span>
                <span className="text-gray-500 text-xs">@app_official · 방금</span>
              </div>
              <p className="text-white text-sm mt-1 leading-relaxed">{truncate(description, 100)}</p>
              {/* 링크 카드 */}
              <div className="mt-3 rounded-xl overflow-hidden border border-gray-700">
                {imageUrl ? (
                  <img src={imageUrl} alt="preview" className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-gray-800 flex items-center justify-center text-4xl">✕</div>
                )}
                <div className="p-3 bg-gray-900">
                  <p className="text-xs text-gray-500">event.app.com</p>
                  <p className="text-sm font-bold text-white leading-tight">{truncate(title, 45)}</p>
                </div>
              </div>
              {/* 반응 */}
              <div className="flex gap-6 mt-3 text-gray-500 text-xs">
                <span>💬 <span className="ml-1">0</span></span>
                <span>🔁 <span className="ml-1">0</span></span>
                <span>❤️ <span className="ml-1">0</span></span>
                <span>📊 <span className="ml-1">0</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Other channels handled above
  return null;
}

// ============================================
// 탭 4: 참여자 & 통계 (참여이벤트 전용)
// ============================================
function ParticipantStatsTab({
  formData,
  onFormChange,
  disabled,
  eventId,
  stats,
}: {
  formData: EventFormData;
  onFormChange: (updates: Partial<EventFormData>) => void;
  disabled: boolean;
  eventId?: string;
  stats?: EventStats;
}) {
  const toggleFormField = (field: ParticipantFormField) => {
    const fields = formData.formFields.includes(field)
      ? formData.formFields.filter((f) => f !== field)
      : [...formData.formFields, field];
    onFormChange({ formFields: fields });
  };

  return (
    <div className="space-y-4">
      {/* 수집 방식 선택 */}
      <div className="p-4 bg-bg-hover rounded-lg border border-border space-y-3">
        <span className="text-sm font-medium text-txt-main">참여자 수집 방식</span>
        <div className="flex gap-2">
          {ALL_COLLECTION_MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => onFormChange({ collectionMode: mode })}
              disabled={disabled}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border-2 transition-colors ${formData.collectionMode === mode
                ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                : 'border-border bg-bg-card text-txt-secondary hover:border-primary/50'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-center gap-1.5">
                {mode === 'auto' ? <TeamOutlined /> : <FormOutlined />}
                {COLLECTION_MODE_LABELS[mode]}
              </div>
              <p className="text-xs text-txt-muted mt-0.5">
                {mode === 'auto' ? '페이지 조회/주문/공유 시 자동 수집' : '참여자가 직접 정보 입력'}
              </p>
            </button>
          ))}
        </div>

        {/* 입력수집: 폼 필드 선택 */}
        {formData.collectionMode === 'form_input' && (
          <div className="mt-3">
            <Label required>수집 필드 선택</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {ALL_FORM_FIELDS.map((field) => (
                <button
                  key={field}
                  onClick={() => toggleFormField(field)}
                  disabled={disabled}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${formData.formFields.includes(field)
                    ? 'bg-blue-50 border-blue-300 text-blue-700 font-medium'
                    : 'bg-bg-card border-border text-txt-muted hover:border-primary/50'
                    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {PARTICIPANT_FORM_FIELD_LABELS[field]}
                </button>
              ))}
            </div>
            {formData.formFields.length === 0 && (
              <p className="text-xs text-red-500 mt-1">1개 이상의 필드를 선택해주세요.</p>
            )}
          </div>
        )}
      </div>

      {/* 동의 설정 */}
      <div className="p-4 bg-bg-hover rounded-lg border border-border space-y-3">
        <span className="text-sm font-medium text-txt-main">동의 설정</span>

        {/* 개인정보 동의 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>개인정보 수집 동의 필수</Label>
            <Switch
              checked={formData.consentRequired}
              onCheckedChange={(checked) => onFormChange({ consentRequired: checked })}
              disabled={disabled}
            />
          </div>
          {formData.consentRequired && (
            <Textarea
              value={formData.consentText}
              onChange={(e) => onFormChange({ consentText: e.target.value })}
              placeholder="개인정보 수집 동의 문구"
              disabled={disabled}
              rows={3}
            />
          )}
        </div>

        {/* 제3자 동의 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>제3자 제공 동의 필수</Label>
            <Switch
              checked={formData.thirdPartyConsentRequired}
              onCheckedChange={(checked) => onFormChange({ thirdPartyConsentRequired: checked })}
              disabled={disabled}
            />
          </div>
          {formData.thirdPartyConsentRequired && (
            <Textarea
              value={formData.thirdPartyConsentText}
              onChange={(e) => onFormChange({ thirdPartyConsentText: e.target.value })}
              placeholder="제3자 제공 동의 문구"
              disabled={disabled}
              rows={3}
            />
          )}
        </div>
      </div>

      {/* 통계 대시보드 */}
      {stats && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm font-medium text-txt-main">
            <BarChartOutlined />
            통계
          </div>
          <div className="grid grid-cols-3 gap-2">
            <StatCard icon={<EyeOutlined />} label="페이지 조회" value={formatNumber(stats.pageViews)} />
            <StatCard label="순 방문자" value={formatNumber(stats.uniqueVisitors)} />
            <StatCard label="주문 클릭" value={formatNumber(stats.orderButtonClicks)} />
            <StatCard label="공유 횟수" value={formatNumber(stats.shareCount)} />
            <StatCard label="참여자 수" value={formatNumber(stats.participantCount)} />
            <StatCard label="전환율" value={`${stats.conversionRate.toFixed(1)}%`} />
          </div>
        </div>
      )}

      {/* 참여자 목록 */}
      {eventId && (
        <EventParticipantList eventId={eventId} />
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-2.5 bg-bg-card border border-border rounded-lg text-center">
      <div className="text-xs text-txt-muted mb-0.5 flex items-center justify-center gap-1">
        {icon}
        {label}
      </div>
      <div className="text-base font-semibold text-txt-main">{value}</div>
    </div>
  );
}
