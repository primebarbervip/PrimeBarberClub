import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/**
 * Cancela automáticamente las reservas pendientes después de 24 horas
 * Previene que los usuarios bloqueen horas innecesariamente
 */
export async function POST(req: Request) {
  try {
    // Verificar que sea una llamada autorizada (desde un cron job)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET || "test"}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Calcular la fecha límite (24 horas atrás)
    const hace24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Buscar y cancelar reservas pendientes que se crearon hace más de 24 horas
    const reservasExpiradas = await prisma.cita.updateMany({
      where: {
        estado: "PENDIENTE",
        creadoEn: {
          lt: hace24Horas
        }
      },
      data: {
        estado: "CANCELADA"
      }
    });

    console.log(`✅ Limpieza de reservas: ${reservasExpiradas.count} reservas pendientes canceladas`);

    return NextResponse.json({
      success: true,
      canceladas: reservasExpiradas.count,
      mensaje: `Se cancelaron ${reservasExpiradas.count} reservas pendientes después de 24 horas sin confirmación`
    });
  } catch (error: any) {
    console.error("❌ Error en limpieza de reservas:", error);
    return NextResponse.json(
      { error: error.message || "Error al limpiar reservas expiradas" },
      { status: 500 }
    );
  }
}
