import { format } from 'date-fns';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useRecentLogins } from '@/hooks/useDashboard';
import { ACTION_DISPLAY_NAMES } from '@/types/audit';

export function RecentLogins() {
  const { recentLogins, isLoading } = useRecentLogins(10);

  if (isLoading) {
    return <Spinner layout="fullHeight" />;
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-txt-main">최근 로그인 이력</h2>
      </CardHeader>
      <CardContent>
        {recentLogins.length === 0 ? (
          <p className="text-sm text-txt-muted text-center py-8">로그인 이력이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>사용자 ID</th>
                  <th>활동</th>
                  <th>IP 주소</th>
                  <th>심각도</th>
                  <th className="text-right">일시</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium">{log.userId}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        log.action === 'LOGIN'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {ACTION_DISPLAY_NAMES[log.action]}
                      </span>
                    </td>
                    <td className="font-mono text-sm">{log.ipAddress}</td>
                    <td>
                      <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        log.severity === 'info'
                          ? 'bg-blue-100 text-blue-700'
                          : log.severity === 'warning'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                      }`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="text-right font-mono text-sm">
                      {format(log.createdAt, 'yyyy-MM-dd HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
