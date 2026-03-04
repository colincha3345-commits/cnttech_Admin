/**
 * 본사 및 가맹점 직원 서비스
 * 초대 기반 계정 생성 및 승인 워크플로우 지원
 */
import {
  mockTeams,
  mockHeadquartersStaff,
  mockFranchiseStaff,
} from '@/lib/api/mockStaffData';
import { emailService } from './emailService';
import { auditService } from './auditService';
import { useAuthStore } from '@/stores/authStore';
import type {
  Team,
  TeamFormData,
  StaffAccount,
  StaffAccountUpdateData,
  StaffStatus,
  StaffType,
  StaffInviteFormData,
  PasswordSetupData,
  InvitationValidation,
  PendingApprovalCount,
} from '@/types/staff';

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Staff 비밀번호 저장소 (실제로는 DB에 저장)
interface StaffAuthRecord {
  staffId: string;
  passwordHash: string;  // 실제로는 해시된 비밀번호
}

// UUID 생성 유틸리티
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// 초대 링크 만료 시간 (48시간)
const INVITATION_EXPIRY_HOURS = 48;

class StaffService {
  private teams: Team[] = [...mockTeams];
  private headquarters: StaffAccount[] = [...mockHeadquartersStaff];
  private franchise: StaffAccount[] = [...mockFranchiseStaff];
  private staffPasswords: Map<string, StaffAuthRecord> = new Map();

  private delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 초대 링크 생성
   */
  private generateInvitationLink(token: string): string {
    // 실제로는 환경변수에서 도메인 가져옴
    return `${window.location.origin}/invitation/accept?token=${token}`;
  }

  // ============================================
  // 팀 관리
  // ============================================

  /**
   * 팀 목록 조회
   */
  async getTeams(): Promise<Team[]> {
    await this.delay();

    // 회원 수 업데이트
    const teamsWithCount = this.teams.map((team) => ({
      ...team,
      memberCount: this.headquarters.filter((s) => s.teamId === team.id).length,
    }));

    return teamsWithCount.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  }

  /**
   * 팀 상세 조회
   */
  async getTeam(id: string): Promise<Team | null> {
    await this.delay();
    const team = this.teams.find((t) => t.id === id);
    if (team) {
      team.memberCount = this.headquarters.filter((s) => s.teamId === id).length;
    }
    return team || null;
  }

  /**
   * 팀 생성
   */
  async createTeam(data: TeamFormData): Promise<Team> {
    await this.delay();

    // 이름 중복 검사
    const exists = this.teams.some(
      (t) => t.name.toLowerCase() === data.name.toLowerCase()
    );
    if (exists) {
      throw new Error('이미 존재하는 팀 이름입니다.');
    }

    const newTeam: Team = {
      id: `team-${Date.now()}`,
      name: data.name,
      description: data.description,
      memberCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.teams.push(newTeam);
    return newTeam;
  }

  /**
   * 팀 수정
   */
  async updateTeam(id: string, data: Partial<TeamFormData>): Promise<Team> {
    await this.delay();

    const team = this.teams.find((t) => t.id === id);
    if (!team) {
      throw new Error('팀을 찾을 수 없습니다.');
    }

    // 이름 중복 검사 (자기 자신 제외)
    if (data.name) {
      const exists = this.teams.some(
        (t) => t.id !== id && t.name.toLowerCase() === data.name!.toLowerCase()
      );
      if (exists) {
        throw new Error('이미 존재하는 팀 이름입니다.');
      }
      team.name = data.name;
    }

    if (data.description !== undefined) {
      team.description = data.description;
    }

    team.updatedAt = new Date();
    return team;
  }

  /**
   * 팀 삭제
   */
  async deleteTeam(id: string): Promise<void> {
    await this.delay();

    const index = this.teams.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new Error('팀을 찾을 수 없습니다.');
    }

    // 소속 직원이 있는지 확인
    const hasMembers = this.headquarters.some((s) => s.teamId === id);
    if (hasMembers) {
      throw new Error('소속 직원이 있는 팀은 삭제할 수 없습니다.');
    }

    this.teams.splice(index, 1);
  }

