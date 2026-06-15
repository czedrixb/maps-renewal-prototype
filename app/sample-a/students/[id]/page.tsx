'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  BookOpen, TrendingUp, BarChart2, Heart, Calendar, FileText,
  CheckCircle2, Circle, Eye, EyeOff,
} from 'lucide-react';

import { AppShellA } from '@/components/sample-a/AppShellA';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { VPProgressBar, VPRing } from '@/components/shared/VPProgressBar';
import { PlanStatusBadge, ReportStatusBadge, MakeupStatusBadge } from '@/components/shared/StatusBadge';
import { ReportStatusStepper } from '@/components/shared/ReportStatusStepper';
import { MonthlyScheduleBoard } from '@/components/shared/MonthlyScheduleBoard';
import {
  getStudent, getLearningPlans, getStudentProgress,
  getTestScores, getAttitudeEvaluations, getMakeupSessions, getMonthlyReports,
} from '@/lib/mock/api';
import { cn, formatDate, formatYearMonth } from '@/lib/utils';
import { getMonthLabel, getGradeColor } from '@/lib/vp';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import type { Student, LearningPlan, MonthlyBlock, MonthlyReport } from '@/lib/types';

type TabId = 'overview' | 'plan' | 'progress' | 'scores' | 'attitude' | 'makeup' | 'report';

const TABS: { id: TabId; key: TranslationKey; icon: React.ElementType }[] = [
  { id: 'overview',  key: 'tab_overview',  icon: TrendingUp },
  { id: 'plan',      key: 'tab_plan',      icon: BookOpen },
  { id: 'progress',  key: 'tab_progress',  icon: CheckCircle2 },
  { id: 'scores',    key: 'tab_scores',    icon: BarChart2 },
  { id: 'attitude',  key: 'tab_attitude',  icon: Heart },
  { id: 'makeup',    key: 'tab_makeup',    icon: Calendar },
  { id: 'report',    key: 'tab_report',    icon: FileText },
];

const HW_KEYS: Record<string, TranslationKey> = {
  not_assigned: 'hw_not_assigned',
  assigned: 'hw_assigned',
  submitted: 'hw_submitted',
  reverse_questions_completed: 'hw_reverse',
};

const AC_KEYS: Record<string, TranslationKey> = {
  participation: 'ac_participation',
  homework: 'ac_homework',
  attitude: 'ac_attitude',
  effort: 'ac_effort',
  improvement: 'ac_improvement',
};

