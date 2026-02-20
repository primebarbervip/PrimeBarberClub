import { prisma } from "../../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ReservasBarberoClient from "./ReservasBarberoClient";
import { CalendarCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarberoReservasPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const userRole = cookieStore.get("user_role")?.value;

  if (userRole !== "barbero" || !userId) {
    redirect("/login");
  }

  const barbero = await prisma.barbero.findUnique({
    where: { usuarioId: userId },
  });

  if (!barbero) {
    redirect("/login");
  }

  const raw = await prisma.cita.findMany({
    where: {
      barberoId: barbero.id,
      estado: "confirmada",
    },
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
      servicio: {
        select: { nombre: true, precio: true, duracion: true },
      },
    },
    orderBy: [{ fecha: "asc" }, { hora: "asc" }],
  });

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
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <header className="mb-10 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CalendarCheck className="text-emerald-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Reservas confirmadas
            </h1>
            <p className="text-zinc-500 text-xs font-medium tracking-wide">
              Tus citas confirmadas para los próximos días
            </p>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-white/10 to-transparent mt-6" />
      </header>

      <ReservasBarberoClient citas={citas} />
    </div>
  );
}
