"use client";

import React from "react";

export function LoadingScreen() {
  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-[#090d16] text-neutral-100 select-none p-6">
      {/* Official Brand Logo & Subtle Loading Indicator */}
      <div className="flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-200">
        <img
          src="/logo-horizontal-dark.png"
          alt="rendermd"
          className="h-9 w-auto object-contain opacity-95"
        />

        {/* Minimal 1.5px Glowing Line Progress Indicator */}
        <div className="relative h-0.5 w-32 overflow-hidden rounded-full bg-neutral-800/80">
          <div className="absolute inset-y-0 left-0 h-full w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
