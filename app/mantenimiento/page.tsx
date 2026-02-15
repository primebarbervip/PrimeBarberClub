"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Calendar, Clock, Scissors } from "lucide-react";

export default function MantenimientoPage() {
    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-white selection:text-black">
            {/* Fondo Decorativo */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-900/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-800/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 max-w-xl w-full text-center space-y-12"
            >
                {/* Icono de Estado */}
                <div className="flex justify-center">
                    <div className="relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.6, 0.3]
                            }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-white rounded-full blur-2xl"
                        />
                        <div className="relative w-24 h-24 bg-white rounded-full flex items-center justify-center text-black shadow-2xl">
                            <ShieldAlert size={40} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                {/* Texto Principal */}
                <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">
                        Mejorando la <span className="text-zinc-500">Experiencia</span>
                    </h1>
                    <p className="text-zinc-400 text-lg font-medium leading-relaxed max-w-md mx-auto">
                        Estamos realizando ajustes técnicos para brindarte un servicio de mayor nivel.
                    </p>
                </div>

                {/* Tarjeta de Información */}
                <div className="bg-zinc-900/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] space-y-6">
                    <div className="flex items-center gap-4 text-left border-b border-white/5 pb-6">
                        <div className="w-10 h-10 bg-white/5 rounded-2xl flex items-center justify-center shrink-0">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Aviso Importante</p>
                            <p className="text-sm font-bold text-white leading-tight">
                                Tus reservas confirmadas <span className="text-emerald-500">seguirán activas</span>.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl text-left space-y-1">
                            <Clock size={16} className="text-zinc-600 mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Apertura</p>
                            <p className="text-xs font-bold text-white">Muy Pronto</p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl text-left space-y-1">
                            <Scissors size={16} className="text-zinc-600 mb-2" />
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Servicios</p>
                            <p className="text-xs font-bold text-white">Listos</p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-8 border-t border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-700">
                        BarberShop Prime · Elite System
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
