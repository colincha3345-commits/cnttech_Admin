/**
 * ID 축약 표시 컴포넌트
 * 긴 ID(UUID, SNS 연동 등)를 앞 8자리로 축약 표시하고 클릭 시 전체 ID 복사
 */
import { useState } from 'react';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';

interface IdCellProps {
  id: string;
  maxLength?: number;
}

export const IdCell: React.FC<IdCellProps> = ({ id, maxLength = 8 }) => {
  const [copied, setCopied] = useState(false);

  const displayId = id.length > maxLength ? `${id.slice(0, maxLength)}…` : id;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={id}
      className="inline-flex items-center gap-1 font-mono text-xs text-txt-muted hover:text-primary transition-colors cursor-pointer"
    >
      <span>{displayId}</span>
      {copied
        ? <CheckOutlined style={{ fontSize: 11 }} className="text-success" />
        : <CopyOutlined style={{ fontSize: 11 }} />
      }
    </button>
  );
};
