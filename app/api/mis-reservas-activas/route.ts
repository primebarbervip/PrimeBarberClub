import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json([]);
    }

    const citas = await prisma.cita.findMany({
      where: {
        cliente: { email },
        estado: { in: ["PENDIENTE", "CONFIRMADA"] },
      },
      select: {
        id: true,
        barberoId: true,
        fecha: true,
        hora: true,
        estado: true,
      },
    });

    const citasFormateadas = citas.map(cita => ({
      id: cita.id,
      barberoId: cita.barberoId,
      fecha: new Date(cita.fecha).toISOString().split('T')[0],
      hora: cita.hora,
      estado: cita.estado,
    }));

    return NextResponse.json(citasFormateadas);
  } catch (error) {
    console.error("Error obteniendo mis reservas activas:", error);
    return NextResponse.json([], { status: 500 });
  }
}
