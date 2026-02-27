import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      barberoId,
      barberoNombre,
      fecha,
      hora,
      total,
      clienteEmail,
      clienteNombre,
      servicioId,
      serviciosNombres
    } = body;

    // 1. OBTENER CONFIGURACIÓN GLOBAL PARA EL TICKET
    // Usamos el acceso defensivo por si acaso
    const config = (prisma as any).configuracion
      ? await (prisma as any).configuracion.findUnique({ where: { id: 1 } })
      : null;

    const shopInfo = config || {
      nombreTienda: "Barber Shop Prime",
      direccion: "Santa Cruz, Bolivia",
      logo: "/abel.jpg",
      googleMapsUrl: "#",
      telefono: "70000000"
    };

    // 1.5. VALIDAR LÍMITE DE RESERVAS ACTIVAS (ANTI-ABUSE)
    // Contar tanto PENDIENTE como CONFIRMADA
    const reservasActivas = await prisma.cita.count({
      where: {
        cliente: { email: clienteEmail },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] }
      }
    });

    if (reservasActivas >= 3) {
      return NextResponse.json({
        error: "Tienes demasiadas reservas activas. Máximo 3 simultáneamente (pendientes o confirmadas). Por favor espera a que se completen o cancelen antes de hacer una nueva.",
        isTooManyActive: true
      }, { status: 429 });
    }

    // 1.5.5. VALIDAR SI EL SLOT SIGUE DISPONIBLE (PREVENIR DUPLICADOS)
    const citaExistente = await prisma.cita.findFirst({
      where: {
        barberoId,
        fecha: new Date(fecha),
        hora: hora,
        estado: { not: "CANCELADA" }
      }
    });

    if (citaExistente) {
      return NextResponse.json({
        error: "Este horario ya ha sido reservado por otro cliente mientras confirmabas.",
        isDuplicate: true
      }, { status: 409 });
    }

    // 2. CREAR RESERVA EN DB
    console.log("💾 Intentando crear cita en DB...", { barberoId, clienteEmail, servicioId });
    let nuevaReserva;
    try {
      nuevaReserva = await prisma.cita.create({
        data: {
          fecha: new Date(fecha),
          hora: hora,
          estado: "PENDIENTE",
          barbero: { connect: { id: barberoId } },
          cliente: { connect: { email: clienteEmail } },
          servicio: { connect: { id: servicioId } }
        }
      });
      console.log("✅ Cita creada:", nuevaReserva.id);
    } catch (dbError: any) {
      console.error("❌ ERROR AL CREAR CITA EN DB:", dbError);
      return NextResponse.json({
        error: "Error al guardar la cita. Verifique que su cuenta esté activa.",
        details: dbError.message
      }, { status: 400 });
    }

    // El email de confirmación se envía SOLO cuando el barbero confirma la reserva,
    // no cuando se crea (pendiente)

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🚨 ERROR CRÍTICO EN API RESERVA:", error);
    return NextResponse.json({ error: error.message || "Error interno al procesar la reserva" }, { status: 500 });
  }
}
