import React from 'react';
import { Badge, MaskedData } from '@/components/ui';
import { DeleteOutlined } from '@ant-design/icons';
import { STORE_STAFF_ROLE_LABELS, type StoreStaffRole, type StoreWithStaff } from '@/types/store';
import { STAFF_STATUS_LABELS, type StaffStatus } from '@/types/staff';

interface StoreStaffTabProps {
  store: StoreWithStaff;
  getRoleBadgeVariant: (role: StoreStaffRole) => "info" | "secondary";
  getStaffStatusBadgeVariant: (status: StaffStatus) => "success" | "warning" | "secondary";
  setUnlinkTarget: (target: { linkId: string; staffName: string }) => void;
}

export const StoreStaffTab: React.FC<StoreStaffTabProps> = ({
  store,
  getRoleBadgeVariant,
  getStaffStatusBadgeVariant,
  setUnlinkTarget,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">가맹점주</h2>
      <p className="text-sm text-txt-muted">가맹점주는 초대 승인 완료 시 자동으로 연결됩니다. (점주는 1명만 연결 가능합니다.)</p>

      {store.staffLinks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-txt-muted">등록된 가맹점주가 없습니다.</p>
          <p className="text-sm text-txt-muted mt-1">가맹점 직원 관리에서 점주를 초대해주세요.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>이름</th>
                <th>역할</th>
                <th>연락처</th>
                <th>이메일</th>
                <th>상태</th>
                <th className="w-20"></th>
              </tr>
            </thead>
            <tbody>
              {store.staffLinks.slice(0, 1).map((link) => (
                <tr key={link.id}>
                  <td className="font-medium">{link.staffName}</td>
                  <td>
                    <Badge variant={getRoleBadgeVariant(link.role)}>
                      {STORE_STAFF_ROLE_LABELS[link.role]}
                    </Badge>
                  </td>
                  <td>
                    <MaskedData value={link.staffPhone} />
                  </td>
                  <td className="text-sm text-txt-secondary">{link.staffEmail}</td>
                  <td>
                    <Badge
                      variant={getStaffStatusBadgeVariant(link.staffStatus as StaffStatus)}
                    >
                      {STAFF_STATUS_LABELS[link.staffStatus as StaffStatus] || link.staffStatus}
                    </Badge>
                  </td>
                  <td>
                    <button
                      onClick={() => setUnlinkTarget({ linkId: link.id, staffName: link.staffName })}
                      className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors"
                      title="연결 해제"
                    >
                      <DeleteOutlined />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
