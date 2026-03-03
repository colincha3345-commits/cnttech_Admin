import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  CloseOutlined,
  HolderOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type { OptionGroup } from '@/types/product';
import { Badge } from './Badge';

interface OptionGroupSelectorProps {
  optionGroups: OptionGroup[];
  selectedGroupIds: string[];
  onChange: (groupIds: string[]) => void;
  disabled?: boolean;
}

/** 드래그 가능한 선택된 옵션 그룹 아이템 */
const SortableGroupItem: React.FC<{
  group: OptionGroup;
  disabled: boolean;
  onRemove: (id: string) => void;
}> = ({ group, disabled, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: group.id,
    disabled,
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
        flex items-center gap-3 border rounded-lg px-3 py-2.5 bg-white
        ${isDragging ? 'shadow-lg z-50 border-primary' : 'border-border'}
      `}
    >
      {/* 드래그 핸들 */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`
          flex-shrink-0 p-1 rounded transition-colors
          ${disabled ? 'text-txt-disabled cursor-not-allowed' : 'text-txt-muted cursor-grab active:cursor-grabbing hover:bg-hover'}
        `}
        title="드래그하여 순서 변경"
      >
        <HolderOutlined />
      </button>

      {/* 그룹 정보 */}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-sm font-medium text-txt-main truncate">{group.name}</span>
        {group.isRequired ? (
          <Badge variant="critical">필수</Badge>
        ) : (
          <Badge variant="secondary">선택</Badge>
        )}
        {group.items && group.items.length > 0 && (
          <span className="text-xs text-txt-muted">
            {group.items.length}개 아이템
          </span>
        )}
      </div>

      {/* 제거 버튼 */}
      <button
        type="button"
        onClick={() => onRemove(group.id)}
        disabled={disabled}
        className="flex-shrink-0 p-1 text-txt-muted hover:text-critical rounded hover:bg-critical/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="옵션 그룹 제거"
      >
        <CloseOutlined className="text-xs" />
      </button>
    </div>
  );
};

/**
 * 옵션 그룹 선택 컴포넌트
 * 메뉴에 적용할 옵션 그룹을 선택하고 드래그로 노출 순서를 변경합니다
 */
export const OptionGroupSelector: React.FC<OptionGroupSelectorProps> = ({
  optionGroups,
  selectedGroupIds,
  onChange,
  disabled = false,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 선택된 그룹 (배열 순서 유지)
  const selectedGroups = selectedGroupIds
    .map((id) => optionGroups.find((g) => g.id === id))
    .filter((g): g is OptionGroup => g !== undefined);

  // 미선택 그룹
  const availableGroups = optionGroups.filter(
    (g) => !selectedGroupIds.includes(g.id)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedGroupIds.indexOf(String(active.id));
    const newIndex = selectedGroupIds.indexOf(String(over.id));
    onChange(arrayMove(selectedGroupIds, oldIndex, newIndex));
  };

  const handleAdd = (groupId: string) => {
    if (disabled) return;
    onChange([...selectedGroupIds, groupId]);
  };

  const handleRemove = (groupId: string) => {
    if (disabled) return;
    onChange(selectedGroupIds.filter((id) => id !== groupId));
  };

  const handleSelectAll = () => {
    if (disabled) return;
    onChange(optionGroups.map((g) => g.id));
  };

  const handleDeselectAll = () => {
    if (disabled) return;
    onChange([]);
  };

  return (
    <div className="space-y-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-txt-main">옵션 그룹 설정</h3>
          <p className="text-xs text-txt-muted mt-1">
            옵션 그룹을 선택하고 드래그하여 노출 순서를 변경하세요
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSelectAll}
            disabled={disabled || selectedGroupIds.length === optionGroups.length}
            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전체 선택
          </button>
          <span className="text-xs text-border-strong">|</span>
          <button
            type="button"
            onClick={handleDeselectAll}
            disabled={disabled || selectedGroupIds.length === 0}
            className="text-xs text-txt-muted hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            전체 해제
          </button>
        </div>
      </div>

      {/* 옵션 그룹 없음 */}
      {optionGroups.length === 0 && (
        <div className="text-center py-8 border border-border rounded-lg">
          <InfoCircleOutlined className="text-3xl text-txt-muted mb-2" />
          <p className="text-sm text-txt-muted">등록된 옵션 그룹이 없습니다</p>
        </div>
      )}

      {optionGroups.length > 0 && (
        <>
          {/* 적용된 옵션 그룹 (드래그 순서 변경) */}
          <div>
            <h4 className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">
              적용된 옵션 그룹 ({selectedGroups.length}개)
            </h4>
            {selectedGroups.length === 0 ? (
              <div className="py-6 border border-dashed border-border rounded-lg text-center">
                <p className="text-sm text-txt-muted">
                  아래 목록에서 옵션 그룹을 추가하세요
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedGroupIds}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {selectedGroups.map((group) => (
                      <SortableGroupItem
                        key={group.id}
                        group={group}
                        disabled={disabled}
                        onRemove={handleRemove}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* 사용 가능한 옵션 그룹 */}
          {availableGroups.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-txt-muted uppercase tracking-wider mb-2">
                사용 가능한 옵션 그룹 ({availableGroups.length}개)
              </h4>
              <div className="space-y-2">
                {availableGroups.map((group) => (
                  <div
                    key={group.id}
                    className={`
                      flex items-center gap-3 border border-border rounded-lg px-3 py-2.5
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50 hover:bg-hover'}
                      transition-all
                    `}
                    onClick={() => handleAdd(group.id)}
                  >
                    <span className="flex-shrink-0 text-txt-muted">
                      <PlusOutlined />
                    </span>
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <span className="text-sm text-txt-sub truncate">{group.name}</span>
                      {group.isRequired ? (
                        <Badge variant="critical">필수</Badge>
                      ) : (
                        <Badge variant="secondary">선택</Badge>
                      )}
                      {group.items && group.items.length > 0 && (
                        <span className="text-xs text-txt-muted">
                          {group.items.length}개 아이템
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 선택 정보 */}
      {selectedGroupIds.length > 0 && (
        <div className="px-4 py-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-txt-main">
            <span className="font-semibold text-primary">{selectedGroupIds.length}개</span> 옵션
            그룹이 적용되었습니다
          </p>
        </div>
      )}
    </div>
  );
};
