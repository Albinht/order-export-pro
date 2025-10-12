import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// Hardcoded users - no database needed
const USERS = {
  admin: {
    username: 'admin',
    // Password: admin123
    passwordHash: '$2b$10$wIinAOSWCVQ6IQnHPNqryeK.eyksON6TAV4jkVlYU9qtOl0TkFj.W'
  },
  user: {
    username: 'user',
    // Password: user123
    passwordHash: '$2b$10$A./8BqW5aI8YAkIGTdjj7ursgPDbg3ECzmpWSVyUdUIGWVP3rK33y'
  }
};

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = Object.values(USERS).find(u => u.username === username);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Set auth cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return NextResponse.json({ 
      success: true,
      message: 'Login successful',
      username: user.username
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
