"use client";

import {
  Command,
  GearSix,
  GithubLogo,
  SpeakerHigh,
  SpeakerSlash,
  Clock,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HistoryPanel } from "@/components/history/history-panel";
import { TypthmLogo } from "@/components/layout/typthm-logo";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { useSettings } from "@/components/settings/settings-provider";
import { DynamicFavicon } from "@/components/theme/dynamic-favicon";
import { VisitCount } from "@/components/visit-count";
import { cn } from "@/lib/utils";

interface AppChromeContextValue {
  homeLogoHandlerRef: React.MutableRefObject<(() => void) | null>;
  setSettingsOpen: (open: boolean) => void;
  setHistoryOpen: (open: boolean) => void;
  setTypingActive: (active: boolean) => void;
  settingsOpen: boolean;
  historyOpen: boolean;
  typingActive: boolean;
}

const AppChromeContext = createContext<AppChromeContextValue | null>(null);

export function useAppChrome() {
  const ctx = useContext(AppChromeContext);
  if (!ctx) {
    throw new Error("useAppChrome must be used within AppChrome");
  }
  return ctx;
}

export function AppChrome({ children }: { children: ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [typingActive, setTypingActive] = useState(false);
  const homeLogoHandlerRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* ignore */
      });
    }
  }, []);

  // ⌘K to toggle settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSettingsOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const value = useMemo(
    () => ({
      settingsOpen,
      setSettingsOpen,
      historyOpen,
      setHistoryOpen,
      typingActive,
      setTypingActive,
      homeLogoHandlerRef,
    }),
    [settingsOpen, historyOpen, typingActive]
  );

  return (
    <AppChromeContext.Provider value={value}>
      <DynamicFavicon />
      <div className="flex min-h-dvh w-full flex-col">
        <SiteHeader />
        {children}
      </div>
      <SettingsPanel onOpenChange={setSettingsOpen} open={settingsOpen} />
      <HistoryPanel onOpenChange={setHistoryOpen} open={historyOpen} />
    </AppChromeContext.Provider>
  );
}

function SiteHeader() {
  const router = useRouter();
  const { setSettingsOpen, setHistoryOpen, typingActive, homeLogoHandlerRef } = useAppChrome();
  const { soundEnabled, setSoundEnabled } = useSettings();

  const dimHeader = typingActive;

  const [mouseHeaderVisible, setMouseHeaderVisible] = useState(false);
  const headerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const headerVisible = !typingActive || mouseHeaderVisible;

  useEffect(
    () => () => {
      if (headerTimerRef.current) {
        clearTimeout(headerTimerRef.current);
      }
    },
    []
  );

  const handleHeaderMouseMove = useCallback(() => {
    if (!typingActive) {
      return;
    }
    setMouseHeaderVisible(true);
    if (headerTimerRef.current) {
      clearTimeout(headerTimerRef.current);
    }
    headerTimerRef.current = setTimeout(
      () => setMouseHeaderVisible(false),
      2500
    );
  }, [typingActive]);

  function handleLogoClick() {
    if (homeLogoHandlerRef.current) {
      homeLogoHandlerRef.current();
      return;
    }
    router.push("/");
  }

  const headerOpacity = dimHeader ? (headerVisible ? 1 : 0.1) : 1;

  return (
    <motion.header
      animate={{ opacity: headerOpacity }}
      className="sticky top-0 z-50 flex shrink-0 justify-center px-4 py-3 md:px-8 md:py-4"
      onMouseMove={handleHeaderMouseMove}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="relative flex w-full max-w-5xl items-center justify-between rounded-2xl border border-foreground/[0.06] bg-background/50 px-5 py-2.5 shadow-[0_2px_20px_rgba(0,0,0,0.04)] ring-1 ring-white/[0.05] backdrop-blur-2xl transition-all duration-300 dark:border-white/[0.08] dark:bg-black/35 dark:shadow-[0_2px_20px_rgba(0,0,0,0.15)]">
        {/* Left — Logo */}
        <LogoButton onClick={handleLogoClick} />

        {/* Right — Stats & Controls */}
        <div className="flex items-center gap-2">
          <LiveStatusChip />
          <AudioButton
            enabled={soundEnabled}
            onToggle={() => setSoundEnabled(!soundEnabled)}
          />
          <HistoryButton onOpen={() => setHistoryOpen(true)} />
          <SettingsButton onOpen={() => setSettingsOpen(true)} />
          <GitHubPill />
        </div>
      </div>
    </motion.header>
  );
}

