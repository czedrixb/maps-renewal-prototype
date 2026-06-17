'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, BookOpen, BarChart2, Heart, ChevronRight, Phone, Calendar } from 'lucide-react';

import { AppShellB } from '@/components/sample-b/AppShellB';
import { GroupBadge } from '@/components/shared/GroupBadge';
import { VPProgressBar } from '@/components/shared/VPProgressBar';
import { PlanStatusBadge, MakeupStatusBadge } from '@/components/shared/StatusBadge';
import { EditableTopicList } from '@/components/shared/EditableTopicList';
import { QuickActionStrip } from '@/components/shared/QuickActionStrip';
import {
  getStudents, getLearningPlans, getStudentProgress,
  getTestScores, getAttitudeEvaluations, getMakeupSessions,
  toggleTopicStatus, setHomeworkStatus,
} from '@/lib/mock/api';
import { cn, formatDate } from '@/lib/utils';
import { getGradeColor } from '@/lib/vp';
import { HW_CYCLE, toggleTopicInSchedule, cycleHWInSchedule, recomputeFromSchedule } from '@/lib/progress';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import type { Student, LearningPlan, MonthlyBlock, HomeworkStatus, MakeupSession } from '@/lib/types';

const GROUP_CODES = ['HN', 'AC', 'RS', 'ST'];

