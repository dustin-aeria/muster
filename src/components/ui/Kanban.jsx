import React, { useState, useRef, createContext, useContext } from 'react';
import { cn } from '../../lib/utils';
import {
  Plus,
  MoreHorizontal,
  GripVertical,
  X,
  Edit,
  Trash2,
  Archive,
  Clock,
  User,
  Tag,
  MessageSquare,
  Paperclip,
  CheckSquare,
} from 'lucide-react';

/**
 * Batch 118: Kanban Component
 *
 * Kanban board components for task management.
 *
 * Exports:
 * - KanbanBoard: Main kanban board container
 * - KanbanColumn: Column/list container
 * - KanbanCard: Task card
 * - KanbanColumnHeader: Column header
 * - KanbanAddCard: Add new card button
 * - KanbanCardDetail: Card detail modal
 * - SimpleKanban: Pre-configured simple board
 */

// ============================================================================
// KANBAN CONTEXT
// ============================================================================
const KanbanContext = createContext({
  onDragStart: () => {},
  onDragEnd: () => {},
  onDragOver: () => {},
  draggingCard: null,
  draggingColumn: null,
});

export const useKanban = () => useContext(KanbanContext);

// ============================================================================
// KANBAN BOARD - Main kanban board container
// ============================================================================
export function KanbanBoard({
  children,
  columns = [],
  onColumnMove,
  onCardMove,
  onCardClick,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  className,
  ...props
}) {
  const [draggingCard, setDraggingCard] = useState(null);
  const [draggingColumn, setDraggingColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragStart = (type, data, e) => {
    e.dataTransfer.effectAllowed = 'move';
    if (type === 'card') {
      setDraggingCard(data);
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'card', data }));
    } else {
      setDraggingColumn(data);
      e.dataTransfer.setData('application/json', JSON.stringify({ type: 'column', data }));
    }
  };

  const handleDragEnd = () => {
    setDraggingCard(null);
    setDraggingColumn(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (columnId, e) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDrop = (targetColumnId, targetIndex, e) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('application/json'));

    if (data.type === 'card') {
      onCardMove?.(data.data.cardId, data.data.sourceColumnId, targetColumnId, targetIndex);
    } else if (data.type === 'column') {
      onColumnMove?.(data.data.columnId, targetIndex);
    }

    handleDragEnd();
  };

  const renderColumn = (column, index) => (
    <KanbanColumn
      key={column.id}
      id={column.id}
      title={column.title}
      count={column.cards?.length || 0}
      color={column.color}
      index={index}
      isDragOver={dragOverColumn === column.id}
      onDragOver={(e) => handleDragOver(column.id, e)}
      onDrop={(e) => handleDrop(column.id, null, e)}
      onEdit={() => onEditColumn?.(column)}
      onDelete={() => onDeleteColumn?.(column.id)}
      onAddCard={() => onAddCard?.(column.id)}
      onDragStart={(e) => handleDragStart('column', { columnId: column.id }, e)}
    >
      {column.cards?.map((card, cardIndex) => (
        <KanbanCard
          key={card.id}
          {...card}
          columnId={column.id}
          index={cardIndex}
          isDragging={draggingCard?.cardId === card.id}
          onClick={() => onCardClick?.(card, column)}
          onDragStart={(e) => handleDragStart('card', { cardId: card.id, sourceColumnId: column.id }, e)}
        />
      ))}
    </KanbanColumn>
  );

  return (
    <KanbanContext.Provider
      value={{
        onDragStart: handleDragStart,
        onDragEnd: handleDragEnd,
        onDragOver: handleDragOver,
        draggingCard,
        draggingColumn,
      }}
    >
      <div
        className={cn(
          'flex gap-4 overflow-x-auto pb-4 min-h-[500px]',
          className
        )}
        {...props}
      >
        {columns ? columns.map(renderColumn) : children}
      </div>
    </KanbanContext.Provider>
  );
}

