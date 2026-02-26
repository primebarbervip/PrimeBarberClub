"use client";

import { useState, useEffect, useRef } from "react";
import { User, Camera, Save, ArrowLeft, Loader2, CheckCircle2, Eye, RefreshCw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PerfilBarbero() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPhotoMenu, setShowPhotoMenu] = useState(false);
  const [fotoArchivo, setFotoArchivo] = useState<File | null>(null);
  const [showToast, setShowToast] = useState(false); // FALTABA

  interface PerfilData {
    nombre: string;
    especialidad: string;
    descripcion: string;
    img: string;
  }

  const [perfil, setPerfil] = useState<PerfilData>({ // FALTABA
    nombre: "",
    especialidad: "",
    descripcion: "",
    img: ""
  });

  useEffect(() => {
    async function cargarPerfil() {
      try {
        const res = await fetch("/barbero/perfil/api");
        if (res.ok) {
          const data = await res.json();
          if (data) setPerfil({
            nombre: data.nombre || "",
            especialidad: data.especialidad || "",
            descripcion: data.descripcion || "",
            img: data.img || ""
          });
        }
      } catch (error) { console.error(error); } finally { setLoading(false); }
    }
    cargarPerfil();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) return alert("La foto es muy pesada (máx 5MB)");
      setFotoArchivo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPerfil({ ...perfil, img: reader.result as string });
        setShowPhotoMenu(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGuardar = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("nombre", perfil.nombre);
      formData.append("especialidad", perfil.especialidad);
      formData.append("descripcion", perfil.descripcion);
      formData.append("img", perfil.img); // Mantener la URL actual por si no se cambia

      if (fotoArchivo) {
        formData.append("imageFile", fotoArchivo);
      }

      const res = await fetch("/barbero/perfil/api", {
        method: "PUT",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.img) {
          setPerfil((prev: PerfilData) => ({ ...prev, img: data.img }));
        }
        setShowToast(true);
        router.refresh();
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) { alert("Error al guardar"); } finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <AnimatePresence>
        {showToast && (
          <motion.div initial={{ y: -100 }} animate={{ y: 20 }} exit={{ y: -100 }} className="fixed top-0 left-0 right-0 z-[200] flex justify-center px-6 pointer-events-none">
            <div className="bg-zinc-900 border border-white/10 px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 backdrop-blur-xl">
              <CheckCircle2 className="text-white w-5 h-5" />
              <span className="text-white font-black text-[11px] uppercase tracking-widest">Perfil actualizado con éxito</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER - Z-INDEX REDUCED */}
      <header className="bg-black sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
            <ArrowLeft />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Mi Perfil</h1>
            <p className="text-xs text-zinc-500">Edita tu información pública</p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT - DESKTOP TWO-COLUMN LAYOUT */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
          {/* LEFT COLUMN - PROFILE PHOTO (1/3 on desktop) */}
          <div className="md:col-span-1">
            <div className="flex flex-col items-center md:sticky md:top-24">
              <button
                onClick={() => perfil.img ? setShowPhotoMenu(true) : fileInputRef.current?.click()}
                className="relative group w-40 h-40 md:w-48 md:h-48"
              >
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-zinc-800 bg-zinc-900 shadow-2xl flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-zinc-700">
                  {perfil.img ? (
                    <img src={perfil.img} className="w-full h-full object-cover" alt="Perfil" />
                  ) : (
                    <User size={64} className="text-zinc-700" />
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-white p-3 rounded-full text-black shadow-lg group-hover:scale-110 transition-transform">
                  <Camera size={20} />
                </div>
              </button>
              <p className="text-zinc-500 text-xs mt-4 text-center">
                Haz clic para {perfil.img ? 'cambiar' : 'subir'} foto
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN - FORM FIELDS (2/3 on desktop) */}
          <div className="md:col-span-2 space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                Nombre Artístico
              </label>
              <input
                type="text"
                value={perfil.nombre}
                onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-base outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all"
                placeholder="Tu nombre profesional"
              />
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                Especialidad
              </label>
              <input
                type="text"
                value={perfil.especialidad}
                onChange={(e) => setPerfil({ ...perfil, especialidad: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-base outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all"
                placeholder="Ej: Cortes clásicos, Degradados, etc."
              />
            </div>

            {/* Biografía */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">
                Biografía
              </label>
              <textarea
                rows={6}
                value={perfil.descripcion}
                onChange={(e) => setPerfil({ ...perfil, descripcion: e.target.value })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-5 py-4 text-base outline-none focus:border-zinc-600 focus:bg-zinc-900 transition-all resize-none leading-relaxed"
                placeholder="Cuéntale a tus clientes sobre tu experiencia y estilo..."
              />
            </div>

            {/* Save Button */}
            <button
              onClick={handleGuardar}
              disabled={saving}
              className="w-full bg-white text-black font-bold py-4 rounded-xl mt-8 flex items-center justify-center gap-3 text-sm active:scale-[0.98] transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </div>
      </main>

      {/* PHOTO MENU MODAL */}
      <AnimatePresence>
        {showPhotoMenu && (
          <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPhotoMenu(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-t-3xl md:rounded-3xl p-8 z-[120] mx-4 flex flex-col items-center"
            >
              <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6 md:hidden" />
              
              {/* Photo Display - Prominently Shown */}
              <div className="mb-8 relative">
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-teal-500/50 bg-gradient-to-br from-teal-500/30 to-teal-500/10 flex items-center justify-center flex-shrink-0 shadow-2xl">
                  {perfil.img ? (
                    <img src={perfil.img} className="w-full h-full object-cover" alt="Foto actual" />
                  ) : (
                    <User size={64} className="text-zinc-600" />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-3">
                <button
                  onClick={() => { fileInputRef.current?.click(); setShowPhotoMenu(false); }}
                  className="w-full py-4 bg-white text-black hover:bg-zinc-100 rounded-2xl flex items-center justify-center gap-3 font-black text-sm transition-all"
                >
                  <Camera size={20} />
                  CAMBIAR FOTO
                </button>
                <button
                  onClick={() => { setPerfil({ ...perfil, img: "" }); setShowPhotoMenu(false); }}
                  className="w-full py-4 bg-red-500/20 hover:bg-red-500/30 rounded-2xl flex items-center justify-center gap-3 font-black text-sm text-red-400 transition-all"
                >
                  <Trash2 size={20} />
                  ELIMINAR FOTO
                </button>
                <button
                  onClick={() => setShowPhotoMenu(false)}
                  className="w-full mt-2 py-3 font-semibold text-xs text-zinc-500 hover:text-zinc-400 transition-colors uppercase tracking-wider"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
