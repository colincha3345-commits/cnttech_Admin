import React, { useState } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons';

import { Card, Button, Badge, Spinner, ConfirmDialog } from '@/components/ui';
import { useTeams, useDeleteTeam, useToast } from '@/hooks';
import { TeamFormModal } from './components/TeamFormModal';
import type { Team } from '@/types/staff';

export const Teams: React.FC = () => {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const { data: teams, isLoading } = useTeams();
  const deleteTeam = useDeleteTeam();

  const handleEdit = (team: Team) => {
    setSelectedTeam(team);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      await deleteTeam.mutateAsync(deleteTarget.id);
      toast.success('팀이 삭제되었습니다.');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '팀 삭제에 실패했습니다.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeam(null);
  };

  if (isLoading) {
    return <Spinner layout="center" />;
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">팀 관리</h1>
          <p className="text-sm text-txt-muted mt-1">본사 직원 소속 팀을 관리합니다.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <PlusOutlined className="mr-1" />
          팀 추가
        </Button>
      </div>

      {/* 팀 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams && teams.length > 0 ? (
          teams.map((team) => (
            <Card key={team.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TeamOutlined className="text-primary text-lg" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-txt-main">{team.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {team.memberCount}명
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(team)}
                    className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-primary transition-colors"
                    title="수정"
                  >
                    <EditOutlined />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(team)}
                    className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors"
                    title="삭제"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
              {team.description && (
                <p className="text-sm text-txt-muted mt-3 line-clamp-2">{team.description}</p>
              )}
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-xs text-txt-muted">
                  생성일: {new Date(team.createdAt).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </Card>
          ))
        ) : (
          <Card className="col-span-full p-8 text-center">
            <TeamOutlined className="text-4xl text-txt-muted mb-3" />
            <p className="text-txt-muted">등록된 팀이 없습니다.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsModalOpen(true)}
            >
              첫 번째 팀 추가하기
            </Button>
          </Card>
        )}
      </div>

      {/* 팀 생성/수정 모달 */}
      <TeamFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        team={selectedTeam}
      />

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="팀 삭제"
        message={`'${deleteTarget?.name}' 팀을 삭제하시겠습니까? 소속 직원이 있는 팀은 삭제할 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
};
