"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useAppLock } from "@/components/security/app-lock-context";
import { AutoLockTimeout } from "@/types/app-lock";
import { ShieldCheck, ShieldOff, Key, Fingerprint, Clock, Lock, CheckCircle } from "lucide-react";
import { SetupLockModal } from "@/components/security/setup-lock-modal";

export function SecuritySettings() {
  const { config, isConfigured, disableAppLock, changePasscode, updateSettings, biometricsSupported } = useAppLock();

  const [mounted, setMounted] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState<boolean>(false);
  const [disablePasscode, setDisablePasscode] = useState<string>("");

  useEffect(() => {
    setMounted(true);
  }, []);
  
  const [showChangePasscode, setShowChangePasscode] = useState<boolean>(false);
  const [currentPasscode, setCurrentPasscode] = useState<string>("");
  const [newPasscode, setNewPasscode] = useState<string>("");
  const [confirmNewPasscode, setConfirmNewPasscode] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleDisable = async () => {
    if (!disablePasscode) return;
    const success = await disableAppLock(disablePasscode);
    if (success) {
      setShowDisableConfirm(false);
      setDisablePasscode("");
    }
  };

  const handleChangePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (newPasscode !== confirmNewPasscode) {
      setError("New passcode and confirmation do not match.");
      return;
    }

    const success = await changePasscode(currentPasscode, newPasscode);
    if (success) {
      setShowChangePasscode(false);
      setCurrentPasscode("");
      setNewPasscode("");
      setConfirmNewPasscode("");
    }
  };

  return (
    <div className="w-full flex flex-col gap-6 text-slate-100">
      {/* App Lock Status Banner */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
              isConfigured
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            {isConfigured ? <ShieldCheck className="w-6 h-6" /> : <ShieldOff className="w-6 h-6" />}
          </div>
          <div>
            <div className="font-bold text-base text-white">App Protection Lock</div>
            <div className="text-xs text-slate-400">
              {isConfigured
                ? `Active (${config?.lockType === "pin" ? "PIN Protection" : "Password Protection"})`
                : "App Lock is currently disabled."}
            </div>
          </div>
        </div>

        {isConfigured ? (
          <button
            onClick={() => setShowDisableConfirm(true)}
            className="py-2 px-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 text-xs font-semibold transition-colors"
          >
            Turn Off Lock
          </button>
        ) : (
          <button
            onClick={() => setShowSetupModal(true)}
            className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20"
          >
            Setup App Lock
          </button>
        )}
      </div>

      {/* Security Options (if lock is configured) */}
      {isConfigured && config && (
        <div className="flex flex-col gap-4">
          {/* Change Passcode */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-white">Change Passcode</div>
                <div className="text-[11px] text-slate-400">Update your PIN or password</div>
              </div>
            </div>
            <button
              onClick={() => setShowChangePasscode(!showChangePasscode)}
              className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
            >
              Update
            </button>
          </div>

          {/* Change Passcode Inline Form */}
          {showChangePasscode && (
            <form
              onSubmit={handleChangePasscodeSubmit}
              className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col gap-3"
            >
              {error && <div className="text-xs text-rose-400">{error}</div>}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Current Passcode</label>
                <input
                  type="password"
                  value={currentPasscode}
                  onChange={(e) => setCurrentPasscode(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">New Passcode</label>
                <input
                  type="password"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Confirm New Passcode</label>
                <input
                  type="password"
                  value={confirmNewPasscode}
                  onChange={(e) => setConfirmNewPasscode(e.target.value)}
                  className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasscode(false)}
                  className="py-1.5 px-3 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-1.5 px-3 rounded-lg bg-emerald-500 text-xs font-semibold text-slate-950"
                >
                  Save Passcode
                </button>
              </div>
            </form>
          )}

          {/* Auto-Lock Inactivity Selector */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-400" />
              <div>
                <div className="text-xs font-semibold text-white">Auto-Lock Inactivity Timeout</div>
                <div className="text-[11px] text-slate-400">Lock app automatically after inactivity</div>
              </div>
            </div>
            <select
              value={config.autoLockTimeout}
              onChange={(e) => updateSettings({ autoLockTimeout: Number(e.target.value) as AutoLockTimeout })}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs"
            >
              <option value={0}>On Window Blur</option>
              <option value={1}>1 Minute</option>
              <option value={5}>5 Minutes</option>
              <option value={15}>15 Minutes</option>
              <option value={-1}>Never</option>
            </select>
          </div>

          {/* Biometrics Toggle */}
          {biometricsSupported && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-white">Biometric Unlock</div>
                  <div className="text-[11px] text-slate-400">Touch ID / Face ID / Windows Hello</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={config.biometricsEnabled}
                onChange={(e) => updateSettings({ biometricsEnabled: e.target.checked })}
                className="w-4 h-4 rounded accent-emerald-500"
              />
            </div>
          )}
        </div>
      )}

      {/* Disable App Lock Modal Confirmation */}
      {showDisableConfirm && mounted && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm max-h-[90vh] overflow-y-auto w-full shadow-2xl my-auto">
            <h3 className="text-lg font-bold text-white mb-2">Turn Off App Lock?</h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your passcode to confirm disabling lock protection and decrypt documents stored at rest.
            </p>

            <input
              type="password"
              value={disablePasscode}
              onChange={(e) => setDisablePasscode(e.target.value)}
              placeholder="Enter passcode..."
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs mb-4"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={() => setShowDisableConfirm(false)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDisable}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white"
              >
                Disable Lock
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Setup Modal */}
      {showSetupModal && (
        <SetupLockModal isOpen={showSetupModal} onClose={() => setShowSetupModal(false)} />
      )}
    </div>
  );
}
