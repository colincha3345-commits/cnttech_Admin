import { useState, type ReactNode } from 'react';
import { DownOutlined } from '@ant-design/icons';
import { clsx } from 'clsx';

export interface AccordionItemData {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItemData[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
  className?: string;
}

interface AccordionItemProps {
  item: AccordionItemData;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ item, isOpen, onToggle }: AccordionItemProps) {
  return (
    <div
      className={clsx(
        'flex flex-col bg-white',
        isOpen ? 'pb-4' : ''
      )}
      style={{
        boxShadow: 'inset 0px -1px 0px #E2E8F0',
      }}
    >
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-left hover:opacity-80 transition-opacity"
        aria-expanded={isOpen}
      >
        <span className="flex-1 text-base font-medium leading-6 text-txt-main">
          {item.title}
        </span>
        <DownOutlined
          style={{
            fontSize: 16,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(-180deg)' : 'rotate(0deg)',
          }}
          className="text-txt-main"
        />
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="text-sm leading-5 text-txt-main animate-fadeIn">
          {item.content}
        </div>
      )}
    </div>
  );
}

/**
 * Accordion 컴포넌트
 * WAI-ARIA 디자인 패턴을 준수하는 접근성 친화적인 아코디언
 */
export function Accordion({
  items,
  defaultOpenId,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const [openIds, setOpenIds] = useState<Set<string>>(
    defaultOpenId ? new Set([defaultOpenId]) : new Set()
  );

  const handleToggle = (id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);

      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }

      return newSet;
    });
  };

  return (
    <div className={clsx('flex flex-col bg-white p-6', className)}>
      {items.map((item) => (
        <AccordionItem
          key={item.id}
          item={item}
          isOpen={openIds.has(item.id)}
          onToggle={() => handleToggle(item.id)}
        />
      ))}
    </div>
  );
}
