import type {
  Student,
  Book,
  LearningPlan,
  TestScore,
  AttitudeEvaluation,
  MakeupSession,
  MonthlyReport,
  Topic,
  MonthlyBlock,
  GroupChangeRequest,
} from '../types';

// ─── Books & Topics ───────────────────────────────────────────────────────────

export const BOOKS: Book[] = [
  {
    id: 1,
    title: '수학의 정석 (기본편)',
    category: 'basic',
    topics: [
      { id: 1,  title: '집합',              vp_allocation: 1.0, book_id: 1, source_type: 'basic' },
      { id: 2,  title: '명제',              vp_allocation: 1.0, book_id: 1, source_type: 'basic' },
      { id: 3,  title: '함수의 개념',       vp_allocation: 1.0, book_id: 1, source_type: 'basic' },
      { id: 4,  title: '합성함수와 역함수', vp_allocation: 1.5, book_id: 1, source_type: 'basic' },
      { id: 5,  title: '수열',              vp_allocation: 2.0, book_id: 1, source_type: 'basic' },
      { id: 6,  title: '수학적 귀납법',     vp_allocation: 1.5, book_id: 1, source_type: 'basic' },
      { id: 7,  title: '극한',              vp_allocation: 2.0, book_id: 1, source_type: 'basic' },
      { id: 8,  title: '미분',              vp_allocation: 2.5, book_id: 1, source_type: 'basic' },
    ],
  },
  {
    id: 2,
    title: '수학의 정석 (실력편)',
    category: 'advance',
    topics: [
      { id: 11, title: '집합과 명제 심화',   vp_allocation: 2.0, book_id: 2, source_type: 'advance' },
      { id: 12, title: '함수 심화',           vp_allocation: 2.0, book_id: 2, source_type: 'advance' },
      { id: 13, title: '수열 심화',           vp_allocation: 3.0, book_id: 2, source_type: 'advance' },
      { id: 14, title: '미분 심화',           vp_allocation: 3.0, book_id: 2, source_type: 'advance' },
    ],
  },
  {
    id: 3,
    title: '수능특강 수학Ⅱ',
    category: 'advance',
    topics: [
      { id: 21, title: '수열의 극한',        vp_allocation: 2.5, book_id: 3, source_type: 'advance' },
      { id: 22, title: '함수의 극한',        vp_allocation: 2.5, book_id: 3, source_type: 'advance' },
      { id: 23, title: '연속함수',            vp_allocation: 2.0, book_id: 3, source_type: 'advance' },
      { id: 24, title: '미분법',              vp_allocation: 3.0, book_id: 3, source_type: 'advance' },
    ],
  },
  {
    id: 4,
    title: '내신 완성 문제집',
    category: 'naesin_book',
    topics: [
      { id: 31, title: '서술형',    vp_allocation: 1.0, book_id: 4, source_type: 'naesin_book' },
      { id: 32, title: '기초',      vp_allocation: 1.0, book_id: 4, source_type: 'naesin_book' },
      { id: 33, title: '기본',      vp_allocation: 1.5, book_id: 4, source_type: 'naesin_book' },
      { id: 34, title: '발전',      vp_allocation: 1.5, book_id: 4, source_type: 'naesin_book' },
      { id: 35, title: '최다빈출',  vp_allocation: 1.5, book_id: 4, source_type: 'naesin_book' },
      { id: 36, title: '오답',      vp_allocation: 1.5, book_id: 4, source_type: 'naesin_book' },
      { id: 37, title: '고난도',    vp_allocation: 2.0, book_id: 4, source_type: 'naesin_book' },
    ],
  },
];

function makeTopic(raw: Book['topics'][number], overrides: Partial<Topic> = {}): Topic {
  return {
    ...raw,
    status: 'pending',
    homework_status: 'not_assigned',
    split_group: null,
    split_part: null,
    original_vp: null,
    is_relearned: false,
    ...overrides,
  };
}

// ─── Students ─────────────────────────────────────────────────────────────────

