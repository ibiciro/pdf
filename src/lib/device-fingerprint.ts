'use client';

/**
 * Device Fingerprinting Module
 * Creates a unique identifier for each device to protect downloaded content
 */

interface FingerprintComponents {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezoneOffset: number;
  webglVendor: string;
  webglRenderer: string;
  canvas: string;
  audioContext: string;
  hardwareConcurrency: number;
  deviceMemory: number | undefined;
}

// Simple hash function for fingerprint
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

// Get canvas fingerprint
function getCanvasFingerprint(): string {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return 'no-canvas';
    
    canvas.width = 200;
    canvas.height = 50;
    
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('DeviceFingerprint123', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('DeviceFingerprint123', 4, 17);
    
    return hashString(canvas.toDataURL());
  } catch {
    return 'canvas-error';
  }
}

// Get WebGL info
function getWebGLInfo(): { vendor: string; renderer: string } {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    if (!gl) return { vendor: 'no-webgl', renderer: 'no-webgl' };
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return { vendor: 'unknown', renderer: 'unknown' };
    
    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'unknown',
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'unknown',
    };
  } catch {
    return { vendor: 'error', renderer: 'error' };
  }
}

// Get audio context fingerprint
function getAudioFingerprint(): string {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const analyser = audioContext.createAnalyser();
    const gain = audioContext.createGain();
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    
    gain.gain.value = 0;
    oscillator.type = 'triangle';
    oscillator.connect(analyser);
    analyser.connect(processor);
    processor.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(0);
    
    const fingerprint = audioContext.destination.channelCount + 
                       audioContext.destination.maxChannelCount + 
                       audioContext.sampleRate.toString();
    
    oscillator.stop();
    audioContext.close();
    
    return hashString(fingerprint);
  } catch {
    return 'audio-error';
  }
}

// Generate complete device fingerprint
export async function generateDeviceFingerprint(): Promise<string> {
  if (typeof window === 'undefined') {
    return 'server-side';
  }

  const webgl = getWebGLInfo();
  
  const components: FingerprintComponents = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}x${screen.colorDepth}`,
    timezoneOffset: new Date().getTimezoneOffset(),
    webglVendor: webgl.vendor,
    webglRenderer: webgl.renderer,
    canvas: getCanvasFingerprint(),
    audioContext: getAudioFingerprint(),
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: (navigator as any).deviceMemory,
  };

  const fingerprintString = Object.values(components).join('|');
  return hashString(fingerprintString);
}

// Verify if the current device matches a fingerprint
export function verifyDeviceFingerprint(storedFingerprint: string, currentFingerprint: string): boolean {
  return storedFingerprint === currentFingerprint;
}

// Create encrypted content key tied to device
export function createDeviceEncryptionKey(userId: string, deviceFingerprint: string, contentId: string): string {
  const combined = `${userId}|${deviceFingerprint}|${contentId}|${Date.now()}`;
  return hashString(combined) + hashString(combined.split('').reverse().join(''));
}

// Validate encryption key
export function validateEncryptionKey(key: string, minLength: number = 16): boolean {
  return key.length >= minLength && /^[a-f0-9]+$/i.test(key);
}
