"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { DocumentPreset } from "@/types/preset";
import { getMermaidConfig } from "@/lib/presets/generator";
import {
  Copy,
  Download,
  Maximize2,
  Check,
  AlertCircle,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Sparkles,
  GitBranch,
  FileImage,
} from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";

interface MermaidBlockProps {
  chart: string;
  preset: DocumentPreset;
}

import { renderMermaidDiagram } from "@/lib/mermaid/renderer";

// Detect diagram type from source text
function detectDiagramType(chart: string): string {
  const trimmed = chart.trim().toLowerCase();
  if (trimmed.startsWith("graph") || trimmed.startsWith("flowchart")) return "Flowchart";
  if (trimmed.startsWith("sequencediagram")) return "Sequence Diagram";
  if (trimmed.startsWith("classdiagram")) return "Class Diagram";
  if (trimmed.startsWith("statediagram")) return "State Diagram";
  if (trimmed.startsWith("gitgraph")) return "Git Graph";
  if (trimmed.startsWith("mindmap")) return "Mindmap";
  if (trimmed.startsWith("erdiagram")) return "Entity Relationship";
  if (trimmed.startsWith("gantt")) return "Gantt Chart";
  if (trimmed.startsWith("pie")) return "Pie Chart";
  return "Mermaid Diagram";
}

