"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { AppLockConfig, LockType, AutoLockTimeout } from "@/types/app-lock";
import {
  loadStoredAppLockConfig,
  saveStoredAppLockConfig,
  verifyPassword,
  hashPassword,
  encryptData,
  decryptData,
  generateRecoveryKey,
  getLockoutCooldown,
  calculateLockoutTime,
  authenticateBiometrics,
  isBiometricsSupported,
} from "@/lib/security/app-lock";
import {
  isDocumentsPayloadEncrypted,
  decryptStoredDocuments,
  saveStoredDocuments,
  loadStoredDocuments,
} from "@/lib/storage/document-store";
import { MarkdownDocument } from "@/types/document";
import { toast } from "sonner";

interface AppLockContextType {
  isLocked: boolean;
  isConfigured: boolean;
  config: AppLockConfig | null;
  sessionPasscode: string | null;
  unlockedDocuments: MarkdownDocument[] | null;
  biometricsSupported: boolean;
  lockApp: () => void;
  unlockApp: (passcode: string) => Promise<{ success: boolean; error?: string }>;
  unlockWithBiometrics: () => Promise<{ success: boolean; error?: string }>;
  setupAppLock: (newConfig: Omit<AppLockConfig, "passwordHash" | "salt" | "recoveryKeyHash" | "encryptedMasterKey" | "masterSalt" | "failedAttempts" | "lockoutUntil">, passcode: string) => Promise<string>;
  disableAppLock: (passcode: string) => Promise<boolean>;
  changePasscode: (currentPasscode: string, newPasscode: string) => Promise<boolean>;
  recoveryUnlock: (recoveryKey: string, newPasscode: string) => Promise<boolean>;
  factoryReset: () => void;
  updateSettings: (newSettings: Partial<AppLockConfig>) => void;
  updateUnlockedDocuments: (docs: MarkdownDocument[]) => void;
}

