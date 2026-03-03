/**
 * 카테고리 상수 정의
 */

export interface Category {
  id: string;
  name: string;
  depth: number;
  children?: Category[];
}

/**
 * Mock 카테고리 데이터
 * TODO: 실제 API 연동 시 제거
 */
export const MOCK_CATEGORIES: Category[] = [
  {
    id: '1',
    name: '한마리',
    depth: 1,
    children: [
      { id: '1-1', name: '순살', depth: 2 },
      { id: '1-2', name: '뼈', depth: 2 },
    ],
  },
  {
    id: '2',
    name: '반반',
    depth: 1,
    children: [
      { id: '2-1', name: '순살반반', depth: 2 },
      { id: '2-2', name: '뼈반반', depth: 2 },
    ],
  },
  {
    id: '3',
    name: '음료',
    depth: 1,
    children: [
      { id: '3-1', name: '탄산', depth: 2 },
      { id: '3-2', name: '주스', depth: 2 },
    ],
  },
  {
    id: '4',
    name: '사이드',
    depth: 1,
    children: [
      { id: '4-1', name: '감자튀김', depth: 2 },
      { id: '4-2', name: '치즈스틱', depth: 2 },
    ],
  },
];

/**
 * UI 관련 상수
 */
export const PRODUCT_LIST_MAX_HEIGHT = 600; // px
export const PRODUCT_IMAGE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
