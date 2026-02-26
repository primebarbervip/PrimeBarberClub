import { prisma } from "../lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import BarberoDashboardClient from "./BarberoDashboardClient";
import BloqueoAtras from "./BloqueoAtras";

export default async function BarberoPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("user_id")?.value;
  const userRole = cookieStore.get("user_role")?.value;

  if (userRole !== "barbero" || !userId) {
    redirect("/login");
  }

  const barbero = await prisma.barbero.findUnique({
    where: { usuarioId: userId },
    include: {
      servicios: true,
      usuario: true,
    },
  });

  if (!barbero) {
    redirect("/login");
  }

  const serviciosFormateados = barbero.servicios.map((s) => ({
    ...s,
    precio: Number(s.precio),
  }));

  return (
    <>
      <BloqueoAtras />
      <BarberoDashboardClient
        servicios={serviciosFormateados}
        barberoId={barbero.id}
      />
    </>
  );
}