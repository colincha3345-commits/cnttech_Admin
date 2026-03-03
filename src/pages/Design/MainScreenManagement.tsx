/**
 * 메인화면 관리 페이지
 * 앱 메인화면의 섹션 구성 및 순서를 관리
 */
import { useMainScreens } from '@/hooks/useDesign';
import type { SectionType } from '@/types/design';
import {
  SaveOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  MenuOutlined,
  LayoutOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Badge,
} from '@/components/ui';

const SECTION_TYPE_LABELS: Record<SectionType, string> = {
  banner_carousel: '배너 캐러셀',
  quick_menu: '퀵 메뉴',
  recommended: '추천 메뉴',
  new_menu: '신메뉴',
  event_list: '이벤트 목록',
  notice: '공지사항',
};

export function MainScreenManagement() {
  const { sections, loading, toggleVisibility, moveUp, moveDown, saveConfiguration } = useMainScreens();

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold text-txt-main flex items-center gap-2">
            <LayoutOutlined style={{ fontSize: 18 }} />
            메인화면 섹션 관리
          </h2>
          <Button size="sm" onClick={saveConfiguration} disabled={loading}>
            <SaveOutlined style={{ fontSize: 14, marginRight: 6 }} />
            저장
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-txt-muted mb-4">
            앱 메인화면에 표시되는 섹션의 순서와 노출 여부를 관리합니다.
          </p>

          <div className="space-y-2">
            {sections.map((section, index) => (
              <div
                key={section.id}
                className={`flex items-center gap-3 p-3 rounded-lg border border-border transition-all ${section.isVisible ? 'bg-bg-card' : 'bg-bg-hover opacity-60'
                  }`}
              >
                <MenuOutlined className="text-txt-muted cursor-grab" style={{ fontSize: 16 }} />

                <span className="text-sm font-semibold text-txt-main flex-1">
                  {section.title}
                </span>

                <Badge variant="default">
                  {SECTION_TYPE_LABELS[section.type]}
                </Badge>

                <div className="flex gap-1">
                  <button
                    onClick={() => moveUp(index)}
                    disabled={index === 0 || loading}
                    className="px-2 py-1 rounded border border-border bg-bg-card text-xs hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveDown(index)}
                    disabled={index === sections.length - 1 || loading}
                    className="px-2 py-1 rounded border border-border bg-bg-card text-xs hover:bg-bg-hover disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ▼
                  </button>
                </div>

                <button
                  onClick={() => toggleVisibility(section.id)}
                  disabled={loading}
                  className={`px-2 py-1 rounded text-sm cursor-pointer ${section.isVisible
                    ? 'bg-primary/10 text-primary'
                    : 'bg-bg-hover text-txt-muted'
                    }`}
                  title={section.isVisible ? '숨기기' : '보이기'}
                >
                  {section.isVisible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
