import { useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useBeforeUnload } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useEditorStore } from '../../store/editorStore';
import { IDELayout } from '../../components/ide/IDELayout';
import api from '../../lib/api';
import type { Assessment, Problem, ProctoringEvent } from '../../types';

export function AssessmentPage() {
  const { assessmentId } = useParams<{ assessmentId: string }>();
  const navigate = useNavigate();
  const {
    setCurrentAssessment, addProctoringEvent,
    incrementTabSwitch, currentAssessment,
  } = useAssessmentStore();
  const { setProblem } = useEditorStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Load assessment ───────────────────────────────────────────────
  useEffect(() => {
    if (!assessmentId) return;
    Promise.all([
      api.get<Assessment>(`/assessments/${assessmentId}`),
      api.get<Problem[]>(`/assessments/${assessmentId}/problems`),
    ])
      .then(([aRes, pRes]) => {
        setCurrentAssessment(aRes.data);
        if (pRes.data[0]) setProblem(pRes.data[0]);
      })
      .catch(() => navigate('/candidate'));
  }, [assessmentId]);

  // ── Proctoring event logger ────────────────────────────────────────
  const logEvent = useCallback(
    (type: ProctoringEvent['type'], detail?: string) => {
      const event: ProctoringEvent = {
        type,
        timestamp: new Date().toISOString(),
        detail,
      };
      addProctoringEvent(event);
      // Fire-and-forget to backend
      api.post(`/assessments/${assessmentId}/proctoring`, event).catch(() => {});
    },
    [assessmentId, addProctoringEvent]
  );

  // ── Tab/window focus tracking ──────────────────────────────────────
  useEffect(() => {
    if (!currentAssessment?.proctoring) return;

    const handleBlur = () => logEvent('window_blur');
    const handleFocus = () => {}; // focus restored — no flag needed
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        logEvent('tab_switch');
        incrementTabSwitch();
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [currentAssessment, logEvent, incrementTabSwitch]);

  // ── Fullscreen change ──────────────────────────────────────────────
  useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement) logEvent('fullscreen_exit');
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, [logEvent]);

  // ── Webcam periodic snapshots ──────────────────────────────────────
  useEffect(() => {
    if (!currentAssessment?.proctoring.webcamRequired) return;

    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      streamRef.current = stream;
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      intervalRef.current = setInterval(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 320; canvas.height = 240;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, 320, 240);
          canvas.toBlob((blob) => {
            if (!blob) return;
            const fd = new FormData();
            fd.append('snapshot', blob, `snap_${Date.now()}.jpg`);
            fd.append('assessmentId', assessmentId!);
            api.post('/proctoring/snapshot', fd, {
              headers: { 'Content-Type': 'multipart/form-data' },
            }).catch(() => {});
          }, 'image/jpeg', 0.6);
        }
      }, 60_000); // snapshot every 60s
    }).catch(() => {});

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [currentAssessment, assessmentId]);

  // ── Prevent accidental navigation ─────────────────────────────────
  useBeforeUnload(
    useCallback(
      (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = '';
      },
      []
    )
  );

  if (!currentAssessment) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: 'var(--color-text-secondary)',
        }}
      >
        <div className="spinner" /> &nbsp; Loading assessment…
        <style>{`.spinner{width:20px;height:20px;border:2px solid rgba(255,255,255,0.2);border-top-color:#388bfd;border-radius:50%;animation:spin 0.6s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ height: 'calc(100vh - 52px)' }}>
      <IDELayout problem={useEditorStore.getState().problem!} assessmentId={assessmentId} />
    </div>
  );
}
