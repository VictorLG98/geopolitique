import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Geopolitiqué | Perspectivas y Análisis Geopolítico Global",
  description: "Un blog minimalista dedicado al análisis profundo de la seguridad global, recursos estratégicos, tecnología geopolítica y las nuevas fronteras comerciales del siglo XXI.",
  authors: [{ name: "Geopolitiqué Team" }],
  keywords: ["geopolitica", "seguridad", "semiconductores", "litio", "artico", "analisis", "relaciones internacionales"],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans selection:bg-[#c2a175]/30 selection:text-[#5c4028]">
        {children}
      </body>
    </html>
  );
}
