import { create } from 'zustand';
import { Problem, TestCase } from '../types';

interface AssessmentState {
    currentProblem: Problem | null;
    language: string;
    code: string;
    testCases: TestCase[];
    activeTab: 'console' | 'testcases' | 'custom';
    consoleOutput: string;
    setLanguage: (lang: string) => void;
    setCode: (code: string) => void;
    setActiveTab: (tab: 'console' | 'testcases' | 'custom') => void;
    setConsoleOutput: (output: string) => void;
}

const defaultCode: Record<string, string> = {
    'javascript': 'function solve(a, b) {\n  return a + b;\n}',
    'python': 'def solve(a, b):\n    return a + b',
    'java': 'class Solution {\n    public int solve(int a, int b) {\n        return a + b;\n    }\n}',
    'cpp': 'class Solution {\npublic:\n    int solve(int a, int b) {\n        return a + b;\n    }\n};',
    'csharp': 'public class Solution {\n    public int Solve(int a, int b) {\n        return a + b;\n    }\n}'
};

export const useAssessmentStore = create<AssessmentState>((set) => ({
    currentProblem: {
        id: '1',
        title: 'Two Sum',
        description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
        difficulty: 'Easy',
        timeLimit: 2000,
        memoryLimit: 256
    },
    language: 'javascript',
    code: defaultCode['javascript'],
    testCases: [
        { id: '1', input: 'nums = [2,7,11,15]\ntarget = 9', expectedOutput: '[0,1]', isHidden: false },
        { id: '2', input: 'nums = [3,2,4]\ntarget = 6', expectedOutput: '[1,2]', isHidden: false }
    ],
    activeTab: 'testcases',
    consoleOutput: '',
    
    setLanguage: (lang) => set({ language: lang, code: defaultCode[lang] }),
    setCode: (code) => set({ code }),
    setActiveTab: (tab) => set({ activeTab: tab }),
    setConsoleOutput: (output) => set({ consoleOutput: output }),
}));
