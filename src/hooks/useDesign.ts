import { useState, useCallback, useEffect } from 'react';
import { designService } from '@/services/designService';
import type {
    Banner, BannerFormData, BannerStatus,
    Popup, PopupFormData, PopupStatus,
    IconBadge, IconBadgeFormData, BadgeStatus,
    MainSection
} from '@/types/design';
import { useToast } from '@/hooks/useToast';

export function useBanners() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchBanners = useCallback(async () => {
        setLoading(true);
        try {
            const data = await designService.getBanners();
            setBanners(data);
        } catch (error) {
            toast.error('배너 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchBanners();
    }, [fetchBanners]);

    const createBanner = async (data: BannerFormData) => {
        setLoading(true);
        try {
            await designService.createBanner(data);
            await fetchBanners();
            toast.success('배너가 등록되었습니다.');
            return true;
        } catch (error) {
            toast.error('배너 등록에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateBanner = async (id: string, data: Partial<BannerFormData> & { status?: BannerStatus; sortOrder?: number }) => {
        setLoading(true);
        try {
            await designService.updateBanner(id, data);
            await fetchBanners();
            toast.success('배너가 수정되었습니다.');
            return true;
        } catch (error) {
            toast.error('배너 수정에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateBannersOrders = async (newBanners: Banner[]) => {
        try {
            setBanners(newBanners);
            await designService.updateBannersOrders(newBanners);
            return true;
        } catch (error) {
            toast.error('순서 변경에 실패했습니다.');
            return false;
        }
    };

    const toggleStatus = async (banner: Banner) => {
        const newStatus: BannerStatus = banner.status === 'active' ? 'inactive' : 'active';
        await updateBanner(banner.id, { status: newStatus });
    };

    const deleteBanner = async (id: string, title: string) => {
        setLoading(true);
        try {
            await designService.deleteBanner(id);
            await fetchBanners();
            toast.success(`"${title}" 배너가 삭제되었습니다.`);
            return true;
        } catch (error) {
            toast.error('배너 삭제에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { banners, loading, createBanner, updateBanner, updateBannersOrders, toggleStatus, deleteBanner, refetch: fetchBanners };
}

export function usePopups() {
    const [popups, setPopups] = useState<Popup[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchPopups = useCallback(async () => {
        setLoading(true);
        try {
            const data = await designService.getPopups();
            setPopups(data);
        } catch (error) {
            toast.error('팝업 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPopups();
    }, [fetchPopups]);

    const createPopup = async (data: PopupFormData) => {
        setLoading(true);
        try {
            await designService.createPopup(data);
            await fetchPopups();
            toast.success('팝업이 등록되었습니다.');
            return true;
        } catch (error) {
            toast.error('팝업 등록에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updatePopup = async (id: string, data: Partial<PopupFormData> & { status?: PopupStatus; sortOrder?: number }) => {
        setLoading(true);
        try {
            await designService.updatePopup(id, data);
            await fetchPopups();
            toast.success('팝업이 수정되었습니다.');
            return true;
        } catch (error) {
            toast.error('팝업 수정에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updatePopupsOrders = async (newPopups: Popup[]) => {
        try {
            setPopups(newPopups);
            await designService.updatePopupsOrders(newPopups);
            return true;
        } catch (error) {
            toast.error('순서 변경에 실패했습니다.');
            return false;
        }
    };

    const toggleStatus = async (popup: Popup) => {
        const newStatus: PopupStatus = popup.status === 'active' ? 'inactive' : 'active';
        await updatePopup(popup.id, { status: newStatus });
    };

    const deletePopup = async (id: string, title: string) => {
        setLoading(true);
        try {
            await designService.deletePopup(id);
            await fetchPopups();
            toast.success(`"${title}" 팝업이 삭제되었습니다.`);
            return true;
        } catch (error) {
            toast.error('팝업 삭제에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { popups, loading, createPopup, updatePopup, updatePopupsOrders, toggleStatus, deletePopup, refetch: fetchPopups };
}

export function useIconBadges() {
    const [badges, setBadges] = useState<IconBadge[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchIconBadges = useCallback(async () => {
        setLoading(true);
        try {
            const data = await designService.getIconBadges();
            setBadges(data);
        } catch (error) {
            toast.error('뱃지 목록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchIconBadges();
    }, [fetchIconBadges]);

    const createIconBadge = async (data: IconBadgeFormData) => {
        setLoading(true);
        try {
            await designService.createIconBadge(data);
            await fetchIconBadges();
            toast.success('뱃지가 등록되었습니다.');
            return true;
        } catch (error) {
            toast.error('뱃지 등록에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateIconBadge = async (id: string, data: Partial<IconBadgeFormData> & { status?: BadgeStatus; sortOrder?: number }) => {
        setLoading(true);
        try {
            await designService.updateIconBadge(id, data);
            await fetchIconBadges();
            toast.success('뱃지가 수정되었습니다.');
            return true;
        } catch (error) {
            toast.error('뱃지 수정에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateIconBadgesOrders = async (newBadges: IconBadge[]) => {
        try {
            setBadges(newBadges);
            await designService.updateIconBadgesOrders(newBadges);
            return true;
        } catch (error) {
            toast.error('순서 변경에 실패했습니다.');
            return false;
        }
    };

    const toggleStatus = async (badge: IconBadge) => {
        const newStatus: BadgeStatus = badge.status === 'active' ? 'inactive' : 'active';
        await updateIconBadge(badge.id, { status: newStatus });
    };

    const deleteIconBadge = async (id: string, name: string) => {
        setLoading(true);
        try {
            await designService.deleteIconBadge(id);
            await fetchIconBadges();
            toast.success(`"${name}" 뱃지가 삭제되었습니다.`);
            return true;
        } catch (error) {
            toast.error('뱃지 삭제에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { badges, loading, createIconBadge, updateIconBadge, updateIconBadgesOrders, toggleStatus, deleteIconBadge, refetch: fetchIconBadges };
}

export function useMainScreens() {
    const [sections, setSections] = useState<MainSection[]>([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const fetchMainScreens = useCallback(async () => {
        setLoading(true);
        try {
            const data = await designService.getMainSections();
            setSections(data);
        } catch (error) {
            toast.error('메인화면 구성을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchMainScreens();
    }, [fetchMainScreens]);

    const updateMainSections = async (newSections: MainSection[]) => {
        try {
            setSections(newSections);
            await designService.updateMainSections(newSections);
            return true;
        } catch (error) {
            toast.error('메인화면 상태 변경에 실패했습니다.');
            return false;
        }
    };

    const toggleVisibility = async (id: string) => {
        const newSections = sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s));
        return await updateMainSections(newSections);
    };

    const moveUp = async (index: number) => {
        if (index === 0) return;
        const next = [...sections];
        const a = next[index - 1]!;
        const b = next[index]!;
        next[index - 1] = b;
        next[index] = a;
        return await updateMainSections(next.map((s, i) => ({ ...s, sortOrder: i + 1 })));
    };

    const moveDown = async (index: number) => {
        if (index === sections.length - 1) return;
        const next = [...sections];
        const a = next[index]!;
        const b = next[index + 1]!;
        next[index] = b;
        next[index + 1] = a;
        return await updateMainSections(next.map((s, i) => ({ ...s, sortOrder: i + 1 })));
    };

    const saveConfiguration = async () => {
        setLoading(true);
        try {
            await designService.updateMainSections(sections);
            toast.success('메인화면 구성이 저장되었습니다.');
            return true;
        } catch (error) {
            toast.error('메인화면 구성 저장에 실패했습니다.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { sections, loading, toggleVisibility, moveUp, moveDown, saveConfiguration, refetch: fetchMainScreens };
}
