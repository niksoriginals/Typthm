"use client";

import { DownloadSimple, Info, ShareNetwork, Copy, Download, Check } from "@phosphor-icons/react";
import { type ReactNode, useState, useEffect } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ResultStats, WpmSnapshot } from "@/lib/types";

export const actionBtnClass =
  "flex items-center gap-2 rounded-lg px-4 py-2 text-xs text-muted-foreground transition-colors hover:bg-foreground/[0.06] hover:text-foreground focus-visible:ring-0 focus-visible:outline-none";

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function hexToRgba(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function ShareCardPopover({ stats }: { stats: ResultStats }) {
  const [imgSrc, setImgSrc] = useState<string>("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Base dark background
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, 800, 420);

    // 2. Map theme accent colors to radial glow
    const activeAccent = localStorage.getItem("tc-accent") || "aurora";
    let glowColor1 = "#312E81";
    let glowColor2 = "#06B6D4";

    if (activeAccent === "classic") {
      glowColor1 = "#737373";
      glowColor2 = "#F57644";
    } else if (activeAccent === "mint") {
      glowColor1 = "#447B82";
      glowColor2 = "#86C8AC";
    } else if (activeAccent === "royal") {
      glowColor1 = "#324974";
      glowColor2 = "#E4D440";
    } else if (activeAccent === "dolch") {
      glowColor1 = "#3E3B4C";
      glowColor2 = "#D73E42";
    } else if (activeAccent === "sand") {
      glowColor1 = "#893D36";
      glowColor2 = "#C94E41";
    } else if (activeAccent === "scarlet") {
      glowColor1 = "#D5868A";
      glowColor2 = "#8F4246";
    }

    // Left radial glow (dark base theme glow)
    const leftGlow = ctx.createRadialGradient(150, 210, 50, 150, 210, 300);
    leftGlow.addColorStop(0, hexToRgba(glowColor1, 0.35));
    leftGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = leftGlow;
    ctx.fillRect(0, 0, 800, 420);

    // Right radial glow (accent highlights)
    const rightGlow = ctx.createRadialGradient(650, 210, 50, 650, 210, 300);
    rightGlow.addColorStop(0, hexToRgba(glowColor2, 0.3));
    rightGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rightGlow;
    ctx.fillRect(0, 0, 800, 420);

    // 3. Draw glass border
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 20, 20, 760, 380, 20);
    ctx.stroke();

    // 4. Logo & brand heading
    ctx.fillStyle = glowColor2;
    drawRoundedRect(ctx, 45, 45, 24, 24, 6);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("T", 57, 61);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("Typthm", 80, 63);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "normal 12px system-ui, -apple-system, sans-serif";
    ctx.fillText("mechanical keyboard typing test", 165, 62);

    // 5. Main WPM & Accuracy figures
    // WPM
    ctx.fillStyle = glowColor2;
    ctx.font = "bold 100px Courier New, Courier, monospace";
    ctx.textAlign = "center";
    ctx.fillText(stats.wpm.toString(), 250, 195);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
    ctx.fillText("WORDS PER MINUTE", 250, 225);

    // Accuracy
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 100px Courier New, Courier, monospace";
    ctx.fillText(stats.accuracy.toString() + "%", 550, 195);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "bold 12px system-ui, -apple-system, sans-serif";
    ctx.fillText("ACCURACY", 550, 225);

    // 6. Horizontal separator
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(50, 260);
    ctx.lineTo(750, 260);
    ctx.stroke();

    // 7. Small stats row
    ctx.textAlign = "left";
    ctx.font = "12px system-ui, -apple-system, sans-serif";

    // Stat 1: Mode
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillText("TEST MODE", 50, 300);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${stats.mode} ${stats.modeDetail}`, 50, 323);

    // Stat 2: Consistency
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillText("CONSISTENCY", 240, 300);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`${stats.consistency}%`, 240, 323);

    // Stat 3: Characters
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillText("CHARACTERS", 430, 300);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(
      `${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}`,
      430,
      323
    );

    // Stat 4: Fixes
    ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
    ctx.fillText("CORRECTED FIXES", 640, 300);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(stats.correctedErrors.toString(), 640, 323);

    // Watermark link
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.font = "normal 12px system-ui, -apple-system, sans-serif";
    ctx.fillText("typthm.niksoriginals.in", 750, 375);

    setImgSrc(canvas.toDataURL("image/png"));
  }, [stats]);

  const handleCopy = async () => {
    try {
      const res = await fetch(imgSrc);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy image: ", err);
    }
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imgSrc;
    a.download = `typthm-${stats.wpm}-wpm.png`;
    a.click();
  };

  return (
    <Popover>
      <PopoverTrigger className={actionBtnClass}>
        <ShareNetwork aria-hidden size={15} weight="duotone" />
        share card
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-[min(26rem,calc(100vw-2rem))] p-4"
        side="top"
        sideOffset={8}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="font-semibold text-foreground text-sm">Share Result Card</h4>
            <p className="text-muted-foreground text-xs">
              Copy to clipboard or download to share your typing achievements.
            </p>
          </div>

          {imgSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt="Typthm result card"
              className="w-full rounded-md border border-foreground/10 bg-black/40 shadow-sm"
              src={imgSrc}
            />
          ) : (
            <div className="aspect-video w-full animate-pulse rounded-md bg-muted" />
          )}

          <div className="flex gap-2">
            <button
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary py-2 font-medium text-primary-foreground text-xs transition-colors hover:bg-primary/95 focus:outline-none"
              onClick={handleCopy}
              type="button"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy Image
                </>
              )}
            </button>
            <button
              className="flex flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-background py-2 font-medium text-foreground text-xs transition-colors hover:bg-muted focus:outline-none"
              onClick={handleDownload}
              type="button"
            >
              <Download size={14} />
              Download PNG
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ResultsActionButton({
  onClick,
  label,
  icon,
  spinOnClick = false,
}: {
  onClick: () => void;
  label: string;
  icon: ReactNode;
  spinOnClick?: boolean;
}) {
  const [spinning, setSpinning] = useState(false);

  function handleClick() {
    if (spinOnClick) {
      setSpinning(true);
      setTimeout(() => setSpinning(false), 600);
    }
    onClick();
  }

  return (
    <button className={actionBtnClass} onClick={handleClick} type="button">
      <span
        style={{
          display: "inline-flex",
          transition: "transform 0.6s cubic-bezier(0.4,0,0.2,1)",
          transform: spinning ? "rotate(360deg)" : "rotate(0deg)",
        }}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}

export function DownloadResultsPopover({ stats }: { stats: ResultStats }) {
  const downloadJson = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(stats, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `typing-test-${new Date().toISOString()}.json`
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const downloadCsv = () => {
    const headers = ["second", "wpm", "raw", "errors"];
    const rows = stats.wpmHistory.map((row) =>
      headers.map((header) => row[header as keyof WpmSnapshot] ?? 0).join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `typing-test-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Popover>
      <PopoverTrigger className={actionBtnClass}>
        <DownloadSimple aria-hidden size={15} weight="duotone" />
        download
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-36 p-1"
        side="top"
        sideOffset={8}
      >
        <div className="flex flex-col gap-1">
          <button
            className="w-full rounded-md px-2 py-1.5 text-left text-foreground text-xs transition-colors hover:bg-muted"
            onClick={downloadJson}
          >
            JSON format
          </button>
          <button
            className="w-full rounded-md px-2 py-1.5 text-left text-foreground text-xs transition-colors hover:bg-muted"
            onClick={downloadCsv}
          >
            CSV format
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function CalculationFormulaPopover() {
  return (
    <Popover>
      <PopoverTrigger className={actionBtnClass}>
        <Info aria-hidden size={15} weight="duotone" />
        formula
      </PopoverTrigger>
      <PopoverContent
        align="center"
        className="w-[min(20rem,calc(100vw-2rem))] p-4"
        side="top"
        sideOffset={8}
      >
        <div className="space-y-4">
          <FormulaItem
            description="Only fully correct words and their spaces count. In time and zen modes, a correct prefix of the current word is included before you press space."
            formula="(correct chars + spaces) / 5 / minutes"
            label="WPM"
          />
          <div className="h-px bg-foreground/[0.06]" />
          <FormulaItem
            description="Every keystroke counts regardless of accuracy. Measures raw typing speed before error correction."
            formula="total keystrokes / 5 / minutes"
            label="Raw"
          />
          <div className="h-px bg-foreground/[0.06]" />
          <FormulaItem
            description="Character-level accuracy. Extra characters beyond the target word count as incorrect."
            formula="correct / (correct + incorrect) x 100"
            label="Accuracy"
          />
          <div className="h-px bg-foreground/[0.06]" />
          <FormulaItem
            description="Measures how steady your speed was. σ is standard deviation, μ is mean of per-second WPM. 100% means perfectly even pacing."
            formula="100 - (σ / μ x 100)"
            label="Consistency"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function FormulaItem({
  label,
  formula,
  description,
}: {
  label: string;
  formula: string;
  description: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="font-medium text-[11px] text-foreground">{label}</p>
      <p className="rounded-md bg-foreground/[0.04] px-2.5 py-1.5 text-[11px] text-muted-foreground">
        {formula}
      </p>
      <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
