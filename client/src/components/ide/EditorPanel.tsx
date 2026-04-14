import Editor, { useMonaco } from '@monaco-editor/react';
import { useAssessmentStore } from '../../store/assessmentStore';
import { Play } from 'lucide-react';
import { useProctoring } from '../../lib/useProctoring';
import { useCollaboration } from '../../lib/useCollaboration';
import { useState } from 'react';
import { editor } from 'monaco-editor';

export function EditorPanel() {
  const { language, code, setLanguage, setCode } = useAssessmentStore();
  const { interceptEditorPaste } = useProctoring();
  const [editorInstance, setEditorInstance] = useState<editor.IStandaloneCodeEditor | null>(null);

  // We hardcode sessionId to 'session-123' for dummy purposes. Usually it comes from route params.
  const { collaborators, connectionState } = useCollaboration('session-123', editorInstance);

  const handleEditorDidMount = (editor: any, monaco: any) => {
    setEditorInstance(editor);
    // We can also tap into Monaco directly if needed, but wrapping the div is safer for intercepting OS level pastes
    editor.onKeyDown((e: any) => {
      // CMD/CTRL + V or C
      if ((e.ctrlKey || e.metaKey) && (e.keyCode === monaco.KeyCode.KeyV || e.keyCode === monaco.KeyCode.KeyC)) {
        e.preventDefault();
        e.stopPropagation();
        interceptEditorPaste(e as any);
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-neutral-900 border-b border-neutral-800">
      {/* Editor Toolbar */}
      <div className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-950 shrink-0">
        <div className="flex items-center space-x-4">
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
          {collaborators.length > 0 && (
            <div className="flex -space-x-2">
              {collaborators.map((c, i) => (
                <div key={c} className="w-6 h-6 rounded-full bg-blue-500 border border-neutral-900 flex items-center justify-center text-[10px] text-white tooltip cursor-pointer" title={c}>
                  U{i + 1}
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
          <Play size={16} />
          <span>Run Code</span>
        </button>
      </div>

      {/* Monaco Editor */}
      <div 
        className="flex-1 overflow-hidden relative" 
        onPaste={interceptEditorPaste} 
        onCopy={interceptEditorPaste}
        onCut={interceptEditorPaste}
        onDrop={(e) => { e.preventDefault(); interceptEditorPaste(e as any); }}
      >
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={(val) => setCode(val || '')}
          onMount={handleEditorDidMount}
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
