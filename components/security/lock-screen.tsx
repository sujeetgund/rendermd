"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAppLock } from "@/components/security/app-lock-context";
import { getLockoutCooldown } from "@/lib/security/app-lock";
import { ShieldLock, KeyRound, Fingerprint, Eye, EyeOff, AlertTriangle, RefreshCw } from "lucide-react";
import { RecoveryModal } from "@/components/security/recovery-modal";

export function LockScreen() {
  const { config, unlockApp, unlockWithBiometrics, factoryReset } = useAppLock();
  
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [showFactoryResetConfirm, setShowFactoryResetConfirm] = useState<boolean>(false);
  const [cooldownRemainingSec, setCooldownRemainingSec] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPinMode = config?.lockType === "pin";

  // Check and update cooldown countdown timer
  useEffect(() => {
    if (!config) return;
    const checkCooldown = () => {
      const ms = getLockoutCooldown(config);
      if (ms > 0) {
        setCooldownRemainingSec(Math.ceil(ms / 1000));
      } else {
        setCooldownRemainingSec(0);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, [config]);

  // Handle PIN unlock submission
  const handleUnlock = useCallback(async (passcodeToTry: string) => {
    if (cooldownRemainingSec > 0 || isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await unlockApp(passcodeToTry);
      if (!result.success && result.error) {
        setError(result.error);
        if (isPinMode) setPin("");
      }
    } catch {
      setError("An unexpected error occurred during verification.");
      if (isPinMode) setPin("");
    } finally {
      setIsSubmitting(false);
    }
  }, [cooldownRemainingSec, isSubmitting, unlockApp, isPinMode]);

  // Handle PIN keyboard input
  const handlePinDigit = (digit: string) => {
    if (cooldownRemainingSec > 0 || isSubmitting) return;
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setError(null);
      // Auto-submit on 4 or 6 digits if matching configured length
      if (newPin.length >= 4 && newPin.length <= 6) {
        // Submit if user pauses or enters 4/6 digits
      }
    }
  };

  const handlePinDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  // Keyboard shortcut listener for PIN entry
  useEffect(() => {
    if (!isPinMode || cooldownRemainingSec > 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") {
        handlePinDigit(e.key);
      } else if (e.key === "Backspace") {
        handlePinDelete();
      } else if (e.key === "Enter" && pin.length >= 4) {
        handleUnlock(pin);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPinMode, pin, cooldownRemainingSec, handleUnlock]);

  if (!config || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl text-slate-100 p-4 overflow-y-auto transition-all duration-300">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md flex flex-col items-center text-center relative my-auto">
        {/* Decorative Top Ambient Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* Lock Shield Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4 shadow-inner">
          <ShieldLock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-white mb-1">App Locked</h2>
        <p className="text-sm text-slate-400 mb-6">Enter your passcode to access your markdown documents.</p>

        {/* Cooldown Warning Banner */}
        {cooldownRemainingSec > 0 ? (
          <div className="w-full mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <div className="text-left">
              <div className="font-semibold">Too many failed attempts</div>
              <div>Try again in {cooldownRemainingSec} seconds</div>
            </div>
          </div>
        ) : null}

        {/* Error message */}
        {error && cooldownRemainingSec === 0 && (
          <div className="w-full mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm animate-shake">
            {error}
          </div>
        )}

        {/* PIN MODE UI */}
        {isPinMode ? (
          <div className="w-full flex flex-col items-center">
            {/* PIN Dots Display */}
            <div className="flex gap-4 mb-8">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const isFilled = pin.length > index;
                return (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-all duration-200 border ${
                      isFilled
                        ? "bg-emerald-400 border-emerald-400 scale-110 shadow-[0_0_12px_rgba(52,211,153,0.5)]"
                        : "border-slate-700 bg-slate-800/50"
                    }`}
                  />
                );
              })}
            </div>

            {/* Keypad Grid */}
            <div className="grid grid-cols-3 gap-4 w-full max-w-[280px] mb-6">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                <button
                  key={num}
                  disabled={cooldownRemainingSec > 0 || isSubmitting}
                  onClick={() => handlePinDigit(num)}
                  className="w-full h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 active:scale-95 border border-slate-700/50 text-xl font-semibold text-white transition-all flex items-center justify-center disabled:opacity-40 shadow-sm"
                >
                  {num}
                </button>
              ))}

              {/* Biometrics button (left) */}
              {config.biometricsEnabled ? (
                <button
                  disabled={cooldownRemainingSec > 0 || isSubmitting}
                  onClick={unlockWithBiometrics}
                  className="w-full h-14 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 active:scale-95 border border-emerald-500/30 text-emerald-400 transition-all flex items-center justify-center"
                  title="Unlock with Biometrics / Touch ID"
                >
                  <Fingerprint className="w-6 h-6" />
                </button>
              ) : (
                <div />
              )}

              {/* Zero key */}
              <button
                disabled={cooldownRemainingSec > 0 || isSubmitting}
                onClick={() => handlePinDigit("0")}
                className="w-full h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 active:scale-95 border border-slate-700/50 text-xl font-semibold text-white transition-all flex items-center justify-center disabled:opacity-40 shadow-sm"
              >
                0
              </button>

              {/* Delete button (right) */}
              <button
                disabled={cooldownRemainingSec > 0 || isSubmitting || pin.length === 0}
                onClick={handlePinDelete}
                className="w-full h-14 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 active:scale-95 border border-slate-700/50 text-sm font-medium text-slate-400 transition-all flex items-center justify-center disabled:opacity-30"
              >
                Delete
              </button>
            </div>

            {/* Manual Unlock Submit button if PIN entered */}
            {pin.length >= 4 && (
              <button
                disabled={cooldownRemainingSec > 0 || isSubmitting}
                onClick={() => handleUnlock(pin)}
                className="w-full max-w-[280px] py-3 px-4 mb-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-98"
              >
                {isSubmitting ? "Unlocking..." : "Unlock"}
              </button>
            )}
          </div>
        ) : (
          /* ALPHANUMERIC PASSWORD MODE UI */
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnlock(password);
            }}
            className="w-full max-w-sm mb-6 flex flex-col gap-4"
          >
            <div className="relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                disabled={cooldownRemainingSec > 0 || isSubmitting}
                placeholder="Enter password..."
                className="w-full py-3 pl-4 pr-12 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition-all disabled:opacity-50"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={cooldownRemainingSec > 0 || isSubmitting || !password}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              {isSubmitting ? "Unlocking..." : "Unlock App"}
            </button>

            {config.biometricsEnabled && (
              <button
                type="button"
                onClick={unlockWithBiometrics}
                className="w-full py-2.5 rounded-xl border border-slate-700 bg-slate-800/40 hover:bg-slate-800 text-slate-300 text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Fingerprint className="w-4 h-4 text-emerald-400" />
                Unlock with Touch ID / Face ID
              </button>
            )}
          </form>
        )}

        {/* Forgot Code / Recovery Link */}
        <div className="flex flex-col items-center gap-2 pt-2 border-t border-slate-800/80 w-full">
          <button
            onClick={() => setShowRecoveryModal(true)}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <KeyRound className="w-3.5 h-3.5" />
            Forgot Passcode? Use Recovery Key
          </button>

          <button
            onClick={() => setShowFactoryResetConfirm(true)}
            className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            Emergency Factory Reset (Erase Data)
          </button>
        </div>
      </div>

      {/* Recovery Key Modal */}
      {showRecoveryModal && (
        <RecoveryModal isOpen={showRecoveryModal} onClose={() => setShowRecoveryModal(false)} />
      )}

      {/* Factory Reset Confirmation Dialog */}
      {showFactoryResetConfirm && (
        <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/50 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-2">Emergency Factory Reset?</h3>
            <p className="text-xs text-slate-400 mb-6">
              This will permanently erase all local encrypted documents and reset the app. This action cannot be undone!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFactoryResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={factoryReset}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-rose-600/30"
              >
                Erase & Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
