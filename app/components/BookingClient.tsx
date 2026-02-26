"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Check, ArrowLeft, User, Calendar as CalendarIcon,
  X, ChevronLeft, ChevronRight, ChevronDown, Award, ShieldCheck,
  Star, Clock, AlertCircle, Loader2, MapPin
} from "lucide-react";

interface Props {
  barberos: any[];
  config: {
    direccion: string;
    googleMapsUrl: string;
    nombreTienda: string;
    logo: string;
  };
}

export default function BookingClient({ barberos = [], config }: Props) {
  // SOLUCIÓN ERROR TS: Tipado explícito <number>
  const [paso, setPaso] = useState<number>(1);
  const [animarPaso, setAnimarPaso] = useState<number>(1);
  const [tabActiva, setTabActiva] = useState("SERVICIOS");
  const [seleccionados, setSeleccionados] = useState<number[]>([]);
  const [profesionalSel, setProfesionalSel] = useState<any | null>(null);
  const [fechaSel, setFechaSel] = useState(new Date());
  const [horaSel, setHoraSel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [citasOcupadas, setCitasOcupadas] = useState<any[]>([]);
  const [tieneReservaHoy, setTieneReservaHoy] = useState(false);

  const [mostrarModalBarbero, setMostrarModalBarbero] = useState(false);
  const [mostrarModalCalendario, setMostrarModalCalendario] = useState(false);
  const [barberoExpandidoId, setBarberoExpandidoId] = useState<number | null>(null);

  // Obtener citas ocupadas al cargar
  useEffect(() => {
    const obtenerCitasOcupadas = async () => {
      try {
        const res = await fetch("/api/citas-ocupadas");
        if (res.ok) {
          const data = await res.json();
          setCitasOcupadas(data);
          
          // Verificar si el usuario tiene reserva hoy
          const today = new Date().toISOString().split('T')[0];
          const tieneReservaEnFecha = data.some((cita: any) => cita.fecha === today);
          setTieneReservaHoy(tieneReservaEnFecha);
        }
      } catch (error) {
        console.error("Error al obtener citas ocupadas:", error);
      }
    };
    obtenerCitasOcupadas();
  }, []);

  // Actualizar cuando cambia la fecha seleccionada
  useEffect(() => {
    const fechaFormato = fechaSel.toISOString().split('T')[0];
    const tieneReservaEnFecha = citasOcupadas.some((cita: any) => cita.fecha === fechaFormato);
    setTieneReservaHoy(tieneReservaEnFecha);
  }, [fechaSel, citasOcupadas]);

  const hideScrollbar = {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
    WebkitOverflowScrolling: 'touch' as const,
  };

  // --- VARIABLES DEFINIDAS ARRIBA PARA EVITAR ERRORES ---
  const serviciosActuales = profesionalSel?.servicios || [];
  const combosActuales = profesionalSel?.combos || [];
  const allAvailableServices = [...serviciosActuales, ...combosActuales];
  const itemsSeleccionados = allAvailableServices.filter(s => seleccionados.includes(s.id));
  const totalBs = itemsSeleccionados.reduce((acc, curr) => acc + curr.precio, 0);

  const parseDuration = (timeStr: string | number) => {
    if (typeof timeStr === 'number') return timeStr;
    const hMatch = String(timeStr).match(/(\d+)h/);
    const mMatch = String(timeStr).match(/(\d+)Min/);
    let minutes = 0;
    if (hMatch) minutes += parseInt(hMatch[1]) * 60;
    if (mMatch) minutes += parseInt(mMatch[1]);
    return minutes || 30;
  };

  const formatDuration = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0 && m > 0) return `${h} h y ${m} Min`;
    if (h > 0) return `${h} h`;
    return `${m} Min`;
  };

  const addMinutesToTime = (timeStr: string, minutesToAdd: number) => {
    const [h, m] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    date.setMinutes(date.getMinutes() + minutesToAdd);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  };

  const totalMinutos = itemsSeleccionados.reduce((acc, curr) => acc + parseDuration(curr.tiempo), 0);
  const duracionFormateada = formatDuration(totalMinutos);
  const horaFin = horaSel ? addMinutesToTime(horaSel, totalMinutos) : '';

  const getDiasCalendario = (fechaInicio: Date) => {
    const dias = [];
    const diasSemana = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
    for (let i = 0; i < 60; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fechaInicio.getDate() + i);
      dias.push({
        fecha: fecha,
        diaNum: fecha.getDate(),
        diaNombre: diasSemana[fecha.getDay()],
        fullDate: fecha
      });
    }
    return dias;
  };

  const getHorasDisponibles = (barberoId: number | null, date: Date) => {
    // Buscar el barbero seleccionado
    const barbero = barberos.find(b => b.id === barberoId);
    if (!barbero) return [];

    const isoDate = date.toISOString().split('T')[0];

    // NUEVO: Buscar si hay un horario especial para este día
    const especial = barbero.horariosEspeciales?.find((h: any) => h.fecha === isoDate);

    // Si está marcado como cerrado explícitamente ese día
    if (especial?.cerrado) return [];

    // Jornada: Siempre priorizar el global del barbero para sincronía total
    const inicio = barbero.inicioJornada || especial?.inicioJornada || "10:00";
    const fin = barbero.finJornada || especial?.finJornada || "19:00";
    // Almuerzo: Siempre priorizar el global del barbero para cumplir con la sincronía total
    const almuerzoInicio = barbero.inicioAlmuerzo || especial?.inicioAlmuerzo;
    const almuerzoFin = barbero.finAlmuerzo || especial?.finAlmuerzo;
    const bloqueos = especial?.bloqueos || [];
    const habilitados = especial?.habilitados || [];

    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFin, mFin] = fin.split(':').map(Number);

    const hoy = new Date();
    const esHoy = date.toDateString() === hoy.toDateString();

    const slots = [];
    let current = new Date(date);
    current.setHours(hInicio, mInicio, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(hFin, mFin, 0, 0);

    // Obtener horas ocupadas para este barbero en esta fecha
    const horasOcupadas = citasOcupadas
      .filter(cita => cita.barberoId === barberoId && cita.fecha === isoDate)
      .map(cita => cita.hora);

    // Generar slots de 1 hora (60 minutos)
    while (current < endTime) {
      const horaStr = current.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false });

      // 1. Validar si ya pasó (si es hoy) + BUFFER DE 2 HORAS
      let yaPaso = false;
      if (esHoy) {
        const horaLimite = new Date(hoy);
        horaLimite.setHours(hoy.getHours() + 2);

        const [hSlot, mSlot] = horaStr.split(':').map(Number);
        const slotDate = new Date(hoy);
        slotDate.setHours(hSlot, mSlot, 0, 0);

        yaPaso = slotDate < horaLimite;
      }

      // 2. Validar si está en el almuerzo (Solo si está ACTIVO globalmente)
      let esAlmuerzo = false;
      const almuerzoActivo = barbero.almuerzoActivo ?? true;
      if (almuerzoActivo && almuerzoInicio && almuerzoFin) {
        esAlmuerzo = horaStr >= almuerzoInicio && horaStr < almuerzoFin;
      }

      // 3. Validar si está bloqueado individualmente o habilitado
      const estaBloqueado = bloqueos.includes(horaStr);
      const estaHabilitado = habilitados.includes(horaStr);

      // 4. Validar si la hora ya está ocupada
      const estaOcupada = horasOcupadas.includes(horaStr);

      if (!yaPaso && (!esAlmuerzo || estaHabilitado) && !estaBloqueado && !estaOcupada) {
        slots.push(horaStr);
      }

      current.setHours(current.getHours() + 1);
    }

    return slots;
  };

  useEffect(() => {
    if (paso !== animarPaso) {
      const timeout = setTimeout(() => {
        setAnimarPaso(paso);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [paso, animarPaso]);

  const toggleServicio = (id: number) => {
    setSeleccionados((prev) => {
      // 1. Deseleccionar si ya está marcado
      if (prev.includes(id)) {
        return prev.filter((sId) => sId !== id);
      }

      // 2. Primera selección
      if (prev.length === 0) return [id];

      // 3. Verificar compatibilidad con el servicio PRINCIPAL (el primero seleccionado)
      const primaryId = prev[0];
      const primary = allAvailableServices.find(s => s.id === primaryId);
      const target = allAvailableServices.find(s => s.id === id);

      const pCompat = primary?.compatibleIds || [];
      const tCompat = target?.compatibleIds || [];

      // Chequeo bidireccional: A incluye B O B incluye A
      const isCompatible = pCompat.includes(id) || tCompat.includes(primaryId);

      // 4. Si es compatible, lo agregamos al grupo
      if (isCompatible) {
        return [...prev, id];
      }

      // 5. Si NO es compatible, cambiamos la selección (nuevo grupo)
      // "Que se marque el otro y se desmarque lo anterior"
      return [id];
    });
  };

  const handleContinuar = () => {
    if (paso === 2 && seleccionados.length > 0) setPaso(3);
    else if (paso === 3 && horaSel) setPaso(4);
  };

  const handleFinalizar = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/reserva", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberoId: profesionalSel.id,
          barberoNombre: profesionalSel.nombre,
          fecha: fechaSel,
          hora: horaSel,
          total: totalBs,
          clienteEmail: localStorage.getItem("user_email") || "samuel@ejemplo.com",
          clienteNombre: localStorage.getItem("user_name") || "Samuel",
          servicioId: seleccionados[0],
          serviciosNombres: itemsSeleccionados.map(s => s.nombre).join(", ")
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPaso(5);
      } else {
        if (res.status === 409) {
          alert("¡Lo sentimos! Este horario acaba de ser ocupado. Por favor elige otra hora.");
          setPaso(3); // Regresar al calendario
        } else {
          alert(data.error || "Error al procesar la reserva");
        }
      }
    } catch (e) {
      alert("Error de conexión al servidor");
    } finally {
      setLoading(false);
    }
  };

  const getFullDateName = (date: Date) => date.toLocaleString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
  const diasHorizontal = getDiasCalendario(new Date());

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans select-none pb-32 overflow-x-hidden text-left">
      <header className="flex items-center gap-4 px-4 py-3 border-b border-zinc-100 sticky top-0 bg-white z-50">
        {paso < 5 && (
          <button type="button" onClick={() => paso > 1 ? setPaso(paso - 1) : window.location.replace('/')} className="p-1">
            <ArrowLeft className="w-5 h-5 text-black" />
          </button>
        )}
        <h1 className="text-[16px] font-bold">
          {paso === 1 ? "Seleccionar profesional" : paso === 2 ? "Servicios" : paso === 3 ? "Seleccionar hora" : paso === 4 ? "Confirmar Reserva" : "Reserva Exitosa"}
        </h1>
      </header>

      {/* CABECERA PASO 2 */}
      {paso === 2 && (
        <div className="sticky top-[53px] bg-white z-40 px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex gap-2">
            <button onClick={() => setTabActiva("SERVICIOS")} className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all ${tabActiva === "SERVICIOS" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-400 hover:bg-zinc-50"}`}>SERVICIOS</button>
            <button onClick={() => setTabActiva("COMBOS")} className={`px-5 py-2 rounded-full text-[12px] font-bold transition-all ${tabActiva === "COMBOS" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-400"}`}>COMBOS</button>
          </div>
          <button onClick={() => setMostrarModalBarbero(true)} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-full pl-1 pr-3 py-1 scale-90 active:scale-95">
            <div className="w-7 h-7 rounded-full bg-zinc-200 overflow-hidden border border-white">
              {profesionalSel?.img && <img src={profesionalSel.img} className="w-full h-full object-cover" />}
            </div>
            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter max-w-[80px] truncate">{profesionalSel?.nombre.split(' ')[0]}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
        </div>
      )}

      <div className={`transition-all duration-500 ease-in-out ${paso !== animarPaso ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

        {/* PASO 1: BARBEROS (TU CÓDIGO) */}
        {animarPaso === 1 && (
          <div className="px-4 pt-6 space-y-4">
            {barberos.map((b: any) => (
              <ItemBarbero
                key={b.id}
                nombre={b.nombre}
                rol={b.especialidad}
                img={b.img}
                descripcion={b.descripcion}
                expandido={barberoExpandidoId === b.id}
                onToggle={() => setBarberoExpandidoId(barberoExpandidoId === b.id ? null : b.id)}
                onClick={() => { setProfesionalSel(b); setSeleccionados([]); setPaso(2); }}
              />
            ))}
          </div>
        )}

        {/* PASO 2: SERVICIOS (ANIMACIÓN FLUIDA) */}
        {animarPaso === 2 && (
          <main className="px-4 pt-4 divide-y divide-zinc-50">
            <AnimatePresence mode="popLayout">
              {tabActiva === "SERVICIOS" ? (
                serviciosActuales.map((s: any) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    transition={{ duration: 0.2 }}
                  >
                    <ItemServicio s={s} sel={seleccionados.includes(s.id)} onToggle={toggleServicio} />
                  </motion.div>
                ))
              ) : (
                combosActuales.map((s: any) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    layout
                    transition={{ duration: 0.2 }}
                  >
                    <ItemServicio s={s} sel={seleccionados.includes(s.id)} onToggle={toggleServicio} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </main>
        )}

        {/* PASO 3: CALENDARIO (TU CÓDIGO CON HORAS ALINEADAS A LA IZQUIERDA) */}
        {animarPaso === 3 && (
          <div className="pt-6">
            <div className="px-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-full pl-1.5 pr-5 py-1.5 shadow-sm text-left">
                <div className="w-8 h-8 rounded-full bg-zinc-100 overflow-hidden border border-zinc-100">
                  {profesionalSel?.img && <img src={profesionalSel.img} className="w-full h-full object-cover" />}
                </div>
                <span className="font-bold text-[14px] text-zinc-900">{profesionalSel?.nombre}</span>
              </div>
              <button onClick={() => setMostrarModalCalendario(true)} className="w-11 h-11 rounded-full border border-zinc-200 flex items-center justify-center shadow-sm active:scale-95"><CalendarIcon size={20} /></button>
            </div>
            <h2 className="px-4 text-[18px] font-bold text-zinc-900 mb-4 capitalize text-left">{getFullDateName(fechaSel)}</h2>

            <div className="flex gap-3 overflow-x-auto px-4 py-4" style={hideScrollbar}>
              {diasHorizontal.map((dia, idx) => {
                const isSelected = dia.fecha.toDateString() === fechaSel.toDateString();
                return (
                  <button key={idx} onClick={() => { setFechaSel(dia.fecha); setHoraSel(null); }} className="flex flex-col items-center gap-2 flex-shrink-0 group">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-[16px] font-bold transition-all border ${isSelected ? 'bg-zinc-900 text-white border-zinc-900 shadow-md scale-110' : 'bg-white text-zinc-900 border-zinc-300'}`}>{dia.diaNum}</div>
                    <span className={`text-[11px] font-medium capitalize transition-colors ${isSelected ? 'text-zinc-900 font-bold' : 'text-zinc-400'}`}>{dia.diaNombre}</span>
                  </button>
                )
              })}
            </div>

            <div className="px-4 mt-4 mb-20">
              <div className="border border-zinc-100 rounded-xl overflow-hidden divide-y divide-zinc-100 bg-white">
                {getHorasDisponibles(profesionalSel?.id, fechaSel).map((hora) => (
                  <button
                    key={hora}
                    onClick={() => setHoraSel(hora)}
                    className={`w-full text-left px-5 py-4 font-bold text-[14px] transition-colors ${horaSel === hora ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-900 hover:bg-zinc-50'
                      }`}
                  >
                    {hora}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASO 4: CONFIRMACIÓN (DISEÑO PRIME) */}
        {animarPaso === 4 && (
          <div className="px-4 pt-2 pb-32 max-w-2xl mx-auto space-y-8">
            <div className="bg-zinc-50/80 backdrop-blur-sm border border-zinc-100 rounded-[2.5rem] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left transition-all hover:shadow-xl hover:shadow-zinc-200/50 group">
              <div className="w-20 h-20 rounded-3xl bg-white overflow-hidden border border-zinc-200 flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform duration-500">
                <img src={config.logo || "/abel.jpg"} className="w-full h-full object-cover" alt="Shop" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h2 className="font-black text-[20px] text-zinc-900 tracking-tighter leading-none">{config.nombreTienda || "Barber Shop Prime"}</h2>
                  <div className="flex items-center justify-center sm:justify-start gap-1 text-[13px] text-yellow-600 mt-2 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>4,9</span>
                    <span className="text-zinc-400 font-medium ml-1">(120 reviews)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[13px] text-zinc-500 font-medium leading-relaxed max-w-[280px] mx-auto sm:mx-0">
                    {config.direccion || "Dirección no configurada"}
                  </p>

                  {config.googleMapsUrl && (
                    <a
                      href={config.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-zinc-200"
                    >
                      <MapPin size={14} />
                      Cómo llegar
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 border-y border-zinc-100 py-6 text-left">
              <div className="flex items-center gap-3 text-zinc-600">
                <CalendarIcon className="w-5 h-5 text-zinc-400" />
                <span className="text-[14px] font-bold capitalize">{getFullDateName(fechaSel)}</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-600 font-bold">
                <Clock className="w-5 h-5 text-zinc-400" />
                <span className="text-[14px]">{horaSel} - {horaFin} ({duracionFormateada})</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              {itemsSeleccionados.map(item => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-[15px] font-bold text-zinc-900">{item.nombre}</p>
                    <p className="text-[12px] text-zinc-400 mt-1">{item.tiempo} con {profesionalSel?.nombre}</p>
                  </div>
                  <p className="text-[15px] font-bold text-zinc-900">{item.precio} Bs</p>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-zinc-100 text-left">
              <div className="flex justify-between items-center mb-1 text-[16px] font-bold">
                <span>Total</span>
                <span>desde {totalBs} Bs</span>
              </div>
              <div className="flex justify-between items-center text-green-600 font-bold text-[14px]">
                <span>Pagar ahora</span>
                <span>0 Bs</span>
              </div>
              <p className="text-[12px] text-zinc-400 mt-2">Pagar en el establecimiento: desde {totalBs} Bs</p>
            </div>

            {tieneReservaHoy && (
              <div className="bg-red-50 p-6 rounded-[2rem] border border-red-200 text-left">
                <div className="flex items-center gap-2 text-red-900 mb-2 font-black text-xs uppercase tracking-widest leading-none">
                  <AlertCircle size={18} /> No Permitido
                </div>
                <p className="text-[12px] text-red-800 leading-relaxed font-medium">
                  Ya tienes una reserva para este día. Solo se permite una reserva por día. Por favor selecciona otra fecha.
                </p>
              </div>
            )}

            <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 text-left">
              <div className="flex items-center gap-2 text-amber-900 mb-2 font-black text-xs uppercase tracking-widest leading-none">
                <AlertCircle size={18} /> Aviso Importante
              </div>
              <p className="text-[12px] text-amber-800 leading-relaxed font-medium">
                Nos comunicaremos al whatsapp para confirmar su cita, solo necesitamos que realice el 50% de anticipo del servicio. Una vez recibido su comprobante, su turno quedará confirmado.
              </p>
            </div>
          </div>
        )}

        {/* PASO 5: ÉXITO (ANIMACIÓN Y FORMALIDAD) */}
        {animarPaso === 5 && (
          <div className="px-6 pt-12 pb-32 flex flex-col items-center text-center space-y-10 max-w-lg mx-auto">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", damping: 12, stiffness: 200 }}
              className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center text-white shadow-2xl"
            >
              <Check size={48} strokeWidth={3} />
            </motion.div>

            <div className="space-y-4">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter italic leading-none">
                Reserva <span className="text-zinc-400">Recibida</span>
              </h2>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                ¡Excelente elección! Hemos registrado tu solicitud de turno para el <span className="text-zinc-900 font-bold">{getFullDateName(fechaSel)}</span> a las <span className="text-zinc-900 font-bold">{horaSel}</span>.
              </p>
            </div>

            <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 w-full space-y-6">
              <div className="flex items-center gap-4 text-left">
                <div className="w-10 h-10 bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Siguiente Paso</p>
                  <p className="text-[13px] font-bold text-zinc-900 leading-tight">Confirmación por WhatsApp</p>
                </div>
              </div>

              <div className="h-[1px] bg-zinc-200/50 w-full" />

              <p className="text-[13px] text-zinc-600 leading-relaxed text-left italic">
                "Nos comunicaremos pronto contigo para verificar el anticipo y asegurar tu espacio en nuestra agenda de prestigio."
              </p>
            </div>

            <div className="pt-6 w-full space-y-6">
              <button
                onClick={() => window.location.replace('/reservas')}
                className="w-full py-5 bg-zinc-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-zinc-200 active:scale-95 transition-all"
              >
                Ver mis Reservas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER PERSISTENTE - ACTIVADO TAMBIÉN EN PASO 4 PARA CONFIRMAR */}
      {((paso === 2 && seleccionados.length > 0) || (paso === 3 && horaSel) || paso === 4) && (
        <div className="fixed bottom-0 left-0 right-0 bg-white px-6 py-5 border-t border-zinc-100 flex items-center justify-between shadow-2xl z-40">
          <div className="flex flex-col text-left">
            <span className="font-bold text-[18px] leading-none">{totalBs} Bs</span>
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest mt-1">{seleccionados.length} Seleccionado</span>
          </div>
          <button
            onClick={paso === 4 ? handleFinalizar : handleContinuar}
            disabled={loading || (paso === 4 && tieneReservaHoy)}
            className="px-10 py-3.5 bg-zinc-900 text-white rounded-full font-black text-xs uppercase active:scale-95 transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : paso === 4 ? "Confirmar" : "Continuar"}
          </button>
        </div>
      )}

      {/* MODALES */}
      <AnimatePresence>
        {mostrarModalBarbero && (
          <ModalWrapper onClose={() => setMostrarModalBarbero(false)} title="Cambiar profesional">
            <div className="space-y-4">
              {barberos.map((b: any) => (
                <ItemBarbero
                  key={b.id} {...b} expandido={false} onToggle={() => { }}
                  onClick={() => { setProfesionalSel(b); setSeleccionados([]); setPaso(2); setMostrarModalBarbero(false); }}
                />
              ))}
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mostrarModalCalendario && (
          <ModalCalendario
            onClose={() => setMostrarModalCalendario(false)}
            onSelectDate={(date: Date) => { setFechaSel(date); setHoraSel(null); setMostrarModalCalendario(false); }}
            selectedDate={fechaSel}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- ITEM BARBERO (TU CÓDIGO) ---
function ItemBarbero({ nombre, rol, img, descripcion, expandido, onToggle, onClick }: any) {
  return (
    <motion.div
      layout
      className={`rounded-[2.5rem] transition-all duration-300 border-[3px] overflow-hidden ${expandido ? 'border-zinc-900 bg-zinc-50/50 shadow-xl' : 'border-zinc-100 bg-white'
        }`}
    >
      <div className="flex items-center justify-between py-4 px-6 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 rounded-full bg-zinc-100 flex items-center justify-center overflow-hidden border-2 transition-all ${expandido ? 'border-zinc-900 shadow-md' : 'border-zinc-50'}`}>
            {img ? <img src={img} className="w-full h-full object-cover" /> : <User className="text-zinc-300" size={24} />}
          </div>
          <div className="text-left">
            <h3 className="font-sans font-semibold text-[17px] text-zinc-900 leading-tight">{nombre}</h3>
            {rol && (
              <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-0.5">{rol}</p>
            )}
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className={`px-6 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-90 ${expandido ? 'bg-zinc-900 text-white' : 'bg-white border-2 border-zinc-100 text-zinc-900'
            }`}
        >
          Elegir
        </button>
      </div>

      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-8 pb-8 pt-2 text-left">
              <div className="h-[1px] bg-zinc-200/60 mb-6 w-full" />
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em]">
                  <Award size={12} className="text-zinc-900" /> Perfil Profesional
                </div>
                <div className="border-l-2 border-zinc-900 pl-4 py-1">
                  <p className="text-zinc-600 text-[13px] leading-relaxed font-medium italic">
                    {descripcion || "Especialista verificado en Barber Shop Prime."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ItemServicio({ s, sel, onToggle }: any) {
  return (
    <motion.div layout className="flex justify-between items-center py-6 cursor-pointer group" onClick={() => onToggle(s.id)}>
      <div className="flex-1 pr-6 text-left">
        <h3 className="font-sans font-semibold text-[15px] text-zinc-900">{s.nombre}</h3>
        {s.descripcion && <p className="text-[13px] text-zinc-500 mt-1.5 font-medium leading-relaxed">{s.descripcion}</p>}
        <p className="text-zinc-500 text-[10px] font-black mt-2 uppercase tracking-[0.2em]">{s.tiempo.replace('MIN', 'Min')} • {s.precio} Bs</p>
      </div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${sel ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg' : 'border-zinc-100 text-zinc-200 group-hover:border-zinc-300'
        }`}>
        {sel ? <Check size={18} strokeWidth={3} /> : <Plus size={18} strokeWidth={3} />}
      </div>
    </motion.div>
  );
}

function ModalWrapper({ children, onClose, title }: any) {
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="relative w-full bg-white/80 backdrop-blur-2xl rounded-t-[3rem] p-8 max-h-[85vh] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <div className="flex justify-between items-center mb-8 pt-4">
          <h2 className="text-xl font-black uppercase tracking-tighter">{title}</h2>
          <button onClick={onClose} className="p-2 bg-zinc-50 rounded-full hover:bg-zinc-100 transition-colors"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </div>
  );
}

function ModalCalendario({ onClose, onSelectDate, selectedDate }: any) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();
  const hoy = new Date();
  const esMesActual = viewDate.getMonth() === hoy.getMonth() && viewDate.getFullYear() === hoy.getFullYear();
  
  // Límite máximo: 60 días desde hoy
  const limiteMax = new Date(hoy);
  limiteMax.setDate(limiteMax.getDate() + 60);
  const esVistaFueraDeLimite = viewDate > limiteMax;

  return (
    <ModalWrapper onClose={onClose} title="Calendario">
      <div className="pb-6">
        <div className="flex items-center justify-between mb-6 px-2">
          <button onClick={() => !esMesActual && setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() - 1)))} className={esMesActual ? 'opacity-10' : ''} disabled={esMesActual}>
            <ChevronLeft size={20} />
          </button>
          <h3 className="font-black text-sm uppercase tracking-widest">{viewDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}</h3>
          <button onClick={() => setViewDate(new Date(viewDate.setMonth(viewDate.getMonth() + 1)))} className={esVistaFueraDeLimite ? 'opacity-10' : ''} disabled={esVistaFueraDeLimite}>
            <ChevronRight size={20} />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center font-black text-[10px] text-zinc-300 mb-4 uppercase tracking-widest">
          {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array(startDay).fill(null).map((_, i) => <div key={i} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1);
            const isSelected = d.toDateString() === selectedDate.toDateString();
            const esPasado = d < new Date(new Date().setHours(0, 0, 0, 0));
            const esFueraDelLimite = d > limiteMax;
            const estaDeshabilitada = esPasado || esFueraDelLimite;
            return (
              <button key={i} disabled={estaDeshabilitada} onClick={() => onSelectDate(d)} className={`h-10 w-10 mx-auto rounded-full font-black text-[13px] flex items-center justify-center transition-all ${isSelected ? 'bg-zinc-900 text-white shadow-xl' : estaDeshabilitada ? 'opacity-10' : 'text-zinc-800 hover:bg-zinc-100'}`}>
                {i + 1}
              </button>
            )
          })}
        </div>
      </div>
    </ModalWrapper>
  );
}
