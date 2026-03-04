/**
 * 디자인 서비스
 * VITE_ENABLE_MOCK=true  → 인메모리 mock 데이터 사용
 * VITE_ENABLE_MOCK=false → 실제 백엔드 API 호출
 * 
 * 백엔드 연결 시 IS_MOCK_MODE=false로 설정하면 됩니다.
 */
import { apiClient, IS_MOCK_MODE } from '@/lib/api/apiClient';
import type {
    Banner,
    BannerFormData,
    Popup,
    PopupFormData,
    IconBadge,
    IconBadgeFormData,
    MainSection,
    BannerStatus,
    PopupStatus,
    BadgeStatus
} from '@/types/design';

// ============================================================
// Mock 데이터 (IS_MOCK_MODE=true 일 때만 사용)
// ============================================================
const MOCK_BANNERS: Banner[] = [
    { id: 'banner-001', title: '봄 시즌 신메뉴 프로모션', imageUrl: '/images/banner-spring.jpg', linkUrl: '/events', position: 'main_top', status: 'active', sortOrder: 1, startDate: '2026-02-01', endDate: '2026-03-31', createdAt: '2026-01-28T10:00:00Z' },
    { id: 'banner-002', title: 'VIP 전용 할인 이벤트', imageUrl: '/images/banner-vip.jpg', linkUrl: '/marketing/coupons', position: 'main_middle', status: 'active', sortOrder: 2, startDate: '2026-02-15', endDate: null, createdAt: '2026-02-10T09:00:00Z' },
    { id: 'banner-003', title: '3월 대규모 할인전', imageUrl: '/images/banner-march.jpg', linkUrl: '/marketing/discounts', position: 'main_top', status: 'scheduled', sortOrder: 3, startDate: '2026-03-01', endDate: '2026-03-31', createdAt: '2026-02-20T14:00:00Z' },
    { id: 'banner-004', title: '작년 연말 프로모션', imageUrl: '/images/banner-year-end.jpg', linkUrl: '/events', position: 'main_bottom', status: 'inactive', sortOrder: 4, startDate: '2025-12-01', endDate: '2025-12-31', createdAt: '2025-11-25T11:00:00Z' },
];

const MOCK_POPUPS: Popup[] = [
    { id: 'popup-001', title: '앱 업데이트 안내', content: '더 나은 서비스를 위해 최신 버전으로 업데이트해주세요.', imageUrl: '/images/popup-update.jpg', webLinkUrl: '', deepLinkUrl: '', deviceType: 'mobile', popupType: 'screen', exposureTarget: 'all', exposureScreen: ['main'], status: 'active', sortOrder: 1, startDate: '2026-02-20', endDate: null, showOncePerDay: true, createdAt: '2026-02-19T10:00:00Z' },
    { id: 'popup-002', title: '신규 가입 쿠폰 안내', content: '회원가입 감사 쿠폰 3,000원이 발급되었습니다!', imageUrl: '/images/popup-coupon.jpg', webLinkUrl: '/marketing/coupons', deepLinkUrl: 'myapp://coupon', deviceType: 'mobile', popupType: 'bottom_sheet', exposureTarget: 'member', exposureScreen: ['main', 'event'], status: 'active', sortOrder: 2, startDate: '2026-02-01', endDate: '2026-03-31', showOncePerDay: false, createdAt: '2026-01-30T14:00:00Z' },
    { id: 'popup-003', title: '웹메인 공지사항', content: 'PC버전 메인 화면 공지사항입니다.', imageUrl: '/images/popup-notice.jpg', webLinkUrl: '/notice/1', deepLinkUrl: '', deviceType: 'pc', popupType: 'modal', exposureTarget: 'all', exposureScreen: ['main'], status: 'active', sortOrder: 3, startDate: '2026-03-01', endDate: '2026-03-31', showOncePerDay: true, createdAt: '2026-02-28T14:00:00Z' }
];

const MOCK_BADGES: IconBadge[] = [
    { id: 'badge-001', name: 'NEW 뱃지', displayType: 'text', text: 'NEW', textColor: '#FFFFFF', bgColor: '#E11D48', imageUrl: '', status: 'active', sortOrder: 1, createdAt: '2026-01-15T10:00:00Z' },
    { id: 'badge-002', name: 'HOT 뱃지', displayType: 'text', text: 'HOT', textColor: '#FFFFFF', bgColor: '#F59E0B', imageUrl: '', status: 'active', sortOrder: 2, createdAt: '2026-01-15T10:00:00Z' },
    { id: 'badge-005', name: '시즌 한정 아이콘', displayType: 'image', text: '', textColor: '', bgColor: '', imageUrl: '/images/badge-seasonal.png', status: 'active', sortOrder: 5, createdAt: '2026-02-10T11:00:00Z' },
];

