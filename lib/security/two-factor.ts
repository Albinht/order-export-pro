import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import bcrypt from 'bcryptjs';

/**
 * Generate a new 2FA secret for a user
 */
export function generateSecret(username: string) {
  const secret = speakeasy.generateSecret({
    name: `Order Export Pro (${username})`,
    issuer: 'Order Export Pro',
    length: 32
  });
  
  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url
  };
}

/**
 * Generate QR code for 2FA setup
 */
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    return await QRCode.toDataURL(otpauthUrl);
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify a TOTP token
 */
export function verifyToken(token: string, secret: string): boolean {
  try {
    const verified = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2 // Allow 2 time steps before/after for clock skew
    });
    
    return verified;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

/**
 * Generate backup codes
 */
export async function generateBackupCodes(count: number = 10): Promise<{ plain: string[], hashed: string[] }> {
  const codes: string[] = [];
  const hashedCodes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-digit codes
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    codes.push(code);
    
    // Hash the code for storage
    const hashedCode = await bcrypt.hash(code, 10);
    hashedCodes.push(hashedCode);
  }
  
  return {
    plain: codes,
    hashed: hashedCodes
  };
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(
  code: string, 
  hashedCodes: string[]
): Promise<{ valid: boolean, remainingCodes?: string[] }> {
  for (let i = 0; i < hashedCodes.length; i++) {
    const isValid = await bcrypt.compare(code, hashedCodes[i]);
    if (isValid) {
      // Remove used code
      const remainingCodes = [...hashedCodes];
      remainingCodes.splice(i, 1);
      
      return {
        valid: true,
        remainingCodes
      };
    }
  }
  
  return { valid: false };
}

/**
 * Generate device fingerprint
 */
export function generateDeviceFingerprint(
  userAgent: string,
  ipAddress: string,
  acceptLanguage?: string,
  acceptEncoding?: string
): string {
  const data = [
    userAgent,
    ipAddress,
    acceptLanguage || '',
    acceptEncoding || ''
  ].join('|');
  
  // Simple hash for demo - in production use a proper hashing library
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Check if device is trusted
 */
export function isDeviceTrusted(
  fingerprint: string,
  trustedDevices: string[]
): boolean {
  return trustedDevices.includes(fingerprint);
}
