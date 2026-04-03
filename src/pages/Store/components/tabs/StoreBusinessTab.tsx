import React from 'react';
import { Badge, MaskedData } from '@/components/ui';
import { CONTRACT_STATUS_LABELS, CONTRACT_TYPE_LABELS, type ContractStatus, type Store } from '@/types/store';

interface StoreBusinessTabProps {
  store: Store;
  getContractBadgeVariant: (status: ContractStatus) => "success" | "warning" | "critical" | "secondary";
  formatDate: (date: Date) => string;
}

export const StoreBusinessTab: React.FC<StoreBusinessTabProps> = ({
  store,
  getContractBadgeVariant,
  formatDate,
}) => {
  return (
    <div className="space-y-10">
      {/* 가맹점주 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">가맹점주 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-txt-muted">점주명</label>
            <p className="mt-1 font-medium">{store.owner.name}</p>
          </div>
          <div>
            <label className="text-sm text-txt-muted">연락처</label>
            <div className="mt-1">
              <MaskedData value={store.owner.phone} />
            </div>
          </div>
          <div>
            <label className="text-sm text-txt-muted">이메일</label>
            <p className="mt-1">{store.owner.email || '-'}</p>
          </div>
        </div>
      </div>

      {/* 사업자 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">사업자 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-txt-muted">사업자등록번호</label>
            <p className="mt-1 font-mono">{store.business.businessNumber}</p>
          </div>
          <div>
            <label className="text-sm text-txt-muted">상호명</label>
            <p className="mt-1 font-medium">{store.business.businessName}</p>
          </div>
          <div>
            <label className="text-sm text-txt-muted">대표자명</label>
            <p className="mt-1">{store.business.representativeName}</p>
          </div>
          <div>
            <label className="text-sm text-txt-muted">업종</label>
            <p className="mt-1">{store.business.businessType || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-txt-muted">업태</label>
            <p className="mt-1">{store.business.businessCategory || '-'}</p>
          </div>
        </div>
      </div>

      {/* 계약 정보 — 본사↔매장 가맹 계약 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">계약 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {store.contract.contractType && (
            <div>
              <label className="text-sm text-txt-muted">계약 유형</label>
              <p className="mt-1">{CONTRACT_TYPE_LABELS[store.contract.contractType]}</p>
            </div>
          )}
          <div>
            <label className="text-sm text-txt-muted">계약 상태</label>
            <div className="mt-1">
              <Badge variant={getContractBadgeVariant(store.contract.contractStatus)}>
                {CONTRACT_STATUS_LABELS[store.contract.contractStatus]}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm text-txt-muted">계약일</label>
            <p className="mt-1">{formatDate(store.contract.contractDate)}</p>
          </div>
          <div>
            <label className="text-sm text-txt-muted">만료일</label>
            <p className="mt-1">{formatDate(store.contract.expirationDate)}</p>
          </div>
          {store.contract.notes && (
            <div className="md:col-span-2">
              <label className="text-sm text-txt-muted">비고</label>
              <p className="mt-1">{store.contract.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* 계좌 정보 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold border-b border-border pb-2">계좌 정보</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-txt-muted">은행</label>
            <p className="mt-1">{store.bankAccount.bankName}</p>
          </div>
          <div>
            <label className="text-sm text-txt-muted">계좌번호</label>
            <div className="mt-1">
              <MaskedData value={store.bankAccount.accountNumber} />
            </div>
          </div>
          <div>
            <label className="text-sm text-txt-muted">예금주</label>
            <p className="mt-1">{store.bankAccount.accountHolder}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
