/**
 * Content Protection Utilities
 * Handles encryption, device fingerprinting, and secure download
 */

// Generate a unique device fingerprint
export async function generateDeviceFingerprint(): Promise<string> {
  const components: string[] = [];
  
  // Screen info
  if (typeof window !== 'undefined') {
    components.push(`${window.screen.width}x${window.screen.height}`);
    components.push(`${window.screen.colorDepth}`);
    components.push(`${window.devicePixelRatio}`);
    
    // Navigator info
    components.push(navigator.language || '');
    components.push(navigator.platform || '');
    components.push(String(navigator.hardwareConcurrency || ''));
    components.push(String(navigator.maxTouchPoints || 0));
    
    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || '');
    
    // Canvas fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('PayPerRead-fp', 2, 2);
        components.push(canvas.toDataURL().slice(-50));
      }
    } catch (e) {
      components.push('no-canvas');
    }
    
    // WebGL info
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
      if (gl) {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          components.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '');
          components.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
        }
      }
    } catch (e) {
      components.push('no-webgl');
    }
  }
  
  // Generate hash from components
  const fingerprintString = components.join('|');
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprintString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return hashHex.slice(0, 32);
}

// Generate encryption key from password and device fingerprint
export async function generateEncryptionKey(
  password: string, 
  deviceFingerprint: string
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const combinedSecret = `${password}|${deviceFingerprint}`;
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(combinedSecret),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );
  
  // Use a fixed salt for deterministic key generation
  const salt = encoder.encode('PayPerRead-Salt-2024');
  
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt content
export async function encryptContent(
  content: string | ArrayBuffer,
  password: string,
  deviceFingerprint: string
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const key = await generateEncryptionKey(password, deviceFingerprint);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  let data: BufferSource;
  if (typeof content === 'string') {
    const encoder = new TextEncoder();
    data = encoder.encode(content);
  } else {
    data = content;
  }
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );
  
  return { encrypted, iv };
}

// Decrypt content
export async function decryptContent(
  encrypted: ArrayBuffer,
  iv: Uint8Array,
  password: string,
  deviceFingerprint: string
): Promise<ArrayBuffer> {
  const key = await generateEncryptionKey(password, deviceFingerprint);
  
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encrypted
  );
}

// Create protected download package
export async function createProtectedDownload(
  content: string | ArrayBuffer,
  password: string,
  userId: string,
  contentId: string,
  contentTitle: string
): Promise<Blob> {
  const deviceFingerprint = await generateDeviceFingerprint();
  const { encrypted, iv } = await encryptContent(content, password, deviceFingerprint);
  
  // Create metadata
  const metadata = {
    version: '1.0',
    contentId,
    contentTitle,
    userId,
    deviceFingerprint,
    createdAt: new Date().toISOString(),
    iv: Array.from(iv),
    encryptedSize: encrypted.byteLength,
  };
  
  // Combine metadata and encrypted content
  const metadataString = JSON.stringify(metadata);
  const metadataBytes = new TextEncoder().encode(metadataString);
  const metadataLength = new Uint32Array([metadataBytes.length]);
  
  // Create final package: [4 bytes length][metadata][encrypted content]
  const totalLength = 4 + metadataBytes.length + encrypted.byteLength;
  const finalPackage = new Uint8Array(totalLength);
  finalPackage.set(new Uint8Array(metadataLength.buffer), 0);
  finalPackage.set(metadataBytes, 4);
  finalPackage.set(new Uint8Array(encrypted), 4 + metadataBytes.length);
  
  return new Blob([finalPackage], { type: 'application/x-ppr-protected' });
}

// Verify and extract protected download
export async function verifyAndExtractDownload(
  packageBlob: Blob,
  password: string
): Promise<{ success: boolean; content?: ArrayBuffer; error?: string }> {
  try {
    const packageBuffer = await packageBlob.arrayBuffer();
    const packageArray = new Uint8Array(packageBuffer);
    
    // Extract metadata length
    const metadataLength = new Uint32Array(packageArray.slice(0, 4).buffer)[0];
    
    // Extract metadata
    const metadataBytes = packageArray.slice(4, 4 + metadataLength);
    const metadataString = new TextDecoder().decode(metadataBytes);
    const metadata = JSON.parse(metadataString);
    
    // Extract encrypted content
    const encryptedContent = packageArray.slice(4 + metadataLength).buffer;
    const iv = new Uint8Array(metadata.iv);
    
    // Verify device fingerprint
    const currentFingerprint = await generateDeviceFingerprint();
    if (currentFingerprint !== metadata.deviceFingerprint) {
      return { 
        success: false, 
        error: 'This file is locked to a different device and cannot be opened here.' 
      };
    }
    
    // Decrypt content
    const decrypted = await decryptContent(encryptedContent, iv, password, currentFingerprint);
    
    return { success: true, content: decrypted };
  } catch (error) {
    return { 
      success: false, 
      error: 'Invalid password or corrupted file.' 
    };
  }
}

// Generate a secure password for the user
export function generateSecurePassword(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const length = 12;
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, x => chars[x % chars.length]).join('');
}

// Store device fingerprint in local storage
export function storeDeviceBinding(contentId: string, fingerprint: string) {
  if (typeof window !== 'undefined') {
    const bindings = JSON.parse(localStorage.getItem('ppr_device_bindings') || '{}');
    bindings[contentId] = {
      fingerprint,
      boundAt: new Date().toISOString()
    };
    localStorage.setItem('ppr_device_bindings', JSON.stringify(bindings));
  }
}

// Check if content is bound to this device
export async function isContentBoundToDevice(contentId: string): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  const bindings = JSON.parse(localStorage.getItem('ppr_device_bindings') || '{}');
  const binding = bindings[contentId];
  
  if (!binding) return true; // Not bound yet, allow
  
  const currentFingerprint = await generateDeviceFingerprint();
  return binding.fingerprint === currentFingerprint;
}

// Add watermark to content
export function addWatermark(content: string, userId: string, email: string): string {
  const watermark = `\n\n---\nLicensed to: ${email}\nUser ID: ${userId.slice(0, 8)}...\nGenerated: ${new Date().toISOString()}\nCopying or sharing is prohibited.\n---\n`;
  return content + watermark;
}
