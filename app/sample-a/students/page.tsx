'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, ArrowRight } from 'lucide-react';

import { AppShellA } from '@/components/sample-a/AppShellA';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { VPProgressBar } from '@/components/shared/VPProgressBar';
import { PlanStatusBadge } from '@/components/shared/StatusBadge';
import { getStudents, getLearningPlans } from '@/lib/mock/api';
import { useLanguage } from '@/lib/i18n';
import type { Student, LearningPlan } from '@/lib/types';

const GROUP_CODES = ['HN', 'AC', 'RS', 'ST'] as const;

export default function StudentsAPage() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<Student[]>([]);
  const [plans, setPlans] = useState<LearningPlan[]>([]);
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getLearningPlans()]).then(([s, p]) => {
      setStudents(s);
      setPlans(p);
      setLoading(false);
    });
  }, []);

  const filtered = students.filter((s) => {
    const matchSearch = s.name.includes(search);
    const matchGroup = groupFilter === 'ALL' || s.group === groupFilter;
    return matchSearch && matchGroup;
  });

  return (
    <AppShellA breadcrumbs={[{ label: t('nav_students') }]}>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-xl font-bold text-slate-800">{t('stu_title')}</h1>
          <span className="text-sm text-slate-500">{students.filter((s) => s.status === 'active').length}{t('stu_activeCount')}</span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('stu_search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 bg-white"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => setGroupFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                groupFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {t('stu_all')}
            </button>
            {GROUP_CODES.map((g) => (
              <button
                key={g}
                onClick={() => setGroupFilter(g)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  groupFilter === g ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((student) => {
              const plan = plans.find((p) => p.student_id === student.id && (p.status === 'active' || p.status === 'approved'));
              const allTopics = plan?.schedule.flatMap((b) => b.topics) ?? [];
              const vpEarned = allTopics.filter((t) => t.status === 'completed').reduce((s, t) => s + t.vp_allocation, 0);
              const vpTotal = allTopics.reduce((s, t) => s + t.vp_allocation, 0);

              return (
                <Link
                  key={student.id}
                  href={`/sample-a/students/${student.id}`}
                  className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-sm transition-all group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-sm font-bold shrink-0">
                    {student.name[0]}
                  </div>

                  {/* Name + group */}
                  <div className="w-32 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800">{student.name}</span>
                      <GroupBadge group={student.group} size="sm" />
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{student.teacher_name}</p>
                  </div>

                  {/* VP bar */}
                  <div className="flex-1 min-w-0">
                    {plan ? (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">{t('stu_vpProgress')}</span>
                          <span className="text-xs font-semibold text-slate-600">
                            {vpEarned.toFixed(1)} / {vpTotal.toFixed(1)} VP
                          </span>
                        </div>
                        <VPProgressBar vp={vpEarned} max={vpTotal} size="sm" />
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">{t('stu_noPlan')}</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="w-24 text-right shrink-0">
                    {plan ? (
                      <PlanStatusBadge status={plan.status} />
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                    <p className={`text-xs mt-1 ${student.status === 'active' ? 'text-green-600' : 'text-slate-400'}`}>
                      {student.status === 'active' ? t('stu_active') : t('stu_inactive')}
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-400 transition-colors shrink-0" />
                </Link>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-sm">{t('stu_noResults')}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShellA>
  );
}
