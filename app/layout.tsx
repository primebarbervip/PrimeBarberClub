import type { Metadata } from "next";
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

import { obtenerConfiguracion } from "./actions";
import RoleSync from "./components/RoleSync";

export async function generateMetadata(): Promise<Metadata> {
  const config = await obtenerConfiguracion();

  return {
    title: config?.nombreTienda || "BarberShop Prime",
    description: "Citas exclusivas para un estilo superior.",
    icons: {
      icon: config?.logo || "/icon.png",
    }
  };
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
