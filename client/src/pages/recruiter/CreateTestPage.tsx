import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Trash2, ChevronRight, Clock, Shield } from 'lucide-react';
import api from '../../lib/api';

interface TestForm {
  title: string;
  description: string;
  duration: number;
  problemIds: string[];
  expiresInDays: number;
  proctoring: {
    webcamRequired: boolean;
    screenRecordRequired: boolean;
    clipboardTracking: boolean;
    tabSwitchLimit: number;
  };
}

const DEFAULT_FORM: TestForm = {
  title: '',
  description: '',
  duration: 90,
  problemIds: [],
  expiresInDays: 7,
  proctoring: {
    webcamRequired: true,
    screenRecordRequired: false,
    clipboardTracking: true,
    tabSwitchLimit: 3,
  },
};

const STEPS = ['Details', 'Questions', 'Proctoring', 'Review'];

export function CreateTestPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<TestForm>(DEFAULT_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const navigate = useNavigate();

  const update = <K extends keyof TestForm>(k: K, v: TestForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const updateProctoring = <K extends keyof TestForm['proctoring']>(
    k: K,
    v: TestForm['proctoring'][K]
  ) => setForm((f) => ({ ...f, proctoring: { ...f.proctoring, [k]: v } }));

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post<{ inviteToken: string; id: string }>(
        '/assessments',
        form
      );
      const link = `${window.location.origin}/join/${data.inviteToken}`;
      setInviteLink(link);
    } catch {
      alert('Failed to create assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (inviteLink) {
    return (
      <div className="ct-success fade-in">
        <div className="ct-success-card glass-card">
          <div className="ct-success-icon">🎉</div>
          <h2>Assessment Created!</h2>
          <p>Share this invite link with your candidates:</p>
          <div className="invite-link-box">
            <code>{inviteLink}</code>
            <button
              className="btn-secondary"
              onClick={() => navigator.clipboard.writeText(inviteLink)}
            >
              Copy
            </button>
          </div>
          <div className="ct-success-actions">
            <button className="btn-secondary" onClick={() => navigate('/recruiter')}>
              Back to Dashboard
            </button>
            <button className="btn-primary" onClick={() => navigate('/recruiter/invites')}>
              Manage Invites <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <style>{`
          .ct-success { display:flex;align-items:center;justify-content:center;min-height:60vh; }
          .ct-success-card { padding:48px;max-width:560px;width:100%;text-align:center;display:flex;flex-direction:column;align-items:center;gap:16px; }
          .ct-success-icon { font-size:3rem; }
          .ct-success-card h2 { font-size:1.6rem;font-weight:700; }
          .ct-success-card p { color:var(--color-text-secondary);font-size:0.9rem; }
          .invite-link-box { display:flex;align-items:center;gap:8px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:8px;padding:12px 16px;width:100%;overflow:hidden; }
          .invite-link-box code { flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:0.8rem;color:var(--color-accent-blue); }
          .ct-success-actions { display:flex;gap:12px;margin-top:8px; }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ct-page fade-in">
      <div className="ct-header">
        <h1 className="page-title">Create Assessment</h1>
        <p className="page-subtitle">Build a new coding test for your candidates</p>
      </div>

      {/* Stepper */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`step ${i === step ? 'step--active' : ''} ${i < step ? 'step--done' : ''}`}
            onClick={() => i < step && setStep(i)}
          >
            <div className="step-circle">
              {i < step ? '✓' : i + 1}
            </div>
            <span className="step-label">{s}</span>
            {i < STEPS.length - 1 && <div className="step-line" />}
          </div>
        ))}
      </div>

      {/* Step 0: Details */}
      {step === 0 && (
        <div className="ct-card slide-up">
          <h2 className="ct-section-title">Assessment Details</h2>
          <div className="ct-form">
            <div className="form-group">
              <label className="form-label">Assessment Title *</label>
              <input
                className="input-field"
                placeholder="e.g. Backend Engineer — Round 1"
                value={form.title}
                onChange={(e) => update('title', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Brief description visible to candidates..."
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
            </div>
            <div className="ct-form-row">
              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} /> Duration (minutes) *
                </label>
                <input
                  type="number"
                  className="input-field"
                  min={15}
                  max={300}
                  value={form.duration}
                  onChange={(e) => update('duration', +e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Invite Expires In (days)</label>
                <input
                  type="number"
                  className="input-field"
                  min={1}
                  max={30}
                  value={form.expiresInDays}
                  onChange={(e) => update('expiresInDays', +e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="ct-actions">
            <button
              className="btn-primary"
              onClick={() => setStep(1)}
              disabled={!form.title.trim()}
            >
              Next: Questions <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Questions */}
      {step === 1 && (
        <div className="ct-card slide-up">
          <h2 className="ct-section-title">Select Problems</h2>
          <p className="ct-step-hint">
            Browse your question library and add problems. You can also create new ones.
          </p>
          <div className="problem-picker">
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Question library integration — connect to <code>/api/problems</code> to list available problems.
              Selected: <strong>{form.problemIds.length}</strong>
            </p>
            <button
              className="btn-secondary"
              onClick={() => navigate('/recruiter/questions')}
              style={{ width: 'fit-content' }}
            >
              <PlusCircle size={14} /> Open Library
            </button>
          </div>
          <div className="ct-actions">
            <button className="btn-ghost" onClick={() => setStep(0)}>Back</button>
            <button className="btn-primary" onClick={() => setStep(2)}>
              Next: Proctoring <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Proctoring */}
      {step === 2 && (
        <div className="ct-card slide-up">
          <h2 className="ct-section-title">
            <Shield size={18} /> Proctoring Settings
          </h2>
          <p className="ct-step-hint">Configure anti-cheat measures for this assessment.</p>
          <div className="proctoring-options">
            {[
              { key: 'webcamRequired', label: 'Webcam Required', desc: 'Mandatory webcam access; periodic snapshots uploaded.' },
              { key: 'screenRecordRequired', label: 'Screen Recording', desc: 'Records screen during the assessment.' },
              { key: 'clipboardTracking', label: 'Clipboard Tracking', desc: 'Flags copy/paste events inside the editor.' },
            ].map((opt) => (
              <label key={opt.key} className="proctoring-toggle">
                <div className="proctoring-toggle-info">
                  <span className="proctoring-toggle-label">{opt.label}</span>
                  <span className="proctoring-toggle-desc">{opt.desc}</span>
                </div>
                <div
                  className={`toggle ${form.proctoring[opt.key as 'webcamRequired' | 'screenRecordRequired' | 'clipboardTracking'] ? 'toggle--on' : ''}`}
                  onClick={() =>
                    updateProctoring(
                      opt.key as 'webcamRequired' | 'screenRecordRequired' | 'clipboardTracking',
                      !form.proctoring[opt.key as 'webcamRequired' | 'screenRecordRequired' | 'clipboardTracking']
                    )
                  }
                >
                  <div className="toggle-thumb" />
                </div>
              </label>
            ))}
            <div className="form-group">
              <label className="form-label">Max Tab Switches Before Flag</label>
              <input
                type="number"
                className="input-field"
                min={1}
                max={10}
                value={form.proctoring.tabSwitchLimit}
                onChange={(e) => updateProctoring('tabSwitchLimit', +e.target.value)}
                style={{ width: '80px' }}
              />
            </div>
          </div>
          <div className="ct-actions">
            <button className="btn-ghost" onClick={() => setStep(1)}>Back</button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Next: Review <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="ct-card slide-up">
          <h2 className="ct-section-title">Review & Create</h2>
          <div className="review-grid">
            <div className="review-row"><span>Title</span><strong>{form.title}</strong></div>
            <div className="review-row"><span>Duration</span><strong>{form.duration} minutes</strong></div>
            <div className="review-row"><span>Problems</span><strong>{form.problemIds.length} selected</strong></div>
            <div className="review-row"><span>Invite expires</span><strong>In {form.expiresInDays} days</strong></div>
            <div className="review-row"><span>Webcam</span><strong>{form.proctoring.webcamRequired ? '✅ Yes' : '❌ No'}</strong></div>
            <div className="review-row"><span>Screen Record</span><strong>{form.proctoring.screenRecordRequired ? '✅ Yes' : '❌ No'}</strong></div>
            <div className="review-row"><span>Clipboard Tracking</span><strong>{form.proctoring.clipboardTracking ? '✅ Yes' : '❌ No'}</strong></div>
            <div className="review-row"><span>Tab Switch Limit</span><strong>{form.proctoring.tabSwitchLimit}</strong></div>
          </div>
          <div className="ct-actions">
            <button className="btn-ghost" onClick={() => setStep(2)}>Back</button>
            <button
              className="btn-primary"
              onClick={handleCreate}
              disabled={isSubmitting || !form.title.trim()}
              id="btn-publish-assessment"
            >
              {isSubmitting ? <span className="spinner" /> : '🚀 Publish Assessment'}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ct-page { display:flex;flex-direction:column;gap:28px;max-width:760px; }
        .ct-header { margin-bottom:4px; }
        .page-title { font-size:1.6rem;font-weight:700;color:var(--color-text-primary);margin-bottom:4px; }
        .page-subtitle { font-size:0.9rem;color:var(--color-text-secondary); }

        .stepper { display:flex;align-items:center;gap:0; }
        .step { display:flex;align-items:center;gap:8px;cursor:default; }
        .step-circle { width:28px;height:28px;border-radius:50%;background:var(--color-bg-elevated);border:2px solid var(--color-border);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:var(--color-text-muted);transition:all 0.2s; }
        .step--active .step-circle { background:var(--color-accent-blue);border-color:var(--color-accent-blue);color:white; }
        .step--done .step-circle { background:var(--color-accent-green);border-color:var(--color-accent-green);color:white;cursor:pointer; }
        .step-label { font-size:0.8rem;font-weight:500;color:var(--color-text-muted);white-space:nowrap; }
        .step--active .step-label { color:var(--color-text-primary); }
        .step--done .step-label { color:var(--color-accent-green); }
        .step-line { width:40px;height:2px;background:var(--color-border);margin:0 8px; }

        .ct-card { background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:12px;padding:28px; }
        .ct-section-title { font-size:1.1rem;font-weight:700;color:var(--color-text-primary);display:flex;align-items:center;gap:8px;margin-bottom:20px; }
        .ct-step-hint { font-size:0.875rem;color:var(--color-text-secondary);margin-bottom:20px; }
        .ct-form { display:flex;flex-direction:column;gap:16px; }
        .ct-form-row { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        .ct-actions { display:flex;justify-content:flex-end;align-items:center;gap:12px;margin-top:24px;padding-top:20px;border-top:1px solid var(--color-border); }

        .problem-picker { display:flex;flex-direction:column;gap:16px;padding:20px;background:var(--color-bg-tertiary);border:1px dashed var(--color-border);border-radius:8px; }

        .proctoring-options { display:flex;flex-direction:column;gap:12px; }
        .proctoring-toggle { display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:var(--color-bg-tertiary);border:1px solid var(--color-border);border-radius:8px;cursor:pointer;gap:16px; }
        .proctoring-toggle-info { display:flex;flex-direction:column;gap:2px; }
        .proctoring-toggle-label { font-size:0.875rem;font-weight:600;color:var(--color-text-primary); }
        .proctoring-toggle-desc { font-size:0.75rem;color:var(--color-text-muted); }
        .toggle { width:44px;height:24px;background:var(--color-bg-elevated);border:1px solid var(--color-border);border-radius:12px;padding:2px;cursor:pointer;transition:all 0.2s;flex-shrink:0; }
        .toggle--on { background:var(--color-accent-blue);border-color:var(--color-accent-blue); }
        .toggle-thumb { width:18px;height:18px;background:white;border-radius:50%;transition:transform 0.2s;box-shadow:0 1px 4px rgba(0,0,0,0.3); }
        .toggle--on .toggle-thumb { transform:translateX(20px); }

        .review-grid { display:flex;flex-direction:column;gap:8px;margin-bottom:8px; }
        .review-row { display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:var(--color-bg-tertiary);border-radius:6px; }
        .review-row span { font-size:0.875rem;color:var(--color-text-secondary); }
        .review-row strong { font-size:0.875rem;color:var(--color-text-primary); }

        .spinner { width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:spin 0.6s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
