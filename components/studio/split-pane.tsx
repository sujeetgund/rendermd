"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { ViewMode } from "@/types/document";

interface SplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  viewMode: ViewMode;
  defaultSplit?: number; // percentage, e.g. 50
}

export function SplitPane({
  left,
  right,
  viewMode,
  defaultSplit = 50,
}: SplitPaneProps) {
  const [splitPercent, setSplitPercent] = useState<number>(defaultSplit);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newPercent = ((e.clientX - rect.left) / rect.width) * 100;
      if (newPercent >= 20 && newPercent <= 80) {
        setSplitPercent(newPercent);
      }
    };

    const onMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging]);

  if (viewMode === "editor") {
    return <div className="h-full w-full overflow-hidden">{left}</div>;
  }

  if (viewMode === "preview" || viewMode === "zen") {
    return <div className="h-full w-full overflow-y-auto">{right}</div>;
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex h-full w-full overflow-hidden ${
        isDragging ? "cursor-col-resize select-none" : ""
      }`}
    >
      {/* Left Pane (Editor) */}
      <div
        style={{ width: `${splitPercent}%` }}
        className="h-full overflow-hidden flex flex-col"
      >
        {left}
      </div>

      {/* Resizer Divider */}
      <div
        onMouseDown={startDragging}
        className="group relative z-20 flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-neutral-200 dark:bg-neutral-800 transition-colors hover:bg-blue-500/50"
      >
        <div className="h-8 w-1 rounded-full bg-neutral-400 group-hover:bg-blue-500 transition-colors" />
      </div>

      {/* Right Pane (Preview) */}
      <div
        style={{ width: `${100 - splitPercent}%` }}
        className="h-full overflow-y-auto bg-neutral-100/50 dark:bg-[#070a10]"
      >
        {right}
      </div>
    </div>
  );
}