const AppLockContext = createContext<AppLockContextType | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppLockConfig | null>(null);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [sessionPasscode, setSessionPasscode] = useState<string | null>(null);
  const [unlockedDocuments, setUnlockedDocuments] = useState<MarkdownDocument[] | null>(null);
  const [biometricsSupported, setBiometricsSupported] = useState<boolean>(false);
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initial load
  useEffect(() => {
    const loadedConfig = loadStoredAppLockConfig();
    if (loadedConfig && loadedConfig.enabled) {
      setConfig(loadedConfig);
      setIsLocked(true);
    } else {
      setConfig(loadedConfig);
      setIsLocked(false);
    }

    isBiometricsSupported().then(setBiometricsSupported);
  }, []);

  const lockApp = useCallback(() => {
    if (config?.enabled) {
      setIsLocked(true);
      setSessionPasscode(null);
      setUnlockedDocuments(null);
      toast.info("App locked");
    }
  }, [config?.enabled]);

  // Handle inactivity timeout and window blur
  useEffect(() => {
    if (!config?.enabled || isLocked) return;

    const timeout = config.autoLockTimeout;

    // Window blur / tab switch lock
    const handleVisibilityChange = () => {
      if (document.hidden && timeout === 0) {
        lockApp();
      }
    };

    const handleWindowBlur = () => {
      if (timeout === 0) {
        lockApp();
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    // Idle timer (for positive minute timeouts)
    const resetIdleTimer = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      if (timeout > 0) {
        idleTimerRef.current = setTimeout(() => {
          lockApp();
        }, timeout * 60 * 1000);
      }
    };

    if (timeout > 0) {
      resetIdleTimer();
      window.addEventListener("mousemove", resetIdleTimer);
      window.addEventListener("keydown", resetIdleTimer);
      window.addEventListener("touchstart", resetIdleTimer);
      window.addEventListener("scroll", resetIdleTimer);
    }

    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      window.removeEventListener("scroll", resetIdleTimer);
    };
  }, [config, isLocked, lockApp]);

  // Unlock with passcode
  const unlockApp = async (passcode: string): Promise<{ success: boolean; error?: string }> => {
    if (!config) return { success: false, error: "App Lock not configured" };

    // Check rate limiting / lockout
    const cooldown = getLockoutCooldown(config);
    if (cooldown > 0) {
      const remainingSec = Math.ceil(cooldown / 1000);
      return {
        success: false,
        error: `Too many failed attempts. Try again in ${remainingSec} seconds.`,
      };
    }

    const isValid = await verifyPassword(passcode, config.passwordHash, config.salt);

    if (!isValid) {
      const newFailed = (config.failedAttempts || 0) + 1;
      const lockoutMs = calculateLockoutTime(newFailed);
      const lockoutUntil = lockoutMs > 0 ? Date.now() + lockoutMs : null;

      const updatedConfig: AppLockConfig = {
        ...config,
        failedAttempts: newFailed,
        lockoutUntil,
      };

      setConfig(updatedConfig);
      saveStoredAppLockConfig(updatedConfig);

      if (lockoutMs > 0) {
        const sec = Math.ceil(lockoutMs / 1000);
        return {
          success: false,
          error: `Incorrect passcode. Lockout active for ${sec} seconds.`,
        };
      }

      return {
        success: false,
        error: "Incorrect passcode. Please try again.",
      };
    }

    // Success - reset failure counter
    const resetConfig: AppLockConfig = {
      ...config,
      failedAttempts: 0,
      lockoutUntil: null,
    };

    setConfig(resetConfig);
    saveStoredAppLockConfig(resetConfig);
    setSessionPasscode(passcode);

    // Decrypt stored documents if encrypted
    try {
      if (isDocumentsPayloadEncrypted()) {
        const docs = await decryptStoredDocuments(passcode);
        setUnlockedDocuments(docs);
      } else {
        setUnlockedDocuments(loadStoredDocuments());
      }
    } catch {
      setUnlockedDocuments(loadStoredDocuments());
    }

    setIsLocked(false);
    toast.success("App unlocked successfully");
    return { success: true };
  };

  // Unlock with WebAuthn Biometrics
  const unlockWithBiometrics = async (): Promise<{ success: boolean; error?: string }> => {
    if (!config?.biometricsEnabled) {
      return { success: false, error: "Biometric unlock not enabled" };
    }

    const authenticated = await authenticateBiometrics();
    if (!authenticated) {
      return { success: false, error: "Biometric verification failed" };
    }

    // Biometric verified. Clear failures.
    const resetConfig: AppLockConfig = {
      ...config,
      failedAttempts: 0,
      lockoutUntil: null,
    };

    setConfig(resetConfig);
    saveStoredAppLockConfig(resetConfig);

    setIsLocked(false);
    toast.success("Unlocked with biometrics");
    return { success: true };
  };

  // Setup new App Lock
  const setupAppLock = async (
    baseConfig: Omit<AppLockConfig, "passwordHash" | "salt" | "recoveryKeyHash" | "encryptedMasterKey" | "masterSalt" | "failedAttempts" | "lockoutUntil">,
    passcode: string
  ): Promise<string> => {
    const { hash: passwordHash, salt } = await hashPassword(passcode);
    const recoveryKey = generateRecoveryKey();
    const { hash: recoveryKeyHash, salt: masterSalt } = await hashPassword(recoveryKey);

    // Encrypt passcode with recovery key so recovery key can decrypt session
    const encryptedMasterKey = await encryptData(passcode, recoveryKey);

    const fullConfig: AppLockConfig = {
      ...baseConfig,
      enabled: true,
      passwordHash,
      salt,
      recoveryKeyHash,
      encryptedMasterKey,
      masterSalt,
      failedAttempts: 0,
      lockoutUntil: null,
    };

    setConfig(fullConfig);
    saveStoredAppLockConfig(fullConfig);
    setSessionPasscode(passcode);

    // Encrypt existing local documents with passcode
    const existingDocs = loadStoredDocuments();
    await saveStoredDocuments(existingDocs, passcode);
    setUnlockedDocuments(existingDocs);

    toast.success("App Lock configured successfully");
    return recoveryKey;
  };

  // Disable App Lock and decrypt data to plain JSON
  const disableAppLock = async (passcode: string): Promise<boolean> => {
    if (!config) return false;
    const isValid = await verifyPassword(passcode, config.passwordHash, config.salt);
    if (!isValid) {
      toast.error("Incorrect passcode");
      return false;
    }

    // Decrypt and save as unencrypted
    let docs = unlockedDocuments;
    if (!docs) {
      docs = await decryptStoredDocuments(passcode);
    }

    await saveStoredDocuments(docs || loadStoredDocuments()); // plain text save

    setConfig(null);
    saveStoredAppLockConfig(null);
    setSessionPasscode(null);
    setIsLocked(false);

    toast.success("App Lock disabled");
    return true;
  };

  // Change Passcode
  const changePasscode = async (currentPasscode: string, newPasscode: string): Promise<boolean> => {
    if (!config) return false;
    const isValid = await verifyPassword(currentPasscode, config.passwordHash, config.salt);
    if (!isValid) {
      toast.error("Current passcode is incorrect");
      return false;
    }

    // Re-encrypt documents with new passcode
    const docs = unlockedDocuments || (await decryptStoredDocuments(currentPasscode));
    await saveStoredDocuments(docs, newPasscode);

    const { hash: passwordHash, salt } = await hashPassword(newPasscode);

    // Update recovery master key wrapper
    // Decrypt master key using recovery key hash or existing recovery key
    const newConfig: AppLockConfig = {
      ...config,
      passwordHash,
      salt,
    };

    setConfig(newConfig);
    saveStoredAppLockConfig(newConfig);
    setSessionPasscode(newPasscode);

    toast.success("Passcode updated successfully");
    return true;
  };

  // Unlock using 24-character Recovery Key when user forgot passcode
  const recoveryUnlock = async (recoveryKey: string, newPasscode: string): Promise<boolean> => {
    if (!config) return false;

    const formattedKey = recoveryKey.trim().toUpperCase();
    const isValid = await verifyPassword(formattedKey, config.recoveryKeyHash, config.masterSalt);

    if (!isValid) {
      toast.error("Invalid Recovery Key");
      return false;
    }

    try {
      // Decrypt original passcode using recovery key
      const originalPasscode = await decryptData(config.encryptedMasterKey, formattedKey);

      // Decrypt stored documents using original passcode
      const docs = await decryptStoredDocuments(originalPasscode);

      // Re-encrypt documents with new passcode
      await saveStoredDocuments(docs, newPasscode);

      // Update password hash & salt
      const { hash: passwordHash, salt } = await hashPassword(newPasscode);
      const newEncryptedMasterKey = await encryptData(newPasscode, formattedKey);

      const updatedConfig: AppLockConfig = {
        ...config,
        passwordHash,
        salt,
        encryptedMasterKey: newEncryptedMasterKey,
        failedAttempts: 0,
        lockoutUntil: null,
      };

      setConfig(updatedConfig);
      saveStoredAppLockConfig(updatedConfig);
      setSessionPasscode(newPasscode);
      setUnlockedDocuments(docs);
      setIsLocked(false);

      toast.success("Access recovered! New passcode set.");
      return true;
    } catch (err) {
      console.error("Recovery unlock failed:", err);
      toast.error("Failed to recover data with this Recovery Key");
      return false;
    }
  };

  // Emergency Factory Reset (Clears App Lock & Local Storage)
  const factoryReset = () => {
    if (typeof window === "undefined") return;
    localStorage.clear();
    setConfig(null);
    setIsLocked(false);
    setSessionPasscode(null);
    setUnlockedDocuments(null);
    toast.success("App data cleared and factory reset complete");
    window.location.reload();
  };

  const updateSettings = (newSettings: Partial<AppLockConfig>) => {
    if (!config) return;
    const updated = { ...config, ...newSettings };
    setConfig(updated);
    saveStoredAppLockConfig(updated);
    toast.success("Security settings updated");
  };

  const updateUnlockedDocuments = (docs: MarkdownDocument[]) => {
    setUnlockedDocuments(docs);
    if (sessionPasscode) {
      saveStoredDocuments(docs, sessionPasscode);
    } else {
      saveStoredDocuments(docs);
    }
  };

  return (
    <AppLockContext.Provider
      value={{
        isLocked,
        isConfigured: !!config?.enabled,
        config,
        sessionPasscode,
        unlockedDocuments,
        biometricsSupported,
        lockApp,
        unlockApp,
        unlockWithBiometrics,
        setupAppLock,
        disableAppLock,
        changePasscode,
        recoveryUnlock,
        factoryReset,
        updateSettings,
        updateUnlockedDocuments,
      }}
    >
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error("useAppLock must be used within an AppLockProvider");
  }
  return context;
}
