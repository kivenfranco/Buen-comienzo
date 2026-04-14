import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Buen Comienzo | Consulta tu citación de paquete alimentario",
  description:
    "Consulta tu citación para la entrega del paquete alimentario del programa Buen Comienzo – Alcaldía de Medellín.",
  keywords: [
    "Buen Comienzo",
    "Medellín",
    "paquete alimentario",
    "citación",
    "primera infancia",
  ],
  authors: [{ name: "Alcaldía de Medellín" }],
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1b5e20",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
