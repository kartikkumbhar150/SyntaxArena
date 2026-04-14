import SplitPane from 'react-split-pane';
import { ProblemPanel } from '../../components/ide/ProblemPanel';
import { EditorPanel } from '../../components/ide/EditorPanel';
import { ConsolePanel } from '../../components/ide/ConsolePanel';

export function Assessment() {
  return (
    <div className="flex-1 w-full h-full relative overflow-hidden ide-layout">
      {/* @ts-ignore - react-split-pane types are sometimes tricky with React 18 */}
      <SplitPane 
        split="vertical" 
        minSize={300} 
        defaultSize="40%" 
        maxSize={800}
        className="w-full h-full"
        resizerClassName="w-1.5 cursor-col-resize bg-neutral-800 hover:bg-blue-500/50 transition-colors z-10"
      >
        <ProblemPanel />
        
        {/* @ts-ignore */}
        <SplitPane 
          split="horizontal" 
          minSize={200} 
          defaultSize="60%"
          resizerClassName="h-1.5 w-full cursor-row-resize bg-neutral-800 hover:bg-blue-500/50 transition-colors z-10"
        >
          <EditorPanel />
          <ConsolePanel />
        </SplitPane>
      </SplitPane>
    </div>
  );
}
