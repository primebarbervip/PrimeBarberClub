import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();
    const cleanEmail = email.toLowerCase().trim();

    const usuario = await prisma.usuario.findUnique({
      where: { email: cleanEmail },
    });

    // Validar código
    if (!usuario || usuario.codigoVerif !== code) {
      return NextResponse.json({ error: "CÓDIGO INVÁLIDO" }, { status: 400 });
    }

    // Validar tiempo (15 min)
    const ahora = new Date();
    const creacionCodigo = new Date(usuario.creadoEn); 
    if ((ahora.getTime() - creacionCodigo.getTime()) / 1000 / 60 > 15) {
      return NextResponse.json({ error: "EL CÓDIGO HA EXPIRADO" }, { status: 400 });
    }

    // Marcar como verificado y limpiar código
    await prisma.usuario.update({
      where: { email: cleanEmail },
      data: { esVerificado: true, codigoVerif: null },
    });

    // Mandar al Login
    return NextResponse.json({
      message: "VERIFICADO",
      redirectTo: "/login" 
    });

  } catch (error) {
    return NextResponse.json({ error: "ERROR EN EL SERVIDOR" }, { status: 500 });
  }
}