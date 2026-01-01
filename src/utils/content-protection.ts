/**
 * Content Protection Utilities
 * 
 * Provides encryption and device fingerprinting for secure content delivery.
 * This module ensures content is protected from unauthorized access and copying.
 */

// Device fingerprint generation
export interface DeviceFingerprint {
  id: string;
  userAgent: string;
  language: string;
  timezone: string;
  screenResolution: string;
  colorDepth: number;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory: number | null;
  touchSupport: boolean;
  webglVendor: string;
  webglRenderer: string;
  canvasHash: string;
  audioHash: string;
  timestamp: number;
}

/**
 * Generate a unique device fingerprint using multiple browser/device characteristics
 */
export async function generateDeviceFingerprint(): Promise<DeviceFingerprint> {
  const fingerprint: DeviceFingerprint = {
    id: '',
    userAgent: navigator.userAgent,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory || null,
    touchSupport: 'ontouchstart' in window,
    webglVendor: '',
    webglRenderer: '',
    canvasHash: '',
    audioHash: '',
    timestamp: Date.now(),
  };

  // Get WebGL info
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (gl && gl instanceof WebGLRenderingContext) {
      const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
      if (debugInfo) {
        fingerprint.webglVendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        fingerprint.webglRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      }
    }
  } catch (e) {
    // WebGL not available
  }

  // Generate canvas fingerprint
  fingerprint.canvasHash = await generateCanvasFingerprint();

  // Generate audio fingerprint
  fingerprint.audioHash = await generateAudioFingerprint();

  // Create unique ID from fingerprint components
  fingerprint.id = await hashFingerprint(fingerprint);

  return fingerprint;
}

/**
 * Generate a hash from canvas rendering (unique per device/browser)
 */
async function generateCanvasFingerprint(): Promise<string> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return '';

    // Draw text with specific styling
    ctx.textBaseline = 'top';
    ctx.font = "14px 'Arial'";
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('PayPerRead Security', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('PayPerRead Security', 4, 17);

    // Get data URL and hash it
    const dataUrl = canvas.toDataURL();
    return await hashString(dataUrl);
  } catch (e) {
    return '';
  }
}

/**
 * Generate an audio context fingerprint
 */
async function generateAudioFingerprint(): Promise<string> {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return '';

    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gain = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);

    gain.gain.value = 0; // Mute
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gain);
    gain.connect(context.destination);

    oscillator.start(0);

    // Get frequency data
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    oscillator.stop();
    context.close();

    // Hash the frequency data
    return await hashString(frequencyData.toString());
  } catch (e) {
    return '';
  }
}

/**
 * Hash a string using SHA-256
 */
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash the entire fingerprint object
 */
async function hashFingerprint(fingerprint: Omit<DeviceFingerprint, 'id' | 'timestamp'>): Promise<string> {
  const {
    userAgent,
    language,
    timezone,
    screenResolution,
    colorDepth,
    platform,
    hardwareConcurrency,
    deviceMemory,
    touchSupport,
    webglVendor,
    webglRenderer,
    canvasHash,
    audioHash,
  } = fingerprint;

  const components = [
    userAgent,
    language,
    timezone,
    screenResolution,
    colorDepth.toString(),
    platform,
    hardwareConcurrency.toString(),
    deviceMemory?.toString() || '',
    touchSupport.toString(),
    webglVendor,
    webglRenderer,
    canvasHash,
    audioHash,
  ];

  return await hashString(components.join('||'));
}

// Content encryption utilities

/**
 * Encryption key derivation from password and salt
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt content using AES-GCM
 */
export async function encryptContent(
  content: string,
  userFingerprint: string,
  sessionId: string
): Promise<{ encrypted: string; iv: string; salt: string }> {
  const encoder = new TextEncoder();
  
  // Generate random IV and salt
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  
  // Derive key from fingerprint + session
  const password = `${userFingerprint}:${sessionId}`;
  const key = await deriveKey(password, salt);
  
  // Encrypt the content
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(content)
  );
  
  // Convert to base64 for storage/transmission
  return {
    encrypted: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(encrypted)))),
    iv: btoa(String.fromCharCode.apply(null, Array.from(iv))),
    salt: btoa(String.fromCharCode.apply(null, Array.from(salt))),
  };
}

/**
 * Decrypt content using AES-GCM
 */
export async function decryptContent(
  encryptedData: { encrypted: string; iv: string; salt: string },
  userFingerprint: string,
  sessionId: string
): Promise<string> {
  const decoder = new TextDecoder();
  
  // Decode from base64
  const encrypted = Uint8Array.from(atob(encryptedData.encrypted), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(encryptedData.iv), c => c.charCodeAt(0));
  const salt = Uint8Array.from(atob(encryptedData.salt), c => c.charCodeAt(0));
  
  // Derive key from fingerprint + session
  const password = `${userFingerprint}:${sessionId}`;
  const key = await deriveKey(password, salt);
  
  // Decrypt the content
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );
  
  return decoder.decode(decrypted);
}

/**
 * Generate a secure session token
 */
