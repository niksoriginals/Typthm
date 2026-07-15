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
    canvas.height = 450;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Dark background canvas base
    ctx.fillStyle = "#0c0c0e";
    ctx.fillRect(0, 0, 800, 450);

    // 2. Map theme accent colors to modern glow mesh
    const activeAccent = localStorage.getItem("tc-accent") || "aurora";
    let color1 = "#6366f1"; // primary / indigo
    let color2 = "#06b6d4"; // secondary / cyan
    let color3 = "#ec4899"; // pink highlight

    if (activeAccent === "classic") {
      color1 = "#4b5563"; // gray-600
      color2 = "#f97316"; // orange-500
      color3 = "#a855f7"; // purple-500
    } else if (activeAccent === "mint") {
      color1 = "#115e59"; // teal-800
      color2 = "#10b981"; // emerald-500
      color3 = "#3b82f6"; // blue-500
    } else if (activeAccent === "royal") {
      color1 = "#1d4ed8"; // blue-700
      color2 = "#eab308"; // yellow-500
      color3 = "#ec4899"; // pink-500
    } else if (activeAccent === "dolch") {
      color1 = "#1f2937"; // gray-800
      color2 = "#ef4444"; // red-500
      color3 = "#f43f5e"; // rose-500
    } else if (activeAccent === "sand") {
      color1 = "#7c2d12"; // orange-900
      color2 = "#ea580c"; // orange-600
      color3 = "#facc15"; // yellow-400
    } else if (activeAccent === "scarlet") {
      color1 = "#9f1239"; // rose-800
      color2 = "#be123c"; // rose-700
      color3 = "#f43f5e"; // rose-500
    }

    // Left organic glow
    const leftGlow = ctx.createRadialGradient(100, 400, 50, 100, 400, 500);
    leftGlow.addColorStop(0, hexToRgba(color1, 0.22));
    leftGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = leftGlow;
    ctx.fillRect(0, 0, 800, 450);

    // Right organic glow
    const rightGlow = ctx.createRadialGradient(700, 50, 50, 700, 50, 450);
    rightGlow.addColorStop(0, hexToRgba(color2, 0.22));
    rightGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rightGlow;
    ctx.fillRect(0, 0, 800, 450);

    // Center auxiliary glow
    const centerGlow = ctx.createRadialGradient(550, 250, 30, 550, 250, 350);
    centerGlow.addColorStop(0, hexToRgba(color3, 0.14));
    centerGlow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = centerGlow;
    ctx.fillRect(0, 0, 800, 450);

    // 3. Drop Shadow for the card plate
    ctx.shadowColor = "rgba(0, 0, 0, 0.45)";
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 15;

    // Solid Glassmorphic Card Container
    ctx.fillStyle = "rgba(12, 12, 16, 0.65)";
    drawRoundedRect(ctx, 40, 40, 720, 370, 24);
    ctx.fill();

    // Reset shadow so it doesn't affect subsequent text or borders
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // 4. Double-layered premium glass border
    const cardBorder = ctx.createLinearGradient(40, 40, 760, 410);
    cardBorder.addColorStop(0, "rgba(255, 255, 255, 0.16)");
    cardBorder.addColorStop(0.3, "rgba(255, 255, 255, 0.02)");
    cardBorder.addColorStop(0.7, "rgba(255, 255, 255, 0.01)");
    cardBorder.addColorStop(1, "rgba(255, 255, 255, 0.08)");
    ctx.strokeStyle = cardBorder;
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 40, 40, 720, 370, 24);
    ctx.stroke();

    // 5. Apple-style brand header
    // Glowing gradient circle icon badge
    const logoGrad = ctx.createLinearGradient(60, 60, 90, 90);
    logoGrad.addColorStop(0, color2);
    logoGrad.addColorStop(1, color1);
    ctx.fillStyle = logoGrad;
    ctx.beginPath();
    ctx.arc(75, 75, 14, 0, Math.PI * 2);
    ctx.fill();

    // Inner letter "T"
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("T", 75, 74.5);

    // Title
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#ffffff";
    ctx.font = "600 20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("Typthm", 102, 82);

    // Subtitle
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "400 11px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("· designed by niksoriginals", 182, 81);

    // Right aligned URL watermark
    ctx.textAlign = "right";
    ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
    ctx.font = "500 12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("typthm.niksoriginals.in", 725, 81);

    // 6. Huge stats columns (WPM / Accuracy)
    // WPM
    const wpmTextGrad = ctx.createLinearGradient(120, 0, 320, 0);
    wpmTextGrad.addColorStop(0, "#ffffff");
    wpmTextGrad.addColorStop(1, color2);
    ctx.fillStyle = wpmTextGrad;
    ctx.font = "700 96px system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(stats.wpm.toString(), 220, 205);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "600 10px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("WORDS PER MINUTE", 220, 235);

    // Accuracy
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 96px system-ui, -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif";
    ctx.fillText(stats.accuracy.toString() + "%", 580, 205);

    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.font = "600 10px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
    ctx.fillText("ACCURACY", 580, 235);

    // 7. Divider Line
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 265);
    ctx.lineTo(730, 265);
    ctx.stroke();

    // 8. Detailed watchOS-style widgets grid
    const pills = [
      { label: "TEST MODE", value: `${stats.mode} ${stats.modeDetail}`.toLowerCase() },
      { label: "CONSISTENCY", value: `${stats.consistency}%` },
      { label: "KEYSTROKES", value: `${stats.correctChars}/${stats.incorrectChars}/${stats.extraChars}/${stats.missedChars}` },
      { label: "CORRECTED FIXES", value: stats.correctedErrors.toString() },
    ];

    const pY = 295;
    const pWidth = 150;
    const pHeight = 44;
    const pRadius = 10;

    pills.forEach((pill, index) => {
      const pX = 70 + index * 170;

      // Draw background widget
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      drawRoundedRect(ctx, pX, pY, pWidth, pHeight, pRadius);
      ctx.fill();

      // Draw subtle widget border
      ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
      ctx.lineWidth = 1;
      drawRoundedRect(ctx, pX, pY, pWidth, pHeight, pRadius);
      ctx.stroke();

      // Draw widget label
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.font = "600 8px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(pill.label, pX + pWidth / 2, pY + 16);

      // Draw widget value
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 12px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
      ctx.fillText(pill.value, pX + pWidth / 2, pY + 32);
    });

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
