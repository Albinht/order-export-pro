import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { generateSecret, generateQRCode, generateBackupCodes } from '@/lib/security/two-factor';
import { logAuditEvent } from '@/lib/security/audit-logger';
import { getClientIp } from '@/lib/security/ip-security';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('auth-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // For now, use the hardcoded admin user
    // In production, look up the user from session
    const username = 'admin';
    
    // Check if user already has 2FA enabled
    let user = await prisma.userSecurity.findUnique({
      where: { username }
    });
    
    if (!user) {
      // Create user security record if doesn't exist
      user = await prisma.userSecurity.create({
        data: {
          username,
          passwordHash: '' // Will be set properly in production
        }
      });
    }
    
    if (user.twoFactorEnabled) {
      return NextResponse.json({ 
        error: '2FA is already enabled for this account' 
      }, { status: 400 });
    }
    
    // Generate new secret
    const { secret, otpauthUrl } = generateSecret(username);
    
    // Generate QR code
    const qrCode = await generateQRCode(otpauthUrl!);
    
    // Generate backup codes
    const { plain: backupCodes, hashed: hashedBackupCodes } = await generateBackupCodes();
    
    // Store secret temporarily (not enabled yet)
    await prisma.userSecurity.update({
      where: { id: user.id },
      data: {
        twoFactorSecret: secret,
        backupCodes: JSON.stringify(hashedBackupCodes)
      }
    });
    
    // Log the setup attempt
    await logAuditEvent({
      userId: user.id,
      action: '2FA_ENABLED',
      resource: 'security',
      details: { step: 'setup_initiated' },
      ipAddress: getClientIp(),
      userAgent: request.headers.get('user-agent') || undefined,
      success: true
    });
    
    return NextResponse.json({
      qrCode,
      secret,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }
    
    // Get user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('auth-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const username = 'admin';
    
    // Get user with secret
    const user = await prisma.userSecurity.findUnique({
      where: { username }
    });
    
    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ 
        error: '2FA setup not initiated' 
      }, { status: 400 });
    }
    
    // Verify the token
    const { verifyToken } = await import('@/lib/security/two-factor');
    const isValid = verifyToken(token, user.twoFactorSecret);
    
    if (!isValid) {
      await logAuditEvent({
        userId: user.id,
        action: '2FA_FAILED',
        resource: 'security',
        details: { step: 'setup_verification' },
        ipAddress: getClientIp(),
        userAgent: request.headers.get('user-agent') || undefined,
        success: false
      });
      
      return NextResponse.json({ 
        error: 'Invalid token' 
      }, { status: 400 });
    }
    
    // Enable 2FA
    await prisma.userSecurity.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: true
      }
    });
    
    // Log successful enablement
    await logAuditEvent({
      userId: user.id,
      action: '2FA_ENABLED',
      resource: 'security',
      details: { step: 'setup_completed' },
      ipAddress: getClientIp(),
      userAgent: request.headers.get('user-agent') || undefined,
      success: true
    });
    
    return NextResponse.json({ 
      success: true,
      message: '2FA has been enabled successfully' 
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA token' },
      { status: 500 }
    );
  }
}
