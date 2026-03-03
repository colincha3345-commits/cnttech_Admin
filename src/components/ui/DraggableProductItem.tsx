import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';
import type { Product } from '@/types/product';

interface DraggableProductItemProps {
  product: Product;
  isSelected: boolean;
  isBulkEditMode: boolean;
  isDraggingMode: boolean;
  onSelect: (product: Product) => void;
  children: React.ReactNode;
}

export const DraggableProductItem: React.FC<DraggableProductItemProps> = ({
  product,
  isSelected,
  isDraggingMode,
  children,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
    disabled: !isDraggingMode, // 드래그 모드일 때만 활성화
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative p-3 rounded-lg border transition-all group
        ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-hover'}
        ${isDragging ? 'shadow-lg z-50' : ''}
      `}
    >
      {/* 드래그 핸들 (드래그 모드일 때만 표시) */}
      {isDraggingMode && (
        <button
          {...attributes}
          {...listeners}
          className="absolute left-2 top-1/2 -translate-y-1/2 p-2 cursor-grab active:cursor-grabbing hover:bg-hover rounded-lg transition-colors"
          title="드래그하여 순서 변경"
        >
          <HolderOutlined className="text-txt-muted" />
        </button>
      )}

      {/* 기존 상품 아이템 컨텐츠 */}
      <div className={isDraggingMode ? 'ml-8' : ''}>
        {children}
      </div>
    </div>
  );
};