  // ============================================
  // 본사 직원 관리
  // ============================================

  /**
   * 본사 직원 목록 조회
   */
  async getHeadquartersStaff(params?: {
    teamId?: string;
    status?: StaffStatus;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: StaffAccount[]; pagination: Pagination }> {
    await this.delay();

    const { teamId, status, keyword = '', page = 1, limit = 10 } = params || {};

    let result = [...this.headquarters];

    // 팀 필터
    if (teamId) {
      result = result.filter((s) => s.teamId === teamId);
    }

    // 상태 필터
    if (status) {
      result = result.filter((s) => s.status === status);
    }

    // 키워드 검색 (이름, 아이디)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerKeyword) ||
          s.loginId.toLowerCase().includes(lowerKeyword)
      );
    }

    // 정렬: 최신 등록순
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 직원 상세 조회
   */
  async getStaffById(id: string): Promise<StaffAccount | null> {
    await this.delay();
    return (
      this.headquarters.find((s) => s.id === id) ||
      this.franchise.find((s) => s.id === id) ||
      null
    );
  }

  /**
   * 본사 직원 초대 (비밀번호 없이 기본정보만)
   * - 초대 토큰 생성 (UUID, 48시간 유효)
   * - status: 'invited'로 생성
   * - 초대 메일 발송
   */
  async inviteHeadquartersStaff(data: StaffInviteFormData): Promise<StaffAccount> {
    await this.delay();

    // 아이디 중복 검사
    const isDuplicate = await this.checkLoginIdDuplicate(data.loginId);
    if (isDuplicate) {
      throw new Error('이미 사용 중인 아이디입니다.');
    }

    // 이메일 중복 검사
    const emailExists = this.headquarters.some(
      (s) => s.email.toLowerCase() === data.email.toLowerCase()
    ) || this.franchise.some(
      (s) => s.email.toLowerCase() === data.email.toLowerCase()
    );
    if (emailExists) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    // 팀 존재 확인
    if (data.teamId) {
      const team = this.teams.find((t) => t.id === data.teamId);
      if (!team) {
        throw new Error('존재하지 않는 팀입니다.');
      }
    }

    const invitationToken = generateUUID();
    const invitationExpiresAt = new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);

    const newStaff: StaffAccount = {
      id: `hq-staff-${Date.now()}`,
      staffType: 'headquarters',
      name: data.name,
      phone: data.phone,
      email: data.email,
      loginId: data.loginId,
      teamId: data.teamId,
      status: 'invited',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      invitationToken,
      invitationExpiresAt,
      invitedAt: new Date(),
      mfaEnabled: true,
    };

    this.headquarters.unshift(newStaff);

    auditService.log({
      action: 'USER_CREATED',
      resource: 'staff:hq',
      userId: useAuthStore.getState().user?.id || 'system',
      details: { targetLoginId: data.loginId, email: data.email },
    });

    // 초대 메일 발송
    emailService.sendInvitationEmail({
      to: data.email,
      name: data.name,
      invitationLink: this.generateInvitationLink(invitationToken),
      expiresAt: invitationExpiresAt,
    });

