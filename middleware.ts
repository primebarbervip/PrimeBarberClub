import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const role = request.cookies.get('user_role')?.value;
  const mantenimiento = request.cookies.get('mantenimiento_activo')?.value === 'true';
  const { pathname } = request.nextUrl;

  // 0. MODO MANTENIMIENTO
  // Eximir a admins y barberos, y rutas esenciales (login, api, estáticos, la propia página de mantenimiento)
  const isPublicAsset = pathname.includes('.') || pathname.startsWith('/_next') || pathname.startsWith('/api');
  const isExemptPath = pathname === '/login' || pathname === '/mantenimiento' || pathname.startsWith('/admin') || pathname.startsWith('/barbero');
  const isAuthOrStaff = role === 'admin' || role === 'barbero';

  if (mantenimiento && !isAuthOrStaff && !isExemptPath && !isPublicAsset) {
    return NextResponse.redirect(new URL('/mantenimiento', request.url));
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