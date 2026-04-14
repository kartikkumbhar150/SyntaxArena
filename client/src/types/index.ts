// ─── Core Enums ──────────────────────────────────────────────────────────────

export type UserRole = 'recruiter' | 'candidate' | 'admin';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Language = 'python' | 'javascript' | 'java' | 'cpp' | 'csharp';

export type SubmissionStatus =
  | 'Accepted'
  | 'Wrong Answer'
  | 'Time Limit Exceeded'
  | 'Memory Limit Exceeded'
  | 'Runtime Error'
  | 'Compilation Error'
  | 'Pending';

export type IntegrityLevel = 'high' | 'medium' | 'low';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  companyName?: string;  // recruiter only
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
}

// ─── Problem / Question ───────────────────────────────────────────────────────

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  weight: number;  // used in weighted scoring
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  description: string;   // markdown
  difficulty: Difficulty;
  tags: string[];
  constraints: string;
  inputFormat: string;
  outputFormat: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  testCases: TestCase[];   // includes hidden ones (only recruiters see all)
  defaultCode: Record<Language, string>;
  timeLimit: number;       // ms
  memoryLimit: number;     // MB
  createdBy: string;       // recruiter id
  createdAt: string;
}

// ─── Assessment / Test ────────────────────────────────────────────────────────

export interface Assessment {
  id: string;
  title: string;
  description: string;
  problems: string[];     // Problem IDs
  duration: number;       // minutes
  createdBy: string;
  inviteToken: string;
  expiresAt: string;
  isActive: boolean;
  proctoring: {
    webcamRequired: boolean;
    screenRecordRequired: boolean;
    clipboardTracking: boolean;
    tabSwitchLimit: number;
  };
  createdAt: string;
}

// ─── Submission ───────────────────────────────────────────────────────────────

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  status: SubmissionStatus;
  stdout?: string;
  stderr?: string;
  executionTimeMs: number;
  memoryUsedMb: number;
  isHidden: boolean;
}

export interface Submission {
  id: string;
  assessmentId: string;
  problemId: string;
  candidateId: string;
  language: Language;
  code: string;
  status: SubmissionStatus;
  score: number;            // 0–100 per problem
  testCaseResults: TestCaseResult[];
  executionTimeMs: number;
  memoryUsedMb: number;
  submittedAt: string;
}

// ─── Candidate Report ─────────────────────────────────────────────────────────

export interface ProctoringEvent {
  type: 'tab_switch' | 'window_blur' | 'clipboard_paste' | 'clipboard_copy' | 'fullscreen_exit';
  timestamp: string;
  detail?: string;
}

export interface CandidateReport {
  id: string;
  assessmentId: string;
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  finalScore: number;      // 300–850 CodeSignal style
  integrityScore: number;  // 0–100
  integrityLevel: IntegrityLevel;
  submissions: Submission[];
  proctoringEvents: ProctoringEvent[];
  startedAt: string;
  completedAt: string;
  totalTimeMs: number;
  snapshotUrls: string[];
}

// ─── Keystroke Replay (Ghost) ─────────────────────────────────────────────────

export interface KeystrokeDelta {
  ts: number;        // milliseconds since start
  pos: number;       // cursor offset
  added?: string;
  removed?: number;  // chars removed
}

export interface CodeReplay {
  id: string;
  submissionId: string;
  language: Language;
  deltas: KeystrokeDelta[];
  finalCode: string;
  durationMs: number;
}

// ─── Live Session ─────────────────────────────────────────────────────────────

export interface LiveSession {
  id: string;
  assessmentId: string;
  recruiterId: string;
  candidateId?: string;
  joinUrl: string;
  isActive: boolean;
  createdAt: string;
}

// ─── UI State ─────────────────────────────────────────────────────────────────

export interface EditorTab {
  id: string;
  label: string;
}

export type ConsoleTabId = 'console' | 'testcases' | 'custom';

export interface RunResult {
  stdout: string;
  stderr: string;
  status: SubmissionStatus;
  testResults?: TestCaseResult[];
  executionTimeMs: number;
  memoryUsedMb: number;
}
