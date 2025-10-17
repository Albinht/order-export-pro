import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getUsers } from '@/lib/simple-auth';

// Note: In production, credentials should be stored in a database
// This in-memory update will reset on deployment

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { currentPassword, newUsername, newPassword } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { error: 'Current password is required' },
        { status: 400 }
      );
    }

    const users = await getUsers();
    const adminUser = users.find(u => u.username === 'admin');
    
    if (!adminUser) {
      return NextResponse.json(
        { error: 'Admin user not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, adminUser.passwordHash);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 401 }
      );
    }

    // Update username if provided
    if (newUsername) {
      // Validate username (alphanumeric and underscore only)
      if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
        return NextResponse.json(
          { error: 'Username can only contain letters, numbers, and underscores' },
          { status: 400 }
        );
      }
      await prisma.user.updateMany({
        where: { username: adminUser.username },
        data: { username: newUsername },
      });
      adminUser.username = newUsername;
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Password must be at least 6 characters' },
          { status: 400 }
        );
      }
      
      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.updateMany({
        where: { username: adminUser.username },
        data: { passwordHash: hashedPassword },
      });
      adminUser.passwordHash = hashedPassword;
    }

    // Clear the session cookie to force re-login
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    // Log the update for debugging (in production, never log passwords!)
    console.log('Credentials updated:', {
      username: adminUser.username,
      passwordHash: adminUser.passwordHash
    });

    return NextResponse.json({ 
      success: true,
      message: 'Credentials updated successfully. Please login with your new credentials.',
      // In development, return the new credentials for testing
      debug: process.env.NODE_ENV === 'development' ? {
        username: adminUser.username,
        hint: 'Password has been updated'
      } : undefined
    });
  } catch (error) {
    console.error('Failed to update credentials:', error);
    return NextResponse.json(
      { error: 'Failed to update credentials' },
      { status: 500 }
    );
  }
}

// GET endpoint to check current username (for display purposes)
export async function GET() {
  const users = await getUsers();
  const adminUser = users.find(u => u.username === 'admin');
  
  return NextResponse.json({
    username: adminUser?.username || 'admin',
    // Never return the password hash
  });
}
