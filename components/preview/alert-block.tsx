"use client";

import React from "react";
import {
  Info,
  Lightbulb,
  AlertCircle,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { DocumentPreset } from "@/types/preset";

export type AlertType = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

interface AlertBlockProps {
  type: AlertType;
  title?: string;
  children: React.ReactNode;
  preset: DocumentPreset;
}

const ALERT_CONFIG: Record<
  AlertType,
  {
    defaultTitle: string;
    icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
    borderVar: string;
    bgVar: string;
    fgVar: string;
    iconVar: string;
  }
> = {
  NOTE: {
    defaultTitle: "Note",
    icon: Info,
    borderVar: "var(--md-alert-note-border)",
    bgVar: "var(--md-alert-note-bg)",
    fgVar: "var(--md-alert-note-fg)",
    iconVar: "var(--md-alert-note-icon)",
  },
  TIP: {
    defaultTitle: "Tip",
    icon: Lightbulb,
    borderVar: "var(--md-alert-tip-border)",
    bgVar: "var(--md-alert-tip-bg)",
    fgVar: "var(--md-alert-tip-fg)",
    iconVar: "var(--md-alert-tip-icon)",
  },
  IMPORTANT: {
    defaultTitle: "Important",
    icon: AlertCircle,
    borderVar: "var(--md-alert-important-border)",
    bgVar: "var(--md-alert-important-bg)",
    fgVar: "var(--md-alert-important-fg)",
    iconVar: "var(--md-alert-important-icon)",
  },
  WARNING: {
    defaultTitle: "Warning",
    icon: AlertTriangle,
    borderVar: "var(--md-alert-warning-border)",
    bgVar: "var(--md-alert-warning-bg)",
    fgVar: "var(--md-alert-warning-fg)",
    iconVar: "var(--md-alert-warning-icon)",
  },
  CAUTION: {
    defaultTitle: "Caution",
    icon: Flame,
    borderVar: "var(--md-alert-caution-border)",
    bgVar: "var(--md-alert-caution-bg)",
    fgVar: "var(--md-alert-caution-fg)",
    iconVar: "var(--md-alert-caution-icon)",
  },
};

export function AlertBlock({
  type,
  title,
  children,
}: AlertBlockProps) {
  const config = ALERT_CONFIG[type] || ALERT_CONFIG.NOTE;
  const IconComponent = config.icon;
  const displayTitle = title || config.defaultTitle;

  return (
    <div
      className="my-4 overflow-hidden rounded-[var(--md-radius)] border-l-4 transition-all duration-200"
      style={{
        borderLeftColor: config.borderVar,
        backgroundColor: config.bgVar,
      }}
      data-alert-type={type.toLowerCase()}
    >
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 font-semibold text-sm">
        <IconComponent
          className="h-4 w-4 shrink-0"
          style={{ color: config.iconVar }}
        />
        <span style={{ color: config.fgVar }}>{displayTitle}</span>
      </div>
      <div
        className="px-4 pb-3 pt-1 text-sm leading-relaxed"
        style={{ color: config.fgVar }}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * Checks if children of a blockquote contains an alert prefix like `[!NOTE]`.
 */
export function parseAlertFromChildren(
  children: React.ReactNode
): { isAlert: true; type: AlertType; cleanChildren: React.ReactNode } | { isAlert: false } {
  if (!children) return { isAlert: false };

  const childArray = React.Children.toArray(children);
  if (childArray.length === 0) return { isAlert: false };

  const firstChild = childArray[0];
  if (!React.isValidElement<{ children?: React.ReactNode }>(firstChild)) return { isAlert: false };

  // Check if first child is a <p>
  const pChildren = React.Children.toArray(firstChild.props.children);
  if (pChildren.length === 0) return { isAlert: false };

  const firstGrandchild = pChildren[0];
  if (typeof firstGrandchild !== "string") return { isAlert: false };

  const match = firstGrandchild.match(/^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*\n)?/i);
  if (!match) return { isAlert: false };

  const alertType = match[1].toUpperCase() as AlertType;
  const remainingFirstString = firstGrandchild.slice(match[0].length);

  // Reconstruct first paragraph without the [!TYPE] marker
  const newPChildren = remainingFirstString
    ? [remainingFirstString, ...pChildren.slice(1)]
    : pChildren.slice(1);

  const updatedFirstParagraph = newPChildren.length > 0
    ? React.cloneElement(firstChild, {}, ...newPChildren)
    : null;

  const remainingChildren = updatedFirstParagraph
    ? [updatedFirstParagraph, ...childArray.slice(1)]
    : childArray.slice(1);

  return {
    isAlert: true,
    type: alertType,
    cleanChildren: remainingChildren,
  };
}
