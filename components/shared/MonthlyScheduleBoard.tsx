'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useDroppable } from '@dnd-kit/core';
import { useState } from 'react';
import { GripVertical, BookOpen, Zap } from 'lucide-react';

import { cn } from '@/lib/utils';
import {
  getVPBarColor,
  getVPTextColor,
  getMonthLabel,
} from '@/lib/vp';
import { useLanguage } from '@/lib/i18n';
import type { MonthlyBlock, Topic } from '@/lib/types';
import { VPProgressBar } from './VPProgressBar';

// ─── Helper ───────────────────────────────────────────────────────────────────

function topicKey(t: Topic) {
  return `topic-${t.id}`;
}

function findMonthForTopic(schedule: MonthlyBlock[], key: string): string | null {
  for (const block of schedule) {
    if (block.topics.find((t) => topicKey(t) === key)) return block.month;
  }
  return null;
}

function calcMonthVP(topics: Topic[]) {
  return topics.reduce((s, t) => s + t.vp_allocation, 0);
}

// ─── Split label (language-aware) ────────────────────────────────────────────

function SplitLabel() {
  const { t } = useLanguage();
  return <span className="text-[10px] text-slate-400 mr-1">{t('board_cont')}</span>;
}

// ─── Draggable Topic Card ─────────────────────────────────────────────────────

function TopicCard({ topic, isDragOverlay = false }: { topic: Topic; isDragOverlay?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: topicKey(topic), data: { type: 'topic', topic } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isManual = topic.split_group === 'manual';
  const isSplit = topic.split_part === 2;
  const isCompleted = topic.status === 'completed';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-2 px-2.5 py-2 rounded-lg border text-sm transition-shadow cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40',
        isDragOverlay && 'shadow-xl rotate-1',
        isManual
          ? 'bg-violet-50 border-violet-200 text-violet-800'
          : isCompleted
          ? 'bg-slate-50 border-slate-200 text-slate-500'
          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300 hover:shadow-sm'
      )}
    >
      <span {...attributes} {...listeners} className="text-slate-300 hover:text-slate-400 shrink-0">
        <GripVertical className="w-3.5 h-3.5" />
      </span>

      {isManual ? (
        <Zap className="w-3 h-3 text-violet-400 shrink-0" />
      ) : (
        <BookOpen className="w-3 h-3 text-slate-300 shrink-0" />
      )}

      <span className={cn('flex-1 text-xs leading-snug truncate', isCompleted && 'line-through')}>
        {isSplit && <SplitLabel />}
        {topic.title}
      </span>

      <span
        className={cn(
          'shrink-0 text-[10px] font-bold tabular-nums px-1 py-0.5 rounded',
          isManual
            ? 'bg-violet-100 text-violet-700'
            : 'bg-slate-100 text-slate-500'
        )}
      >
        {topic.vp_allocation} VP
        {topic.original_vp && (
          <span className="font-normal text-slate-400"> / {topic.original_vp}</span>
        )}
      </span>
    </div>
  );
}

// ─── Droppable Month Column ───────────────────────────────────────────────────

