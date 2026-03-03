import type { OptionGroup } from '@/types/product';

/**
 * 상품 옵션으로 사용 가능한 상품 목록 (반반피자 등)
 */
export const mockOptionProducts = [
  { id: 'prod-1', name: '페페로니 피자', price: 18000, posCode: 'PIZZA001', imageUrl: '' },
  { id: 'prod-2', name: '불고기 피자', price: 19000, posCode: 'PIZZA002', imageUrl: '' },
  { id: 'prod-3', name: '치즈 피자', price: 16000, posCode: 'PIZZA003', imageUrl: '' },
  { id: 'prod-4', name: '콤비네이션 피자', price: 20000, posCode: 'PIZZA004', imageUrl: '' },
  { id: 'prod-5', name: '슈프림 피자', price: 22000, posCode: 'PIZZA005', imageUrl: '' },
  { id: 'prod-6', name: '하와이안 피자', price: 18000, posCode: 'PIZZA006', imageUrl: '' },
];

export const mockOptionGroups: OptionGroup[] = [
  {
    id: '1',
    name: '도우 변경',
    isRequired: false,
    minSelection: 0,
    maxSelection: 1,
    displayOrder: 1,
    isVisible: true,
    items: [
      { id: 'item-1', type: 'option', referenceId: '5', priceType: 'original', overridePrice: 0, displayOrder: 1 },
      { id: 'item-2', type: 'option', referenceId: '6', priceType: 'original', overridePrice: 0, displayOrder: 2 },
    ],
    optionIds: ['5', '6'],
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: '2',
    name: '소스 추가',
    isRequired: false,
    minSelection: 0,
    maxSelection: 3,
    displayOrder: 2,
    isVisible: true,
    items: [
      { id: 'item-3', type: 'option', referenceId: '2', priceType: 'original', overridePrice: 0, displayOrder: 1 },
      { id: 'item-4', type: 'option', referenceId: '7', priceType: 'original', overridePrice: 0, displayOrder: 2 },
      { id: 'item-5', type: 'option', referenceId: '8', priceType: 'original', overridePrice: 0, displayOrder: 3 },
    ],
    optionIds: ['2', '7', '8'],
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-20'),
  },
  {
    id: '3',
    name: '음료 선택',
    isRequired: true,
    minSelection: 1,
    maxSelection: 2,
    displayOrder: 3,
    isVisible: true,
    items: [
      { id: 'item-6', type: 'option', referenceId: '3', priceType: 'original', overridePrice: 0, displayOrder: 1 },
      { id: 'item-7', type: 'option', referenceId: '4', priceType: 'original', overridePrice: 0, displayOrder: 2 },
    ],
    optionIds: ['3', '4'],
    createdAt: new Date('2026-01-21'),
    updatedAt: new Date('2026-01-21'),
  },
  {
    id: '4',
    name: '반반피자 선택',
    isRequired: true,
    minSelection: 2,
    maxSelection: 2,
    displayOrder: 4,
    isVisible: true,
    items: [
      { id: 'item-8', type: 'product', referenceId: 'prod-1', priceType: 'override', overridePrice: 0, displayOrder: 1 },
      { id: 'item-9', type: 'product', referenceId: 'prod-2', priceType: 'override', overridePrice: 0, displayOrder: 2 },
      { id: 'item-10', type: 'product', referenceId: 'prod-3', priceType: 'override', overridePrice: 0, displayOrder: 3 },
      { id: 'item-11', type: 'product', referenceId: 'prod-5', priceType: 'override', overridePrice: 3000, displayOrder: 4 },
    ],
    optionIds: [],
    createdAt: new Date('2026-01-22'),
    updatedAt: new Date('2026-01-22'),
  },
];
