"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Clock, Coffee, Save, ArrowLeft, CheckCircle2,
    Loader2, Info, Calendar as CalendarIcon,
    Ban, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { actualizarHorario } from "../../actions";

// CUSTOM TIME SELECTOR FOR A PREMIUM LOOK
function TimeSelector({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const safeValue = (value && value.includes(':')) ? value : "00:00";
    const [h] = safeValue.split(':');

    return (
        <div className="flex flex-col gap-1.5 flex-1 relative">
            <span className="text-[7px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1">{label}</span>

            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-800 p-3 rounded-2xl border border-white/5 transition-all group"
            >
                <span className="text-lg font-black text-white tabular-nums tracking-tighter">
                    {h}<span className="text-zinc-500">:00</span>
                </span>
                <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-50 md:absolute md:inset-auto md:w-full"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl z-[60] overflow-hidden max-h-[240px] flex flex-col"
                        >
                            <div className="p-2 overflow-y-auto custom-scrollbar-hidden grid grid-cols-3 gap-1">
                                {hours.map(hr => (
                                    <button
                                        key={hr}
                                        type="button"
                                        onClick={() => {
                                            onChange(`${hr}:00`);
                                            setIsOpen(false);
                                        }}
                                        className={`py-3 rounded-xl text-xs font-black transition-all ${hr === h
                                            ? "bg-white text-black"
                                            : "text-zinc-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        {hr}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function CalendarioClient({ barbero }: { barbero: any }) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // 1. GENERAR DÍAS (Siguiente 60 días - DOMINGO INCLUIDO)
    const days = useMemo(() => {
        const list = [];
        const diasSemana = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
        for (let i = 0; i < 60; i++) {
            const d = new Date();
            d.setDate(d.getDate() + i);
            list.push({
                full: d,
                iso: d.toISOString().split('T')[0],
                diaNum: d.getDate(),
                diaNombre: diasSemana[d.getDay()]
            });
        }
        return list;
    }, []);

    // 2. BUSCAR INFO PARA EL DÍA SELECCIONADO
    const isoSelected = selectedDate.toISOString().split('T')[0];
    const fechaDoc = selectedDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    const especial = barbero.horariosEspeciales?.find((h: any) => h.fecha === isoSelected);

    // 2.5 FILTRAR CITAS PARA EL DÍA SELECCIONADO
    const citasHoy = useMemo(() => {
        return barbero.citas?.filter((c: any) => {
            const citaFechaStr = new Date(c.fecha).toISOString().split('T')[0];
            return citaFechaStr === isoSelected && c.estado !== "cancelada";
        }) || [];
    }, [barbero.citas, isoSelected]);

    // 3. ESTADO LOCAL DEL FORMULARIO
    const [form, setForm] = useState<{
        inicioJornada: string;
        finJornada: string;
        inicioAlmuerzo: string;
        finAlmuerzo: string;
        cerrado: boolean;
        almuerzoActivo: boolean;
        bloqueos: string[];
        habilitados: string[];
    }>({
        inicioJornada: "",
        finJornada: "",
        inicioAlmuerzo: "",
        finAlmuerzo: "",
        cerrado: false,
        almuerzoActivo: true,
        bloqueos: [],
        habilitados: []
    });

    // Sincronizar form cuando cambia la fecha o el barbero
    useEffect(() => {
        if (especial) {
            setForm({
                // Jornada: Siempre global (Barbero) según feedback del usuario
                inicioJornada: barbero.inicioJornada || "09:00",
                finJornada: barbero.finJornada || "21:00",
                // Almuerzo: Siempre global (Barbero)
                inicioAlmuerzo: barbero.inicioAlmuerzo || "",
                finAlmuerzo: barbero.finAlmuerzo || "",
                cerrado: especial.cerrado,
                almuerzoActivo: barbero.almuerzoActivo ?? true,
                bloqueos: especial.bloqueos || [],
                habilitados: especial.habilitados || []
            });
        } else {
            setForm({
                inicioJornada: barbero.inicioJornada || "09:00",
                finJornada: barbero.finJornada || "20:00",
                inicioAlmuerzo: barbero.inicioAlmuerzo || "13:00",
                finAlmuerzo: barbero.finAlmuerzo || "14:00",
                cerrado: false,
                almuerzoActivo: barbero.almuerzoActivo ?? true,
                bloqueos: [],
                habilitados: []
            });
        }
    }, [isoSelected, especial, barbero]);

    // GENERAR SLOTS PARA DESACTIVAR (now only full hours)
    const slots = useMemo(() => {
        if (!form.inicioJornada || !form.finJornada) return [];
        const list = [];
        const [hInicio, mInicio] = form.inicioJornada.split(':').map(Number);
        const [hFin, mFin] = form.finJornada.split(':').map(Number);

        const isToday = isoSelected === new Date().toISOString().split('T')[0];
        const currentHour = new Date().getHours();

        let current = new Date();
        current.setHours(hInicio, 0, 0, 0); // Start at full hour
        const end = new Date();
        end.setHours(hFin, 0, 0, 0); // End at full hour

        while (current < end) {
            const slotHour = current.getHours();
            // Si es hoy, solo mostramos lo que queda de jornada (hora actual en adelante)
            if (!isToday || slotHour >= currentHour) {
                list.push(current.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }));
            }
            current.setHours(current.getHours() + 1); // Increment by full hour
        }
        return list;
    }, [form.inicioJornada, form.finJornada, isoSelected]);

    const toggleSlot = (hora: string) => {
        const isLunch = form.almuerzoActivo && (form.inicioAlmuerzo && form.finAlmuerzo) &&
            (hora >= form.inicioAlmuerzo && hora < form.finAlmuerzo);

        if (!isLunch) {
            // Toggle binario: Libre <-> Bloqueado
            setForm(prev => ({
                ...prev,
                bloqueos: prev.bloqueos.includes(hora)
                    ? prev.bloqueos.filter(h => h !== hora)
                    : [...prev.bloqueos, hora]
            }));
        } else {
            // Toggle de 3 vías para Almuerzo:
            // 1. Break (Default/Amber) -> 2. Trabajar (White/Habilitado) -> 3. Bloqueado (Red/Bloqueado)
            setForm(prev => {
                const isHabilitado = prev.habilitados.includes(hora);
                const isBlocked = prev.bloqueos.includes(hora);

                if (!isHabilitado && !isBlocked) {
                    // De Break a Trabajar (Verde/Libre)
                    return { ...prev, habilitados: [...prev.habilitados, hora], bloqueos: prev.bloqueos.filter(h => h !== hora) };
                } else if (isHabilitado) {
                    // De Trabajar a Bloqueado (Rojo/Bloqueado)
                    return { ...prev, habilitados: prev.habilitados.filter(h => h !== hora), bloqueos: [...prev.bloqueos, hora] };
                } else {
                    // De Bloqueado vuelve a Break inicial (Amarillo/Bloqueado)
                    return { ...prev, bloqueos: prev.bloqueos.filter(h => h !== hora), habilitados: prev.habilitados.filter(h => h !== hora) };
                }
            });
        }
    };

    const handleGuardar = async () => {
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("barberoId", barbero.id.toString());
            formData.append("fecha", isoSelected);
            formData.append("inicioJornada", form.inicioJornada);
            formData.append("finJornada", form.finJornada);
            formData.append("inicioAlmuerzo", form.inicioAlmuerzo);
            formData.append("finAlmuerzo", form.finAlmuerzo);
            formData.append("cerrado", form.cerrado.toString());
            formData.append("almuerzoActivo", form.almuerzoActivo.toString());
            formData.append("bloqueos", form.bloqueos.join(","));
            formData.append("habilitados", form.habilitados.join(","));

            const res = await actualizarHorario(formData);
            if (res.success) {
                setShowToast(true);
                setTimeout(() => setShowToast(false), 3000);
                router.refresh();
            } else {
                console.error("❌ Error guardando horario:", res.error);
                alert(`Error: ${res.error || "No se pudo guardar"}`);
            }
        } catch (error) {
            console.error("❌ Error de comunicación:", error);
            alert("Error de conexión con el servidor");
        } finally {
            setSaving(false);
        }
    };

    const toggleAlmuerzoGlobal = () => {
        setForm(prev => ({ ...prev, almuerzoActivo: !prev.almuerzoActivo }));
    };

    const habilitarTodaLaJornadaHoy = () => {
        if (!form.inicioAlmuerzo || !form.finAlmuerzo) return;
        const lunchSlots = slots.filter(s => s >= form.inicioAlmuerzo && s < form.finAlmuerzo);
        setForm(prev => ({
            ...prev,
            habilitados: Array.from(new Set([...prev.habilitados, ...lunchSlots])),
            bloqueos: prev.bloqueos.filter(b => !lunchSlots.includes(b))
        }));
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans pb-32 overflow-x-hidden">
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] bg-white text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl flex items-center gap-2 whitespace-nowrap"
                    >
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        Cambios guardados con éxito
                    </motion.div>
                )}
            </AnimatePresence>

            <header className="bg-black sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-all"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl font-black uppercase italic tracking-tight">Calendarios</h1>
                            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none">Gestionar disponibilidad por día</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-10 md:pr-10 lg:pr-16">

                {/* SELECTOR DE DÍA (DISEÑO CÍRCULO + NÚMERO) */}
                <section className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500">Seleccionar Fecha</h2>
                        <span className="text-[8px] sm:text-[9px] font-bold text-zinc-600 uppercase">Próximos 60 días</span>
                    </div>

                    <div className="flex gap-3 sm:gap-4 overflow-x-auto py-6 -mx-4 px-6 sm:-mx-6 sm:px-8 custom-scrollbar-hidden" style={{ scrollSnapType: 'x mandatory' }}>
                        {days.map((d) => {
                            const isSelected = d.iso === isoSelected;
                            const hasEspecial = barbero.horariosEspeciales?.some((h: any) => h.fecha === d.iso);

                            return (
                                <button
                                    key={d.iso}
                                    onClick={() => setSelectedDate(d.full)}
                                    className="flex flex-col items-center gap-1.5 sm:gap-2 flex-shrink-0"
                                >
                                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-[14px] sm:text-[16px] font-bold transition-all ${isSelected
                                        ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-110"
                                        : "bg-zinc-900 text-zinc-500"
                                        }`}>
                                        {d.diaNum}
                                    </div>
                                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-tighter transition-colors ${isSelected ? "text-white" : "text-zinc-600"
                                        }`}>
                                        {d.diaNombre}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* INDICADOR DE DÍA SELECCIONADO */}
                <div className="py-4 sm:py-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-900 rounded-full flex items-center justify-center text-white flex-shrink-0">
                            <CalendarIcon size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[9px] sm:text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate">Edición disponible</p>
                            <p className="text-base sm:text-lg font-black uppercase italic truncate leading-tight">
                                {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setForm({ ...form, cerrado: !form.cerrado })}
                        className={`flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-widest flex-shrink-0 ${form.cerrado
                            ? "bg-red-500/10 text-red-500"
                            : "bg-zinc-900 text-zinc-400"
                            }`}
                    >
                        <Ban size={12} />
                        {form.cerrado ? "Cerrado" : "Abierto"}
                    </button>
                </div>

                <AnimatePresence mode="wait">
                    {!form.cerrado ? (
                        <motion.div
                            key="form-active"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid md:grid-cols-2 gap-8 sm:gap-12 items-start"
                        >
                            {/* COLUMNA IZQUIERDA: SLOTS */}
                            <section className="space-y-4 sm:space-y-6">
                                <div className="flex flex-row items-center justify-between gap-4 pb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1 h-5 bg-white rounded-full" />
                                        <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white">Bloquear Horas</h3>
                                    </div>
                                    <span className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-widest">Toca para desactivar</span>
                                </div>

                                <div className="rounded-[2.5rem] overflow-hidden bg-white/[0.01] border border-white/5">
                                    {slots.map((slotFullHour) => {
                                        const isManualBlocked = form.bloqueos.includes(slotFullHour);
                                        const isHabilitado = form.habilitados.includes(slotFullHour);
                                        const isLunchVisual = form.almuerzoActivo && (form.inicioAlmuerzo && form.finAlmuerzo) &&
                                            (slotFullHour >= form.inicioAlmuerzo && slotFullHour < form.finAlmuerzo);

                                        // Buscar si hay una cita en esta hora
                                        const citaExitente = citasHoy.find((c: any) => c.hora === slotFullHour);

                                        // Estado Efectivo
                                        const isCurrentlyBlocked = isManualBlocked || (isLunchVisual && !isHabilitado);
                                        const showAsLunch = isLunchVisual && !isHabilitado && !isManualBlocked;

                                        if (citaExitente) {
                                            return (
                                                <div
                                                    key={slotFullHour}
                                                    className="w-full flex items-center justify-between px-6 sm:px-8 py-3.5 sm:py-5 border-b border-white/5 bg-emerald-500/5"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg sm:text-xl font-black text-emerald-500 tracking-tighter tabular-nums">{slotFullHour}</span>
                                                        <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Reservado</span>
                                                            <span className="text-[9px] font-bold text-zinc-400 truncate max-w-[120px]">
                                                                {citaExitente.cliente?.nombre || "Cita"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    </div>
                                                </div>
                                            );
                                        }

                                        return (
                                            <button
                                                key={slotFullHour}
                                                type="button"
                                                onClick={() => toggleSlot(slotFullHour)}
                                                className={`w-full flex items-center justify-between px-6 sm:px-8 py-3.5 sm:py-5 font-black transition-all border-b border-white/5 last:border-0 ${isManualBlocked
                                                    ? "bg-red-500 text-white"
                                                    : showAsLunch
                                                        ? "bg-zinc-900/40 text-amber-500 hover:bg-zinc-800"
                                                        : "bg-transparent text-white hover:bg-zinc-900"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg sm:text-xl tracking-tighter tabular-nums">{slotFullHour}</span>
                                                    {isLunchVisual && !isManualBlocked && !isHabilitado && (
                                                        <span className="text-[8px] font-bold uppercase tracking-widest bg-amber-500/10 px-2 py-0.5 rounded-full">Break</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <span className={`text-[9px] uppercase tracking-[0.2em] font-black ${isManualBlocked ? "text-red-100" : showAsLunch ? "text-amber-500/40" : "text-zinc-600"
                                                        }`}>
                                                        {isCurrentlyBlocked ? "Bloqueado" : "Libre"}
                                                    </span>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${isManualBlocked ? "bg-white" : showAsLunch ? "bg-amber-50" : "bg-emerald-500"
                                                        }`} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* COLUMNA DERECHA: CONFIGURACIÓN */}
                            <div className="space-y-8 sm:space-y-12">
                                {/* 2. ALMUERZO */}
                                <section className="space-y-4">
                                    <div className="flex items-center gap-2 pb-1 px-1">
                                        <div className="w-1 h-4 bg-amber-500 rounded-full" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">Ajuste de Almuerzo</h3>
                                    </div>
                                    <div className="bg-white/[0.01] p-6 rounded-[2.5rem] flex flex-col gap-8 border border-white/5">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col gap-0.5">
                                                <p className="text-[11px] text-white font-black uppercase tracking-widest italic text-amber-500">Break de Almuerzo</p>
                                                <p className="text-[9px] text-zinc-500 font-medium tracking-tighter uppercase">Activo en todos los días</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={toggleAlmuerzoGlobal}
                                                className={`w-12 h-6 rounded-full relative transition-all duration-500 overflow-hidden ${form.almuerzoActivo ? "bg-amber-500" : "bg-zinc-800"}`}
                                            >
                                                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-500 ${form.almuerzoActivo ? "translate-x-6" : "translate-x-0"}`} />
                                            </button>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] mb-1">Ajustes para {fechaDoc}</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={habilitarTodaLaJornadaHoy}
                                                    className="py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[8px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all"
                                                >
                                                    Trabajar en Break (Solo Hoy)
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm(prev => ({ ...prev, habilitados: [], bloqueos: [] }))}
                                                    className="py-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-zinc-500 text-[8px] font-black uppercase tracking-widest hover:border-zinc-500 transition-all"
                                                >
                                                    Limpiar cambios de hoy
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-6">
                                            <TimeSelector label="Desde" value={form.inicioAlmuerzo} onChange={(v) => setForm({ ...form, inicioAlmuerzo: v })} />
                                            <TimeSelector label="Hasta" value={form.finAlmuerzo} onChange={(v) => setForm({ ...form, finAlmuerzo: v })} />
                                        </div>
                                    </div>
                                </section>

                                {/* 3. JORNADA LABORAL */}
                                <section className="space-y-4 pb-24">
                                    <div className="flex items-center gap-2 pb-1 px-1">
                                        <div className="w-1 h-4 bg-zinc-600 rounded-full" />
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Horario de Servicio</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5">
                                            <TimeSelector label="Apertura" value={form.inicioJornada} onChange={(v) => setForm({ ...form, inicioJornada: v })} />
                                        </div>
                                        <div className="bg-white/[0.02] p-6 rounded-[2.5rem] border border-white/5">
                                            <TimeSelector label="Cierre" value={form.finJornada} onChange={(v) => setForm({ ...form, finJornada: v })} />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="closed-state"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-12 sm:py-24 flex flex-col items-center justify-center text-center space-y-6 bg-red-500/5 rounded-[2rem] sm:rounded-[3rem] px-6"
                        >
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                                <Ban size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight">Día no disponible</h3>
                                <p className="text-[10px] sm:text-sm text-zinc-500 max-w-xs mx-auto leading-relaxed">Los clientes no podrán ver ningún turno disponible para esta fecha.</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* BOTÓN GUARDAR (STICKY AT BOTTOM) */}
                <div className="fixed bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-black via-black to-transparent z-40 md:pr-[18rem]">
                    <div className="max-w-6xl mx-auto flex justify-center sm:justify-end md:justify-center gap-4">
                        <button
                            onClick={handleGuardar}
                            disabled={saving}
                            className="flex-1 md:flex-none md:w-auto md:px-12 bg-white hover:bg-zinc-200 text-black font-black py-4 sm:py-5 md:py-4 rounded-2xl sm:rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em]">{saving ? "Guardando..." : "Guardar Cambios"}</span>
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
