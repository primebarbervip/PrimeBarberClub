"use client";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function LiquidGlassHero({ onReservar }: { onReservar: () => void }) {
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
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#c9a96e]/5 blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-[#c9a96e]/8 blur-[100px] animate-pulse delay-1000" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Glass Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#c9a96e]/20 bg-[#c9a96e]/5 backdrop-blur-xl mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#c9a96e] animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#c9a96e]">
              Experiencia Premium
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="text-6xl md:text-8xl lg:text-9xl font-extralight tracking-[0.3em] -mr-[0.3em] text-white mb-6 text-balance"
        >
          PRIME
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[#c9a96e] tracking-[0.5em] -mr-[0.5em] text-[10px] md:text-[12px] uppercase mb-4 font-bold">
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
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
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
            <span className="relative text-[11px] font-bold uppercase tracking-[0.3em] text-white">
              Reservar Cita
            </span>
          </button>

          {/* Secondary CTA */}
          <a
            href="#servicios"
            className="px-8 py-5 text-[11px] font-bold uppercase tracking-[0.3em] text-white/50 hover:text-white transition-colors"
          >
            Ver Servicios
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}
