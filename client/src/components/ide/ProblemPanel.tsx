import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAssessmentStore } from '../../store/assessmentStore';

export function ProblemPanel() {
  const currentProblem = useAssessmentStore((state) => state.currentProblem);

  if (!currentProblem) return <div className="p-4">Loading problem...</div>;

  return (
    <div className="h-full overflow-auto bg-neutral-950 p-6 text-neutral-300">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">{currentProblem.title}</h1>
        <div className="flex space-x-3 text-xs">
          <span className={`px-2 py-1 rounded border ${
            currentProblem.difficulty === 'Easy' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
            currentProblem.difficulty === 'Medium' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
            'border-red-500/30 text-red-400 bg-red-500/10'
          }`}>
            {currentProblem.difficulty}
          </span>
          <span className="px-2 py-1 rounded border border-neutral-700 bg-neutral-800">
            Time: {currentProblem.timeLimit}ms
          </span>
          <span className="px-2 py-1 rounded border border-neutral-700 bg-neutral-800">
            Memory: {currentProblem.memoryLimit}MB
          </span>
        </div>
      </div>

      <div className="prose prose-invert max-w-none prose-pre:bg-neutral-900 prose-pre:border prose-pre:border-neutral-800">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {currentProblem.description}
        </ReactMarkdown>
      </div>
    </div>
  );
}
