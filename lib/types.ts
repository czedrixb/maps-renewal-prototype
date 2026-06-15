// ─── Core Domain Types ────────────────────────────────────────────────────────

export type StudentGroup = 'HN' | 'AC' | 'RS' | 'ST';
export type UserRole = 'hq_ops' | 'director' | 'teacher' | 'student';
export type BookCategory = 'basic' | 'advance' | 'naesin_book';
export type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'completed' | 'rejected';
export type ReportStatus = 'draft' | 'pending_review' | 'approved' | 'published' | 'archived';
export type HomeworkStatus = 'not_assigned' | 'assigned' | 'submitted' | 'reverse_questions_completed';
export type TopicStatus = 'pending' | 'completed';
export type ManualModuleType = 'school_exam' | 'extra_book' | 'exam_practice' | 'review_book';

// ─── User / Student ───────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  academy_id: number | null;
  student_group_id: number | null;
  teacher_id: number | null;
}

export interface Student {
  id: number;
  name: string;
  group: StudentGroup;
  teacher_id: number;
  teacher_name: string;
  academy_id: number;
  status: 'active' | 'inactive' | 'graduated';
  phone?: string;
  parent_phone?: string;
  enrolled_at: string;
  birth_date?: string;
}

// ─── Curriculum ───────────────────────────────────────────────────────────────

export interface RawTopic {
  id: number;
  title: string;
  vp_allocation: number;
  book_id: number;
  source_type: BookCategory;
}

export interface Topic extends RawTopic {
  status: TopicStatus;
  homework_status: HomeworkStatus;
  split_group: string | null;
  split_part: 1 | 2 | null;
  original_vp: number | null;
  is_relearned: boolean;
}

export interface Book {
  id: number;
  title: string;
  category: BookCategory;
  topics: RawTopic[];
}

// ─── Learning Plan ────────────────────────────────────────────────────────────

export interface MonthlyBlock {
  month: string; // "YYYY-MM"
  topics: Topic[];
}

export interface LearningPlan {
  id: number;
  student_id: number;
  student_name: string;
  student_group: StudentGroup;
  teacher_id: number;
  teacher_name: string;
  start_date: string;
  status: PlanStatus;
  created_at: string;
  rejection_reason?: string;
  books: { id: number; title: string; category: BookCategory }[];
  schedule: MonthlyBlock[];
}

export interface ManualModule {
  id?: number;
  title: string;
  source_type: ManualModuleType;
  vp: number;
  insert_after_topic_id: number | null;
}

// ─── Student Progress ─────────────────────────────────────────────────────────

export interface StudentProgress {
  student_id: number;
  plan_id: number;
  vp_earned: number;
  vp_total: number;
  completion_percentage: number;
  svp_earned: number;
  topics: Topic[];
}

// ─── Test Scores ──────────────────────────────────────────────────────────────

export interface TestScoreReview {
  id: number;
  attempt_date: string;
  score: number;
  total: number;
}

export interface TestScore {
  id: number;
  student_id: number;
  student_name: string;
  date: string;
  score: number;
  total: number;
  test_type: string;
  book_unit: string;
  note?: string;
  reviews: TestScoreReview[];
}

// ─── Attitude Evaluation ──────────────────────────────────────────────────────

export interface AttitudeEvaluation {
  id: number;
  student_id: number;
  student_name: string;
  year: number;
  month: number;
  categories: {
    participation: number; // /20 수업 참여도
    homework: number;      // /20 숙제 이행도
    attitude: number;      // /20 수업 태도
    effort: number;        // /20 노력도
    improvement: number;   // /20 향상도
  };
  total: number; // /100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  note?: string;
}

// ─── Makeup Sessions ──────────────────────────────────────────────────────────

export interface MakeupSession {
  id: number;
  student_id: number;
  student_name: string;
  absent_date: string;
  makeup_date: string | null;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled';
  topic_title?: string;
  note?: string;
}

// ─── Monthly Reports ──────────────────────────────────────────────────────────

export interface BookProgress {
  book_id: number;
  book_title: string;
  category: BookCategory;
  topics_total: number;
  topics_completed: number;
  vp_total: number;
  vp_earned: number;
}

export interface MonthlyReport {
  id: number;
  report_code: string;
  student_id: number;
  student_name: string;
  student_group: StudentGroup;
  teacher_name: string;
  year: number;
  month: number;
  status: ReportStatus;
  hide_vp: boolean;
  total_vp_earned: number;
  total_homework_vp_earned: number;
  books_completion_percentage: number;
  total_attitude_score: number | null;
  average_test_score: number | null;
  teacher_comments: string | null;
  director_comments: string | null;
  published_at: string | null;
  books_progress: BookProgress[];
  test_scores: TestScore[];
  attitude: AttitudeEvaluation | null;
  makeup_classes: MakeupSession[];
}

// ─── Group Change Request ─────────────────────────────────────────────────────

export interface GroupChangeRequest {
  id: number;
  student_id: number;
  student_name: string;
  from_group: StudentGroup;
  to_group: StudentGroup;
  reason: string;
  exam_score?: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at?: string;
  director_note?: string;
}