/* ─── Extracted Header Sub-Components ────────────────────── */

/** Frosted pill style shared by all header action buttons */
const pillClass =
  "flex items-center gap-1.5 rounded-xl border border-foreground/[0.04] bg-foreground/[0.03] px-3 py-1.5 text-[13px] backdrop-blur-sm transition-all duration-150 hover:bg-foreground/[0.07] hover:shadow-sm active:scale-[0.97]";

function LogoButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="flex cursor-pointer items-center gap-1.5 font-semibold text-primary text-lg tracking-tight"
      onClick={onClick}
      type="button"
    >
      <TypthmLogo size={18} />
      <span className="select-none">Typthm</span>
    </button>
  );
}

function LiveStatusChip() {
  return (
    <div className="hidden items-center gap-2 rounded-xl border border-foreground/[0.04] bg-foreground/[0.02] px-3 py-1.5 text-[11px] text-muted-foreground/70 backdrop-blur-sm select-none md:flex">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <VisitCount />
    </div>
  );
}

function AudioButton({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      aria-label={enabled ? "Mute audio" : "Unmute audio"}
      className={cn(
        pillClass,
        enabled
          ? "text-muted-foreground"
          : "text-muted-foreground/30 hover:text-muted-foreground/60"
      )}
      onClick={onToggle}
      type="button"
      whileTap={{ scale: 0.97 }}
    >
      <motion.span
        animate={{ scale: 1, opacity: 1 }}
        className="inline-flex"
        initial={{ scale: 0.6, opacity: 0 }}
        key={String(enabled)}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {enabled ? (
          <SpeakerHigh size={15} weight="duotone" />
        ) : (
          <SpeakerSlash size={15} weight="duotone" />
        )}
      </motion.span>
      <span className="hidden sm:inline">Audio</span>
    </motion.button>
  );
}

function SettingsButton({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      aria-label="Settings"
      className={cn(pillClass, "text-muted-foreground")}
      onClick={onOpen}
      type="button"
      whileTap={{ scale: 0.97 }}
    >
      <GearSix size={15} weight="duotone" />
      <span className="hidden sm:inline">Settings</span>
      <kbd className="hidden items-center gap-px rounded-md border border-foreground/[0.06] bg-foreground/[0.03] px-1 py-0.5 text-[10px] text-muted-foreground/35 leading-none sm:inline-flex">
        <Command size={10} weight="duotone" />
        <span>K</span>
      </kbd>
    </motion.button>
  );
}

function HistoryButton({ onOpen }: { onOpen: () => void }) {
  return (
    <motion.button
      aria-label="History"
      className={cn(pillClass, "text-muted-foreground")}
      onClick={onOpen}
      type="button"
      whileTap={{ scale: 0.97 }}
    >
      <Clock size={15} weight="duotone" />
      <span className="hidden sm:inline">History</span>
    </motion.button>
  );
}

function GitHubPill() {
  return (
    <motion.a
      className="flex items-center gap-2 rounded-xl bg-foreground/90 px-4 py-1.5 font-medium text-[13px] text-background backdrop-blur-sm transition-all duration-150 hover:bg-foreground hover:shadow-md"
      href="https://github.com/niksoriginals/typthm"
      rel="noopener noreferrer"
      target="_blank"
      whileTap={{ scale: 0.96 }}
    >
      <GithubLogo size={15} weight="duotone" />
      <span className="hidden sm:inline">GitHub</span>
    </motion.a>
  );
}
