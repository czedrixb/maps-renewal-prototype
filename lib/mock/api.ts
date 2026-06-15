/**
 * Mock API layer — mirrors the real MAPS API endpoints from Data Requirements.
 * Each function simulates network latency and returns Korean mock data.
 */

import { delay } from '../utils';
import {
  BOOKS,
  STUDENTS,
  LEARNING_PLANS,
  TEST_SCORES,
  ATTITUDE_EVALUATIONS,
  MAKEUP_SESSIONS,
  MONTHLY_REPORTS,
} from './data';
import type {
  Student,
  LearningPlan,
  MonthlyBlock,
  MonthlyReport,
  TestScore,
  AttitudeEvaluation,
  MakeupSession,
  ManualModule,
  Topic,
  BookCategory,
} from '../types';

// ─── Students ─────────────────────────────────────────────────────────────────

export async function getStudents(filters?: {
  status?: string;
  group?: string;
  teacher_id?: number;
  search?: string;
}): Promise<Student[]> {
  await delay(300);
  let results = [...STUDENTS];
  if (filters?.status) results = results.filter((s) => s.status === filters.status);
  if (filters?.group) results = results.filter((s) => s.group === filters.group);
  if (filters?.teacher_id) results = results.filter((s) => s.teacher_id === filters.teacher_id);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter((s) => s.name.includes(q));
  }
  return results;
}

export async function getStudent(id: number): Promise<Student | null> {
  await delay(200);
  return STUDENTS.find((s) => s.id === id) ?? null;
}

// ─── Learning Plans ───────────────────────────────────────────────────────────

export async function getLearningPlans(filters?: {
  student_id?: number;
  status?: string;
}): Promise<LearningPlan[]> {
  await delay(400);
  let results = [...LEARNING_PLANS];
  if (filters?.student_id) results = results.filter((p) => p.student_id === filters.student_id);
  if (filters?.status) results = results.filter((p) => p.status === filters.status);
  return results;
}

export async function getLearningPlan(id: number): Promise<LearningPlan | null> {
  await delay(300);
  return LEARNING_PLANS.find((p) => p.id === id) ?? null;
}

/**
 * Prototype mock of POST /api/learning-plans/schedule-planning
 * Note: Real system does speed-adjusted VP and proration server-side.
 * This mock implements a simplified 10VP/month cap distribution.
 */
export async function schedulePlanning(
  bookIds: number[],
  startDate: string,
  manualModules: ManualModule[] = []
): Promise<{ schedule: MonthlyBlock[] }> {
  await delay(700);

  // Collect all topics from selected books
  const allTopics: Topic[] = bookIds.flatMap((bookId) => {
    const book = BOOKS.find((b) => b.id === bookId);
    if (!book) return [];
    return book.topics.map((raw) => ({
      ...raw,
      status: 'pending' as const,
      homework_status: 'not_assigned' as const,
      split_group: null,
      split_part: null,
      original_vp: null,
      is_relearned: false,
    }));
  });

  // Insert manual modules at their positions
  const manualTopics: Topic[] = manualModules.map((m, i) => ({
    id: 9000 + i,
    title: m.title,
    vp_allocation: m.vp,
    book_id: 0,
    source_type: 'basic' as BookCategory,
    status: 'pending' as const,
    homework_status: 'not_assigned' as const,
    split_group: 'manual',
    split_part: null,
    original_vp: null,
    is_relearned: false,
  }));

  // Simple distribution: fill months up to 10VP cap
  const schedule: MonthlyBlock[] = [];
  const startParts = startDate.split('-');
  let year = parseInt(startParts[0]);
  let month = parseInt(startParts[1]);

  let monthTopics: Topic[] = [];
  let monthVP = 0;

  const getMonthStr = () =>
    `${year}-${String(month).padStart(2, '0')}`;

  const nextMonth = () => {
    month++;
    if (month > 12) { month = 1; year++; }
  };

  const flush = () => {
    if (monthTopics.length > 0) {
      schedule.push({ month: getMonthStr(), topics: [...monthTopics] });
      nextMonth();
      monthTopics = [];
      monthVP = 0;
    }
  };

  for (const topic of [...allTopics, ...manualTopics]) {
    if (monthVP + topic.vp_allocation > 10 && monthTopics.length > 0) {
      flush();
    }
    monthTopics.push(topic);
    monthVP += topic.vp_allocation;
  }
  flush();

  return { schedule };
}