export const STUDENTS: Student[] = [
  { id: 1, name: '김민준', group: 'HN', teacher_id: 101, teacher_name: '이지현', academy_id: 10, status: 'active', phone: '010-1234-5678', parent_phone: '010-9876-5432', enrolled_at: '2026-03-01', birth_date: '2010-07-15' },
  { id: 2, name: '박서연', group: 'AC', teacher_id: 101, teacher_name: '이지현', academy_id: 10, status: 'active', phone: '010-2345-6789', parent_phone: '010-8765-4321', enrolled_at: '2026-03-01', birth_date: '2010-09-22' },
  { id: 3, name: '이도윤', group: 'RS', teacher_id: 102, teacher_name: '박준서', academy_id: 10, status: 'active', phone: '010-3456-7890', parent_phone: '010-7654-3210', enrolled_at: '2026-01-15', birth_date: '2011-02-08' },
  { id: 4, name: '최지아', group: 'ST', teacher_id: 101, teacher_name: '이지현', academy_id: 10, status: 'active', phone: '010-4567-8901', parent_phone: '010-6543-2109', enrolled_at: '2026-04-01', birth_date: '2010-12-03' },
  { id: 5, name: '정하준', group: 'HN', teacher_id: 102, teacher_name: '박준서', academy_id: 10, status: 'active', phone: '010-5678-9012', parent_phone: '010-5432-1098', enrolled_at: '2026-02-01', birth_date: '2011-04-19' },
  { id: 6, name: '한수아', group: 'AC', teacher_id: 102, teacher_name: '박준서', academy_id: 10, status: 'inactive', phone: '010-6789-0123', parent_phone: '010-4321-0987', enrolled_at: '2025-11-01', birth_date: '2010-06-30' },
  { id: 7, name: '오세준', group: 'RS', teacher_id: 101, teacher_name: '이지현', academy_id: 10, status: 'graduated', phone: '010-7890-1234', parent_phone: '010-3210-9876', enrolled_at: '2025-03-01', birth_date: '2009-11-12' },
];

// ─── Learning Plans ───────────────────────────────────────────────────────────

// Plan 1: 김민준 — active, 수학의 정석 기본편 + 실력편
const plan1Schedule: MonthlyBlock[] = [
  {
    month: '2026-06',
    topics: [
      makeTopic(BOOKS[0].topics[0], { status: 'completed', homework_status: 'reverse_questions_completed' }),
      makeTopic(BOOKS[0].topics[1], { status: 'completed', homework_status: 'reverse_questions_completed' }),
      makeTopic(BOOKS[0].topics[2], { status: 'completed', homework_status: 'submitted' }),
      makeTopic(BOOKS[0].topics[3], { status: 'completed', homework_status: 'not_assigned' }),
      makeTopic(BOOKS[0].topics[4]),
      makeTopic(BOOKS[0].topics[5]),
    ],
  },
  {
    month: '2026-07',
    topics: [
      makeTopic(BOOKS[0].topics[6]),
      makeTopic(BOOKS[0].topics[7]),
      makeTopic(BOOKS[1].topics[0]),
      makeTopic(BOOKS[1].topics[1]),
    ],
  },
  {
    month: '2026-08',
    topics: [
      makeTopic(BOOKS[1].topics[2]),
      makeTopic(BOOKS[1].topics[3]),
    ],
  },
];

// Plan 2: 박서연 — active, 수능특강 수학Ⅱ
const plan2Schedule: MonthlyBlock[] = [
  {
    month: '2026-05',
    topics: [
      makeTopic(BOOKS[2].topics[0], { status: 'completed', homework_status: 'reverse_questions_completed' }),
      makeTopic(BOOKS[2].topics[1], { status: 'completed', homework_status: 'reverse_questions_completed' }),
    ],
  },
  {
    month: '2026-06',
    topics: [
      makeTopic(BOOKS[2].topics[2], { status: 'completed', homework_status: 'submitted' }),
      makeTopic(BOOKS[2].topics[3]),
    ],
  },
];

// Plan 3: 이도윤 — pending_approval, 수학의 정석 기본편
const plan3Schedule: MonthlyBlock[] = [
  {
    month: '2026-06',
    topics: [
      makeTopic(BOOKS[0].topics[0]),
      makeTopic(BOOKS[0].topics[1]),
      makeTopic(BOOKS[0].topics[2]),
      makeTopic(BOOKS[0].topics[3]),
      makeTopic(BOOKS[0].topics[4]),
    ],
  },
  {
    month: '2026-07',
    topics: [
      makeTopic(BOOKS[0].topics[5]),
      makeTopic(BOOKS[0].topics[6]),
      makeTopic(BOOKS[0].topics[7]),
    ],
  },
];

