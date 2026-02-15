import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const reservas = await prisma.cita.findMany({
            where: {
                clienteId: userId
            },
            include: {
                servicio: {
                    select: {
                        nombre: true,
                        precio: true
                    }
                },
                barbero: {
                    include: {
                        usuario: {
                            select: {
                                nombre: true
                            }
                        }
                    }
                }
            },
            orderBy: [
                { fecha: 'desc' },
                { hora: 'desc' }
            ]
        });

        return NextResponse.json(reservas);
    } catch (error) {
        console.error("Error fetching user reservations:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
