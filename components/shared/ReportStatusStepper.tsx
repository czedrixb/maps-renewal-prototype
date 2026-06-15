'use client';

import { cn } from '@/lib/utils';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import type { ReportStatus } from '@/lib/types';
import { Check } from 'lucide-react';

const STEPS: ReportStatus[] = ['draft', 'pending_review', 'approved', 'published', 'archived'];

const STEP_KEYS: Record<ReportStatus, TranslationKey> = {
  draft:          'rs_draft',
  pending_review: 'rs_pending_review',
  approved:       'rs_approved',
  published:      'rs_published',
  archived:       'rs_archived',
};

function getStepIndex(status: ReportStatus) {
  return STEPS.indexOf(status);
}

interface ReportStatusStepperProps {
  status: ReportStatus;
  compact?: boolean;
}

export function ReportStatusStepper({ status, compact = false }: ReportStatusStepperProps) {
  const { t } = useLanguage();
  const current = getStepIndex(status);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={step} className="flex items-center gap-1">
              <div className={cn('w-2 h-2 rounded-full', done && 'bg-blue-500', active && 'bg-blue-600 ring-2 ring-blue-200', !done && !active && 'bg-slate-200')} />
              {i < STEPS.length - 1 && <div className={cn('w-4 h-px', done ? 'bg-blue-400' : 'bg-slate-200')} />}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors',
                done && 'bg-blue-500 border-blue-500 text-white',
                active && 'bg-white border-blue-500 text-blue-600',
                !done && !active && 'bg-white border-slate-200 text-slate-400'
              )}>
                {done ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
              </div>
              <span className={cn('text-[10px] font-medium whitespace-nowrap', active && 'text-blue-600', done && 'text-slate-500', !done && !active && 'text-slate-400')}>
                {t(STEP_KEYS[step])}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className={cn('flex-1 h-0.5 mb-4 mx-1 transition-colors', done ? 'bg-blue-400' : 'bg-slate-200')} />}
          </div>
        );
      })}
    </div>
  );
}
