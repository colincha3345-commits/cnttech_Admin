/**
 * 통합 유저 Mock 데이터
 *
 * 기존 mock 데이터를 변환 함수로 재활용하고,
 * 비회원/이벤트참여자 데이터를 추가한다.
 */
import type { UnifiedUser, GuestUser, EventParticipantUser } from '@/types/unified-user';
import { memberToUnifiedUser, staffToUnifiedUser } from '@/types/unified-user';
import { mockMembers } from './mockData';
import { mockHeadquartersStaff, mockFranchiseStaff } from './mockStaffData';

// 기존 데이터 변환
const customerUsers = mockMembers.map(memberToUnifiedUser);
const brandAdminUsers = mockHeadquartersStaff.map(staffToUnifiedUser);
const franchiseUsers = mockFranchiseStaff.map(staffToUnifiedUser);

// 비회원
const guestUsers: GuestUser[] = [
  {
    id: 'guest-1',
    userType: 'guest',
    name: '김비회원',
    phone: '010-0000-1111',
    email: null,
    status: 'active',
    source: 'phone_order',
    relatedOrderIds: ['order-guest-1'],
    createdAt: new Date('2026-02-10T10:00:00'),
    updatedAt: new Date('2026-02-10T10:00:00'),
    lastLoginAt: null,
  },
  {
    id: 'guest-2',
    userType: 'guest',
    name: '이비회원',
    phone: '010-0000-2222',
    email: null,
    status: 'active',
    source: 'offline_order',
    relatedOrderIds: ['order-guest-2', 'order-guest-3'],
    createdAt: new Date('2026-02-08T14:30:00'),
    updatedAt: new Date('2026-02-12T09:00:00'),
    lastLoginAt: null,
  },
  {
    id: 'guest-3',
    userType: 'guest',
    name: '박비회원',
    phone: '010-0000-3333',
    email: null,
    status: 'active',
    source: 'phone_order',
    createdAt: new Date('2026-02-15T11:00:00'),
    updatedAt: new Date('2026-02-15T11:00:00'),
    lastLoginAt: null,
  },
];

// 이벤트 참여자
const eventParticipantUsers: EventParticipantUser[] = [
  {
    id: 'evt-participant-1',
    userType: 'event_participant',
    name: '박참여',
    phone: '010-1111-0001',
    email: 'park@example.com',
    status: 'active',
    eventId: 'evt-1',
    participatedAt: new Date('2026-02-15T13:00:00'),
    hasConsented: true,
    hasThirdPartyConsented: false,
    collectionMode: 'form_input',
    createdAt: new Date('2026-02-15T13:00:00'),
    updatedAt: new Date('2026-02-15T13:00:00'),
    lastLoginAt: null,
  },
  {
    id: 'evt-participant-2',
    userType: 'event_participant',
    name: '조이벤트',
    phone: '010-1111-0002',
    email: null,
    status: 'active',
    eventId: 'evt-1',
    participatedAt: new Date('2026-02-15T14:30:00'),
    hasConsented: true,
    hasThirdPartyConsented: true,
    collectionMode: 'auto',
    linkedMemberId: 'member-3',
    createdAt: new Date('2026-02-15T14:30:00'),
    updatedAt: new Date('2026-02-15T14:30:00'),
    lastLoginAt: null,
  },
  {
    id: 'evt-participant-3',
    userType: 'event_participant',
    name: '한경품',
    phone: '010-1111-0003',
    email: 'han@example.com',
    status: 'active',
    eventId: 'evt-2',
    participatedAt: new Date('2026-02-18T10:00:00'),
    hasConsented: true,
    hasThirdPartyConsented: true,
    collectionMode: 'form_input',
    address: '서울시 강남구 역삼동 123-4',
    createdAt: new Date('2026-02-18T10:00:00'),
    updatedAt: new Date('2026-02-18T10:00:00'),
    lastLoginAt: null,
  },
];

export const mockUnifiedUsers: UnifiedUser[] = [
  ...customerUsers,
  ...brandAdminUsers,
  ...franchiseUsers,
  ...guestUsers,
  ...eventParticipantUsers,
];
