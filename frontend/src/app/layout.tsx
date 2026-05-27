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

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://geopolitique.vercel.app';
const SITE_DESCRIPTION = "Un blog minimalista dedicado al análisis profundo de la seguridad global, recursos estratégicos, tecnología geopolítica y las nuevas fronteras comerciales del siglo XXI.";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Geopolitiqué | Perspectivas y Análisis Geopolítico Global",
    template: "%s | Geopolitiqué",
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: "Geopolitiqué Team" }],
  keywords: ["geopolitica", "seguridad", "semiconductores", "litio", "artico", "analisis", "relaciones internacionales"],
  icons: [
    { rel: 'icon', url: '/favicon.ico', type: 'image/x-icon' },
    { rel: 'shortcut icon', url: '/favicon.ico', type: 'image/x-icon' },
  ],
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: BASE_URL,
    siteName: 'Geopolitiqué',
    title: 'Geopolitiqué | Perspectivas y Análisis Geopolítico Global',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Geopolitiqué | Perspectivas y Análisis Geopolítico Global',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: BASE_URL,
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
