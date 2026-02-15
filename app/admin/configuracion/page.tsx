"use client";

import { useState, useEffect } from "react";
import { MapPin, Link as LinkIcon, Save, Loader2, Store, Phone, Image as ImageIcon, Sparkles } from "lucide-react";
import { guardarConfiguracion, obtenerConfiguracion } from "../../actions";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminConfigPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState({
        nombreTienda: "",
        direccion: "",
        googleMapsUrl: "",
        telefono: "",
        logo: ""
    });
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const loadConfig = async () => {
            const data = await obtenerConfiguracion();
            if (data) {
                setConfig({
                    nombreTienda: data.nombreTienda || "",
                    direccion: data.direccion || "",
                    googleMapsUrl: data.googleMapsUrl || "",
                    telefono: data.telefono || "",
                    logo: data.logo || ""
                });
            }
            setLoading(false);
        };
        loadConfig();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        const formData = new FormData();
        formData.append("nombreTienda", config.nombreTienda);
        formData.append("direccion", config.direccion);
        formData.append("googleMapsUrl", config.googleMapsUrl);
        formData.append("telefono", config.telefono);
        formData.append("logo", config.logo);
        if (logoFile) {
            formData.append("logoFile", logoFile);
        }

        const result = await guardarConfiguracion(formData);

        if (result.success) {
            setMessage({ type: 'success', text: "Configuración guardada correctamente" });
            // Clear message after 3 seconds
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: 'error', text: result.error || "Error al guardar" });
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="animate-spin text-white/20" size={40} />
                <span className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Cargando Configuración</span>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto pb-32">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-1"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                            <Sparkles className="text-white" size={20} />
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">Información</h1>
                    </div>
                    <p className="text-zinc-500 font-medium tracking-tight ml-13">Ajustes globales de la marca y establecimiento.</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                >
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="group flex items-center gap-3 bg-white hover:bg-zinc-200 text-black px-8 py-4 rounded-3xl font-black uppercase tracking-widest text-[11px] transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-white/5"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} className="group-hover:rotate-12 transition-transform" />}
                        {saving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                </motion.div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* COLUMNA IZQUIERDA: LOGO Y BÁSICOS */}
                <div className="lg:col-span-4 space-y-8">
                    <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 flex flex-col items-center">
                        <div className="flex items-center gap-3 w-full mb-8">
                            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                <ImageIcon className="text-zinc-400" size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Logo del Negocio</span>
                        </div>

                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[3rem] bg-black/40 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden group-hover:border-white/20 transition-all duration-500">
                                {logoPreview || config.logo ? (
                                    <img src={logoPreview || config.logo} className="w-full h-full object-cover" alt="Logo preview" />
                                ) : (
                                    <ImageIcon className="text-zinc-800" size={48} />
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-black shadow-xl cursor-pointer hover:scale-110 active:scale-90 transition-all">
                                <LinkIcon size={20} />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>

                        <div className="w-full mt-10 space-y-4">
                            <p className="text-[10px] text-zinc-500 text-center font-medium leading-relaxed px-4">
                                Selecciona una imagen desde tu dispositivo para actualizar el logo de la barbería.
                            </p>
                        </div>
                    </section>
                </div>

                {/* COLUMNA DERECHA: INFO Y UBICACIÓN */}
                <div className="lg:col-span-8 space-y-8">
                    {/* BÁSICOS */}
                    <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <Store className="text-zinc-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-none tracking-tight">Información General</h2>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-black">Identidad de la Marca</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Nombre Público</label>
                                <input
                                    type="text"
                                    value={config.nombreTienda}
                                    onChange={(e) => setConfig({ ...config, nombreTienda: e.target.value })}
                                    placeholder="Ej: Barber Shop Prime"
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all font-bold text-lg tracking-tight"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1">Teléfono de Reservas</label>
                                <div className="relative">
                                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                    <input
                                        type="text"
                                        value={config.telefono}
                                        onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                                        placeholder="+591 ..."
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all font-bold text-lg tracking-tight"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* UBICACIÓN */}
                    <section className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 sm:p-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                                <MapPin className="text-zinc-400" size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-white leading-none tracking-tight">Localización</h2>
                                <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-black">Dirección Física</p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 block">Dirección Escrita</label>
                                <textarea
                                    rows={2}
                                    value={config.direccion}
                                    onChange={(e) => setConfig({ ...config, direccion: e.target.value })}
                                    placeholder="Av. Santos Dumont..."
                                    className="w-full bg-black/50 border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all font-medium resize-none leading-relaxed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-1 block">Enlace de Google Maps</label>
                                <div className="relative">
                                    <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                    <input
                                        type="text"
                                        value={config.googleMapsUrl}
                                        onChange={(e) => setConfig({ ...config, googleMapsUrl: e.target.value })}
                                        placeholder="https://maps.app.goo.gl/..."
                                        className="w-full bg-black/50 border border-white/5 rounded-2xl pl-14 pr-6 py-5 text-white text-sm focus:outline-none focus:border-white/20 transition-all font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`p-6 rounded-[2rem] font-bold text-sm flex items-center gap-4 border ${message.type === 'success'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                    {message.type === 'success' ? '✓' : '!'}
                                </div>
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </form>
        </div>
    );
}
