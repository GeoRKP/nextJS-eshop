import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';

// Role alone is not enough: a banned or suspended admin kept full access until
// their JWT expired. The token carries both flags, refreshed from the DB by the
// jwt callback, so this costs no extra query.
function isBlocked(session: Session | null) {
  if (!session?.user) return true;
  if (session.user.isBanned) return true;

  const until = session.user.suspendedUntil;
  return Boolean(until && new Date(until) > new Date());
}

// For PAGE components — redirects unauthorized users to /unauthorized
export async function requireAdmin() {
  const session = await auth();

  if (session?.user?.role !== 'admin' || isBlocked(session)) {
    redirect('/unauthorized');
  }

  return session;
}

// For SERVER ACTIONS — throws Error caught by action try/catch as user-friendly message
export async function assertAdmin() {
  const session = await auth();

  if (session?.user?.role !== 'admin' || isBlocked(session)) {
    throw new Error('Unauthorized');
  }

  return session;
}

// For SERVER ACTIONS — returns the caller's own id, never a fallback.
// Passing an undefined id to a Prisma `where` silently drops the filter, so
// every action that acts "on the current user" must go through this.
export async function requireUserId() {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return session.user.id as string;
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
