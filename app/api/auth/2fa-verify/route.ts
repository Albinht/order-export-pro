import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyToken, verifyBackupCode } from '@/lib/security/two-factor';
import { logAuditEvent } from '@/lib/security/audit-logger';
import { getClientIp } from '@/lib/security/ip-security';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { token, username, isBackupCode = false } = await request.json();
    
    if (!token || !username) {
      return NextResponse.json(
        { error: 'Token and username are required' },
        { status: 400 }
      );
    }
    
    // Get user
    const user = await prisma.userSecurity.findUnique({
      where: { username }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled for this account' },
        { status: 400 }
      );
    }
    
    let isValid = false;
    let remainingBackupCodes: string[] | undefined;
    
    if (isBackupCode) {
      // Verify backup code
      const backupCodes = user.backupCodes ? JSON.parse(user.backupCodes) : [];
      const result = await verifyBackupCode(token, backupCodes);
      
      isValid = result.valid;
      remainingBackupCodes = result.remainingCodes;
      
      if (isValid && remainingBackupCodes) {
        // Update remaining backup codes
        await prisma.userSecurity.update({
          where: { id: user.id },
          data: {
            backupCodes: JSON.stringify(remainingBackupCodes)
          }
        });
      }
    } else {
      // Verify TOTP token
      isValid = verifyToken(token, user.twoFactorSecret);
    }
    
    // Log the verification attempt
    await logAuditEvent({
      userId: user.id,
      action: isValid ? '2FA_VERIFIED' : '2FA_FAILED',
      resource: 'security',
      details: { 
        method: isBackupCode ? 'backup_code' : 'totp',
        remainingBackupCodes: remainingBackupCodes?.length
      },
      ipAddress: getClientIp(),
      userAgent: request.headers.get('user-agent') || undefined,
      success: isValid
    });
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Set 2FA verified cookie
    const cookieStore = await cookies();
    cookieStore.set('2fa-verified', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    });
    
    // Update last login
    await prisma.userSecurity.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date()
      }
    });
    
    return NextResponse.json({
      success: true,
      message: '2FA verification successful',
      remainingBackupCodes: remainingBackupCodes?.length
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify 2FA token' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('auth-token')?.value;
    
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const username = 'admin';
    
    // Get user
    const user = await prisma.userSecurity.findUnique({
      where: { username }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Disable 2FA
    await prisma.userSecurity.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
        backupCodes: null
      }
    });
    
    // Log the action
    await logAuditEvent({
      userId: user.id,
      action: '2FA_DISABLED',
      resource: 'security',
      ipAddress: getClientIp(),
      userAgent: request.headers.get('user-agent') || undefined,
      success: true
    });
    
    // Clear 2FA cookie
    (await cookies()).delete('2fa-verified');
    
    return NextResponse.json({
      success: true,
      message: '2FA has been disabled'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return NextResponse.json(
      { error: 'Failed to disable 2FA' },
      { status: 500 }
    );
  }
}
