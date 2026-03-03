/**
 * 직원 연결 모달
 * 매장에 직원을 연결하는 모달
 */
import React, { useState } from 'react';

import { Modal, Button, Badge, Spinner, SearchInput } from '@/components/ui';
import { useUnlinkedStaff, useLinkStaffToStore, useToast } from '@/hooks';
import { STORE_STAFF_ROLE_LABELS, type StoreStaffRole } from '@/types/store';
import { STAFF_STATUS_LABELS, type StaffAccount, type StaffStatus } from '@/types/staff';

interface StaffLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  storeName: string;
}

export const StaffLinkModal: React.FC<StaffLinkModalProps> = ({
  isOpen,
  onClose,
  storeId,
  storeName,
}) => {
  const toast = useToast();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null);
  const [selectedRole, setSelectedRole] = useState<StoreStaffRole>('staff');
  const [isPrimary, setIsPrimary] = useState(false);

  const { data: unlinkedStaff, isLoading } = useUnlinkedStaff(storeId);
  const linkStaff = useLinkStaffToStore();

  // 검색 필터링
  const filteredStaff = (unlinkedStaff || []).filter((staff) => {
    if (!searchKeyword) return true;
    const keyword = searchKeyword.toLowerCase();
    return (
      staff.name.toLowerCase().includes(keyword) ||
      staff.loginId.toLowerCase().includes(keyword) ||
      staff.email.toLowerCase().includes(keyword)
    );
  });

  const getStatusBadgeVariant = (status: StaffStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const handleSelect = (staff: StaffAccount) => {
    setSelectedStaff(staff);
  };

  const handleLink = async () => {
    if (!selectedStaff) {
      toast.error('연결할 직원을 선택해주세요.');
      return;
    }

    try {
      await linkStaff.mutateAsync({
        storeId,
        staffId: selectedStaff.id,
        role: selectedRole,
        isPrimary,
      });
      toast.success(`'${selectedStaff.name}' 직원이 연결되었습니다.`);
      handleClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '연결에 실패했습니다.');
    }
  };

  const handleClose = () => {
    setSearchKeyword('');
    setSelectedStaff(null);
    setSelectedRole('staff');
    setIsPrimary(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="직원 연결" size="lg">
      <div className="space-y-4">
        <p className="text-sm text-txt-muted">
          <span className="font-medium text-txt-main">{storeName}</span> 매장에 연결할 직원을
          선택하세요.
        </p>

        {/* 검색 */}
        <div className="mb-4">
          <SearchInput
            placeholder="이름, 아이디, 이메일로 검색"
            value={searchKeyword}
            onChange={setSearchKeyword}
          />
        </div>

        {/* 직원 목록 */}
        <div className="border border-border rounded-lg max-h-64 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="sm" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-txt-muted text-sm">
                {searchKeyword
                  ? '검색 결과가 없습니다.'
                  : '연결 가능한 직원이 없습니다.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredStaff.map((staff) => (
                <div
                  key={staff.id}
                  onClick={() => handleSelect(staff)}
                  className={`p-3 cursor-pointer transition-colors ${selectedStaff?.id === staff.id
                      ? 'bg-primary/5 border-l-2 border-primary'
                      : 'hover:bg-bg-hover'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-txt-main">{staff.name}</p>
                      <p className="text-sm text-txt-muted">
                        {staff.loginId} · {staff.phone}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(staff.status)}>
                      {STAFF_STATUS_LABELS[staff.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 역할 선택 */}
        {selectedStaff && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="bg-bg-hover rounded-lg p-3">
              <p className="text-sm text-txt-muted">선택된 직원</p>
              <p className="font-medium">{selectedStaff.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-txt-main mb-2">
                역할
              </label>
              <div className="flex gap-3">
                {(Object.entries(STORE_STAFF_ROLE_LABELS) as [StoreStaffRole, string][]).map(
                  ([value, label]) => (
                    <label key={value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={selectedRole === value}
                        onChange={() => setSelectedRole(value)}
                        className="w-4 h-4 text-primary border-border focus:ring-primary"
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            {selectedRole === 'owner' && (
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrimary}
                    onChange={(e) => setIsPrimary(e.target.checked)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                  />
                  <span className="text-sm">주 매장으로 설정</span>
                </label>
                <p className="text-xs text-txt-muted mt-1 ml-6">
                  다점주의 경우 주 매장 설정이 가능합니다.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleLink} disabled={!selectedStaff || linkStaff.isPending}>
            {linkStaff.isPending ? <Spinner size="sm" /> : '연결'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