    return newStaff;
  }

  /**
   * 본사 직원 수정
   */
  async updateHeadquartersStaff(
    id: string,
    data: StaffAccountUpdateData
  ): Promise<StaffAccount> {
    await this.delay();

    const staff = this.headquarters.find((s) => s.id === id);
    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    // 팀 존재 확인
    if (data.teamId) {
      const team = this.teams.find((t) => t.id === data.teamId);
      if (!team) {
        throw new Error('존재하지 않는 팀입니다.');
      }
    }

    if (data.name) staff.name = data.name;
    if (data.phone) staff.phone = data.phone;
    if (data.email) staff.email = data.email;
    if (data.teamId !== undefined) staff.teamId = data.teamId;

    if (data.status) {
      if (staff.status !== data.status) {
        auditService.log({
          action: 'USER_STATUS_CHANGE',
          resource: 'staff:hq',
          userId: useAuthStore.getState().user?.id || 'system',
          details: { targetStaffId: id, oldStatus: staff.status, newStatus: data.status },
        });
      }
      staff.status = data.status;
    }

    auditService.log({
      action: 'USER_UPDATED',
      resource: 'staff:hq',
      userId: useAuthStore.getState().user?.id || 'system',
      details: { targetStaffId: id },
    });

    staff.updatedAt = new Date();

    return staff;
  }

  /**
   * 본사 직원 삭제
   */
  async deleteHeadquartersStaff(id: string): Promise<void> {
    await this.delay();

    const index = this.headquarters.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    this.headquarters.splice(index, 1);

    auditService.log({
      action: 'USER_DELETED',
      resource: 'staff:hq',
      userId: useAuthStore.getState().user?.id || 'system',
      details: { targetStaffId: id },
    });
  }

  // ============================================
  // 가맹점 직원 관리
  // ============================================

  /**
   * 가맹점 직원 목록 조회
   */
  async getFranchiseStaff(params?: {
    storeId?: string;
    status?: StaffStatus;
    keyword?: string;
    page?: number;
    limit?: number;
  }): Promise<{ data: StaffAccount[]; pagination: Pagination }> {
    await this.delay();

    const { storeId, status, keyword = '', page = 1, limit = 10 } = params || {};

    let result = [...this.franchise];

    // 가맹점 필터
    if (storeId) {
      result = result.filter((s) => s.storeId === storeId);
    }

    // 상태 필터
    if (status) {
      result = result.filter((s) => s.status === status);
    }

    // 키워드 검색 (이름, 아이디)
    if (keyword) {
      const lowerKeyword = keyword.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(lowerKeyword) ||
          s.loginId.toLowerCase().includes(lowerKeyword)
      );
    }

    // 정렬: 최신 등록순
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 가맹점 직원 초대 (비밀번호 없이 기본정보만)
   */
  async inviteFranchiseStaff(data: StaffInviteFormData): Promise<StaffAccount> {
    await this.delay();

    // 아이디 중복 검사
    const isDuplicate = await this.checkLoginIdDuplicate(data.loginId);
    if (isDuplicate) {
      throw new Error('이미 사용 중인 아이디입니다.');
    }

    // 이메일 중복 검사
    const emailExists = this.headquarters.some(
      (s) => s.email.toLowerCase() === data.email.toLowerCase()
    ) || this.franchise.some(
      (s) => s.email.toLowerCase() === data.email.toLowerCase()
    );
    if (emailExists) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    if (!data.storeId) {
      throw new Error('소속 가맹점을 선택해주세요.');
    }

    const invitationToken = generateUUID();
    const invitationExpiresAt = new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);

    const newStaff: StaffAccount = {
      id: `fr-staff-${Date.now()}`,
      staffType: 'franchise',
      name: data.name,
      phone: data.phone,
      email: data.email,
      loginId: data.loginId,
      storeId: data.storeId,
      status: 'invited',
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'admin',
      invitationToken,
      invitationExpiresAt,
      invitedAt: new Date(),
      mfaEnabled: true,
    };

    this.franchise.unshift(newStaff);

    auditService.log({
      action: 'USER_CREATED',
      resource: 'staff:franchise',
      userId: useAuthStore.getState().user?.id || 'system',
      details: { targetLoginId: data.loginId, email: data.email },
    });

    // 초대 메일 발송
    emailService.sendInvitationEmail({
      to: data.email,
      name: data.name,
      invitationLink: this.generateInvitationLink(invitationToken),
      expiresAt: invitationExpiresAt,
    });

    return newStaff;
  }

  /**
   * 가맹점 직원 수정
   */
  async updateFranchiseStaff(
    id: string,
    data: StaffAccountUpdateData
  ): Promise<StaffAccount> {
    await this.delay();

    const staff = this.franchise.find((s) => s.id === id);
    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    if (data.name) staff.name = data.name;
    if (data.phone) staff.phone = data.phone;
    if (data.email) staff.email = data.email;
    if (data.storeId !== undefined) staff.storeId = data.storeId;

    if (data.status) {
      if (staff.status !== data.status) {
        auditService.log({
          action: 'USER_STATUS_CHANGE',
          resource: 'staff:franchise',
          userId: useAuthStore.getState().user?.id || 'system',
          details: { targetStaffId: id, oldStatus: staff.status, newStatus: data.status },
        });
      }
      staff.status = data.status;
    }

    auditService.log({
      action: 'USER_UPDATED',
      resource: 'staff:franchise',
      userId: useAuthStore.getState().user?.id || 'system',
      details: { targetStaffId: id },
    });

    staff.updatedAt = new Date();

    return staff;
  }

  /**
   * 가맹점 직원 삭제
   */
  async deleteFranchiseStaff(id: string): Promise<void> {
    await this.delay();

    const index = this.franchise.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    this.franchise.splice(index, 1);

    auditService.log({
      action: 'USER_DELETED',
      resource: 'staff:franchise',
      userId: useAuthStore.getState().user?.id || 'system',
      details: { targetStaffId: id },
    });
  }

  // ============================================
  // 공통
  // ============================================

  async checkLoginIdDuplicate(loginId: string): Promise<boolean> {
    await this.delay(100);

    const targetLoginId = loginId.trim().toLowerCase();

    const existsInHq = this.headquarters.some(
      (s) => s.loginId.trim().toLowerCase() === targetLoginId
    );
    const existsInFr = this.franchise.some(
      (s) => s.loginId.trim().toLowerCase() === targetLoginId
    );

    return existsInHq || existsInFr;
  }

  /**
   * 비밀번호 초기화 (실제로는 서버에서 처리)
   */
  async resetPassword(id: string): Promise<string> {
    await this.delay();

    const staff =
      this.headquarters.find((s) => s.id === id) ||
      this.franchise.find((s) => s.id === id);

    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    // 임시 비밀번호 생성 (실제로는 서버에서 처리)
    const tempPassword = Math.random().toString(36).slice(-8);

    auditService.log({
      action: 'PASSWORD_CHANGED',
      resource: `staff:${staff.staffType}`,
      userId: useAuthStore.getState().user?.id || 'system',
      details: { targetStaffId: id, method: 'reset_password' },
    });

    return tempPassword;
  }

  /**
   * 본인 비밀번호 변경
   */
  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.delay();

    const staff =
      this.headquarters.find((s) => s.id === id) ||
      this.franchise.find((s) => s.id === id);

    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    // 현재 비밀번호 검증 (Mock: 아무 값이나 통과, 빈 값만 차단)
    if (!currentPassword.trim()) {
      throw new Error('현재 비밀번호를 입력해주세요.');
    }

    // 비밀번호 정책 검증
    if (newPassword.length < 8) {
      throw new Error('새 비밀번호는 8자 이상이어야 합니다.');
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[!@#$%^&*]/.test(newPassword)) {
      throw new Error('비밀번호는 대/소문자, 숫자, 특수문자를 포함해야 합니다.');
    }

    auditService.log({
      action: 'PASSWORD_CHANGED',
      resource: `staff:${staff.staffType}`,
      userId: id,
      details: { targetStaffId: id, method: 'self_change' },
    });
  }

  // ============================================
  // 초대 관리
  // ============================================

  /**
   * 초대 토큰 검증
   */
  async validateInvitationToken(token: string): Promise<InvitationValidation> {
    await this.delay();

    // 모든 직원에서 토큰 검색
    const staff =
      this.headquarters.find((s) => s.invitationToken === token) ||
      this.franchise.find((s) => s.invitationToken === token);

    if (!staff) {
      return { isValid: false, error: 'NOT_FOUND' };
    }

    // 이미 비밀번호 설정된 경우
    if (staff.status !== 'invited') {
      return { isValid: false, error: 'ALREADY_SET', staff };
    }

    // 만료 확인
    if (staff.invitationExpiresAt && staff.invitationExpiresAt < new Date()) {
      return { isValid: false, error: 'EXPIRED', staff };
    }

    return { isValid: true, staff };
  }

  /**
   * 비밀번호 설정 (초대 수락)
   * - 토큰 검증
   * - 비밀번호 저장
   * - status를 'pending_approval'로 변경
   */
  async setPasswordByToken(data: PasswordSetupData): Promise<StaffAccount> {
    await this.delay();

    // 비밀번호 확인
    if (data.password !== data.confirmPassword) {
      throw new Error('비밀번호가 일치하지 않습니다.');
    }

    if (data.password.length < 6) {
      throw new Error('비밀번호는 6자 이상이어야 합니다.');
    }

    // 토큰 검증
    const validation = await this.validateInvitationToken(data.token);
    if (!validation.isValid || !validation.staff) {
      throw new Error(
        validation.error === 'EXPIRED'
          ? '초대 링크가 만료되었습니다.'
          : validation.error === 'ALREADY_SET'
            ? '이미 비밀번호가 설정된 계정입니다.'
            : '유효하지 않은 초대 링크입니다.'
      );
    }

    const staff = validation.staff;

    // 비밀번호 저장 (실제로는 해시하여 저장)
    this.staffPasswords.set(staff.id, {
      staffId: staff.id,
      passwordHash: data.password, // 실제 구현에서는 bcrypt 등으로 해시
    });

    // 상태 업데이트
    staff.status = 'pending_approval';
    staff.passwordSetAt = new Date();
    staff.invitationToken = undefined; // 토큰 무효화
    staff.updatedAt = new Date();

    auditService.log({
      action: 'PASSWORD_CHANGED',
      resource: `staff:${staff.staffType}`,
      userId: staff.id,
      details: { targetStaffId: staff.id, method: 'setup_by_token' },
    });

    return staff;
  }

  /**
   * 초대 재발송
   */
  async resendInvitation(staffId: string): Promise<void> {
    await this.delay();

    const staff =
      this.headquarters.find((s) => s.id === staffId) ||
      this.franchise.find((s) => s.id === staffId);

    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    if (staff.status !== 'invited') {
      throw new Error('초대 상태의 직원에게만 재발송할 수 있습니다.');
    }

    // 새 토큰 생성
    const newToken = generateUUID();
    const newExpiresAt = new Date(Date.now() + INVITATION_EXPIRY_HOURS * 60 * 60 * 1000);

    staff.invitationToken = newToken;
    staff.invitationExpiresAt = newExpiresAt;
    staff.updatedAt = new Date();

    // 재발송 메일 발송
    emailService.resendInvitationEmail({
      to: staff.email,
      name: staff.name,
      invitationLink: this.generateInvitationLink(newToken),
      expiresAt: newExpiresAt,
    });
  }

  // ============================================
  // 승인 관리
  // ============================================

  /**
   * 승인 대기 목록 조회
   */
  async getPendingApprovals(params?: {
    staffType?: StaffType;
    page?: number;
    limit?: number;
  }): Promise<{ data: StaffAccount[]; pagination: Pagination }> {
    await this.delay();

    const { staffType, page = 1, limit = 10 } = params || {};

    // 승인 대기 상태 직원 필터링
    let result: StaffAccount[] = [];

    if (!staffType || staffType === 'headquarters') {
      result = result.concat(
        this.headquarters.filter((s) => s.status === 'pending_approval')
      );
    }

    if (!staffType || staffType === 'franchise') {
      result = result.concat(
        this.franchise.filter((s) => s.status === 'pending_approval')
      );
    }

    // 비밀번호 설정 최신순 정렬
    result.sort((a, b) => {
      const aTime = a.passwordSetAt?.getTime() || 0;
      const bTime = b.passwordSetAt?.getTime() || 0;
      return bTime - aTime;
    });

    const total = result.length;
    const startIndex = (page - 1) * limit;
    const paginatedData = result.slice(startIndex, startIndex + limit);

    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * 승인 대기 건수 조회 (네비게이션 뱃지용)
   */
  async getPendingApprovalCount(): Promise<PendingApprovalCount> {
    await this.delay(100);

    const headquarters = this.headquarters.filter(
      (s) => s.status === 'pending_approval'
    ).length;

    const franchise = this.franchise.filter(
      (s) => s.status === 'pending_approval'
    ).length;

    return {
      headquarters,
      franchise,
      total: headquarters + franchise,
    };
  }

  /**
   * 직원 승인
   */
  async approveStaff(staffId: string, approverId: string): Promise<StaffAccount> {
    await this.delay();

    const staff =
      this.headquarters.find((s) => s.id === staffId) ||
      this.franchise.find((s) => s.id === staffId);

    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    if (staff.status !== 'pending_approval') {
      throw new Error('승인 대기 상태의 직원만 승인할 수 있습니다.');
    }

    // 승인 처리
    staff.status = 'active';
    staff.approvedAt = new Date();
    staff.approvedBy = approverId;
    staff.updatedAt = new Date();

    auditService.log({
      action: 'USER_STATUS_CHANGE',
      resource: `staff:${staff.staffType}`,
      userId: approverId,
      details: { targetStaffId: staff.id, oldStatus: 'pending_approval', newStatus: 'active' },
    });

    // 승인 완료 메일 발송
    emailService.sendApprovalEmail({
      to: staff.email,
      name: staff.name,
    });

    return staff;
  }

  /**
   * 직원 거절
   */
  async rejectStaff(
    staffId: string,
    rejectorId: string,
    reason?: string
  ): Promise<StaffAccount> {
    await this.delay();

    const staff =
      this.headquarters.find((s) => s.id === staffId) ||
      this.franchise.find((s) => s.id === staffId);

    if (!staff) {
      throw new Error('직원을 찾을 수 없습니다.');
    }

    if (staff.status !== 'pending_approval') {
      throw new Error('승인 대기 상태의 직원만 거절할 수 있습니다.');
    }

    // 거절 처리
    staff.status = 'rejected';
    staff.rejectedAt = new Date();
    staff.rejectedBy = rejectorId;
    staff.rejectionReason = reason;
    staff.updatedAt = new Date();

    auditService.log({
      action: 'USER_STATUS_CHANGE',
      resource: `staff:${staff.staffType}`,
      userId: rejectorId,
      details: { targetStaffId: staff.id, oldStatus: 'pending_approval', newStatus: 'rejected', reason },
    });

    // 거절 알림 메일 발송
    emailService.sendRejectionEmail({
      to: staff.email,
      name: staff.name,
      reason,
    });

    return staff;
  }

  /**
   * Staff 비밀번호 검증 (로그인용)
   */
  async verifyStaffPassword(staffId: string, password: string): Promise<boolean> {
    const record = this.staffPasswords.get(staffId);
    if (!record) {
      return false;
    }
    // 실제 구현에서는 bcrypt.compare 사용
    return record.passwordHash === password;
  }

  /**
   * 이메일 또는 로그인 ID로 직원 찾기
   */
  async findStaffByCredential(credential: string): Promise<StaffAccount | null> {
    const lowerCredential = credential.toLowerCase();

    return (
      this.headquarters.find(
        (s) =>
          s.email.toLowerCase() === lowerCredential ||
          s.loginId.toLowerCase() === lowerCredential
      ) ||
      this.franchise.find(
        (s) =>
          s.email.toLowerCase() === lowerCredential ||
          s.loginId.toLowerCase() === lowerCredential
      ) ||
      null
    );
  }
}

export const staffService = new StaffService();
