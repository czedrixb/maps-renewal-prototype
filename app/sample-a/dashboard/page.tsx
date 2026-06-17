'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TrendingUp, Users, AlertCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

import { AppShellA } from '@/components/sample-a/AppShellA';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { VPRing } from '@/components/shared/VPProgressBar';
import { PlanStatusBadge } from '@/components/shared/StatusBadge';
import { getStudents, getLearningPlans, getMonthlyReports } from '@/lib/mock/api';
import { useLanguage } from '@/lib/i18n';
import type { Student, LearningPlan, MonthlyReport } from '@/lib/types';

export default function DashboardAPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getStudents({ status: 'active', teacher_id: 101 }),
      getLearningPlans(),
      getMonthlyReports(),
    ]).then(([s, p, r]) => {
      setStudents(s);
      setPlans(p);
      setReports(r);
      setLoading(false);
    });
  }, []);

  const pendingApprovals = plans.filter((p) => p.status === 'pending_approval');
  const pendingReports = reports.filter((r) => r.status === 'pending_review');
  const activeStudents = students.filter((s) => s.status === 'active');

  if (loading) {
    return (
      <AppShellA breadcrumbs={[{ label: t('dash_title') }]}>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShellA>
    );
  }

  return (
    <AppShellA breadcrumbs={[{ label: t('dash_title') }]}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-xl font-bold text-slate-800">{t('dash_welcome')} 👋</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('dash_date')}</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('dash_myStudents')}</span>
              <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{activeStudents.length}</p>
            <p className="text-xs text-slate-400 mt-1">{t('dash_activeCount')}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('dash_vpAvg')}</span>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">6.2</p>
            <p className="text-xs text-slate-400 mt-1">{t('dash_vpTarget')}</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{t('dash_pendingItems')}</span>
              <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-800">{pendingApprovals.length + pendingReports.length}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-400">{t('dash_planApproval')} {pendingApprovals.length}</span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-400">{t('dash_reportReview')} {pendingReports.length}</span>
            </div>
          </div>
        </div>

        {/* Student Progress Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">{t('dash_studentProgress')}</h2>
            <Link href="/sample-a/students" className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              {t('dash_viewAll')} <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {students.slice(0, 4).map((student) => {
              const plan = plans.find((p) => p.student_id === student.id && p.status === 'active');
              const allTopics = plan?.schedule.flatMap((b) => b.topics) ?? [];
              const vpEarned = allTopics.filter((t) => t.status === 'completed').reduce((s, t) => s + t.vp_allocation, 0);
              const vpTotal = allTopics.reduce((s, t) => s + t.vp_allocation, 0);

              return (
                <Link
                  key={student.id}
                  href={`/sample-a/students/${student.id}`}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  <div className="relative shrink-0">
                    <VPRing vp={vpEarned} total={vpTotal} size={52} strokeWidth={5} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-slate-600">
                        {vpTotal > 0 ? Math.round((vpEarned / vpTotal) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-sm font-semibold text-slate-800 truncate">{student.name}</span>
                      <GroupBadge group={student.group} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500">
                      {vpEarned.toFixed(1)} / {vpTotal.toFixed(1)} VP
                    </p>
                    {plan ? (
                      <PlanStatusBadge status={plan.status} className="mt-1" />
                    ) : (
                      <span className="text-xs text-slate-400 mt-1 inline-block">{t('dash_noPlan')}</span>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Pending Actions */}
        {(pendingApprovals.length > 0 || pendingReports.length > 0) && (
          <div>
            <h2 className="text-sm font-semibold text-slate-700 mb-3">{t('dash_pendingActions')}</h2>
            <div className="space-y-2">
              {pendingApprovals.map((plan) => (
                <div key={plan.id} className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      <span className="font-semibold">{plan.student_name}</span>{' '}
                      {t('dash_planApproval')}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{t('dash_startDate')}: {plan.start_date}</p>
                  </div>
                  <Link href={`/sample-a/learning-plans?student=${plan.student_id}`} className="text-xs font-semibold text-amber-700 hover:text-amber-800 shrink-0">
                    {t('dash_reviewLink')}
                  </Link>
                </div>
              ))}
              {pendingReports.map((report) => (
                <div key={report.id} className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-700">
                      <span className="font-semibold">{report.student_name}</span>{' '}
                      {report.month}{t('dash_reportReview')}
                    </p>
                  </div>
                  <Link href="/sample-a/monitoring" className="text-xs font-semibold text-blue-700 hover:text-blue-800 shrink-0">
                    {t('dash_reviewLink')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShellA>
  );
}
