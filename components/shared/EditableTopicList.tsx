'use client';

// ─── EditableTopicList ────────────────────────────────────────────────────────
// Reusable per-month topic list with inline complete-toggle and HW-cycle button.
// Shared by Sample A (Progress tab), Sample B (drawer), and Sample C (classroom).
// Renders the month blocks only — the parent supplies the card chrome and heading.

import { CheckCircle2, Circle } from 'lucide-react';
import { VPProgressBar } from './VPProgressBar';
import { useLanguage } from '@/lib/i18n';
import { getMonthLabel } from '@/lib/vp';
import { HW_LABELS, HW_COLORS } from '@/lib/progress';
import { cn } from '@/lib/utils';
import type { MonthlyBlock, HomeworkStatus } from '@/lib/types';

// ── Accent color maps (full static strings — Tailwind needs to see these) ─────

const CHECK_DONE: Record<'indigo' | 'sky' | 'emerald', string> = {
  indigo:  'text-indigo-500 hover:text-slate-400',
  sky:     'text-sky-500 hover:text-slate-400',
  emerald: 'text-emerald-500 hover:text-slate-400',
};

const CHECK_PENDING: Record<'indigo' | 'sky' | 'emerald', string> = {
  indigo:  'text-slate-300 hover:text-indigo-500',
  sky:     'text-slate-300 hover:text-sky-500',
  emerald: 'text-slate-300 hover:text-emerald-500',
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface EditableTopicListProps {
  schedule: MonthlyBlock[];
  onToggleTopic: (topicId: number) => void;
  onCycleHW: (topicId: number, current: HomeworkStatus) => void;
  accent?: 'indigo' | 'sky' | 'emerald';
}

// ── Component ─────────────────────────────────────────────────────────────────

export function EditableTopicList({
  schedule,
  onToggleTopic,
  onCycleHW,
  accent = 'emerald',
}: EditableTopicListProps) {
  const { lang, t } = useLanguage();
  const doneCls    = CHECK_DONE[accent];
  const pendingCls = CHECK_PENDING[accent];

  return (
    <>
      {schedule.map((block) => {
        const blockCompleted = block.topics
          .filter((tp) => tp.status === 'completed')
          .reduce((s, tp) => s + tp.vp_allocation, 0);
        const blockTotal = block.topics.reduce((s, tp) => s + tp.vp_allocation, 0);

        return (
          <div key={block.month} className="mb-4 last:mb-0">
            {/* Month header */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600">
                {getMonthLabel(block.month, lang)}
              </span>
              <div className="flex items-center gap-1.5">
                <VPProgressBar vp={blockCompleted} max={blockTotal} size="sm" className="w-20" />
                <span className="text-[10px] text-slate-400">
                  {blockCompleted.toFixed(1)}/{blockTotal.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Topic rows */}
            <div className="space-y-1">
              {block.topics.map((topic) => {
                const isDone = topic.status === 'completed';
                return (
                  <div
                    key={topic.id}
                    className={cn(
                      'flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs transition-colors',
                      isDone
                        ? 'bg-slate-50 border-slate-100'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    )}
                  >
                    {/* Complete toggle */}
                    <button
                      onClick={() => onToggleTopic(topic.id)}
                      className={cn('shrink-0 transition-colors', isDone ? doneCls : pendingCls)}
                      title={isDone ? t('cls_incomplete') : t('cls_complete')}
                    >
                      {isDone
                        ? <CheckCircle2 className="w-4 h-4" />
                        : <Circle className="w-4 h-4" />}
                    </button>

                    {/* Title */}
                    <span className={cn('flex-1 truncate', isDone && 'text-slate-400 line-through')}>
                      {topic.title}
                    </span>

                    {/* VP allocation */}
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {topic.vp_allocation}VP
                    </span>

                    {/* Homework cycle button */}
                    <button
                      onClick={() => onCycleHW(topic.id, topic.homework_status)}
                      title={t('cls_hwCycle')}
                      className={cn(
                        'shrink-0 min-w-[28px] text-center text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors',
                        HW_COLORS[topic.homework_status]
                      )}
                    >
                      {HW_LABELS[topic.homework_status]}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
