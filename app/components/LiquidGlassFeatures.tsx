"use client";

import { motion } from "framer-motion";
import { Clock, MapPin, Phone, Instagram } from "lucide-react";

const features = [
  {
    icon: Clock,
    title: "Horario Flexible",
    description: "Lunes a Sábado, adaptado a tu agenda",
  },
  {
    icon: MapPin,
    title: "Ubicación Premium",
    description: "En el corazón de la ciudad, fácil acceso",
  },
  {
    icon: Phone,
    title: "Reserva Online",
    description: "Agenda tu cita en segundos desde tu móvil",
  },
  {
    icon: Instagram,
    title: "Comunidad VIP",
    description: "Únete a nuestra comunidad exclusiva",
  },
];

export default function LiquidGlassFeatures() {
  return (
    <section className="relative py-28 px-6 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0f0f0f] to-[#0a0a0a]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#c9a96e]/5 blur-[120px]" />

      <div className="max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-20"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#c9a96e] mb-4 block">
            La Experiencia
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extralight tracking-[0.15em] -mr-[0.15em] text-white text-balance">
            Más que un Corte
          </h2>
        </motion.div>

        {/* Features Grid - Liquid Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.7,
                  delay: i * 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group relative rounded-3xl overflow-hidden"
              >
                {/* Glass background */}
                <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-3xl transition-all duration-500 group-hover:bg-white/[0.06] group-hover:border-white/[0.1]" />
                {/* Top reflection line */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative p-8 flex items-start gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#c9a96e]/5 border border-[#c9a96e]/10 flex items-center justify-center shrink-0 group-hover:bg-[#c9a96e]/10 transition-colors duration-500">
                    <Icon className="w-5 h-5 text-[#c9a96e]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white mb-1.5 tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-white/35 text-[13px] leading-relaxed">
                      {feature.description}
                    </p>
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
