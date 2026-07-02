import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Moon, Sun, X } from "lucide-react";
import akamaiLogo from "./assets/akamai-logo.svg";
import { Overview } from "./components/Overview";
import { Investigation } from "./components/Investigation";
import { issues } from "./lib/mockData";
import type { RecommendedAction } from "./lib/types";

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
  const [visibleIssueIds, setVisibleIssueIds] = useState<string[]>([]);
  // Keyed by issue id, so a determination made in the drawer is remembered
  // per-issue (surviving prev/next navigation) and reflected back in the
  // table's Action column, not just held as local, throwaway drawer state.
  const [resolvedActions, setResolvedActions] = useState<Record<string, RecommendedAction>>({});
  const [dark, setDark] = useDarkMode();
  const selectedIssue = issues.find((i) => i.id === selectedId) ?? null;

  // Navigate through whatever's currently visible in the (filtered + sorted)
  // table, not raw dataset order, so prev/next matches what the user was
  // actually looking at when they opened the drawer.
  const currentIndex = selectedId ? visibleIssueIds.indexOf(selectedId) : -1;
  const prevId = currentIndex > 0 ? visibleIssueIds[currentIndex - 1] : null;
  const nextId = currentIndex >= 0 && currentIndex < visibleIssueIds.length - 1 ? visibleIssueIds[currentIndex + 1] : null;

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
        <div className="mx-auto flex max-w-full items-center gap-4 px-6 sm:px-10 py-3">
          <div className="flex items-center gap-3">
            <img src={akamaiLogo} alt="Akamai logo" className="h-9 w-auto" />
            <div>
              <div className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white leading-none">
                Home Assignment
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 ml-2 border-l border-slate-200 dark:border-slate-800 pl-4">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700"></span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Matan Vahaba</span>
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
        <Overview
          onSelectIssue={setSelectedId}
          onVisibleIssuesChange={setVisibleIssueIds}
          resolvedActions={resolvedActions}
        />
      </main>

      {selectedIssue && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
            onClick={() => setSelectedId(null)}
          />
          {/* Close FAB lives outside the drawer's own scroll container, so it
              never scrolls away with the content and stays visually
              separate from the panel it's closing. Anchored just outside
              the drawer's left edge when there's backdrop room to show it
              there, with an even 1rem gap on both sides for symmetry; falls
              back to the drawer's own top-left corner (same 1rem margin) on
              narrow screens where the drawer is full-width. */}
          <button
            type="button"
            onClick={() => setSelectedId(null)}
            aria-label="Close"
            className="fixed top-6 z-[60] flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white text-slate-600 shadow-lg ring-1 ring-slate-200 transition-all duration-200 hover:scale-105 hover:bg-slate-50 active:scale-95 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700 dark:hover:bg-slate-700 animate-fade-in"
            style={{ left: "max(1rem, calc(100vw - 72rem - 3.75rem))" }}
          >
            <X className="h-5 w-5" />
          </button>
          {/* Prev/next navigate through the table's currently visible
              (filtered + sorted) rows rather than closing back to the
              blurred-out table just to pick another row. */}
          <div
            className="fixed z-[60] flex w-11 flex-col overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700 animate-fade-in"
            style={{ top: "5rem", left: "max(1rem, calc(100vw - 72rem - 3.75rem))" }}
          >
            <button
              type="button"
              onClick={() => prevId && setSelectedId(prevId)}
              disabled={!prevId}
              aria-label="Previous issue"
              className="flex h-11 w-11 cursor-pointer items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronUp className="h-5 w-5" />
            </button>
            <div className="h-px w-full bg-slate-200 dark:bg-slate-700" />
            <button
              type="button"
              onClick={() => nextId && setSelectedId(nextId)}
              disabled={!nextId}
              aria-label="Next issue"
              className="flex h-11 w-11 cursor-pointer items-center justify-center text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <ChevronDown className="h-5 w-5" />
            </button>
          </div>
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-6xl overflow-y-auto bg-[var(--background)] shadow-2xl border-l border-slate-200/60 dark:border-slate-800/60 animate-drawer-slide-in">
            <Investigation
              issue={selectedIssue}
              resolvedAction={resolvedActions[selectedIssue.id] ?? null}
              onResolve={(action) =>
                setResolvedActions((prev) => ({ ...prev, [selectedIssue.id]: action }))
              }
            />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
