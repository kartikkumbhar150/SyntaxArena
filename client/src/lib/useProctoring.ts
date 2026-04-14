import { useEffect, useRef, useCallback } from 'react';

interface ProctoringEvent {
  type: 'tab_switch' | 'window_blur' | 'copy_paste' | 'mouse_leave';
  timestamp: string;
}

export function useProctoring() {
  const eventsRef = useRef<ProctoringEvent[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const logEvent = useCallback((type: ProctoringEvent['type']) => {
    const event: ProctoringEvent = { type, timestamp: new Date().toISOString() };
    eventsRef.current.push(event);
    console.warn(`[Proctoring System] Integrity Violation: ${type}`, event);
    // In actual implementation, we would POST this to the backend incrementally or via WebSocket
  }, []);

  useEffect(() => {
    // 1. Browser Focus & Tab Tracking
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logEvent('tab_switch');
      }
    };

    const handleWindowBlur = () => {
      logEvent('window_blur');
    };

    const handleMouseLeave = (e: MouseEvent) => {
      // If cursor leaves the window bounds
      if (e.clientY <= 0 || e.clientX <= 0 || (e.clientX >= window.innerWidth || e.clientY >= window.innerHeight)) {
        logEvent('mouse_leave');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('mouseleave', handleMouseLeave);
      stopWebcam();
    };
  }, [logEvent]);

  // 2. Webcam / MediaDevices Interception
  const startWebcam = async (videoElement: HTMLVideoElement) => {
    try {
      videoRef.current = videoElement;
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      // Mock snapshot loop
      setInterval(() => takeSnapshot(), 30000); // every 30s
    } catch (err) {
      console.error("[Proctoring] Failed to acquire webcam permissions", err);
      // In production, we'd block the assessment here.
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64Image = canvas.toDataURL('image/jpeg', 0.5); // compress
      // Here we would push `base64Image` to backend/S3
      // console.log("[Proctoring] Snapshot captured (base64 length: " + base64Image.length + ")");
    }
  };

  const interceptEditorPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    logEvent('copy_paste');
    alert("Proctoring Alert: Copying and pasting code is strictly prohibited during this assessment.");
  };

  return {
    events: eventsRef.current,
    startWebcam,
    stopWebcam,
    interceptEditorPaste,
    logEvent
  };
}
