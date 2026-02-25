"use client";

import Link from "next/link";
import { Instagram, MapPin } from "lucide-react";

export default function LiquidGlassFooter() {
  return (
    <footer className="relative border-t border-white/[0.06] px-6 py-12 bg-[#0a0a0a]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-extralight tracking-[0.3em] -mr-[0.3em] text-white mb-2">
              PRIME
            </h3>
            <p className="text-white/25 text-[11px] uppercase tracking-[0.3em] font-bold">
              Barber Club
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/login"
              className="text-white/40 text-[11px] uppercase tracking-[0.2em] font-bold hover:text-white transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/registro"
              className="text-white/40 text-[11px] uppercase tracking-[0.2em] font-bold hover:text-white transition-colors"
            >
              Registro
            </Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              <Instagram className="w-4 h-4 text-white/50" />
            </a>
            <a
              href="#"
              aria-label="Ubicación"
              className="w-10 h-10 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
              <MapPin className="w-4 h-4 text-white/50" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/[0.04] text-center">
          <p className="text-white/20 text-[11px] tracking-wider">
            {'© 2026 Prime Barber Club. Todos los derechos reservados.'}
          </p>
        </div>
      </div>
    </footer>
  );
}
