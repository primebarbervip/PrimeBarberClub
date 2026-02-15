// app/api/auth/registro/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma"; // Asegúrate de usar tu instancia de prisma
import bcrypt from "bcryptjs";
import { enviarCodigoVerificacion } from "../../../lib/email";

export async function POST(req: Request) {
  try {
    const { nombre, email, telefono, password, reenviar } = await req.json();
    const cleanEmail = email.toLowerCase().trim();
    const codigoGenerado = Math.floor(100000 + Math.random() * 900000).toString();

    // Si es un reenvío, solo actualizamos el código y la fecha
    if (reenviar) {
      await prisma.usuario.update({
        where: { email: cleanEmail },
        data: {
          codigoVerif: codigoGenerado,
          creadoEn: new Date() // Seteamos la hora actual para los 15 min de validez
        }
      });
    } else {
      // Si es registro nuevo
      const usuarioExistente = await prisma.usuario.findUnique({ where: { email: cleanEmail } });
      if (usuarioExistente && usuarioExistente.esVerificado) {
        return NextResponse.json({ error: "EL CORREO YA ESTÁ REGISTRADO" }, { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const esJefe = cleanEmail === 'cubasamuel852@gmail.com' || cleanEmail === 'vip.primebarber@gmail.com';

      await prisma.usuario.upsert({
        where: { email: cleanEmail },
        update: {
          nombre,
          password: hashedPassword,
          telefono, // ACTUALIZAR TELÉFONO
          codigoVerif: codigoGenerado,
          creadoEn: new Date()
        },
        create: {
          nombre,
          email: cleanEmail,
          password: hashedPassword,
          telefono, // GUARDAR TELÉFONO
          rol: esJefe ? 'admin' : 'cliente',
          esVerificado: false,
          codigoVerif: codigoGenerado,
        },
      });
    }

    // ENVÍO DE MAIL (Usuario Centralizado)
    try {
      await enviarCodigoVerificacion(cleanEmail, nombre, codigoGenerado);
    } catch (mailError) {
      console.error("MAIL ERROR:", mailError);
      // No bloqueamos el registro si falla el mail, pero logueamos
      // O podríamos devolver error si es crítico.
      // @ts-ignore
      throw new Error("Fallo al enviar el correo: " + mailError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "ERROR AL PROCESAR" }, { status: 500 });
  }
}