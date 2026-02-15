import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { enviarTicketReserva } from "@/app/lib/email";
import { getEmailTicketTemplate } from "@/app/lib/templates/email-ticket";

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

    // 1.5. VALIDAR SI EL SLOT SIGUE DISPONIBLE (PREVENIR DUPLICADOS)
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

    // 3. GENERAR HTML DEL TICKET
    console.log("📧 Generando ticket de correo...");
    const emailHtml = getEmailTicketTemplate({
      clienteNombre,
      barberoNombre: barberoNombre || "Profesional",
      servicioNombre: serviciosNombres || "Corte de Cabello",
      fecha: new Date(fecha).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }),
      hora,
      total: String(total),
      shopName: shopInfo.nombreTienda || "Barber Shop Prime",
      shopAddress: shopInfo.direccion || "Santa Cruz, Bolivia",
      shopLogo: shopInfo.logo || "",
      googleMapsUrl: shopInfo.googleMapsUrl || "#",
      shopPhone: shopInfo.telefono || "70000000"
    });

    // 4. ENVIAR CORREO
    console.log("🚀 Enviando correo a:", clienteEmail);
    try {
      await enviarTicketReserva(clienteEmail, shopInfo.nombreTienda || 'Barber Shop Prime', emailHtml);
      console.log("✅ Correo enviado con éxito");
    } catch (emailError: any) {
      console.error("❌ ERROR AL ENVIAR CORREO:", emailError);
      // No bloqueamos la respuesta si solo falla el correo, pero el usuario debe saber
      return NextResponse.json({
        success: true,
        warning: "Cita registrada, pero no se pudo enviar el correo de confirmación."
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🚨 ERROR CRÍTICO EN API RESERVA:", error);
    return NextResponse.json({ error: error.message || "Error interno al procesar la reserva" }, { status: 500 });
  }
}