import { useEffect, useState } from "react";
import { Moon, ShieldCheck, Sun } from "lucide-react";
import { Overview } from "./components/Overview";
import { Investigation } from "./components/Investigation";
import { issues } from "./lib/mockData";

function useDarkMode() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return [dark, setDark] as const;
}

function App() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dark, setDark] = useDarkMode();
  const selectedIssue = issues.find((i) => i.id === selectedId) ?? null;

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && selectedId) setSelectedId(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-slate-900 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2 rounded-lg bg-slate-900 p-1.5 dark:bg-indigo-600">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">API Spec Comparison</span>
          <span className="hidden text-sm text-slate-300 sm:inline dark:text-slate-700">/</span>
          <span className="hidden text-sm text-slate-500 sm:inline dark:text-slate-400">
            {selectedIssue ? "Investigation" : "Overview"}
          </span>
          <button
            onClick={() => setDark(!dark)}
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
            aria-pressed={dark}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 dark:focus-visible:outline-indigo-400"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      <main id="main">
        {selectedIssue ? (
          <Investigation issue={selectedIssue} onBack={() => setSelectedId(null)} />
        ) : (
          <Overview onSelectIssue={setSelectedId} />
        )}
      </main>
    </div>
  );
}

export default App;
