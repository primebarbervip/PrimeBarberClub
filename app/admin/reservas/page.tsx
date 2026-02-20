import { prisma } from "../../lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import ReservasAdminClient from "./ReservasAdminClient";
import { Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminReservasPage() {
  const cookieStore = await cookies();
  if (cookieStore.get("user_role")?.value !== "admin") {
    redirect("/login");
  }

  try {
    const raw = await prisma.cita.findMany({
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            email: true,
            telefono: true,
            img: true,
          },
        },
        barbero: {
          include: {
            usuario: { select: { nombre: true, img: true } },
          },
        },
        servicio: {
          select: { nombre: true, precio: true, duracion: true },
        },
      },
      orderBy: [{ creadoEn: "desc" }],
    });

    // Serializar para Client Component (Decimal no es serializable)
    const citas = raw.map((c) => ({
      ...c,
      fecha: c.fecha.toISOString(),
      creadoEn: c.creadoEn.toISOString(),
      servicio: {
        ...c.servicio,
        precio: c.servicio.precio.toString(),
      },
    }));

    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans md:ml-10">
        <header className="mb-14 max-w-5xl">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Reservas</h1>
              <p className="text-zinc-500 text-[10px] font-bold tracking-[0.2em] uppercase">
                Gestiona y confirma las citas pendientes
              </p>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mt-8" />
        </header>

        <ReservasAdminClient citas={citas} />
      </div>
    );
  } catch (error) {
    console.error("Error cargando reservas:", error);
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12">
        <p className="text-red-400">Error al cargar las reservas.</p>
        <ReservasAdminClient citas={[]} />
      </div>
    );
  }
}
