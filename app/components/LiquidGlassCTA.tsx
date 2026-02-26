"use client";

import { motion } from "framer-motion";

export default function LiquidGlassCTA({ onReservar }: { onReservar: () => void }) {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[#0a0a0a]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#c9a96e]/8 blur-[150px]" />

      <div className="max-w-3xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-7xl font-extralight tracking-[0.15em] -mr-[0.15em] text-white mb-6 text-balance">
            Tu Estilo te Espera
          </h2>
          <p className="text-white/35 text-base md:text-lg max-w-md mx-auto leading-relaxed mb-12">
            Reserva tu cita y descubre por qué somos la barbería de referencia
          </p>

          {/* Liquid Glass CTA */}
          <button
            onClick={onReservar}
            className="group relative inline-flex items-center gap-3 px-14 py-6 rounded-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            {/* Glass background */}
            <div className="absolute inset-0 bg-[#c9a96e]/10 backdrop-blur-xl border border-[#c9a96e]/20 rounded-2xl transition-all duration-500 group-hover:bg-[#c9a96e]/20 group-hover:border-[#c9a96e]/30" />
            {/* Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#c9a96e]/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {/* Top highlight */}
            <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-[#c9a96e]/10 to-transparent" />

            <span className="relative text-[12px] font-bold uppercase tracking-[0.3em] text-[#c9a96e]">
              Reservar Ahora
            </span>
            <span className="relative text-[#c9a96e]/40">{"→"}</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
