/**
 * 지사(Branch) 관련 타입 정의
 * [2026-03-23] 신규 — 지사 계층 구조 추가
 */

// 지사 엔티티
export interface Branch {
  id: string;
  name: string;          // "서울지사", "경기지사", "원주지사"
  region: string;        // 담당 지역
  description?: string;
  managerName?: string;  // 지사장명
  memberCount: number;   // 소속 직원 수
  storeCount: number;    // 소속 매장 수
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 지사 생성/수정 폼 데이터
export interface BranchFormData {
  name: string;
  region: string;
  description?: string;
  managerName?: string;
}
