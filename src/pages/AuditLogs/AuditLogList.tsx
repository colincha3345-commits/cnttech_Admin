import { useState, useEffect, useMemo } from 'react';
import {
    SearchOutlined,
    BellOutlined,
    HistoryOutlined,
    WarningOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';

import {
    Card,
    CardContent,
    Button,
    Badge,
    SearchInput,
    Modal,
    DataTable
} from '@/components/ui';
import { auditService } from '@/services/auditService';
import { usePageViewLog } from '@/hooks/useActivityLog';
import type { AuditLogEntry, AuditAlarmConfig, AuditAction } from '@/types/audit';
import { ACTION_DISPLAY_NAMES } from '@/types/audit';

export function AuditLogList() {
    usePageViewLog('audit-logs');
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchUserId, setSearchUserId] = useState('');

    // Alarm settings state
    const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false);
    const [alarmConfig, setAlarmConfig] = useState<AuditAlarmConfig | null>(null);

    const currentAdminId = 'admin-1';

    useEffect(() => {
        loadLogs();
        loadAlarmConfig();
    }, []);

    const loadLogs = async (userIdFilter?: string) => {
        setIsLoading(true);
        try {
            const res = await auditService.getLogs(userIdFilter ? { userId: userIdFilter } : {});
            setLogs(res.data);
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadAlarmConfig = async () => {
        try {
            const res = await auditService.getAlarmConfig(currentAdminId);
            setAlarmConfig(res.data);
        } catch (error) {
            console.error('Failed to load alarm config', error);
        }
    };

    const handleSearch = () => {
        loadLogs(searchUserId);
    };

    const handleSaveAlarmConfig = async () => {
        if (!alarmConfig) return;
        try {
            await auditService.updateAlarmConfig(currentAdminId, alarmConfig);
            alert('보안 설정이 저장되었습니다.');
            setIsAlarmModalOpen(false);
        } catch (error) {
            console.error('Failed to save alarm config', error);
        }
    };

    const toggleMonitoredAction = (action: AuditAction) => {
        if (!alarmConfig) return;
        setAlarmConfig(prev => {
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

    const stats = useMemo(() => {
        return {
            total: logs.length,
            warning: logs.filter(l => l.severity === 'warning').length,
            critical: logs.filter(l => l.severity === 'critical').length,
        };
    }, [logs]);

    const allActions = Object.keys(ACTION_DISPLAY_NAMES) as AuditAction[];

    return (
        <div className="space-y-6 px-4 py-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">감사 로그</h1>
                <Button variant="outline" onClick={() => setIsAlarmModalOpen(true)}>
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
                                <p className="text-sm font-medium text-orange-600 mb-1">주의 단계 (Warning)</p>
                                <h3 className="text-2xl font-bold text-orange-900 font-mono">
                                    {stats.warning.toLocaleString()}건
                                </h3>
                            </div>
                            <WarningOutlined style={{ fontSize: 32 }} className="text-orange-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-red-50 border-red-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600 mb-1">심각 단계 (Critical)</p>
                                <h3 className="text-2xl font-bold text-red-900 font-mono">
                                    {stats.critical.toLocaleString()}건
                                </h3>
                            </div>
                            <ExclamationCircleOutlined style={{ fontSize: 32 }} className="text-red-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 내부 검색 필터 */}
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">관리자 ID</label>
                        <SearchInput
                            placeholder="관리자 계정 ID를 입력하세요"
                            value={searchUserId}
                            onChange={(val) => setSearchUserId(val)}
                            onSearch={handleSearch}
                        />
                    </div>
                    <div>
                        <Button variant="primary" onClick={handleSearch} className="h-10">
                            <SearchOutlined /> 조회
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* 로그 테이블 */}
            <Card className="overflow-hidden">
                <DataTable<AuditLogEntry>
                    columns={[
                        {
                            key: 'createdAt',
                            header: '발생 시각',
                            render: (item) => <span className="text-sm text-txt-main">{format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm:ss')}</span>,
                        },
                        {
                            key: 'userId',
                            header: '대상 관리자',
                            render: (item) => (
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-primary-light text-primary flex items-center justify-center text-xs font-bold">
                                        {item.userId.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-txt-main">{item.userId}</span>
                                </div>
                            ),
                        },
                        {
                            key: 'action',
                            header: '행위',
                            render: (item) => (
                                <div className="flex flex-col gap-1 items-start">
                                    <Badge
                                        variant={
                                            item.severity === 'critical' ? 'critical' :
                                                item.severity === 'warning' ? 'warning' : 'info'
                                        }
                                    >
                                        {ACTION_DISPLAY_NAMES[item.action] || item.action}
                                    </Badge>
                                    {item.details && (
                                        <span className="text-xs text-txt-muted font-mono truncate max-w-[200px]" title={JSON.stringify(item.details)}>
                                            {JSON.stringify(item.details)}
                                        </span>
                                    )}
                                </div>
                            ),
                        },
                        {
                            key: 'resource',
                            header: '리소스 경로',
                            render: (item) => (
                                <span className="px-2 py-1 bg-bg-muted rounded text-xs text-txt-main font-mono border border-border">
                                    {item.resource}
                                </span>
                            ),
                        },
                        {
                            key: 'ipAddress',
                            header: '접속 IP',
                            className: 'text-right',
                            render: (item) => <span className="text-sm text-txt-muted font-mono">{item.ipAddress}</span>,
                        },
                    ]}
                    data={logs}
                    isLoading={isLoading}
                    keyExtractor={(item) => item.id}
                    emptyMessage="로그가 존재하지 않습니다."
                />
            </Card>

            {/* 알림 설정 모달 */}
            {alarmConfig && (
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
                                        checked={alarmConfig.receiveEmail}
                                        onChange={(e) => setAlarmConfig({ ...alarmConfig, receiveEmail: e.target.checked })}
                                        className="rounded border-border"
                                    />
                                    <span className="font-medium">이메일 수신</span>
                                </label>
                                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-bg-muted transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={alarmConfig.receivePush}
                                        onChange={(e) => setAlarmConfig({ ...alarmConfig, receivePush: e.target.checked })}
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
                                            checked={alarmConfig.monitoredActions.includes(action)}
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
