import { create } from 'zustand';
import type {
  Language,
  Problem,
  RunResult,
  ConsoleTabId,
  KeystrokeDelta,
} from '../types';

interface EditorState {
  // Editor content
  language: Language;
  code: string;
  problem: Problem | null;

  // Console
  activeConsoleTab: ConsoleTabId;
  customInput: string;
  lastRunResult: RunResult | null;
  isRunning: boolean;
  isSubmitting: boolean;

  // Keystroke replay logger (Module 7)
  sessionStartTs: number | null;
  deltas: KeystrokeDelta[];
  lastCode: string;

  // Actions
  setLanguage: (lang: Language) => void;
  setCode: (code: string) => void;
  setProblem: (problem: Problem) => void;
  setActiveConsoleTab: (tab: ConsoleTabId) => void;
  setCustomInput: (input: string) => void;
  setLastRunResult: (result: RunResult | null) => void;
  setIsRunning: (v: boolean) => void;
  setIsSubmitting: (v: boolean) => void;

  // Replay logging
  startSession: () => void;
  recordDelta: (newCode: string) => void;
  resetSession: () => void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  language: 'python',
  code: '',
  problem: null,
  activeConsoleTab: 'testcases',
  customInput: '',
  lastRunResult: null,
  isRunning: false,
  isSubmitting: false,
  sessionStartTs: null,
  deltas: [],
  lastCode: '',

  setLanguage: (lang) => {
    const problem = get().problem;
    const defaultCode = problem?.defaultCode[lang] ?? '';
    set({ language: lang, code: defaultCode });
  },

  setCode: (code) => set({ code }),

  setProblem: (problem) => {
    const lang = get().language;
    set({
      problem,
      code: problem.defaultCode[lang] ?? '',
      lastRunResult: null,
    });
  },

  setActiveConsoleTab: (tab) => set({ activeConsoleTab: tab }),
  setCustomInput: (input) => set({ customInput: input }),
  setLastRunResult: (result) => set({ lastRunResult: result }),
  setIsRunning: (v) => set({ isRunning: v }),
  setIsSubmitting: (v) => set({ isSubmitting: v }),

  startSession: () =>
    set({ sessionStartTs: Date.now(), deltas: [], lastCode: get().code }),

  recordDelta: (newCode) => {
    const { sessionStartTs, lastCode, deltas } = get();
    if (!sessionStartTs) return;
    const ts = Date.now() - sessionStartTs;

    // Compute minimal delta (simple LCS approximation)
    // Find common prefix
    let prefixLen = 0;
    while (
      prefixLen < lastCode.length &&
      prefixLen < newCode.length &&
      lastCode[prefixLen] === newCode[prefixLen]
    )
      prefixLen++;

    // Find common suffix
    let suffixLen = 0;
    while (
      suffixLen < lastCode.length - prefixLen &&
      suffixLen < newCode.length - prefixLen &&
      lastCode[lastCode.length - 1 - suffixLen] ===
        newCode[newCode.length - 1 - suffixLen]
    )
      suffixLen++;

    const removed = lastCode.length - prefixLen - suffixLen;
    const added = newCode.slice(prefixLen, newCode.length - suffixLen);

    const delta: KeystrokeDelta = { ts, pos: prefixLen };
    if (removed > 0) delta.removed = removed;
    if (added.length > 0) delta.added = added;

    set({ deltas: [...deltas, delta], lastCode: newCode });
  },

  resetSession: () =>
    set({ sessionStartTs: null, deltas: [], lastCode: '' }),
}));
