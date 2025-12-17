export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-4 border-zinc-700 border-t-amber-500 rounded-full animate-spin`}
      />
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-zinc-400">Cargando...</p>
      </div>
    </div>
  );
}

export function LoadingSection() {
  return (
    <div className="py-12 flex items-center justify-center">
      <LoadingSpinner size="md" />
    </div>
  );
}
