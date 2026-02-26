import { NextResponse } from "next/server";

const defaultConfig = {
  id: 1,
  nombreTienda: "BarberShop Prime",
  direccion: "",
  googleMapsUrl: "",
  telefono: "",
  logo: "",
  enMantenimiento: false,
};

export async function GET() {
  try {
    // If DATABASE_URL is not configured, return default config
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(defaultConfig);
    }

    // Import prisma only if DATABASE_URL is available
    const { prisma } = await import("@/app/lib/prisma");

    // Check if Prisma client is initialized and has configuracion model
    if (!(prisma as any).configuracion) {
      console.warn("⚠️ Prisma configuracion model not available");
      return NextResponse.json(defaultConfig);
    }

    // Get configuration from database
    const config = await (prisma as any).configuracion.findUnique({
      where: { id: 1 },
    });

    return NextResponse.json(config || defaultConfig);
  } catch (error: any) {
    // If there's a Prisma initialization error or database connection issue,
    // return the default config so the app continues to work
    console.warn("⚠️ Config API warning:", error.message || error);
    return NextResponse.json(defaultConfig, { status: 200 });
  }
}
