'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

import { AppShellB } from '@/components/sample-b/AppShellB';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { ReportStatusBadge, MakeupStatusBadge } from '@/components/shared/StatusBadge';
import { ReportStatusStepper } from '@/components/shared/ReportStatusStepper';
import { VPProgressBar } from '@/components/shared/VPProgressBar';
import { getTestScores, getMakeupSessions, getMonthlyReports } from '@/lib/mock/api';
import { cn, formatYearMonth } from '@/lib/utils';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import type { TestScore, MakeupSession, MonthlyReport } from '@/lib/types';

type TabId = 'scores' | 'makeup' | 'reports';

const TAB_KEYS: { id: TabId; key: TranslationKey }[] = [
  { id: 'scores',  key: 'mon_scores' },
  { id: 'makeup',  key: 'mon_makeup' },
  { id: 'reports', key: 'mon_reports' },
];

function MonitoringContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = (searchParams.get('tab') ?? 'scores') as TabId;

  const [scores, setScores] = useState<TestScore[]>([]);
  const [makeup, setMakeup] = useState<MakeupSession[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedReport, setExpandedReport] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getTestScores(), getMakeupSessions(), getMonthlyReports()]).then(([sc, mk, rp]) => {
      setScores(sc);
      setMakeup(mk);
      setReports(rp);
      setLoading(false);
    });
  }, []);

  const setTab = (tab: TabId) => {
    router.push(`/sample-b/monitoring?tab=${tab}`);
    setSearch('');
  };

  return (
    <AppShellB breadcrumbs={[{ label: t('mon_title') }]}>
      <div className="p-6 max-w-5xl mx-auto space-y-5">
        <h1 className="text-xl font-bold text-gray-900">{t('mon_title')}</h1>

        {/* Segmented control */}
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1 gap-0.5">
          {TAB_KEYS.map(({ id, key }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={cn(
                'px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                tabParam === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Shared search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t('mon_searchShort')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ─── SCORES ─── */}
            {tabParam === 'scores' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Summary bar */}
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-4">
                  <TrendingUp className="w-4 h-4 text-sky-600" />
                  <span className="text-xs text-gray-600">
                    {t('mon_total')} <span className="font-bold">{scores.length}</span>{lang === 'ko' ? '건' : ''} · {t('mon_classAvg')} <span className="font-bold text-gray-800">82{lang === 'ko' ? '점' : ' pts'}</span>
                  </span>
                  <div className="ml-auto flex items-center gap-3 text-xs text-gray-500">
                    <span>{t('mon_vpRate')}: <span className="font-bold text-sky-700">82%</span></span>
                    <span>{t('mon_retestPending')}: <span className="font-bold text-amber-600">2</span></span>
                  </div>
                </div>

                {/* Header */}
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                  <span className="col-span-3">{t('mon_student')}</span>
                  <span className="col-span-3">{t('mon_unit')}</span>
                  <span className="col-span-2">{t('mon_type')}</span>
                  <span className="col-span-2">{t('mon_score')}</span>
                  <span className="col-span-1">{t('mon_date')}</span>
                  <span className="col-span-1 text-right">{t('mon_retest')}</span>
                </div>

                {/* Rows */}
                <div className="divide-y divide-gray-50">
                  {scores
                    .filter((s) => !search || s.student_name.includes(search))
                    .map((score) => (
                      <div key={score.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                        <div className="col-span-3 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">{score.student_name[0]}</div>
                          <span className="text-sm font-medium text-gray-800 truncate">{score.student_name}</span>
                        </div>
                        <span className="col-span-3 text-xs text-gray-600 truncate">{score.book_unit}</span>
                        <span className="col-span-2 text-xs text-gray-500">{score.test_type}</span>
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-800">{score.score}</span>
                            <span className="text-xs text-gray-400">/{score.total}</span>
                            <VPProgressBar vp={score.score} max={score.total} size="sm" className="flex-1 max-w-[48px]" />
                          </div>
                        </div>
                        <span className="col-span-1 text-xs text-gray-400">{score.date.slice(5)}</span>
                        <div className="col-span-1 text-right">
                          {score.reviews.length > 0 ? (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">{score.reviews.length}{lang === 'ko' ? '회' : '×'}</span>
                          ) : (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ─── MAKEUP ─── */}
            {tabParam === 'makeup' && (
              <div className="space-y-3">
                {/* Summary cards */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { labelKey: 'mon_total' as const, value: makeup.length, color: 'text-gray-800' },
                    { labelKey: 'ms_pending' as const, value: makeup.filter((m) => m.status === 'pending').length, color: 'text-red-600' },
                    { labelKey: 'ms_scheduled' as const, value: makeup.filter((m) => m.status === 'scheduled').length, color: 'text-amber-600' },
                    { labelKey: 'ms_completed' as const, value: makeup.filter((m) => m.status === 'completed').length, color: 'text-green-600' },
                  ].map((c) => (
                    <div key={c.labelKey} className="bg-white border border-gray-200 rounded-xl p-3 text-center">
                      <p className={cn('text-2xl font-black', c.color)}>{c.value}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{t(c.labelKey)}</p>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                    <span className="col-span-3">{t('mon_student')}</span>
                    <span className="col-span-2">{t('mon_absentDate')}</span>
                    <span className="col-span-2">{t('mon_makeupDate')}</span>
                    <span className="col-span-3">{t('mon_topic')}</span>
                    <span className="col-span-2 text-right">{t('lp_status')}</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {makeup
                      .filter((m) => !search || m.student_name.includes(search))
                      .map((m) => (
                        <div key={m.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center hover:bg-gray-50 transition-colors">
                          <div className="col-span-3 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">{m.student_name[0]}</div>
                            <span className="text-sm font-medium text-gray-800 truncate">{m.student_name}</span>
                          </div>
                          <span className="col-span-2 text-xs text-gray-600">{m.absent_date}</span>
                          <span className="col-span-2 text-xs text-gray-600">{m.makeup_date ?? <span className="text-gray-300">{t('mon_tbd')}</span>}</span>
                          <span className="col-span-3 text-xs text-gray-500 truncate">{m.topic_title ?? (m.note ?? '—')}</span>
                          <div className="col-span-2 text-right"><MakeupStatusBadge status={m.status} /></div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── REPORTS ─── */}
            {tabParam === 'reports' && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-gray-50 text-xs font-semibold text-gray-500 border-b border-gray-100">
                  <span className="col-span-3">{t('mon_student')}</span>
                  <span className="col-span-2">{t('mon_period')}</span>
                  <span className="col-span-2">{t('lp_status')}</span>
                  <span className="col-span-1 text-center">VP</span>
                  <span className="col-span-1 text-center">{t('mon_avg')}</span>
                  <span className="col-span-1 text-center">{t('mon_attitude')}</span>
                  <span className="col-span-1 text-center">{t('mon_progress')}</span>
                  <span className="col-span-1 text-right">{t('lp_detail')}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {reports
                    .filter((r) => !search || r.student_name.includes(search))
                    .map((report) => (
                      <div key={report.id}>
                        <div
                          className={cn(
                            'grid grid-cols-12 gap-2 px-4 py-3 items-center cursor-pointer hover:bg-gray-50 transition-colors',
                            expandedReport === report.id && 'bg-sky-50'
                          )}
                        >
                          <div className="col-span-3 flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold shrink-0">{report.student_name[0]}</div>
                            <div>
                              <p className="text-sm font-medium text-gray-800 truncate">{report.student_name}</p>
                              <GroupBadge group={report.student_group} size="sm" />
                            </div>
                          </div>
                          <span className="col-span-2 text-xs text-gray-600">{formatYearMonth(report.year, report.month, lang)}</span>
                          <div className="col-span-2"><ReportStatusBadge status={report.status} /></div>
                          <span className="col-span-1 text-xs font-bold text-gray-700 text-center">{report.total_vp_earned.toFixed(1)}</span>
                          <span className="col-span-1 text-xs font-bold text-gray-700 text-center">{report.average_test_score ?? '—'}</span>
                          <span className="col-span-1 text-xs font-bold text-gray-700 text-center">{report.total_attitude_score ?? '—'}</span>
                          <span className="col-span-1 text-xs font-bold text-gray-700 text-center">{report.books_completion_percentage}%</span>
                          <div className="col-span-1 text-right">
                            <button
                              onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                              className="p-1 text-gray-400 hover:text-sky-600 rounded"
                            >
                              {expandedReport === report.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded report detail */}
                        {expandedReport === report.id && (
                          <div className="px-4 pb-4 pt-2 bg-sky-50 border-t border-sky-100 space-y-3">
                            <ReportStatusStepper status={report.status} />

                            {/* Books progress */}
                            {report.books_progress.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-gray-600 mb-2">{t('mon_booksProgress')}</p>
                                {report.books_progress.map((bp) => (
                                  <div key={bp.book_id} className="mb-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                      <span className="truncate">{bp.book_title}</span>
                                      <span className="font-semibold shrink-0 ml-2">{bp.topics_completed}/{bp.topics_total} {t('rep_topics')}</span>
                                    </div>
                                    <VPProgressBar vp={bp.topics_completed} max={bp.topics_total} size="sm" />
                                  </div>
                                ))}
                              </div>
                            )}

                            {report.teacher_comments && (
                              <div className="bg-white rounded-lg p-3">
                                <p className="text-xs font-semibold text-sky-700 mb-1">{t('mon_teacherComment')}</p>
                                <p className="text-xs text-gray-600 leading-relaxed">{report.teacher_comments}</p>
                              </div>
                            )}

                            {report.status !== 'published' && (
                              <div className="flex justify-end gap-2">
                                {report.status === 'draft' && <button className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700">{t('mon_requestReview')}</button>}
                                {report.status === 'approved' && <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">{t('mon_publish')}</button>}
                              </div>
                            )}
                            {report.status === 'published' && (
                              <p className="text-xs text-blue-500">📌 {report.published_at} {t('mon_publishedNote')}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppShellB>
  );
}

export default function MonitoringBPage() {
  return (
    <Suspense>
      <MonitoringContent />
    </Suspense>
  );
}
