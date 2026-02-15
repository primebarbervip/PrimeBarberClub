import { prisma } from "../lib/prisma";
import BookingClient from "../components/BookingClient";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {

  // 1. OBTENER BARBEROS ACTIVOS
  const barberosRaw = await prisma.barbero.findMany({
    where: {
      activo: true,
      usuario: {
        rol: "barbero"
      }
    },
    include: {
      horariosEspeciales: true,
      servicios: {
        orderBy: {
          precio: 'desc'
        },
        include: {
          serviciosIncluidos: {
            select: { id: true }
          },
          paquetes: {
            select: { id: true }
          }
        }
      }
    }
  });

  const barberos = barberosRaw.map(b => ({
    id: b.id,
    nombre: b.nombre,
    especialidad: b.especialidad || "Staff",
    img: b.img || null,
    descripcion: b.descripcion,
    inicioJornada: b.inicioJornada,
    finJornada: b.finJornada,
    inicioAlmuerzo: b.inicioAlmuerzo,
    finAlmuerzo: b.finAlmuerzo,
    almuerzoActivo: b.almuerzoActivo,
    horariosEspeciales: b.horariosEspeciales,
    servicios: b.servicios
      .filter(s => !s.esCombo)
      .map(s => ({
        id: s.id,
        nombre: s.nombre,
        precio: Number(s.precio),
        tiempo: `${s.duracion}Min`,
        descripcion: s.descripcion || "",
        compatibleIds: [...s.serviciosIncluidos.map(si => si.id), ...s.paquetes.map(p => p.id)]
      })),
    combos: b.servicios
      .filter(s => s.esCombo)
      .map(s => ({
        id: s.id,
        nombre: s.nombre,
        precio: Number(s.precio),
        tiempo: `${s.duracion}Min`,
        descripcion: s.descripcion || "",
        compatibleIds: [...s.serviciosIncluidos.map(si => si.id), ...s.paquetes.map(p => p.id)]
      }))
  }));

  // 2. OBTENER CONFIGURACIÓN GLOBAL (UBICACIÓN, ETC)
  // FIX: Acceso defensivo por si el cliente Prisma no se ha actualizado en tiempo real
  const config = (prisma as any).configuracion
    ? await (prisma as any).configuracion.findUnique({ where: { id: 1 } })
    : null;

  const finalConfig = config || {
    direccion: "",
    googleMapsUrl: "",
    nombreTienda: "",
    logo: ""
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <BookingClient barberos={barberos} config={finalConfig} />
    </main>
  );
}