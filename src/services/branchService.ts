/**
 * 지사 관리 서비스 레이어
 * [2026-03-23] 신규 — 지사 CRUD
 */
import type { Branch, BranchFormData } from '@/types/branch';
import { mockBranches } from '@/lib/api/mockBranchData';
import { delay } from '@/utils/async';

let branches: Branch[] = [...mockBranches];

class BranchService {
  private async delay(ms = 300): Promise<void> {
    await delay(ms);
  }

  /** 전체 지사 목록 조회 */
  async getBranches(): Promise<Branch[]> {
    await this.delay();
    return [...branches];
  }

  /** 지사 상세 조회 */
  async getBranchById(id: string): Promise<Branch | null> {
    await this.delay();
    return branches.find((b) => b.id === id) ?? null;
  }

  /** 지사 등록 */
  async createBranch(data: BranchFormData): Promise<Branch> {
    await this.delay(500);

    const newBranch: Branch = {
      id: `branch-${String(branches.length + 1).padStart(3, '0')}`,
      name: data.name,
      region: data.region,
      description: data.description,
      managerName: data.managerName,
      memberCount: 0,
      storeCount: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    branches.push(newBranch);
    return { ...newBranch };
  }

  /** 지사 수정 */
  async updateBranch(id: string, data: BranchFormData): Promise<Branch> {
    await this.delay(500);

    const index = branches.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('지사를 찾을 수 없습니다.');

    const updated: Branch = {
      ...branches[index]!,
      name: data.name,
      region: data.region,
      description: data.description,
      managerName: data.managerName,
      updatedAt: new Date(),
    };

    branches[index] = updated;
    return { ...updated };
  }

  /** 지사 삭제 — 소속 직원/매장 있으면 거부 */
  async deleteBranch(id: string): Promise<void> {
    await this.delay(500);

    const branch = branches.find((b) => b.id === id);
    if (!branch) throw new Error('지사를 찾을 수 없습니다.');

    if (branch.memberCount > 0 || branch.storeCount > 0) {
      throw new Error('소속 직원 또는 매장이 있는 지사는 삭제할 수 없습니다. 먼저 소속을 변경해주세요.');
    }

    branches = branches.filter((b) => b.id !== id);
  }
}

export const branchService = new BranchService();
