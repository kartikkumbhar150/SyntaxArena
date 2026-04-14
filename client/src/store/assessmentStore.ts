import { create } from 'zustand';
import type { Assessment, ProctoringEvent, CandidateReport } from '../types';

interface AssessmentState {
  currentAssessment: Assessment | null;
  report: CandidateReport | null;
  proctoringEvents: ProctoringEvent[];
  tabSwitchCount: number;
  isProctoring: boolean;

  setCurrentAssessment: (a: Assessment | null) => void;
  setReport: (r: CandidateReport | null) => void;
  addProctoringEvent: (e: ProctoringEvent) => void;
  incrementTabSwitch: () => void;
  setIsProctoring: (v: boolean) => void;
  resetProctoring: () => void;
}

export const useAssessmentStore = create<AssessmentState>()((set, get) => ({
  currentAssessment: null,
  report: null,
  proctoringEvents: [],
  tabSwitchCount: 0,
  isProctoring: false,

  setCurrentAssessment: (a) => set({ currentAssessment: a }),
  setReport: (r) => set({ report: r }),

  addProctoringEvent: (e) =>
    set({ proctoringEvents: [...get().proctoringEvents, e] }),

  incrementTabSwitch: () =>
    set({ tabSwitchCount: get().tabSwitchCount + 1 }),

  setIsProctoring: (v) => set({ isProctoring: v }),

  resetProctoring: () =>
    set({ proctoringEvents: [], tabSwitchCount: 0, isProctoring: false }),
}));