const MOCK_SECTIONS: MainSection[] = [
    { id: 'sec-1', type: 'banner_carousel', title: '메인 배너', isVisible: true, sortOrder: 1 },
    { id: 'sec-2', type: 'quick_menu', title: '퀵 메뉴', isVisible: true, sortOrder: 2 },
    { id: 'sec-3', type: 'recommended', title: '추천 메뉴', isVisible: true, sortOrder: 3 },
    { id: 'sec-4', type: 'new_menu', title: '신메뉴 안내', isVisible: true, sortOrder: 4 },
    { id: 'sec-5', type: 'event_list', title: '진행 중 이벤트', isVisible: false, sortOrder: 5 },
    { id: 'sec-6', type: 'notice', title: '공지사항', isVisible: true, sortOrder: 6 },
];

// ============================================================
// Mock 구현 (인메모리)
// ============================================================
class MockDesignService {
    private banners: Banner[] = [...MOCK_BANNERS];
    private popups: Popup[] = [...MOCK_POPUPS];
    private badges: IconBadge[] = [...MOCK_BADGES];
    private sections: MainSection[] = [...MOCK_SECTIONS];

    private delay(ms: number = 300): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ── Banners ──
    async getBanners(): Promise<Banner[]> {
        await this.delay();
        return [...this.banners];
    }
    async createBanner(data: BannerFormData): Promise<Banner> {
        await this.delay();
        const newBanner: Banner = { id: `banner-${Date.now()}`, title: data.title, imageUrl: data.imageUrl, linkUrl: data.linkUrl, position: data.position, status: 'inactive', sortOrder: data.sortOrder, startDate: data.startDate, endDate: data.isAlwaysOn ? null : data.endDate, createdAt: new Date().toISOString() };
        this.banners.push(newBanner);
        return newBanner;
    }
    async updateBanner(id: string, data: Partial<BannerFormData> & { status?: BannerStatus; sortOrder?: number }): Promise<Banner> {
        await this.delay();
        const idx = this.banners.findIndex((b) => b.id === id);
        if (idx === -1 || !this.banners[idx]) throw new Error('배너를 찾을 수 없습니다.');
        const updated = { ...this.banners[idx]!, ...data, endDate: data.isAlwaysOn ? null : (data.endDate !== undefined ? data.endDate : this.banners[idx]!.endDate) } as Banner;
        this.banners[idx] = updated;
        return updated;
    }
    async updateBannersOrders(banners: Banner[]): Promise<void> {
        await this.delay();
        this.banners = banners;
    }
    async deleteBanner(id: string): Promise<void> {
        await this.delay();
        this.banners = this.banners.filter((b) => b.id !== id);
    }

    // ── Popups ──
    async getPopups(): Promise<Popup[]> {
        await this.delay();
        return [...this.popups];
    }
    async createPopup(data: PopupFormData): Promise<Popup> {
        await this.delay();
        const newPopup: Popup = { id: `popup-${Date.now()}`, title: data.title, content: data.content, imageUrl: data.imageUrl, webLinkUrl: data.webLinkUrl, deepLinkUrl: data.deepLinkUrl, deviceType: data.deviceType, popupType: data.popupType, exposureTarget: data.exposureTarget, exposureScreen: data.exposureScreen, status: 'inactive', sortOrder: data.sortOrder, startDate: data.startDate, endDate: data.isAlwaysOn ? null : data.endDate, showOncePerDay: data.showOncePerDay, createdAt: new Date().toISOString() };
        this.popups.push(newPopup);
        return newPopup;
    }
    async updatePopup(id: string, data: Partial<PopupFormData> & { status?: PopupStatus; sortOrder?: number }): Promise<Popup> {
        await this.delay();
        const idx = this.popups.findIndex((p) => p.id === id);
        if (idx === -1 || !this.popups[idx]) throw new Error('팝업을 찾을 수 없습니다.');
        const updated = { ...this.popups[idx]!, ...data, endDate: data.isAlwaysOn ? null : (data.endDate !== undefined ? data.endDate : this.popups[idx]!.endDate) } as Popup;
        this.popups[idx] = updated;
        return updated;
    }
    async updatePopupsOrders(popups: Popup[]): Promise<void> {
        await this.delay();
        this.popups = popups;
    }
    async deletePopup(id: string): Promise<void> {
        await this.delay();
        this.popups = this.popups.filter((p) => p.id !== id);
    }

