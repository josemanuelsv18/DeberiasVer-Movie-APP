import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DeberiasVer - Tu catálogo de películas y series",
  description: "Descubre, califica y comparte tus películas y series favoritas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950`}
      >
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <footer className="bg-zinc-900 border-t border-zinc-800 py-8 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-zinc-400">© 2024 DeberiasVer. Todos los derechos reservados.</p>
              <p className="text-zinc-500 text-sm mt-2">
                Datos proporcionados por{" "}
                <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400">
                  TMDB
                </a>
              </p>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