export function generateSessionToken(): string {
  const array = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify device fingerprint against stored fingerprint
 * Returns similarity score (0-1), where 1 is exact match
 */
export function verifyFingerprint(
  stored: DeviceFingerprint,
  current: DeviceFingerprint
): number {
  let matches = 0;
  const totalChecks = 10;

  // Check each component
  if (stored.platform === current.platform) matches++;
  if (stored.language === current.language) matches++;
  if (stored.timezone === current.timezone) matches++;
  if (stored.screenResolution === current.screenResolution) matches++;
  if (stored.colorDepth === current.colorDepth) matches++;
  if (stored.hardwareConcurrency === current.hardwareConcurrency) matches++;
  if (stored.touchSupport === current.touchSupport) matches++;
  if (stored.webglVendor === current.webglVendor) matches++;
  if (stored.webglRenderer === current.webglRenderer) matches++;
  if (stored.canvasHash === current.canvasHash) matches++;

  return matches / totalChecks;
}

/**
 * Session protection: detect if session is being shared
 */
export interface SessionProtection {
  sessionId: string;
  fingerprint: DeviceFingerprint;
  createdAt: number;
  lastActivity: number;
  ipAddress?: string;
}

/**
 * Create a protected session
 */
export async function createProtectedSession(
  userId: string,
  contentId: string
): Promise<SessionProtection> {
  const fingerprint = await generateDeviceFingerprint();
  const sessionId = generateSessionToken();

  return {
    sessionId,
    fingerprint,
    createdAt: Date.now(),
    lastActivity: Date.now(),
  };
}

/**
 * Validate session - check if the session is still valid and from same device
 */
export async function validateSession(
  session: SessionProtection,
  maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<{ valid: boolean; reason?: string }> {
  // Check session age
  if (Date.now() - session.createdAt > maxAge) {
    return { valid: false, reason: 'Session expired' };
  }

  // Get current fingerprint
  const currentFingerprint = await generateDeviceFingerprint();
  
  // Check fingerprint similarity
  const similarity = verifyFingerprint(session.fingerprint, currentFingerprint);
  
  // Require at least 70% match for valid session
  if (similarity < 0.7) {
    return { valid: false, reason: 'Device mismatch detected' };
  }

  return { valid: true };
}

/**
 * Anti-screenshot detection (blur content when window loses focus)
 */
export function setupAntiScreenshot(
  contentElement: HTMLElement,
  onScreenshotAttempt?: () => void
): () => void {
  let isBlurred = false;

  const handleVisibilityChange = () => {
    if (document.hidden) {
      contentElement.style.filter = 'blur(20px)';
      contentElement.style.transition = 'filter 0.1s ease';
      isBlurred = true;
      onScreenshotAttempt?.();
    } else if (isBlurred) {
      // Delay unblur to prevent quick screenshot
      setTimeout(() => {
        contentElement.style.filter = 'none';
        isBlurred = false;
      }, 500);
    }
  };

  const handleWindowBlur = () => {
    contentElement.style.filter = 'blur(20px)';
    contentElement.style.transition = 'filter 0.1s ease';
    isBlurred = true;
    onScreenshotAttempt?.();
  };

  const handleWindowFocus = () => {
    if (isBlurred) {
      setTimeout(() => {
        contentElement.style.filter = 'none';
        isBlurred = false;
      }, 500);
    }
  };

  // Add event listeners
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('blur', handleWindowBlur);
  window.addEventListener('focus', handleWindowFocus);

  // Return cleanup function
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);
    window.removeEventListener('focus', handleWindowFocus);
    contentElement.style.filter = 'none';
  };
}

/**
 * Generate a dynamic watermark that's hard to remove
 */
export function generateDynamicWatermark(
  userId: string,
  email: string,
  sessionId: string
): string {
  const timestamp = new Date().toISOString();
  const shortId = userId.slice(0, 8);
  const sessionShort = sessionId.slice(0, 6);
  
  return `${email} • ${timestamp.split('T')[0]} • ${shortId}:${sessionShort}`;
}

/**
 * Apply invisible forensic watermark to content
 * Uses zero-width characters to embed user info
 */
export function applyForensicWatermark(content: string, watermarkData: string): string {
  // Convert watermark to binary
  const binary = watermarkData.split('').map(c => 
    c.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
  
  // Use zero-width characters to encode
  const zeroWidth: Record<string, string> = {
    '0': '\u200B', // Zero-width space
    '1': '\u200C', // Zero-width non-joiner
  };
  
  const encodedWatermark = binary.split('').map(b => 
    zeroWidth[b] || ''
  ).join('');
  
  // Insert watermark at strategic points throughout content
  const words = content.split(' ');
  const interval = Math.max(1, Math.floor(words.length / encodedWatermark.length));
  
  let watermarkIndex = 0;
  return words.map((word, i) => {
    if (i > 0 && i % interval === 0 && watermarkIndex < encodedWatermark.length) {
      return encodedWatermark[watermarkIndex++] + word;
    }
    return word;
  }).join(' ');
}

/**
 * Extract forensic watermark from content
 */
export function extractForensicWatermark(content: string): string | null {
  // Extract zero-width characters (U+200B = 0, U+200C = 1)
  let binary = '';
  for (const char of content) {
    if (char === '\u200B') binary += '0';
    else if (char === '\u200C') binary += '1';
  }
  
  if (binary.length < 8) return null;
  
  // Convert binary back to string
  let result = '';
  for (let i = 0; i < binary.length - 7; i += 8) {
    const byte = binary.slice(i, i + 8);
    const charCode = parseInt(byte, 2);
    if (charCode > 0 && charCode < 128) {
      result += String.fromCharCode(charCode);
    }
  }
  
  return result || null;
}
