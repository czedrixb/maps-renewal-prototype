'use client';

// ─── QuickActionStrip ─────────────────────────────────────────────────────────
// Self-contained collapsible quick-action strip: add absence/makeup, test score,
// or attitude evaluation. Shared by Sample A, B, and C.
// Parents listen via onSaved(kind) and refetch whatever list they need.

import { useState } from 'react';
import { Plus, ChevronUp } from 'lucide-react';
import { addMakeupSession, addTestScore, upsertAttitude } from '@/lib/mock/api';
import { getAttitudeGrade, getGradeColor } from '@/lib/vp';
import { useLanguage, TranslationKey } from '@/lib/i18n';
import { cn } from '@/lib/utils';

// ── Accent color maps (static strings for Tailwind scan) ─────────────────────

const BTN_OPEN: Record<'indigo' | 'sky' | 'emerald', string> = {
  indigo:  'bg-indigo-600 text-white border-indigo-600',
  sky:     'bg-sky-600 text-white border-sky-600',
  emerald: 'bg-emerald-600 text-white border-emerald-600',
};

const BTN_IDLE: Record<'indigo' | 'sky' | 'emerald', string> = {
  indigo:  'bg-white text-slate-600 border-slate-200 hover:border-indigo-400 hover:text-indigo-600',
  sky:     'bg-white text-slate-600 border-slate-200 hover:border-sky-400 hover:text-sky-600',
  emerald: 'bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-600',
};

const BTN_SAVE: Record<'indigo' | 'sky' | 'emerald', string> = {
  indigo:  'bg-indigo-600 hover:bg-indigo-700 text-white',
  sky:     'bg-sky-600 hover:bg-sky-700 text-white',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white',
};

const RING: Record<'indigo' | 'sky' | 'emerald', string> = {
  indigo:  'focus:ring-indigo-400',
  sky:     'focus:ring-sky-400',
  emerald: 'focus:ring-emerald-400',
};

const RANGE: Record<'indigo' | 'sky' | 'emerald', string> = {
  indigo:  'accent-indigo-600',
  sky:     'accent-sky-600',
  emerald: 'accent-emerald-600',
};

// ── Props ─────────────────────────────────────────────────────────────────────

type ActionKind = 'absent' | 'score' | 'attitude';

