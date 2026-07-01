import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import akamaiLogo from "./assets/akamai-logo.svg";
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
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
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
    <div className="min-h-screen bg-[var(--background)] transition-colors duration-500">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-slate-200/60 glass dark:border-slate-800/60 transition-all">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <img src={akamaiLogo} alt="Akamai logo" className="h-9 w-auto" />
            <div>
              <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white leading-none">
                Home Assignment
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 ml-8 border-l border-slate-200 dark:border-slate-800 pl-8">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">Scope</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Fleet Overview</span>
          </div>

          <button
            onClick={() => setDark(!dark)}
            className="ml-auto flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105 active:scale-95"
          >
            {dark ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-slate-600" />}
          </button>
        </div>
      </header>

      <main id="main">
        <Overview onSelectIssue={setSelectedId} />
      </main>

      {selectedIssue && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedId(null)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-6xl overflow-y-auto bg-[var(--background)] shadow-2xl border-l border-slate-200/60 dark:border-slate-800/60 animate-drawer-slide-in">
            <Investigation issue={selectedIssue} onBack={() => setSelectedId(null)} />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
