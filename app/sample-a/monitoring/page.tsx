'use client';

import { useEffect, useState } from 'react';
import { BarChart2, Calendar, FileText, Search, TrendingUp } from 'lucide-react';
import { AppShellA } from '@/components/sample-a/AppShellA';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { ReportStatusBadge, MakeupStatusBadge } from '@/components/shared/StatusBadge';
import { ReportStatusStepper } from '@/components/shared/ReportStatusStepper';
import { VPProgressBar } from '@/components/shared/VPProgressBar';
import { getTestScores, getMakeupSessions, getMonthlyReports } from '@/lib/mock/api';
import { cn, formatYearMonth } from '@/lib/utils';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import type { TestScore, MakeupSession, MonthlyReport } from '@/lib/types';

type TabId = 'scores' | 'makeup' | 'reports';

const TABS: { id: TabId; key: TranslationKey; icon: React.ElementType }[] = [
  { id: 'scores',  key: 'mon_scores',  icon: BarChart2 },
  { id: 'makeup',  key: 'mon_makeup',  icon: Calendar },
  { id: 'reports', key: 'mon_reports', icon: FileText },
];

export default function MonitoringAPage() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabId>('scores');
  const [scores, setScores] = useState<TestScore[]>([]);
  const [makeup, setMakeup] = useState<MakeupSession[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTestScores(), getMakeupSessions(), getMonthlyReports()]).then(([sc, mk, rp]) => {
      setScores(sc);
      setMakeup(mk);
      setReports(rp);
      setLoading(false);
    });
  }, []);

  return (
    <AppShellA breadcrumbs={[{ label: t('mon_title') }]}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-slate-800">{t('mon_title')}</h1>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-6 w-fit">
          {TABS.map(({ id, key, icon: Icon }) => (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setSearch(''); }}
              className={cn(
                'flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all',
                activeTab === id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              <Icon className="w-4 h-4" />
              {t(key)}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('mon_search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ─── SCORES ─── */}
            {activeTab === 'scores' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <p className="text-xs text-slate-500">
                    {t('mon_total')} {scores.length}{lang === 'ko' ? '건의 시험 성적' : ' test scores'} · {t('mon_classAvg')} <span className="font-bold text-slate-700">82{lang === 'ko' ? '점' : ' pts'}</span>
                  </p>
                </div>
                {scores
                  .filter((s) => !search || s.student_name.includes(search))
                  .map((score) => (
                    <div key={score.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {score.student_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-slate-800">{score.student_name}</span>
                          <span className="text-xs text-slate-400">{score.book_unit}</span>
                          <span className="text-xs text-slate-400">· {score.test_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <VPProgressBar vp={score.score} max={score.total} size="sm" className="flex-1 max-w-[160px]" />
                          {score.reviews.length > 0 && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">
                              {t('mon_retest')} {score.reviews.length}{lang === 'ko' ? '회' : '×'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-black text-slate-800">{score.score}</span>
                        <span className="text-sm text-slate-400">/{score.total}</span>
                        <p className="text-xs text-slate-400 mt-0.5">{score.date}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {/* ─── MAKEUP ─── */}
            {activeTab === 'makeup' && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(['pending', 'scheduled', 'completed'] as const).map((status) => {
                    const count = makeup.filter((m) => m.status === status).length;
                    const colors: Record<string, string> = { pending: 'text-red-600', scheduled: 'text-amber-600', completed: 'text-green-600' };
                    const labelKeys: Record<string, TranslationKey> = { pending: 'ms_pending', scheduled: 'ms_scheduled', completed: 'ms_completed' };
                    return (
                      <div key={status} className="bg-white border border-slate-200 rounded-xl p-3 text-center">
                        <p className={cn('text-2xl font-black', colors[status])}>{count}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{t(labelKeys[status])}</p>
                      </div>
                    );
                  })}
                </div>
                {makeup
                  .filter((m) => !search || m.student_name.includes(search))
                  .map((m) => (
                    <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">
                        {m.student_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800">{m.student_name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {t('mon_absentDate')}: {m.absent_date}
                          {m.makeup_date && <> → {t('mon_makeupDate')}: <span className="text-green-600 font-medium">{m.makeup_date}</span></>}
                        </p>
                        {m.topic_title && <p className="text-xs text-slate-400 mt-0.5">{t('mon_topic')}: {m.topic_title}</p>}
                        {m.note && <p className="text-xs text-slate-400 italic mt-0.5">{m.note}</p>}
                      </div>
                      <MakeupStatusBadge status={m.status} />
                    </div>
                  ))}
              </div>
            )}

            {/* ─── REPORTS ─── */}
            {activeTab === 'reports' && (
              <div className="space-y-3">
                {reports
                  .filter((r) => !search || r.student_name.includes(search))
                  .map((report) => (
                    <div key={report.id} className={cn(
                      'bg-white border rounded-xl p-4',
                      report.status === 'published' ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'
                    )}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-bold shrink-0">
                            {report.student_name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-800">{report.student_name}</span>
                              <GroupBadge group={report.student_group} size="sm" />
                            </div>
                            <p className="text-xs text-slate-400">{formatYearMonth(report.year, report.month, lang)} · {report.report_code}</p>
                          </div>
                        </div>
                        <ReportStatusBadge status={report.status} />
                      </div>

                      {/* Mini stepper */}
                      <div className="mb-3">
                        <ReportStatusStepper status={report.status} compact />
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-base font-black text-slate-700">{report.total_vp_earned.toFixed(1)}</p>
                          <p className="text-[10px] text-slate-400">VP</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-base font-black text-slate-700">{report.average_test_score ?? '—'}</p>
                          <p className="text-[10px] text-slate-400">{t('mon_avg')}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-base font-black text-slate-700">{report.total_attitude_score ?? '—'}</p>
                          <p className="text-[10px] text-slate-400">{t('mon_attitude')}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-2">
                          <p className="text-base font-black text-slate-700">{report.books_completion_percentage}%</p>
                          <p className="text-[10px] text-slate-400">{t('mon_progress')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShellA>
  );
}
