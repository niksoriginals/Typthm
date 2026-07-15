export interface HistoryEntry {
  id: string;
  wpm: number;
  accuracy: number;
  mode: string;
  modeDetail: string;
  date: string;
}

const HISTORY_KEY = "tc-results-history";

export function getHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function saveToHistory(
  wpm: number,
  accuracy: number,
  mode: string,
  modeDetail: string
): HistoryEntry[] {
  const history = getHistory();

  // Deduplicate: prevent saving the exact same result multiple times within 2 seconds
  // (e.g. from React Strict Mode double invocation in development)
  if (history.length > 0) {
    const last = history[0];
    const timeDiff = Date.now() - new Date(last.date).getTime();
    if (
      last.wpm === wpm &&
      last.accuracy === accuracy &&
      last.mode === mode &&
      last.modeDetail === modeDetail &&
      timeDiff < 2000
    ) {
      return history;
    }
  }

  const newEntry: HistoryEntry = {
    id: Math.random().toString(36).substring(2, 9),
    wpm,
    accuracy,
    mode,
    modeDetail,
    date: new Date().toISOString(),
  };
  // Limit to last 100 entries to prevent storage bloat
  const updated = [newEntry, ...history].slice(0, 100);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export function clearHistory(): void {
  localStorage.removeItem(HISTORY_KEY);
}

export function deleteHistoryEntry(id: string): HistoryEntry[] {
  const history = getHistory();
  const updated = history.filter((e) => e.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}
