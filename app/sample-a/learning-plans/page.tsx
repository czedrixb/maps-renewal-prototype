'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { BookOpen, Search, Trash2, GripVertical } from 'lucide-react';
import { AppShellA } from '@/components/sample-a/AppShellA';
import { MonthlyScheduleBoard } from '@/components/shared/MonthlyScheduleBoard';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { PlanStatusBadge } from '@/components/shared/StatusBadge';
import { VPProgressBar } from '@/components/shared/VPProgressBar';
import { getStudents, getLearningPlans, schedulePlanning, getBooks } from '@/lib/mock/api';
import { cn } from '@/lib/utils';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import type { Student, LearningPlan, MonthlyBlock, Book, ManualModule, ManualModuleType, PlanStatus } from '@/lib/types';

const MM_KEYS: Record<string, TranslationKey> = {
  school_exam: 'mm_school_exam',
  extra_book: 'mm_extra_book',
  exam_practice: 'mm_exam_practice',
  review_book: 'mm_review_book',
};

const MM_TYPES: ManualModuleType[] = ['school_exam', 'extra_book', 'exam_practice', 'review_book'];

function LearningPlansAContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // List filter state
  const [listSearch, setListSearch] = useState('');
  const [listStatus, setListStatus] = useState<'ALL' | PlanStatus>('ALL');

  // Builder state
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const [startDate, setStartDate] = useState('2026-06-15');
  const [schedule, setSchedule] = useState<MonthlyBlock[]>([]);
  const [generating, setGenerating] = useState(false);
  const [manualModules, setManualModules] = useState<ManualModule[]>([]);
  const [newModule, setNewModule] = useState<ManualModule>({ title: '', source_type: 'school_exam', vp: 2, insert_after_topic_id: null });

  useEffect(() => {
    const studentParam = searchParams.get('student');
    Promise.all([getStudents(), getLearningPlans(), getBooks()]).then(([s, p, b]) => {
      setStudents(s);
      setPlans(p);
      setBooks(b);
      setLoading(false);

      if (studentParam) {
        const studentId = parseInt(studentParam, 10);
        const plan = p.find((pl) => pl.student_id === studentId);
        if (plan) {
          setSelectedStudentId(studentId);
          setSchedule(plan.schedule);
          setSelectedBookIds(plan.books.map((bk) => bk.id));
          setStartDate(plan.start_date);
        } else {
          setSelectedStudentId(studentId);
        }
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedStudent = students.find((s) => s.id === selectedStudentId);
  const existingPlan = selectedStudentId ? plans.find((p) => p.student_id === selectedStudentId && (p.status === 'active' || p.status === 'approved')) : null;

  const handleGenerate = async () => {
    if (!selectedBookIds.length || !startDate) return;
    setGenerating(true);
    const { schedule: s } = await schedulePlanning(selectedBookIds, startDate, manualModules);
    setSchedule(s);
    setGenerating(false);
  };

  const toggleBook = (id: number) => {
    setSelectedBookIds((prev) => prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]);
    setSchedule([]);
  };

  const addManualModule = () => {
    if (!newModule.title.trim()) return;
    setManualModules((prev) => [...prev, { ...newModule, id: Date.now() }]);
    setNewModule({ title: '', source_type: 'school_exam', vp: 2, insert_after_topic_id: null });
    setSchedule([]);
  };

  const PLAN_STATUS_FILTER: { value: 'ALL' | PlanStatus; labelKey: TranslationKey }[] = [
    { value: 'ALL',             labelKey: 'stu_all' },
    { value: 'draft',           labelKey: 'ps_draft' },
    { value: 'pending_approval',labelKey: 'ps_pending' },
    { value: 'approved',        labelKey: 'ps_approved' },
    { value: 'active',          labelKey: 'ps_active' },
    { value: 'completed',       labelKey: 'ps_completed' },
    { value: 'rejected',        labelKey: 'ps_rejected' },
  ];

  const filteredPlans = plans.filter((p) =>
    (listStatus === 'ALL' || p.status === listStatus) &&
    p.student_name.includes(listSearch)
  );

  return (
    <AppShellA breadcrumbs={[{ label: t('nav_learningPlans') }]}>
      <div className="flex h-full overflow-hidden">
        {/* LEFT: Plan list */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-700">{t('lp_planList')}</h2>
              <span className="text-xs text-slate-400">{filteredPlans.length}{t('lp_countSuffix')}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder={t('lp_search')} value={listSearch} onChange={(e) => setListSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300" />
            </div>
            {/* Status filter chips */}
            <div className="flex flex-wrap gap-1 mt-2">
              {PLAN_STATUS_FILTER.map(({ value, labelKey }) => (
                <button
                  key={value}
                  onClick={() => setListStatus(value)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                    listStatus === value ? 'bg-indigo-600 text-white' : 'text-slate-500 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => {
                  setSelectedStudentId(plan.student_id);
                  setSchedule(plan.schedule);
                  setSelectedBookIds(plan.books.map((b) => b.id));
                  setStartDate(plan.start_date);
                }}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-xl transition-colors',
                  selectedStudentId === plan.student_id
                    ? 'bg-indigo-50 border border-indigo-200'
                    : 'hover:bg-slate-50'
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-semibold text-slate-700">{plan.student_name}</span>
                  <GroupBadge group={plan.student_group} size="sm" />
                </div>
                <PlanStatusBadge status={plan.status} />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT: Builder */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-lg font-bold text-slate-800">
              {selectedStudentId && existingPlan ? `${selectedStudent?.name}${t('lp_existingPlan')}` : t('lp_builderTitle')}
            </h2>

            {/* Student + Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{t('lp_selectStudentLabel')}</label>
                <select
                  value={selectedStudentId ?? ''}
                  onChange={(e) => { setSelectedStudentId(e.target.value ? parseInt(e.target.value) : null); setSchedule([]); }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                >
                  <option value="">{t('lp_studentPlaceholder')}</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.group}반)</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">{t('lp_startDate')}</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setSchedule([]); }}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Book selector */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">{t('lp_selectBooks')}</label>
              <div className="grid grid-cols-2 gap-2">
                {books.map((book) => (
                  <button
                    key={book.id}
                    onClick={() => toggleBook(book.id)}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border text-left transition-all',
                      selectedBookIds.includes(book.id)
                        ? 'border-indigo-300 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    )}
                  >
                    <BookOpen className={cn('w-4 h-4 mt-0.5 shrink-0', selectedBookIds.includes(book.id) ? 'text-indigo-600' : 'text-slate-400')} />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{book.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {book.topics.length}{t('lp_topicsCount')} · {book.topics.reduce((s, tp) => s + tp.vp_allocation, 0)} VP
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Manual modules */}
            <div>
              <label className="text-xs font-semibold text-slate-600 mb-2 block">{t('lp_manualModules')}</label>
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-3">
                {manualModules.map((m, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-violet-50 rounded-lg">
                    <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                    <span className="flex-1 text-xs font-medium text-violet-700">{m.title}</span>
                    <span className="text-[10px] text-slate-500">{t(MM_KEYS[m.source_type] ?? 'mm_school_exam')} · {m.vp} VP</span>
                    <button onClick={() => setManualModules((prev) => prev.filter((_, j) => j !== i))} className="text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={t('lp_modulePlaceholder')}
                    value={newModule.title}
                    onChange={(e) => setNewModule((p) => ({ ...p, title: e.target.value }))}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                  <select
                    value={newModule.source_type}
                    onChange={(e) => setNewModule((p) => ({ ...p, source_type: e.target.value as ManualModuleType }))}
                    className="px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none bg-white"
                  >
                    {MM_TYPES.map((k) => (
                      <option key={k} value={k}>{t(MM_KEYS[k])}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1} max={10}
                    value={newModule.vp}
                    onChange={(e) => setNewModule((p) => ({ ...p, vp: parseFloat(e.target.value) }))}
                    className="w-16 px-2 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none text-center"
                  />
                  <button onClick={addManualModule} className="px-2.5 py-1.5 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700">
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedBookIds.length || !startDate || generating}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {generating ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> {t('lp_generating')}</>
              ) : (
                <>{schedule.length > 0 ? t('lp_regenerate') : t('lp_generate')}</>
              )}
            </button>

            {/* Schedule board */}
            {schedule.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-700">{t('lp_scheduleBoard')}</h3>
                  <p className="text-xs text-slate-400">{t('lp_dragHint')}</p>
                </div>
                <div className="schedule-board">
                  <MonthlyScheduleBoard schedule={schedule} onReorder={setSchedule} />
                </div>
                <div className="flex items-center justify-end gap-3 mt-4">
                  <button className="px-4 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">
                    {t('lp_saveDraft')}
                  </button>
                  <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700">
                    {t('lp_submitApproval')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShellA>
  );
}

export default function LearningPlansAPage() {
  return (
    <Suspense>
      <LearningPlansAContent />
    </Suspense>
  );
}