// Plan 4: 정하준 — active, 내신 완성 문제집 (manual modules demo)
const plan4Schedule: MonthlyBlock[] = [
  {
    month: '2026-06',
    topics: [
      makeTopic(BOOKS[3].topics[0], { status: 'completed', homework_status: 'submitted' }),
      makeTopic(BOOKS[3].topics[1], { status: 'completed', homework_status: 'reverse_questions_completed' }),
      makeTopic(BOOKS[3].topics[2]),
      makeTopic(BOOKS[3].topics[3]),
      {
        id: 901, title: '기말고사 대비 특강', vp_allocation: 2.0,
        book_id: 0, source_type: 'basic',
        status: 'pending', homework_status: 'not_assigned',
        split_group: null, split_part: null, original_vp: null, is_relearned: false,
      },
    ],
  },
  {
    month: '2026-07',
    topics: [
      makeTopic(BOOKS[3].topics[4]),
      makeTopic(BOOKS[3].topics[5]),
      makeTopic(BOOKS[3].topics[6]),
    ],
  },
];

export const LEARNING_PLANS: LearningPlan[] = [
  {
    id: 1, student_id: 1, student_name: '김민준', student_group: 'HN',
    teacher_id: 101, teacher_name: '이지현', start_date: '2026-06-01',
    status: 'active', created_at: '2026-05-25',
    books: [
      { id: 1, title: '수학의 정석 (기본편)', category: 'basic' },
      { id: 2, title: '수학의 정석 (실력편)', category: 'advance' },
    ],
    schedule: plan1Schedule,
  },
  {
    id: 2, student_id: 2, student_name: '박서연', student_group: 'AC',
    teacher_id: 101, teacher_name: '이지현', start_date: '2026-05-15',
    status: 'active', created_at: '2026-05-10',
    books: [{ id: 3, title: '수능특강 수학Ⅱ', category: 'advance' }],
    schedule: plan2Schedule,
  },
  {
    id: 3, student_id: 3, student_name: '이도윤', student_group: 'RS',
    teacher_id: 102, teacher_name: '박준서', start_date: '2026-06-15',
    status: 'pending_approval', created_at: '2026-06-10',
    books: [{ id: 1, title: '수학의 정석 (기본편)', category: 'basic' }],
    schedule: plan3Schedule,
  },
  {
    id: 4, student_id: 5, student_name: '정하준', student_group: 'HN',
    teacher_id: 102, teacher_name: '박준서', start_date: '2026-06-01',
    status: 'active', created_at: '2026-05-28',
    books: [{ id: 4, title: '내신 완성 문제집', category: 'naesin_book' }],
    schedule: plan4Schedule,
  },
  {
    id: 5, student_id: 4, student_name: '최지아', student_group: 'ST',
    teacher_id: 101, teacher_name: '이지현', start_date: '2026-06-15',
    status: 'draft', created_at: '2026-06-12',
    books: [],
    schedule: [],
  },
];

// ─── Test Scores ──────────────────────────────────────────────────────────────

export const TEST_SCORES: TestScore[] = [
  {
    id: 1, student_id: 1, student_name: '김민준', date: '2026-06-05',
    score: 85, total: 100, test_type: '단원평가', book_unit: '집합·명제',
    note: '오답 보완 필요', reviews: [
      { id: 1, attempt_date: '2026-06-09', score: 92, total: 100 },
    ],
  },
  {
    id: 2, student_id: 1, student_name: '김민준', date: '2026-05-20',
    score: 78, total: 100, test_type: '단원평가', book_unit: '함수의 개념',
    reviews: [],
  },
  {
    id: 3, student_id: 2, student_name: '박서연', date: '2026-06-01',
    score: 92, total: 100, test_type: '단원평가', book_unit: '수열의 극한',
    reviews: [],
  },
  {
    id: 4, student_id: 2, student_name: '박서연', date: '2026-05-25',
    score: 88, total: 100, test_type: '소단원 평가', book_unit: '함수의 극한',
    reviews: [],
  },
  {
    id: 5, student_id: 3, student_name: '이도윤', date: '2026-05-15',
    score: 65, total: 100, test_type: '단원평가', book_unit: '집합',
    note: '재시험 필요', reviews: [
      { id: 2, attempt_date: '2026-05-22', score: 75, total: 100 },
    ],
  },
  {
    id: 6, student_id: 5, student_name: '정하준', date: '2026-06-08',
    score: 95, total: 100, test_type: '단원평가', book_unit: '서술형·기초',
    reviews: [],
  },
  {
    id: 7, student_id: 4, student_name: '최지아', date: '2026-05-30',
    score: 72, total: 100, test_type: '단원평가', book_unit: '기초수학',
    reviews: [],
  },
];

