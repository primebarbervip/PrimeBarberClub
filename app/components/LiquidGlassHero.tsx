"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { User } from "lucide-react";

interface LiquidGlassHeroProps {
  onReservar: () => void;
  userName: string | null;
  userImg: string | null;
  onSidebarOpen: () => void;
}

export default function LiquidGlassHero({
  onReservar,
  userName,
  userImg,
  onSidebarOpen,
}: LiquidGlassHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-barbershop.jpg"
          alt="Interior de barbería premium"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0a0a]/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a]/90" />
      </div>

      {/* Liquid Glass Orbs - decorative */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-accent/5 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-accent/[0.08] blur-[100px] animate-pulse" />

      {/* Login / Profile Circle - top right */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-6 right-6 z-20"
      >
        {userName ? (
          <button
            onClick={onSidebarOpen}
            className="group relative"
            aria-label="Abrir menú de usuario"
          >
            {/* Glow ring on hover */}
            <div className="absolute -inset-3 rounded-full bg-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Glass circle */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-xl group-hover:border-accent/40 transition-all duration-300 flex items-center justify-center shadow-2xl shadow-black/30">
              {/* Reflection */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              {userImg ? (
                <img
                  src={userImg}
                  alt={userName}
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                <span className="text-lg font-bold text-foreground relative z-10">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
          </button>
        ) : (
          <Link
            href="/login"
            className="group relative block"
            aria-label="Iniciar sesión"
          >
            {/* Glow ring on hover */}
            <div className="absolute -inset-3 rounded-full bg-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            {/* Glass circle */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-xl group-hover:border-accent/40 transition-all duration-300 flex items-center justify-center shadow-2xl shadow-black/30">
              {/* Reflection */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
              <User className="w-5 h-5 text-white/70 group-hover:text-accent transition-colors duration-300 relative z-10" />
            </div>
          </Link>
        )}
      </motion.div>

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Glass Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-xl mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
              Prime Barber Club
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.2,
            delay: 0.15,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="text-6xl md:text-8xl lg:text-9xl font-extralight tracking-[0.3em] -mr-[0.3em] text-foreground mb-6 text-balance"
        >
          PRIME
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-accent tracking-[0.5em] -mr-[0.5em] text-[10px] md:text-[12px] uppercase mb-4 font-bold">
            Barber Club
          </p>
          <p className="text-white/40 text-sm md:text-base font-light max-w-md mx-auto leading-relaxed mb-12">
            Donde el arte del corte se encuentra con la elegancia atemporal
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Primary CTA - Liquid Glass Button */}
          <button
            onClick={onReservar}
            className="group relative px-12 py-5 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Glass background */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl" />
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {/* Inner glow */}
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />
            <span className="relative text-[11px] font-bold uppercase tracking-[0.3em] text-foreground">
              Reservar Cita
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
