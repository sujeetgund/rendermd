import { AppLockConfig, LockType, AutoLockTimeout, UnlockResult } from "@/types/app-lock";

const LOCK_CONFIG_STORAGE_KEY = "rendermd_app_lock_config_v1";

// Helper utilities for ArrayBuffer <-> Base64 / String
function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== "undefined" ? btoa(binary) : "";
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = typeof window !== "undefined" ? atob(base64) : "";
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer as ArrayBuffer;
}

function getRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(new ArrayBuffer(length));
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(bytes);
  }
  return bytes;
}

/**
 * Derive a CryptoKey from a password string and salt using PBKDF2
 */
async function deriveCryptoKey(password: string, saltBuffer: BufferSource): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a raw text string (e.g. document JSON or master key) using AES-GCM
 */
export async function encryptData(plainText: string, passcode: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto) return plainText;

  const saltBytes = getRandomBytes(16);
  const ivBytes = getRandomBytes(12);
  
  const key = await deriveCryptoKey(passcode, saltBytes as unknown as BufferSource);
  const encoder = new TextEncoder();
  const encodedText = encoder.encode(plainText);

  const ciphertextBuffer = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: ivBytes as BufferSource,
    },
    key,
    encodedText
  );

  const payload = {
    salt: arrayBufferToBase64(saltBytes.buffer),
    iv: arrayBufferToBase64(ivBytes.buffer),
    data: arrayBufferToBase64(ciphertextBuffer),
  };

  return JSON.stringify(payload);
}

/**
 * Decrypt AES-GCM ciphertext using passcode
 */
export async function decryptData(encryptedJson: string, passcode: string): Promise<string> {
  if (typeof window === "undefined" || !window.crypto) return encryptedJson;

  try {
    const payload = JSON.parse(encryptedJson);
    if (!payload.salt || !payload.iv || !payload.data) {
      throw new Error("Invalid cipher payload structure");
    }

    const saltBuffer = base64ToArrayBuffer(payload.salt);
    const ivBuffer = base64ToArrayBuffer(payload.iv);
    const dataBuffer = base64ToArrayBuffer(payload.data);

    const key = await deriveCryptoKey(passcode, saltBuffer);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: new Uint8Array(ivBuffer) as BufferSource,
      },
      key,
      dataBuffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.error("Decryption failed:", err);
    throw new Error("Incorrect passcode or corrupted data");
  }
}

/**
 * Generate a 24-character secure alphanumeric recovery key formatted into 6 blocks of 4 chars
 */
export function generateRecoveryKey(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Easy to read, no confusing 0/O or 1/I
  const bytes = getRandomBytes(24);
  let raw = "";
  for (let i = 0; i < 24; i++) {
    raw += chars[bytes[i] % chars.length];
  }
  return raw.match(/.{1,4}/g)?.join("-") || raw;
}

/**
 * Hash a password/PIN with PBKDF2 for verification
 */
export async function hashPassword(password: string, saltBase64?: string): Promise<{ hash: string; salt: string }> {
  const saltBuffer = saltBase64 ? base64ToArrayBuffer(saltBase64) : getRandomBytes(16);
  const key = await deriveCryptoKey(password, saltBuffer as unknown as BufferSource);
  
  // Export or encrypt a known token to verify
  const dummyToken = new TextEncoder().encode("rendermd_auth_token_v1");
  const iv = getRandomBytes(12);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    dummyToken
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(encrypted), iv.length);

  return {
    hash: arrayBufferToBase64(combined.buffer),
    salt: arrayBufferToBase64(saltBuffer instanceof Uint8Array ? saltBuffer.buffer : saltBuffer),
  };
}

/**
 * Verify passcode against stored hash
 */
export async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
  try {
    const combinedBuffer = base64ToArrayBuffer(storedHash);
    const iv = new Uint8Array(combinedBuffer.slice(0, 12));
    const ciphertext = combinedBuffer.slice(12);

    const saltBuffer = base64ToArrayBuffer(salt);
    const key = await deriveCryptoKey(password, saltBuffer);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ciphertext
    );

    const text = new TextDecoder().decode(decrypted);
    return text === "rendermd_auth_token_v1";
  } catch {
    return false;
  }
}

/**
 * Check if the user is currently locked out due to too many failed attempts
 */
export function getLockoutCooldown(config: AppLockConfig): number {
  if (!config.lockoutUntil) return 0;
  const remaining = config.lockoutUntil - Date.now();
  return remaining > 0 ? remaining : 0;
}

/**
 * Calculate lockout duration based on failed attempts count
 */
export function calculateLockoutTime(failedAttempts: number): number {
  if (failedAttempts >= 15) return 15 * 60 * 1000; // 15 mins
  if (failedAttempts >= 10) return 5 * 60 * 1000; // 5 mins
  if (failedAttempts >= 5) return 30 * 1000; // 30 seconds
  return 0;
}

/**
 * Load stored App Lock configuration from LocalStorage
 */
export function loadStoredAppLockConfig(): AppLockConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCK_CONFIG_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save App Lock configuration to LocalStorage
 */
export function saveStoredAppLockConfig(config: AppLockConfig | null): void {
  if (typeof window === "undefined") return;
  try {
    if (!config) {
      localStorage.removeItem(LOCK_CONFIG_STORAGE_KEY);
    } else {
      localStorage.setItem(LOCK_CONFIG_STORAGE_KEY, JSON.stringify(config));
    }
  } catch (err) {
    console.error("Failed to save app lock config:", err);
  }
}

/**
 * WebAuthn local biometric registration & authentication
 */
export async function isBiometricsSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function registerBiometrics(username = "rendermd_user"): Promise<boolean> {
  if (typeof window === "undefined" || !window.navigator.credentials) return false;
  try {
    const challenge = getRandomBytes(32);
    const userId = getRandomBytes(16);

    const publicKey: PublicKeyCredentialCreationOptions = {
      challenge: challenge as BufferSource,
      rp: { name: "Rendermd App Lock" },
      user: {
        id: userId as BufferSource,
        name: username,
        displayName: "Rendermd User",
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
      },
      timeout: 60000,
    };

    const credential = await navigator.credentials.create({ publicKey });
    return !!credential;
  } catch (err) {
    console.error("Biometric registration failed:", err);
    return false;
  }
}

export async function authenticateBiometrics(): Promise<boolean> {
  if (typeof window === "undefined" || !window.navigator.credentials) return false;
  try {
    const challenge = getRandomBytes(32);
    const publicKey: PublicKeyCredentialRequestOptions = {
      challenge: challenge as BufferSource,
      userVerification: "required",
      timeout: 60000,
    };

    const assertion = await navigator.credentials.get({ publicKey });
    return !!assertion;
  } catch (err) {
    console.error("Biometric authentication failed:", err);
    return false;
  }
}
