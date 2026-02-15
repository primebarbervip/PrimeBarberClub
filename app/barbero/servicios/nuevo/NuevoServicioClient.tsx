"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Scissors, Package, Info, Plus, Check } from "lucide-react";
import { guardarServicio } from "../../../actions";

export default function NuevoServicioClient({
    barberoId,
    serviciosExistentes = []
}: {
    barberoId: number;
    serviciosExistentes?: { id: number; nombre: string; precio: any; duracion: number }[]
}) {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Estado para controlar el modo (Individual vs Combo)
    const [isCombo, setIsCombo] = useState(searchParams.get("tipo") === "combo");

    // Si cambia la url, actualizamos (opcional, pero buena práctica)
    useEffect(() => {
        setIsCombo(searchParams.get("tipo") === "combo");
    }, [searchParams]);

    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false); // Added loading state

    // Estado para servicios seleccionados en el combo
    const [selectedServices, setSelectedServices] = useState<number[]>([]);

    const toggleService = (id: number) => {
        setSelectedServices(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const toggleMode = () => {
        setIsCombo(!isCombo);
        // Opcional: limpiar selección al cambiar?
        // if (isCombo) setSelectedServices([]); 
    };

    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
            {/* Header */}
            <header className="border-b border-white/5 bg-black/60 backdrop-blur-2xl sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <button
                            onClick={() => router.back()}
                            className="group p-2.5 bg-zinc-900/50 hover:bg-white hover:text-black rounded-full transition-all duration-300 border border-white/5"
                        >
                            <ArrowLeft size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-white uppercase italic">
                                {isCombo ? "Nuevo Combo" : "Nuevo Servicio"}
                            </h1>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-0.5">
                                Panel de Creación Profesional
                            </p>
                        </div>
                    </div>

                    {/* MODE TOGGLE */}
                    <button
                        onClick={toggleMode}
                        type="button"
                        className={`hidden md:flex items-center gap-3 px-5 py-3 border rounded-full transition-all duration-300 cursor-pointer ${isCombo
                            ? "bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/20"
                            : "bg-zinc-900/30 border-white/5 hover:border-white/10"
                            }`}
                    >
                        <div className={`w-2 h-2 rounded-full transition-all duration-300 ${isCombo
                            ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                            : 'bg-green-500 shadow-[0_0_10px_#22c55e]'
                            }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${isCombo ? "text-amber-500" : "text-zinc-400"
                            }`}>
                            {isCombo ? 'Modo Combo' : 'Modo Individual'}
                        </span>
                        <div className="ml-2 px-2 py-0.5 bg-white/5 rounded text-[8px] text-zinc-500 font-bold uppercase">
                            Clic para cambiar
                        </div>
                    </button>
                </div>
            </header>

            {/* Main Form */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <form
                    action={async (formData) => {
                        setSaving(true);
                        try {
                            formData.append("barberoId", barberoId.toString());
                            // IMPORTANTE: El backend espera 'categoria' para definir si es combo
                            formData.append("categoria", isCombo ? "combo" : "servicio");

                            // Enviamos los IDs de los servicios seleccionados (ya sea para Combo o Compatibles)
                            if (selectedServices.length > 0) {
                                formData.append("serviciosIds", selectedServices.join(","));
                            }

                            await guardarServicio(formData);
                            router.push("/barbero");
                            router.refresh();
                        } catch (error) {
                            console.error(error);
                            alert("Error al guardar");
                        } finally {
                            setSaving(false);
                        }
                    }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-10"
                >
                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-8 space-y-10">
                        {/* Section 1: Core Details */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-1 h-4 bg-white rounded-full" />
                                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">Detalles del Servicio</h2>
                            </div>

                            {/* Nombre */}
                            <div className="group space-y-3">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1 group-focus-within:text-white transition-colors">
                                    Nombre Público
                                </label>
                                <div className="relative">
                                    <input
                                        name="nombre"
                                        required
                                        className="w-full bg-zinc-900/50 border border-white/10 hover:border-white/20 px-6 py-5 rounded-2xl outline-none focus:border-white/40 focus:bg-zinc-900 text-lg font-bold text-white transition-all placeholder:text-zinc-700 placeholder:font-normal"
                                    />
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-800">
                                        {isCombo ? <Package size={20} /> : <Scissors size={20} />}
                                    </div>
                                    <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                                        {selectedServices.length} Seleccionados
                                    </span>
                                </div>

                                {serviciosExistentes.length === 0 ? (
                                    <p className="text-sm text-zinc-500 italic">No tienes otros servicios disponibles.</p>
                                ) : (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {serviciosExistentes.map((servicio) => {
                                            const isSelected = selectedServices.includes(servicio.id);
                                            return (
                                                <div
                                                    key={servicio.id}
                                                    onClick={() => toggleService(servicio.id)}
                                                    className={`cursor-pointer group flex items-center justify-between p-3 rounded-2xl border transition-all duration-200 ${isSelected
                                                        ? (isCombo ? "bg-amber-500/10 border-amber-500/50" : "bg-blue-500/10 border-blue-500/50")
                                                        : "bg-zinc-900/30 border-white/5 hover:border-white/10 hover:bg-white/5"
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shrink-0 ${isSelected
                                                            ? (isCombo ? "bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]" : "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]")
                                                            : "bg-zinc-800 text-zinc-500 group-hover:bg-zinc-700 group-hover:text-zinc-300"
                                                            }`}>
                                                            <Scissors size={18} strokeWidth={2.5} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-bold truncate transition-colors ${isSelected ? (isCombo ? "text-amber-400" : "text-blue-400") : "text-zinc-300 group-hover:text-white"}`}>
                                                                {servicio.nombre}
                                                            </p>
                                                            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
                                                                {Number(servicio.precio)} BOB · {servicio.duracion} min
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${isSelected
                                                            ? (isCombo ? "bg-amber-500 text-black rotate-0 scale-100" : "bg-blue-500 text-white rotate-0 scale-100")
                                                            : "bg-white/5 text-zinc-500 group-hover:bg-white group-hover:text-black scale-90 group-hover:scale-100"
                                                            }`}
                                                    >
                                                        {isSelected ? <Check size={16} strokeWidth={3} /> : <Plus size={16} strokeWidth={3} />}
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Grid: Moneda y Tiempo */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                        Precio del Servicio (BOB)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">$</span>
                                        <input
                                            name="precio"
                                            type="text"
                                            inputMode="decimal"
                                            onInput={(e) => {
                                                const target = e.target as HTMLInputElement;
                                                target.value = target.value.replace(/[^0-9.]/g, '');
                                                if ((target.value.match(/\./g) || []).length > 1) {
                                                    target.value = target.value.replace(/\.$/, '');
                                                }
                                            }}
                                            required
                                            // Sugerir precio si es combo (suma de seleccionados)
                                            defaultValue={isCombo && selectedServices.length > 0
                                                ? serviciosExistentes
                                                    .filter(s => selectedServices.includes(s.id))
                                                    .reduce((acc, curr) => acc + Number(curr.precio), 0)
                                                : undefined
                                            }
                                            key={`precio-${selectedServices.length}`} // Forzar re-render para actualizar default value al cambiar selección
                                            className="w-full bg-zinc-900/50 border border-white/10 px-10 py-5 rounded-2xl outline-none focus:border-white/40 text-lg font-black text-white transition-all"
                                        />
                                    </div>
                                    {isCombo && selectedServices.length > 0 && (
                                        <p className="text-[10px] text-zinc-500 ml-2">
                                            Sugerido: {serviciosExistentes
                                                .filter(s => selectedServices.includes(s.id))
                                                .reduce((acc, curr) => acc + Number(curr.precio), 0)} BOB
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                        Duración Estimada (Min)
                                    </label>
                                    <div className="relative">
                                        <input
                                            name="duracion"
                                            type="text"
                                            inputMode="numeric"
                                            onInput={(e) => {
                                                const target = e.target as HTMLInputElement;
                                                target.value = target.value.replace(/[^0-9]/g, '');
                                            }}
                                            required
                                            // Sugerir duración si es combo
                                            defaultValue={isCombo && selectedServices.length > 0
                                                ? serviciosExistentes
                                                    .filter(s => selectedServices.includes(s.id))
                                                    .reduce((acc, curr) => acc + curr.duracion, 0)
                                                : undefined
                                            }
                                            key={`duracion-${selectedServices.length}`}
                                            className="w-full bg-zinc-900/50 border border-white/10 px-6 py-5 rounded-2xl outline-none focus:border-white/40 text-lg font-black text-white transition-all"
                                        />
                                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 text-[10px] font-black uppercase">Minutos</span>
                                    </div>
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                                    Descripción del Servicio
                                </label>
                                <textarea
                                    name="descripcion"
                                    defaultValue={isCombo && selectedServices.length > 0
                                        ? `Incluye: ${serviciosExistentes
                                            .filter(s => selectedServices.includes(s.id))
                                            .map(s => s.nombre)
                                            .join(" + ")}`
                                        : ""}
                                    key={`desc-${selectedServices.length}`}
                                    rows={6}
                                    className="w-full bg-zinc-900/50 border border-white/10 px-6 py-5 rounded-3xl outline-none focus:border-white/40 text-base font-medium text-zinc-300 leading-relaxed transition-all placeholder:text-zinc-700"
                                />
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar Actions/Status */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-32 space-y-6">
                            <div className="p-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] space-y-8 backdrop-blur-sm">
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-white">Resumen de Publicación</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Estado</span>
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Activo</span>
                                        </div>
                                        {selectedServices.length > 0 && (
                                            <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase">{isCombo ? "Items" : "Adicionales"}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isCombo ? "text-amber-500" : "text-blue-500"}`}>
                                                    {selectedServices.length} {isCombo ? "Servicios" : "Compatibles"}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center py-2 border-b border-white/5">
                                            <span className="text-[10px] font-bold text-zinc-500 uppercase">Visibilidad</span>
                                            <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Todo Público</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full group bg-white hover:bg-zinc-200 text-black py-6 rounded-[2rem] flex items-center justify-center gap-3 transition-all duration-300 shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Save size={22} />
                                            </motion.div>
                                        ) : (
                                            <Save size={22} className="group-hover:translate-y-[-2px] transition-transform" />
                                        )}
                                        <span className="text-xs font-black uppercase tracking-[0.2em]">
                                            {saving ? "Procesando..." : "Publicar Ahora"}
                                        </span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="w-full bg-transparent border border-white/5 hover:border-white/10 text-zinc-500 hover:text-white py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                                    >
                                        Descartar Cambios
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}

