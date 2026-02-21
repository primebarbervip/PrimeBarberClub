import { cookies } from "next/headers";
import { prisma } from "../lib/prisma";
import MantenimientoClient from "./MantenimientoClient";

export const metadata = {
    title: "Mantenimiento temporal - BarberShop Prime",
    description: "Sitio en mantenimiento técnico.",
};

export default async function MantenimientoPage() {
    const cookieStore = await cookies();
    const userId = cookieStore.get("user_id")?.value;

    let usuario = null;
    let reservas: any[] = []; // Declaramos la variable vacía por defecto

    if (userId) {
        // 1. Buscamos el usuario
        usuario = await prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                id: true,
                nombre: true,
                email: true,
                telefono: true,
                bio: true,
                img: true,
            }
        });

        // 2. Buscamos las reservas asociadas a este usuario
        // Nota: Asumo que la relación en tu base de datos se llama 'clienteId'. 
        // Si en tu modelo se llama 'usuarioId', solo cambia esa palabra aquí abajo.
        const rawReservas = await prisma.cita.findMany({
            where: {
                clienteId: userId 
            },
            include: {
                barbero: {
                    include: {
                        usuario: { select: { nombre: true, img: true } },
                    },
                },
                servicio: {
                    select: { nombre: true, precio: true, duracion: true },
                },
            },
            orderBy: [{ fecha: "asc" }],
        });

        // 3. Serializamos los datos (Fechas y Decimales) para que React los acepte sin errores
        reservas = rawReservas.map((c) => ({
            ...c,
            fecha: c.fecha.toISOString(),
            creadoEn: c.creadoEn.toISOString(),
            servicio: {
                ...c.servicio,
                precio: c.servicio.precio.toString(),
            },
        }));
    }

    // 4. ¡Ahora TypeScript está feliz porque le mandamos ambas cosas!
    return <MantenimientoClient usuario={usuario} reservas={reservas} />;
}