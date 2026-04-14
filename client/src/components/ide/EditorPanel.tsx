import Editor from '@monaco-editor/react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { Play } from 'lucide-react';

export function EditorPanel() {
  const { language, code, setLanguage, setCode } = useAssessmentStore();

  return (
    <div className="h-full flex flex-col bg-neutral-900 border-b border-neutral-800">
      {/* Editor Toolbar */}
      <div className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-950 shrink-0">
        <select 
          className="bg-neutral-800 border border-neutral-700 text-sm rounded-md px-3 py-1.5 focus:outline-none focus:border-blue-500 text-neutral-300"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript (Node.js)</option>
          <option value="python">Python 3</option>
          <option value="java">Java 21</option>
          <option value="cpp">C++ 20</option>
          <option value="csharp">C# 12</option>
        </select>

        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
          <Play size={16} />
          <span>Run Code</span>
        </button>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden relative">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 16 }
          }}
        />
      </div>
    </div>
  );
}
