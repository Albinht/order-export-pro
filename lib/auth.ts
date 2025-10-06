import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '1n$$2O%n2$f2';
const SESSION_COOKIE_NAME = 'auth-session';

export async function verifyAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(SESSION_COOKIE_NAME);
  return session?.value === 'authenticated';
}

export async function login(username: string, password: string): Promise<boolean> {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });
    return true;
  }
  return false;
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
