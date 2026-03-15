'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useRouter } from 'nextjs-toploader/app';
import { useAppSelector } from '@/lib/store/hooks';
import { Loader2 } from 'lucide-react';

// ── Route definitions ─────────────────────────────────────────────────────────

/** Routes that require the user to be authenticated */
const AUTH_ROUTES = ['/dashboard', '/campaigns/create', '/profile', '/kyc'];

/** Routes that require the `admin` role */
const ADMIN_ROUTES = ['/admin'];

/** Routes that should redirect to dashboard if already logged in */
const GUEST_ONLY_ROUTES = ['/login', '/register'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function matchRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

// ── Component ─────────────────────────────────────────────────────────────────

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isAuthenticated, user]);

  function check() {
    // 1. Guest-only pages → redirect to dashboard if already logged in
    if (matchRoute(pathname, GUEST_ONLY_ROUTES)) {
      if (isAuthenticated) {
        router.replace('/dashboard');
        return;
      }
      setAuthorized(true);
      return;
    }

    // 2. Admin pages → require auth + admin role
    if (matchRoute(pathname, ADMIN_ROUTES)) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      if (user?.role !== 'admin') {
        router.replace('/dashboard');
        return;
      }
      setAuthorized(true);
      return;
    }

    // 3. Auth-required pages → require auth
    if (matchRoute(pathname, AUTH_ROUTES)) {
      if (!isAuthenticated) {
        router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      setAuthorized(true);
      return;
    }

    // 4. Public pages → always allowed
    setAuthorized(true);
  }

  // Show loading spinner while checking & redirecting
  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
          <p className="text-sm text-black/40">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
