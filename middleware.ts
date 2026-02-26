import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('user_role')?.value;
  const mantenimiento = request.cookies.get('mantenimiento_activo')?.value === 'true';
  const { pathname } = request.nextUrl;

  // 0. MODO MANTENIMIENTO
  const isPublicAsset = pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/api');
  const isAuthOrStaff = role === 'admin' || role === 'barbero';

  if (mantenimiento && !isPublicAsset) {
    if (isAuthOrStaff) {
      // Admins and barberos can bypass maintenance.
      // If they go to /mantenimiento, redirect them to home.
      if (pathname === '/mantenimiento') {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } else if (role === 'cliente') {
      // Clientes only have access to /mantenimiento and /login (to logout)
      const isExemptClientePath = pathname === '/mantenimiento' || pathname === '/login';
      if (!isExemptClientePath) {
        return NextResponse.redirect(new URL('/mantenimiento', request.url));
      }
    } else {
      // Not logged in. They should only have access to login and registro.
      const isExemptGuestPath = pathname === '/login' || pathname === '/registro';
      if (!isExemptGuestPath) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    }
  }

  // Si no hay mantenimiento y el usuario está en la página de mantenimiento, mandarlo a la raíz
  if (!mantenimiento && pathname === '/mantenimiento') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 1. REGLA DE ORO: Si está en la raíz (/) y es Barbero o Admin, lo mandamos a su panel
  if (pathname === '/') {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'barbero') return NextResponse.redirect(new URL('/barbero', request.url));
  }

  // 2. Proteger rutas de ADMIN
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Proteger rutas de BARBERO
  if (pathname.startsWith('/barbero')) {
    if (role !== 'barbero') return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. Proteger ruta de RESERVAR (Solo logueados - Clientes)
  if (pathname.startsWith('/reservar')) {
    if (!role) return NextResponse.redirect(new URL('/login', request.url));
  }

  // 5. Si ya está logueado e intenta ir a login o registro, lo mandamos a su lugar
  if ((pathname === '/login' || pathname === '/registro') && role) {
    if (role === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    if (role === 'barbero') return NextResponse.redirect(new URL('/barbero', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/', // Ahora vigilamos también la raíz
    '/admin/:path*',
    '/barbero/:path*',
    '/reservar/:path*',
    '/login',
    '/registro'
  ],
};