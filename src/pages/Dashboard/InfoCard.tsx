import { ArrowRightOutlined } from '@ant-design/icons';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatItem } from './StatItem';

interface InfoCardProps {
  title: string;
  stats: {
    label: string;
    value: string | number;
  }[];
  buttonText: string;
  onButtonClick: () => void;
}

export function InfoCard({ title, stats, buttonText, onButtonClick }: InfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-txt-main">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {stats.map((stat) => (
            <StatItem key={stat.label} label={stat.label} value={stat.value} />
          ))}
        </div>
        <Button variant="ghost" className="w-full justify-between" onClick={onButtonClick}>
          {buttonText}
          <ArrowRightOutlined style={{ fontSize: 14 }} />
        </Button>
      </CardContent>
    </Card>
  );
}
