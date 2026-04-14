import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, FileText, Clock, TrendingUp,
  PlusCircle, ArrowRight, Star, BarChart2,
} from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../store/authStore';
import type { Assessment, CandidateReport } from '../../types';

interface DashboardStats {
  totalAssessments: number;
  totalCandidates: number;
  avgScore: number;
  completionRate: number;
}

export function RecruiterDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0, totalCandidates: 0, avgScore: 0, completionRate: 0
  });
  const [recentAssessments, setRecentAssessments] = useState<Assessment[]>([]);
  const [recentReports, setRecentReports] = useState<CandidateReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, assessmentsRes, reportsRes] = await Promise.all([
          api.get<DashboardStats>('/recruiter/dashboard/stats'),
          api.get<Assessment[]>('/assessments?limit=5'),
          api.get<CandidateReport[]>('/recruiter/reports?limit=5'),
        ]);
        setStats(statsRes.data);
        setRecentAssessments(assessmentsRes.data);
        setRecentReports(reportsRes.data);
      } catch {
        // Show skeleton UI — backend not yet connected
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const STAT_CARDS = [
    {
      label: 'Total Assessments',
      value: stats.totalAssessments,
      icon: FileText,
      color: '#388bfd',
      bg: 'rgba(56,139,253,0.1)',
    },
    {
      label: 'Candidates Tested',
      value: stats.totalCandidates,
      icon: Users,
      color: '#a371f7',
      bg: 'rgba(163,113,247,0.1)',
    },
    {
      label: 'Avg Score',
      value: stats.avgScore > 0 ? stats.avgScore.toFixed(0) : '—',
      icon: Star,
      color: '#ffd700',
      bg: 'rgba(255,215,0,0.1)',
      suffix: '/850',
    },
    {
      label: 'Completion Rate',
      value: stats.completionRate > 0 ? `${stats.completionRate.toFixed(0)}%` : '—',
      icon: TrendingUp,
      color: '#3fb950',
      bg: 'rgba(63,185,80,0.1)',
    },
  ];

  const getIntegrityColor = (level: string) => {
    if (level === 'high') return 'var(--color-accent-green)';
    if (level === 'medium') return 'var(--color-accent-yellow)';
    return 'var(--color-accent-red)';
  };

  return (
    <div className="dashboard fade-in">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
          <p className="dashboard-subtitle">
            Here's what's happening with your assessments today.
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate('/recruiter/create-test')}
          id="btn-create-assessment"
        >
          <PlusCircle size={16} />
          New Assessment
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STAT_CARDS.map((card) => (
          <div key={card.label} className="stat-card slide-up">
            <div className="stat-card-top">
              <div className="stat-icon" style={{ background: card.bg }}>
                <card.icon size={20} color={card.color} />
              </div>
              <span className="stat-label">{card.label}</span>
            </div>
            <div className="stat-value" style={{ color: card.color }}>
              {isLoading ? <span className="pulse">—</span> : card.value}
              {card.suffix && <span className="stat-suffix">{card.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Two columns */}
      <div className="dashboard-cols">
        {/* Recent Assessments */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <FileText size={16} />
              Recent Assessments
            </h2>
            <button
              className="btn-ghost"
              onClick={() => navigate('/recruiter/invites')}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <div className="empty-state pulse">Loading…</div>
          ) : recentAssessments.length === 0 ? (
            <div className="empty-state">
              <FileText size={32} color="var(--color-text-muted)" />
              <p>No assessments yet</p>
              <button
                className="btn-primary"
                onClick={() => navigate('/recruiter/create-test')}
                style={{ marginTop: 12 }}
              >
                <PlusCircle size={14} />
                Create your first test
              </button>
            </div>
          ) : (
            <div className="assessment-list">
              {recentAssessments.map((a) => (
                <div key={a.id} className="assessment-row">
                  <div className="assessment-row-info">
                    <span className="assessment-row-title">{a.title}</span>
                    <span className="assessment-row-meta">
                      <Clock size={12} />
                      {a.duration} min &nbsp;·&nbsp;
                      {a.problems.length} problems
                    </span>
                  </div>
                  <div className="assessment-row-right">
                    <span className={`status-dot ${a.isActive ? 'status-dot--active' : ''}`} />
                    <span className="assessment-status">
                      {a.isActive ? 'Active' : 'Closed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Reports */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <BarChart2 size={16} />
              Recent Candidate Reports
            </h2>
          </div>

          {isLoading ? (
            <div className="empty-state pulse">Loading…</div>
          ) : recentReports.length === 0 ? (
            <div className="empty-state">
              <Users size={32} color="var(--color-text-muted)" />
              <p>No reports yet. Invite candidates to get started.</p>
            </div>
          ) : (
            <div className="report-list">
              {recentReports.map((r) => (
                <div
                  key={r.id}
                  className="report-row"
                  onClick={() => navigate(`/recruiter/reports/${r.id}`)}
                >
                  <div className="report-avatar">
                    {r.candidateName[0].toUpperCase()}
                  </div>
                  <div className="report-info">
                    <span className="report-name">{r.candidateName}</span>
                    <span className="report-email">{r.candidateEmail}</span>
                  </div>
                  <div className="report-score-col">
                    <span className="report-score">{r.finalScore}</span>
                    <span className="report-integrity" style={{ color: getIntegrityColor(r.integrityLevel) }}>
                      ● {r.integrityLevel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .dashboard { display:flex;flex-direction:column;gap:28px; }
        .dashboard-header { display:flex;align-items:flex-start;justify-content:space-between;gap:16px; }
        .dashboard-title { font-size:1.6rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px; }
        .dashboard-subtitle { font-size:0.9rem;color:var(--color-text-secondary); }

        .stats-grid { display:grid;grid-template-columns:repeat(4,1fr);gap:16px; }
        @media (max-width:1000px) { .stats-grid { grid-template-columns:repeat(2,1fr); } }

        .stat-card { display:flex;flex-direction:column;gap:16px;transition:all 0.2s ease; }
        .stat-card-top { display:flex;align-items:center;gap:12px; }
        .stat-icon { width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center; }
        .stat-label { font-size:0.85rem;color:var(--color-text-secondary);font-weight:500; }
        .stat-value { font-size:2rem;font-weight:800;line-height:1; }
        .stat-suffix { font-size:0.9rem;font-weight:500;color:var(--color-text-secondary);margin-left:2px; }

        .dashboard-cols { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
        @media (max-width:900px) { .dashboard-cols { grid-template-columns:1fr; } }

        .dashboard-panel { background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:12px;padding:20px; }
        .panel-header { display:flex;align-items:center;justify-content:space-between;margin-bottom:16px; }
        .panel-title { display:flex;align-items:center;gap:8px;font-size:0.95rem;font-weight:600;color:var(--color-text-primary); }

        .empty-state { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:40px;color:var(--color-text-muted);font-size:0.875rem; }

        .assessment-list { display:flex;flex-direction:column;gap:4px; }
        .assessment-row { display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-radius:8px;transition:background 0.15s; }
        .assessment-row:hover { background:var(--color-bg-elevated); }
        .assessment-row-info { display:flex;flex-direction:column;gap:3px; }
        .assessment-row-title { font-size:0.875rem;font-weight:600;color:var(--color-text-primary); }
        .assessment-row-meta { display:flex;align-items:center;gap:4px;font-size:0.75rem;color:var(--color-text-muted); }
        .assessment-row-right { display:flex;align-items:center;gap:6px; }
        .status-dot { width:8px;height:8px;border-radius:50%;background:var(--color-text-muted); }
        .status-dot--active { background:var(--color-accent-green);animation:pulse 2s infinite; }
        .assessment-status { font-size:0.75rem;color:var(--color-text-secondary); }

        .report-list { display:flex;flex-direction:column;gap:4px; }
        .report-row { display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:8px;cursor:pointer;transition:background 0.15s; }
        .report-row:hover { background:var(--color-bg-elevated); }
        .report-avatar { width:34px;height:34px;background:linear-gradient(135deg,#388bfd,#a371f7);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;color:white;flex-shrink:0; }
        .report-info { flex:1;display:flex;flex-direction:column;gap:2px; }
        .report-name { font-size:0.875rem;font-weight:600;color:var(--color-text-primary); }
        .report-email { font-size:0.75rem;color:var(--color-text-muted); }
        .report-score-col { display:flex;flex-direction:column;align-items:flex-end;gap:2px; }
        .report-score { font-size:1.1rem;font-weight:800;color:var(--color-score-gold); }
        .report-integrity { font-size:0.72rem;font-weight:600; }
      `}</style>
    </div>
  );
}
