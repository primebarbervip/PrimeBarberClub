import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET() {
  try {
    // Obtener todas las citas PENDIENTE y CONFIRMADA
    const citas = await prisma.cita.findMany({
      where: {
        estado: {
          in: ["PENDIENTE", "CONFIRMADA"],
        },
      },
      select: {
        id: true,
        barberoId: true,
        fecha: true,
        hora: true,
        estado: true,
      },
    });

    // Formatear la fecha a YYYY-MM-DD
    const citasFormateadas = citas.map(cita => ({
      id: cita.id,
      barberoId: cita.barberoId,
      fecha: new Date(cita.fecha).toISOString().split('T')[0],
      hora: cita.hora,
      estado: cita.estado,
    }));

    return NextResponse.json(citasFormateadas);
  } catch (error) {
    console.error("Error obteniendo citas ocupadas:", error);
    return NextResponse.json(
      { error: "Error al obtener citas" },
      { status: 500 }
    );
  }
}
