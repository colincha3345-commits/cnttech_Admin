/**
 * 관리자 알림 패널
 * 헤더 벨 아이콘 클릭 시 드롭다운으로 표시
 */
import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BellOutlined,
  CheckOutlined,
  DeleteOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  SettingOutlined,
  NotificationOutlined,
  WarningOutlined,
} from '@ant-design/icons';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui';

/** 알림 타입 */
type AdminNotificationType = 'order' | 'member' | 'system' | 'push' | 'warning';

interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

const NOTIFICATION_ICONS: Record<AdminNotificationType, React.ReactNode> = {
  order: <ShoppingCartOutlined style={{ fontSize: 16 }} />,
  member: <TeamOutlined style={{ fontSize: 16 }} />,
  system: <SettingOutlined style={{ fontSize: 16 }} />,
  push: <NotificationOutlined style={{ fontSize: 16 }} />,
  warning: <WarningOutlined style={{ fontSize: 16 }} />,
};

const NOTIFICATION_COLORS: Record<AdminNotificationType, string> = {
  order: 'bg-blue-50 text-blue-600',
  member: 'bg-green-50 text-green-600',
  system: 'bg-gray-50 text-gray-600',
  push: 'bg-purple-50 text-purple-600',
  warning: 'bg-orange-50 text-orange-600',
};

/** Mock 알림 데이터 */
const MOCK_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'noti-1',
    type: 'order',
    title: '신규 주문 접수',
    message: '주문 #ORD-2026-0312 이(가) 접수되었습니다.',
    isRead: false,
    createdAt: '2026-02-25T14:30:00Z',
    link: '/orders',
  },
  {
    id: 'noti-2',
    type: 'member',
    title: '신규 회원 가입',
    message: '김민수님이 앱 회원으로 가입했습니다.',
    isRead: false,
    createdAt: '2026-02-25T13:15:00Z',
    link: '/app-members',
  },
  {
    id: 'noti-3',
    type: 'warning',
    title: '재고 부족 경고',
    message: '"뿌링클" 메뉴의 재고가 10개 미만입니다.',
    isRead: false,
    createdAt: '2026-02-25T12:00:00Z',
    link: '/menu/products',
  },
  {
    id: 'noti-4',
    type: 'push',
    title: '푸시 발송 완료',
    message: '"신메뉴 출시 안내" 푸시가 15,420명에게 발송되었습니다.',
    isRead: true,
    createdAt: '2026-02-25T10:00:00Z',
    link: '/marketing/push',
  },
  {
    id: 'noti-5',
    type: 'system',
    title: '시스템 업데이트',
    message: '관리자 대시보드 v2.1.0 업데이트가 적용되었습니다.',
    isRead: true,
    createdAt: '2026-02-24T18:00:00Z',
  },
  {
    id: 'noti-6',
    type: 'order',
    title: '주문 취소 요청',
    message: '주문 #ORD-2026-0298 취소 요청이 접수되었습니다.',
    isRead: true,
    createdAt: '2026-02-24T15:30:00Z',
    link: '/orders',
  },
];

function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

/**
 * 내부 경로 화이트리스트 검증
 * - 반드시 /로 시작하는 상대 경로이어야 함 (javascript:, http://, // 등 차단)
 * - 외부 URL, 프로토콜 리다이렉트, Open Redirect 방지
 */
function isSafeInternalPath(link: string): boolean {
  return typeof link === 'string' && /^\/[a-zA-Z0-9\-_/]*$/.test(link);
}

export function NotificationPanel() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative inline-block" ref={panelRef}>
      {/* 벨 아이콘 트리거 */}
      <Button
        variant="ghost"
        className="btn-icon relative"
        aria-label="알림"
        onClick={() => setIsOpen(!isOpen)}
      >
        <BellOutlined style={{ fontSize: 20 }} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-critical text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* 알림 패널 */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-[380px] max-h-[480px] rounded-xl bg-white border border-border shadow-lg animate-fadeIn flex flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-txt-main">알림</span>
              {unreadCount > 0 && (
                <Badge variant="critical">{unreadCount}</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                모두 읽음
              </button>
            )}
          </div>

          {/* 알림 목록 */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-txt-muted">
                <BellOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <p className="text-sm">알림이 없습니다.</p>
              </div>
            ) : (
              notifications.map((noti) => (
                <div
                  key={noti.id}
                  className={`group flex gap-3 px-4 py-3 border-b border-border/50 hover:bg-bg-hover transition-colors cursor-pointer ${!noti.isRead ? 'bg-blue-50/30' : ''
                    }`}
                  onClick={() => {
                    handleMarkRead(noti.id);
                    if (noti.link && isSafeInternalPath(noti.link)) {
                      setIsOpen(false);
                      navigate(noti.link);
                    }
                  }}
                >
                  {/* 아이콘 */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${NOTIFICATION_COLORS[noti.type]}`}>
                    {NOTIFICATION_ICONS[noti.type]}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm truncate ${!noti.isRead ? 'font-semibold text-txt-main' : 'text-txt-sub'}`}>
                        {noti.title}
                      </p>
                      {!noti.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 mt-1.5 bg-primary rounded-full" />
                      )}
                    </div>
                    <p className="text-xs text-txt-muted mt-0.5 truncate">{noti.message}</p>
                    <p className="text-[11px] text-txt-muted mt-1">{formatTimeAgo(noti.createdAt)}</p>
                  </div>

                  {/* 액션 버튼 (hover) */}
                  <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!noti.isRead && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleMarkRead(noti.id); }}
                        className="p-1 text-txt-muted hover:text-primary rounded"
                        title="읽음 처리"
                      >
                        <CheckOutlined style={{ fontSize: 12 }} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(noti.id); }}
                      className="p-1 text-txt-muted hover:text-critical rounded"
                      title="삭제"
                    >
                      <DeleteOutlined style={{ fontSize: 12 }} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
