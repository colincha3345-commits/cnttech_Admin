export type BannerStatus = 'active' | 'inactive' | 'scheduled';
export type BannerPosition = 'main_top' | 'main_middle' | 'main_bottom' | 'sub_top';

export interface Banner {
    id: string;
    title: string;
    imageUrl: string;
    linkUrl: string;
    position: BannerPosition;
    status: BannerStatus;
    sortOrder: number;
    startDate: string;
    endDate: string | null;
    createdAt: string;
}

export interface BannerFormData {
    title: string;
    imageUrl: string;
    linkUrl: string;
    position: BannerPosition;
    sortOrder: number;
    startDate: string;
    endDate: string;
    isAlwaysOn: boolean;
}

export type PopupStatus = 'active' | 'inactive' | 'scheduled';
export type PopupType = 'modal' | 'screen' | 'bottom_sheet';
export type DeviceType = 'pc' | 'mobile';
export type ExposureTarget = 'all' | 'guest' | 'member';
export type ExposureScreen = 'main' | 'menu' | 'event';

export interface Popup {
    id: string;
    title: string;
    content: string;
    imageUrl: string;
    webLinkUrl: string;
    deepLinkUrl: string;
    deviceType: DeviceType;
    popupType: PopupType;
    exposureTarget: ExposureTarget;
    exposureScreen: ExposureScreen[];
    status: PopupStatus;
    sortOrder: number;
    startDate: string;
    endDate: string | null;
    showOncePerDay: boolean;
    createdAt: string;
}

export interface PopupFormData {
    title: string;
    content: string;
    imageUrl: string;
    webLinkUrl: string;
    deepLinkUrl: string;
    deviceType: DeviceType;
    popupType: PopupType;
    exposureTarget: ExposureTarget;
    exposureScreen: ExposureScreen[];
    sortOrder: number;
    startDate: string;
    endDate: string;
    isAlwaysOn: boolean;
    showOncePerDay: boolean;
}

export type BadgeStatus = 'active' | 'inactive';
export type BadgeDisplayType = 'text' | 'image';

export interface IconBadge {
    id: string;
    name: string;
    displayType: BadgeDisplayType;
    text: string;
    textColor: string;
    bgColor: string;
    imageUrl: string;
    status: BadgeStatus;
    sortOrder: number;
    createdAt: string;
}

export interface IconBadgeFormData {
    name: string;
    displayType: BadgeDisplayType;
    text: string;
    textColor: string;
    bgColor: string;
    imageUrl: string;
    sortOrder: number;
}

export type SectionType = 'banner_carousel' | 'quick_menu' | 'recommended' | 'new_menu' | 'event_list' | 'notice';

export interface MainSection {
    id: string;
    type: SectionType;
    title: string;
    isVisible: boolean;
    sortOrder: number;
}

export interface RecommendedMenu {
    productId: string;
    sortOrder: number;
}
