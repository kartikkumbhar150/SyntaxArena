import { useState, useEffect } from 'react';
import { Copy, Link2, Clock, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';
import api from '../../lib/api';
import type { Assessment } from '../../types';

export function InviteManagePage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    api.get<Assessment[]>('/assessments')
      .then((res) => setAssessments(res.data))
      .catch(() => setAssessments([]))
      .finally(() => setIsLoading(false));
  }, []);

  const copyLink = (token: string, id: string) => {
    const link = `${window.location.origin}/join/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await api.patch(`/assessments/${id}`, { isActive: !current });
      setAssessments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: !current } : a))
      );
    } catch {
      alert('Failed to update status');
    }
  };

  const deleteAssessment = async (id: string) => {
    if (!window.confirm('Delete this assessment permanently?')) return;
    try {
      await api.delete(`/assessments/${id}`);
      setAssessments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      alert('Failed to delete');
    }
  };

  return (
    <div className="invites-page fade-in">
      <div className="invites-header">
        <h1 className="page-title">Manage Invites</h1>
        <p className="page-subtitle">Control access to your assessments</p>
      </div>

      {isLoading ? (
        <div className="invites-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="invite-card glass-card pulse" style={{ height: 120 }} />
          ))}
        </div>
      ) : assessments.length === 0 ? (
        <div className="invites-empty">
          <Link2 size={40} color="var(--color-text-muted)" />
          <p>No assessments found. Create one first.</p>
        </div>
      ) : (
        <div className="invites-grid">
          {assessments.map((a) => {
            const expiry = new Date(a.expiresAt);
            const isExpired = expiry < new Date();
            const link = `${window.location.origin}/join/${a.inviteToken}`;

            return (
              <div key={a.id} className={`invite-card glass-card ${!a.isActive ? 'invite-card--inactive' : ''}`}>
                <div className="invite-card-header">
                  <div>
                    <h3 className="invite-title">{a.title}</h3>
                    <span className="invite-meta">
                      <Clock size={12} /> {a.duration} min &nbsp;·&nbsp; {a.problems.length} problems
                    </span>
                  </div>
                  <div className="invite-status">
                    <button
                      className={`status-pill ${a.isActive && !isExpired ? 'status-pill--active' : 'status-pill--inactive'}`}
                      onClick={() => toggleActive(a.id, a.isActive)}
                      title="Toggle active status"
                    >
                      {a.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {a.isActive && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Paused'}
                    </button>
                  </div>
                </div>

                <div className="invite-link-row">
                  <code className="invite-link-text">{link}</code>
                  <button
                    className="btn-ghost"
                    style={{ fontSize: '0.8rem', padding: '4px 10px' }}
                    onClick={() => copyLink(a.inviteToken, a.id)}
                  >
                    {copiedId === a.id ? (
                      <span style={{ color: 'var(--color-accent-green)' }}>✓ Copied</span>
                    ) : (
                      <><Copy size={12} /> Copy</>
                    )}
                  </button>
                </div>

                <div className="invite-footer">
                  <span className={`expiry-text ${isExpired ? 'expiry-text--expired' : ''}`}>
                    Expires: {expiry.toLocaleDateString()}
                  </span>
                  <button
                    className="btn-ghost"
                    style={{ color: 'var(--color-accent-red)', padding: '4px 8px' }}
                    onClick={() => deleteAssessment(a.id)}
                    aria-label="Delete assessment"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .invites-page { display:flex;flex-direction:column;gap:24px; }
        .invites-header { margin-bottom:4px; }
        .page-title { font-size:1.6rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px; }
        .page-subtitle { font-size:0.9rem;color:var(--color-text-secondary); }
        .invites-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px; }
        .invite-card { padding:20px;display:flex;flex-direction:column;gap:12px;transition:all 0.2s; }
        .invite-card--inactive { opacity:0.6; }
        .invite-card-header { display:flex;align-items:flex-start;justify-content:space-between;gap:12px; }
        .invite-title { font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px; }
        .invite-meta { display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--color-text-muted); }
        .status-pill { display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:600;border:1px solid transparent;cursor:pointer;white-space:nowrap; }
        .status-pill--active { background:rgba(63,185,80,0.15);border-color:rgba(63,185,80,0.3);color:var(--color-accent-green); }
        .status-pill--inactive { background:rgba(139,148,158,0.1);border-color:var(--color-border);color:var(--color-text-muted); }
        .invite-link-row { display:flex;align-items:center;gap:8px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:6px;padding:8px 12px;overflow:hidden; }
        .invite-link-text { flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.75rem;color:var(--color-accent-blue); }
        .invite-footer { display:flex;align-items:center;justify-content:space-between; }
        .expiry-text { font-size:0.75rem;color:var(--color-text-muted); }
        .expiry-text--expired { color:var(--color-accent-red); }
        .invites-empty { display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px;color:var(--color-text-muted);font-size:0.875rem; }
      `}</style>
    </div>
  );
}