function StudentsBContent() {
  const { lang, t } = useLanguage();
  const searchParams = useSearchParams();

  const [students, setStudents]   = useState<Student[]>([]);
  const [plans, setPlans]         = useState<LearningPlan[]>([]);
  const [search, setSearch]       = useState('');
  const [groupFilter, setGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'active' | 'inactive' | 'graduated'>('ALL');
  const [selectedId, setSelectedId]   = useState<number | null>(null);
  const [detailData, setDetailData]   = useState<{
    progress: Awaited<ReturnType<typeof getStudentProgress>>;
    scores:   Awaited<ReturnType<typeof getTestScores>>;
    attitudes: Awaited<ReturnType<typeof getAttitudeEvaluations>>;
    makeups:  MakeupSession[];
  } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading]             = useState(true);

  // Local schedule for optimistic topic edits
  const [localSchedule, setLocalSchedule] = useState<MonthlyBlock[]>([]);

  useEffect(() => {
    const selectParam = searchParams.get('select');
    Promise.all([getStudents(), getLearningPlans()]).then(([s, p]) => {
      setStudents(s);
      setPlans(p);
      setLoading(false);

      if (selectParam) {
        const id = parseInt(selectParam, 10);
        if (!s.find((st) => st.id === id)) return;
        setSelectedId(id);
        setDetailLoading(true);
        const activePlan = p.find((pl) => pl.student_id === id && (pl.status === 'active' || pl.status === 'approved'));
        setLocalSchedule(activePlan?.schedule ? JSON.parse(JSON.stringify(activePlan.schedule)) : []);
        Promise.all([
          getStudentProgress(id),
          getTestScores({ student_id: id }),
          getAttitudeEvaluations({ student_id: id }),
          getMakeupSessions({ student_id: id }),
        ]).then(([progress, scores, attitudes, makeups]) => {
          setDetailData({ progress, scores, attitudes, makeups });
          setDetailLoading(false);
        });
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectStudent = async (id: number) => {
    if (selectedId === id) {
      setSelectedId(null);
      setDetailData(null);
      setLocalSchedule([]);
      return;
    }
    setSelectedId(id);
    setDetailLoading(true);
    // Seed local schedule from the active plan before async loads
    const activePlan = plans.find((p) => p.student_id === id && (p.status === 'active' || p.status === 'approved'));
    setLocalSchedule(activePlan?.schedule ? JSON.parse(JSON.stringify(activePlan.schedule)) : []);
    const [progress, scores, attitudes, makeups] = await Promise.all([
      getStudentProgress(id),
      getTestScores({ student_id: id }),
      getAttitudeEvaluations({ student_id: id }),
      getMakeupSessions({ student_id: id }),
    ]);
    setDetailData({ progress, scores, attitudes, makeups });
    setDetailLoading(false);
  };

  // ── Inline editing handlers ──────────────────────────────────────────────────

  const handleToggleTopic = useCallback(async (topicId: number) => {
    if (!selectedId) return;
    const newSchedule = toggleTopicInSchedule(localSchedule, topicId);
    const recomputed  = recomputeFromSchedule(newSchedule);
    setLocalSchedule(newSchedule);
    setDetailData((prev) => prev ? {
      ...prev,
      progress: prev.progress ? { ...prev.progress, ...recomputed } : prev.progress,
    } : prev);
    await toggleTopicStatus(selectedId, topicId);
  }, [localSchedule, selectedId]);

  const handleCycleHW = useCallback(async (topicId: number, current: HomeworkStatus) => {
    if (!selectedId) return;
    const nextStatus  = HW_CYCLE[(HW_CYCLE.indexOf(current) + 1) % HW_CYCLE.length];
    const newSchedule = cycleHWInSchedule(localSchedule, topicId, nextStatus);
    const recomputed  = recomputeFromSchedule(newSchedule);
    setLocalSchedule(newSchedule);
    setDetailData((prev) => prev ? {
      ...prev,
      progress: prev.progress ? { ...prev.progress, ...recomputed } : prev.progress,
    } : prev);
    await setHomeworkStatus(selectedId, topicId, nextStatus);
  }, [localSchedule, selectedId]);

  // ── Quick-action refetch ─────────────────────────────────────────────────────

  const handleSaved = useCallback(async (kind: 'absent' | 'score' | 'attitude') => {
    if (!selectedId) return;
    if (kind === 'absent') {
      const makeups = await getMakeupSessions({ student_id: selectedId });
      setDetailData((prev) => prev ? { ...prev, makeups } : prev);
    } else if (kind === 'score') {
      const scores = await getTestScores({ student_id: selectedId });
      setDetailData((prev) => prev ? { ...prev, scores } : prev);
    } else {
      const attitudes = await getAttitudeEvaluations({ student_id: selectedId });
      setDetailData((prev) => prev ? { ...prev, attitudes } : prev);
    }
  }, [selectedId]);

  // ─────────────────────────────────────────────────────────────────────────────

  const STATUS_FILTER_ITEMS: { value: 'ALL' | 'active' | 'inactive' | 'graduated'; labelKey: TranslationKey }[] = [
    { value: 'ALL',       labelKey: 'stu_all' },
    { value: 'active',    labelKey: 'sf_active' },
    { value: 'inactive',  labelKey: 'sf_inactive' },
    { value: 'graduated', labelKey: 'sf_graduated' },
  ];

  const filtered = students.filter((s) => {
    const matchSearch = s.name.includes(search);
    const matchGroup  = groupFilter === 'ALL' || s.group === groupFilter;
    const matchStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchSearch && matchGroup && matchStatus;
  });

  const selectedStudent = students.find((s) => s.id === selectedId);
  const selectedPlan    = selectedId
    ? plans.find((p) => p.student_id === selectedId && (p.status === 'active' || p.status === 'approved'))
    : null;

  return (
    <AppShellB breadcrumbs={[{ label: t('nav_studentsManage') }]}>
      <div className="flex h-full overflow-hidden">

        {/* Left panel: student list */}
        <div className={cn('flex flex-col bg-white border-r border-gray-200 transition-all duration-300', selectedId ? 'w-80' : 'flex-1')}>
          {/* Header + Filters */}
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="text-sm font-semibold text-gray-800">{t('stu_title')}</h1>
              <span className="text-xs text-gray-400">{filtered.length}{t('stu_count')}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder={t('stu_searchShort')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-300 bg-white"
              />
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setGroupFilter('ALL')}
                className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors', groupFilter === 'ALL' ? 'bg-sky-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
              >
                {t('stu_all')}
              </button>
              {GROUP_CODES.map((g) => (
                <button
                  key={g}
                  onClick={() => setGroupFilter(g)}
                  className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors', groupFilter === g ? 'bg-sky-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
                >
                  {g}
                </button>
              ))}
            </div>
            {/* Status filter */}
            <div className="flex items-center gap-1 mt-1">
              {STATUS_FILTER_ITEMS.map(({ value, labelKey }) => (
                <button
                  key={value}
                  onClick={() => setStatusFilter(value)}
                  className={cn('px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors', statusFilter === value ? 'bg-sky-600 text-white' : 'text-gray-500 hover:bg-gray-100')}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              filtered.map((student) => {
                const plan       = plans.find((p) => p.student_id === student.id && (p.status === 'active' || p.status === 'approved'));
                const isSelected = selectedId === student.id;

                return (
                  <button
                    key={student.id}
                    onClick={() => handleSelectStudent(student.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 border-b border-gray-50 text-left transition-colors group',
                      isSelected ? 'bg-sky-50 border-l-2 border-l-sky-500' : 'hover:bg-gray-50'
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {student.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn('text-sm font-semibold truncate', isSelected ? 'text-sky-700' : 'text-gray-800')}>
                          {student.name}
                        </span>
                        <GroupBadge group={student.group} size="sm" />
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{student.teacher_name}</p>
                    </div>
                    {plan ? <PlanStatusBadge status={plan.status} /> : null}
                    <ChevronRight className={cn('w-3.5 h-3.5 shrink-0 transition-colors', isSelected ? 'text-sky-400 rotate-90' : 'text-gray-300')} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right panel: detail drawer */}
        {selectedId && (
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {detailLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : selectedStudent && (
              <div className="p-5 space-y-5">

                {/* Student header */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl font-bold">
                        {selectedStudent.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-gray-900">{selectedStudent.name}</h2>
                          <GroupBadge group={selectedStudent.group} showFull />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t('sw_teacher')} {selectedStudent.teacher_name} · {t('sw_enrolled')} {formatDate(selectedStudent.enrolled_at, lang)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedId(null); setDetailData(null); setLocalSchedule([]); }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {selectedStudent.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <Phone className="w-3 h-3" />
                      {selectedStudent.phone}
                    </div>
                  )}
                </div>

                {/* VP Progress summary */}
                {detailData?.progress && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-4 h-4 text-sky-600" />
                      <h3 className="text-sm font-semibold text-gray-700">{t('stu_vpProgress')}</h3>
                      {selectedPlan && <PlanStatusBadge status={selectedPlan.status} />}
                    </div>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>{t('ov_vpLabel')}</span>
                          <span className="font-semibold">{detailData.progress.vp_earned.toFixed(1)} / {detailData.progress.vp_total.toFixed(1)}</span>
                        </div>
                        <VPProgressBar vp={detailData.progress.vp_earned} max={detailData.progress.vp_total} size="md" />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{t('dash_progress')}</span>
                        <span className="font-bold text-gray-800">{detailData.progress.completion_percentage}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{t('ov_svpLabel')}</span>
                        <span className="font-bold text-violet-600">{detailData.progress.svp_earned.toFixed(1)} VP</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Editable topic list */}
                {localSchedule.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{t('cls_progressTitle')}</h3>
                    <EditableTopicList
                      schedule={localSchedule}
                      accent="sky"
                      onToggleTopic={handleToggleTopic}
                      onCycleHW={handleCycleHW}
                    />
                  </div>
                )}

                {/* Recent test scores */}
                {detailData?.scores && detailData.scores.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart2 className="w-4 h-4 text-sky-600" />
                      <h3 className="text-sm font-semibold text-gray-700">{t('ov_recentScore')}</h3>
                    </div>
                    <div className="space-y-2">
                      {detailData.scores.slice(0, 3).map((score) => (
                        <div key={score.id} className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-600 truncate">{score.book_unit} · {score.date}</p>
                            <VPProgressBar vp={score.score} max={score.total} size="sm" className="mt-1" />
                          </div>
                          <span className="text-sm font-black text-gray-800 shrink-0">{score.score}{lang === 'ko' ? '점' : 'pts'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attitude */}
                {detailData?.attitudes && detailData.attitudes.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4 text-sky-600" />
                        <h3 className="text-sm font-semibold text-gray-700">{t('ov_attitude')}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn('text-2xl font-black', getGradeColor(detailData.attitudes[0].grade))}>
                          {detailData.attitudes[0].grade}
                        </span>
                        <span className="text-sm font-bold text-gray-700">{detailData.attitudes[0].total}{lang === 'ko' ? '점' : 'pts'}</span>
                      </div>
                    </div>
                    <VPProgressBar vp={detailData.attitudes[0].total} max={100} size="sm" />
                  </div>
                )}

                {/* Makeup sessions */}
                {detailData?.makeups && detailData.makeups.length > 0 && (
                  <div className="bg-white rounded-xl border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <h3 className="text-sm font-semibold text-gray-700">{t('mk_title')}</h3>
                    </div>
                    <div className="space-y-2">
                      {detailData.makeups.slice(0, 4).map((m) => (
                        <div key={m.id} className="flex items-center gap-2 text-xs text-gray-600">
                          <span>{t('mk_absent')}: <b>{m.absent_date}</b></span>
                          {m.makeup_date && (
                            <span>→ {t('mk_makeup')}: <b className="text-green-700">{m.makeup_date}</b></span>
                          )}
                          <MakeupStatusBadge status={m.status} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick actions — all three */}
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <QuickActionStrip
                    studentId={selectedId}
                    studentName={selectedStudent.name}
                    accent="sky"
                    onSaved={handleSaved}
                  />
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </AppShellB>
  );
}

export default function StudentsBPage() {
  return (
    <Suspense>
      <StudentsBContent />
    </Suspense>
  );
}