// ============================================================================
// KANBAN COLUMN - Column/list container
// ============================================================================
export function KanbanColumn({
  children,
  id,
  title,
  count = 0,
  color,
  index,
  isDragOver = false,
  onDragOver,
  onDrop,
  onEdit,
  onDelete,
  onAddCard,
  onDragStart,
  draggable = true,
  className,
  ...props
}) {
  const { onDragEnd } = useKanban();

  return (
    <div
      className={cn(
        'flex-shrink-0 w-72 bg-gray-100 dark:bg-gray-800 rounded-lg flex flex-col',
        isDragOver && 'ring-2 ring-blue-500',
        className
      )}
      onDragOver={onDragOver}
      onDrop={onDrop}
      {...props}
    >
      <KanbanColumnHeader
        title={title}
        count={count}
        color={color}
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onEdit={onEdit}
        onDelete={onDelete}
      />

      <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        {children}
      </div>

      {onAddCard && (
        <KanbanAddCard onClick={onAddCard} />
      )}
    </div>
  );
}

// ============================================================================
// KANBAN COLUMN HEADER
// ============================================================================
export function KanbanColumnHeader({
  title,
  count = 0,
  color,
  draggable = true,
  onDragStart,
  onDragEnd,
  onEdit,
  onDelete,
  className,
  ...props
}) {
  const [showMenu, setShowMenu] = useState(false);

  const colorClasses = {
    gray: 'bg-gray-500',
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 border-b border-gray-200 dark:border-gray-700',
        draggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      {...props}
    >
      {draggable && (
        <GripVertical className="w-4 h-4 text-gray-400" />
      )}

      {color && (
        <div className={cn('w-3 h-3 rounded-full', colorClasses[color] || color)} />
      )}

      <h3 className="flex-1 font-medium text-gray-900 dark:text-white truncate">
        {title}
      </h3>

      <span className="text-sm text-gray-500 dark:text-gray-400">
        {count}
      </span>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              {onEdit && (
                <button
                  type="button"
                  onClick={() => {
                    onEdit();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// KANBAN CARD - Task card
// ============================================================================
export function KanbanCard({
  id,
  title,
  description,
  labels = [],
  assignees = [],
  dueDate,
  comments = 0,
  attachments = 0,
  checklist,
  priority,
  cover,
  columnId,
  index,
  isDragging = false,
  onClick,
  onDragStart,
  className,
  ...props
}) {
  const { onDragEnd } = useKanban();

  const priorityClasses = {
    low: 'border-l-green-500',
    medium: 'border-l-yellow-500',
    high: 'border-l-orange-500',
    urgent: 'border-l-red-500',
  };

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-shadow',
        priority && 'border-l-4',
        priority && priorityClasses[priority],
        isDragging && 'opacity-50',
        className
      )}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      {...props}
    >
      {cover && (
        <img
          src={cover}
          alt=""
          className="w-full h-32 object-cover rounded-t-lg"
        />
      )}

      <div className="p-3 space-y-2">
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {labels.map((label, i) => (
              <span
                key={i}
                className={cn(
                  'px-2 py-0.5 text-xs font-medium rounded',
                  label.color || 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                )}
              >
                {label.text || label}
              </span>
            ))}
          </div>
        )}

        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </h4>

        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {dueDate && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {dueDate}
              </span>
            )}
            {comments > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {comments}
              </span>
            )}
            {attachments > 0 && (
              <span className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                {attachments}
              </span>
            )}
            {checklist && (
              <span className="flex items-center gap-1">
                <CheckSquare className="w-3 h-3" />
                {checklist.completed}/{checklist.total}
              </span>
            )}
          </div>

          {assignees.length > 0 && (
            <div className="flex -space-x-2">
              {assignees.slice(0, 3).map((assignee, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 overflow-hidden"
                  title={assignee.name}
                >
                  {assignee.avatar ? (
                    <img src={assignee.avatar} alt={assignee.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs font-medium">
                      {assignee.name?.charAt(0)}
                    </div>
                  )}
                </div>
              ))}
              {assignees.length > 3 && (
                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                  +{assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KANBAN ADD CARD - Add new card button
// ============================================================================
export function KanbanAddCard({
  onClick,
  placeholder = 'Add a card',
  className,
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors',
        className
      )}
      {...props}
    >
      <Plus className="w-4 h-4" />
      {placeholder}
    </button>
  );
}

// ============================================================================
// KANBAN CARD DETAIL - Card detail modal
// ============================================================================
export function KanbanCardDetail({
  card,
  column,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onMove,
  columns = [],
  className,
  ...props
}) {
  if (!isOpen || !card) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed top-[10%] left-1/2 -translate-x-1/2 w-full max-w-2xl max-h-[80vh] bg-white dark:bg-gray-900 rounded-xl shadow-xl z-50 overflow-hidden',
          className
        )}
        {...props}
      >
        {card.cover && (
          <div className="relative h-40">
            <img src={card.cover} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {card.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                in list <strong>{column?.title}</strong>
              </p>
            </div>
            {!card.cover && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-6">
              {card.labels?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Labels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {card.labels.map((label, i) => (
                      <span
                        key={i}
                        className={cn(
                          'px-3 py-1 text-sm font-medium rounded',
                          label.color || 'bg-blue-100 text-blue-700'
                        )}
                      >
                        {label.text || label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {card.description || 'No description'}
                </p>
              </div>

              {card.checklist && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Checklist
                  </h3>
                  <div className="space-y-2">
                    {card.checklist.items?.map((item, i) => (
                      <label key={i} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {}}
                          className="rounded border-gray-300"
                        />
                        <span className={cn(
                          'text-sm',
                          item.completed && 'line-through text-gray-400'
                        )}>
                          {item.text}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {card.assignees?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Assignees
                  </h3>
                  <div className="space-y-2">
                    {card.assignees.map((assignee, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-300 overflow-hidden">
                          {assignee.avatar && (
                            <img src={assignee.avatar} alt={assignee.name} />
                          )}
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {assignee.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {card.dueDate && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {card.dueDate}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Actions
                </h3>
                <select
                  value={column?.id}
                  onChange={(e) => onMove?.(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      Move to {col.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onDelete?.(card.id)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ============================================================================
// SIMPLE KANBAN - Pre-configured simple board
// ============================================================================
export function SimpleKanban({
  initialColumns = [
    { id: 'todo', title: 'To Do', color: 'gray', cards: [] },
    { id: 'in-progress', title: 'In Progress', color: 'blue', cards: [] },
    { id: 'done', title: 'Done', color: 'green', cards: [] },
  ],
  onChange,
  className,
  ...props
}) {
  const [columns, setColumns] = useState(initialColumns);
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);

  const handleCardMove = (cardId, sourceColumnId, targetColumnId, targetIndex) => {
    const newColumns = columns.map((col) => {
      if (col.id === sourceColumnId) {
        return {
          ...col,
          cards: col.cards.filter((card) => card.id !== cardId),
        };
      }
      if (col.id === targetColumnId) {
        const sourceColumn = columns.find((c) => c.id === sourceColumnId);
        const card = sourceColumn?.cards.find((c) => c.id === cardId);
        if (card) {
          const newCards = [...col.cards];
          if (targetIndex !== null) {
            newCards.splice(targetIndex, 0, card);
          } else {
            newCards.push(card);
          }
          return { ...col, cards: newCards };
        }
      }
      return col;
    });

    setColumns(newColumns);
    onChange?.(newColumns);
  };

  const handleAddCard = (columnId) => {
    const title = prompt('Card title:');
    if (!title) return;

    const newColumns = columns.map((col) => {
      if (col.id === columnId) {
        return {
          ...col,
          cards: [
            ...col.cards,
            {
              id: `card-${Date.now()}`,
              title,
            },
          ],
        };
      }
      return col;
    });

    setColumns(newColumns);
    onChange?.(newColumns);
  };

  return (
    <>
      <KanbanBoard
        columns={columns}
        onCardMove={handleCardMove}
        onAddCard={handleAddCard}
        onCardClick={(card, column) => {
          setSelectedCard(card);
          setSelectedColumn(column);
        }}
        className={className}
        {...props}
      />

      <KanbanCardDetail
        card={selectedCard}
        column={selectedColumn}
        columns={columns}
        isOpen={!!selectedCard}
        onClose={() => {
          setSelectedCard(null);
          setSelectedColumn(null);
        }}
        onMove={(targetColumnId) => {
          if (selectedCard && selectedColumn) {
            handleCardMove(selectedCard.id, selectedColumn.id, targetColumnId, null);
            setSelectedCard(null);
            setSelectedColumn(null);
          }
        }}
        onDelete={(cardId) => {
          const newColumns = columns.map((col) => ({
            ...col,
            cards: col.cards.filter((card) => card.id !== cardId),
          }));
          setColumns(newColumns);
          onChange?.(newColumns);
          setSelectedCard(null);
          setSelectedColumn(null);
        }}
      />
    </>
  );
}

export default KanbanBoard;