// ─── Attitude Evaluations ─────────────────────────────────────────────────────

export const ATTITUDE_EVALUATIONS: AttitudeEvaluation[] = [
  {
    id: 1, student_id: 1, student_name: '김민준', year: 2026, month: 6,
    categories: { participation: 18, homework: 16, attitude: 20, effort: 15, improvement: 19 },
    total: 88, grade: 'B', note: '수업 태도 매우 좋음. 숙제 제출 다소 늦음.',
  },
  {
    id: 2, student_id: 2, student_name: '박서연', year: 2026, month: 6,
    categories: { participation: 20, homework: 20, attitude: 20, effort: 18, improvement: 17 },
    total: 95, grade: 'A', note: '전 항목 우수. 향상도 지속 유지 권장.',
  },
  {
    id: 3, student_id: 3, student_name: '이도윤', year: 2026, month: 5,
    categories: { participation: 15, homework: 12, attitude: 16, effort: 14, improvement: 13 },
    total: 70, grade: 'C', note: '숙제 이행도 개선 필요.',
  },
  {
    id: 4, student_id: 5, student_name: '정하준', year: 2026, month: 6,
    categories: { participation: 19, homework: 18, attitude: 19, effort: 18, improvement: 16 },
    total: 90, grade: 'A',
  },
  {
    id: 5, student_id: 4, student_name: '최지아', year: 2026, month: 5,
    categories: { participation: 14, homework: 14, attitude: 17, effort: 15, improvement: 14 },
    total: 74, grade: 'C',
  },
];

// ─── Makeup Sessions ──────────────────────────────────────────────────────────

export const MAKEUP_SESSIONS: MakeupSession[] = [
  {
    id: 1, student_id: 1, student_name: '김민준',
    absent_date: '2026-06-10', makeup_date: '2026-06-14',
    status: 'scheduled', topic_title: '수열',
  },
  {
    id: 2, student_id: 2, student_name: '박서연',
    absent_date: '2026-05-28', makeup_date: '2026-06-02',
    status: 'completed', topic_title: '함수의 극한',
  },
  {
    id: 3, student_id: 3, student_name: '이도윤',
    absent_date: '2026-05-20', makeup_date: null,
    status: 'pending', note: '학부모 연락 필요',
  },
  {
    id: 4, student_id: 5, student_name: '정하준',
    absent_date: '2026-06-03', makeup_date: '2026-06-10',
    status: 'completed', topic_title: '기초',
  },
  {
    id: 5, student_id: 4, student_name: '최지아',
    absent_date: '2026-06-11', makeup_date: null,
    status: 'pending',
  },
];

// ─── Monthly Reports ──────────────────────────────────────────────────────────

