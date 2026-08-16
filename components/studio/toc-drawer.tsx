"use client";

import React from "react";
import { TocItem } from "@/types/document";
import { ListTree, X } from "lucide-react";

interface TocDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: TocItem[];
  onSelectHeading?: (id: string) => void;
}

export function TocDrawer({
  isOpen,
  onClose,
  items,
  onSelectHeading,
}: TocDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-72 border-l border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 p-4 shadow-2xl backdrop-blur-md flex flex-col">
      <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white uppercase tracking-wider">
          <ListTree className="h-4 w-4 text-blue-500" />
          <span>Outline / TOC</span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {items.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400">
            No headings found in document
          </div>
        ) : (
          items.map((item, idx) => {
            const indent = (item.level - 1) * 12;
            return (
              <a
                key={`${item.id}-${idx}`}
                href={`#${item.id}`}
                onClick={(e) => {
                  if (onSelectHeading) {
                    onSelectHeading(item.id);
                  }
                }}
                style={{ paddingLeft: `${indent + 8}px` }}
                className="block truncate rounded-md py-1.5 pr-2 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white transition-colors"
                title={item.text}
              >
                <span className="opacity-40 font-mono mr-1.5 text-[10px]">
                  {"#".repeat(item.level)}
                </span>
                {item.text}
              </a>
            );
          })
        )}
      </div>
    </div>
  );
}
