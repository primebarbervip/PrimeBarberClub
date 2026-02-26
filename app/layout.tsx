import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

import { obtenerConfiguracion } from "./actions";
import RoleSync from "./components/RoleSync";

export async function generateMetadata(): Promise<Metadata> {
  try {
    // Solo intentar obtener config si DATABASE_URL está definido
    if (!process.env.DATABASE_URL) {
      return {
        title: "BarberShop Prime",
        description: "Citas exclusivas para un estilo superior.",
        icons: {
          icon: "/icon.png",
        }
      };
    }
    
    const config = await obtenerConfiguracion();
    
    // Usar webNombre y webLogo para la identidad web (pestaña navegador)
    const webTitle = config?.webNombre || config?.nombreTienda || "BarberShop Prime";
    const webLogo = config?.webLogo || config?.logo || "/icon.png";
    
    return {
      title: webTitle,
      description: "Citas exclusivas para un estilo superior.",
      icons: {
        icon: webLogo,
        shortcut: webLogo,
        apple: webLogo,
      },
      openGraph: {
        title: webTitle,
        description: "Citas exclusivas para un estilo superior.",
        images: webLogo && webLogo !== "/icon.png" ? [{ url: webLogo }] : [],
      }
    };
  } catch {
    // Fallback metadata if configuration fails to load
    return {
      title: "BarberShop Prime",
      description: "Citas exclusivas para un estilo superior.",
      icons: {
        icon: "/icon.png",
      }
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <RoleSync />
        {children}
      </body>
    </html>
  );
}
