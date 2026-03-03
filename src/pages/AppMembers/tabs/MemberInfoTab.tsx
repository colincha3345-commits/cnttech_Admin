import React from 'react';
import {
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  CalendarOutlined,
  GiftOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
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
