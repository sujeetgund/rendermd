export type LockType = "pin" | "password";

export type AutoLockTimeout = 0 | 1 | 5 | 15 | -1; // 0 = immediate on blur, -1 = never, positive = minutes

export interface AppLockConfig {
  enabled: boolean;
  lockType: LockType;
  passwordHash: string; // Base64 encoded PBKDF2 hash of password/PIN
  salt: string; // Base64 encoded salt for password verification
  recoveryKeyHash: string; // Base64 encoded hash of 24-character recovery key
  encryptedMasterKey: string; // Master key encrypted with recovery key (AES-GCM base64 string)
  masterSalt: string; // Salt used for master key derivation
  biometricsEnabled: boolean;
  autoLockTimeout: AutoLockTimeout;
  failedAttempts: number;
  lockoutUntil: number | null; // Timestamp (ms) until lockout expires
}

export interface LockState {
  isLocked: boolean;
  isConfigured: boolean;
  config: AppLockConfig | null;
}

export interface UnlockResult {
  success: boolean;
  error?: string;
  remainingCooldownMs?: number;
}
