import { useAssessmentStore } from '../../store/assessmentStore';
import { Terminal, CheckCircle2 } from 'lucide-react';

export function ConsolePanel() {
  const { activeTab, setActiveTab, testCases, consoleOutput } = useAssessmentStore();

  return (
    <div className="h-full flex flex-col bg-neutral-950">
      {/* Tabs */}
      <div className="h-10 border-b border-neutral-800 flex items-center px-2 shrink-0 overflow-x-auto">
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'testcases' ? 'border-blue-500 text-blue-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
          onClick={() => setActiveTab('testcases')}
        >
          Test Cases
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'console' ? 'border-blue-500 text-blue-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
          onClick={() => setActiveTab('console')}
        >
          Console
        </button>
        <button 
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'custom' ? 'border-blue-500 text-blue-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom Input
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {activeTab === 'testcases' && (
          <div className="space-y-4">
            {testCases.map((tc, index) => (
              <div key={tc.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="font-medium text-sm text-neutral-200">Case {index + 1}</span>
                </div>
                <div className="space-y-3 test-case-details">
                  <div>
                    <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Input</span>
                    <pre className="bg-neutral-950 p-2 rounded border border-neutral-800 text-sm text-neutral-300 font-mono whitespace-pre-wrap">{tc.input}</pre>
                  </div>
                  <div>
                    <span className="text-xs text-neutral-500 uppercase tracking-wider mb-1 block">Expected Output</span>
                    <pre className="bg-neutral-950 p-2 rounded border border-neutral-800 text-sm text-neutral-300 font-mono whitespace-pre-wrap">{tc.expectedOutput}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'console' && (
          <div className="h-full">
            {consoleOutput ? (
              <pre className="font-mono text-sm text-neutral-300 whitespace-pre-wrap">{consoleOutput}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3">
                <Terminal size={32} className="opacity-50" />
                <p>Run your code to see the output here</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="h-full flex flex-col">
            <textarea 
              className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-sm text-neutral-300 font-mono focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Enter custom input here..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
