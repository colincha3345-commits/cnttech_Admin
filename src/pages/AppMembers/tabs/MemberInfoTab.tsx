import React from 'react';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ShopOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';

import { Card, Badge, MaskedData } from '@/components/ui';
import type { Member } from '@/types/member';
import {
  MEMBER_STATUS_LABELS,
  GENDER_LABELS,
  SNS_TYPE_LABELS,
  TERMS_TYPE_LABELS,
} from '@/types';
import { getMemberGradeLabel, getGradeBadgeVariant } from '@/utils/memberGrade';

interface MemberInfoTabProps {
  member: Member;
}

export const MemberInfoTab: React.FC<MemberInfoTabProps> = ({ member }) => {
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (date: Date | null | undefined) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  // 상태별 Badge 색상
  const getStatusBadgeVariant = (status: Member['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'dormant':
        return 'default';
      case 'withdrawn':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  // SNS 아이콘 색상
  const getSnsColor = (sns: string) => {
    switch (sns) {
      case 'kakao':
        return 'bg-yellow-400 text-yellow-900';
      case 'naver':
        return 'bg-green-500 text-white';
      case 'google':
        return 'bg-red-500 text-white';
      case 'apple':
        return 'bg-gray-900 text-white';
      case 'facebook':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      {/* 기본 정보 카드 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4 flex items-center gap-2">
          <UserOutlined />
          기본 정보
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 이름 */}
          <div>
            <p className="text-sm text-txt-muted mb-1">이름</p>
            <p className="text-txt-main font-medium">{member.name}</p>
          </div>

          {/* 회원 ID */}
          <div>
            <p className="text-sm text-txt-muted mb-1">회원 ID</p>
            <p className="text-txt-main font-mono">{member.memberId}</p>
          </div>

          {/* 등급 */}
          <div>
            <p className="text-sm text-txt-muted mb-1">회원 등급</p>
            <Badge variant={getGradeBadgeVariant(member.grade)}>
              {getMemberGradeLabel(member.grade)}
            </Badge>
          </div>

          {/* 상태 */}
          <div>
            <p className="text-sm text-txt-muted mb-1">상태</p>
            <Badge variant={getStatusBadgeVariant(member.status)}>
              {MEMBER_STATUS_LABELS[member.status]}
            </Badge>
          </div>

          {/* 연락처 */}
          <div>
            <p className="text-sm text-txt-muted mb-1 flex items-center gap-1">
              <PhoneOutlined />
              연락처
            </p>
            <MaskedData value={member.phone} />
          </div>

          {/* 이메일 */}
          <div>
            <p className="text-sm text-txt-muted mb-1 flex items-center gap-1">
              <MailOutlined />
              이메일
            </p>
            <MaskedData value={member.email} />
          </div>

          {/* 생년월일 */}
          <div>
            <p className="text-sm text-txt-muted mb-1 flex items-center gap-1">
              <CalendarOutlined />
              생년월일
            </p>
            <p className="text-txt-main">{member.birthDate || '-'}</p>
          </div>

          {/* 성별 */}
          <div>
            <p className="text-sm text-txt-muted mb-1">성별</p>
            <p className="text-txt-main">
              {member.gender ? GENDER_LABELS[member.gender] : '-'}
            </p>
          </div>

          {/* 가입일 */}
          <div>
            <p className="text-sm text-txt-muted mb-1">가입일</p>
            <p className="text-txt-main">{formatDate(member.registeredAt)}</p>
          </div>
        </div>
      </Card>

      {/* 주문 및 포인트 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-txt-muted mb-1">총 주문 횟수</p>
          <p className="text-2xl font-bold text-primary">{member.orderCount}건</p>
          <p className="text-xs text-txt-muted mt-1">
            마지막 주문: {formatDate(member.lastOrderDate)}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-txt-muted mb-1">총 주문 금액</p>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(member.totalOrderAmount)}원
          </p>
          <p className="text-xs text-txt-muted mt-1">누적 주문 금액</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-txt-muted mb-1 flex items-center gap-1">
            <GiftOutlined />
            보유 포인트
          </p>
          <p className="text-2xl font-bold text-warning">
            {formatCurrency(member.pointBalance)}P
          </p>
          <p className="text-xs text-txt-muted mt-1">현재 잔액</p>
        </Card>
      </div>

      {/* SNS 연동 정보 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4">연동 SNS</h3>
        {member.linkedSns.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SNS</th>
                  <th>연동 키</th>
                  <th>연동일</th>
                </tr>
              </thead>
              <tbody>
                {member.linkedSns.map((sns) => (
                  <tr key={sns.snsType}>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getSnsColor(sns.snsType)}`}
                      >
                        {SNS_TYPE_LABELS[sns.snsType]}
                      </span>
                    </td>
                    <td>
                      <code className="px-2 py-1 bg-bg-hover rounded text-xs font-mono">
                        {sns.snsKey}
                      </code>
                    </td>
                    <td className="text-sm text-txt-secondary">
                      {formatDate(sns.connectedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-txt-muted">연동된 SNS가 없습니다.</p>
        )}
      </Card>

      {/* 단골매장 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4 flex items-center gap-2">
          <ShopOutlined />
          단골매장
          <span className="text-sm font-normal text-txt-muted">
            ({member.favoriteStores?.length || 0}/3)
          </span>
        </h3>
        {member.favoriteStores && member.favoriteStores.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {member.favoriteStores.map((store) => (
              <div
                key={store.storeId}
                className="p-4 rounded-lg border border-border-main bg-bg-hover"
              >
                <p className="text-sm font-semibold text-txt-main mb-2">
                  {store.storeName}
                </p>
                <p className="text-xs text-txt-secondary flex items-center gap-1 mb-1">
                  <EnvironmentOutlined />
                  {store.address}
                </p>
                <p className="text-xs text-txt-secondary flex items-center gap-1 mb-1">
                  <PhoneOutlined />
                  {store.phone}
                </p>
                <p className="text-xs text-txt-muted mt-2">
                  등록일: {formatDate(store.registeredAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-txt-muted">등록된 단골매장이 없습니다.</p>
        )}
      </Card>

      {/* 배달지 주소 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4 flex items-center gap-2">
          <EnvironmentOutlined />
          배달지 주소
          <span className="text-sm font-normal text-txt-muted">
            ({member.deliveryAddresses?.length || 0}/10)
          </span>
        </h3>
        {member.deliveryAddresses && member.deliveryAddresses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-[60px]">우선</th>
                  <th className="w-[80px]">별칭</th>
                  <th>주소</th>
                  <th className="w-[80px]">우편번호</th>
                  <th className="w-[120px]">마지막 사용</th>
                </tr>
              </thead>
              <tbody>
                {[...member.deliveryAddresses]
                  .sort((a, b) => {
                    const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
                    const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
                    return bTime - aTime;
                  })
                  .map((addr, idx) => (
                    <tr key={addr.id}>
                      <td className="text-center">
                        {idx === 0 ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold bg-green-50 text-green-600 border border-green-200">최근</span>
                        ) : addr.isDefault ? (
                          <Badge variant="info">기본</Badge>
                        ) : (
                          <span className="text-xs text-txt-muted">{idx + 1}</span>
                        )}
                      </td>
                      <td>
                        <span className="text-sm font-medium text-txt-main">{addr.alias}</span>
                      </td>
                      <td>
                        <p className="text-sm text-txt-main">{addr.address}</p>
                        {addr.jibunAddress && (
                          <p className="text-xs text-txt-muted">(지번) {addr.jibunAddress}</p>
                        )}
                        {addr.addressDetail && (
                          <p className="text-xs text-txt-secondary">{addr.addressDetail}</p>
                        )}
                      </td>
                      <td>
                        <span className="text-xs text-txt-secondary font-mono">{addr.zipCode}</span>
                      </td>
                      <td className="text-xs text-txt-secondary">
                        {formatDate(addr.lastUsedAt)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-txt-muted">등록된 배달지가 없습니다.</p>
        )}
      </Card>

      {/* 마케팅 수신 동의 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4">마케팅 수신 동의</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-hover">
            {member.marketingAgreed ? (
              <CheckCircleOutlined className="text-success text-lg" />
            ) : (
              <CloseCircleOutlined className="text-critical text-lg" />
            )}
            <div>
              <p className="text-sm font-medium text-txt-main">마케팅 수신</p>
              <p className="text-xs text-txt-muted">
                {member.marketingAgreed ? '동의' : '미동의'}
                {member.marketingAgreedAt && (
                  <span className="ml-1">({formatDateTime(member.marketingAgreedAt)})</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-hover">
            {member.pushEnabled ? (
              <CheckCircleOutlined className="text-success text-lg" />
            ) : (
              <CloseCircleOutlined className="text-critical text-lg" />
            )}
            <div>
              <p className="text-sm font-medium text-txt-main">푸시 알림</p>
              <p className="text-xs text-txt-muted">
                {member.pushEnabled ? '동의' : '미동의'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-hover">
            {member.smsEnabled ? (
              <CheckCircleOutlined className="text-success text-lg" />
            ) : (
              <CloseCircleOutlined className="text-critical text-lg" />
            )}
            <div>
              <p className="text-sm font-medium text-txt-main">SMS 수신</p>
              <p className="text-xs text-txt-muted">
                {member.smsEnabled ? '동의' : '미동의'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-hover">
            {member.emailEnabled ? (
              <CheckCircleOutlined className="text-success text-lg" />
            ) : (
              <CloseCircleOutlined className="text-critical text-lg" />
            )}
            <div>
              <p className="text-sm font-medium text-txt-main">이메일 수신</p>
              <p className="text-xs text-txt-muted">
                {member.emailEnabled ? '동의' : '미동의'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 약관 동의 이력 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4">약관 동의 이력</h3>
        {member.termsAgreements.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>약관 유형</th>
                  <th>동의일시</th>
                  <th>버전</th>
                </tr>
              </thead>
              <tbody>
                {member.termsAgreements.map((agreement, index) => (
                  <tr key={index}>
                    <td>{TERMS_TYPE_LABELS[agreement.termsType]}</td>
                    <td>{formatDateTime(agreement.agreedAt)}</td>
                    <td>
                      <Badge variant="secondary">{agreement.version}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-txt-muted">약관 동의 이력이 없습니다.</p>
        )}
      </Card>

      {/* 최근 접속 정보 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-txt-main mb-4">접속 정보</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-txt-muted mb-1">최근 접속일</p>
            <p className="text-txt-main font-medium">
              {formatDateTime(member.lastLoginAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-txt-muted mb-1">가입일</p>
            <p className="text-txt-main font-medium">
              {formatDateTime(member.registeredAt)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