export interface QuickActionStripProps {
  studentId: number;
  studentName: string;
  today?: string;
  accent?: 'indigo' | 'sky' | 'emerald';
  /** Which action buttons to show. Defaults to all three. */
  actions?: ActionKind[];
  /** Called after a successful save so the parent can refetch its list. */
  onSaved?: (kind: ActionKind) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function QuickActionStrip({
  studentId,
  studentName,
  today = '2026-06-15',
  accent = 'emerald',
  actions = ['absent', 'score', 'attitude'],
  onSaved,
}: QuickActionStripProps) {
  const { t } = useLanguage();

  const [quickPanel, setQuickPanel] = useState<ActionKind | null>(null);

  // Absent / makeup form state
  const [absentDate, setAbsentDate] = useState(today);
  const [makeupDate, setMakeupDate] = useState('');
  const [makeupNote, setMakeupNote] = useState('');

  // Score form state
  const [scoreUnit, setScoreUnit]   = useState('');
  const [scoreVal, setScoreVal]     = useState('');
  const [scoreTotal, setScoreTotal] = useState('100');
  const [scoreType, setScoreType]   = useState('단원 테스트');

  // Attitude form state
  const [attMonth, setAttMonth] = useState(today.slice(0, 7));
  const [attCats, setAttCats]   = useState({
    participation: 15, homework: 15, attitude: 15, effort: 15, improvement: 15,
  });
  const attTotal = Object.values(attCats).reduce((a, b) => a + b, 0);
  const attGrade = getAttitudeGrade(attTotal);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveAbsent = async () => {
    await addMakeupSession({
      student_id: studentId,
      student_name: studentName,
      absent_date: absentDate,
      makeup_date: makeupDate || null,
      status: makeupDate ? 'scheduled' : 'pending',
      note: makeupNote || undefined,
    });
    setMakeupDate('');
    setMakeupNote('');
    setQuickPanel(null);
    onSaved?.('absent');
  };

  const handleSaveScore = async () => {
    if (!scoreUnit || !scoreVal) return;
    await addTestScore({
      student_id: studentId,
      student_name: studentName,
      date: today,
      score: parseInt(scoreVal),
      total: parseInt(scoreTotal),
      test_type: scoreType,
      book_unit: scoreUnit,
    });
    setScoreUnit('');
    setScoreVal('');
    setQuickPanel(null);
    onSaved?.('score');
  };

  const handleSaveAttitude = async () => {
    const [yr, mo] = attMonth.split('-').map(Number);
    await upsertAttitude({
      student_id: studentId,
      student_name: studentName,
      year: yr,
      month: mo,
      categories: attCats,
    });
    setQuickPanel(null);
    onSaved?.('attitude');
  };

  // ── Shared input class ───────────────────────────────────────────────────────

  const inputCls = cn(
    'w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 bg-white',
    RING[accent]
  );

  const saveBtnCls = cn(
    'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
    BTN_SAVE[accent]
  );

  const cancelBtnCls =
    'px-3 py-1.5 text-slate-500 text-xs font-semibold rounded-lg hover:bg-slate-100 transition-colors';

  // ── Labels ───────────────────────────────────────────────────────────────────

  const ACTION_LABELS: Record<ActionKind, string> = {
    absent:   t('cls_addAbsent'),
    score:    t('cls_addScore'),
    attitude: t('cls_addAttitude'),
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div>
      <p className="text-xs font-semibold text-slate-700 mb-2">{t('cls_quickActions')}</p>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {actions.map((panel) => {
          const isOpen = quickPanel === panel;
          return (
            <button
              key={panel}
              onClick={() => setQuickPanel(isOpen ? null : panel)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                isOpen ? BTN_OPEN[accent] : BTN_IDLE[accent]
              )}
            >
              {isOpen ? <ChevronUp className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
              {ACTION_LABELS[panel]}
            </button>
          );
        })}
      </div>

      {/* ── Absent / Makeup form ───────────────────────────────────────────── */}
      {quickPanel === 'absent' && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t('cls_absentDate')}</label>
              <input
                type="date"
                value={absentDate}
                onChange={(e) => setAbsentDate(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t('cls_makeupDate')}</label>
              <input
                type="date"
                value={makeupDate}
                onChange={(e) => setMakeupDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <input
            type="text"
            value={makeupNote}
            onChange={(e) => setMakeupNote(e.target.value)}
            placeholder={t('cls_makeupNote')}
            className={inputCls}
          />
          <div className="flex gap-2">
            <button onClick={handleSaveAbsent} className={saveBtnCls}>{t('cls_save')}</button>
            <button onClick={() => setQuickPanel(null)} className={cancelBtnCls}>{t('cls_cancel')}</button>
          </div>
        </div>
      )}

      {/* ── Score form ─────────────────────────────────────────────────────── */}
      {quickPanel === 'score' && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <input
            type="text"
            value={scoreUnit}
            onChange={(e) => setScoreUnit(e.target.value)}
            placeholder={t('cls_scoreTopic')}
            className={inputCls}
          />
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t('cls_scoreValue')}</label>
              <input
                type="number"
                value={scoreVal}
                onChange={(e) => setScoreVal(e.target.value)}
                min={0}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t('cls_scoreTotal')}</label>
              <input
                type="number"
                value={scoreTotal}
                onChange={(e) => setScoreTotal(e.target.value)}
                min={1}
                className={inputCls}
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t('cls_scoreType')}</label>
              <input
                type="text"
                value={scoreType}
                onChange={(e) => setScoreType(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveScore} className={saveBtnCls}>{t('cls_save')}</button>
            <button onClick={() => setQuickPanel(null)} className={cancelBtnCls}>{t('cls_cancel')}</button>
          </div>
        </div>
      )}

      {/* ── Attitude form ──────────────────────────────────────────────────── */}
      {quickPanel === 'attitude' && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div>
              <label className="text-[10px] text-slate-500 block mb-1">{t('cls_attMonth')}</label>
              <input
                type="month"
                value={attMonth}
                onChange={(e) => setAttMonth(e.target.value)}
                className={cn(
                  'px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1',
                  RING[accent]
                )}
              />
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-black text-slate-800">
                {attTotal}<span className="text-xs font-normal text-slate-400">/100</span>
              </p>
              <p className={cn('text-sm font-black', getGradeColor(attGrade))}>{attGrade}등급</p>
            </div>
          </div>
          {(Object.keys(attCats) as Array<keyof typeof attCats>).map((cat) => (
            <div key={cat}>
              <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                <span>{t(('ac_' + cat) as TranslationKey)}</span>
                <span className="font-semibold">{attCats[cat]} / 20</span>
              </div>
              <input
                type="range"
                min={0}
                max={20}
                step={5}
                value={attCats[cat]}
                onChange={(e) => setAttCats((prev) => ({ ...prev, [cat]: parseInt(e.target.value) }))}
                className={cn('w-full', RANGE[accent])}
              />
            </div>
          ))}
          <div className="flex gap-2 mt-2">
            <button onClick={handleSaveAttitude} className={saveBtnCls}>{t('cls_save')}</button>
            <button onClick={() => setQuickPanel(null)} className={cancelBtnCls}>{t('cls_cancel')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
