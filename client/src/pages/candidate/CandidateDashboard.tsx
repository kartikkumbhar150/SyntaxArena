import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';
import api from '../../lib/api';
import type { Assessment } from '../../types';

interface InvitedAssessment extends Assessment {
  status: 'pending' | 'in_progress' | 'completed';
  candidateScore?: number;
}

export function CandidateDashboard() {
  const [assessments, setAssessments] = useState<InvitedAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get<InvitedAssessment[]>('/candidate/assessments')
      .then((res) => setAssessments(res.data))
      .catch(() => setAssessments([]))
      .finally(() => setIsLoading(false));
  }, []);

  const getStatusConfig = (status: string) => ({
    pending: { label: 'Not Started', color: 'var(--color-text-muted)', bg: 'var(--color-bg-elevated)' },
    in_progress: { label: 'In Progress', color: 'var(--color-accent-yellow)', bg: 'rgba(210,153,34,0.1)' },
    completed: { label: 'Completed', color: 'var(--color-accent-green)', bg: 'rgba(63,185,80,0.1)' },
  }[status] ?? { label: status, color: 'var(--color-text-muted)', bg: 'var(--color-bg-elevated)' });

  return (
    <div className="cd-page fade-in">
      <div className="cd-header">
        <h1 className="cd-title">My Assessments</h1>
        <p className="cd-subtitle">Complete your pending assessments below.</p>
      </div>

      {isLoading ? (
        <div className="cd-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cd-card-skeleton pulse" />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <div className="cd-empty">
          <BookOpen size={48} color="var(--color-text-muted)" />
          <p>No assessments assigned yet.</p>
          <p style={{ fontSize: '0.8rem' }}>Ask your recruiter to share an invite link.</p>
        </div>
      ) : (
        <div className="cd-grid">
          {assessments.map((a) => {
            const config = getStatusConfig(a.status);
            const canStart = a.status !== 'completed';
            return (
              <div key={a.id} className="cd-card glass-card slide-up">
                <div className="cd-card-top">
                  <h2 className="cd-card-title">{a.title}</h2>
                  <span
                    className="cd-status-badge"
                    style={{ color: config.color, background: config.bg }}
                  >
                    {config.label}
                  </span>
                </div>
                <p className="cd-card-desc">{a.description}</p>
                <div className="cd-card-meta">
                  <span><Clock size={13} /> {a.duration} min</span>
                  <span>📝 {a.problems.length} problems</span>
                </div>
                {a.status === 'completed' && a.candidateScore && (
                  <div className="cd-score-row">
                    <span>Your Score</span>
                    <span className="cd-score">{a.candidateScore}<span style={{ fontSize:'0.8rem',color:'var(--color-text-muted)' }}>/850</span></span>
                  </div>
                )}
                <button
                  className={canStart ? 'btn-primary' : 'btn-secondary'}
                  style={{ width: '100%', justifyContent: 'center', marginTop: 'auto' }}
                  disabled={!canStart}
                  onClick={() =>
                    canStart
                      ? navigate(`/candidate/assessment/${a.id}`)
                      : undefined
                  }
                  id={`btn-start-assessment-${a.id}`}
                >
                  {a.status === 'completed'
                    ? '✅ Completed'
                    : a.status === 'in_progress'
                    ? 'Continue <ChevronRight/>'
                    : 'Start Assessment'}
                  {canStart && <ChevronRight size={14} />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .cd-page { display:flex;flex-direction:column;gap:28px; }
        .cd-header { margin-bottom:4px; }
        .cd-title { font-size:1.6rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px; }
        .cd-subtitle { font-size:0.9rem;color:var(--color-text-secondary); }
        .cd-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px; }
        .cd-card { padding:24px;display:flex;flex-direction:column;gap:12px;min-height:240px; }
        .cd-card-skeleton { height:240px;background:var(--color-bg-secondary);border-radius:12px; }
        .cd-card-top { display:flex;align-items:flex-start;justify-content:space-between;gap:8px; }
        .cd-card-title { font-size:1rem;font-weight:700;color:var(--color-text-primary); }
        .cd-status-badge { padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:600;white-space:nowrap; }
        .cd-card-desc { font-size:0.85rem;color:var(--color-text-secondary);line-height:1.5;flex:1; }
        .cd-card-meta { display:flex;gap:16px;font-size:0.8rem;color:var(--color-text-muted);align-items:center; }
        .cd-score-row { display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--color-bg-elevated);border-radius:6px; }
        .cd-score-row span:first-child { font-size:0.8rem;color:var(--color-text-secondary); }
        .cd-score { font-size:1.1rem;font-weight:800;color:var(--color-score-gold); }
        .cd-empty { display:flex;flex-direction:column;align-items:center;gap:8px;padding:80px;color:var(--color-text-muted);text-align:center; }
      `}</style>
    </div>
  );
}
