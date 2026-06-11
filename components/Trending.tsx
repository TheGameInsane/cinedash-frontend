'use client';

import { Film, Star, Flame } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Trending() {
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/trending');
        const data = await res.json();
        setTrending(data.results?.slice(0, 12) || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="h-8 w-48 rounded-lg animate-shimmer mb-6" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl animate-shimmer" />
          ))}
        </div>
      </section>
    );
  }

  if (!trending.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <span className="w-1.5 h-6 bg-amber-500 rounded-full" />
          <Flame className="h-5 w-5 text-amber-500" />
          Trending Today
        </h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 stagger-children">
        {trending.map((movie) => (
          <Link
            key={movie.id}
            href={movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`}
            className="poster-card group"
          >
            <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-800 relative">
              {movie.poster_path ? (
                <Image
                  src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                  alt={movie.title || movie.name || 'Movie'}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 16vw"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Film className="h-10 w-10 text-slate-600" />
                </div>
              )}
              <div className="poster-info">
                <p className="text-xs font-semibold text-white line-clamp-1">
                  {movie.title || movie.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {movie.vote_average > 0 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-300">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {movie.vote_average.toFixed(1)}
                    </span>
                  )}
                  {(movie.release_date || movie.first_air_date) && (
                    <span className="text-xs text-slate-400">
                      {(movie.release_date || movie.first_air_date)?.split('-')[0]}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}