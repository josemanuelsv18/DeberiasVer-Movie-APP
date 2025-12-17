'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { visualizacionesApi } from '@/lib/api';
import { EstadisticasDetalladasResponse } from '@/lib/types';
import { LoadingPage } from '@/components/LoadingSpinner';

// Componente de gráfico de barras simple
function BarChart({ 
  data, 
  dataKey, 
  labelKey, 
  color = '#f59e0b',
  height = 200 
}: { 
  data: Record<string, unknown>[]; 
  dataKey: string; 
  labelKey: string; 
  color?: string;
  height?: number;
}) {
  const maxValue = Math.max(...data.map(d => Number(d[dataKey]) || 0), 1);
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-1 sm:gap-2">
        {data.map((item, index) => {
          const value = Number(item[dataKey]) || 0;
          const percentage = (value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs text-zinc-400">{value}</span>
              <div 
                className="w-full rounded-t-sm transition-all duration-500 ease-out"
                style={{ 
                  height: `${Math.max(percentage, 2)}%`,
                  backgroundColor: color,
                  minHeight: '4px'
                }}
              />
              <span className="text-xs text-zinc-500 truncate w-full text-center">
                {String(item[labelKey])}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Componente de gráfico de líneas simple
function LineChart({ 
  data,
  lines,
  labelKey,
  height = 200 
}: { 
  data: Record<string, unknown>[];
  lines: { key: string; color: string; label: string }[];
  labelKey: string;
  height?: number;
}) {
  const allValues = lines.flatMap(line => data.map(d => Number(d[line.key]) || 0));
  const maxValue = Math.max(...allValues, 1);
  
  return (
    <div className="w-full" style={{ height }}>
      <div className="relative h-full">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3, 4].map((_, i) => (
            <div key={i} className="border-b border-zinc-800 w-full" />
          ))}
        </div>
        
        {/* Lines */}
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {lines.map((line, lineIndex) => {
            const points = data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - ((Number(d[line.key]) || 0) / maxValue) * 100;
              return `${x},${y}`;
            }).join(' ');
            
            return (
              <polyline
                key={lineIndex}
                points={points}
                fill="none"
                stroke={line.color}
                strokeWidth="2"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
          
          {/* Data points */}
          {lines.map((line, lineIndex) => 
            data.map((d, i) => {
              const x = (i / (data.length - 1)) * 100;
              const y = 100 - ((Number(d[line.key]) || 0) / maxValue) * 100;
              return (
                <circle
                  key={`${lineIndex}-${i}`}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill={line.color}
                />
              );
            })
          )}
        </svg>
        
        {/* X-axis labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between">
          {data.map((d, i) => (
            <span key={i} className="text-xs text-zinc-500">
              {String(d[labelKey])}
            </span>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex gap-4 mt-8 justify-center">
        {lines.map((line, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }} />
            <span className="text-xs text-zinc-400">{line.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de gráfico de dona
function DonutChart({ 
  data,
  colors = ['#f59e0b', '#3b82f6'],
  size = 180
}: { 
  data: { label: string; value: number }[];
  colors?: string[];
  size?: number;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  let currentAngle = -90;
  
  const segments = data.map((d, i) => {
    const percentage = (d.value / total) * 100;
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    currentAngle += angle;
    
    // Calculate SVG arc
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = ((startAngle + angle) * Math.PI) / 180;
    const radius = 40;
    const innerRadius = 25;
    const cx = 50;
    const cy = 50;
    
    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);
    const x3 = cx + innerRadius * Math.cos(endRad);
    const y3 = cy + innerRadius * Math.sin(endRad);
    const x4 = cx + innerRadius * Math.cos(startRad);
    const y4 = cy + innerRadius * Math.sin(startRad);
    
    const largeArc = angle > 180 ? 1 : 0;
    
    const path = `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}
      Z
    `;
    
    return { ...d, path, color: colors[i % colors.length], percentage };
  });
  
  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {segments.map((seg, i) => (
          <path
            key={i}
            d={seg.path}
            fill={seg.color}
            className="transition-all duration-300 hover:opacity-80"
          />
        ))}
        {/* Center text */}
        <text x="50" y="50" textAnchor="middle" dominantBaseline="middle" className="fill-white text-xs font-bold">
          {total}
        </text>
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-sm text-zinc-400">
              {seg.label}: {seg.value} ({seg.percentage.toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente de tarjeta de estadística
function StatCard({ 
  icon, 
  label, 
  value, 
  subValue,
  color = 'amber'
}: { 
  icon: string; 
  label: string; 
  value: string | number; 
  subValue?: string;
  color?: 'amber' | 'blue' | 'green' | 'purple' | 'red';
}) {
  const colorClasses = {
    amber: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
    red: 'from-red-500/20 to-rose-500/20 border-red-500/30',
  };
  
  return (
    <div className={`bg-linear-to-br ${colorClasses[color]} rounded-xl p-6 border`}>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-zinc-400 text-sm">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {subValue && <p className="text-zinc-500 text-sm mt-1">{subValue}</p>}
    </div>
  );
}

export default function StatsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState<EstadisticasDetalladasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    const fetchStats = async () => {
      if (!isAuthenticated) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await visualizacionesApi.getEstadisticasDetalladas();
        if (response.success && response.data) {
          setStats(response.data);
        } else {
          setError(response.message || 'Error al cargar estadísticas');
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Error al conectar con el servidor');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) return <LoadingPage />;
  if (!isAuthenticated) return null;
  if (isLoading) return <LoadingPage />;

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 text-center">
            <p className="text-red-400 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Format time display
  const formatTime = () => {
    if (stats.diasTotalesEstimados > 0) {
      return `${stats.diasTotalesEstimados}d ${stats.horasTotalesEstimadas % 24}h`;
    }
    if (stats.horasTotalesEstimadas > 0) {
      return `${stats.horasTotalesEstimadas}h ${stats.minutosTotalesEstimados % 60}m`;
    }
    return `${stats.minutosTotalesEstimados}m`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 px-4 sm:px-6 lg:px-8 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">📊 Mis Estadísticas</h1>
            <p className="text-zinc-400">
              Resumen de tu actividad en DeberiasVer
            </p>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Volver al perfil</span>
          </Link>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard
            icon="🎬"
            label="Total visto"
            value={stats.totalContenidosVistos}
            color="amber"
          />
          <StatCard
            icon="🎥"
            label="Películas"
            value={stats.totalPeliculas}
            color="blue"
          />
          <StatCard
            icon="📺"
            label="Series"
            value={stats.totalSeries}
            color="purple"
          />
          <StatCard
            icon="📝"
            label="Episodios"
            value={stats.totalEpisodiosVistos}
            color="green"
          />
          <StatCard
            icon="⭐"
            label="Calificaciones"
            value={stats.totalCalificaciones}
            subValue={stats.promedioCalificacion ? `Promedio: ${stats.promedioCalificacion}` : undefined}
            color="amber"
          />
          <StatCard
            icon="💬"
            label="Reseñas"
            value={stats.totalResenas}
            color="red"
          />
        </div>

        {/* Time Watched Banner */}
        <div className="bg-linear-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-2xl p-8 mb-8 border border-amber-500/30 text-center">
          <p className="text-zinc-400 mb-2">⏱️ Tiempo estimado viendo contenido</p>
          <p className="text-5xl font-bold text-white mb-2">{formatTime()}</p>
          <p className="text-zinc-500 text-sm">
            ({stats.minutosTotalesEstimados.toLocaleString()} minutos totales)
          </p>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Distribution Chart */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-6">📊 Distribución de Contenido</h3>
            <DonutChart
              data={[
                { label: 'Películas', value: stats.totalPeliculas },
                { label: 'Series', value: stats.totalSeries },
              ]}
              colors={['#3b82f6', '#a855f7']}
              size={200}
            />
          </div>

          {/* Rating Distribution */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-6">⭐ Distribución de Calificaciones</h3>
            {stats.totalCalificaciones > 0 ? (
              <BarChart
                data={stats.distribucionCalificaciones}
                dataKey="cantidad"
                labelKey="puntuacion"
                color="#f59e0b"
                height={180}
              />
            ) : (
              <div className="h-[180px] flex items-center justify-center text-zinc-500">
                No hay calificaciones todavía
              </div>
            )}
          </div>
        </div>

        {/* Activity Chart */}
        <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 mb-8">
          <h3 className="text-lg font-semibold text-white mb-6">📈 Actividad Mensual (últimos 12 meses)</h3>
          {stats.actividadMensual.some(a => a.total > 0) ? (
            <div className="pb-8">
              <LineChart
                data={stats.actividadMensual}
                lines={[
                  { key: 'peliculas', color: '#3b82f6', label: 'Películas' },
                  { key: 'series', color: '#a855f7', label: 'Series' },
                ]}
                labelKey="mes"
                height={220}
              />
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-zinc-500">
              No hay actividad registrada en los últimos 12 meses
            </div>
          )}
        </div>

        {/* Recent Content & Top Rated */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Content */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">🕒 Contenido Reciente</h3>
            {stats.contenidosRecientes.length > 0 ? (
              <div className="space-y-3">
                {stats.contenidosRecientes.map((item, index) => (
                  <Link
                    key={index}
                    href={item.tipoContenido === 'Película' ? `/movie/${item.contenidoId}` : `/tv/${item.contenidoId}`}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">
                        {item.tipoContenido === 'Película' ? '🎥' : '📺'}
                      </span>
                      <div>
                        <p className="text-white font-medium text-sm line-clamp-1">
                          {item.titulo || 'Sin título'}
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {new Date(item.fechaVisualizacion).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    {item.puntuacion && (
                      <div className="flex items-center gap-1 text-amber-400">
                        <span>⭐</span>
                        <span className="text-sm font-medium">{item.puntuacion}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                No has visto contenido todavía
              </div>
            )}
          </div>

          {/* Top Rated */}
          <div className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <h3 className="text-lg font-semibold text-white mb-4">🏆 Mejor Calificados</h3>
            {stats.mejoresCalificados.length > 0 ? (
              <div className="space-y-3">
                {stats.mejoresCalificados.map((item, index) => (
                  <Link
                    key={index}
                    href={item.tipoContenido === 'Película' ? `/movie/${item.contenidoId}` : `/tv/${item.contenidoId}`}
                    className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-amber-500 text-black' :
                        index === 1 ? 'bg-zinc-400 text-black' :
                        index === 2 ? 'bg-amber-700 text-white' :
                        'bg-zinc-700 text-zinc-300'
                      }`}>
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium text-sm line-clamp-1">
                          {item.titulo || 'Sin título'}
                        </p>
                        <p className="text-zinc-500 text-xs">
                          {item.tipoContenido}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <span>⭐</span>
                      <span className="text-sm font-bold">{item.puntuacion}</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500">
                No has calificado contenido todavía
              </div>
            )}
          </div>
        </div>

        {/* User info footer */}
        <div className="mt-8 text-center text-zinc-600 text-sm">
          <p>
            Estadísticas de {user?.nombreUsuario} • 
            Miembro desde {user?.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' }) : 'hace un tiempo'}
          </p>
        </div>
      </div>
    </div>
  );
}
