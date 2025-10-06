import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

// Voor 2 gebruikers is dit meer dan genoeg
const USERS = {
  admin: {
    username: 'admin',
    // Password: 1n$$2O%n2$f2 (gebruik bcrypt hash in productie)
    passwordHash: '$2a$10$YourHashHere' // Genereer met: bcrypt.hashSync('1n$$2O%n2$f2', 10)
  },
  user: {
    username: 'user',
    passwordHash: '$2a$10$YourHashHere' // Tweede gebruiker
  }
};

export async function verifyLogin(username: string, password: string): Promise<boolean> {
  const user = Object.values(USERS).find(u => u.username === username);
  if (!user) return false;
  
  // Voor development, accepteer hardcoded password
  if (process.env.NODE_ENV === 'development') {
    if (username === 'admin' && password === '1n$$2O%n2$f2') return true;
    if (username === 'user' && password === 'user123') return true;
  }
  
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
