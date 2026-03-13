import { useState, useMemo } from 'react';
import {
    SearchOutlined,
    BellOutlined,
    HistoryOutlined,
    WarningOutlined,
    ExclamationCircleOutlined,
    FilterOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';

import {
    Card,
    CardContent,
    Button,
    Badge,
    SearchInput,
    Modal,
    DataTable,
    Pagination,
    Tooltip,
} from '@/components/ui';
import { usePageViewLog } from '@/hooks/useActivityLog';
import { useAuditLogs, useAuditAlarmConfig } from '@/hooks/useAuditLogs';
import type { AuditLogEntry, AuditAlarmConfig, AuditAction, ChangedField } from '@/types/audit';
import { ACTION_DISPLAY_NAMES } from '@/types/audit';

// 액션 필터 그룹
const ACTION_FILTER_GROUPS: { label: string; actions: AuditAction[] }[] = [
    {
        label: '인증',
        actions: ['LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'MFA_VERIFIED', 'MFA_FAILED', 'PASSWORD_CHANGED', 'SESSION_EXPIRED'],
    },
    {
        label: 'CRUD',
        actions: ['RECORD_CREATED', 'RECORD_UPDATED', 'RECORD_DELETED', 'RECORD_STATUS_CHANGE', 'BULK_ACTION'],
    },
    {
        label: '데이터',
        actions: ['UNMASK_DATA', 'DATA_EXPORT', 'DATA_DOWNLOAD', 'DOWNLOAD_HISTORY_VIEW', 'PAGE_VIEW'],
    },
    {
        label: '사용자/권한',
        actions: ['USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_STATUS_CHANGE', 'PERMISSION_CHANGED'],
    },
    {
        label: '기타',
        actions: ['SETTINGS_CHANGED', 'ACCESS_DENIED', 'ACCESS_ATTEMPT'],
    },
];

export function AuditLogList() {
    usePageViewLog('audit-logs');
    const [searchUserId, setSearchUserId] = useState('');
    const [actionFilter, setActionFilter] = useState<AuditAction[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [page, setPage] = useState(1);
    const limit = 20;

    // 상세 모달
    const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

    // Alarm settings
    const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
    const [localAlarmConfig, setLocalAlarmConfig] = useState<AuditAlarmConfig | null>(null);
    const currentAdminId = 'admin-1';

    // react-query hooks
    const { logs, pagination, isLoading, fetchLogs } = useAuditLogs();
    const { alarmConfig, updateAlarmConfig } = useAuditAlarmConfig(currentAdminId);

    const handleSearch = () => {
        setPage(1);
        fetchLogs({
            userId: searchUserId || undefined,
            action: actionFilter.length > 0 ? actionFilter : undefined,
            page: 1,
            limit,
        });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        fetchLogs({
            userId: searchUserId || undefined,
            action: actionFilter.length > 0 ? actionFilter : undefined,
            page: newPage,
            limit,
        });
    };

    const toggleActionFilter = (action: AuditAction) => {
        setActionFilter(prev => {
            const next = prev.includes(action) ? prev.filter(a => a !== action) : [...prev, action];
            setPage(1);
            fetchLogs({
                userId: searchUserId || undefined,
                action: next.length > 0 ? next : undefined,
                page: 1,
                limit,
            });
            return next;
        });
    };

    const clearActionFilter = () => {
        setActionFilter([]);
        setPage(1);
        fetchLogs({
            userId: searchUserId || undefined,
            page: 1,
            limit,
        });
    };

    const openAlarmModal = () => {
        setLocalAlarmConfig(alarmConfig ? { ...alarmConfig } : null);
        setIsAlarmModalOpen(true);
    };

    const handleSaveAlarmConfig = () => {
        if (!localAlarmConfig) return;
        updateAlarmConfig(localAlarmConfig);
        setIsAlarmModalOpen(false);
    };

    const toggleMonitoredAction = (action: AuditAction) => {
        if (!localAlarmConfig) return;
        setLocalAlarmConfig(prev => {
            if (!prev) return prev;
            const exists = prev.monitoredActions.includes(action);
            return {
                ...prev,
                monitoredActions: exists
                    ? prev.monitoredActions.filter(a => a !== action)
                    : [...prev.monitoredActions, action]
            };
        });
    };

    const stats = useMemo(() => ({
        total: pagination?.total ?? 0,
    }), [pagination]);

    const allActions = Object.keys(ACTION_DISPLAY_NAMES) as AuditAction[];

    return (
        <div className="space-y-6 px-4 py-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">감사 로그</h1>
                <Button variant="outline" onClick={openAlarmModal}>
                    <span className="flex items-center gap-2">
                        <BellOutlined className="text-blue-500" /> 알림 설정
                    </span>
                </Button>
            </div>

            {/* 통계 요약 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">전체 로그 건수</p>
                                <h3 className="text-2xl font-bold text-blue-900 font-mono">
                                    {stats.total.toLocaleString()}건
                                </h3>
                            </div>
                            <HistoryOutlined style={{ fontSize: 32 }} className="text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Tooltip content="로그인 실패, 마스킹 해제, 비밀번호 변경, 사용자 상태 변경, 데이터 삭제 등 주의가 필요한 행위" position="bottom">
                                    <p className="text-sm font-medium text-orange-600 mb-1 border-b border-dashed border-orange-300">주의 단계 (Warning)</p>
                                </Tooltip>
                                <h3 className="text-2xl font-bold text-orange-900 font-mono">-</h3>
                            </div>
                            <WarningOutlined style={{ fontSize: 32 }} className="text-orange-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Tooltip content="사용자 삭제, 권한 변경, 접근 거부 등 보안 사고 가능성이 높은 행위" position="bottom">
                                    <p className="text-sm font-medium text-red-600 mb-1 border-b border-dashed border-red-300">심각 단계 (Critical)</p>
                                </Tooltip>
                                <h3 className="text-2xl font-bold text-red-900 font-mono">-</h3>
                            </div>
                            <ExclamationCircleOutlined style={{ fontSize: 32 }} className="text-red-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 검색 필터 */}
            <Card>
                <CardContent className="p-4 space-y-3">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-1">수정자 ID</label>
                            <SearchInput
                                placeholder="관리자 계정 ID를 입력하세요"
                                value={searchUserId}
                                onChange={(val) => setSearchUserId(val)}
                                onSearch={handleSearch}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="h-10"
                            >
                                <FilterOutlined /> 액션 필터
                                {actionFilter.length > 0 && (
                                    <Badge variant="info" className="ml-1">{actionFilter.length}</Badge>
                                )}
                            </Button>
                            <Button variant="primary" onClick={handleSearch} className="h-10">
                                <SearchOutlined /> 조회
                            </Button>
                        </div>
                    </div>

                    {/* 액션 필터 패널 */}
                    {showFilters && (
                        <div className="border-t border-border pt-3 space-y-2">
                            {ACTION_FILTER_GROUPS.map(group => (
                                <div key={group.label} className="flex items-start gap-2">
                                    <span className="text-xs font-medium text-txt-muted w-20 pt-1.5 flex-shrink-0">{group.label}</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {group.actions.map(action => (
                                            <button
                                                key={action}
                                                onClick={() => toggleActionFilter(action)}
                                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                                    actionFilter.includes(action)
                                                        ? 'bg-primary text-white'
                                                        : 'bg-bg-muted text-txt-muted hover:bg-bg-hover'
                                                }`}
                                            >
                                                {ACTION_DISPLAY_NAMES[action]}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {actionFilter.length > 0 && (
                                <button
                                    onClick={clearActionFilter}
                                    className="text-xs text-danger hover:underline"
                                >
                                    필터 초기화
                                </button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 로그 테이블 */}
            <Card className="overflow-hidden">
                <DataTable<AuditLogEntry>
                    columns={[
                        {
                            key: 'createdAt',
                            header: '발생 시각',
                            render: (item) => (
                                <span className="text-sm text-txt-main whitespace-nowrap">
                                    {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                                </span>
                            ),
                        },
                        {
                            key: 'userName',
                            header: '수정자 ID',
                            render: (item) => (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                        {(item.userName ?? item.userId).charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-txt-main truncate max-w-[140px]" title={item.userName ?? item.userId}>
                                        {item.userName ?? item.userId}
                                    </span>
                                </div>
                            ),
                        },
                        {
                            key: 'action',
                            header: '행위',
                            render: (item) => (
                                <Badge
                                    variant={
                                        item.severity === 'critical' ? 'critical' :
                                            item.severity === 'warning' ? 'warning' : 'info'
                                    }
                                >
                                    {ACTION_DISPLAY_NAMES[item.action] || item.action}
                                </Badge>
                            ),
                        },
                        {
                            key: 'pagePath',
                            header: '페이지 경로',
                            render: (item) => (
                                <span className="px-2 py-1 bg-bg-muted rounded text-xs text-txt-main font-mono border border-border">
                                    {item.pagePath ?? '-'}
                                </span>
                            ),
                        },
                        {
                            key: 'resource',
                            header: '대상 리소스',
                            render: (item) => (
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm text-txt-main font-mono">{item.resource}</span>
                                    {item.details && typeof item.details === 'object' && 'targetName' in item.details && (
                                        <span className="text-xs text-txt-muted">{String(item.details.targetName)}</span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: 'changedFields',
                            header: '수정 항목',
                            render: (item) => (
                                <ChangedFieldsBadges fields={item.changedFields} onClickDetail={() => setSelectedLog(item)} />
                            ),
                        },
                        {
                            key: 'ipAddress',
                            header: 'IP',
                            className: 'text-right',
                            render: (item) => <span className="text-xs text-txt-muted font-mono">{item.ipAddress}</span>,
                        },
                    ]}
                    data={logs}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    emptyMessage="로그가 존재하지 않습니다."
                />
                {pagination && pagination.totalPages > 0 && (
                    <div className="border-t">
                        <Pagination
                            page={page}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                            totalElements={pagination.total}
                            limit={limit}
                            unit="건"
                        />
                    </div>
                )}
            </Card>

            {/* 상세 모달 */}
            {selectedLog && (
                <Modal
                    isOpen={!!selectedLog}
                    onClose={() => setSelectedLog(null)}
                    title="감사 로그 상세"
                >
                    <div className="space-y-4 py-2 text-sm">
                        <DetailRow label="발생 시각" value={format(new Date(selectedLog.createdAt), 'yyyy-MM-dd HH:mm:ss')} />
                        <DetailRow label="수정자 ID" value={selectedLog.userName ?? selectedLog.userId} />
                        <DetailRow label="행위" value={ACTION_DISPLAY_NAMES[selectedLog.action]} />
                        <DetailRow label="페이지 경로" value={selectedLog.pagePath ?? '-'} mono />
                        <DetailRow label="대상 리소스" value={selectedLog.resource} mono />
                        <DetailRow label="접속 IP" value={selectedLog.ipAddress} mono />

                        {selectedLog.changedFields && selectedLog.changedFields.length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-txt-muted mb-2">수정 항목</p>
                                <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                                    <thead>
                                        <tr className="bg-bg-muted">
                                            <th className="text-left px-3 py-2 text-xs font-medium text-txt-muted">항목</th>
                                            <th className="text-left px-3 py-2 text-xs font-medium text-txt-muted">변경 전</th>
                                            <th className="text-left px-3 py-2 text-xs font-medium text-txt-muted">변경 후</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedLog.changedFields.map((cf, idx) => (
                                            <tr key={idx} className="border-t border-border">
                                                <td className="px-3 py-2 font-medium">{cf.label}</td>
                                                <td className="px-3 py-2 text-txt-muted line-through">{cf.before ?? '-'}</td>
                                                <td className="px-3 py-2 text-primary font-medium">{cf.after ?? '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                            <div>
                                <p className="text-xs font-semibold text-txt-muted mb-1">상세 데이터</p>
                                <pre className="bg-bg-muted rounded-lg p-3 text-xs font-mono text-txt-main overflow-x-auto">
                                    {JSON.stringify(selectedLog.details, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* 알림 설정 모달 */}
            {localAlarmConfig && (
                <Modal
                    isOpen={isAlarmModalOpen}
                    onClose={() => setIsAlarmModalOpen(false)}
                    title="보안 알림 설정"
                    footer={
                        <>
                            <Button variant="secondary" onClick={() => setIsAlarmModalOpen(false)}>
                                취소
                            </Button>
                            <Button variant="primary" onClick={handleSaveAlarmConfig}>
                                저장하기
                            </Button>
                        </>
                    }
                >
                    <div className="space-y-6 py-4 text-sm text-txt-main">
                        <section>
                            <h4 className="font-semibold mb-3">알림 채널</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-bg-muted transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={localAlarmConfig.receiveEmail}
                                        onChange={(e) => setLocalAlarmConfig({ ...localAlarmConfig, receiveEmail: e.target.checked })}
                                        className="rounded border-border"
                                    />
                                    <span className="font-medium">이메일 수신</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-bg-muted transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={localAlarmConfig.receivePush}
                                        onChange={(e) => setLocalAlarmConfig({ ...localAlarmConfig, receivePush: e.target.checked })}
                                        className="rounded border-border"
                                    />
                                    <span className="font-medium">앱 푸시 알림</span>
                                </label>
                            </div>
                        </section>

                        <section className="border-t border-border pt-6">
                            <h4 className="font-semibold mb-3">모니터링 대상 행위</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {allActions.map(action => (
                                    <label
                                        key={action}
                                        className="flex items-center gap-2 p-2 hover:bg-bg-muted rounded-lg cursor-pointer transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={localAlarmConfig.monitoredActions.includes(action)}
                                            onChange={() => toggleMonitoredAction(action)}
                                            className="rounded border-border"
                                        />
                                        <span>{ACTION_DISPLAY_NAMES[action]}</span>
                                    </label>
                                ))}
                            </div>
                        </section>
                    </div>
                </Modal>
            )}
        </div>
    );
}

/** 수정 항목 뱃지 */
function ChangedFieldsBadges({ fields, onClickDetail }: { fields?: ChangedField[]; onClickDetail: () => void }) {
    if (!fields || fields.length === 0) {
        return <span className="text-xs text-txt-muted">-</span>;
    }

    return (
        <button onClick={onClickDetail} className="flex flex-wrap gap-1 text-left hover:opacity-80">
            {fields.slice(0, 3).map((cf, idx) => (
                <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[11px] font-medium">
                    {cf.label}
                </span>
            ))}
            {fields.length > 3 && (
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[11px]">
                    +{fields.length - 3}
                </span>
            )}
        </button>
    );
}

/** 상세 모달 행 */
function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
    return (
        <div className="flex gap-4">
            <span className="text-xs font-semibold text-txt-muted w-24 flex-shrink-0">{label}</span>
            <span className={`text-sm text-txt-main ${mono ? 'font-mono' : ''}`}>{value}</span>
        </div>
    );
}