export default function StudentWorkspacePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const studentId = parseInt(id);
  const { lang, t } = useLanguage();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [student, setStudent] = useState<Student | null>(null);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [progress, setProgress] = useState<Awaited<ReturnType<typeof getStudentProgress>>>(null);
  const [scores, setScores] = useState<Awaited<ReturnType<typeof getTestScores>>>([]);
  const [attitudes, setAttitudes] = useState<Awaited<ReturnType<typeof getAttitudeEvaluations>>>([]);
  const [makeup, setMakeup] = useState<Awaited<ReturnType<typeof getMakeupSessions>>>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<MonthlyBlock[]>([]);
  const [hideVP, setHideVP] = useState(false);

  useEffect(() => {
    Promise.all([
      getStudent(studentId),
      getLearningPlans({ student_id: studentId }),
      getStudentProgress(studentId),
      getTestScores({ student_id: studentId }),
      getAttitudeEvaluations({ student_id: studentId }),
      getMakeupSessions({ student_id: studentId }),
      getMonthlyReports({ student_id: studentId }),
    ]).then(([s, p, prog, sc, att, mk, rep]) => {
      setStudent(s);
      setPlans(p);
      setProgress(prog);
      setScores(sc);
      setAttitudes(att);
      setMakeup(mk);
      setReports(rep);
      const activePlan = p.find((pl) => pl.status === 'active' || pl.status === 'approved');
      if (activePlan) setSchedule(activePlan.schedule);
      setLoading(false);
    });
  }, [studentId]);

  if (loading || !student) {
    return (
      <AppShellA breadcrumbs={[{ label: t('nav_students'), href: '/sample-a/students' }, { label: '...' }]}>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShellA>
    );
  }

  const activePlan = plans.find((p) => p.status === 'active' || p.status === 'approved');
  const latestAttitude = attitudes[0];

  return (
    <AppShellA breadcrumbs={[{ label: t('nav_students'), href: '/sample-a/students' }, { label: student.name }]}>
      <div className="flex flex-col h-full">
        {/* Student Header */}
        <div className="bg-white border-b border-slate-200 px-6 pt-5 pb-0">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold shrink-0">
              {student.name[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-800">{student.name}</h1>
                <GroupBadge group={student.group} showFull />
                {activePlan && <PlanStatusBadge status={activePlan.status} />}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('sw_teacher')} {student.teacher_name} · {t('sw_enrolled')} {formatDate(student.enrolled_at, lang)}
              </p>
            </div>
            {progress && (
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <VPRing vp={progress.vp_earned} total={progress.vp_total} size={56} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-slate-700">{progress.completion_percentage}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{progress.vp_earned.toFixed(1)} VP</p>
                  <p className="text-xs text-slate-400">/ {progress.vp_total.toFixed(1)} VP</p>
                  <p className="text-xs text-violet-600 font-semibold">{t('sw_svp')} {progress.svp_earned.toFixed(1)} VP</p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex items-end gap-0.5 overflow-x-auto">
            {TABS.map(({ id: tabId, key, icon: Icon }) => (
              <button
                key={tabId}
                onClick={() => setActiveTab(tabId)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap',
                  activeTab === tabId
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {t(key)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="p-6 max-w-5xl mx-auto">
            {/* ─── OVERVIEW ─── */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-2 gap-4">
                {/* VP Summary */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 col-span-2">
                  <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('ov_progressSummary')}</h3>
                  {progress ? (
                    <div className="flex items-center gap-6">
                      <div className="relative shrink-0">
                        <VPRing vp={progress.vp_earned} total={progress.vp_total} size={80} strokeWidth={7} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-black text-slate-800">{progress.completion_percentage}%</span>
                        </div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>{t('ov_vpLabel')}</span>
                            <span className="font-semibold">{progress.vp_earned.toFixed(1)} / {progress.vp_total.toFixed(1)}</span>
                          </div>
                          <VPProgressBar vp={progress.vp_earned} max={progress.vp_total} size="md" />
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-500 mb-1">
                            <span>{t('ov_svpLabel')}</span>
                            <span className="font-semibold text-violet-600">{progress.svp_earned.toFixed(1)} VP</span>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-violet-400 rounded-full"
                              style={{ width: `${progress.vp_total > 0 ? (progress.svp_earned / progress.vp_total) * 100 : 0}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">{t('ov_noActivePlan')}</p>
                  )}
                </div>

                {/* Latest test score */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('ov_recentScore')}</h3>
                  {scores[0] ? (
                    <>
                      <p className="text-3xl font-black text-slate-800">{scores[0].score}<span className="text-base font-semibold text-slate-400">/{scores[0].total}</span></p>
                      <p className="text-xs text-slate-500 mt-1">{scores[0].book_unit} · {scores[0].date}</p>
                    </>
                  ) : <p className="text-sm text-slate-400">{t('ov_noScore')}</p>}
                </div>

                {/* Latest attitude */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">{t('ov_attitude')}</h3>
                  {latestAttitude ? (
                    <>
                      <p className="text-3xl font-black text-slate-800">
                        {latestAttitude.total}<span className="text-base font-semibold text-slate-400">/100</span>
                      </p>
                      <p className={cn('text-lg font-black', getGradeColor(latestAttitude.grade))}>
                        {latestAttitude.grade}{t('ov_grade')}
                      </p>
                    </>
                  ) : <p className="text-sm text-slate-400">{t('ov_noAttitude')}</p>}
                </div>
              </div>
            )}

            {/* ─── PLAN ─── */}
            {activeTab === 'plan' && (
              <div>
                {activePlan ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700">{t('pl_monthlySchedule')}</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {t('pl_startDate')}: {activePlan.start_date} · {activePlan.books.map((b) => b.title).join(', ')}
                        </p>
                      </div>
                      <PlanStatusBadge status={activePlan.status} />
                    </div>
                    <div className="schedule-board">
                      <MonthlyScheduleBoard schedule={schedule} onReorder={setSchedule} />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20 text-slate-400">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{t('pl_noActivePlan')}</p>
                    <Link href="/sample-a/learning-plans" className="text-indigo-600 text-sm hover:underline mt-2 inline-block">
                      {t('pl_createPlan')}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* ─── PROGRESS ─── */}
            {activeTab === 'progress' && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('pr_title')}</h3>
                {progress?.schedule.map((block) => (
                  <div key={block.month} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-semibold text-slate-600">{getMonthLabel(block.month, lang)}</h4>
                      <VPProgressBar
                        vp={block.topics.filter((tp) => tp.status === 'completed').reduce((s, tp) => s + tp.vp_allocation, 0)}
                        max={block.topics.reduce((s, tp) => s + tp.vp_allocation, 0)}
                        size="sm"
                        className="w-24"
                      />
                    </div>
                    <div className="space-y-1.5">
                      {block.topics.map((topic) => (
                        <div
                          key={topic.id}
                          className={cn(
                            'flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm',
                            topic.status === 'completed'
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-white border-slate-200'
                          )}
                        >
                          {topic.status === 'completed' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-300 shrink-0" />
                          )}
                          <span className={cn('flex-1 truncate', topic.status === 'completed' && 'text-slate-400 line-through')}>
                            {topic.title}
                          </span>
                          <span className="text-xs text-slate-400 shrink-0">{topic.vp_allocation} VP</span>
                          <span className={cn(
                            'text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0',
                            topic.homework_status === 'reverse_questions_completed'
                              ? 'bg-violet-100 text-violet-700'
                              : 'bg-slate-100 text-slate-500'
                          )}>
                            {t(HW_KEYS[topic.homework_status] ?? 'hw_not_assigned')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {!progress && <p className="text-sm text-slate-400 text-center py-12">{t('pr_noData')}</p>}
              </div>
            )}

            {/* ─── SCORES ─── */}
            {activeTab === 'scores' && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('sc_title')}</h3>
                {scores.length > 0 ? (
                  <div className="space-y-3">
                    {scores.map((score) => (
                      <div key={score.id} className="bg-white border border-slate-200 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-sm font-semibold text-slate-800">{score.book_unit}</span>
                            <span className="text-xs text-slate-400 ml-2">{score.test_type} · {score.date}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-slate-800">{score.score}</span>
                            <span className="text-sm text-slate-400">/{score.total}</span>
                          </div>
                        </div>
                        <VPProgressBar vp={score.score} max={score.total} size="sm" />
                        {score.note && <p className="text-xs text-slate-500 mt-2 italic">{score.note}</p>}
                        {score.reviews.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-slate-100">
                            <p className="text-xs text-slate-500 font-semibold mb-1">{t('sc_retestRecord')}</p>
                            {score.reviews.map((r) => (
                              <div key={r.id} className="flex items-center gap-2 text-xs text-slate-600">
                                <span className="text-slate-400">{r.attempt_date}</span>
                                <span className="font-semibold text-green-600">{r.score}/{r.total}점</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">{t('sc_empty')}</p>
                )}
              </div>
            )}

            {/* ─── ATTITUDE ─── */}
            {activeTab === 'attitude' && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('att_title')}</h3>
                {attitudes.length > 0 ? (
                  <div className="space-y-4">
                    {attitudes.map((att) => (
                      <div key={att.id} className="bg-white border border-slate-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold text-slate-700">
                            {formatYearMonth(att.year, att.month, lang)}
                          </h4>
                          <div className="flex items-center gap-2">
                            <span className={cn('text-2xl font-black', getGradeColor(att.grade))}>{att.grade}</span>
                            <span className="text-lg font-bold text-slate-700">{att.total}점</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {Object.entries(att.categories).map(([key, val]) => (
                            <div key={key}>
                              <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>{t(AC_KEYS[key] ?? 'ac_participation')}</span>
                                <span className="font-semibold">{val} / 20</span>
                              </div>
                              <VPProgressBar vp={val} max={20} size="sm" />
                            </div>
                          ))}
                        </div>
                        {att.note && <p className="text-xs text-slate-500 mt-3 italic border-t border-slate-100 pt-3">{att.note}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">{t('att_empty')}</p>
                )}
              </div>
            )}

            {/* ─── MAKEUP ─── */}
            {activeTab === 'makeup' && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('mk_title')}</h3>
                {makeup.length > 0 ? (
                  <div className="space-y-3">
                    {makeup.map((m) => (
                      <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-700">
                            {t('mk_absent')}: <span className="font-semibold">{m.absent_date}</span>
                            {m.makeup_date && (
                              <> → {t('mk_makeup')}: <span className="font-semibold text-green-700">{m.makeup_date}</span></>
                            )}
                          </p>
                          {m.topic_title && <p className="text-xs text-slate-500 mt-0.5">{t('mk_topic')}: {m.topic_title}</p>}
                          {m.note && <p className="text-xs text-slate-500 mt-0.5 italic">{m.note}</p>}
                        </div>
                        <MakeupStatusBadge status={m.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">{t('mk_empty')}</p>
                )}
              </div>
            )}

            {/* ─── REPORT ─── */}
            {activeTab === 'report' && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">{t('rep_title')}</h3>
                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className={cn(
                        'bg-white border rounded-2xl p-5',
                        report.status === 'published' ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200'
                      )}>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              {formatYearMonth(report.year, report.month, lang)}
                            </h4>
                            <p className="text-xs text-slate-400 mt-0.5">{report.report_code}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setHideVP(!hideVP)}
                              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
                              title={hideVP ? t('rep_vpShow') : t('rep_vpHide')}
                            >
                              {hideVP ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <ReportStatusBadge status={report.status} />
                          </div>
                        </div>

                        {/* Status stepper */}
                        <div className="mb-5">
                          <ReportStatusStepper status={report.status} />
                        </div>

                        {/* Stats grid */}
                        <div className="grid grid-cols-4 gap-3 mb-4">
                          {!hideVP && (
                            <div className="text-center bg-slate-50 rounded-xl p-3">
                              <p className="text-xl font-black text-slate-800">{report.total_vp_earned.toFixed(1)}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{t('rep_vpLabel')}</p>
                            </div>
                          )}
                          {!hideVP && (
                            <div className="text-center bg-violet-50 rounded-xl p-3">
                              <p className="text-xl font-black text-violet-700">{report.total_homework_vp_earned.toFixed(1)}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{t('rep_svpLabel')}</p>
                            </div>
                          )}
                          <div className="text-center bg-slate-50 rounded-xl p-3">
                            <p className="text-xl font-black text-slate-800">{report.average_test_score ?? '—'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{t('rep_avgScore')}</p>
                          </div>
                          <div className="text-center bg-slate-50 rounded-xl p-3">
                            <p className="text-xl font-black text-slate-800">{report.total_attitude_score ?? '—'}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{t('rep_attitudeScore')}</p>
                          </div>
                        </div>

                        {/* Books progress */}
                        {report.books_progress.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-slate-600 mb-2">{t('rep_booksProgress')}</p>
                            {report.books_progress.map((bp) => (
                              <div key={bp.book_id} className="mb-2">
                                <div className="flex justify-between text-xs text-slate-500 mb-1">
                                  <span className="truncate">{bp.book_title}</span>
                                  <span className="font-semibold shrink-0 ml-2">{bp.topics_completed}/{bp.topics_total} {t('rep_topics')}</span>
                                </div>
                                <VPProgressBar vp={bp.topics_completed} max={bp.topics_total} size="sm" />
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Teacher comments */}
                        {report.teacher_comments && (
                          <div className="bg-indigo-50 rounded-xl p-3 mt-3">
                            <p className="text-xs font-semibold text-indigo-700 mb-1">{t('rep_teacherComment')}</p>
                            <p className="text-xs text-slate-600 leading-relaxed">{report.teacher_comments}</p>
                          </div>
                        )}

                        {report.status === 'published' && report.published_at && (
                          <p className="text-xs text-blue-500 mt-3">📌 {report.published_at} {t('rep_publishedNote')}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-12">{t('rep_empty')}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShellA>
  );
}