export function MermaidBlock({ chart, preset }: MermaidBlockProps) {
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Canvas Zoom and Pan states for the modal
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const modalCanvasRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).substring(2, 9)}`);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const diagramType = detectDiagramType(chart);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (renderTimeoutRef.current) {
      clearTimeout(renderTimeoutRef.current);
    }

    renderTimeoutRef.current = setTimeout(async () => {
      try {
        const renderedSvg = await renderMermaidDiagram(chart, preset);

        if (isMounted) {
          setSvg(renderedSvg);
          setError(null);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        if (isMounted) {
          const message =
            err instanceof Error ? err.message : "Failed to parse Mermaid diagram syntax";
          setError(message);
          setIsLoading(false);
        }
      }
    }, 120);

    return () => {
      isMounted = false;
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, [chart, preset]);

  // Keyboard navigation inside fullscreen modal
  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      } else if (e.key === "=" || e.key === "+") {
        setZoom((z) => Math.min(2.5, z + 0.15));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(0.4, z - 0.15));
      } else if (e.key === "0") {
        setZoom(1);
        setPan({ x: 0, y: 0 });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  const handleCopySvg = async () => {
    if (!svg) return;
    try {
      await navigator.clipboard.writeText(svg);
      setCopied(true);
      toast.success("Mermaid SVG copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy SVG");
    }
  };

  const handleDownloadSvg = () => {
    if (!svg) return;
    try {
      const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${diagramType.toLowerCase().replace(/\s+/g, "-")}-${idRef.current}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("SVG diagram downloaded");
    } catch {
      toast.error("Failed to download SVG");
    }
  };

  const handleDownloadPng = async () => {
    if (!svg) return;
    try {
      const toastId = toast.loading("Generating high-res PNG...");
      
      // Target the SVG wrapper DOM element inside modal or inline block
      const element = modalCanvasRef.current?.querySelector(".mermaid-svg-wrapper") as HTMLElement
        || containerRef.current?.querySelector(".mermaid-svg-wrapper") as HTMLElement;

      if (!element) {
        toast.dismiss(toastId);
        toast.error("Could not locate diagram element for capture");
        return;
      }

      const pngUrl = await toPng(element, {
        backgroundColor: preset.colors.background || "#ffffff",
        pixelRatio: 2, // 2x crisp retina resolution
      });

      const a = document.createElement("a");
      a.href = pngUrl;
      a.download = `${diagramType.toLowerCase().replace(/\s+/g, "-")}-${idRef.current}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      toast.dismiss(toastId);
      toast.success("PNG image downloaded");
    } catch (err) {
      console.error("PNG export error:", err);
      toast.error("Failed to export PNG image");
    }
  };

  // Drag to Pan Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // only primary mouse button
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((z) => Math.min(2.5, Math.max(0.4, z + delta)));
  };

  const resetTransform = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  if (error) {
    return (
      <div className="my-4 rounded-[var(--md-radius)] border border-red-300 bg-red-50 p-4 text-sm text-red-900 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>Mermaid Syntax Error</span>
        </div>
        <p className="mt-1 text-xs opacity-90 font-mono whitespace-pre-wrap">{error}</p>
        <pre className="mt-3 rounded bg-red-100/70 p-2 text-xs font-mono dark:bg-red-900/30 overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className="group relative my-6 overflow-hidden rounded-[var(--md-radius)] border border-[var(--md-border)] bg-[var(--md-bg)] transition-all shadow-xs hover:shadow-md"
      >
        {/* Floating Toolbar on Hover */}
        <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1 rounded-lg border border-[var(--md-border)] bg-[var(--md-bg)]/90 p-1 opacity-0 backdrop-blur-md transition-all group-hover:opacity-100 shadow-md">
          <span className="px-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--md-muted-fg)] border-r border-[var(--md-border)] mr-0.5">
            {diagramType}
          </span>
          <button
            onClick={handleCopySvg}
            title="Copy SVG"
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-[var(--md-muted-fg)] hover:bg-[var(--md-muted)] hover:text-[var(--md-fg)] transition-colors"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={handleDownloadSvg}
            title="Download SVG"
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-[var(--md-muted-fg)] hover:bg-[var(--md-muted)] hover:text-[var(--md-fg)] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              resetTransform();
              setIsFullscreen(true);
            }}
            title="Inspect & Fullscreen Zoom"
            className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-[var(--md-muted-fg)] hover:bg-[var(--md-muted)] hover:text-[var(--md-fg)] transition-colors"
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Diagram SVG Container */}
        <div className="flex min-h-[100px] items-center justify-center p-6 overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center gap-2 text-xs text-[var(--md-muted-fg)]">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Rendering diagram...</span>
            </div>
          ) : (
            <div
              className="mermaid-svg-wrapper flex w-full justify-center transition-transform"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* Premium Diagram Studio Inspection Modal */}
      {/* ========================================================================= */}
      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsFullscreen(false)}
        >
          <div
            className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-[#0d1117] text-neutral-100 shadow-2xl ring-1 ring-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex h-14 items-center justify-between border-b border-neutral-800 bg-[#161b22]/90 px-5 backdrop-blur-md select-none">
              {/* Diagram Title & Badges */}
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20">
                  <GitBranch className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold tracking-tight text-white">
                      Diagram Inspector
                    </span>
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-400 ring-1 ring-blue-500/30">
                      {diagramType}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center: Zoom Controls Bar */}
              <div className="flex items-center rounded-lg border border-neutral-750 bg-neutral-900/80 p-1 shadow-inner">
                <button
                  onClick={() => setZoom((z) => Math.max(0.4, z - 0.15))}
                  title="Zoom Out (-)"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={resetTransform}
                  title="Reset Zoom (0)"
                  className="px-2.5 text-xs font-mono font-medium text-neutral-300 hover:text-white transition-colors"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(2.5, z + 0.15))}
                  title="Zoom In (+)"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <div className="mx-1 h-3.5 w-[1px] bg-neutral-750" />
                <button
                  onClick={resetTransform}
                  title="Reset Canvas Position"
                  className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              </div>

              {/* Right: Export Actions & Close */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySvg}
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-750 hover:text-white transition-all shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-neutral-400" />
                      <span>Copy SVG</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownloadSvg}
                  title="Download vector SVG"
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-750 hover:text-white transition-all shadow-xs"
                >
                  <Download className="h-3.5 w-3.5 text-neutral-400" />
                  <span>SVG</span>
                </button>

                <button
                  onClick={handleDownloadPng}
                  title="Download 2x PNG image"
                  className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-750 hover:text-white transition-all shadow-xs"
                >
                  <FileImage className="h-3.5 w-3.5 text-neutral-400" />
                  <span>PNG</span>
                </button>

                <div className="mx-1 h-4 w-[1px] bg-neutral-800" />

                <button
                  onClick={() => setIsFullscreen(false)}
                  title="Close (Esc)"
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Interactive Graph-Paper Canvas */}
            <div
              ref={modalCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
              style={{
                backgroundColor: preset.isDark ? "#090d16" : "#f8fafc",
                backgroundImage: preset.isDark
                  ? "radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)"
                  : "radial-gradient(circle, rgba(0, 0, 0, 0.08) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
              className={`relative flex-1 overflow-hidden flex items-center justify-center select-none ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
            >
              {/* Transformed Diagram SVG Wrapper with Responsive Hero Sizing */}
              <div
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                }}
                className="flex items-center justify-center p-8 pointer-events-auto [&>svg]:!max-w-none [&>svg]:!w-auto [&>svg]:min-w-[620px] md:[&>svg]:min-w-[780px] lg:[&>svg]:min-w-[880px] [&>svg]:max-w-[85vw] [&>svg]:max-h-[68vh] [&>svg]:h-auto [&>svg]:shadow-sm rounded-lg"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>

            {/* Modal Bottom Footer Bar */}
            <div className="flex h-10 items-center justify-between border-t border-neutral-800 bg-[#161b22] px-5 text-[11px] text-neutral-400 select-none">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-300">Theme:</span>
                <span className="font-semibold text-white">{preset.name}</span>
                <div
                  className="h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                  style={{ backgroundColor: preset.mermaid.primaryColor }}
                />
              </div>

              <div className="flex items-center gap-3 text-neutral-500 font-mono text-[10px]">
                <span>Scroll to zoom</span>
                <span>•</span>
                <span>Drag canvas to pan</span>
                <span>•</span>
                <kbd className="rounded border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 text-neutral-300">
                  ESC
                </kbd>
                <span>to exit</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
