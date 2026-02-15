import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Buscamos al usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: cleanEmail },
    });

    if (!usuario) {
      return NextResponse.json({ error: "LA CUENTA NO EXISTE" }, { status: 401 });
    }

    // 2. Revisamos si verificó su correo
    if (!usuario.esVerificado) {
      return NextResponse.json({
        error: "DEBES VERIFICAR TU CUENTA PRIMERO",
        unverified: true
      }, { status: 403 });
    }

    // 3. Comparamos contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password);

    if (!passwordMatch) {
      return NextResponse.json({ error: "CONTRASEÑA INCORRECTA" }, { status: 401 });
    }

    // 4. Determinamos la ruta según el rol
    let rutaDestino = "/";
    if (usuario.rol === "admin") rutaDestino = "/admin";
    else if (usuario.rol === "barbero") rutaDestino = "/barbero";

    const response = NextResponse.json({
      message: "ACCESO CONCEDIDO",
      redirectTo: rutaDestino,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        rol: usuario.rol,
        email: usuario.email,
        img: usuario.img
      }
    });

    // 5. Seteamos las cookies para sesión y Middleware
    response.cookies.set("user_role", usuario.rol, {
      path: "/",
      maxAge: 86400, // 24 horas
      sameSite: "lax",
    });

    response.cookies.set("user_id", usuario.id, {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
    });

    return response;

  } catch (error) {
    console.error("ERROR EN LOGIN:", error);
    return NextResponse.json({ error: "ERROR INTERNO EN EL LOGIN" }, { status: 500 });
  }
}