import { ChevronDown } from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import type { Language } from '../../types';

const LANGUAGES: { id: Language; label: string; icon: string }[] = [
  { id: 'python', label: 'Python 3', icon: '🐍' },
  { id: 'javascript', label: 'Node.js', icon: '🟨' },
  { id: 'java', label: 'Java', icon: '☕' },
  { id: 'cpp', label: 'C++', icon: '⚙️' },
  { id: 'csharp', label: 'C#', icon: '🔷' },
];

export function LanguageSelector() {
  const { language, setLanguage } = useEditorStore();

  const current = LANGUAGES.find((l) => l.id === language) || LANGUAGES[0];

  return (
    <div className="lang-selector">
      <div className="lang-selector-trigger">
        <span className="lang-icon">{current.icon}</span>
        <span className="lang-label">{current.label}</span>
        <ChevronDown size={14} className="lang-chevron" />
      </div>
      <div className="lang-dropdown fade-in">
        {LANGUAGES.map((l) => (
          <button
            key={l.id}
            className={`lang-option ${language === l.id ? 'lang-option--active' : ''}`}
            onClick={() => setLanguage(l.id)}
          >
            <span className="lang-icon">{l.icon}</span>
            {l.label}
          </button>
        ))}
      </div>

      <style>{`
        .lang-selector { position:relative;display:inline-block; }
        .lang-selector-trigger { display:flex;align-items:center;gap:8px;padding:6px 12px;background:var(--color-bg-tertiary);border:1px solid var(--color-border);border-radius:6px;cursor:pointer;transition:all 0.2s; }
        .lang-selector-trigger:hover { background:var(--color-bg-elevated);border-color:var(--color-text-muted); }
        .lang-icon { font-size:1rem; }
        .lang-label { font-size:0.85rem;font-weight:500;color:var(--color-text-primary); }
        .lang-chevron { color:var(--color-text-muted); }

        .lang-dropdown { position:absolute;top:calc(100% + 4px);left:0;background:var(--color-bg-secondary);border:1px solid var(--color-border);border-radius:8px;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,0.5);display:none;flex-direction:column;min-width:140px;z-index:100; }
        .lang-selector:hover .lang-dropdown { display:flex; }
        .lang-option { display:flex;align-items:center;gap:8px;padding:8px 12px;background:none;border:none;border-radius:4px;cursor:pointer;text-align:left;font-size:0.85rem;color:var(--color-text-secondary);transition:all 0.15s; }
        .lang-option:hover { background:var(--color-bg-elevated);color:var(--color-text-primary); }
        .lang-option--active { background:rgba(56,139,253,0.1);color:var(--color-accent-blue);font-weight:600; }
      `}</style>
    </div>
  );
}
