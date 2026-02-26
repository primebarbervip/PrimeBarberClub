"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, ArrowLeft, RotateCcw } from "lucide-react";

function VerificarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);

  // Lógica del contador para el reenvío de 1 minuto
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerificar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || codigo.length < 6) return;
    
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email?.toLowerCase(), code: codigo }),
      });

      const data = await res.json();

      if (res.ok) {
        // IMPORTANTE: Ahora el servidor nos responde con data.redirectTo = "/login"
        // No creamos cookies aquí, obligamos al login manual
        window.location.href = data.redirectTo;
      } else {
        setError(data.error || "CÓDIGO INCORRECTO");
        setLoading(false);
      }
    } catch (err) {
      setError("ERROR DE CONEXIÓN");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || !email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, reenviar: true }),
      });
      if (res.ok) {
        setTimer(60); // Bloqueo de 1 minuto
        setError("");
      } else {
        const data = await res.json();
        setError(data.error || "ERROR AL REENVIAR");
      }
    } catch (err) {
      setError("ERROR AL REENVIAR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 selection:bg-white selection:text-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-zinc-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-zinc-800/50 w-full max-w-md shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10">
            <ShieldCheck className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-extralight text-white tracking-[0.2em] uppercase mb-3">Verificación</h1>
          <p className="text-zinc-500 text-[10px] uppercase tracking-widest leading-relaxed">
            Código enviado a: <br/> 
            <span className="text-white font-bold block mt-1 lowercase">{email || "correo"}</span>
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -10 }}
              className="text-red-500 text-[9px] font-black uppercase mb-6 bg-red-500/5 p-3 rounded-xl border border-red-500/20 text-center tracking-widest"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <form onSubmit={handleVerificar} className="space-y-6">
          <input 
            type="text" 
            maxLength={6}
            placeholder="000000"
            className="w-full bg-zinc-800/20 border border-zinc-700/30 rounded-2xl p-5 text-center text-3xl font-light tracking-[0.4em] text-white outline-none focus:border-white transition-all placeholder:text-zinc-800"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            required
          />

          <div className="space-y-3 pt-2">
            <button 
              type="submit"
              disabled={loading || codigo.length < 6}
              className="w-full bg-white text-black font-black py-4 rounded-2xl hover:bg-zinc-200 transition-all text-[11px] uppercase flex items-center justify-center gap-2 tracking-[0.2em] disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : "Confirmar Acceso"}
            </button>

            <button 
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || loading}
              className="w-full py-2 text-zinc-400 hover:text-white transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-30 font-bold"
            >
              <RotateCcw size={12} /> {timer > 0 ? `Reenviar en ${timer}s` : "Reenviar código"}
            </button>
            
            <button 
              type="button"
              onClick={() => router.push("/registro")}
              className="w-full py-1 text-zinc-600 hover:text-zinc-400 transition-all text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <ArrowLeft size={12} /> Corregir correo
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function VerificarPage() {
  return (
    <Suspense fallback={null}>
      <VerificarContent />
    </Suspense>
  );
}