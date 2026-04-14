import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, Monitor, CheckCircle, AlertCircle, ChevronRight, Loader } from 'lucide-react';
import api from '../../lib/api';
import type { Assessment } from '../../types';

type CheckStatus = 'pending' | 'checking' | 'ok' | 'error';

interface SystemCheck {
  id: string;
  label: string;
  desc: string;
  status: CheckStatus;
}

export function OnboardingPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [isLoadingAssessment, setIsLoadingAssessment] = useState(true);
  const [checks, setChecks] = useState<SystemCheck[]>([
    { id: 'camera', label: 'Webcam Access', desc: 'Required for proctoring', status: 'pending' },
    { id: 'mic', label: 'Microphone Access', desc: 'Required for live interviews', status: 'pending' },
    { id: 'fullscreen', label: 'Fullscreen Mode', desc: 'Reduces distractions', status: 'pending' },
    { id: 'network', label: 'Network Connectivity', desc: 'Stable connection needed', status: 'pending' },
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [allPassed, setAllPassed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get<Assessment>(`/assessments/invite/${token}`)
      .then((res) => setAssessment(res.data))
      .catch(() => setAssessment(null))
      .finally(() => setIsLoadingAssessment(false));
  }, [token]);

  const updateCheck = (id: string, status: CheckStatus) => {
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
  };

  const runAllChecks = async () => {
    // Camera + Mic
    updateCheck('camera', 'checking');
    updateCheck('mic', 'checking');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      updateCheck('camera', 'ok');
      updateCheck('mic', 'ok');
    } catch {
      updateCheck('camera', 'error');
      updateCheck('mic', 'error');
    }

    // Fullscreen
    updateCheck('fullscreen', 'checking');
    try {
      await document.documentElement.requestFullscreen();
      updateCheck('fullscreen', 'ok');
    } catch {
      updateCheck('fullscreen', 'error');
    }

    // Network ping
    updateCheck('network', 'checking');
    try {
      const start = Date.now();
      await fetch('/api/health', { method: 'HEAD' });
      const latency = Date.now() - start;
      updateCheck('network', latency < 2000 ? 'ok' : 'error');
    } catch {
      updateCheck('network', 'ok'); // Don't block if health endpoint unavailable
    }

    setIsReady(true);
  };

  useEffect(() => {
    if (!isReady) return;
    const passed = checks.every((c) => c.status === 'ok' || c.status === 'error');
    const cameraOk = checks.find((c) => c.id === 'camera')?.status === 'ok';
    setAllPassed(passed && (cameraOk || !(assessment?.proctoring.webcamRequired)));
  }, [checks, isReady, assessment]);

  const startAssessment = () => {
    if (!assessment) return;
    navigate(`/candidate/assessment/${assessment.id}`);
  };

  const getCheckIcon = (status: CheckStatus) => {
    if (status === 'pending') return <div className="check-pending-dot" />;
    if (status === 'checking') return <Loader size={18} className="spin-icon" />;
    if (status === 'ok') return <CheckCircle size={18} color="var(--color-accent-green)" />;
    return <AlertCircle size={18} color="var(--color-accent-red)" />;
  };

  if (isLoadingAssessment) {
    return (
      <div className="onboarding-loading">
        <Loader size={32} className="spin-icon" />
        <p>Loading assessment…</p>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="onboarding-error">
        <AlertCircle size={48} color="var(--color-accent-red)" />
        <h2>Invalid or Expired Link</h2>
        <p>This assessment link is no longer valid. Contact your recruiter.</p>
      </div>
    );
  }

  return (
    <div className="onboarding-page fade-in">
      <div className="onboarding-card glass-card">
        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-badge">📋 Assessment</div>
          <h1 className="onboarding-title">{assessment.title}</h1>
          {assessment.description && (
            <p className="onboarding-desc">{assessment.description}</p>
          )}
          <div className="onboarding-meta">
            <span>⏱ {assessment.duration} minutes</span>
            <span>📝 {assessment.problems.length} problems</span>
          </div>
        </div>

        {/* Rules */}
        <div className="rules-box">
          <h3>📌 Rules</h3>
          <ul>
            <li>Do not switch tabs or minimize the window.</li>
            <li>Your webcam will be active throughout the assessment.</li>
            {assessment.proctoring.clipboardTracking && (
              <li>Copy-paste is monitored and flagged.</li>
            )}
            <li>Closing the browser will terminate your session.</li>
            <li>Timer starts immediately after you click "Begin".</li>
          </ul>
        </div>

        {/* System Checks */}
        <div className="checks-section">
          <h3>System Check</h3>
          <div className="checks-list">
            {checks.map((c) => (
              <div key={c.id} className="check-row">
                {getCheckIcon(c.status)}
                <div className="check-info">
                  <span className="check-label">{c.label}</span>
                  <span className="check-desc">{c.desc}</span>
                </div>
                {c.status === 'ok' && <span className="check-ok-text">Ready</span>}
                {c.status === 'error' && (
                  <span className="check-err-text">
                    {c.id === 'camera' && assessment.proctoring.webcamRequired
                      ? 'Required!'
                      : 'Optional'}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Camera preview */}
          {checks.find((c) => c.id === 'camera')?.status === 'ok' && (
            <div className="camera-preview">
              <video ref={videoRef} muted playsInline className="camera-video" />
              <span className="camera-label">🟢 Camera active</span>
            </div>
          )}
        </div>

        {/* CTA */}
        {!isReady ? (
          <button
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            onClick={runAllChecks}
            id="btn-run-system-check"
          >
            <CheckCircle size={16} /> Run System Check
          </button>
        ) : (
          <button
            className={allPassed ? 'btn-primary' : 'btn-secondary'}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
            onClick={startAssessment}
            disabled={!allPassed}
            id="btn-begin-assessment"
          >
            {allPassed ? (
              <>🚀 Begin Assessment <ChevronRight size={14} /></>
            ) : (
              'Fix issues above to continue'
            )}
          </button>
        )}
      </div>

      <style>{`
        .onboarding-page { display:flex;align-items:center;justify-content:center;min-height:100vh;padding:24px; }
        .onboarding-card { max-width:560px;width:100%;padding:36px;display:flex;flex-direction:column;gap:24px; }
        .onboarding-loading,.onboarding-error { display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;min-height:60vh;color:var(--color-text-secondary); }
        .onboarding-error h2 { font-size:1.2rem;font-weight:700;color:var(--color-text-primary); }

        .onboarding-header { text-align:center; }
        .onboarding-badge { display:inline-block;padding:4px 12px;background:rgba(56,139,253,0.1);border:1px solid rgba(56,139,253,0.2);border-radius:20px;font-size:0.8rem;font-weight:600;color:var(--color-accent-blue);margin-bottom:12px; }
        .onboarding-title { font-size:1.5rem;font-weight:800;color:var(--color-text-primary);margin-bottom:8px; }
        .onboarding-desc { font-size:0.9rem;color:var(--color-text-secondary);line-height:1.6; }
        .onboarding-meta { display:flex;justify-content:center;gap:24px;margin-top:12px;font-size:0.875rem;color:var(--color-text-muted); }

        .rules-box { background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:8px;padding:16px; }
        .rules-box h3 { font-size:0.875rem;font-weight:700;color:var(--color-text-primary);margin-bottom:10px; }
        .rules-box ul { list-style:disc;padding-left:20px;display:flex;flex-direction:column;gap:6px; }
        .rules-box li { font-size:0.8rem;color:var(--color-text-secondary); }

        .checks-section { display:flex;flex-direction:column;gap:12px; }
        .checks-section h3 { font-size:0.875rem;font-weight:700;color:var(--color-text-primary); }
        .checks-list { display:flex;flex-direction:column;gap:6px; }
        .check-row { display:flex;align-items:center;gap:12px;padding:10px 14px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:8px; }
        .check-pending-dot { width:18px;height:18px;border-radius:50%;border:2px solid var(--color-border); }
        .check-info { flex:1;display:flex;flex-direction:column;gap:2px; }
        .check-label { font-size:0.875rem;font-weight:600;color:var(--color-text-primary); }
        .check-desc { font-size:0.75rem;color:var(--color-text-muted); }
        .check-ok-text { font-size:0.75rem;color:var(--color-accent-green);font-weight:600; }
        .check-err-text { font-size:0.75rem;color:var(--color-accent-red);font-weight:600; }

        .camera-preview { display:flex;flex-direction:column;align-items:center;gap:8px; }
        .camera-video { width:200px;height:150px;border-radius:12px;object-fit:cover;border:2px solid var(--color-accent-green); }
        .camera-label { font-size:0.75rem;color:var(--color-accent-green);font-weight:600; }

        .spin-icon { animation:spin 1s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
