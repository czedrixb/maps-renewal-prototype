'use client';

import { useEffect, useState } from 'react';
import { BookOpen, Plus, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { AppShellB } from '@/components/sample-b/AppShellB';
import { MonthlyScheduleBoard } from '@/components/shared/MonthlyScheduleBoard';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { PlanStatusBadge } from '@/components/shared/StatusBadge';
import { VPProgressBar } from '@/components/shared/VPProgressBar';
import { getLearningPlans, schedulePlanning, getStudents, getBooks } from '@/lib/mock/api';
import { cn } from '@/lib/utils';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import type { LearningPlan, MonthlyBlock, Student, Book, PlanStatus } from '@/lib/types';

export default function LearningPlansBPage() {
  const { t } = useLanguage();
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState<number | null>(null);
  const [expandedSchedule, setExpandedSchedule] = useState<MonthlyBlock[]>([]);

  // List filter state
  const [listSearch, setListSearch] = useState('');
  const [listStatus, setListStatus] = useState<'ALL' | PlanStatus>('ALL');

  // New plan builder
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderStudent, setBuilderStudent] = useState('');
  const [builderBooks, setBuilderBooks] = useState<number[]>([]);
  const [builderDate, setBuilderDate] = useState('2026-07-01');
  const [builderSchedule, setBuilderSchedule] = useState<MonthlyBlock[]>([]);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    Promise.all([getLearningPlans(), getStudents(), getBooks()]).then(([p, s, b]) => {
      setPlans(p);
      setStudents(s);
      setBooks(b);
      setLoading(false);
    });
  }, []);

  const handleExpandPlan = (plan: LearningPlan) => {
    if (expandedPlanId === plan.id) {
      setExpandedPlanId(null);
      setExpandedSchedule([]);
      return;
    }
    setExpandedPlanId(plan.id);
    setExpandedSchedule(plan.schedule);
  };

  const handleGenerate = async () => {
    if (!builderBooks.length) return;
    setGenerating(true);
    const { schedule } = await schedulePlanning(builderBooks, builderDate);
    setBuilderSchedule(schedule);
    setGenerating(false);
  };

  const PLAN_STATUS_FILTER: { value: 'ALL' | PlanStatus; labelKey: TranslationKey }[] = [
    { value: 'ALL',              labelKey: 'stu_all' },
    { value: 'draft',            labelKey: 'ps_draft' },
    { value: 'pending_approval', labelKey: 'ps_pending' },
    { value: 'approved',         labelKey: 'ps_approved' },
    { value: 'active',           labelKey: 'ps_active' },
    { value: 'completed',        labelKey: 'ps_completed' },
    { value: 'rejected',         labelKey: 'ps_rejected' },
  ];

  const STATUS_ORDER: Record<string, number> = { pending_approval: 0, draft: 1, active: 2, approved: 3, completed: 4, rejected: 5 };
  const sortedPlans = [...plans].sort((a, b) => (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9));
  const filteredSortedPlans = sortedPlans.filter((p) =>
    (listStatus === 'ALL' || p.status === listStatus) &&
    p.student_name.includes(listSearch)
  );

  return (
    <AppShellB breadcrumbs={[{ label: t('nav_learningPlans') }]}>
      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{t('lp_title')}</h1>
          <button
            onClick={() => setShowBuilder(!showBuilder)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('lp_newPlanShort')}
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('lp_search')}
              value={listSearch}
              onChange={(e) => setListSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white w-52"
            />
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {PLAN_STATUS_FILTER.map(({ value, labelKey }) => (
              <button
                key={value}
                onClick={() => setListStatus(value)}
                className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors', listStatus === value ? 'bg-sky-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* New plan builder panel */}
        {showBuilder && (
          <div className="bg-white rounded-xl border border-sky-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-800">{t('lp_builderTitle')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('lp_student')}</label>
                <select
                  value={builderStudent}
                  onChange={(e) => setBuilderStudent(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                >
                  <option value="">{t('lp_studentPlaceholder')}</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.group}반)</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">{t('lp_startDate')}</label>
                <input type="date" value={builderDate} onChange={(e) => setBuilderDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1.5 block">{t('lp_selectBooks')}</label>
              <div className="grid grid-cols-2 gap-2">
                {books.map((b) => (
                  <label key={b.id} className={cn(
                    'flex items-center gap-2.5 px-3 py-2 border rounded-lg cursor-pointer transition-colors',
                    builderBooks.includes(b.id) ? 'border-sky-400 bg-sky-50' : 'border-gray-200 hover:bg-gray-50'
                  )}>
                    <input type="checkbox" checked={builderBooks.includes(b.id)}
                      onChange={(e) => setBuilderBooks(e.target.checked ? [...builderBooks, b.id] : builderBooks.filter((id) => id !== b.id))}
                      className="accent-sky-600" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{b.title}</p>
                      <p className="text-[10px] text-gray-400">{b.topics.length}{t('lp_topicsCount')}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <button onClick={handleGenerate} disabled={!builderBooks.length || generating}
              className="w-full py-2 bg-sky-600 text-white text-sm font-semibold rounded-xl hover:bg-sky-700 disabled:opacity-40 flex items-center justify-center gap-2">
              {generating ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('lp_generating')}</> : t('lp_generate')}
            </button>
            {builderSchedule.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-2">{t('lp_generatedSchedule')}</p>
                <div className="schedule-board">
                  <MonthlyScheduleBoard schedule={builderSchedule} onReorder={setBuilderSchedule} />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">{t('lp_cancel')}</button>
                  <button className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700">{t('lp_requestApproval')}</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Plan list — cleaner table format */}
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 grid grid-cols-12 gap-2 text-xs font-semibold text-gray-500">
              <span className="col-span-3">{t('lp_student')}</span>
              <span className="col-span-2">{t('lp_group')}</span>
              <span className="col-span-2">{t('lp_status')}</span>
              <span className="col-span-3">{t('lp_books')}</span>
              <span className="col-span-1">{t('lp_startDate')}</span>
              <span className="col-span-1 text-right">{t('lp_detail')}</span>
            </div>
            {filteredSortedPlans.map((plan) => (
              <div key={plan.id} className="border-b border-gray-50 last:border-0">
                <div
                  onClick={() => handleExpandPlan(plan)}
                  className={cn(
                    'px-4 py-3 grid grid-cols-12 gap-2 items-center hover:bg-gray-50 transition-colors cursor-pointer',
                    expandedPlanId === plan.id && 'bg-sky-50'
                  )}
                >
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {plan.student_name[0]}
                    </div>
                    <span className="text-sm font-semibold text-gray-800 truncate">{plan.student_name}</span>
                  </div>
                  <div className="col-span-2">
                    <GroupBadge group={plan.student_group} showFull />
                  </div>
                  <div className="col-span-2">
                    <PlanStatusBadge status={plan.status} />
                  </div>
                  <div className="col-span-3 text-xs text-gray-500 truncate">
                    {plan.books.map((b) => b.title).join(', ') || '—'}
                  </div>
                  <div className="col-span-1 text-xs text-gray-500">{plan.start_date.slice(5)}</div>
                  <div className="col-span-1 text-right">
                    <button onClick={(e) => { e.stopPropagation(); handleExpandPlan(plan); }} className="p-1 text-gray-400 hover:text-sky-600 transition-colors rounded">
                      {expandedPlanId === plan.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded schedule row */}
                {expandedPlanId === plan.id && (
                  <div className="px-4 pb-4 pt-2 bg-sky-50 border-t border-sky-100">
                    <p className="text-xs font-semibold text-sky-700 mb-3">{t('lp_monthlyScheduleLabel')}</p>
                    <div className="schedule-board">
                      <MonthlyScheduleBoard schedule={expandedSchedule} onReorder={setExpandedSchedule} />
                    </div>
                    {plan.status === 'pending_approval' && (
                      <div className="flex justify-end gap-2 mt-3">
                        <button className="px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50">{t('lp_reject')}</button>
                        <button className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700">{t('lp_approve')}</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShellB>
  );
}
