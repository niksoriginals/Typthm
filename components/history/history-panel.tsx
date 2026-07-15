"use client";

import { Trash, ChartLineUp, Clock, Trophy, X } from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerPopup,
  DrawerTitle,
} from "@/components/ui/drawer";
import useMediaQuery from "@/hooks/use-media-query";
import {
  getHistory,
  clearHistory,
  deleteHistoryEntry,
  type HistoryEntry,
} from "@/lib/results-history";
import { cn } from "@/lib/utils";

interface HistoryPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const chartConfig: ChartConfig = {
  wpm: {
    label: "WPM",
    color: "var(--color-primary)",
  },
};

export function HistoryPanel({ open, onOpenChange }: HistoryPanelProps) {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const swipe = "down";

  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Hydrate on mount/open
  useEffect(() => {
    if (open) {
      setHistory(getHistory());
    }
  }, [open]);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const wpms = history.map((h) => h.wpm);
    const accs = history.map((h) => h.accuracy);
    const avgWpm = Math.round(wpms.reduce((a, b) => a + b, 0) / history.length);
    const maxWpm = Math.max(...wpms);
    const avgAcc = Math.round(accs.reduce((a, b) => a + b, 0) / history.length);
    return { avgWpm, maxWpm, avgAcc };
  }, [history]);

  const chartData = useMemo(() => {
    // Reverse so oldest is left, newest is right
    return history
      .slice()
      .reverse()
      .map((h, i) => ({
        test: i + 1,
        wpm: h.wpm,
      }));
  }, [history]);

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear your entire typing history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const updated = deleteHistoryEntry(id);
    setHistory(updated);
  };

  const popupClass = cn(
    "overflow-hidden! border-t! border-foreground/[0.08]!",
    isMobile
      ? "mx-0! mb-0! flex h-[80dvh] max-h-[85dvh] w-full flex-col rounded-t-3xl! rounded-b-none! border-x-0! border-b-0! [--bleed:0px]"
      : "mx-auto! mb-0! flex w-[520px] max-w-[95vw] h-[640px] max-h-[85dvh] flex-col rounded-t-3xl! rounded-b-none! border-b-0! [--bleed:0px] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]!"
  );

  return (
    <Drawer onOpenChange={onOpenChange} open={open} swipeDirection={swipe}>
      <DrawerPopup className={popupClass}>
        <DrawerContent className="flex h-full min-h-0 flex-col overflow-hidden">
          {/* Header */}
          <div className="relative flex shrink-0 items-center justify-between border-foreground/[0.06] border-b px-6 py-4">
            <div className="space-y-0.5">
              <DrawerTitle className="font-semibold text-foreground text-base tracking-tight flex items-center gap-1.5">
                <Clock className="text-muted-foreground/75" size={18} />
                Typing History
              </DrawerTitle>
              <p className="text-[11px] text-muted-foreground/60 leading-none">
                Track your speed and accuracy progress
              </p>
            </div>
            <DrawerClose className="rounded-lg p-1 text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground">
              <X size={16} />
            </DrawerClose>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col min-h-0">
            {history.length === 0 ? (
              <div className="my-auto flex flex-col items-center justify-center text-center p-8 space-y-3">
                <div className="rounded-full bg-foreground/[0.03] p-4 text-muted-foreground/45 border border-foreground/[0.04]">
                  <Clock size={32} />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground text-sm">No results recorded yet</p>
                  <p className="max-w-[280px] text-muted-foreground/60 text-[11px] leading-normal">
                    Complete your first typing test to start tracking stats, averages, and speed trends!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6 flex-1 flex flex-col min-h-0">
                {/* Highlights Grid */}
                {stats && (
                  <div className="grid grid-cols-3 gap-3">
                    <HighlightCard
                      icon={<Trophy className="text-amber-500" size={13} weight="duotone" />}
                      label="Best WPM"
                      value={stats.maxWpm}
                    />
                    <HighlightCard
                      icon={<ChartLineUp className="text-primary" size={13} weight="duotone" />}
                      label="Average WPM"
                      value={stats.avgWpm}
                    />
                    <HighlightCard
                      icon={<span className="text-emerald-500 font-semibold text-[10px]">%</span>}
                      label="Avg Accuracy"
                      value={`${stats.avgAcc}%`}
                    />
                  </div>
                )}

                {/* Progress Chart */}
                {chartData.length > 1 && (
                  <div className="h-[150px] w-full shrink-0 border border-foreground/[0.04] bg-foreground/[0.01] rounded-xl p-3">
                    <ChartContainer className="h-full w-full" config={chartConfig}>
                      <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid stroke="currentColor" strokeOpacity={0.04} vertical={false} />
                        <XAxis dataKey="test" tick={false} axisLine={false} tickLine={false} />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: "currentColor", opacity: 0.35 }}
                          width={30}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              formatter={(value, name) => [
                                <span className="font-bold font-mono" key={name}>
                                  {value}
                                </span>,
                                "WPM",
                              ]}
                            />
                          }
                          cursor={{ stroke: "currentColor", strokeOpacity: 0.15, strokeWidth: 1 }}
                        />
                        <Line
                          activeDot={{ r: 4, strokeWidth: 0 }}
                          dataKey="wpm"
                          dot={{ r: 2, fill: "var(--color-primary)", strokeWidth: 0 }}
                          stroke="var(--color-primary)"
                          strokeWidth={2}
                          type="monotone"
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                )}

                {/* List of past tests */}
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between border-foreground/[0.06] border-b pb-2">
                    <span className="font-medium text-[11px] text-muted-foreground uppercase tracking-widest">
                      Recent Tests ({history.length})
                    </span>
                    <button
                      className="text-[10px] text-destructive hover:underline font-medium focus:outline-none"
                      onClick={handleClearAll}
                      type="button"
                    >
                      Clear all
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto divide-y divide-foreground/[0.03] pr-1">
                    {history.map((entry) => (
                      <HistoryItem
                        entry={entry}
                        key={entry.id}
                        onDelete={() => handleDeleteEntry(entry.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </DrawerContent>
      </DrawerPopup>
    </Drawer>
  );
}

function HighlightCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-xl border border-foreground/[0.04] bg-foreground/[0.015] shadow-xs text-center space-y-1">
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <span className="font-bold font-mono text-lg text-foreground leading-none">{value}</span>
    </div>
  );
}

function HistoryItem({ entry, onDelete }: { entry: HistoryEntry; onDelete: () => void }) {
  const timeStr = useMemo(() => {
    const elapsed = Date.now() - new Date(entry.date).getTime();
    const mins = Math.floor(elapsed / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }, [entry.date]);

  return (
    <div className="group flex items-center justify-between py-2.5 transition-colors hover:bg-foreground/[0.01] px-1 rounded-lg">
      <div className="flex items-center gap-4">
        {/* Speed */}
        <div className="flex flex-col">
          <span className="font-bold font-mono text-base text-foreground leading-tight">
            {entry.wpm}
            <span className="text-[10px] text-muted-foreground/60 font-medium ml-0.5">wpm</span>
          </span>
          <span className="text-[10px] text-muted-foreground/65 leading-none">
            {entry.accuracy}% acc
          </span>
        </div>

        {/* Mode Tag */}
        <div className="flex flex-col gap-0.5">
          <span className="inline-flex max-w-max items-center rounded-md border border-foreground/[0.06] bg-foreground/[0.02] px-1.5 py-0.5 text-[9px] text-muted-foreground/80 leading-none">
            {entry.mode} {entry.modeDetail}
          </span>
          <span className="text-[9px] text-muted-foreground/45 leading-none">{timeStr}</span>
        </div>
      </div>

      {/* Delete button */}
      <button
        aria-label="Delete entry"
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground/50 hover:text-destructive rounded-md hover:bg-destructive/10 transition-all focus:opacity-100 focus:outline-none"
        onClick={onDelete}
        type="button"
      >
        <Trash size={13} />
      </button>
    </div>
  );
}
