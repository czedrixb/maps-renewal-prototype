// ─── Shared progress helpers ─────────────────────────────────────────────────
// Pure functions used by Sample A, B, and C for optimistic progress editing.
// No React import — safe to call from server or client components.

import type { LearningPlan, MonthlyBlock, HomeworkStatus } from './types';

// ── Homework status cycle ─────────────────────────────────────────────────────

export const HW_CYCLE: HomeworkStatus[] = [
  'not_assigned', 'assigned', 'submitted', 'reverse_questions_completed',
];

export const HW_LABELS: Record<HomeworkStatus, string> = {
  not_assigned: '미',
  assigned: '배',
  submitted: '제',
  reverse_questions_completed: '역✓',
};

export const HW_COLORS: Record<HomeworkStatus, string> = {
  not_assigned: 'bg-slate-100 text-slate-500',
  assigned: 'bg-amber-100 text-amber-700',
  submitted: 'bg-blue-100 text-blue-700',
  reverse_questions_completed: 'bg-violet-100 text-violet-700',
};

// ── Progress derivation ───────────────────────────────────────────────────────

/** Derive VP/SVP/% from a LearningPlan's schedule (used by Sample C's roster). */
export function deriveProgress(plan: LearningPlan | undefined) {
  if (!plan) return null;
  const allTopics = plan.schedule.flatMap((b) => b.topics);
  const vpEarned = allTopics
    .filter((t) => t.status === 'completed')
    .reduce((s, t) => s + t.vp_allocation, 0);
  const vpTotal = allTopics.reduce((s, t) => s + t.vp_allocation, 0);
  const svpEarned = allTopics
    .filter((t) => t.homework_status === 'reverse_questions_completed')
    .reduce((s, t) => s + t.vp_allocation, 0);
  return {
    student_id: plan.student_id,
    plan_id: plan.id,
    vp_earned: vpEarned,
    vp_total: vpTotal,
    completion_percentage: vpTotal > 0 ? Math.round((vpEarned / vpTotal) * 100) : 0,
    svp_earned: svpEarned,
    topics: allTopics,
    schedule: plan.schedule,
  };
}

/** Recompute VP/SVP/% from a standalone MonthlyBlock array (used by A and B). */
export function recomputeFromSchedule(schedule: MonthlyBlock[]) {
  const allTopics = schedule.flatMap((b) => b.topics);
  const vp_earned = allTopics
    .filter((t) => t.status === 'completed')
    .reduce((s, t) => s + t.vp_allocation, 0);
  const vp_total = allTopics.reduce((s, t) => s + t.vp_allocation, 0);
  const svp_earned = allTopics
    .filter((t) => t.homework_status === 'reverse_questions_completed')
    .reduce((s, t) => s + t.vp_allocation, 0);
  return {
    topics: allTopics,
    vp_earned,
    vp_total,
    completion_percentage: vp_total > 0 ? Math.round((vp_earned / vp_total) * 100) : 0,
    svp_earned,
  };
}

// ── Schedule mutators (deep-clone, flip one field, return new array) ──────────

/** Deep-clone schedule and toggle a single topic's status. */
export function toggleTopicInSchedule(
  schedule: MonthlyBlock[],
  topicId: number
): MonthlyBlock[] {
  const cloned: MonthlyBlock[] = JSON.parse(JSON.stringify(schedule));
  for (const block of cloned) {
    const topic = block.topics.find((t) => t.id === topicId);
    if (topic) {
      topic.status = topic.status === 'completed' ? 'pending' : 'completed';
      break;
    }
  }
  return cloned;
}

/** Deep-clone schedule and set a single topic's homework_status. */
export function cycleHWInSchedule(
  schedule: MonthlyBlock[],
  topicId: number,
  nextStatus: HomeworkStatus
): MonthlyBlock[] {
  const cloned: MonthlyBlock[] = JSON.parse(JSON.stringify(schedule));
  for (const block of cloned) {
    const topic = block.topics.find((t) => t.id === topicId);
    if (topic) {
      topic.homework_status = nextStatus;
      break;
    }
  }
  return cloned;
}
