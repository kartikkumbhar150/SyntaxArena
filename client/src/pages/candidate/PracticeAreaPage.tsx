import { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import api from '../../lib/api';
import type { Problem } from '../../types';
import { IDELayout } from '../../components/ide/IDELayout';
import { useEditorStore } from '../../store/editorStore';

const PRACTICE_PROBLEMS: Partial<Problem>[] = [
  {
    id: 'practice-1',
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Array', 'Hash Map'],
  },
  {
    id: 'practice-2',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['Stack', 'String'],
  },
  {
    id: 'practice-3',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    tags: ['Array', 'Sorting'],
  },
  {
    id: 'practice-4',
    title: 'LRU Cache',
    difficulty: 'Medium',
    tags: ['Design', 'Hash Map'],
  },
  {
    id: 'practice-5',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    tags: ['Array', 'Two Pointers'],
  },
];

export function PracticeAreaPage() {
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [fullProblem, setFullProblem] = useState<Problem | null>(null);
  const { setProblem } = useEditorStore();

  const selectProblem = async (id: string) => {
    setSelectedProblemId(id);
    try {
      const { data } = await api.get<Problem>(`/problems/${id}`);
      setFullProblem(data);
      setProblem(data);
    } catch {
      // Mock problem for demo
      const mock: Problem = {
        id,
        title: PRACTICE_PROBLEMS.find((p) => p.id === id)?.title ?? 'Problem',
        slug: id,
        difficulty: (PRACTICE_PROBLEMS.find((p) => p.id === id)?.difficulty ?? 'Easy') as Problem['difficulty'],
        tags: PRACTICE_PROBLEMS.find((p) => p.id === id)?.tags ?? [],
        description: `## Description\n\nSolve this problem using an efficient algorithm.\n\n## Example\n\n\`\`\`\nInput: ...\nOutput: ...\n\`\`\``,
        constraints: '1 ≤ n ≤ 10⁵',
        inputFormat: 'First line contains n',
        outputFormat: 'Print the answer on a single line',
        examples: [{ input: '2 7 11 15\n9', output: '0 1', explanation: 'nums[0] + nums[1] = 9' }],
        testCases: [],
        defaultCode: {
          python: '# Write your solution here\ndef solution():\n    pass\n',
          javascript: '// Write your solution here\nfunction solution() {\n    \n}\n',
          java: 'class Solution {\n    public void solve() {\n        // your code here\n    }\n}\n',
          cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}\n',
          csharp: 'using System;\n\nclass Solution {\n    static void Main(string[] args) {\n        // your code here\n    }\n}\n',
        },
        timeLimit: 2000,
        memoryLimit: 256,
        createdBy: 'system',
        createdAt: new Date().toISOString(),
      };
      setFullProblem(mock);
      setProblem(mock);
    }
  };

  if (selectedProblemId && fullProblem) {
    return (
      <div style={{ height: 'calc(100vh - 52px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn-ghost"
            onClick={() => { setSelectedProblemId(null); setFullProblem(null); }}
            style={{ fontSize: '0.8rem' }}
          >
            ← Back to Practice
          </button>
          <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
            Practice Mode — no proctoring active
          </span>
        </div>
        <IDELayout problem={fullProblem} isPractice />
      </div>
    );
  }

  return (
    <div className="practice-page fade-in">
      <div>
        <h1 className="page-title">Practice Area</h1>
        <p className="page-subtitle">Sharpen your skills with classic algorithmic problems.</p>
      </div>

      <div className="practice-grid">
        {PRACTICE_PROBLEMS.map((p) => (
          <div
            key={p.id}
            className="practice-card glass-card"
            onClick={() => selectProblem(p.id!)}
          >
            <div className="practice-card-header">
              <span className={`tag-${p.difficulty!.toLowerCase()}`}>{p.difficulty}</span>
            </div>
            <h3 className="practice-problem-title">{p.title}</h3>
            <div className="practice-tags">
              {p.tags?.map((t) => (
                <span key={t} className="problem-tag">{t}</span>
              ))}
            </div>
            <button className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}>
              <BookOpen size={14} /> Solve Now
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .practice-page { display:flex;flex-direction:column;gap:24px; }
        .page-title { font-size:1.6rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px; }
        .page-subtitle { font-size:0.9rem;color:var(--color-text-secondary); }
        .practice-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px; }
        .practice-card { padding:20px;display:flex;flex-direction:column;gap:12px;cursor:pointer;min-height:180px;transition:all 0.2s; }
        .practice-card:hover { border-color:var(--color-accent-blue);transform:translateY(-2px);box-shadow:0 4px 24px rgba(56,139,253,0.1); }
        .practice-card-header { display:flex;align-items:center;justify-content:space-between; }
        .practice-problem-title { font-size:1rem;font-weight:700;color:var(--color-text-primary); }
        .practice-tags { display:flex;flex-wrap:wrap;gap:4px; }
        .problem-tag { display:inline-block;padding:2px 6px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:4px;font-size:0.72rem;color:var(--color-text-secondary); }
      `}</style>
    </div>
  );
}