// ─── Student Progress ─────────────────────────────────────────────────────────

export async function getStudentProgress(studentId: number) {
  await delay(300);
  const plan = LEARNING_PLANS.find((p) => p.student_id === studentId);
  if (!plan) return null;

  const allTopics = plan.schedule.flatMap((b) => b.topics);
  const vpEarned = allTopics.filter((t) => t.status === 'completed').reduce((s, t) => s + t.vp_allocation, 0);
  const vpTotal = allTopics.reduce((s, t) => s + t.vp_allocation, 0);
  const svpEarned = allTopics.filter((t) => t.homework_status === 'reverse_questions_completed').reduce((s, t) => s + t.vp_allocation, 0);

  return {
    student_id: studentId,
    plan_id: plan.id,
    vp_earned: vpEarned,
    vp_total: vpTotal,
    completion_percentage: vpTotal > 0 ? Math.round((vpEarned / vpTotal) * 100) : 0,
    svp_earned: svpEarned,
    topics: allTopics,
    schedule: plan.schedule,
  };
}

// ─── Test Scores ──────────────────────────────────────────────────────────────

export async function getTestScores(filters?: {
  student_id?: number;
  search?: string;
}): Promise<TestScore[]> {
  await delay(300);
  let results = [...TEST_SCORES];
  if (filters?.student_id) results = results.filter((s) => s.student_id === filters.student_id);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (s) => s.student_name.includes(q) || s.book_unit.toLowerCase().includes(q)
    );
  }
  return results;
}

// ─── Attitude Evaluations ─────────────────────────────────────────────────────

export async function getAttitudeEvaluations(filters?: {
  student_id?: number;
  year?: number;
  month?: number;
}): Promise<AttitudeEvaluation[]> {
  await delay(300);
  let results = [...ATTITUDE_EVALUATIONS];
  if (filters?.student_id) results = results.filter((a) => a.student_id === filters.student_id);
  if (filters?.year) results = results.filter((a) => a.year === filters.year);
  if (filters?.month) results = results.filter((a) => a.month === filters.month);
  return results;
}

// ─── Makeup Sessions ──────────────────────────────────────────────────────────

export async function getMakeupSessions(filters?: {
  student_id?: number;
  status?: string;
}): Promise<MakeupSession[]> {
  await delay(300);
  let results = [...MAKEUP_SESSIONS];
  if (filters?.student_id) results = results.filter((m) => m.student_id === filters.student_id);
  if (filters?.status) results = results.filter((m) => m.status === filters.status);
  return results;
}

// ─── Monthly Reports ──────────────────────────────────────────────────────────

export async function getMonthlyReports(filters?: {
  student_id?: number;
  status?: string;
  year?: number;
  month?: number;
}): Promise<MonthlyReport[]> {
  await delay(400);
  let results = [...MONTHLY_REPORTS];
  if (filters?.student_id) results = results.filter((r) => r.student_id === filters.student_id);
  if (filters?.status) results = results.filter((r) => r.status === filters.status);
  if (filters?.year) results = results.filter((r) => r.year === filters.year);
  if (filters?.month) results = results.filter((r) => r.month === filters.month);
  return results;
}

export async function getMonthlyReport(id: number): Promise<MonthlyReport | null> {
  await delay(300);
  return MONTHLY_REPORTS.find((r) => r.id === id) ?? null;
}

// ─── Books ────────────────────────────────────────────────────────────────────

export async function getBooks() {
  await delay(200);
  return BOOKS;
}
