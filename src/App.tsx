import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Overview } from "./components/Overview";
import { Investigation } from "./components/Investigation";
import { issues } from "./lib/mockData";

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIssue = issues.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-3">
          <ShieldCheck className="h-5 w-5 text-slate-900" />
          <span className="text-sm font-semibold text-slate-900">API Spec Comparison</span>
          <span className="text-sm text-slate-300">/</span>
          <span className="text-sm text-slate-500">{selectedIssue ? "Investigation" : "Overview"}</span>
        </div>
      </header>

      {selectedIssue ? (
        <Investigation issue={selectedIssue} onBack={() => setSelectedId(null)} />
      ) : (
        <Overview onSelectIssue={setSelectedId} />
      )}
    </div>
  );
}

export default App;
