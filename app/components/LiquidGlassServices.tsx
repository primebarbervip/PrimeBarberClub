"use client";

import { motion } from "framer-motion";
import { Scissors, Sparkles, Crown } from "lucide-react";

const services = [
  {
    title: "Corte Premium",
    description: "Técnica de precisión personalizada para tu estilo único",
    image: "/images/service-cut.jpg",
    icon: Scissors,
  },
  {
    title: "Afeitado Clásico",
    description: "Ritual de afeitado con toalla caliente y navaja",
    image: "/images/service-shave.jpg",
    icon: Crown,
  },
  {
    title: "Barba & Estilo",
    description: "Diseño y perfilado de barba con acabado impecable",
    image: "/images/service-beard.jpg",
    icon: Sparkles,
  },
];

export default function LiquidGlassServices() {
  return (
    <section id="servicios" className="relative py-28 px-6 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#c9a96e]/5 blur-[150px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a96e] mb-4 block">
            Nuestros Servicios
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[0.15em] -mr-[0.15em] text-white text-balance">
            Arte & Precisión
          </h2>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.15,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative rounded-3xl overflow-hidden cursor-pointer"
              >
                {/* Card Background Image */}
                <div className="aspect-[3/4] relative">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                </div>

                {/* Liquid Glass Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="relative rounded-2xl overflow-hidden">
                    {/* Glass panel */}
                    <div className="absolute inset-0 bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] rounded-2xl" />
                    {/* Top edge highlight */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                    <div className="relative p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-xl bg-[#c9a96e]/10 border border-[#c9a96e]/20 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-[#c9a96e]" />
                        </div>
                        <h3 className="text-base font-bold text-white tracking-wide">
                          {service.title}
                        </h3>
                      </div>
                      <p className="text-white/40 text-[13px] leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
