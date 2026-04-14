import { useState, useEffect } from 'react';
import { Search, Filter, PlusCircle } from 'lucide-react';
import api from '../../lib/api';
import type { Problem, Difficulty } from '../../types';

const DIFFICULTIES: (Difficulty | 'All')[] = ['All', 'Easy', 'Medium', 'Hard'];

export function QuestionLibraryPage() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'All'>('All');

  useEffect(() => {
    api.get<Problem[]>('/problems')
      .then((res) => setProblems(res.data))
      .catch(() => setProblems([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filtered = problems.filter((p) => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchDiff = diffFilter === 'All' || p.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  return (
    <div className="ql-page fade-in">
      <div className="ql-header">
        <div>
          <h1 className="page-title">Question Library</h1>
          <p className="page-subtitle">{problems.length} problems available</p>
        </div>
        <button className="btn-primary" id="btn-new-problem">
          <PlusCircle size={16} /> New Problem
        </button>
      </div>

      {/* Filters */}
      <div className="ql-filters">
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            className="input-field"
            placeholder="Search problems, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
        <div className="diff-filter">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              className={`diff-btn ${diffFilter === d ? 'diff-btn--active' : ''}`}
              onClick={() => setDiffFilter(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="ql-skeleton">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-row pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="ql-empty">
          <Filter size={40} color="var(--color-text-muted)" />
          <p>No problems found. Try a different filter.</p>
        </div>
      ) : (
        <div className="ql-table-wrapper">
          <table className="ql-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Difficulty</th>
                <th>Tags</th>
                <th>Time Limit</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, idx) => (
                <tr key={p.id}>
                  <td className="ql-idx">{idx + 1}</td>
                  <td className="ql-title">{p.title}</td>
                  <td>
                    <span className={`tag-${p.difficulty.toLowerCase()}`}>
                      {p.difficulty}
                    </span>
                  </td>
                  <td className="ql-tags">
                    {p.tags.slice(0, 3).map((t) => (
                      <span key={t} className="problem-tag">{t}</span>
                    ))}
                  </td>
                  <td className="ql-meta">{p.timeLimit}ms</td>
                  <td>
                    <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                      + Add
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <style>{`
        .ql-page { display:flex;flex-direction:column;gap:24px; }
        .ql-header { display:flex;align-items:flex-start;justify-content:space-between; }
        .page-title { font-size:1.6rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px; }
        .page-subtitle { font-size:0.9rem;color:var(--color-text-secondary); }

        .ql-filters { display:flex;align-items:center;gap:12px;flex-wrap:wrap; }
        .search-wrapper { position:relative;flex:1;min-width:200px; }
        .search-icon { position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--color-text-muted);pointer-events:none; }

        .diff-filter { display:flex;gap:4px; }
        .diff-btn { padding:6px 14px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:6px;color:var(--color-text-secondary);font-size:0.8rem;font-weight:500;cursor:pointer;transition:all 0.15s; }
        .diff-btn:hover { border-color:var(--color-text-muted);color:var(--color-text-primary); }
        .diff-btn--active { background:rgba(56,139,253,0.15);border-color:var(--color-accent-blue);color:var(--color-accent-blue); }

        .ql-table-wrapper { overflow-x:auto;border:1px solid var(--color-border);border-radius:12px; }
        .ql-table { width:100%;border-collapse:collapse; }
        .ql-table thead { background:var(--color-bg-secondary); }
        .ql-table th { padding:12px 16px;text-align:left;font-size:0.75rem;font-weight:600;color:var(--color-text-muted);text-transform:uppercase;letter-spacing:0.05em;border-bottom:1px solid var(--color-border); }
        .ql-table tbody tr { transition:background 0.1s; }
        .ql-table tbody tr:hover { background:var(--color-bg-elevated); }
        .ql-table td { padding:12px 16px;border-bottom:1px solid var(--color-border-subtle);vertical-align:middle; }
        .ql-table tbody tr:last-child td { border-bottom:none; }
        .ql-idx { color:var(--color-text-muted);font-size:0.8rem; }
        .ql-title { font-weight:600;color:var(--color-text-primary);font-size:0.875rem; }
        .ql-meta { color:var(--color-text-muted);font-size:0.8rem; }
        .ql-tags { display:flex;flex-wrap:wrap;gap:4px; }
        .problem-tag { display:inline-block;padding:2px 6px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:4px;font-size:0.72rem;color:var(--color-text-secondary); }

        .ql-skeleton { display:flex;flex-direction:column;gap:8px; }
        .skeleton-row { height:48px;background:var(--color-bg-secondary);border-radius:8px; }

        .ql-empty { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px;color:var(--color-text-muted);font-size:0.875rem; }
      `}</style>
    </div>
  );
}
