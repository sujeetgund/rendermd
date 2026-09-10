"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppLock } from "@/components/security/app-lock-context";
import { LockType, AutoLockTimeout } from "@/types/app-lock";
import { ShieldCheck, Key, Hash, Copy, Check, Fingerprint, X, ShieldAlert, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface SetupLockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SetupLockModal({ isOpen, onClose }: SetupLockModalProps) {
  const { setupAppLock, biometricsSupported } = useAppLock();

  const [mounted, setMounted] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [lockType, setLockType] = useState<LockType>("pin");
  const [passcode, setPasscode] = useState<string>("");
  const [confirmPasscode, setConfirmPasscode] = useState<string>("");
  const [autoLockTimeout, setAutoLockTimeout] = useState<AutoLockTimeout>(5);
  const [enableBiometrics, setEnableBiometrics] = useState<boolean>(false);
  const [generatedRecoveryKey, setGeneratedRecoveryKey] = useState<string>("");
  const [keySavedConfirmed, setKeySavedConfirmed] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleCopyKey = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(generatedRecoveryKey);
      setCopiedKey(true);
      toast.success("Recovery Key copied to clipboard");
      setTimeout(() => setCopiedKey(false), 3000);
    }
  };

  const handleStep2Submit = async () => {
    setError(null);
    if (!passcode) {
      setError("Please enter a passcode.");
      return;
    }

    if (lockType === "pin" && !/^\d{4,6}$/.test(passcode)) {
      setError("PIN must be 4 to 6 numeric digits.");
      return;
    }

    if (lockType === "password" && passcode.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (passcode !== confirmPasscode) {
      setError("Passcode and confirmation do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const recKey = await setupAppLock(
        {
          enabled: true,
          lockType,
          biometricsEnabled: enableBiometrics,
          autoLockTimeout,
        },
        passcode
      );
      setGeneratedRecoveryKey(recKey);
      setStep(3);
    } catch (err) {
      console.error("Lock setup error:", err);
      setError("Failed to initialize lock key derivation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    toast.success("App Lock is now active!");
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md max-h-[90vh] overflow-y-auto w-full text-slate-100 shadow-2xl relative my-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Wizard Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Setup App Lock</h3>
            <p className="text-xs text-slate-400">Step {step} of 3</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* STEP 1: Select Lock Type */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <label className="text-xs font-semibold text-slate-300">Choose Passcode Type</label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLockType("pin")}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                  lockType === "pin"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-inner"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Hash className="w-6 h-6" />
                <div className="font-semibold text-sm">4-6 Digit PIN</div>
                <div className="text-[11px] text-slate-400">Quick numeric code</div>
              </button>

              <button
                type="button"
                onClick={() => setLockType("password")}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-2 text-center transition-all ${
                  lockType === "password"
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-inner"
                    : "bg-slate-800/40 border-slate-700/60 text-slate-400 hover:bg-slate-800"
                }`}
              >
                <Key className="w-6 h-6" />
                <div className="font-semibold text-sm">Password</div>
                <div className="text-[11px] text-slate-400">Alphanumeric text</div>
              </button>
            </div>

            {/* Auto Lock Timeout selector */}
            <div className="mt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Auto-Lock Inactivity Timeout</label>
              <select
                value={autoLockTimeout}
                onChange={(e) => setAutoLockTimeout(Number(e.target.value) as AutoLockTimeout)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value={0}>Immediately on Window Blur / Tab Switch</option>
                <option value={1}>After 1 minute of inactivity</option>
                <option value={5}>After 5 minutes of inactivity</option>
                <option value={15}>After 15 minutes of inactivity</option>
                <option value={-1}>Never (Manual Lock Only)</option>
              </select>
            </div>

            {biometricsSupported && (
              <div className="mt-2 flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-white">Enable Touch ID / Face ID</div>
                    <div className="text-[11px] text-slate-400">Quick biometric unlock</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableBiometrics}
                  onChange={(e) => setEnableBiometrics(e.target.checked)}
                  className="w-4 h-4 rounded accent-emerald-500"
                />
              </div>
            )}

            <button
              onClick={() => setStep(2)}
              className="mt-4 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Create Passcode */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Set {lockType === "pin" ? "PIN (4-6 digits)" : "Password"}
              </label>
              <input
                type={lockType === "pin" ? "password" : "text"}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(null);
                }}
                placeholder={lockType === "pin" ? "123456" : "Enter password..."}
                className="w-full py-3 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Confirm {lockType === "pin" ? "PIN" : "Password"}
              </label>
              <input
                type={lockType === "pin" ? "password" : "text"}
                value={confirmPasscode}
                onChange={(e) => {
                  setConfirmPasscode(e.target.value);
                  setError(null);
                }}
                placeholder="Confirm..."
                className="w-full py-3 px-4 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleStep2Submit}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Encrypting..." : "Generate Key & Enable"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Display Recovery Key */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold">Save your Recovery Key!</div>
                <div>If you forget your passcode, this key is the ONLY way to recover your encrypted data.</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your 24-Character Recovery Key</label>
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-center text-emerald-400 font-bold tracking-wider text-base select-all flex items-center justify-between">
                <span>{generatedRecoveryKey}</span>
                <button
                  type="button"
                  onClick={handleCopyKey}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Copy Key"
                >
                  {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={keySavedConfirmed}
                onChange={(e) => setKeySavedConfirmed(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              <span className="text-xs text-slate-300 font-medium">
                I have saved this Recovery Key in a safe place.
              </span>
            </label>

            <button
              onClick={handleFinish}
              disabled={!keySavedConfirmed}
              className="mt-4 w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20"
            >
              Complete Setup
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
