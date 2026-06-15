import type { Topic } from './types';

// ─── VP Color Thresholds ──────────────────────────────────────────────────────
// 0–7 VP: green  |  8–9 VP: yellow  |  10 VP: blue  |  >10 VP: red

export function getVPBarColor(vp: number, max = 10): string {
  if (vp > max) return 'bg-red-500';
  if (vp === max) return 'bg-blue-500';
  if (vp / max >= 0.8) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function getVPBarBgColor(vp: number, max = 10): string {
  if (vp > max) return 'bg-red-100';
  if (vp === max) return 'bg-blue-100';
  if (vp / max >= 0.8) return 'bg-yellow-100';
  return 'bg-green-100';
}

export function getVPTextColor(vp: number, max = 10): string {
  if (vp > max) return 'text-red-700';
  if (vp === max) return 'text-blue-700';
  if (vp / max >= 0.8) return 'text-yellow-700';
  return 'text-green-700';
}

// ─── Formatters (Korean) ──────────────────────────────────────────────────────

export function formatMonthVP(vp: number, max = 10): string {
  return `${vp} / ${max} VP`;
}

export function formatProgressVP(earned: number, total: number): string {
  const pct = total > 0 ? Math.round((earned / total) * 100) : 0;
  return `${earned} / ${total} VP (${pct}%)`;
}

export function getMonthLabel(month: string, lang: 'ko' | 'en' = 'ko'): string {
  const [year, m] = month.split('-');
  if (lang === 'en') {
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${MONTHS[parseInt(m) - 1]} ${year}`;
  }
  return `${year}년 ${parseInt(m)}월`;
}

// ─── SVP Calculation ──────────────────────────────────────────────────────────

export function calcSVP(topics: Topic[]): number {
  return topics
    .filter((t) => t.homework_status === 'reverse_questions_completed')
    .reduce((sum, t) => sum + t.vp_allocation, 0);
}

export function calcVPEarned(topics: Topic[]): number {
  return topics
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + t.vp_allocation, 0);
}

export function calcMonthVP(topics: Topic[]): number {
  return topics.reduce((sum, t) => sum + t.vp_allocation, 0);
}

// ─── Attitude ─────────────────────────────────────────────────────────────────

export function getAttitudeGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function getGradeColor(grade: string): string {
  const map: Record<string, string> = {
    A: 'text-emerald-600',
    B: 'text-blue-600',
    C: 'text-yellow-600',
    D: 'text-orange-600',
    F: 'text-red-600',
  };
  return map[grade] ?? 'text-slate-600';
}

// ─── Label Maps (Korean) ──────────────────────────────────────────────────────

export const HOMEWORK_STATUS_LABELS: Record<string, string> = {
  not_assigned: '미배정',
  assigned: '배정됨',
  submitted: '제출완료',
  reverse_questions_completed: '역문제 완료',
};

export const TOPIC_STATUS_LABELS: Record<string, string> = {
  pending: '미완료',
  completed: '완료',
};

export const PLAN_STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  pending_approval: '승인 대기',
  approved: '승인됨',
  active: '진행 중',
  completed: '완료',
  rejected: '반려',
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  draft: '초안',
  pending_review: '검토 대기',
  approved: '승인됨',
  published: '발행됨',
  archived: '보관됨',
};

export const MANUAL_MODULE_LABELS: Record<string, string> = {
  school_exam: '내신 시험',
  extra_book: '추가 교재',
  exam_practice: '모의고사 대비',
  review_book: '복습 교재',
};

export const ATTITUDE_CATEGORY_LABELS: Record<string, string> = {
  participation: '수업 참여도',
  homework: '숙제 이행도',
  attitude: '수업 태도',
  effort: '노력도',
  improvement: '향상도',
};
