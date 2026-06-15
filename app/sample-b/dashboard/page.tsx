'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, AlertCircle, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

import { AppShellB } from '@/components/sample-b/AppShellB';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { PlanStatusBadge, ReportStatusBadge } from '@/components/shared/StatusBadge';
import { VPProgressBar } from '@/components/shared/VPProgressBar';
import { getStudents, getLearningPlans, getMonthlyReports } from '@/lib/mock/api';
import { useLanguage } from '@/lib/i18n';
import type { Student, LearningPlan, MonthlyReport } from '@/lib/types';

export default function DashboardBPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getLearningPlans(), getMonthlyReports()]).then(([s, p, r]) => {
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
      <AppShellB breadcrumbs={[{ label: t('dash_title') }]}>
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShellB>
    );
  }

  return (
    <AppShellB breadcrumbs={[{ label: t('dash_title') }]}>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{t('dash_title')}</h1>
            <p className="text-sm text-gray-500 mt-0.5">{t('dash_date')}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { labelKey: 'dash_totalStudents' as const, value: students.length, subKey: 'dash_activeCount' as const, subValue: activeStudents.length, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
            { labelKey: 'dash_activePlans' as const, value: plans.filter((p) => p.status === 'active').length, subKey: 'dash_activePlansSub' as const, subValue: null, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
            { labelKey: 'dash_pendingApproval' as const, value: pendingApprovals.length, subKey: 'dash_pendingApprovalSub' as const, subValue: null, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { labelKey: 'dash_vpAvg' as const, value: '6.2', subKey: 'dash_vpTarget' as const, subValue: null, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((stat) => {
            const Icon = stat.icon;
            const sub = stat.subValue !== null
              ? `${t('stu_active')} ${stat.subValue}${t('stu_count')}`
              : t(stat.subKey);
            return (
              <div key={stat.labelKey} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-500">{t(stat.labelKey)}</span>
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-5 gap-4">
          {/* Student progress table */}
          <div className="col-span-3 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">{t('dash_studentProgress')}</h2>
              <Link href="/sample-b/students" className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1">
                {t('dash_viewAll')} <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="text-left px-4 py-2 font-semibold">{t('mon_student')}</th>
                  <th className="text-left px-4 py-2 font-semibold w-28">{t('dash_progress')}</th>
                  <th className="text-right px-4 py-2 font-semibold">{t('dash_vp')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {students.slice(0, 5).map((s) => {
                  const plan = plans.find((p) => p.student_id === s.id && p.status === 'active');
                  const all = plan?.schedule.flatMap((b) => b.topics) ?? [];
                  const earned = all.filter((tp) => tp.status === 'completed').reduce((sum, tp) => sum + tp.vp_allocation, 0);
                  const total = all.reduce((sum, tp) => sum + tp.vp_allocation, 0);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50 transition-colors cursor-pointer group">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">{s.name[0]}</div>
                          <span className="font-medium text-gray-800 group-hover:text-sky-700">{s.name}</span>
                          <GroupBadge group={s.group} size="sm" />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <VPProgressBar vp={earned} max={total} size="sm" />
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-gray-700">
                        {earned.toFixed(1)} / {total.toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pending actions */}
          <div className="col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-700">{t('dash_pendingActions')}</h2>
            </div>
            <div className="p-3 space-y-2">
              {pendingApprovals.map((plan) => (
                <div key={plan.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-100">
                  <Clock className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 leading-snug">
                      <span className="font-semibold">{plan.student_name}</span> {t('dash_planApproval')}
                    </p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{t('dash_startDate')} {plan.start_date}</p>
                  </div>
                </div>
              ))}
              {pendingReports.map((r) => (
                <div key={r.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-blue-50 border border-blue-100">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-700 leading-snug">
                      <span className="font-semibold">{r.student_name}</span> {r.month}{t('dash_reportReview')}
                    </p>
                    <ReportStatusBadge status={r.status} className="mt-1" />
                  </div>
                </div>
              ))}
              {pendingApprovals.length === 0 && pendingReports.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-6">{t('dash_noPending')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShellB>
  );
}