    // ── Icon Badges ──
    async getIconBadges(): Promise<IconBadge[]> {
        await this.delay();
        return [...this.badges];
    }
    async createIconBadge(data: IconBadgeFormData): Promise<IconBadge> {
        await this.delay();
        const newBadge: IconBadge = { id: `badge-${Date.now()}`, name: data.name, displayType: data.displayType, text: data.text, textColor: data.textColor, bgColor: data.bgColor, imageUrl: data.imageUrl, status: 'inactive', sortOrder: data.sortOrder, createdAt: new Date().toISOString() };
        this.badges.push(newBadge);
        return newBadge;
    }
    async updateIconBadge(id: string, data: Partial<IconBadgeFormData> & { status?: BadgeStatus; sortOrder?: number }): Promise<IconBadge> {
        await this.delay();
        const idx = this.badges.findIndex((b) => b.id === id);
        if (idx === -1 || !this.badges[idx]) throw new Error('뱃지를 찾을 수 없습니다.');
        const updated = { ...this.badges[idx]!, ...data } as IconBadge;
        this.badges[idx] = updated;
        return updated;
    }
    async updateIconBadgesOrders(badges: IconBadge[]): Promise<void> {
        await this.delay();
        this.badges = badges;
    }
    async deleteIconBadge(id: string): Promise<void> {
        await this.delay();
        this.badges = this.badges.filter((b) => b.id !== id);
    }

    // ── Main Sections ──
    async getMainSections(): Promise<MainSection[]> {
        await this.delay();
        return [...this.sections];
    }
    async updateMainSections(sections: MainSection[]): Promise<void> {
        await this.delay();
        this.sections = sections;
    }
}

// ============================================================
// Real API 구현 (IS_MOCK_MODE=false 일 때 사용)
// ============================================================
class RealDesignService {
    private readonly BASE = '/design';

    // ── Banners ──
    async getBanners(): Promise<Banner[]> {
        const res = await apiClient.get<{ data: Banner[] }>(`${this.BASE}/banners`);
        return res.data;
    }
    async createBanner(data: BannerFormData): Promise<Banner> {
        const res = await apiClient.post<{ data: Banner }>(`${this.BASE}/banners`, data);
        return res.data;
    }
    async updateBanner(id: string, data: Partial<BannerFormData> & { status?: BannerStatus; sortOrder?: number }): Promise<Banner> {
        const res = await apiClient.put<{ data: Banner }>(`${this.BASE}/banners/${id}`, data);
        return res.data;
    }
    async updateBannersOrders(banners: Banner[]): Promise<void> {
        await apiClient.patch(`${this.BASE}/banners/order`, { banners });
    }
    async deleteBanner(id: string): Promise<void> {
        await apiClient.delete(`${this.BASE}/banners/${id}`);
    }

    // ── Popups ──
    async getPopups(): Promise<Popup[]> {
        const res = await apiClient.get<{ data: Popup[] }>(`${this.BASE}/popups`);
        return res.data;
    }
    async createPopup(data: PopupFormData): Promise<Popup> {
        const res = await apiClient.post<{ data: Popup }>(`${this.BASE}/popups`, data);
        return res.data;
    }
    async updatePopup(id: string, data: Partial<PopupFormData> & { status?: PopupStatus; sortOrder?: number }): Promise<Popup> {
        const res = await apiClient.put<{ data: Popup }>(`${this.BASE}/popups/${id}`, data);
        return res.data;
    }
    async updatePopupsOrders(popups: Popup[]): Promise<void> {
        await apiClient.patch(`${this.BASE}/popups/order`, { popups });
    }
    async deletePopup(id: string): Promise<void> {
        await apiClient.delete(`${this.BASE}/popups/${id}`);
    }

    // ── Icon Badges ──
    async getIconBadges(): Promise<IconBadge[]> {
        const res = await apiClient.get<{ data: IconBadge[] }>(`${this.BASE}/badges`);
        return res.data;
    }
    async createIconBadge(data: IconBadgeFormData): Promise<IconBadge> {
        const res = await apiClient.post<{ data: IconBadge }>(`${this.BASE}/badges`, data);
        return res.data;
    }
    async updateIconBadge(id: string, data: Partial<IconBadgeFormData> & { status?: BadgeStatus; sortOrder?: number }): Promise<IconBadge> {
        const res = await apiClient.put<{ data: IconBadge }>(`${this.BASE}/badges/${id}`, data);
        return res.data;
    }
    async updateIconBadgesOrders(badges: IconBadge[]): Promise<void> {
        await apiClient.patch(`${this.BASE}/badges/order`, { badges });
    }
    async deleteIconBadge(id: string): Promise<void> {
        await apiClient.delete(`${this.BASE}/badges/${id}`);
    }

    // ── Main Sections ──
    async getMainSections(): Promise<MainSection[]> {
        const res = await apiClient.get<{ data: MainSection[] }>(`${this.BASE}/main-sections`);
        return res.data;
    }
    async updateMainSections(sections: MainSection[]): Promise<void> {
        await apiClient.put(`${this.BASE}/main-sections`, { sections });
    }
}

// ============================================================
// 환경변수에 따라 구현체 선택 (전환 포인트)
// ============================================================
export const designService: MockDesignService | RealDesignService =
    IS_MOCK_MODE ? new MockDesignService() : new RealDesignService();