function MonthColumn({ block }: { block: MonthlyBlock }) {
  const { lang, t } = useLanguage();
  const topicIds = block.topics.map(topicKey);
  const { setNodeRef, isOver } = useDroppable({ id: `col-${block.month}` });
  const vp = calcMonthVP(block.topics);
  const barColor = getVPBarColor(vp);
  const textColor = getVPTextColor(vp);

  return (
    <div className="flex flex-col min-w-[200px] w-52 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Month header */}
      <div className="p-3 bg-slate-50 border-b border-slate-100">
        <h3 className="text-xs font-semibold text-slate-600 mb-2">{getMonthLabel(block.month, lang)}</h3>
        <VPProgressBar vp={vp} max={10} size="sm" />
        <div className="flex items-center justify-between mt-1">
          <span className={cn('text-[11px] font-bold tabular-nums', textColor)}>
            {vp.toFixed(1)} / 10 VP
          </span>
          <span className="text-[10px] text-slate-400">{block.topics.length}{t('board_topics')}</span>
        </div>
      </div>

      {/* Droppable topic list */}
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-[80px] p-2 space-y-1.5 transition-colors',
          isOver && 'bg-indigo-50/60'
        )}
      >
        <SortableContext items={topicIds} strategy={verticalListSortingStrategy}>
          {block.topics.map((topic) => (
            <TopicCard key={topic.id} topic={topic} />
          ))}
        </SortableContext>

        {block.topics.length === 0 && (
          <div className={cn(
            'flex items-center justify-center h-16 rounded-lg border-2 border-dashed text-xs text-slate-400 transition-colors',
            isOver ? 'border-indigo-300 text-indigo-400 bg-indigo-50' : 'border-slate-200'
          )}>
            {t('board_dragHere')}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────

interface MonthlyScheduleBoardProps {
  schedule: MonthlyBlock[];
  onReorder: (newSchedule: MonthlyBlock[]) => void;
  readOnly?: boolean;
}

export function MonthlyScheduleBoard({ schedule, onReorder, readOnly = false }: MonthlyScheduleBoardProps) {
  const { lang } = useLanguage();
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const activeTopic = activeKey
    ? schedule.flatMap((b) => b.topics).find((t) => topicKey(t) === activeKey) ?? null
    : null;

  function handleDragStart({ active }: DragStartEvent) {
    setActiveKey(active.id as string);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveKey(null);
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const sourceMonth = findMonthForTopic(schedule, activeId);
    if (!sourceMonth) return;

    // Determine target month
    let targetMonth: string;
    if (overId.startsWith('col-')) {
      targetMonth = overId.replace('col-', '');
    } else {
      targetMonth = findMonthForTopic(schedule, overId) ?? sourceMonth;
    }

    const newSchedule = schedule.map((b) => ({ ...b, topics: [...b.topics] }));

    // Remove from source
    const srcBlock = newSchedule.find((b) => b.month === sourceMonth)!;
    const srcIdx = srcBlock.topics.findIndex((t) => topicKey(t) === activeId);
    const [movedTopic] = srcBlock.topics.splice(srcIdx, 1);

    // Insert at target
    const tgtBlock = newSchedule.find((b) => b.month === targetMonth)!;
    if (overId.startsWith('col-')) {
      tgtBlock.topics.push(movedTopic);
    } else {
      const tgtIdx = tgtBlock.topics.findIndex((t) => topicKey(t) === overId);
      tgtBlock.topics.splice(tgtIdx === -1 ? tgtBlock.topics.length : tgtIdx, 0, movedTopic);
    }

    onReorder(newSchedule);
  }

  if (readOnly) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {schedule.map((block) => (
          <div key={block.month} className="flex flex-col min-w-[200px] w-52 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-3 bg-slate-50 border-b border-slate-100">
              <h3 className="text-xs font-semibold text-slate-600 mb-2">{getMonthLabel(block.month, lang)}</h3>
              <VPProgressBar vp={calcMonthVP(block.topics)} max={10} size="sm" showLabel />
            </div>
            <div className="flex-1 p-2 space-y-1.5">
              {block.topics.map((topic) => (
                <div key={topic.id} className={cn(
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs',
                  topic.status === 'completed' ? 'bg-slate-50 border-slate-200 text-slate-400' : 'bg-white border-slate-200 text-slate-700'
                )}>
                  <BookOpen className="w-3 h-3 text-slate-300 shrink-0" />
                  <span className={cn('flex-1 truncate', topic.status === 'completed' && 'line-through')}>{topic.title}</span>
                  <span className="text-[10px] font-bold text-slate-400">{topic.vp_allocation} VP</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {schedule.map((block) => (
          <MonthColumn key={block.month} block={block} />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTopic && <TopicCard topic={activeTopic} isDragOverlay />}
      </DragOverlay>
    </DndContext>
  );
}
