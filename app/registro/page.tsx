"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, Info } from "lucide-react";

export default function RegistroPage() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPhoneHint, setShowPhoneHint] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isJefe = email.toLowerCase().trim() === 'cubasamuel852@gmail.com' || email.toLowerCase().trim() === 'vip.primebarber@gmail.com';

  // VALIDACIÓN EN TIEMPO REAL
  const isFormValid =
    nombre.length >= 3 &&
    nombre.length <= 30 &&
    apellido.length >= 3 &&
    apellido.length <= 30 &&
    email.includes("@") && email.includes(".") &&
    (isJefe ? true : telefono.length === 8) &&
    password.length >= 6;

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    setError("");

    // 1. LIMPIEZA DE COOKIES VIEJAS (Esto evita el salto directo a reservas)
    document.cookie = "user_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", { // Asegúrate que la ruta sea /registro o /register según tu carpeta
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: `${nombre} ${apellido}`,
          email: email.toLowerCase().trim(),
          telefono: telefono ? `+591${telefono}` : "",
          password
        }),
      });

      const data = await res.json();
      if (res.ok) {
        // Redirección limpia a verificación usando window.location para resetear el estado
        window.location.href = `/verificar?email=${encodeURIComponent(email.toLowerCase().trim())}`;
      } else {
        setError(data.error || "ERROR AL PROCESAR EL REGISTRO");
        setLoading(false);
      }
    } catch (err) {
      setError("ERROR DE CONEXIÓN CON EL SERVIDOR");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 selection:bg-white selection:text-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-zinc-800/50 w-full max-w-md shadow-2xl"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extralight text-white tracking-widest uppercase">Registro</h1>
          <p className="text-zinc-500 text-[10px] mt-2 uppercase tracking-[0.2em] font-medium">Crea tu cuenta Prime</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-2xl text-[10px] mb-6 text-center font-black uppercase tracking-widest overflow-hidden"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleRegistro} className="space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              maxLength={30}
              placeholder="Nombre"
              className="w-1/2 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl text-white outline-none focus:border-white transition-all placeholder:text-zinc-600 text-sm"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="text"
              maxLength={30}
              placeholder="Apellido"
              className="w-1/2 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl text-white outline-none focus:border-white transition-all placeholder:text-zinc-600 text-sm"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              required
            />
          </div>

          <p className="text-[9px] text-zinc-500 px-2 uppercase font-bold tracking-wider flex items-center gap-2">
            <AlertCircle size={12} className="text-zinc-600" /> Usa tu nombre real para tus citas
          </p>

          <div className="relative flex items-center gap-2">
            <div className="flex items-center bg-zinc-800/30 border border-zinc-700/50 rounded-2xl px-4 h-[54px] text-zinc-500 font-bold text-sm">
              +591
            </div>
            <input
              type="tel"
              maxLength={8}
              placeholder="Teléfono"
              className="flex-1 p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl text-white outline-none focus:border-white transition-all placeholder:text-zinc-600 text-sm"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
              required
            />
            <div className="relative group">
              <button
                type="button"
                onMouseEnter={() => setShowPhoneHint(true)}
                onMouseLeave={() => setShowPhoneHint(false)}
                onClick={() => setShowPhoneHint(!showPhoneHint)}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <Info size={18} />
              </button>

              <AnimatePresence>
                {showPhoneHint && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-800 border border-zinc-700 p-3 rounded-xl shadow-2xl z-50 text-[9px] text-zinc-300 font-bold uppercase tracking-wider leading-relaxed"
                  >
                    Por favor pon un número real con el que nos comunicaremos
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <input
            type="email"
            maxLength={50}
            placeholder="Correo electrónico"
            className="w-full p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl text-white outline-none focus:border-white transition-all placeholder:text-zinc-600 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              maxLength={30}
              placeholder="Contraseña"
              className="w-full p-4 bg-zinc-800/30 border border-zinc-700/50 rounded-2xl text-white outline-none focus:border-white transition-all placeholder:text-zinc-600 text-sm pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            disabled={!isFormValid || loading}
            className={`w-full py-4 rounded-2xl mt-4 font-black uppercase transition-all text-sm flex items-center justify-center gap-2 tracking-widest ${isFormValid && !loading
                ? "bg-white text-black hover:bg-zinc-200"
                : "bg-zinc-800 text-zinc-600 cursor-not-allowed grayscale opacity-50"
              }`}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Registrarse"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 text-center">
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold">
            ¿Ya tienes cuenta?
            <Link href="/login" className="text-white hover:underline ml-2">
              Inicia sesión
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}