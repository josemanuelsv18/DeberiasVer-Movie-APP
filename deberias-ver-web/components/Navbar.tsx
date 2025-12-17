'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🎬</span>
              <span className="text-xl font-bold text-white">DeberiasVer</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-zinc-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/movies" className="text-zinc-300 hover:text-white transition-colors">
              Películas
            </Link>
            <Link href="/tvshows" className="text-zinc-300 hover:text-white transition-colors">
              Series
            </Link>
            {isAuthenticated && (
              <Link href="/my-list" className="text-zinc-300 hover:text-white transition-colors">
                Mi Lista
              </Link>
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar películas, series..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-4 py-2 pl-10 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </form>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
                >
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-black">
                      {user?.nombreUsuario.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span>{user?.nombreUsuario}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
                >
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-zinc-300 hover:text-white transition-colors"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-zinc-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="mb-4">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400"
              />
            </form>
            <div className="flex flex-col gap-2">
              <Link href="/" className="px-4 py-2 text-zinc-300 hover:text-white">
                Inicio
              </Link>
              <Link href="/movies" className="px-4 py-2 text-zinc-300 hover:text-white">
                Películas
              </Link>
              <Link href="/tvshows" className="px-4 py-2 text-zinc-300 hover:text-white">
                Series
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href="/my-list" className="px-4 py-2 text-zinc-300 hover:text-white">
                    Mi Lista
                  </Link>
                  <Link href="/profile" className="px-4 py-2 text-zinc-300 hover:text-white">
                    Perfil
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-left text-zinc-300 hover:text-white"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="px-4 py-2 text-zinc-300 hover:text-white">
                    Iniciar sesión
                  </Link>
                  <Link href="/register" className="px-4 py-2 text-amber-500 hover:text-amber-400">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
