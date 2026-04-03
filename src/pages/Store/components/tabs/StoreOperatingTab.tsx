import React from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { EditOutlined } from '@ant-design/icons';
import {
  REGULAR_CLOSED_TYPE_LABELS,
  WEEK_DAY_LABELS,
  WEEK_DAY_SHORT_LABELS,
  WEEK_DAYS,
  type Store,
} from '@/types/store';

interface StoreOperatingTabProps {
  store: Store;
  navigate: (path: string) => void;
  id: string;
}

export const StoreOperatingTab: React.FC<StoreOperatingTabProps> = ({ store, navigate, id }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">영업 정보</h2>
        <Button size="sm" variant="outline" onClick={() => navigate(`/staff/stores/${id}/edit/operating`)}>
          <EditOutlined className="mr-1" />
          수정
        </Button>
      </div>

      {store.operatingInfo ? (
        <div className="space-y-4">
          {/* 운영 상태 카드 */}
          <Card className="p-5">
            <h3 className="text-base font-semibold mb-4">운영 상태</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm text-txt-muted w-24">매장 노출</label>
                <Badge variant={store.operatingInfo.isVisible !== false ? 'success' : 'critical'}>
                  {store.operatingInfo.isVisible !== false ? '노출' : '비노출'}
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <label className="text-sm text-txt-muted w-24">임시 휴업</label>
                <Badge variant={store.operatingInfo.isTemporarilyClosed ? 'critical' : 'success'}>
                  {store.operatingInfo.isTemporarilyClosed ? '휴업중' : '정상영업'}
                </Badge>
              </div>
              {store.operatingInfo.isTemporarilyClosed && store.operatingInfo.temporaryCloseReason && (
                <div className="p-3 bg-critical/10 rounded-lg ml-28">
                  <p className="text-sm">{store.operatingInfo.temporaryCloseReason}</p>
                </div>
              )}
            </div>
          </Card>

          {/* 영업시간 카드 */}
          <Card className="p-5">
            <h3 className="text-base font-semibold mb-4">영업시간</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 bg-bg-hover rounded-lg">
                <label className="text-sm text-txt-muted">평일</label>
                {store.operatingInfo.weekdayHours.isOpen ? (
                  <p className="mt-1 font-medium">
                    {store.operatingInfo.weekdayHours.openTime} ~ {store.operatingInfo.weekdayHours.closeTime}
                    <span className="block text-xs text-txt-muted mt-1">라스트오더 마감 {store.operatingInfo.weekdayHours.lastOrderMinutes ?? 30}분 전</span>
                  </p>
                ) : (
                  <p className="mt-1 text-txt-muted">휴무</p>
                )}
              </div>
              <div className="p-4 bg-bg-hover rounded-lg">
                <label className="text-sm text-txt-muted">주말</label>
                {store.operatingInfo.weekendHours.isOpen ? (
                  <p className="mt-1 font-medium">
                    {store.operatingInfo.weekendHours.openTime} ~ {store.operatingInfo.weekendHours.closeTime}
                    <span className="block text-xs text-txt-muted mt-1">라스트오더 마감 {store.operatingInfo.weekendHours.lastOrderMinutes ?? 30}분 전</span>
                  </p>
                ) : (
                  <p className="mt-1 text-txt-muted">휴무</p>
                )}
              </div>
              {store.operatingInfo.holidayHours && (
                <div className="p-4 bg-bg-hover rounded-lg">
                  <label className="text-sm text-txt-muted">공휴일</label>
                  <p className="mt-1 font-medium">
                    {store.operatingInfo.holidayHours.isOpen ? '정상영업' : '휴무'}
                  </p>
                </div>
              )}
            </div>

            {/* 요일별 영업시간 */}
            {store.operatingInfo.dailyHours && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-txt-secondary mb-3">요일별 영업시간</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {WEEK_DAYS.map((day) => {
                  const hours = store.operatingInfo!.dailyHours![day];
                  return (
                    <div key={day} className="p-3 bg-bg-hover rounded-lg">
                      <label className="text-sm text-txt-muted">{WEEK_DAY_SHORT_LABELS[day]}</label>
                      {hours.isOpen ? (
                        <p className="mt-1 font-medium text-sm">
                          {hours.openTime} ~ {hours.closeTime}
                          <span className="block text-xs text-txt-muted mt-1">
                            라스트오더 마감 {hours.lastOrderMinutes ?? 30}분 전
                          </span>
                          {hours.breakStart && hours.breakEnd && (
                            <span className="block text-xs text-txt-muted mt-0.5">휴게 {hours.breakStart}~{hours.breakEnd}</span>
                          )}
                        </p>
                      ) : (
                        <p className="mt-1 text-txt-muted text-sm">휴무</p>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            )}
          </Card>

          {/* 배달 설정 카드 */}
          <Card className="p-5">
            <h3 className="text-base font-semibold mb-4">배달 설정</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm text-txt-muted w-28">배달 가능</label>
                <Badge variant={store.operatingInfo.deliverySettings?.isAvailable ? 'success' : 'secondary'}>
                  {store.operatingInfo.deliverySettings?.isAvailable ? '가능' : '불가'}
                </Badge>
              </div>
              {store.operatingInfo.deliverySettings?.isAvailable && (
                <>
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-txt-muted w-28">최소 주문금액</label>
                    <span className="font-medium">{(store.operatingInfo.deliverySettings.minOrderAmount ?? 0).toLocaleString()}원</span>
                  </div>
                  {store.operatingInfo.deliverySettings.estimatedMinutes && (
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-txt-muted w-28">예상 배달시간</label>
                      <span className="font-medium">약 {store.operatingInfo.deliverySettings.estimatedMinutes}분</span>
                    </div>
                  )}
                </>
              )}
              <div className="p-3 bg-bg-hover rounded-lg flex items-center justify-between">
                <span className="text-sm text-txt-secondary">배달비는 상권관리에서 설정합니다.</span>
                <button onClick={() => navigate('/delivery-zones')} className="text-sm text-blue-600 hover:text-blue-800 underline font-medium">
                  상권관리로 이동 →
                </button>
              </div>
            </div>
          </Card>

          {/* 포장 설정 카드 */}
          <Card className="p-5">
            <h3 className="text-base font-semibold mb-4">포장 설정</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="text-sm text-txt-muted w-28">포장 가능</label>
                <Badge variant={store.operatingInfo.pickupSettings?.isAvailable ? 'success' : 'secondary'}>
                  {store.operatingInfo.pickupSettings?.isAvailable ? '가능' : '불가'}
                </Badge>
              </div>
              {store.operatingInfo.pickupSettings?.isAvailable && (
                <>
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-txt-muted w-28">최소 주문금액</label>
                    <span className="font-medium">{(store.operatingInfo.pickupSettings.minOrderAmount ?? 0).toLocaleString()}원</span>
                  </div>
                  {store.operatingInfo.pickupSettings.estimatedMinutes && (
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-txt-muted w-28">예상 준비시간</label>
                      <span className="font-medium">약 {store.operatingInfo.pickupSettings.estimatedMinutes}분</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* 예약 설정 카드 */}
          <Card className="p-5">
            <h3 className="text-base font-semibold mb-4">예약 설정</h3>
            <div className="flex items-center gap-4">
              <label className="text-sm text-txt-muted w-24">예약 주문</label>
              <Badge variant={store.operatingInfo.isReservationAvailable ? 'success' : 'secondary'}>
                {store.operatingInfo.isReservationAvailable ? '가능' : '불가'}
              </Badge>
              {store.operatingInfo.isReservationAvailable && store.operatingInfo.reservationLeadTimeMinutes && (
                <span className="text-sm text-txt-secondary">
                  현재 시간 + {store.operatingInfo.reservationLeadTimeMinutes}분 후부터 예약 가능
                </span>
              )}
            </div>
          </Card>

          {/* 휴무 설정 카드 */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">휴무 설정</h3>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/staff/stores/${id}/edit/closed-day`)}>
                <EditOutlined className="mr-1" />
                수정
              </Button>
            </div>
            {store.operatingInfo.regularClosedDays && store.operatingInfo.regularClosedDays.length > 0 ? (
              <div className="space-y-2">
                {store.operatingInfo.regularClosedDays.map((closedDay, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                    <Badge variant="secondary">
                      {REGULAR_CLOSED_TYPE_LABELS[closedDay.type]}
                    </Badge>
                    {closedDay.dayOfWeek && (
                      <span className="font-medium">
                        {closedDay.nthWeek && `${closedDay.nthWeek}째주 `}
                        {WEEK_DAY_LABELS[closedDay.dayOfWeek]}
                      </span>
                    )}
                    {closedDay.dates && (
                      <span className="font-medium">
                        {closedDay.dates.join(', ')}일
                      </span>
                    )}
                    {closedDay.description && (
                      <span className="text-sm text-txt-muted">
                        ({closedDay.description})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-txt-muted">연중무휴</p>
            )}
            {/* 비정기 휴무 */}
            {store.operatingInfo.irregularClosedDays && store.operatingInfo.irregularClosedDays.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-txt-secondary mb-3">비정기 휴무</h4>
              <div className="space-y-2">
                {store.operatingInfo.irregularClosedDays.map((day: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                    <span className="font-mono font-medium">{day.date}</span>
                    {day.reason && (
                      <span className="text-sm text-txt-muted">- {day.reason}</span>
                    )}
                  </div>
                ))}
              </div>
              </div>
            )}
          </Card>

          {/* 편의시설 카드 */}
          {store.amenities && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold">편의시설</h3>
                <Button size="sm" variant="ghost" onClick={() => navigate(`/staff/stores/${id}/edit/amenities`)}>
                  <EditOutlined className="mr-1" />
                  수정
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 주차 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-txt-muted">주차</label>
                    <Badge variant={store.amenities.hasParking ? 'success' : 'secondary'}>
                      {store.amenities.hasParking ? '가능' : '불가'}
                    </Badge>
                  </div>
                  {store.amenities.hasParking && (
                    <div className="space-y-1">
                      {store.amenities.parkingNote && (
                        <p className="text-sm text-txt-muted">{store.amenities.parkingNote}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* 좌석 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-txt-muted">매장 내 식사</label>
                    <Badge variant={store.amenities.hasDineIn ? 'success' : 'secondary'}>
                      {store.amenities.hasDineIn ? '가능' : '불가'}
                    </Badge>
                  </div>
                  {store.amenities.hasDineIn && store.amenities.seatCapacity && (
                    <p className="text-sm">좌석 수: <span className="font-medium">{store.amenities.seatCapacity}석</span></p>
                  )}
                </div>

                {/* 와이파이 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-txt-muted">와이파이</label>
                    <Badge variant={store.amenities.hasWifi ? 'success' : 'secondary'}>
                      {store.amenities.hasWifi ? '제공' : '미제공'}
                    </Badge>
                  </div>
                </div>

                {/* 드라이브스루 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-txt-muted">드라이브스루</label>
                    <Badge variant={store.amenities.hasDriveThru ? 'success' : 'secondary'}>
                      {store.amenities.hasDriveThru ? '지원' : '미지원'}
                    </Badge>
                  </div>
                </div>

                {/* 화장실 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm text-txt-muted">화장실</label>
                    <Badge variant={store.amenities.hasRestroom ? 'success' : 'secondary'}>
                      {store.amenities.hasRestroom ? '있음' : '없음'}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-txt-muted">영업 정보가 등록되지 않았습니다.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate(`/staff/stores/${id}/edit/operating`)}
          >
            <EditOutlined className="mr-1" />
            영업 정보 등록
          </Button>
        </div>
      )}
    </div>
  );
};
