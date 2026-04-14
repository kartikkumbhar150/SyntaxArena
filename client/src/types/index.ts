export type Role = 'recruiter' | 'candidate';

export interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    avatarUrl?: string;
}

export interface Problem {
    id: string;
    title: string;
    description: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    timeLimit: number; // in ms
    memoryLimit: number; // in mb
}

// Module 5 & 4 related
export interface TestCase {
    id: string;
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}

export interface Submission {
    id: string;
    userId: string;
    problemId: string;
    code: string;
    language: string;
    status: 'Pending' | 'Passed' | 'Failed' | 'TimeLimitExceeded' | 'MemoryLimitExceeded' | 'RuntimeError';
    executionTimeMs?: number;
    memoryUsedKb?: number;
    createdAt: string;
}
