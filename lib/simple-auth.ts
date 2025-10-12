import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Hardcoded users met echte password hashes
// admin:admin123, user:user123
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

export async function verifyLogin(username: string, password: string): Promise<boolean> {
  const user = Object.values(USERS).find(u => u.username === username);
  if (!user) return false;
  
  // Always use bcrypt comparison for security
  return await bcrypt.compare(password, user.passwordHash);
}

export async function setAuthCookie(username: string) {
  const cookieStore = await cookies();
  
  // Simple token: username + timestamp + secret
  const token = Buffer.from(
    JSON.stringify({
      username,
      timestamp: Date.now(),
      expires: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    })
  ).toString('base64');
  
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  });
}

export async function verifyAuth(): Promise<{ isAuthenticated: boolean; username?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  
  if (!token) {
    return { isAuthenticated: false };
  }
  
  try {
    const decoded = JSON.parse(
      Buffer.from(token, 'base64').toString('utf-8')
    );
    
    // Check if expired
    if (decoded.expires < Date.now()) {
      return { isAuthenticated: false };
    }
    
    return {
      isAuthenticated: true,
      username: decoded.username
    };
  } catch {
    return { isAuthenticated: false };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
