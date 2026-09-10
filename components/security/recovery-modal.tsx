"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppLock } from "@/components/security/app-lock-context";
import { KeyRound, ShieldAlert, CheckCircle, ArrowRight, X } from "lucide-react";

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecoveryModal({ isOpen, onClose }: RecoveryModalProps) {
  const { recoveryUnlock, config } = useAppLock();

  const [mounted, setMounted] = useState<boolean>(false);
  const [recoveryKeyInput, setRecoveryKeyInput] = useState<string>("");
  const [newPasscode, setNewPasscode] = useState<string>("");
  const [confirmPasscode, setConfirmPasscode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const isPinMode = config?.lockType === "pin";

  const handleFormatKey = (value: string) => {
    // Remove invalid characters and format into 4-char chunks
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join("-") : cleaned;
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = handleFormatKey(e.target.value);
    if (formatted.replace(/-/g, "").length <= 24) {
      setRecoveryKeyInput(formatted);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rawKey = recoveryKeyInput.replace(/-/g, "");
    if (rawKey.length !== 24) {
      setError("Recovery key must be 24 characters long.");
      return;
    }

    if (!newPasscode) {
      setError("Please enter a new passcode.");
      return;
    }

    if (isPinMode && !/^\d{4,6}$/.test(newPasscode)) {
      setError("PIN must be 4 to 6 numeric digits.");
      return;
    }

    if (newPasscode !== confirmPasscode) {
      setError("New passcode and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await recoveryUnlock(recoveryKeyInput, newPasscode);
      if (success) {
        onClose();
      } else {
        setError("Invalid Recovery Key. Please check the key and try again.");
      }
    } catch {
      setError("Failed to recover access. Please check your key.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg max-h-[90vh] overflow-y-auto w-full text-slate-100 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Recover App Access</h3>
            <p className="text-xs text-slate-400">Enter your 24-character Recovery Key</p>
          </div>
        </div>

        {/* Security Warning Callout */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-emerald-400">Zero-Knowledge Protection:</span> Data is encrypted locally. Access can only be restored using your generated Recovery Key.
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Recovery Key Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Recovery Key
            </label>
            <input
              type="text"
              value={recoveryKeyInput}
              onChange={handleKeyChange}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX-XXXX"
              className="w-full py-3 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono text-center tracking-wider text-sm placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          {/* New Passcode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              New {isPinMode ? "PIN (4-6 digits)" : "Password"}
            </label>
            <input
              type={isPinMode ? "password" : "text"}
              value={newPasscode}
              onChange={(e) => setNewPasscode(e.target.value)}
              placeholder={isPinMode ? "Enter new PIN..." : "Enter new password..."}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Confirm New Passcode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Confirm New {isPinMode ? "PIN" : "Password"}
            </label>
            <input
              type={isPinMode ? "password" : "text"}
              value={confirmPasscode}
              onChange={(e) => setConfirmPasscode(e.target.value)}
              placeholder="Confirm new passcode..."
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
            >
              {isSubmitting ? "Restoring..." : "Restore & Reset Passcode"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