export const MONTHLY_REPORTS: MonthlyReport[] = [
  {
    id: 1, report_code: 'MR-0001-202606', student_id: 1, student_name: '김민준',
    student_group: 'HN', teacher_name: '이지현', year: 2026, month: 6,
    status: 'draft', hide_vp: false,
    total_vp_earned: 4.5, total_homework_vp_earned: 2.0,
    books_completion_percentage: 50, total_attitude_score: 88,
    average_test_score: 85, teacher_comments: null, director_comments: null,
    published_at: null,
    books_progress: [
      { book_id: 1, book_title: '수학의 정석 (기본편)', category: 'basic', topics_total: 6, topics_completed: 4, vp_total: 8.0, vp_earned: 4.5 },
      { book_id: 2, book_title: '수학의 정석 (실력편)', category: 'advance', topics_total: 4, topics_completed: 0, vp_total: 10.0, vp_earned: 0 },
    ],
    test_scores: TEST_SCORES.filter((s) => s.student_id === 1),
    attitude: ATTITUDE_EVALUATIONS.find((a) => a.student_id === 1) ?? null,
    makeup_classes: MAKEUP_SESSIONS.filter((m) => m.student_id === 1),
  },
  {
    id: 2, report_code: 'MR-0002-202606', student_id: 2, student_name: '박서연',
    student_group: 'AC', teacher_name: '이지현', year: 2026, month: 6,
    status: 'pending_review', hide_vp: false,
    total_vp_earned: 7.0, total_homework_vp_earned: 5.0,
    books_completion_percentage: 75, total_attitude_score: 95,
    average_test_score: 90, teacher_comments: '이번 달 매우 열심히 했습니다. 다음 달도 응원합니다.', director_comments: null,
    published_at: null,
    books_progress: [
      { book_id: 3, book_title: '수능특강 수학Ⅱ', category: 'advance', topics_total: 4, topics_completed: 3, vp_total: 10.0, vp_earned: 7.0 },
    ],
    test_scores: TEST_SCORES.filter((s) => s.student_id === 2),
    attitude: ATTITUDE_EVALUATIONS.find((a) => a.student_id === 2) ?? null,
    makeup_classes: MAKEUP_SESSIONS.filter((m) => m.student_id === 2),
  },
  {
    id: 3, report_code: 'MR-0003-202605', student_id: 3, student_name: '이도윤',
    student_group: 'RS', teacher_name: '박준서', year: 2026, month: 5,
    status: 'published', hide_vp: false,
    total_vp_earned: 0, total_homework_vp_earned: 0,
    books_completion_percentage: 0, total_attitude_score: 70,
    average_test_score: 65,
    teacher_comments: '숙제 제출 습관을 기르는 것이 중요합니다. 다음 달은 더 열심히 해 봐요.',
    director_comments: '학부모 면담 권장.',
    published_at: '2026-06-05',
    books_progress: [],
    test_scores: TEST_SCORES.filter((s) => s.student_id === 3),
    attitude: ATTITUDE_EVALUATIONS.find((a) => a.student_id === 3) ?? null,
    makeup_classes: MAKEUP_SESSIONS.filter((m) => m.student_id === 3),
  },
  {
    id: 4, report_code: 'MR-0005-202606', student_id: 5, student_name: '정하준',
    student_group: 'HN', teacher_name: '박준서', year: 2026, month: 6,
    status: 'approved', hide_vp: false,
    total_vp_earned: 2.0, total_homework_vp_earned: 1.0,
    books_completion_percentage: 28, total_attitude_score: 90,
    average_test_score: 95, teacher_comments: '내신 대비 훌륭합니다!', director_comments: '승인합니다.',
    published_at: null,
    books_progress: [
      { book_id: 4, book_title: '내신 완성 문제집', category: 'naesin_book', topics_total: 7, topics_completed: 2, vp_total: 10.0, vp_earned: 2.0 },
    ],
    test_scores: TEST_SCORES.filter((s) => s.student_id === 5),
    attitude: ATTITUDE_EVALUATIONS.find((a) => a.student_id === 5) ?? null,
    makeup_classes: MAKEUP_SESSIONS.filter((m) => m.student_id === 5),
  },
];

// ─── Group Change Requests ────────────────────────────────────────────────────

export const GROUP_CHANGES: GroupChangeRequest[] = [
  {
    id: 1, student_id: 3, student_name: '이도윤',
    from_group: 'RS', to_group: 'AC',
    reason: '최근 3회 단원평가 평균 78점으로 향상, AC 반 이동 요청',
    exam_score: 78, status: 'pending', created_at: '2026-06-11',
  },
  {
    id: 2, student_id: 4, student_name: '최지아',
    from_group: 'ST', to_group: 'RS',
    reason: '꾸준한 향상으로 RS 반 이동 적합 판단',
    exam_score: 72, status: 'pending', created_at: '2026-06-10',
  },
];
