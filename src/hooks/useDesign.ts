/**
 * 디자인 관리 React Query 훅
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { designService } from '@/services/designService';
import type {
    Banner, BannerFormData, BannerStatus,
    Popup, PopupFormData, PopupStatus,
    IconBadge, IconBadgeFormData, BadgeStatus,
    MainSection, RecommendedMenu
} from '@/types/design';
import { useToast } from '@/hooks/useToast';

const DESIGN_KEYS = {
    banners: ['design', 'banners'] as const,
    popups: ['design', 'popups'] as const,
    badges: ['design', 'badges'] as const,
    mainSections: ['design', 'mainSections'] as const,
    recommendedMenus: ['design', 'recommendedMenus'] as const,
};

// ── Banners ──

export function useBanners() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: banners = [], isLoading: loading, refetch } = useQuery({
        queryKey: DESIGN_KEYS.banners,
        queryFn: () => designService.getBanners(),
    });

    const createMutation = useMutation({
        mutationFn: (data: BannerFormData) => designService.createBanner(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.banners });
            toast.success('배너가 등록되었습니다.');
        },
        onError: () => toast.error('배너 등록에 실패했습니다.'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<BannerFormData> & { status?: BannerStatus; sortOrder?: number } }) =>
            designService.updateBanner(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.banners });
            toast.success('배너가 수정되었습니다.');
        },
        onError: () => toast.error('배너 수정에 실패했습니다.'),
    });

    const orderMutation = useMutation({
        mutationFn: (newBanners: Banner[]) => designService.updateBannersOrders(newBanners),
        onMutate: async (newBanners) => {
            await queryClient.cancelQueries({ queryKey: DESIGN_KEYS.banners });
            const previous = queryClient.getQueryData<Banner[]>(DESIGN_KEYS.banners);
            queryClient.setQueryData(DESIGN_KEYS.banners, newBanners);
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(DESIGN_KEYS.banners, context.previous);
            toast.error('순서 변경에 실패했습니다.');
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.banners }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => designService.deleteBanner(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.banners }),
        onError: () => toast.error('배너 삭제에 실패했습니다.'),
    });

    const createBanner = async (data: BannerFormData) => {
        try { await createMutation.mutateAsync(data); return true; } catch { return false; }
    };

    const updateBanner = async (id: string, data: Partial<BannerFormData> & { status?: BannerStatus; sortOrder?: number }) => {
        try { await updateMutation.mutateAsync({ id, data }); return true; } catch { return false; }
    };

    const updateBannersOrders = async (newBanners: Banner[]) => {
        try { await orderMutation.mutateAsync(newBanners); return true; } catch { return false; }
    };

    const toggleStatus = async (banner: Banner) => {
        const newStatus: BannerStatus = banner.status === 'active' ? 'inactive' : 'active';
        await updateBanner(banner.id, { status: newStatus });
    };

    const deleteBanner = async (id: string, title: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success(`"${title}" 배너가 삭제되었습니다.`);
            return true;
        } catch { return false; }
    };

    return { banners, loading, createBanner, updateBanner, updateBannersOrders, toggleStatus, deleteBanner, refetch };
}

// ── Popups ──

export function usePopups() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: popups = [], isLoading: loading, refetch } = useQuery({
        queryKey: DESIGN_KEYS.popups,
        queryFn: () => designService.getPopups(),
    });

    const createMutation = useMutation({
        mutationFn: (data: PopupFormData) => designService.createPopup(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.popups });
            toast.success('팝업이 등록되었습니다.');
        },
        onError: () => toast.error('팝업 등록에 실패했습니다.'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<PopupFormData> & { status?: PopupStatus; sortOrder?: number } }) =>
            designService.updatePopup(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.popups });
            toast.success('팝업이 수정되었습니다.');
        },
        onError: () => toast.error('팝업 수정에 실패했습니다.'),
    });

    const orderMutation = useMutation({
        mutationFn: (newPopups: Popup[]) => designService.updatePopupsOrders(newPopups),
        onMutate: async (newPopups) => {
            await queryClient.cancelQueries({ queryKey: DESIGN_KEYS.popups });
            const previous = queryClient.getQueryData<Popup[]>(DESIGN_KEYS.popups);
            queryClient.setQueryData(DESIGN_KEYS.popups, newPopups);
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(DESIGN_KEYS.popups, context.previous);
            toast.error('순서 변경에 실패했습니다.');
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.popups }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => designService.deletePopup(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.popups }),
        onError: () => toast.error('팝업 삭제에 실패했습니다.'),
    });

    const createPopup = async (data: PopupFormData) => {
        try { await createMutation.mutateAsync(data); return true; } catch { return false; }
    };

    const updatePopup = async (id: string, data: Partial<PopupFormData> & { status?: PopupStatus; sortOrder?: number }) => {
        try { await updateMutation.mutateAsync({ id, data }); return true; } catch { return false; }
    };

    const updatePopupsOrders = async (newPopups: Popup[]) => {
        try { await orderMutation.mutateAsync(newPopups); return true; } catch { return false; }
    };

    const toggleStatus = async (popup: Popup) => {
        const newStatus: PopupStatus = popup.status === 'active' ? 'inactive' : 'active';
        await updatePopup(popup.id, { status: newStatus });
    };

    const deletePopup = async (id: string, title: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success(`"${title}" 팝업이 삭제되었습니다.`);
            return true;
        } catch { return false; }
    };

    return { popups, loading, createPopup, updatePopup, updatePopupsOrders, toggleStatus, deletePopup, refetch };
}

// ── Icon Badges ──

export function useIconBadges() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: badges = [], isLoading: loading, refetch } = useQuery({
        queryKey: DESIGN_KEYS.badges,
        queryFn: () => designService.getIconBadges(),
    });

    const createMutation = useMutation({
        mutationFn: (data: IconBadgeFormData) => designService.createIconBadge(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.badges });
            toast.success('뱃지가 등록되었습니다.');
        },
        onError: () => toast.error('뱃지 등록에 실패했습니다.'),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<IconBadgeFormData> & { status?: BadgeStatus; sortOrder?: number } }) =>
            designService.updateIconBadge(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.badges });
            toast.success('뱃지가 수정되었습니다.');
        },
        onError: () => toast.error('뱃지 수정에 실패했습니다.'),
    });

    const orderMutation = useMutation({
        mutationFn: (newBadges: IconBadge[]) => designService.updateIconBadgesOrders(newBadges),
        onMutate: async (newBadges) => {
            await queryClient.cancelQueries({ queryKey: DESIGN_KEYS.badges });
            const previous = queryClient.getQueryData<IconBadge[]>(DESIGN_KEYS.badges);
            queryClient.setQueryData(DESIGN_KEYS.badges, newBadges);
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(DESIGN_KEYS.badges, context.previous);
            toast.error('순서 변경에 실패했습니다.');
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.badges }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => designService.deleteIconBadge(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.badges }),
        onError: () => toast.error('뱃지 삭제에 실패했습니다.'),
    });

    const createIconBadge = async (data: IconBadgeFormData) => {
        try { await createMutation.mutateAsync(data); return true; } catch { return false; }
    };

    const updateIconBadge = async (id: string, data: Partial<IconBadgeFormData> & { status?: BadgeStatus; sortOrder?: number }) => {
        try { await updateMutation.mutateAsync({ id, data }); return true; } catch { return false; }
    };

    const updateIconBadgesOrders = async (newBadges: IconBadge[]) => {
        try { await orderMutation.mutateAsync(newBadges); return true; } catch { return false; }
    };

    const toggleStatus = async (badge: IconBadge) => {
        const newStatus: BadgeStatus = badge.status === 'active' ? 'inactive' : 'active';
        await updateIconBadge(badge.id, { status: newStatus });
    };

    const deleteIconBadge = async (id: string, name: string) => {
        try {
            await deleteMutation.mutateAsync(id);
            toast.success(`"${name}" 뱃지가 삭제되었습니다.`);
            return true;
        } catch { return false; }
    };

    return { badges, loading, createIconBadge, updateIconBadge, updateIconBadgesOrders, toggleStatus, deleteIconBadge, refetch };
}

// ── Main Sections ──

export function useMainScreens() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: sections = [], isLoading: loading, refetch } = useQuery({
        queryKey: DESIGN_KEYS.mainSections,
        queryFn: () => designService.getMainSections(),
    });

    const updateMutation = useMutation({
        mutationFn: (newSections: MainSection[]) => designService.updateMainSections(newSections),
        onMutate: async (newSections) => {
            await queryClient.cancelQueries({ queryKey: DESIGN_KEYS.mainSections });
            const previous = queryClient.getQueryData<MainSection[]>(DESIGN_KEYS.mainSections);
            queryClient.setQueryData(DESIGN_KEYS.mainSections, newSections);
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(DESIGN_KEYS.mainSections, context.previous);
            toast.error('메인화면 상태 변경에 실패했습니다.');
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.mainSections }),
    });

    const updateMainSections = async (newSections: MainSection[]) => {
        try { await updateMutation.mutateAsync(newSections); return true; } catch { return false; }
    };

    const toggleVisibility = async (id: string) => {
        const newSections = sections.map((s) => (s.id === id ? { ...s, isVisible: !s.isVisible } : s));
        return await updateMainSections(newSections);
    };

    const moveUp = async (index: number) => {
        if (index === 0) return;
        const next = [...sections];
        [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
        return await updateMainSections(next.map((s, i) => ({ ...s, sortOrder: i + 1 })));
    };

    const moveDown = async (index: number) => {
        if (index === sections.length - 1) return;
        const next = [...sections];
        [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
        return await updateMainSections(next.map((s, i) => ({ ...s, sortOrder: i + 1 })));
    };

    const saveConfiguration = async () => {
        try {
            await designService.updateMainSections(sections);
            toast.success('메인화면 구성이 저장되었습니다.');
            return true;
        } catch {
            toast.error('메인화면 구성 저장에 실패했습니다.');
            return false;
        }
    };

    return { sections, loading, toggleVisibility, moveUp, moveDown, saveConfiguration, refetch };
}

// ── Recommended Menus ──

export function useRecommendedMenus() {
    const queryClient = useQueryClient();
    const toast = useToast();

    const { data: recommendedMenus = [], isLoading: loading, refetch } = useQuery({
        queryKey: DESIGN_KEYS.recommendedMenus,
        queryFn: () => designService.getRecommendedMenus(),
    });

    const updateMutation = useMutation({
        mutationFn: (menus: RecommendedMenu[]) => designService.updateRecommendedMenus(menus),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: DESIGN_KEYS.recommendedMenus });
            toast.success('추천메뉴 설정이 저장되었습니다.');
        },
        onError: () => toast.error('추천메뉴 설정 저장에 실패했습니다.'),
    });

    const saveRecommendedMenus = async (menus: RecommendedMenu[]) => {
        try {
            await updateMutation.mutateAsync(menus);
            return true;
        } catch {
            return false;
        }
    };

    return { recommendedMenus, loading, saveRecommendedMenus, refetch };
}
