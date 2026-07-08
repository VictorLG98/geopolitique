import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
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
      className={`${cormorant.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Set the theme before first paint to avoid a flash of the wrong theme.
          // Default is always light; dark only if the user explicitly chose it.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('theme')==='dark';var r=document.documentElement;if(d){r.classList.add('dark');}r.style.colorScheme=d?'dark':'light';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-warm-white text-ink selection:bg-sage/15 selection:text-sage-dark">
        {children}
      </body>
    </html>
  );
}
