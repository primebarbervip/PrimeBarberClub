"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, FileText, Save, Loader2, Camera, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { actualizarPerfil } from "../actions-user";

interface Usuario {
    id: string;
    nombre: string;
    email: string;
    telefono: string | null;
    bio: string | null;
    img: string | null;
}

// Modal Component defined locally for simplicity
// Modal Component
function ImageModal({ src, name, onClose, onChange, onDelete }: any) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={onClose}>
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full relative overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="aspect-square rounded-full overflow-hidden bg-zinc-950 mb-8 border-4 border-zinc-800 shadow-inner flex items-center justify-center">
                    {src ? (
                        <img src={src} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-6xl font-black text-white">{name?.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                <div className="space-y-3">
                    <label className="w-full bg-white text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 cursor-pointer active:scale-95 transition-all">
                        <Camera size={18} /> Cambiar Foto
                        <input type="file" accept="image/*" className="hidden" onChange={onChange} />
                    </label>

                    {src && (
                        <button
                            onClick={onDelete}
                            className="w-full bg-red-500/10 text-red-500 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-red-500/20"
                        >
                            <Trash2 size={18} /> Eliminar Foto
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full py-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-300 transition-colors"
                    >
                        Cancelar
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function ProfileClient({ usuario }: { usuario: Usuario }) {
    const [isLoading, setIsLoading] = useState(false);
    const [showImgModal, setShowImgModal] = useState(false);
    const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3000);
    };

    // Estado para la foto (preview)
    const [imgPreview, setImgPreview] = useState(usuario.img || "");
    const [phoneDigits, setPhoneDigits] = useState(() => {
        // Si ya tiene teléfono, intentamos quitarle el +591 si lo tiene
        const current = usuario.telefono || "";
        return current.replace("+591", "").trim();
    });

    const [formData, setFormData] = useState({
        nombre: usuario.nombre || "",
        bio: usuario.bio || "",
    });

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, ""); // Solo números
        if (val.length <= 8) {
            setPhoneDigits(val);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 1024 * 1024) { // 1MB limit
                showToast('error', "La imagen es muy pesada. Máximo 1MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImgPreview(reader.result as string);
                setShowImgModal(false); // Close modal after selection
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setImgPreview("DELETE"); // Special flag for deletion
        setShowImgModal(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const data = new FormData();
        data.append("nombre", formData.nombre);
        data.append("telefono", phoneDigits ? `+591 ${phoneDigits}` : "");
        data.append("bio", formData.bio);

        // Si hay una nueva imagen (detectada por cambio en preview vs original, o simplemente mandamos lo que haya en preview si es base64 o flag DELETE)
        if (imgPreview && imgPreview !== usuario.img) {
            data.append("img", imgPreview);
        } else if (imgPreview === "DELETE") {
            data.append("img", "DELETE");
        }

        const res = await actualizarPerfil(data);

        if (res.error) {
            showToast('error', res.error);
        } else {
            showToast('success', "¡Perfil actualizado correctamente!");
            // Actualizar localStorage con los datos nuevos
            localStorage.setItem("user_name", formData.nombre);
            if (imgPreview && imgPreview !== "DELETE") {
                localStorage.setItem("user_img", imgPreview);
            } else if (imgPreview === "DELETE") {
                localStorage.removeItem("user_img");
            }
        }
        setIsLoading(false);
    };

    return (
        <div className="max-w-xl mx-auto px-6 py-10 pb-32">
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-max"
                    >
                        <div className={`px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl border ${toast.type === 'success' ? 'bg-zinc-900/90 border-green-500/20 text-green-500' : 'bg-zinc-900/90 border-red-500/20 text-red-500'
                            }`}>
                            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                            <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
            >
                {/* Profile Header section */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => setShowImgModal(true)}>
                        <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-zinc-900 bg-zinc-900 shadow-2xl flex items-center justify-center group-hover:border-white transition-all duration-500">
                            {imgPreview && imgPreview !== "DELETE" ? (
                                <img src={imgPreview} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl font-black text-white">{formData.nombre.charAt(0).toUpperCase()}</span>
                            )}

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>

                        <div className="absolute bottom-1 right-1 bg-white text-black p-2 rounded-full shadow-xl border-4 border-black group-hover:scale-110 transition-transform">
                            <Camera size={14} />
                        </div>
                    </div>

                    <div className="text-center space-y-1">
                        <h1 className="text-3xl font-black text-white tracking-tighter">
                            {formData.nombre || "Tu Nombre"}
                        </h1>
                        <p className="text-[10px] text-zinc-500 font-bold tracking-[0.3em]">
                            {usuario.email}
                        </p>
                    </div>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="space-y-10 bg-zinc-900/30 p-8 rounded-[2.5rem] border border-white/5">
                        {/* Field: Nombre */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black tracking-[0.2em] text-zinc-500 flex items-center gap-3 ml-1">
                                <User size={14} className="text-zinc-700" /> Nombre Completo
                            </label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-semibold text-white focus:outline-none focus:border-white transition-all"
                                placeholder="Ej: Juan Pérez"
                            />
                        </div>

                        {/* Field: Teléfono */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black tracking-[0.2em] text-zinc-500 flex items-center gap-3 ml-1">
                                <Phone size={14} className="text-zinc-700" /> Teléfono de Contacto
                            </label>
                            <div className="relative">
                                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-black text-sm pointer-events-none select-none italic">
                                    +591
                                </span>
                                <input
                                    type="tel"
                                    name="telefono"
                                    value={phoneDigits}
                                    onChange={handlePhoneChange}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl pl-20 pr-6 py-4 text-sm font-semibold text-white focus:outline-none focus:border-white transition-all tracking-[0.2em]"
                                    placeholder="70000000"
                                    maxLength={8}
                                />
                            </div>
                        </div>

                        {/* Field: Bio */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black tracking-[0.2em] text-zinc-500 flex items-center gap-3 ml-1">
                                <FileText size={14} className="text-zinc-700" /> Notas / Preferencias
                            </label>
                            <textarea
                                name="bio"
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm font-medium text-white focus:outline-none focus:border-white transition-all resize-none leading-relaxed"
                                placeholder="Algo sobre ti"
                            />
                        </div>
                    </div>

                    <div className="px-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-black rounded-2xl py-5 font-black text-xs tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Guardar Cambios</>}
                        </button>
                    </div>
                </form>

                {/* Modal handling */}
                <AnimatePresence>
                    {showImgModal && (
                        <ImageModal
                            src={imgPreview !== "DELETE" ? imgPreview : null}
                            name={formData.nombre}
                            onClose={() => setShowImgModal(false)}
                            onChange={handleImageChange}
                            onDelete={handleRemoveImage}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
