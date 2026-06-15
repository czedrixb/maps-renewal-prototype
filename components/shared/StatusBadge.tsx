'use client';

import { cn } from '@/lib/utils';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import type { PlanStatus, ReportStatus } from '@/lib/types';

const PLAN_STYLES: Record<PlanStatus, string> = {
  draft:            'bg-slate-100 text-slate-600 ring-slate-200',
  pending_approval: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  approved:         'bg-green-100 text-green-700 ring-green-200',
  active:           'bg-blue-100 text-blue-700 ring-blue-200',
  completed:        'bg-slate-100 text-slate-500 ring-slate-200',
  rejected:         'bg-red-100 text-red-700 ring-red-200',
};

const REPORT_STYLES: Record<ReportStatus, string> = {
  draft:          'bg-slate-100 text-slate-600 ring-slate-200',
  pending_review: 'bg-amber-100 text-amber-700 ring-amber-200',
  approved:       'bg-green-100 text-green-700 ring-green-200',
  published:      'bg-blue-100 text-blue-700 ring-blue-200',
  archived:       'bg-slate-100 text-slate-400 ring-slate-200',
};

const MAKEUP_STYLES: Record<string, string> = {
  pending:   'bg-red-100 text-red-700 ring-red-200',
  scheduled: 'bg-yellow-100 text-yellow-700 ring-yellow-200',
  completed: 'bg-green-100 text-green-700 ring-green-200',
  cancelled: 'bg-slate-100 text-slate-500 ring-slate-200',
};

const PLAN_KEYS: Record<PlanStatus, TranslationKey> = {
  draft:            'ps_draft',
  pending_approval: 'ps_pending',
  approved:         'ps_approved',
  active:           'ps_active',
  completed:        'ps_completed',
  rejected:         'ps_rejected',
};

const REPORT_KEYS: Record<ReportStatus, TranslationKey> = {
  draft:          'rs_draft',
  pending_review: 'rs_pending_review',
  approved:       'rs_approved',
  published:      'rs_published',
  archived:       'rs_archived',
};

const MAKEUP_KEYS: Record<string, TranslationKey> = {
  pending:   'ms_pending',
  scheduled: 'ms_scheduled',
  completed: 'ms_completed',
  cancelled: 'ms_cancelled',
};

export function PlanStatusBadge({ status, className }: { status: PlanStatus; className?: string }) {
  const { t } = useLanguage();
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ring-1', PLAN_STYLES[status], className)}>
      {t(PLAN_KEYS[status])}
    </span>
  );
}

export function ReportStatusBadge({ status, className }: { status: ReportStatus; className?: string }) {
  const { t } = useLanguage();
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ring-1', REPORT_STYLES[status], className)}>
      {t(REPORT_KEYS[status])}
    </span>
  );
}

export function MakeupStatusBadge({ status, className }: { status: string; className?: string }) {
  const { t } = useLanguage();
  const key = MAKEUP_KEYS[status];
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full ring-1', MAKEUP_STYLES[status] ?? MAKEUP_STYLES.pending, className)}>
      {key ? t(key) : status}
    </span>
  );
}
