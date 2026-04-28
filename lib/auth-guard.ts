import { auth } from '@/auth';
import { redirect } from 'next/navigation';

// For PAGE components — redirects unauthorized users to /unauthorized
export async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return session;
}

// For SERVER ACTIONS — throws Error caught by action try/catch as user-friendly message
export async function assertAdmin() {
  const session = await auth();

  if (session?.user?.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  return session;
}

// For SERVER ACTIONS — verifies user owns the order (or is admin)
export async function assertOrderOwnership(orderUserId: string | null) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  if (session.user.role !== 'admin' && orderUserId !== session.user.id) {
    throw new Error('Unauthorized');
  }

  return session;
}
