"use client";

import { useState } from "react";
import {
    Settings,
    ShieldAlert,
    Database,
    Trash2,
    RefreshCcw,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Power,
    Globe,
    ImageIcon,
    Save,
    Link as LinkIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toggleMantenimiento, limpiarBaseDeDatos, guardarConfiguracion } from "../../actions";

interface AjustesClientProps {
    config: {
        webNombre?: string;
        webLogo?: string;
        nombreTienda: string;
        logo: string;
        enMantenimiento: boolean;
        direccion: string;
        googleMapsUrl: string;
        telefono: string;
    };
}

export default function AjustesClient({ config: initialConfig }: AjustesClientProps) {
    const [mantenimiento, setMantenimiento] = useState(initialConfig.enMantenimiento);
    const [loadingMantenimiento, setLoadingMantenimiento] = useState(false);

    const [loadingLimpieza, setLoadingLimpieza] = useState(false);
    const [showConfirmLimpieza, setShowConfirmLimpieza] = useState(false);

    // WEB IDENTITY (Pestaña navegador)
    const [savingWebIdentity, setSavingWebIdentity] = useState(false);
    const [webIdentity, setWebIdentity] = useState({
        webNombre: initialConfig.webNombre || "",
        webLogo: initialConfig.webLogo || ""
    });
    const [webLogoPreview, setWebLogoPreview] = useState<string | null>(null);
    const [webLogoFile, setWebLogoFile] = useState<File | null>(null);

    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    const handleToggleMantenimiento = async () => {
        setLoadingMantenimiento(true);
        const nuevoEstado = !mantenimiento;
        const res = await toggleMantenimiento(nuevoEstado);

        if (res.success) {
            setMantenimiento(nuevoEstado);
            showToast('success', `Modo mantenimiento ${nuevoEstado ? 'ACTIVADO' : 'DESACTIVADO'}`);
        } else {
            showToast('error', res.error || "Error al cambiar estado");
        }
        setLoadingMantenimiento(false);
    };

    const handleLimpiarBD = async () => {
        setLoadingLimpieza(true);
        const res = await limpiarBaseDeDatos();

        if (res.success) {
            showToast('success', "Base de datos limpiada correctamente");
            setShowConfirmLimpieza(false);
        } else {
            showToast('error', res.error || "Error al limpiar base de datos");
        }
        setLoadingLimpieza(false);
    };

    // Web Identity handlers
    const handleWebLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setWebLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setWebLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveWebIdentity = async () => {
        setSavingWebIdentity(true);
        const formData = new FormData();
        formData.append("webNombre", webIdentity.webNombre);
        formData.append("webLogo", webIdentity.webLogo);
        // Keep general info values unchanged using initialConfig
        formData.append("nombreTienda", initialConfig.nombreTienda || "");
        formData.append("logo", initialConfig.logo || "");
        formData.append("direccion", initialConfig.direccion || "");
        formData.append("googleMapsUrl", initialConfig.googleMapsUrl || "");
        formData.append("telefono", initialConfig.telefono || "");

        if (webLogoFile) {
            formData.append("webLogoFile", webLogoFile);
        }

        const result = await guardarConfiguracion(formData);
        if (result.success) {
            showToast('success', "Identidad web actualizada correctamente");
        } else {
            showToast('error', result.error || "Error al guardar");
        }
        setSavingWebIdentity(false);
    };



    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">

            {/* IDENTIDAD VISUAL (ESTA PESTAÑA) */}
            <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10">
                <div className="flex items-start gap-5 mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                        <Globe className="text-white" size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Identidad Web</h2>
                        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Nombre e Icono de la Pestaña</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1">Título de la Pestaña</label>
                            <input
                                type="text"
                                value={webIdentity.webNombre}
                                onChange={(e) => setWebIdentity({ ...webIdentity, webNombre: e.target.value })}
                                placeholder="Ej: BarberShop Prime"
                                className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/20 transition-all font-bold text-lg"
                            />
                            <p className="text-[10px] text-zinc-600 ml-1 italic">Este es el nombre que se ve arriba en la pestaña del navegador.</p>
                        </div>

                        <button
                            onClick={handleSaveWebIdentity}
                            disabled={savingWebIdentity}
                            className="flex items-center gap-3 bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 disabled:opacity-50"
                        >
                            {savingWebIdentity ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Actualizar Identidad Web
                        </button>
                    </div>

                    <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4">
                        <div className="relative group">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group-hover:border-white/20 transition-all duration-500">
                                {webLogoPreview || webIdentity.webLogo ? (
                                    <img src={webLogoPreview || webIdentity.webLogo} className="w-full h-full object-cover" alt="Web logo preview" />
                                ) : (
                                    <ImageIcon className="text-zinc-800" size={32} />
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-white flex items-center justify-center text-black shadow-xl cursor-pointer hover:scale-110 active:scale-90 transition-all">
                                <LinkIcon size={16} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleWebLogoChange} />
                            </label>
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Logo del Favicon</span>
                    </div>
                </div>
            </section>

            {/* MODO MANTENIMIENTO */}
            <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${mantenimiento ? 'bg-amber-500/10 border-amber-500/20' : 'bg-white/5 border-white/10'}`}>
                            <ShieldAlert className={mantenimiento ? 'text-amber-500' : 'text-zinc-400'} size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Modo Mantenimiento</h2>
                            <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Bloquea temporalmente el acceso a los clientes</p>
                            <p className="text-zinc-600 text-xs mt-3 leading-relaxed max-w-md">
                                Cuando está activado, los clientes verán una pantalla de mantenimiento y no podrán realizar reservas. Solo los administradores podrán ver el sitio.
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleToggleMantenimiento}
                        disabled={loadingMantenimiento}
                        className={`relative w-20 h-10 rounded-full transition-all duration-500 p-1 flex items-center ${mantenimiento ? 'bg-amber-500 shadow-lg shadow-amber-500/20' : 'bg-zinc-800'}`}
                    >
                        <motion.div
                            animate={{ x: mantenimiento ? 40 : 0 }}
                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black"
                        >
                            {loadingMantenimiento ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                        </motion.div>
                    </button>
                </div>
            </section>

            {/* LIMPIEZA DE DATOS */}
            <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10">
                <div className="flex items-start gap-5 mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                        <Database className="text-red-500" size={28} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Zona de Peligro</h2>
                        <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest mt-1">Limpieza y optimización de datos</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-8 bg-black/40 border border-white/5 rounded-3xl group transition-all hover:border-red-500/20">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Trash2 className="text-zinc-500" size={18} />
                                    <span className="text-sm font-black text-white uppercase tracking-widest">Reset Completo de Base de Datos</span>
                                </div>
                                <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
                                    Elimina TODOS los datos: usuarios (clientes, barberos, admin), citas, reservas y servicios. La configuración se mantiene intacta. ⚠️ Esta acción es irreversible.
                                </p>
                            </div>

                            {!showConfirmLimpieza ? (
                                <button
                                    onClick={() => setShowConfirmLimpieza(true)}
                                    className="px-8 py-4 bg-zinc-800 hover:bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                                >
                                    Limpiar Sistema
                                </button>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowConfirmLimpieza(false)}
                                        className="px-6 py-4 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleLimpiarBD}
                                        disabled={loadingLimpieza}
                                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 shadow-xl shadow-red-600/20"
                                    >
                                        {loadingLimpieza ? <Loader2 className="animate-spin" size={16} /> : <AlertTriangle size={16} />}
                                        Confirmar Borrado
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* SISTEMA INFO */}
            <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 md:p-10">
                <div className="flex items-center gap-4 mb-8">
                    <RefreshCcw className="text-zinc-600" size={20} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Información del Sistema</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-black/20 border border-white/5 rounded-2xl">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Versión del Core</p>
                        <p className="text-white font-bold tracking-tight text-xl">v2.1.0-prime</p>
                    </div>
                    <div className="p-6 bg-black/20 border border-white/5 rounded-2xl">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Estado Conexión</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <p className="text-white font-bold tracking-tight text-xl">Conectado</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* TOAST NOTIFICATION */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <div className={`px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 border backdrop-blur-3xl ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            <CheckCircle2 size={20} />
                            <span className="font-bold uppercase tracking-widest text-[11px]">{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
