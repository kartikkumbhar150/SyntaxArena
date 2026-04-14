import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Shield, Clock, Cpu, AlertTriangle,
  CheckCircle, XCircle, Play, ChevronDown, ChevronUp,
} from 'lucide-react';
import api from '../../lib/api';
import type { CandidateReport, ProctoringEvent, Submission } from '../../types';

function ScoreRing({ score }: { score: number }) {
  const max = 850;
  const min = 300;
  const pct = Math.max(0, Math.min(1, (score - min) / (max - min)));
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;
  const color = pct > 0.7 ? '#3fb950' : pct > 0.4 ? '#d29922' : '#f85149';

  return (
    <div className="score-ring-wrapper">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-bg-elevated)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r={r}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.2s ease', filter: `drop-shadow(0 0 8px ${color}80)` }}
        />
      </svg>
      <div className="score-ring-label">
        <span className="score-ring-value" style={{ color }}>{score}</span>
        <span className="score-ring-max">/850</span>
      </div>
    </div>
  );
}

function IntegrityMeter({ score, level }: { score: number; level: string }) {
  const color = level === 'high' ? '#3fb950' : level === 'medium' ? '#d29922' : '#f85149';
  return (
    <div className="integrity-meter">
      <div className="integrity-bar-track">
        <div
          className="integrity-bar-fill"
          style={{ width: `${score}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
        />
      </div>
      <span className="integrity-score" style={{ color }}>
        {score}/100 — <strong style={{ textTransform: 'capitalize' }}>{level}</strong>
      </span>
    </div>
  );
}

const EVENT_LABELS: Record<ProctoringEvent['type'], string> = {
  tab_switch: 'Tab Switch',
  window_blur: 'Window Blur',
  clipboard_paste: 'Paste Detected',
  clipboard_copy: 'Copy Detected',
  fullscreen_exit: 'Fullscreen Exit',
};
const EVENT_COLORS: Record<ProctoringEvent['type'], string> = {
  tab_switch: 'var(--color-accent-red)',
  window_blur: 'var(--color-accent-yellow)',
  clipboard_paste: 'var(--color-accent-orange)',
  clipboard_copy: 'var(--color-accent-yellow)',
  fullscreen_exit: 'var(--color-accent-red)',
};

function SubmissionAccordion({ sub, idx }: { sub: Submission; idx: number }) {
  const [open, setOpen] = useState(false);
  const passCount = sub.testCaseResults.filter((r) => r.passed).length;
  const total = sub.testCaseResults.length;
  const statusColor =
    sub.status === 'Accepted'
      ? 'var(--color-accent-green)'
      : sub.status === 'Time Limit Exceeded'
      ? 'var(--color-accent-yellow)'
      : 'var(--color-accent-red)';

  return (
    <div className="sub-accordion">
      <div className="sub-accordion-header" onClick={() => setOpen((o) => !o)}>
        <div className="sub-accordion-left">
          <span className="sub-idx">#{idx + 1}</span>
          <span className="sub-lang">{sub.language.toUpperCase()}</span>
          <span className="sub-status" style={{ color: statusColor }}>
            {sub.status}
          </span>
        </div>
        <div className="sub-accordion-right">
          <span className="sub-pass-info">{passCount}/{total} passed</span>
          <span className="sub-time">{sub.executionTimeMs}ms</span>
          <span className="sub-mem">{sub.memoryUsedMb.toFixed(1)}MB</span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {open && (
        <div className="sub-accordion-body">
          <pre className="code-preview">{sub.code.slice(0, 800)}{sub.code.length > 800 ? '\n... (truncated)' : ''}</pre>
          <div className="test-results-grid">
            {sub.testCaseResults.map((r, i) => (
              <div key={r.testCaseId} className={`test-result-chip ${r.passed ? 'chip-pass' : 'chip-fail'}`}>
                {r.passed ? <CheckCircle size={12} /> : <XCircle size={12} />}
                {r.isHidden ? `Hidden #${i + 1}` : `Test #${i + 1}`}
                <span className="chip-time">{r.executionTimeMs}ms</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function CandidateReportPage() {
  const { reportId } = useParams<{ reportId: string }>();
  const navigate = useNavigate();
  const [report, setReport] = useState<CandidateReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!reportId) return;
    api.get<CandidateReport>(`/recruiter/reports/${reportId}`)
      .then((res) => setReport(res.data))
      .catch(() => setReport(null))
      .finally(() => setIsLoading(false));
  }, [reportId]);

  if (isLoading) {
    return <div className="report-loading pulse">Loading report…</div>;
  }

  if (!report) {
    return (
      <div className="report-error">
        <AlertTriangle size={40} color="var(--color-accent-red)" />
        <p>Report not found.</p>
        <button className="btn-secondary" onClick={() => navigate('/recruiter')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const durationMin = Math.round(report.totalTimeMs / 60000);
  const completedAt = new Date(report.completedAt).toLocaleString();

  return (
    <div className="report-page fade-in">
      {/* Back */}
      <button className="btn-ghost" onClick={() => navigate('/recruiter')} style={{ width: 'fit-content' }}>
        <ArrowLeft size={16} /> Back
      </button>

      {/* Hero */}
      <div className="report-hero glass-card">
        <div className="report-hero-left">
          <div className="report-hero-avatar">
            {report.candidateName[0].toUpperCase()}
          </div>
          <div>
            <h1 className="report-candidate-name">{report.candidateName}</h1>
            <p className="report-candidate-email">{report.candidateEmail}</p>
            <div className="report-meta-row">
              <span><Clock size={13} /> {durationMin} min taken</span>
              <span>Completed {completedAt}</span>
            </div>
          </div>
        </div>
        <div className="report-hero-right">
          <ScoreRing score={report.finalScore} />
          <p className="score-label">CodeSignal Score</p>
        </div>
      </div>

      {/* Integrity + Stats */}
      <div className="report-metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-card-header">
            <Shield size={16} color="var(--color-accent-blue)" />
            <h3>Integrity Score</h3>
          </div>
          <IntegrityMeter score={report.integrityScore} level={report.integrityLevel} />
          <div className="proctoring-events-list">
            {report.proctoringEvents.length === 0 ? (
              <p className="no-events">✅ No suspicious activity detected</p>
            ) : (
              report.proctoringEvents.slice(0, 8).map((e, i) => (
                <div key={i} className="proctoring-event-row">
                  <span
                    className="event-dot"
                    style={{ background: EVENT_COLORS[e.type] }}
                  />
                  <span className="event-type">{EVENT_LABELS[e.type]}</span>
                  <span className="event-time">
                    {new Date(e.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="metric-card glass-card">
          <div className="metric-card-header">
            <Cpu size={16} color="var(--color-accent-purple)" />
            <h3>Performance Metrics</h3>
          </div>
          <div className="perf-metrics">
            {[
              { label: 'Problems Attempted', value: report.submissions.length.toString() },
              { label: 'Avg Execution Time', value: `${Math.round(report.submissions.reduce((a, s) => a + s.executionTimeMs, 0) / Math.max(1, report.submissions.length))}ms` },
              { label: 'Avg Memory Used', value: `${(report.submissions.reduce((a, s) => a + s.memoryUsedMb, 0) / Math.max(1, report.submissions.length)).toFixed(1)}MB` },
              { label: 'Proctoring Flags', value: report.proctoringEvents.length.toString() },
            ].map((m) => (
              <div key={m.label} className="perf-row">
                <span className="perf-label">{m.label}</span>
                <strong className="perf-value">{m.value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div className="report-section glass-card">
        <h2 className="section-title">Submissions</h2>
        {report.submissions.length === 0 ? (
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            No submissions found.
          </p>
        ) : (
          <div className="submissions-list">
            {report.submissions.map((s, i) => (
              <SubmissionAccordion key={s.id} sub={s} idx={i} />
            ))}
          </div>
        )}
      </div>

      {/* Replay */}
      <div className="report-section glass-card">
        <h2 className="section-title">
          <Play size={16} /> Ghost Replay
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: 16 }}>
          Watch exactly how the candidate typed their solution in real-time.
        </p>
        <button className="btn-primary" id="btn-open-replay">
          <Play size={16} /> Open Replay Viewer
        </button>
      </div>

      <style>{`
        .report-page { display:flex;flex-direction:column;gap:20px;max-width:960px; }
        .report-loading,.report-error { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;min-height:40vh;color:var(--color-text-secondary);font-size:0.9rem; }

        .report-hero { display:flex;align-items:center;justify-content:space-between;padding:28px;gap:20px;flex-wrap:wrap; }
        .report-hero-left { display:flex;align-items:center;gap:20px; }
        .report-hero-avatar { width:64px;height:64px;background:linear-gradient(135deg,#388bfd,#a371f7);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:800;color:white; }
        .report-candidate-name { font-size:1.4rem;font-weight:700;color:var(--color-text-primary); }
        .report-candidate-email { font-size:0.875rem;color:var(--color-text-secondary);margin-top:2px; }
        .report-meta-row { display:flex;gap:16px;margin-top:8px;font-size:0.8rem;color:var(--color-text-muted);align-items:center; }

        .report-hero-right { display:flex;flex-direction:column;align-items:center;gap:4px; }
        .score-ring-wrapper { position:relative;width:140px;height:140px; }
        .score-ring-wrapper svg { position:absolute;top:0;left:0; }
        .score-ring-label { position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center; }
        .score-ring-value { font-size:1.8rem;font-weight:800;line-height:1; }
        .score-ring-max { font-size:0.75rem;color:var(--color-text-muted); }
        .score-label { font-size:0.75rem;color:var(--color-text-muted);margin-top:4px; }

        .report-metrics-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        @media (max-width:700px) { .report-metrics-grid { grid-template-columns:1fr; } }
        .metric-card { padding:20px;display:flex;flex-direction:column;gap:16px; }
        .metric-card-header { display:flex;align-items:center;gap:8px; }
        .metric-card-header h3 { font-size:0.95rem;font-weight:600;color:var(--color-text-primary); }

        .integrity-meter { display:flex;flex-direction:column;gap:6px; }
        .integrity-bar-track { height:8px;background:var(--color-bg-elevated);border-radius:4px;overflow:hidden; }
        .integrity-bar-fill { height:100%;border-radius:4px;transition:width 1s ease; }
        .integrity-score { font-size:0.875rem;color:var(--color-text-secondary); }

        .proctoring-events-list { display:flex;flex-direction:column;gap:6px; }
        .no-events { font-size:0.875rem;color:var(--color-accent-green); }
        .proctoring-event-row { display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--color-bg-elevated);border-radius:6px; }
        .event-dot { width:8px;height:8px;border-radius:50%;flex-shrink:0; }
        .event-type { font-size:0.8rem;font-weight:500;color:var(--color-text-primary);flex:1; }
        .event-time { font-size:0.75rem;color:var(--color-text-muted); }

        .perf-metrics { display:flex;flex-direction:column;gap:8px; }
        .perf-row { display:flex;justify-content:space-between;align-items:center;padding:8px 12px;background:var(--color-bg-elevated);border-radius:6px; }
        .perf-label { font-size:0.8rem;color:var(--color-text-secondary); }
        .perf-value { font-size:0.9rem;color:var(--color-text-primary); }

        .report-section { padding:24px; }
        .section-title { font-size:1rem;font-weight:700;color:var(--color-text-primary);margin-bottom:16px;display:flex;align-items:center;gap:8px; }

        .submissions-list { display:flex;flex-direction:column;gap:8px; }
        .sub-accordion { border:1px solid var(--color-border);border-radius:8px;overflow:hidden; }
        .sub-accordion-header { display:flex;align-items:center;justify-content:space-between;padding:12px 16px;cursor:pointer;transition:background 0.15s; }
        .sub-accordion-header:hover { background:var(--color-bg-elevated); }
        .sub-accordion-left,.sub-accordion-right { display:flex;align-items:center;gap:12px; }
        .sub-idx { font-size:0.8rem;color:var(--color-text-muted); }
        .sub-lang { font-size:0.75rem;font-weight:700;padding:2px 8px;background:var(--color-bg-elevated);border-radius:4px;color:var(--color-text-secondary); }
        .sub-status { font-size:0.85rem;font-weight:600; }
        .sub-pass-info,.sub-time,.sub-mem { font-size:0.8rem;color:var(--color-text-muted); }
        .sub-accordion-body { padding:16px;background:var(--color-bg-tertiary);border-top:1px solid var(--color-border); }
        .code-preview { font-size:0.75rem;font-family:monospace;color:var(--color-text-secondary);white-space:pre-wrap;word-break:break-all;max-height:200px;overflow-y:auto;padding:12px;background:var(--color-bg-primary);border-radius:6px;margin-bottom:12px; }
        .test-results-grid { display:flex;flex-wrap:wrap;gap:6px; }
        .test-result-chip { display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:600; }
        .chip-pass { background:rgba(63,185,80,0.15);color:var(--color-accent-green); }
        .chip-fail { background:rgba(248,81,73,0.15);color:var(--color-accent-red); }
        .chip-time { font-size:0.7rem;opacity:0.7;margin-left:2px; }
      `}</style>
    </div>
  );
}
